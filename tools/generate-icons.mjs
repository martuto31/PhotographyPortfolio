#!/usr/bin/env node
// Emits every icon the site needs from the shared brand mark in brand-mark.mjs.
//
// Usage:
//   npm run icons
//
// The mark is geometry rather than a committed binary so it stays editable —
// change the constants in brand-mark.mjs and re-run.
//
// Why this many files:
//   favicon.ico          16/32/48 raster, still what desktop browsers reach for first
//   icon.svg             vector, what modern browsers prefer — crisp at any DPI
//   apple-touch-icon.png 180px, square: iOS applies its own squircle mask, so
//                        baking in rounded corners would double-round it
//   icon-192/512.png     PWA / Android home screen, referenced by site.webmanifest
//   maskable-512.png     Android adaptive icons crop to a circle; this variant
//                        keeps the mark inside the 80% safe zone on a full bleed

import { writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

import { markSvg } from './brand-mark.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');
const IMG_DIR = join(REPO_ROOT, 'src', 'assets', 'img');

const png = (svg, size) => sharp(Buffer.from(svg)).resize(size, size).png({ compressionLevel: 9 }).toBuffer();

// ---- .ico encoder -----------------------------------------------------------
// ICO is a 6-byte directory, a 16-byte entry per image, then the payloads. PNG
// payloads are legal since Vista and understood by every browser we care about,
// so there is no need to emit BMP+AND-mask.
function encodeIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // 1 = icon
  header.writeUInt16LE(images.length, 4);

  const entries = [];
  let offset = 6 + images.length * 16;

  for (const { size, data } of images) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0); // 0 means 256
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt8(0, 2);  // palette size
    entry.writeUInt8(0, 3);  // reserved
    entry.writeUInt16LE(1, 4);  // colour planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    entries.push(entry);
    offset += data.length;
  }

  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

// ---- emit -------------------------------------------------------------------
async function main() {
  await mkdir(IMG_DIR, { recursive: true });

  const svg = markSvg();
  const wrote = [];

  const record = async (path, data) => {
    await writeFile(path, data);
    wrote.push([path.replace(REPO_ROOT + '/', ''), data.length]);
  };

  // vector icon — the one modern browsers prefer
  await record(join(IMG_DIR, 'icon.svg'), Buffer.from(svg, 'utf8'));

  // multi-size .ico at the web root
  const ico = encodeIco(await Promise.all(
    [16, 32, 48].map(async (size) => ({ size, data: await png(svg, size) }))
  ));
  await record(join(REPO_ROOT, 'src', 'favicon.ico'), ico);

  // PWA / Android
  await record(join(IMG_DIR, 'icon-192.png'), await png(svg, 192));
  await record(join(IMG_DIR, 'icon-512.png'), await png(svg, 512));

  // iOS masks this itself, so ship it square
  await record(join(IMG_DIR, 'apple-touch-icon.png'), await png(markSvg({ corner: 0 }), 180));

  // Android adaptive icons crop to a circle — keep the mark inside the safe zone
  await record(join(IMG_DIR, 'maskable-512.png'), await png(markSvg({ corner: 0, scale: 0.72 }), 512));

  const pad = Math.max(...wrote.map(([p]) => p.length));
  for (const [path, bytes] of wrote) {
    console.log(`  ${path.padEnd(pad)}  ${(bytes / 1024).toFixed(1)} KB`);
  }
  console.log(`\nWrote ${wrote.length} icons. Referenced from src/index.html, src/404.html and src/site.webmanifest.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
