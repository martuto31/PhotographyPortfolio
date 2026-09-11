#!/usr/bin/env node
// The verification gate: builds the site and checks the prerendered HTML.
//
// Usage:
//   npm run verify                  build, then check dist/photography-portfolio/browser
//   npm run verify -- --no-build    check the existing dist without rebuilding
//   npm run verify -- --dist <dir>  check a different output directory (used to prove
//                                   the gate fails on a deliberately broken route)
//
// Why this exists:
//   There are no unit tests in this repo, on purpose. The bugs that actually happen
//   here — a link that renders without an href, a photograph missing from the static
//   HTML, a route that prerenders as the 404 page — live in the build output, which
//   unit tests never see. So the gate checks the artefact itself: every route in
//   prerender-routes.txt, as a crawler would receive it.
//
// A check that cannot be decided because the R2 manifest has no data yet (no
// photographs for a gallery, no image dimensions) reports SKIP with the reason
// rather than passing silently. SKIP never fails the gate; FAIL always does.

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');

const DEFAULT_DIST = join(REPO_ROOT, 'dist', 'photography-portfolio', 'browser');
const ROUTES_FILE = join(REPO_ROOT, 'prerender-routes.txt');
const FIREBASE_JSON = join(REPO_ROOT, 'firebase.json');
const APP_ROUTES = join(REPO_ROOT, 'src', 'app', 'app.routes.ts');
const SOURCE_DIR = join(REPO_ROOT, 'src', 'app');

const IMAGE_HOST = 'https://images.phbyviki.com/';
// Keep in sync with HERO_IMAGE in intro-section.component.ts.
const HERO_IMAGE = '/assets/img/hero/';
// A route that fell through to the not-found component still prerenders "successfully";
// its title is how we tell.
const NOT_FOUND_TITLE = 'Страницата не е намерена';

const MIN_GALLERY_WORDS = 100;
const MIN_SIBLING_LINKS = 2;

// ---------------------------------------------------------------------------
// Arguments

const argv = process.argv.slice(2);
const noBuild = argv.includes('--no-build');
const distArg = argv.indexOf('--dist');
const DIST = distArg === -1 ? DEFAULT_DIST : resolve(process.cwd(), argv[distArg + 1] ?? '');

if (distArg !== -1 && !argv[distArg + 1]) {
  console.error('--dist needs a directory');
  process.exit(2);
}

// ---------------------------------------------------------------------------
// Build

if (!noBuild) {
  console.log('▶ npm run build');
  const build = spawnSync('npm', ['run', 'build'], { cwd: REPO_ROOT, stdio: 'inherit' });
  if (build.status !== 0) {
    console.error('\nFAIL  build exited with', build.status);
    process.exit(1);
  }
  console.log('');
}

if (!existsSync(DIST)) {
  console.error(`FAIL  output directory not found: ${DIST}`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Results

const results = []; // { route, check, status: 'PASS'|'FAIL'|'SKIP', message }
const record = (route, check, status, message = '') => results.push({ route, check, status, message });
const pass = (route, check) => record(route, check, 'PASS');
const fail = (route, check, message) => record(route, check, 'FAIL', message);
const skip = (route, check, message) => record(route, check, 'SKIP', message);

// ---------------------------------------------------------------------------
// HTML helpers — regex-based on purpose. The prerendered output is Angular's own
// serialisation, which is regular enough that a parser dependency buys nothing.

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
const decodeEntities = (s) =>
  s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') {
      const code = e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isNaN(code) ? m : String.fromCodePoint(code);
    }
    return ENTITIES[e.toLowerCase()] ?? m;
  });

// All start tags of one element name, each as { attrs }.
function tags(html, name) {
  const re = new RegExp(`<${name}\\b([^>]*)>`, 'gi');
  const out = [];
  let m;
  while ((m = re.exec(html))) out.push({ index: m.index, attrs: parseAttrs(m[1]) });
  return out;
}

function parseAttrs(s) {
  const attrs = {};
  const re = /([^\s=\/"']+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
  let m;
  while ((m = re.exec(s))) attrs[m[1].toLowerCase()] = decodeEntities(m[2] ?? m[3] ?? m[4] ?? '');
  return attrs;
}

const title = (html) => decodeEntities((html.match(/<title>([^<]*)<\/title>/i)?.[1] ?? '')).trim();

function bodyText(html) {
  const body = html.match(/<body[\s\S]*<\/body>/i)?.[0] ?? html;
  return decodeEntities(
    body
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<(script|style|noscript|template)\b[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<[^>]+>/g, ' '),
  );
}

const wordCount = (text) => text.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;

function jsonLdTypes(html) {
  const types = new Set();
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) {
    let data;
    try {
      data = JSON.parse(decodeEntities(m[1]));
    } catch {
      types.add('<unparseable>');
      continue;
    }
    const walk = (node) => {
      if (Array.isArray(node)) return node.forEach(walk);
      if (node && typeof node === 'object') {
        if (typeof node['@type'] === 'string') types.add(node['@type']);
        if (Array.isArray(node['@type'])) node['@type'].forEach((t) => types.add(t));
        Object.values(node).forEach(walk);
      }
    };
    walk(data);
  }
  return types;
}

// A route's canonical path form, for comparing hrefs against the route list.
const normalisePath = (p) => {
  try {
    return decodeURIComponent(p).replace(/\/+$/, '') || '/';
  } catch {
    return p;
  }
};

// ---------------------------------------------------------------------------
// Routes

const routes = readFileSync(ROUTES_FILE, 'utf8')
  .split('\n')
  .map((l) => l.trim())
  .filter(Boolean);

const routeFile = (route) => join(DIST, ...route.split('/').filter(Boolean), 'index.html');
const isGallery = (route) => route.startsWith('/galeriya/');
const isHome = (route) => route === '/';

// ---------------------------------------------------------------------------
// Per-route checks

const titles = new Map(); // title -> [routes]

for (const route of routes) {
  const file = routeFile(route);

  if (!existsSync(file)) {
    fail(route, 'prerendered', `missing ${relative(DIST, file)} in ${relative(REPO_ROOT, DIST) || DIST}`);
    continue;
  }
  const html = readFileSync(file, 'utf8');

  // -- prerendered: a real server render of the right component, not a shell or the 404
  const t = title(html);
  if (!/ng-server-context="ssg"/.test(html)) {
    fail(route, 'prerendered', 'no ng-server-context="ssg" marker — this is the client shell, not a prerender');
  } else if (t.includes(NOT_FOUND_TITLE)) {
    fail(route, 'prerendered', 'route prerendered as the not-found page');
  } else {
    pass(route, 'prerendered');
  }

  // -- title
  if (!t) fail(route, 'title', 'empty or missing <title>');
  else {
    pass(route, 'title');
    titles.set(t, [...(titles.get(t) ?? []), route]);
  }

  // -- hero preload: only the homepage may preload the hero background
  const preloads = tags(html, 'link').filter((l) => (l.attrs.rel ?? '').toLowerCase() === 'preload');
  const heroPreloads = preloads.filter((l) => (l.attrs.href ?? '').includes(HERO_IMAGE));
  if (isHome(route)) {
    if (heroPreloads.length === 1) pass(route, 'hero-preload');
    else fail(route, 'hero-preload', `homepage should preload the hero once, found ${heroPreloads.length}`);
  } else if (heroPreloads.length === 0) pass(route, 'hero-preload');
  else fail(route, 'hero-preload', `preloads the homepage hero (${heroPreloads[0].attrs.href}) — competes with its own LCP`);

  // -- routerLink on a non-anchor renders no href. Angular keeps a static routerLink
  //    attribute in the output, so a survivor is visible here; the source scan below
  //    catches the bound form.
  const nonAnchorRouterLinks = [...html.matchAll(/<([a-z][a-z0-9-]*)\b[^>]*\brouterlink\b/gi)]
    .map((m) => m[1].toLowerCase())
    .filter((tag) => tag !== 'a' && tag !== 'area');
  if (nonAnchorRouterLinks.length === 0) pass(route, 'anchors');
  else fail(route, 'anchors', `routerLink on <${[...new Set(nonAnchorRouterLinks)].join('>, <')}> — no href for crawlers`);

  if (!isGallery(route)) continue;

  // -- gallery pages from here on

  const imgs = tags(html, 'img');
  const photos = imgs.filter((i) => (i.attrs.src ?? '').startsWith(IMAGE_HOST) && !/\/cover\.webp$/i.test(i.attrs.src));

  if (imgs.length > 0) pass(route, 'images');
  else fail(route, 'images', 'zero <img> tags');

  const words = wordCount(bodyText(html));
  if (words >= MIN_GALLERY_WORDS) pass(route, 'words');
  else fail(route, 'words', `${words} words of body text, need ${MIN_GALLERY_WORDS}`);

  const own = normalisePath(route);
  const siblings = new Set(
    tags(html, 'a')
      .map((a) => a.attrs.href ?? '')
      .filter((h) => h.startsWith('/galeriya/'))
      .map(normalisePath)
      .filter((p) => p !== own),
  );
  if (siblings.size >= MIN_SIBLING_LINKS) pass(route, 'sibling-links');
  else fail(route, 'sibling-links', `${siblings.size} links to other galleries, need ${MIN_SIBLING_LINKS}`);

  const types = jsonLdTypes(html);
  const missing = ['BreadcrumbList', 'ImageGallery'].filter((x) => !types.has(x));
  if (missing.length === 0) pass(route, 'jsonld');
  else fail(route, 'jsonld', `JSON-LD missing ${missing.join(', ')} (found: ${[...types].join(', ') || 'none'})`);

  // -- LCP photo: the first photograph is eager, high priority and preloaded
  if (photos.length === 0) {
    skip(route, 'lcp-photo', 'snapshot has no photographs for this gallery — npm run publish (or npm run sitemap) refreshes it');
    skip(route, 'img-dimensions', 'snapshot has no photographs for this gallery');
  } else {
    const first = photos[0].attrs;
    const problems = [];
    if ((first.loading ?? '').toLowerCase() !== 'eager') problems.push(`loading="${first.loading ?? ''}"`);
    if ((first.fetchpriority ?? '').toLowerCase() !== 'high') problems.push(`fetchpriority="${first.fetchpriority ?? ''}"`);
    const preloaded = preloads.some(
      (l) => (l.attrs.as ?? '').toLowerCase() === 'image' && normalisePath(l.attrs.href ?? '') === normalisePath(first.src),
    );
    if (!preloaded) problems.push('no <link rel="preload" as="image"> for it');
    if (problems.length === 0) pass(route, 'lcp-photo');
    else fail(route, 'lcp-photo', `first photograph: ${problems.join(', ')}`);

    // -- dimensions: only checkable once the manifest carries measured sizes
    const withDims = photos.filter((p) => Number(p.attrs.width) > 0 && Number(p.attrs.height) > 0);
    if (withDims.length === 0) {
      skip(route, 'img-dimensions', 'manifest has no image dimensions yet — blocked on npm run publish -- --thumbs');
    } else if (withDims.length === photos.length) pass(route, 'img-dimensions');
    else fail(route, 'img-dimensions', `${photos.length - withDims.length} of ${photos.length} photographs have no width/height`);
  }
}

// ---------------------------------------------------------------------------
// Site-wide checks

// -- every title unique
const duplicates = [...titles].filter(([, rs]) => rs.length > 1);
if (duplicates.length === 0) pass('*', 'titles-unique');
else for (const [t, rs] of duplicates) fail('*', 'titles-unique', `"${t}" on ${rs.join(', ')}`);

// -- routerLink on a non-anchor, at the source, so the bound form is caught too
const sourceFiles = [];
(function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(html|ts)$/.test(entry) && !entry.endsWith('.spec.ts')) sourceFiles.push(p);
  }
})(SOURCE_DIR);

const sourceOffenders = [];
for (const file of sourceFiles) {
  const src = readFileSync(file, 'utf8');
  for (const m of src.matchAll(/<([a-z][a-z0-9-]*)\b[^>]*\[?routerLink\]?\s*=/g)) {
    if (m[1] !== 'a' && m[1] !== 'area') {
      const line = src.slice(0, m.index).split('\n').length;
      sourceOffenders.push(`${relative(REPO_ROOT, file)}:${line} <${m[1]}>`);
    }
  }
}
if (sourceOffenders.length === 0) pass('*', 'source-routerlink');
else fail('*', 'source-routerlink', `routerLink on a non-anchor: ${sourceOffenders.join('; ')}`);

// -- every top-level route has a Firebase rewrite, or it 404s in production
const firebase = JSON.parse(readFileSync(FIREBASE_JSON, 'utf8'));
const app = (firebase.hosting ?? []).find((h) => h.target === 'app') ?? firebase.hosting?.[0] ?? firebase;
const rewrites = (app.rewrites ?? []).map((r) => r.source);
const rewriteMatches = (source, path) => {
  const pattern = '^' + source.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*\*/g, '.*').replace(/(?<!\.)\*/g, '[^/]*') + '$';
  return new RegExp(pattern).test(path);
};

// Every prerendered route must match a rewrite as written; every path in
// app.routes.ts must too, with its parameters stood in for (":galleryType" -> "x").
const paths = new Set(routes);
for (const m of readFileSync(APP_ROUTES, 'utf8').matchAll(/path:\s*'([^']*)'/g)) {
  const segments = m[1].split('/').filter(Boolean);
  if (segments.length === 0 || segments[0] === '**' || segments[0].startsWith(':')) continue;
  paths.add('/' + segments.map((seg) => (seg.startsWith(':') ? 'x' : seg)).join('/'));
}
const uncovered = [...paths].filter((p) => !rewrites.some((s) => rewriteMatches(s, p)));
if (uncovered.length === 0) pass('*', 'firebase-rewrites');
else fail('*', 'firebase-rewrites', `no rewrite in firebase.json for ${uncovered.join(', ')}`);

// ---------------------------------------------------------------------------
// Report

const failures = results.filter((r) => r.status === 'FAIL');
const skips = results.filter((r) => r.status === 'SKIP');

if (failures.length > 0) {
  console.error(`\n${failures.length} failure${failures.length === 1 ? '' : 's'}:\n`);
  for (const f of failures) console.error(`FAIL  ${f.route}\n      ${f.check}: ${f.message}`);
  console.error(`\nverify: FAIL — ${failures.length} failing check${failures.length === 1 ? '' : 's'} across ${routes.length} routes`);
  process.exit(1);
}

const checks = [...new Set(results.map((r) => r.check))];
const rows = checks.map((check) => {
  const of = results.filter((r) => r.check === check);
  return {
    check,
    pass: of.filter((r) => r.status === 'PASS').length,
    skip: of.filter((r) => r.status === 'SKIP').length,
  };
});
const w = Math.max(...rows.map((r) => r.check.length));
console.log(`verify: PASS — ${routes.length} routes, ${routes.filter(isGallery).length} gallery pages\n`);
console.log(`${'check'.padEnd(w)}  pass  skip`);
console.log(`${'-'.repeat(w)}  ----  ----`);
for (const r of rows) console.log(`${r.check.padEnd(w)}  ${String(r.pass).padStart(4)}  ${String(r.skip).padStart(4)}`);

if (skips.length > 0) {
  const reasons = new Map();
  for (const s of skips) reasons.set(`${s.check}: ${s.message}`, (reasons.get(`${s.check}: ${s.message}`) ?? 0) + 1);
  console.log('\nskipped:');
  for (const [reason, n] of reasons) console.log(`  ${n}×  ${reason}`);
}
