#!/usr/bin/env node
// Publish pipeline: compress local originals -> webp (+ responsive derivatives) -> upload
// to R2 -> rebuild manifest.json.
//
// Usage:
//   1. Put originals in   to-upload/<Type>/<Gallery Name>/*.{jpg,jpeg,png,webp}
//      e.g.               to-upload/Weddings/Krysteena & Martin/DSC_001.jpg
//   2. Fill tools/.env (copy from tools/.env.example)
//   3. npm run publish            # processes ./to-upload then rebuilds the manifest
//      npm run publish -- --dir ./some-other-folder
//      npm run publish -- --thumbs          # backfill derivatives for photos already in R2
//      npm run publish -- --manifest-only   # just rebuild manifest from what's already in R2
//
// The <Type> folder must be the English S3-style prefix the app uses:
//   Weddings, Graduates, Personal, Baptisms, Corporate, Birthdays, Family
// (see SLUG_TO_TYPE in galleries-cards.component.ts).
//
// ---- Responsive derivatives ---------------------------------------------------
// Every photo is also written at each width in THUMB_WIDTHS, into a sibling folder
// named after that width:
//
//   Weddings/Лора и Асен/dsc00066.webp          <- full size, capped at MAX_EDGE
//   Weddings/Лора и Асен/w512/dsc00066.webp     <- 512px wide
//   Weddings/Лора и Асен/w1024/dsc00066.webp
//   Weddings/Лора и Асен/w1600/dsc00066.webp
//
// A derivative is written ONLY when its target width is smaller than the full-size
// image's width, so a file under `w1024/` is always exactly 1024px wide. That is what
// makes the srcset `w` descriptors in the app truthful: the browser is told a
// candidate is 1024w and it really is. The rule is `width < full width`, and the app
// applies the same rule in reverse to decide which URLs to list — so nothing has to
// be recorded per derivative.
//
// What DOES get recorded is the full-size pixel dimensions of each photo, in the
// manifest's `dims` map. Two things need it: the top srcset candidate (the original
// has to declare its real width, which varies — a portrait capped at 2048 tall is
// only ~1365 wide) and the width/height attributes that stop the gallery from
// reflowing as photos arrive.

import { readFileSync, existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import { join, extname, basename, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';
import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ---- config -----------------------------------------------------------------
loadEnv(join(__dirname, '.env'));

const {
  R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET,
} = process.env;

const R2_ENDPOINT =
  process.env.R2_ENDPOINT || `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;

const MAX_EDGE = Number(process.env.MAX_EDGE || 2048); // longest side, px
const WEBP_QUALITY = Number(process.env.WEBP_QUALITY || 82);
const MANIFEST_KEY = 'manifest.json';

// The bucket is public, so reads go over the CDN rather than the S3 API: it is the
// same bytes, it is faster, it costs nothing, and it keeps the API token's job down
// to listing and writing. Mirrors IMAGE_BASE_URL in src/app/config.ts.
const PUBLIC_BASE_URL = (process.env.PUBLIC_BASE_URL || 'https://images.phbyviki.com').replace(/\/+$/, '');

// Widths served to the grid and the cards, smallest first. Sized against the real
// layout: the photo grid is 3 columns inside a 1400px shell (~435 CSS px a column,
// so 512 covers 1x and 1024 covers 2x), and the gallery cards are 2 columns
// (~645 CSS px, so 1600 covers 2x). Changing this list means re-running --thumbs.
const THUMB_WIDTHS = (process.env.THUMB_WIDTHS || '512,1024,1600')
  .split(',')
  .map((w) => Number(w.trim()))
  .filter((w) => w > 0)
  .sort((a, b) => a - b);

// Slightly under WEBP_QUALITY: a derivative is a downscale of an already-lossy
// webp, and downscaling hides most of what the second encode costs.
const THUMB_QUALITY = Number(process.env.THUMB_QUALITY || 80);

// Matches the folder a derivative lives in, e.g. "w1024".
const DERIVATIVE_DIR = /^w(\d+)$/;

const args = process.argv.slice(2);
const manifestOnly = args.includes('--manifest-only');
const thumbsOnly = args.includes('--thumbs');
const dirArg = readFlag(args, '--dir') || join(__dirname, '..', 'to-upload');
// Limits --thumbs to one gallery or one type, e.g. --prefix "Weddings/Лора и Асен".
const prefixArg = readFlag(args, '--prefix') || '';
const SOURCE_DIR = resolve(dirArg);
// How many images to encode+upload at once. Override with --concurrency N or CONCURRENCY env.
const CONCURRENCY = Math.max(
  1,
  Number(readFlag(args, '--concurrency') || process.env.CONCURRENCY || 6)
);

requireEnv({ R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET });
if (!R2_ENDPOINT.startsWith('https://')) {
  fail('Set R2_ENDPOINT or R2_ACCOUNT_ID in tools/.env');
}

const s3 = new S3Client({
  region: 'auto',
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff']);

// Full-size dimensions measured during this run, keyed by object key:
//   "Weddings/Лора и Асен/dsc00066.webp" -> [2048, 1365]
// Folded into the manifest at the end, on top of whatever the previous manifest knew.
const measured = new Map();

// ---- main -------------------------------------------------------------------
async function main() {
  if (thumbsOnly) {
    await backfillDerivatives();
  } else if (manifestOnly) {
    console.log('• Skipping upload (--manifest-only)');
  } else {
    if (!existsSync(SOURCE_DIR)) {
      fail(`Source folder not found: ${SOURCE_DIR}\nCreate it and add  <Type>/<Gallery>/*.jpg  then re-run.`);
    }
    await uploadFolder(SOURCE_DIR);
  }

  await rebuildManifest();
  console.log('\n✓ Done.');
}

// Walk <root>/<Type>/<Gallery>/*.img and upload each as webp under "Type/Gallery/<slug>.webp".
// Images are encoded + uploaded CONCURRENCY-at-a-time (see --concurrency / CONCURRENCY env).
async function uploadFolder(root) {
  const types = await listDirs(root);
  if (types.length === 0) {
    console.log(`No <Type> folders inside ${root} — nothing to upload.`);
    return;
  }

  // Collect every {srcPath, key} task first, then run them through a worker pool.
  const tasks = [];
  for (const type of types) {
    const galleries = await listDirs(join(root, type));
    for (const gallery of galleries) {
      const galleryDir = join(root, type, gallery);
      const files = (await readdir(galleryDir, { withFileTypes: true }))
        .filter((d) => d.isFile() && IMAGE_EXTS.has(extname(d.name).toLowerCase()))
        .map((d) => d.name)
        .sort(naturalCompare);

      for (const file of files) {
        const outName = `${slugifyFile(basename(file, extname(file)))}.webp`;
        // Keep the human-readable Type/Gallery prefix so existing routes resolve.
        tasks.push({ srcPath: join(galleryDir, file), key: `${type}/${gallery}/${outName}` });
      }
    }
  }

  if (tasks.length === 0) {
    console.log(`No images found under ${root} — nothing to upload.`);
    return;
  }

  console.log(`• Uploading ${tasks.length} image(s) with concurrency ${CONCURRENCY}…`);

  const errors = await runPool(tasks, async ({ srcPath, key }) => {
    const source = await readFile(srcPath);
    await uploadImage(source, key);
  });

  console.log(`• Uploaded ${tasks.length - errors.length}/${tasks.length} image(s).`);
  if (errors.length) {
    fail(`${errors.length} image(s) failed to upload; manifest not rebuilt. Fix and re-run.`);
  }
}

// Encode one source image to webp + its derivatives, and PUT them all to R2.
async function uploadImage(source, key) {
  const full = await sharp(source)
    .rotate() // honour EXIF orientation
    .resize(MAX_EDGE, MAX_EDGE, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer({ resolveWithObject: true });

  await putImage(key, full.data);
  console.log(`  ↑ ${key}  (${(full.data.length / 1024).toFixed(0)} KB)`);

  await writeDerivatives(full.data, key, full.info.width, new Set());

  measured.set(key, [full.info.width, full.info.height]);
}

// Write every derivative of `full` that is genuinely smaller than it and is not
// already in `existing`.
async function writeDerivatives(full, key, fullWidth, existing) {
  for (const width of THUMB_WIDTHS) {
    if (width >= fullWidth) {
      continue; // would be an upscale — the app knows not to ask for it
    }

    const target = derivativeKey(key, width);
    if (existing.has(target)) {
      continue;
    }

    const buffer = await sharp(full)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: THUMB_QUALITY })
      .toBuffer();

    await putImage(target, buffer);
  }
}

// Read every full-size photo already in the bucket and write the derivatives it is
// missing. Exists because the bucket was filled before derivatives were a thing;
// after this has run once, uploadImage keeps new photos in step on its own.
async function backfillDerivatives() {
  const objects = await listAllObjects();

  const existing = new Set(objects.map((o) => o.Key));
  const originals = objects
    .map((o) => o.Key)
    .filter((key) => key !== MANIFEST_KEY && !isDerivativeKey(key) && key.includes('/'))
    .filter((key) => !prefixArg || key.startsWith(prefixArg))
    .sort(naturalCompare);

  // A photo can be skipped outright only if the previous manifest already recorded
  // its dimensions AND every derivative those dimensions imply is present. Without
  // the recorded width we have to fetch the photo anyway just to measure it.
  const known = new Map();
  for (const [prefix, entry] of Object.entries((await readManifest())?.dims ?? {})) {
    (entry.files ?? []).forEach((file, i) => {
      const size = entry.sizes?.[i];
      if (size) known.set(`${prefix}/${file}`, size);
    });
  }

  const pending = originals.filter((key) => {
    const size = known.get(key);
    if (!size) {
      return true;
    }
    // Carry the known dimensions forward so a skipped photo keeps its manifest entry.
    measured.set(key, size);
    return THUMB_WIDTHS.some((w) => w < size[0] && !existing.has(derivativeKey(key, w)));
  });

  console.log(
    `• ${originals.length} photo(s) in the bucket; ${pending.length} need derivatives at ${THUMB_WIDTHS.join('/')}px.`
  );

  if (pending.length === 0) {
    return;
  }

  let done = 0;
  const errors = await runPool(pending, async (key) => {
    const full = await getObject(key);
    const meta = await sharp(full).metadata();

    await writeDerivatives(full, key, meta.width, existing);
    measured.set(key, [meta.width, meta.height]);

    done += 1;
    if (done % 25 === 0 || done === pending.length) {
      console.log(`  … ${done}/${pending.length}`);
    }
  });

  console.log(`• Backfilled ${pending.length - errors.length}/${pending.length} photo(s).`);
  if (errors.length) {
    fail(`${errors.length} photo(s) failed; manifest not rebuilt. Fix and re-run --thumbs.`);
  }
}

// List every object in the bucket and group filenames under their gallery prefix.
// Derivative folders are deliberately excluded from `galleries`: the app treats every
// manifest prefix under "Weddings/" as a gallery card, so leaving "Weddings/X/w512"
// in there would invent a card called "X/w512" on the live site.
//
// manifest = {
//   generated, widths,
//   galleries: { "Weddings/Лора и Асен": ["a.webp", ...] },
//   dims:      { "Weddings/Лора и Асен": { files: ["a.webp", ...], sizes: [[2048,1365], ...] } }
// }
async function rebuildManifest() {
  const objects = await listAllObjects();
  const existing = new Set(objects.map((o) => o.Key));

  const galleries = {};
  for (const key of existing) {
    if (key === MANIFEST_KEY || isDerivativeKey(key) || !key.includes('/')) {
      continue;
    }
    (galleries[dirOf(key)] ||= []).push(fileOf(key));
  }

  for (const prefix of Object.keys(galleries)) {
    galleries[prefix].sort(naturalCompare);
  }

  const dims = buildDims(galleries, existing, (await readManifest())?.dims ?? {});

  const manifest = {
    generated: new Date().toISOString(),
    widths: THUMB_WIDTHS,
    galleries,
    dims,
  };

  await s3.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: MANIFEST_KEY,
      Body: JSON.stringify(manifest),
      ContentType: 'application/json',
      CacheControl: 'no-cache', // always fetch fresh so updates show immediately
    })
  );

  const galleryCount = Object.keys(galleries).length;
  const imageCount = Object.values(galleries).reduce((n, a) => n + a.length, 0);
  const sized = Object.values(dims).reduce((n, d) => n + d.sizes.length, 0);
  console.log(
    `• Rebuilt manifest.json — ${galleryCount} galleries, ${imageCount} images, ${sized} with derivatives.`
  );
}

// Merge this run's measurements over the previous manifest's, then keep only the
// photos that still exist AND still have their smallest derivative in the bucket.
// The second check is what makes a hand-deleted derivative self-healing: the photo
// silently drops out of `dims`, the app stops emitting a srcset for it and falls
// back to the full-size file, rather than pointing at a URL that 404s.
function buildDims(galleries, existing, previous) {
  const out = {};

  for (const [prefix, files] of Object.entries(galleries)) {
    const keptFiles = [];
    const keptSizes = [];

    for (const file of files) {
      const key = `${prefix}/${file}`;
      const size = measured.get(key) ?? sizeFromPrevious(previous, prefix, file);
      if (!size) {
        continue;
      }

      const smallest = THUMB_WIDTHS.find((w) => w < size[0]);
      if (smallest !== undefined && !existing.has(derivativeKey(key, smallest))) {
        continue;
      }

      keptFiles.push(file);
      keptSizes.push(size);
    }

    if (keptFiles.length) {
      out[prefix] = { files: keptFiles, sizes: keptSizes };
    }
  }

  return out;
}

function sizeFromPrevious(previous, prefix, file) {
  const entry = previous[prefix];
  if (!entry?.files) {
    return null;
  }
  const i = entry.files.indexOf(file);
  return i === -1 ? null : entry.sizes?.[i] ?? null;
}

// ---- R2 helpers -------------------------------------------------------------
async function putImage(key, body) {
  // Photos never change once published, so they can be cached forever. Covers
  // are overwritten in place under the same `cover.webp` key whenever a gallery
  // gets a new cover, so they must NOT be immutable — give them a short TTL with
  // revalidation so a re-publish shows up within minutes, no manual cache purge.
  const isCover = fileOf(key) === 'cover.webp';

  await s3.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: body,
      ContentType: 'image/webp',
      CacheControl: isCover
        ? 'public, max-age=300, must-revalidate'
        : 'public, max-age=31536000, immutable',
    })
  );
}

async function getObject(key) {
  const url = `${PUBLIC_BASE_URL}/${key.split('/').map(encodeURIComponent).join('/')}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`GET ${url} — ${res.status}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

async function listAllObjects() {
  const out = [];
  let token;
  do {
    const res = await s3.send(
      new ListObjectsV2Command({ Bucket: R2_BUCKET, ContinuationToken: token })
    );
    out.push(...(res.Contents || []));
    token = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (token);
  return out;
}

// The manifest is the only record of full-size dimensions, so a run that touches
// only some photos still needs the previous one. A missing/corrupt manifest is not
// fatal — it just means everything gets re-measured.
async function readManifest() {
  try {
    return JSON.parse((await getObject(MANIFEST_KEY)).toString('utf8'));
  } catch {
    return null;
  }
}

// ---- helpers ----------------------------------------------------------------
function dirOf(key) {
  const i = key.lastIndexOf('/');
  return i === -1 ? '' : key.slice(0, i);
}

function fileOf(key) {
  return key.slice(key.lastIndexOf('/') + 1);
}

function derivativeKey(key, width) {
  return `${dirOf(key)}/w${width}/${fileOf(key)}`;
}

function isDerivativeKey(key) {
  const parent = dirOf(key);
  return DERIVATIVE_DIR.test(fileOf(parent));
}

// Runs `worker` over `tasks` CONCURRENCY at a time. Failures are collected rather
// than thrown so one bad file doesn't abandon the other 900.
async function runPool(tasks, worker) {
  let next = 0;
  const errors = [];

  async function run() {
    while (next < tasks.length) {
      const task = tasks[next++];
      try {
        await worker(task);
      } catch (err) {
        const label = typeof task === 'string' ? task : task.key;
        errors.push({ key: label, message: err.message || String(err) });
        console.error(`  ✗ ${label}  — ${err.message || err}`);
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, tasks.length) }, () => run())
  );

  return errors;
}

async function listDirs(p) {
  if (!existsSync(p)) return [];
  return (await readdir(p, { withFileTypes: true }))
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort(naturalCompare);
}

function slugifyFile(name) {
  return name
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // strip combining diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'img';
}

function naturalCompare(a, b) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

function readFlag(argv, flag) {
  const i = argv.indexOf(flag);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : null;
}

function loadEnv(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    const val = m[2].replace(/^["']|["']$/g, '');
    if (!(m[1] in process.env)) process.env[m[1]] = val;
  }
}

function requireEnv(obj) {
  const missing = Object.entries(obj)
    .filter(([, v]) => !v)
    .map(([k]) => k);
  if (missing.length) fail(`Missing in tools/.env: ${missing.join(', ')}`);
}

function fail(msg) {
  console.error(`\n✗ ${msg}\n`);
  process.exit(1);
}

main().catch((err) => fail(err.stack || String(err)));
