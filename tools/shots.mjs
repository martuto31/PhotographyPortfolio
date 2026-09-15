#!/usr/bin/env node
// Full-page screenshots of the built site, for looking at a redesign without a
// browser window: headless Chrome on a throwaway profile, the dist served on a
// local port, one PNG per route x width into .verify/shots/. Nothing on screen.
//
//   npm run shots                                  # default routes, 390 / 768 / 1440
//   node tools/shots.mjs --widths 390,2560 /       # your own routes and widths
//   node tools/shots.mjs --full 0 /galerii         # viewport only, not the whole page
//
// Read the PNGs back only when something needs checking - images are the single
// biggest spend on frontend work (WORKER.md, cost controls).
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');
const DIST = join(REPO_ROOT, 'dist', 'photography-portfolio', 'browser');
const OUT_DIR = join(REPO_ROOT, '.verify', 'shots');
// Random ports, so two runs (a verifier and the author) can overlap.
const PORT = 4600 + Math.floor(Math.random() * 300);
const DEBUG_PORT = 9400 + Math.floor(Math.random() * 300);
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const DEFAULT_ROUTES = [
  '/',
  '/galerii',
  '/galerii/svatbi',
  '/galeriya/svatbi/%D0%9B%D0%BE%D1%80%D0%B0%20%D0%B8%20%D0%90%D1%81%D0%B5%D0%BD',
  '/kontakti',
  '/about-me',
];

const argv = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = argv.indexOf(name);
  if (i === -1) return fallback;
  const value = argv[i + 1];
  argv.splice(i, 2);
  return value;
};
const widths = opt('--widths', '390,768,1440').split(',').map(Number);
const fullPage = opt('--full', '1') !== '0';
const settle = Number(opt('--settle', '2800'));
// --eval '<js>' prints the expression's value for every route x width, for
// checking a class or a computed style without opening a PNG.
const evalExpr = opt('--eval', '');
// --scroll <px>: fold capture from that offset, after scrolling down to it in
// steps so lazy images on the way have been asked for.
const scrollTo = Number(opt('--scroll', '0'));
// --height <px>: viewport height for every width (default: a common pairing).
const heightOpt = Number(opt('--height', '0'));
const routes = argv.length ? argv : DEFAULT_ROUTES;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const routeName = (route) => (route === '/' ? 'home' : decodeURIComponent(route).split('/').filter(Boolean).join('_'));

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

mkdirSync(OUT_DIR, { recursive: true });
const profile = mkdtempSync(join(tmpdir(), 'phbyviki-shots-'));

const server = spawn('npx', ['http-server', DIST, '-p', String(PORT), '-c-1', '-s'], { cwd: REPO_ROOT, stdio: 'ignore' });
const chrome = spawn(CHROME, [
  '--headless=new', `--user-data-dir=${profile}`, `--remote-debugging-port=${DEBUG_PORT}`,
  '--disable-gpu', '--hide-scrollbars', '--no-first-run', 'about:blank',
], { stdio: 'ignore' });

try {
  await serverReady();
  const cdp = await connect((await pageTarget()).webSocketDebuggerUrl);
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');

  for (const width of widths) {
    const height = heightOpt || (width < 700 ? 844 : width >= 2560 ? Math.round(width * 9 / 16) : width >= 1900 ? 1080 : width <= 1280 ? 800 : 900);
    await cdp.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 700 });
    for (const route of routes) {
      await cdp.send('Page.navigate', { url: `http://localhost:${PORT}${route}` });
      await sleep(settle);
      // Full page: scroll through once so lazy images below the fold are fetched
      // before the capture (capped at 40 screens - a 150-photo gallery is not a
      // full-page job). The fold capture leaves the page where it loaded.
      if (fullPage) {
        await cdp.send('Runtime.evaluate', { expression: `(async () => { const h = Math.min(document.documentElement.scrollHeight, 40 * innerHeight); for (let y = 0; y < h; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); } window.scrollTo(0, 0); })()`, awaitPromise: true });
        await sleep(900);
      }
      if (scrollTo > 0) {
        await cdp.send('Runtime.evaluate', { expression: `(async () => { for (let y = 0; y <= ${scrollTo}; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 150)); } window.scrollTo(0, ${scrollTo}); })()`, awaitPromise: true });
        await sleep(settle);
      }
      if (evalExpr) {
        const { result: r } = await cdp.send('Runtime.evaluate', { expression: evalExpr, returnByValue: true, awaitPromise: true });
        console.log(`${routeName(route)}@${width}  eval: ${JSON.stringify(r.value)}`);
      }
      const { result } = await cdp.send('Runtime.evaluate', { expression: 'document.documentElement.scrollHeight', returnByValue: true });
      const docHeight = result.value;
      // Images that never arrived show as blank boxes and are easy to misread as a
      // layout bug, so say how many there are and name the first.
      const imgs = await cdp.send('Runtime.evaluate', { expression: `(() => { const all = [...document.images]; const bad = all.filter((i) => !i.complete || i.naturalWidth === 0); return { total: all.length, bad: bad.length, first: bad[0]?.currentSrc || bad[0]?.src || '' }; })()`, returnByValue: true });
      const { total, bad, first } = imgs.result.value;
      const note = bad ? `  ${bad}/${total} images did not load (first: ${first})` : `  ${total} images loaded`;
      // A full-page capture is a tall viewport, not captureBeyondViewport: that path
      // paints images as blank boxes in headless Chrome.
      if (fullPage) {
        await cdp.send('Emulation.setDeviceMetricsOverride', { width, height: Math.min(docHeight, 16000), deviceScaleFactor: 1, mobile: width < 700 });
        await sleep(700);
      }
      const shot = await cdp.send('Page.captureScreenshot', { format: 'png' });
      if (fullPage) {
        await cdp.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 700 });
      }
      const file = join(OUT_DIR, `${routeName(route)}@${width}.png`);
      writeFileSync(file, Buffer.from(shot.data, 'base64'));
      console.log(`${file}  ${width}x${fullPage ? docHeight : height}${note}`);
    }
  }
  cdp.close();
} finally {
  chrome.kill();
  server.kill();
  await sleep(800);
  try { rmSync(profile, { recursive: true, force: true }); } catch {}
}
