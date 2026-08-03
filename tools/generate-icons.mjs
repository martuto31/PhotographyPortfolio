#!/usr/bin/env node
// Draws the brand mark once and emits every icon the site needs.
//
// Usage:
//   npm run icons
//
// The mark is a six-blade lens iris — a disc with a hexagonal opening and six
// tangential blade separations — in candlelight amber on warm near-black. It is
// defined here as geometry rather than shipped as a binary so it stays editable:
// change RADIUS/OPENING/colours below and re-run.
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

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');
const IMG_DIR = join(REPO_ROOT, 'src', 'assets', 'img');

// ---- brand constants --------------------------------------------------------
const INK = '#191817';   // warm near-black; also the <meta name="theme-color">
const AMBER = '#D8A64A'; // candlelight amber, sampled from the hero photograph

const BOX = 512;
const CORNER = 116;      // ~22.6% — reads as a rounded chip even at 16px
const RADIUS = 182;      // outer radius of the iris disc
const OPENING = 80;      // circumradius of the hexagonal opening
const BLADE_W = 15;      // width of the separations between blades

// ---- geometry ---------------------------------------------------------------
function polar(radius, degrees, cx = BOX / 2, cy = BOX / 2) {
  const a = ((degrees - 90) * Math.PI) / 180;
  return [cx + radius * Math.cos(a), cy + radius * Math.sin(a)];
}

// scale: shrinks the mark within the same box, for the maskable safe zone
function iris({ scale = 1, cx = BOX / 2, cy = BOX / 2 } = {}) {
  const R = RADIUS * scale;
  const r = OPENING * scale;

  const hex = Array.from({ length: 6 }, (_, i) =>
    polar(r, i * 60, cx, cy).map((n) => n.toFixed(1)).join(',')
  ).join(' ');

  // Each separation runs outward from a hexagon vertex at a tangential angle.
  // Radial lines would read as a star; the 38 degree offset is what makes it a lens.
  const blades = Array.from({ length: 6 }, (_, i) => {
    const [hx, hy] = polar(r, i * 60, cx, cy);
    const [ex, ey] = polar(R + 6 * scale, i * 60 + 38, cx, cy);
    return `<line x1="${hx.toFixed(1)}" y1="${hy.toFixed(1)}" x2="${ex.toFixed(1)}" y2="${ey.toFixed(1)}"`
         + ` stroke="${INK}" stroke-width="${(BLADE_W * scale).toFixed(1)}"/>`;
  }).join('');

  return `<circle cx="${cx}" cy="${cy}" r="${R.toFixed(1)}" fill="${AMBER}"/>`
       + `<polygon points="${hex}" fill="${INK}"/>${blades}`;
}

function markSvg({ corner = CORNER, scale = 1 } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${BOX} ${BOX}" width="${BOX}" height="${BOX}">`
       + `<rect width="${BOX}" height="${BOX}" rx="${corner}" ry="${corner}" fill="${INK}"/>`
       + iris({ scale })
       + `</svg>`;
}

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
