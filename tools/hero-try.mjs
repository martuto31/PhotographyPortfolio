// Try candidate photographs in the home page hero, without touching the source.
//
//   npm run hero:try -- <dir-with-photos>            # every jpg/png/webp in it
//   npm run hero:try -- a.jpg b.jpg                  # or named files
//   npm run hero:try -- --screens phone,laptop-16x10 <dir>
//
// Each candidate is resized to the hero's 2400px export, dropped into the built
// dist, and the home page is captured with it at four screens - a 16:9 desktop, a
// 16:10 laptop, a tablet and a phone. One PNG per candidate x screen and one
// contact sheet (a row per candidate) land in .verify/hero-try/. Headless Chrome
// on a throwaway profile; nothing on screen; the dist's own hero files are left
// as built. `npm run build` first.
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');
const DIST = join(REPO_ROOT, 'dist', 'photography-portfolio', 'browser');
const HERO_DIR = join(DIST, 'assets', 'img', 'hero');
const OUT_DIR = join(REPO_ROOT, '.verify', 'hero-try');
const PORT = 4600 + Math.floor(Math.random() * 300);
const DEBUG_PORT = 9400 + Math.floor(Math.random() * 300);
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const HERO_WIDTH = 2400;

// The screens the hero rule was written for (intro-section.component.css).
const SCREENS = [
  { name: 'desktop-16x9', width: 1920, height: 1080 },
  { name: 'laptop-16x10', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'phone', width: 390, height: 844 },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const args = process.argv.slice(2);
// --screens desktop-16x9,phone : a subset of the screens above.
const screensArg = args.indexOf('--screens');
const wanted = screensArg === -1 ? null : args.splice(screensArg, 2)[1].split(',');
const screens = wanted ? SCREENS.filter((s) => wanted.includes(s.name)) : SCREENS;
if (!args.length) {
  console.error('usage: node tools/hero-try.mjs <dir | files...>');
  process.exit(1);
}
const isImage = (f) => ['.jpg', '.jpeg', '.png', '.webp'].includes(extname(f).toLowerCase());
const candidates = args.flatMap((arg) => {
  const path = resolve(arg);
  return statSync(path).isDirectory()
    ? readdirSync(path).filter(isImage).sort().map((f) => join(path, f))
    : [path];
});
if (!candidates.length) {
  console.error('no jpg/png/webp found');
  process.exit(1);
}

async function pageTarget() {
  for (let i = 0; i < 40; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${DEBUG_PORT}/json`)).json();
      const page = list.find((t) => t.type === 'page');
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

async function serverReady() {
  for (let i = 0; i < 40; i++) {
    try {
      if ((await fetch(`http://localhost:${PORT}/`)).ok) return;
    } catch {}
    await sleep(250);
  }
  throw new Error('http-server did not come up');
}

// A label strip above each contact-sheet cell.
const label = (text, width, height = 28) => Buffer.from(
  `<svg width="${width}" height="${height}"><rect width="100%" height="100%" fill="#1A1714"/><text x="10" y="${height - 9}" font-family="Helvetica, Arial" font-size="14" font-weight="700" fill="#FAF7F2">${text}</text></svg>`,
);

mkdirSync(OUT_DIR, { recursive: true });
rmSync(OUT_DIR, { recursive: true, force: true });
mkdirSync(OUT_DIR, { recursive: true });

// 1. The candidates as hero exports, in the dist only.
const tries = [];
for (const [i, file] of candidates.entries()) {
  const n = i + 1;
  const slug = basename(file, extname(file)).toLowerCase().replace(/[^a-z0-9а-я]+/gi, '-').replace(/^-|-$/g, '');
  const out = join(HERO_DIR, `try-${n}.webp`);
  const meta = await sharp(file).resize({ width: HERO_WIDTH, withoutEnlargement: true }).webp({ quality: 82 }).toFile(out);
  tries.push({ n, slug, file, src: `/assets/img/hero/try-${n}.webp`, width: meta.width, height: meta.height });
  console.log(`${n}  ${basename(file)}  ${meta.width}x${meta.height}  ${(meta.size / 1024).toFixed(0)} KB`);
}

const server = spawn('npx', ['http-server', DIST, '-p', String(PORT), '-c-1', '-s'], { cwd: REPO_ROOT, stdio: 'ignore' });

// 2. The home page with each one in the hero, per screen. A fresh Chrome per
// screen: re-using one (a second tab, or one tab re-navigated after a viewport
// change) left the photograph loaded but unpainted in some captures.
const rows = [];
try {
  await serverReady();
  for (const screen of screens) {
    const profile = mkdtempSync(join(tmpdir(), 'phbyviki-hero-'));
    const chrome = spawn(CHROME, [
      '--headless=new', `--user-data-dir=${profile}`, `--remote-debugging-port=${DEBUG_PORT}`,
      '--disable-gpu', '--hide-scrollbars', '--no-first-run', 'about:blank',
    ], { stdio: 'ignore' });
    try {
      const cdp = await connect((await pageTarget()).webSocketDebuggerUrl);
      await cdp.send('Page.enable');
      await cdp.send('Runtime.enable');
      await cdp.send('Emulation.setDeviceMetricsOverride', { width: screen.width, height: screen.height, deviceScaleFactor: 1, mobile: screen.width < 700 });
      await cdp.send('Page.navigate', { url: `http://localhost:${PORT}/` });
      await sleep(2800);
      console.log(`${screen.name} ${screen.width}x${screen.height}`);
      for (const t of tries) {
        // Swap the photograph in place and wait for it to load (capped: a decode
        // that never settles must not hang the run).
        await cdp.send('Runtime.evaluate', {
          expression: `new Promise((done) => { document.querySelectorAll('.hero-photo-next').forEach((n) => n.remove()); document.querySelector('.hero-frame')?.classList.remove('cycling'); const img = document.querySelector('.hero-photo'); img.onload = () => done('load'); img.onerror = () => done('error'); setTimeout(() => done('timeout'), 6000); img.removeAttribute('srcset'); img.src = ${JSON.stringify(t.src)}; })`,
          awaitPromise: true,
        });
        await sleep(500);
        const shot = await cdp.send('Page.captureScreenshot', { format: 'png' });
        const file = join(OUT_DIR, `${t.n}-${t.slug}@${screen.name}.png`);
        writeFileSync(file, Buffer.from(shot.data, 'base64'));
        rows.push({ ...t, screen, file });
        console.log(`  ${screen.name}  ${t.n}-${t.slug}`);
      }
      cdp.close();
    } finally {
      chrome.kill();
      await sleep(600);
      try { rmSync(profile, { recursive: true, force: true }); } catch {}
    }
  }
} finally {
  server.kill();
  await sleep(300);
  for (const t of tries) {
    try { rmSync(join(HERO_DIR, `try-${t.n}.webp`)); } catch {}
  }
}

// 3. One sheet: a row per candidate, the four screens side by side at one height.
const CELL_H = 360;
const GAP = 16;
const cells = screens.map((s) => ({ ...s, w: Math.round(s.width * CELL_H / s.height) }));
const rowW = cells.reduce((sum, c) => sum + c.w, 0) + GAP * (cells.length + 1);
const rowH = CELL_H + 28 + GAP;
const sheetH = tries.length * rowH + GAP;
const composites = [];
for (const [ri, t] of tries.entries()) {
  let x = GAP;
  const y = GAP + ri * rowH;
  for (const c of cells) {
    const shot = rows.find((r) => r.n === t.n && r.screen.name === c.name).file;
    composites.push({ input: label(`${t.n} · ${basename(t.file)} · ${c.name} ${c.width}x${c.height}`, c.w), left: x, top: y });
    composites.push({ input: await sharp(shot).resize({ width: c.w, height: CELL_H, fit: 'cover', position: 'top' }).toBuffer(), left: x, top: y + 28 });
    x += c.w + GAP;
  }
}
const sheet = join(OUT_DIR, 'contact-sheet.png');
await sharp({ create: { width: rowW, height: sheetH, channels: 3, background: '#FAF7F2' } }).composite(composites).png().toFile(sheet);
console.log(`\n${sheet}  ${rowW}x${sheetH}\n${rows.length} captures in ${OUT_DIR}`);
