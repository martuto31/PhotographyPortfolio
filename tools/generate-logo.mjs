#!/usr/bin/env node
// Renders the wordmark lockups from the shared brand mark plus the site's own
// webfonts, so the logo is literally the same typography as the site header.
//
// Usage:
//   npm run logo
//
// Why headless Chrome rather than sharp alone: the wordmark is set in Cormorant
// italic, which ships as woff2 in src/assets/fonts. librsvg (what sharp uses for
// SVG) cannot load woff2 or @font-face, and installing the family system-wide
// just to build an asset would make the output machine-dependent. Chrome reads
// the repo's own font files as data URIs, so the result is reproducible anywhere
// the repo is checked out.
//
// Emits (all transparent-background):
//   logo.webp / logo.png            horizontal lockup, dark text — the default,
//                                   referenced as "logo" in the index.html JSON-LD
//   logo-stacked.png                mark over wordmark — social avatars, watermarks
//   logo-on-dark.png                horizontal lockup with light text

import { writeFile, readFile, mkdir, rm } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { tmpdir } from 'node:os';

import sharp from 'sharp';

import { markSvg, INK } from './brand-mark.mjs';

const run = promisify(execFile);
const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');
const IMG_DIR = join(REPO_ROOT, 'src', 'assets', 'img');
const FONT_DIR = join(REPO_ROOT, 'src', 'assets', 'fonts');

const CHROME = process.env.CHROME_BIN
  || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const MUTED = '#6F6F6F';   // --font-medium-emphasis
const PAPER = '#F5F2EC';

const SCALE = 3;           // render at 3x, downsample for clean edges
const PAGE_W = 1200;
const PAGE_H = 1100;

// Layout boxes on the render page, in CSS pixels. Cropped out individually.
const BOXES = {
  'logo':         { x: 40, y: 40,  w: 720, h: 200 },
  'logo-on-dark': { x: 40, y: 300, w: 720, h: 200 },
  'logo-stacked': { x: 40, y: 560, w: 520, h: 420 },
};

async function fontFace(family, file, style = 'normal', weight = '400 600') {
  const data = await readFile(join(FONT_DIR, file));
  const format = file.endsWith('.woff2') ? 'woff2' : 'truetype';
  const mime = format === 'woff2' ? 'font/woff2' : 'font/ttf';
  return `@font-face{font-family:'${family}';src:url(data:${mime};base64,${data.toString('base64')}) format('${format}');`
       + `font-style:${style};font-weight:${weight};font-display:block;}`;
}

function wordmark(nameColor, tagColor) {
  return `<div class="words">
      <span class="name" style="color:${nameColor}">Victoria Borisova</span>
      <span class="tag" style="color:${tagColor}">Photography</span>
    </div>`;
}

// The mark rendered at a fixed pixel size inside the lockup.
function tile(px) {
  return `<div class="tile" style="width:${px}px;height:${px}px">${markSvg()}</div>`;
}

// Tight bounds of every pixel with meaningful alpha. Returns null if the region
// is entirely transparent.
function alphaBounds(data, width, height, channels, threshold = 8) {
  let minX = width, minY = height, maxX = -1, maxY = -1;

  for (let y = 0; y < height; y++) {
    const row = y * width * channels;
    for (let x = 0; x < width; x++) {
      if (data[row + x * channels + (channels - 1)] <= threshold) continue;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }

  if (maxX < 0) return null;
  return { left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

async function buildPage() {
  const fonts = [
    await fontFace('Cormorant', 'cormorant-latin-italic.woff2', 'italic', '400 500'),
    await fontFace('Overpass', 'Overpass.ttf', 'normal', '400 700'),
  ].join('');

  const box = (id) => {
    const b = BOXES[id];
    return `left:${b.x}px;top:${b.y}px;width:${b.w}px;height:${b.h}px`;
  };

  return `<!doctype html><html><head><meta charset="utf-8"><style>
    ${fonts}
    *{margin:0;padding:0;box-sizing:border-box}
    html,body{width:${PAGE_W}px;height:${PAGE_H}px;background:transparent}
    .lockup{position:absolute;display:flex;align-items:center}
    .lockup.stack{flex-direction:column;justify-content:center;text-align:center}
    .tile{flex:none;display:block}
    .tile svg{width:100%;height:100%;display:block}
    .words{display:flex;flex-direction:column;line-height:1}
    .stack .words{align-items:center}
    /* matches .brand-name / .brand-tag in navigation-desktop.component.css */
    .name{font-family:'Cormorant',Georgia,serif;font-style:italic;font-weight:500;
          font-size:74px;letter-spacing:-0.005em;white-space:nowrap}
    .tag{font-family:'Overpass',system-ui,sans-serif;font-weight:600;font-size:20px;
         letter-spacing:0.4em;text-transform:uppercase;margin-top:14px;padding-left:3px}
    .stack .tag{padding-left:8px}
    #logo .tile,#logo-on-dark .tile{margin-right:34px}
    #logo-stacked .tile{margin-bottom:34px}
  </style></head><body>
    <div class="lockup" id="logo" style="${box('logo')}">${tile(132)}${wordmark(INK, MUTED)}</div>
    <div class="lockup" id="logo-on-dark" style="${box('logo-on-dark')}">${tile(132)}${wordmark(PAPER, '#A8A49C')}</div>
    <div class="lockup stack" id="logo-stacked" style="${box('logo-stacked')}">${tile(168)}${wordmark(INK, MUTED)}</div>
  </body></html>`;
}

async function main() {
  await mkdir(IMG_DIR, { recursive: true });

  const work = join(tmpdir(), `phbyviki-logo-${process.pid}`);
  await mkdir(work, { recursive: true });
  const pagePath = join(work, 'page.html');
  const shotPath = join(work, 'shot.png');

  await writeFile(pagePath, await buildPage(), 'utf8');

  try {
    await run(CHROME, [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      `--user-data-dir=${join(work, 'profile')}`,
      '--default-background-color=00000000', // transparent screenshot
      `--force-device-scale-factor=${SCALE}`,
      `--window-size=${PAGE_W},${PAGE_H}`,
      '--virtual-time-budget=4000',
      `--screenshot=${shotPath}`,
      `file://${pagePath}`,
    ], { timeout: 120000 });
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`Chrome not found at ${CHROME}. Set CHROME_BIN to override.`);
    }
    throw error;
  }

  const meta = await sharp(shotPath).metadata();
  if (meta.width < PAGE_W * SCALE || meta.height < PAGE_H * SCALE) {
    throw new Error(`Screenshot is ${meta.width}x${meta.height}, expected at least `
      + `${PAGE_W * SCALE}x${PAGE_H * SCALE}. Chrome ignored --force-device-scale-factor.`);
  }

  const wrote = [];
  for (const [name, b] of Object.entries(BOXES)) {
    const region = { left: b.x * SCALE, top: b.y * SCALE, width: b.w * SCALE, height: b.h * SCALE };

    // Crop the layout box, find the tight bounds of the drawn pixels, then re-pad
    // evenly. sharp's trim() collapses to an empty area on transparent-edged
    // images, so the bounding box is measured from the alpha channel directly.
    const { data, info } = await sharp(shotPath)
      .extract(region)
      .raw()
      .toBuffer({ resolveWithObject: true });

    const bounds = alphaBounds(data, info.width, info.height, info.channels);
    if (!bounds) {
      throw new Error(`"${name}" is empty at ${JSON.stringify(region)} of a `
        + `${meta.width}x${meta.height} screenshot — the lockup did not draw.\n`
        + `Run with --keep and open the page to check.`);
    }

    const cropped = await sharp(shotPath)
      .extract({
        left: region.left + bounds.left,
        top: region.top + bounds.top,
        width: bounds.width,
        height: bounds.height,
      })
      .extend({ top: 24, bottom: 24, left: 24, right: 24, background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();

    const targets = name === 'logo'
      ? [['png', {}], ['webp', { quality: 92, lossless: false }]]
      : [['png', {}]];

    for (const [format, opts] of targets) {
      const file = join(IMG_DIR, `${name}.${format}`);
      const out = await sharp(cropped)[format]({ ...opts })
        .toFile(file);
      wrote.push([`src/assets/img/${name}.${format}`, `${out.width}x${out.height}`, out.size]);
    }
  }

  if (!process.argv.includes('--keep')) {
    await rm(work, { recursive: true, force: true });
  } else {
    console.log(`Kept render artifacts in ${work}\n`);
  }

  const pad = Math.max(...wrote.map(([p]) => p.length));
  for (const [path, dims, bytes] of wrote) {
    console.log(`  ${path.padEnd(pad)}  ${dims.padStart(10)}  ${(bytes / 1024).toFixed(1)} KB`);
  }
  console.log(`\nWrote ${wrote.length} files. logo.webp is referenced as "logo" in the index.html JSON-LD.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
