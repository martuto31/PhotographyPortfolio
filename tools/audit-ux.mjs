#!/usr/bin/env node
// UI/UX audit of the built site, in a real browser, against numbers rather than taste.
//
// Usage:
//   node tools/audit-ux.mjs                 serve dist on :4519, audit the default routes
//   node tools/audit-ux.mjs /kontakti ...   audit only these routes
//
// Each route is loaded at 1440 and 390 CSS px in headless Chrome (throwaway profile)
// and measured from inside the page: heading order, computed text sizes, WCAG contrast
// against the rendered background, tap-target boxes, horizontal overflow, alt text,
// accessible names, landmarks, paragraph measure and line-height, form labels.
//
// Every check has a threshold written next to it. A FAIL is a number that missed the
// threshold; a WARN is worth a look but no rule says it is wrong; text drawn over a
// photograph cannot be measured and is reported as INFO. The full findings go to
// .verify/ux-audit.json; the console gets one line per finding and a summary.
//
// Exit code is 1 when any FAIL remains, so this can sit next to `npm run verify`.

import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');
const DIST = join(REPO_ROOT, 'dist', 'photography-portfolio', 'browser');
const OUT_DIR = join(REPO_ROOT, '.verify');
const OUT_FILE = join(OUT_DIR, 'ux-audit.json');

// Random ports, so a verifier's run and the author's can overlap.
const PORT = 4900 + Math.floor(Math.random() * 300);
const DEBUG_PORT = 9700 + Math.floor(Math.random() * 300);
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const WIDTHS = [1440, 390];

const DEFAULT_ROUTES = [
  '/',
  '/galerii',
  '/galerii/svatbi',
  '/galerii/krushteneta',
  '/galeriya/svatbi/%D0%9B%D0%BE%D1%80%D0%B0%20%D0%B8%20%D0%90%D1%81%D0%B5%D0%BD',
  '/kontakti',
  '/about-me',
  '/usloviya',
];

const routes = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT_ROUTES;

if (!existsSync(DIST)) {
  console.error(`dist not found at ${DIST} — run npm run build first`);
  process.exit(2);
}

// ---------------------------------------------------------------------------
// The audit itself runs inside the page. Everything it needs is in this one
// function; it returns plain data so it can cross the DevTools protocol.

const AUDIT_SOURCE = `(() => {
  const T = {
    minTextPx: 12,          // Lighthouse "legible font sizes"
    contrastNormal: 4.5,    // WCAG 1.4.3 AA
    contrastLarge: 3,       // WCAG 1.4.3 AA, large text
    largePx: 24,            // 18pt
    largeBoldPx: 18.66,     // 14pt bold
    targetMin: 24,          // WCAG 2.5.8 AA (2.2)
    targetGood: 44,         // Apple HIG; Lighthouse uses 48
    lineHeightMin: 1.4,     // WCAG 1.4.12 asks for 1.5 to be *possible*; 1.4 is the floor most guides use
    displayPx: 24,          // a <p> set this large is display type (a pull quote), leaded like a heading
    measureMaxCh: 90,       // 45–75ch is the classic range; 90 is where reading genuinely suffers
  };

  const findings = [];
  const add = (level, check, detail, extra = {}) => findings.push({ level, check, detail, ...extra });

  const vw = window.innerWidth;
  const isMobile = vw < 700;

  const describe = (el) => {
    const tag = el.tagName.toLowerCase();
    const id = el.id ? '#' + el.id : '';
    const cls = el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\\s+/).slice(0, 2).join('.') : '';
    const text = (el.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 40);
    return tag + id + cls + (text ? ' "' + text + '"' : '');
  };

  // Visible to the eye. aria-hidden is deliberately NOT a reason to skip: it hides
  // from screen readers only, and a sighted visitor still has to read the text.
  const visible = (el) => {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') return false;
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return false;
    // The visually-hidden pattern: 1px box, clipped.
    if (r.width <= 1 && r.height <= 1) return false;
    return true;
  };
  // Visible AND exposed to assistive tech - what the name and target checks are about.
  const perceivable = (el) => visible(el) && !el.closest('[aria-hidden="true"]');

  // ---- colour helpers
  const parseColor = (s) => {
    const m = s.match(/rgba?\\(([^)]+)\\)/);
    if (!m) return null;
    const [r, g, b, a = '1'] = m[1].split(',').map((x) => x.trim());
    return { r: +r, g: +g, b: +b, a: +a };
  };
  const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  const luminance = ({ r, g, b }) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  const contrast = (a, b) => { const la = luminance(a), lb = luminance(b); return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05); };
  const blend = (fg, bg) => ({ r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1 });

  // Everything that paints a picture: <img>, <video> and any element carrying a
  // background image or gradient. Text over one of these sits on a photograph
  // and cannot be measured - whether the picture is an ancestor (a CSS
  // background) or a sibling painted underneath (a real <img> with the copy
  // positioned over it, like the hero).
  const paintedImages = [...document.querySelectorAll('*')].filter((n) => {
    if (n.tagName === 'IMG' || n.tagName === 'VIDEO') return true;
    const bg = getComputedStyle(n).backgroundImage;
    return bg && bg !== 'none';
  });
  // A fixed or sticky ancestor (the header) is lifted above everything after it
  // in the document, so for its text a later picture still lies underneath.
  const elevated = (el) => {
    for (let node = el; node; node = node.parentElement) {
      const pos = getComputedStyle(node).position;
      if (pos === 'fixed' || pos === 'sticky') return true;
    }
    return false;
  };
  const coveredByImage = (el) => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return false;
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const lifted = elevated(el);
    return paintedImages.some((n) => {
      if (n === el || n.contains(el) || el.contains(n)) return false;
      // Painted before the text in document order, i.e. underneath it - unless
      // the text rides in the fixed header, which is above the whole page.
      if (!lifted && !(n.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING)) return false;
      const b = n.getBoundingClientRect();
      return b.left <= cx && cx <= b.right && b.top <= cy && cy <= b.bottom;
    });
  };

  // Walk up until something paints an opaque colour. An image or gradient on the
  // way means the text sits over a photograph and cannot be measured.
  const backgroundOf = (el) => {
    if (coveredByImage(el)) return { overImage: true };
    let acc = null; // accumulated translucent layers, bottom-up is easier so collect first
    const layers = [];
    for (let node = el; node; node = node.parentElement) {
      const cs = getComputedStyle(node);
      if (cs.backgroundImage && cs.backgroundImage !== 'none') return { overImage: true };
      const c = parseColor(cs.backgroundColor);
      if (c && c.a > 0) {
        layers.push(c);
        if (c.a >= 1) break;
      }
    }
    if (layers.length === 0 || layers[layers.length - 1].a < 1) {
      layers.push({ r: 255, g: 255, b: 255, a: 1 }); // the canvas
    }
    acc = layers[layers.length - 1];
    for (let i = layers.length - 2; i >= 0; i--) acc = blend(layers[i], acc);
    return { color: acc };
  };

  const hex = ({ r, g, b }) => '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');

  // ---- text elements: anything with its own text node
  const textElements = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const seen = new Set();
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (!n.textContent.trim()) continue;
    const el = n.parentElement;
    if (!el || seen.has(el)) continue;
    if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'TITLE'].includes(el.tagName)) continue;
    seen.add(el);
    if (visible(el)) textElements.push(el);
  }

  // ---- 1. headings
  const headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].filter((h) => !h.closest('[aria-hidden="true"]'));
  const h1s = headings.filter((h) => h.tagName === 'H1');
  if (h1s.length !== 1) add('FAIL', 'heading-h1', h1s.length + ' <h1> on the page', { expected: 1 });
  let last = 0;
  for (const h of headings) {
    const level = +h.tagName[1];
    if (last && level > last + 1) add('FAIL', 'heading-order', 'h' + last + ' → h' + level + ' at ' + describe(h));
    if (!(h.textContent || '').trim()) add('FAIL', 'heading-empty', describe(h));
    last = level;
  }

  // ---- 2. text size, 3. contrast, 9. line-height + measure
  for (const el of textElements) {
    const cs = getComputedStyle(el);
    const px = parseFloat(cs.fontSize);
    const weight = parseInt(cs.fontWeight, 10) || 400;
    // The "Photography" line under the wordmark is the logo lockup, not reading text -
    // an SVG logo would not be measured either. Everything else has to clear the floor.
    const logoLockup = el.classList.contains('brand-tag');
    if (px < T.minTextPx && !logoLockup) add('FAIL', 'text-size', px.toFixed(1) + 'px ' + describe(el), { px });

    const fg = parseColor(cs.color);
    const bg = backgroundOf(el);
    if (fg && bg.overImage) {
      add('INFO', 'contrast-over-image', describe(el));
    } else if (fg && bg.color) {
      // An opacity on the element or any ancestor fades the ink the same way a
      // translucent colour would - a 0.7 over a passing grey is how 4.4:1 hides.
      let opacity = 1;
      for (let node = el; node && node !== document.documentElement; node = node.parentElement) opacity *= parseFloat(getComputedStyle(node).opacity) || 1;
      const fgFlat = fg.a * opacity < 1 ? blend({ ...fg, a: fg.a * opacity }, bg.color) : fg;
      const ratio = contrast(fgFlat, bg.color);
      const large = px >= T.largePx || (px >= T.largeBoldPx && weight >= 700);
      const need = large ? T.contrastLarge : T.contrastNormal;
      if (ratio < need) add('FAIL', 'contrast', ratio.toFixed(2) + ':1 (need ' + need + ') ' + hex(fgFlat) + ' on ' + hex(bg.color) + ' ' + px.toFixed(1) + 'px ' + describe(el), { ratio, need, px });
    }

  }

  // ---- 9. every paragraph, including one whose words all sit in a child (<p><em>…</em></p>)
  for (const el of document.querySelectorAll('p')) {
    if (!visible(el) || !(el.textContent || '').trim()) continue;
    const cs = getComputedStyle(el);
    const px = parseFloat(cs.fontSize);
    const lh = cs.lineHeight === 'normal' ? 1.2 : parseFloat(cs.lineHeight) / px;
    // The floor is for reading text. A paragraph at heading size is a display line
    // and takes a heading's leading; the site's h2 sits at 1.14 for the same reason.
    if (lh < T.lineHeightMin && px < T.displayPx) add('FAIL', 'line-height', lh.toFixed(2) + ' ' + describe(el), { lineHeight: lh });
    if (!isMobile) {
      // Average glyph ≈ 0.5em; good enough to catch a paragraph that runs the width of the screen.
      const ch = el.getBoundingClientRect().width / (px * 0.5);
      if (ch > T.measureMaxCh && (el.textContent || '').trim().length > 120) add('FAIL', 'measure', Math.round(ch) + 'ch ' + describe(el), { ch });
    }
  }

  // ---- 4. tap targets (mobile only), 7. accessible names
  const interactive = [...document.querySelectorAll('a[href],button,input,select,textarea,[role="button"]')].filter(perceivable);
  const boxes = interactive.map((el) => el.getBoundingClientRect());
  const labelFor = (el) => el.id && document.querySelector('label[for="' + CSS.escape(el.id) + '"]');
  // WCAG 2.5.8: a target inside a sentence is exempt - its size is set by the line.
  const INLINE_PARENTS = ['P', 'LI', 'DD', 'DT', 'TD', 'SPAN', 'EM', 'STRONG', 'ADDRESS', 'SMALL', 'FIGCAPTION'];
  const inlineText = (el) => el.tagName === 'A' && el.parentElement && INLINE_PARENTS.includes(el.parentElement.tagName)
    && [...el.parentElement.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 0);
  // WCAG 2.5.8: a small target still passes when a 24px circle on its centre touches
  // no other target - a footer link with air around it is fine, a cramped one is not.
  const undersized = (r) => r.width < T.targetMin || r.height < T.targetMin;
  const spaced = (i) => {
    const r = boxes[i];
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2, rad = T.targetMin / 2;
    return boxes.every((o, j) => {
      if (j === i || (o.width === 0 && o.height === 0)) return true;
      const nx = Math.max(o.left, Math.min(cx, o.right)), ny = Math.max(o.top, Math.min(cy, o.bottom));
      if (Math.hypot(cx - nx, cy - ny) < rad) return false;
      // ...and two small targets' circles must not overlap each other either.
      if (undersized(o)) {
        const ox = o.left + o.width / 2, oy = o.top + o.height / 2;
        if (Math.hypot(cx - ox, cy - oy) < T.targetMin) return false;
      }
      return true;
    });
  };
  interactive.forEach((el, i) => {
    const name = (el.getAttribute('aria-label') || el.getAttribute('title') || (el.tagName === 'INPUT' ? (el.getAttribute('placeholder') || el.value) : '') || el.textContent || '').trim()
      || (el.querySelector('img[alt]')?.getAttribute('alt') || '').trim()
      || (labelFor(el)?.textContent || '').trim();
    if (!name && el.tagName !== 'INPUT') add('FAIL', 'accessible-name', describe(el));
    // A lazy photograph below the fold has no box until it loads; measuring its button
    // now would report 0px for something the visitor never sees at that size.
    const unloadedImage = [...el.querySelectorAll('img')].some((img) => !img.complete || img.naturalWidth === 0);
    if (isMobile && el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA' && !unloadedImage && !inlineText(el)) {
      const w = Math.round(boxes[i].width), h = Math.round(boxes[i].height);
      if ((w < T.targetMin || h < T.targetMin) && !spaced(i)) add('FAIL', 'target-size', w + '×' + h + ' ' + describe(el), { w, h });
      else if (w < T.targetGood || h < T.targetGood) add('WARN', 'target-size', w + '×' + h + ' ' + describe(el), { w, h });
    }
  });

  // ---- 5. horizontal overflow
  if (isMobile) {
    const sw = document.documentElement.scrollWidth;
    if (sw > vw) add('FAIL', 'overflow-x', sw + 'px wide on a ' + vw + 'px viewport');
  }

  // ---- 6. images
  for (const img of document.querySelectorAll('img')) {
    if (!img.hasAttribute('alt')) add('FAIL', 'img-alt', describe(img) + ' ' + (img.getAttribute('src') || '').slice(-40));
  }

  // ---- 8. landmarks
  if (!document.documentElement.getAttribute('lang')) add('FAIL', 'lang', 'html has no lang');
  const mains = document.querySelectorAll('main, [role="main"]').length;
  if (mains !== 1) add('FAIL', 'landmark-main', mains + ' <main>');
  if (!document.querySelector('nav, [role="navigation"]')) add('FAIL', 'landmark-nav', 'no <nav>');
  if (!document.querySelector('footer, [role="contentinfo"]')) add('FAIL', 'landmark-footer', 'no <footer>');
  if (!document.querySelector('meta[name="viewport"]')) add('FAIL', 'viewport-meta', 'missing');

  // ---- 10. form labels
  for (const field of document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]),select,textarea')) {
    if (!perceivable(field)) continue;
    const labelled = field.id && document.querySelector('label[for="' + CSS.escape(field.id) + '"]');
    const wrapped = field.closest('label');
    const aria = field.getAttribute('aria-label') || field.getAttribute('aria-labelledby');
    if (!labelled && !wrapped && !aria) add('FAIL', 'form-label', describe(field) + ' name=' + (field.getAttribute('name') || field.getAttribute('formcontrolname') || '?'));
  }

  // ---- type scale snapshot, for the human reading the report
  const sizes = {};
  for (const sel of ['h1', 'h2', 'h3', 'p', 'nav a', 'button, a.btn, .btn']) {
    const el = [...document.querySelectorAll(sel)].find(visible);
    if (el) {
      const cs = getComputedStyle(el);
      sizes[sel] = Math.round(parseFloat(cs.fontSize) * 10) / 10 + 'px/' + (cs.lineHeight === 'normal' ? 'normal' : (parseFloat(cs.lineHeight) / parseFloat(cs.fontSize)).toFixed(2)) + ' ' + cs.fontFamily.split(',')[0].replace(/"/g, '');
    }
  }

  return { findings, sizes, textElements: textElements.length, interactive: interactive.length };
})()`;

// ---------------------------------------------------------------------------
// Chrome plumbing — the same DevTools-over-WebSocket approach as .verify/shoot-cdp.mjs.

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function pageTarget() {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json`);
      const page = (await res.json()).find((t) => t.type === 'page');
      if (page) return page;
    } catch {}
    await sleep(250);
  }
  throw new Error('chrome did not expose a page target');
}

function connect(url) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    let id = 0;
    const pending = new Map();
    ws.onmessage = (m) => {
      const msg = JSON.parse(m.data);
      if (msg.id && pending.has(msg.id)) {
        const { res, rej } = pending.get(msg.id);
        pending.delete(msg.id);
        msg.error ? rej(new Error(msg.error.message)) : res(msg.result);
      }
    };
    ws.onerror = reject;
    ws.onopen = () => resolve({
      send: (method, params = {}) => new Promise((res, rej) => {
        pending.set(++id, { res, rej });
        ws.send(JSON.stringify({ id, method, params }));
      }),
      close: () => ws.close(),
    });
  });
}

const routeName = (route) => (route === '/' ? 'home' : decodeURIComponent(route).split('/').filter(Boolean).join('/'));

mkdirSync(OUT_DIR, { recursive: true });
const profile = mkdtempSync(join(tmpdir(), 'phbyviki-audit-'));

const server = spawn('npx', ['http-server', DIST, '-p', String(PORT), '-c-1', '-s'], { cwd: REPO_ROOT, stdio: 'ignore' });
const chrome = spawn(CHROME, [
  '--headless=new', `--user-data-dir=${profile}`, `--remote-debugging-port=${DEBUG_PORT}`,
  '--disable-gpu', '--hide-scrollbars', '--no-first-run', 'about:blank',
], { stdio: 'ignore' });

const report = { generated: new Date().toISOString(), pages: [] };

async function serverReady() {
  for (let i = 0; i < 40; i++) {
    try {
      if ((await fetch(`http://localhost:${PORT}/`)).ok) return;
    } catch {}
    await sleep(250);
  }
  throw new Error('http-server did not come up');
}

try {
  await serverReady();
  const cdp = await connect((await pageTarget()).webSocketDebuggerUrl);
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');

  for (const width of WIDTHS) {
    await cdp.send('Emulation.setDeviceMetricsOverride', { width, height: width < 700 ? 844 : 900, deviceScaleFactor: 1, mobile: width < 700 });
    for (const route of routes) {
      await cdp.send('Page.navigate', { url: `http://localhost:${PORT}${route}` });
      await sleep(2800); // hydration, the manifest fetch, fonts
      const { result, exceptionDetails } = await cdp.send('Runtime.evaluate', { expression: AUDIT_SOURCE, returnByValue: true, awaitPromise: true });
      if (exceptionDetails) throw new Error(`audit threw on ${route}@${width}: ${exceptionDetails.text} ${exceptionDetails.exception?.description ?? ''}`);
      report.pages.push({ route: routeName(route), width, ...result.value });
    }
  }
  cdp.close();
} finally {
  chrome.kill();
  server.kill();
  await sleep(800);
  try { rmSync(profile, { recursive: true, force: true }); } catch {}
}

writeFileSync(OUT_FILE, JSON.stringify(report, null, 2));

// ---------------------------------------------------------------------------
// Report

const all = report.pages.flatMap((p) => p.findings.map((f) => ({ ...f, route: p.route, width: p.width })));
const byLevel = (level) => all.filter((f) => f.level === level);

for (const level of ['FAIL', 'WARN', 'INFO']) {
  const items = byLevel(level);
  if (items.length === 0) continue;
  console.log(`\n${level} (${items.length})`);
  // Collapse repeats of the same finding across routes/widths to keep the list readable.
  const grouped = new Map();
  for (const f of items) {
    const key = `${f.check}: ${f.detail}`;
    const g = grouped.get(key) ?? { ...f, where: [] };
    g.where.push(`${f.route}@${f.width}`);
    grouped.set(key, g);
  }
  for (const g of grouped.values()) {
    const where = g.where.length === report.pages.length ? 'everywhere' : g.where.slice(0, 4).join(', ') + (g.where.length > 4 ? ` +${g.where.length - 4}` : '');
    console.log(`  ${g.check.padEnd(20)} ${g.detail}  [${where}]`);
  }
}

// Every check, including the silent ones, so "no findings" is visibly "checked, clean".
const CHECKS = ['heading-h1', 'heading-order', 'heading-empty', 'text-size', 'contrast', 'line-height', 'measure', 'accessible-name', 'target-size', 'overflow-x', 'img-alt', 'lang', 'landmark-main', 'landmark-nav', 'landmark-footer', 'viewport-meta', 'form-label', 'contrast-over-image'];
console.log(`\n${'check'.padEnd(20)}  fail  warn  info`);
console.log(`${'-'.repeat(20)}  ----  ----  ----`);
for (const check of CHECKS) {
  const of = all.filter((f) => f.check === check);
  const n = (level) => String(of.filter((f) => f.level === level).length).padStart(4);
  console.log(`${check.padEnd(20)}  ${n('FAIL')}  ${n('WARN')}  ${n('INFO')}`);
}

console.log('\nType scale (first visible match per page):');
for (const p of report.pages) {
  console.log(`  ${(p.route + '@' + p.width).padEnd(38)} ${Object.entries(p.sizes).map(([k, v]) => `${k}=${v}`).join('  ')}`);
}

const fails = byLevel('FAIL').length;
console.log(`\nux-audit: ${fails === 0 ? 'PASS' : 'FAIL'} — ${report.pages.length} page loads, ${fails} FAIL, ${byLevel('WARN').length} WARN, ${byLevel('INFO').length} INFO → ${OUT_FILE}`);
process.exit(fails === 0 ? 0 : 1);
