#!/usr/bin/env node
// Present-and-absent text assertions against one prerendered route.
//
// Usage:
//   node tools/check-text.mjs <route> [--has "..."]... [--not "..."]... [--raw]
//
//   node tools/check-text.mjs /galerii/svatbi \
//     --has "Сватбеният ден минава по-бързо" \
//     --not "Сватбата минава по-бързо"
//
// Compares against the page's visible text — tags stripped, entities decoded,
// whitespace collapsed — so a fragment matches whether Angular re-encoded its
// quotes, wrapped it in <em>, or split it across lines. `--raw` keeps the markup
// (attributes included) for assertions about <meta> content or <title>.
//
// Exits 1 listing every assertion that failed. This is the proof for copy tasks:
// `npm run verify` checks structure and cannot tell whether the right Bulgarian
// sentence landed on the right page.

import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist', 'photography-portfolio', 'browser');

const argv = process.argv.slice(2);
const route = argv[0];
if (!route || !route.startsWith('/')) {
  console.error('usage: check-text.mjs <route> [--has "..."]... [--not "..."]... [--raw]');
  process.exit(2);
}

const has = [];
const not = [];
let raw = false;
for (let i = 1; i < argv.length; i++) {
  if (argv[i] === '--has') has.push(argv[++i]);
  else if (argv[i] === '--not') not.push(argv[++i]);
  else if (argv[i] === '--raw') raw = true;
  else {
    console.error(`unknown argument: ${argv[i]}`);
    process.exit(2);
  }
}

const file = join(DIST, ...route.split('/').filter(Boolean), 'index.html');
if (!existsSync(file)) {
  console.error(`FAIL  ${route}: not prerendered (${file})`);
  process.exit(1);
}

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
const decode = (s) =>
  s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') {
      const code = e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isNaN(code) ? m : String.fromCodePoint(code);
    }
    return ENTITIES[e.toLowerCase()] ?? m;
  });
const collapse = (s) => s.replace(/\s+/g, ' ').trim();

let html = readFileSync(file, 'utf8');
if (!raw) {
  html = html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(script|style|noscript|template)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ');
}
const text = collapse(decode(html));

const failures = [];
for (const s of has) if (!text.includes(collapse(s))) failures.push(`missing:  "${s}"`);
for (const s of not) if (text.includes(collapse(s))) failures.push(`present:  "${s}"`);

if (failures.length > 0) {
  console.error(`FAIL  ${route}`);
  for (const f of failures) console.error(`      ${f}`);
  process.exit(1);
}
console.log(`PASS  ${route}  (${has.length} present, ${not.length} absent)`);
