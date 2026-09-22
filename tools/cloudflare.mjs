#!/usr/bin/env node
// The Cloudflare configuration for phbyviki.com, as code.
//
//   node tools/cloudflare.mjs status          what is configured right now
//   node tools/cloudflare.mjs apply           cache rules, rate limit, WAF, AI bots, alert
//   node tools/cloudflare.mjs proxy on|off    the site itself through the proxy (or back out)
//   node tools/cloudflare.mjs kill on|off     block every request (adds/removes the rule)
//   node tools/cloudflare.mjs purge           empty the edge cache (run after a deploy)
//
// The goal is predictable cost: R2 is only read on a cache miss, so anything that
// forces misses (cache-busting query strings, a scraper, a bot storm) is what has to
// be stopped - at the edge, before the request reaches R2 or Firebase. Nothing here
// costs anything on the free plan.
//
// Needs CF_API_TOKEN in tools/.env (zone DNS/settings/cache rules/WAF edit).
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ZONE_NAME = 'phbyviki.com';
const SITE_HOST = 'phbyviki.com';
const IMAGE_HOST = 'images.phbyviki.com';

// Crawlers that take the photographs to train a model. Answer engines (ChatGPT-User,
// Perplexity-User, Google's own crawl) are deliberately NOT here: they are how the
// site gets recommended, which is task T-54.
const TRAINING_BOTS = [
  'GPTBot', 'CCBot', 'ClaudeBot', 'anthropic-ai', 'Claude-Web', 'Bytespider',
  'meta-externalagent', 'FacebookBot', 'Amazonbot', 'Diffbot', 'omgili', 'cohere-ai',
  'ImagesiftBot', 'Timpibot', 'Webzio-Extended', 'Scrapy', 'img2dataset',
];

const token = (readFileSync(join(HERE, '.env'), 'utf8').match(/^CF_API_TOKEN=(.+)$/m) ?? [])[1]?.trim();
if (!token) throw new Error('CF_API_TOKEN missing from tools/.env');

const api = async (path, init = {}) => {
  const res = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    ...init,
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json', ...(init.headers ?? {}) },
    body: init.body ? JSON.stringify(init.body) : undefined,
  });
  const json = await res.json();
  if (!json.success) throw new Error(`${init.method ?? 'GET'} ${path}: ${JSON.stringify(json.errors)}`);
  return json.result;
};

const zone = (await api(`/zones?name=${ZONE_NAME}`))[0];
const Z = `/zones/${zone.id}`;

// A phase entry point holds that phase's rules; PUT replaces the lot, which keeps this
// script the single description of what is configured.
const putPhase = (phase, rules) => api(`${Z}/rulesets/phases/${phase}/entrypoint`, { method: 'PUT', body: { rules } });
const getPhase = async (phase) => {
  try { return await api(`${Z}/rulesets/phases/${phase}/entrypoint`); } catch { return { rules: [] }; }
};

const uaMatch = (bots) => bots.map((b) => `lower(http.user_agent) contains "${b.toLowerCase()}"`).join(' or ');

const KILL_DESCRIPTION = 'KILL SWITCH - every request blocked';

// The kill switch is NOT kept in the rule list as a dormant rule: one accidental click
// on its toggle in the dashboard takes the whole site down, which is exactly what
// happened on 2026-09-22. `kill on` adds the rule, `kill off` removes it again.
function firewallRules(killEnabled) {
  const rules = [
    {
      description: 'AI training crawlers blocked (answer engines deliberately allowed - T-54)',
      expression: `(${uaMatch(TRAINING_BOTS)})`,
      action: 'block',
      enabled: true,
    },
  ];
  if (killEnabled) {
    rules.unshift({
      description: KILL_DESCRIPTION,
      expression: `(http.host eq "${SITE_HOST}" or http.host eq "${IMAGE_HOST}" or http.host eq "www.${SITE_HOST}")`,
      action: 'block',
      enabled: true,
    });
  }
  return rules;
}

async function applyCacheRules() {
  return putPhase('http_request_cache_settings', [
    {
      // The cache-busting hole: images.phbyviki.com/photo.webp?anything=1 is a fresh
      // URL to the edge, so every request would miss and be paid for at R2. Dropping
      // the query string from the cache key makes a million of them one cached object.
      description: 'Photographs: cache at the edge, query string ignored',
      expression: `(http.host eq "${IMAGE_HOST}")`,
      action: 'set_cache_settings',
      action_parameters: {
        cache: true,
        edge_ttl: { mode: 'respect_origin' },
        browser_ttl: { mode: 'respect_origin' },
        cache_key: { ignore_query_strings_order: true, custom_key: { query_string: { exclude: '*' } } },
      },
    },
    {
      // Firebase is on the Spark plan: 360 MB a day and then the site pauses, and it
      // cannot be paid past. Everything the edge serves is a byte Firebase does not.
      // The HTML is short-lived so a deploy shows up quickly; the hashed assets never
      // change under the same name.
      description: 'Site: hashed assets a year, pages five minutes',
      expression: `(http.host eq "${SITE_HOST}" or http.host eq "www.${SITE_HOST}")`,
      action: 'set_cache_settings',
      action_parameters: {
        cache: true,
        edge_ttl: {
          mode: 'override_origin',
          default: 300,
          status_code_ttl: [{ status_code_range: { from: 400, to: 499 }, value: 10 }],
        },
        browser_ttl: { mode: 'respect_origin' },
        cache_key: { ignore_query_strings_order: true },
      },
    },
  ]);
}

// One rule is what the free plan allows. Generous enough that scrolling a 150-photo
// gallery never trips it, tight enough that nobody farms R2 operations through it.
async function applyRateLimit() {
  const rule = (period, requests) => ({
    description: `Photographs: at most ${requests} requests per ${period}s from one address`,
    expression: `(http.host eq "${IMAGE_HOST}")`,
    action: 'block',
    ratelimit: { characteristics: ['ip.src', 'cf.colo.id'], period, requests_per_period: requests, mitigation_timeout: period },
  });
  try {
    return await putPhase('http_ratelimit', [rule(60, 900)]);
  } catch (error) {
    if (!/period/i.test(String(error))) throw error;
    return putPhase('http_ratelimit', [rule(10, 200)]); // free plan: 10s periods only
  }
}

const command = process.argv[2] ?? 'status';

if (command === 'status') {
  const dns = await api(`${Z}/dns_records?per_page=100`);
  const settings = {};
  for (const key of ['ssl', 'always_use_https', 'security_level']) {
    settings[key] = (await api(`${Z}/settings/${key}`)).value;
  }
  const bots = await api(`${Z}/bot_management`).catch(() => ({}));
  console.log(`zone ${ZONE_NAME} (${zone.plan.name})`);
  for (const r of dns.filter((r) => r.type === 'A' || r.type === 'CNAME')) {
    console.log(`  ${r.proxied ? 'proxied ' : 'dns-only'}  ${r.name} -> ${r.content}`);
  }
  console.log(`  ssl=${settings.ssl} always_https=${settings.always_use_https} security=${settings.security_level}`);
  console.log(`  ai_training=${bots.ai_training} ai_search=${bots.ai_search} bot_fight_mode=${bots.fight_mode}`);
  for (const phase of ['http_request_cache_settings', 'http_ratelimit', 'http_request_firewall_custom']) {
    const rules = (await getPhase(phase)).rules ?? [];
    console.log(`  ${phase}: ${rules.length ? rules.map((r) => `${r.enabled ? '' : '[off] '}${r.description}`).join(' | ') : 'none'}`);
  }
} else if (command === 'apply') {
  console.log('cache rules      ', (await applyCacheRules()).rules.length, 'rules');
  console.log('rate limit       ', (await applyRateLimit()).rules.length, 'rule');
  console.log('firewall         ', (await putPhase('http_request_firewall_custom', firewallRules(false))).rules.length, 'rule (no kill switch rule; `kill on` adds it)');
  // Training crawlers blocked as a category; answer-engine traffic left alone, which
  // is the whole point of being found by them.
  const bots = await api(`${Z}/bot_management`, { method: 'PUT', body: { ai_bots_protection: 'disabled', crawler_protection: 'disabled', fight_mode: false } })
    .catch((error) => ({ error: String(error) }));
  console.log('ai bots          ', bots.error ?? `ai_bots_protection=${bots.ai_bots_protection}`);
  console.log('https            ', (await api(`${Z}/settings/always_use_https`, { method: 'PATCH', body: { value: 'on' } })).value);
} else if (command === 'proxy') {
  const on = process.argv[3] !== 'off';
  const record = (await api(`${Z}/dns_records?type=A&name=${SITE_HOST}`))[0];
  if (on) await api(`${Z}/settings/ssl`, { method: 'PATCH', body: { value: 'strict' } });
  const updated = await api(`${Z}/dns_records/${record.id}`, { method: 'PATCH', body: { proxied: on } });
  console.log(`${SITE_HOST} -> ${updated.content} proxied=${updated.proxied}`);
} else if (command === 'kill') {
  const on = process.argv[3] === 'on';
  await putPhase('http_request_firewall_custom', firewallRules(on));
  console.log(on ? 'KILL SWITCH ON - every request is blocked; `kill off` removes the rule' : 'kill switch removed - traffic flowing');
} else if (command === 'purge') {
  await api(`${Z}/purge_cache`, { method: 'POST', body: { purge_everything: true } });
  console.log('edge cache emptied');
} else {
  console.error(`unknown command: ${command}`);
  process.exit(1);
}
