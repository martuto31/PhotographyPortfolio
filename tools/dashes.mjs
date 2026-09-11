#!/usr/bin/env node
// Long dashes out of the visible text — Viki's request, 2026-09-11.
//
// Usage:
//   node tools/dashes.mjs sweep      replace "—" with "-" in every string a visitor
//                                    or a search result can see; comments untouched
//   node tools/dashes.mjs residual   list every "—" still in the prerendered HTML
//                                    and which source file it comes from
//
// `sweep` walks src/**/*.{ts,html,json}, skips // and /* */ and <!-- --> comments,
// and inside .ts files only touches string literals. It prints what it changed and
// is idempotent — a second run reports 0.
//
// `residual` exists because commit-plan.sh holds back five files (the SEO pass)
// that also carry dashes; sweeping them would fold that work into a copy commit.
// Every dash `residual` finds must map to one of those files — 0 unattributed —
// until T-17b sweeps them after commit-plan.sh has run.

import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, dirname, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(REPO_ROOT, 'src');
const DIST = join(REPO_ROOT, 'dist', 'photography-portfolio', 'browser');

// Held back by commit-plan.sh — see the Traps section of WORKER.md.
const HELD_BACK = new Set([
  'src/app/components/gallery/gallery.component.ts',
  'src/app/components/gallery/gallery.component.html',
  'src/app/components/galleries-cards/galleries-cards.component.ts',
  'src/index.html',
  'src/app/generated/galleries.ts',
]);

// Where each dash still in the built HTML comes from. All of these are held back.
const RESIDUAL_SOURCES = [
  [/— София и Видин/, 'galleries-cards.component.ts h1 / gallery.component.html sub'],
  [/phbyviki — Виктория Борисова/, 'src/index.html og:site_name + JSON-LD name'],
  [/сова — фотограф/, 'src/index.html og:image:alt / gallery.component.ts JSON-LD description'],
  [/ — Виктория Борисова, фотограф/, 'gallery.component.ts photo alt'],
  [/датата и мястото — отговарям/, 'gallery.component.html cta'],
  [/Снимка от фотосесия — /, 'gallery.component.html modal alt'],
  [/(Сватбена фотография|Абитуриентска фотосесия|Лична фотосесия|Фотосесия от кръщене|Корпоративно събитие|Рожден ден|Семейна фотосесия) — |— (Сватбена фотография|Абитуриентска фотосесия|Лична фотосесия|Фотосесия от кръщене|Корпоративно събитие|Рожден ден|Семейна фотосесия|Сватбена фотосесия|Фотосесия)/, 'galleries-cards.component.ts page headings (titles, card and sibling alt, JSON-LD name)'],
  [/<!-- Icons — generated/, 'src/index.html HTML comment (not visible)'],
  [/hashed Angular stylesheet — keep/, '404.html CSS comment (not visible)'],
];

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

// Replace dashes outside comments; in .ts only inside string literals.
function sweepText(text, kind, file) {
  let out = '';
  let changed = 0;
  let i = 0;
  const n = text.length;
  while (i < n) {
    if (kind !== 'html' && text.startsWith('//', i)) {
      let j = text.indexOf('\n', i); if (j === -1) j = n;
      out += text.slice(i, j); i = j; continue;
    }
    if (text.startsWith('/*', i)) {
      let j = text.indexOf('*/', i); j = j === -1 ? n : j + 2;
      out += text.slice(i, j); i = j; continue;
    }
    if (kind === 'html' && text.startsWith('<!--', i)) {
      let j = text.indexOf('-->', i); j = j === -1 ? n : j + 3;
      out += text.slice(i, j); i = j; continue;
    }
    if (kind === 'ts' && (text[i] === "'" || text[i] === '"' || text[i] === '`')) {
      const q = text[i];
      let j = i + 1;
      while (j < n && text[j] !== q) j += text[j] === '\\' ? 2 : 1;
      const lit = text.slice(i, j + 1);
      changed += (lit.match(/—/g) ?? []).length;
      out += lit.replaceAll('—', '-'); i = j + 1; continue;
    }
    if (text[i] === '—') {
      if (kind === 'ts') {
        console.error(`  ? em dash outside a string or comment in ${file}: ${JSON.stringify(text.slice(Math.max(0, i - 30), i + 30))}`);
        out += text[i]; i++; continue;
      }
      out += '-'; changed++; i++; continue;
    }
    out += text[i]; i++;
  }
  return { out, changed };
}

function sweep() {
  let total = 0;
  for (const file of walk(SRC)) {
    const rel = relative(REPO_ROOT, file);
    const kind = extname(file).slice(1);
    if (!['ts', 'html', 'json'].includes(kind) || HELD_BACK.has(rel)) continue;
    const text = readFileSync(file, 'utf8');
    if (!text.includes('—')) continue;
    const { out, changed } = sweepText(text, kind, rel);
    if (changed === 0) continue;
    writeFileSync(file, out);
    total += changed;
    console.log(`${String(changed).padStart(3)}  ${rel}`);
  }
  console.log(`total replaced: ${total}`);
}

function residual() {
  const counts = new Map();
  const unknown = new Map();
  let total = 0;
  const decode = (s) => s.replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|nbsp);/gi, (m, e) =>
    e[0] === '#' ? String.fromCodePoint(e[1] === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10))
      : { amp: '&', lt: '<', gt: '>', quot: '"', nbsp: ' ' }[e.toLowerCase()] ?? m);
  for (const file of walk(DIST).filter((f) => f.endsWith('.html'))) {
    const text = decode(readFileSync(file, 'utf8'));
    // One context per dash — a sliding regex would swallow a neighbour within 60
    // characters (alt text carries two) and never classify it.
    for (let i = text.indexOf('—'); i !== -1; i = text.indexOf('—', i + 1)) {
      total++;
      const ctx = text.slice(Math.max(0, i - 60), i + 61);
      const src = RESIDUAL_SOURCES.find(([re]) => re.test(ctx))?.[1];
      if (src) counts.set(src, (counts.get(src) ?? 0) + 1);
      else unknown.set(ctx.replace(/\s+/g, ' '), (unknown.get(ctx.replace(/\s+/g, ' ')) ?? 0) + 1);
    }
  }
  console.log(`${total} em dashes across the prerendered HTML`);
  for (const [src, n] of [...counts].sort((a, b) => b[1] - a[1])) console.log(`${String(n).padStart(5)}  ${src}`);
  const u = [...unknown.values()].reduce((a, b) => a + b, 0);
  console.log(`${u} unattributed`);
  for (const [ctx, n] of [...unknown].sort((a, b) => b[1] - a[1]).slice(0, 20)) console.log(`${String(n).padStart(5)}  …${ctx}…`);
  process.exit(u === 0 ? 0 : 1);
}

const mode = process.argv[2];
if (mode === 'sweep') sweep();
else if (mode === 'residual') residual();
else {
  console.error('usage: node tools/dashes.mjs sweep | residual');
  process.exit(2);
}
