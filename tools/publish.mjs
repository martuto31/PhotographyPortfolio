#!/usr/bin/env node
// Phase 1 publish pipeline: compress local originals -> webp -> upload to R2 -> rebuild manifest.json
//
// Usage:
//   1. Put originals in   to-upload/<Type>/<Gallery Name>/*.{jpg,jpeg,png,webp}
//      e.g.               to-upload/Weddings/Krysteena & Martin/DSC_001.jpg
//   2. Fill tools/.env (copy from tools/.env.example)
//   3. npm run publish            # processes ./to-upload then rebuilds the manifest
//      npm run publish -- --dir ./some-other-folder
//      npm run publish -- --manifest-only   # just rebuild manifest from what's already in R2
//
// The <Type> folder must be the English S3-style prefix the app uses:
//   Weddings, Graduates, Personal, Baptisms, Corporate, Birthdays, Family
// (see SLUG_TO_TYPE in galleries-cards.component.ts).

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

const args = process.argv.slice(2);
const manifestOnly = args.includes('--manifest-only');
const dirArg = readFlag(args, '--dir') || join(__dirname, '..', 'to-upload');
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

// ---- main -------------------------------------------------------------------
async function main() {
  if (!manifestOnly) {
    if (!existsSync(SOURCE_DIR)) {
      fail(`Source folder not found: ${SOURCE_DIR}\nCreate it and add  <Type>/<Gallery>/*.jpg  then re-run.`);
    }
    await uploadFolder(SOURCE_DIR);
  } else {
    console.log('• Skipping upload (--manifest-only)');
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
  let done = 0;
  let next = 0;
  const errors = [];

  async function worker() {
    while (next < tasks.length) {
      const { srcPath, key } = tasks[next++];
      try {
        await uploadImage(srcPath, key);
        done++;
      } catch (err) {
        errors.push({ key, message: err.message || String(err) });
        console.error(`  ✗ ${key}  — ${err.message || err}`);
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, tasks.length) }, () => worker())
  );

  console.log(`• Uploaded ${done}/${tasks.length} image(s).`);
  if (errors.length) {
    fail(`${errors.length} image(s) failed to upload; manifest not rebuilt. Fix and re-run.`);
  }
}

// Encode one source image to webp and PUT it to R2 under `key`.
async function uploadImage(srcPath, key) {
  const buffer = await sharp(srcPath)
    .rotate() // honour EXIF orientation
    .resize(MAX_EDGE, MAX_EDGE, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();

  // Photos never change once published, so they can be cached forever. Covers
  // are overwritten in place under the same `cover.webp` key whenever a gallery
  // gets a new cover, so they must NOT be immutable — give them a short TTL with
  // revalidation so a re-publish shows up within minutes, no manual cache purge.
  const isCover = key.endsWith('/cover.webp');
  const cacheControl = isCover
    ? 'public, max-age=300, must-revalidate'
    : 'public, max-age=31536000, immutable';

  await s3.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: 'image/webp',
      CacheControl: cacheControl,
    })
  );

  console.log(`  ↑ ${key}  (${(buffer.length / 1024).toFixed(0)} KB)`);
}

// List every object in the bucket and group filenames under their gallery prefix.
// manifest = { generated, galleries: { "Weddings/Krysteena & Martin": ["a.webp", ...] } }
async function rebuildManifest() {
  const galleries = {};
  let token;
  do {
    const res = await s3.send(
      new ListObjectsV2Command({ Bucket: R2_BUCKET, ContinuationToken: token })
    );
    for (const obj of res.Contents || []) {
      const key = obj.Key;
      if (key === MANIFEST_KEY) continue;
      const idx = key.lastIndexOf('/');
      if (idx < 0) continue; // skip root-level objects
      const prefix = key.slice(0, idx);
      const file = key.slice(idx + 1);
      (galleries[prefix] ||= []).push(file);
    }
    token = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (token);

  for (const prefix of Object.keys(galleries)) {
    galleries[prefix].sort(naturalCompare);
  }

  const manifest = { generated: new Date().toISOString(), galleries };
  await s3.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: MANIFEST_KEY,
      Body: JSON.stringify(manifest, null, 2),
      ContentType: 'application/json',
      CacheControl: 'no-cache', // always fetch fresh so updates show immediately
    })
  );
  const galleryCount = Object.keys(galleries).length;
  const imageCount = Object.values(galleries).reduce((n, a) => n + a.length, 0);
  console.log(`• Rebuilt manifest.json — ${galleryCount} galleries, ${imageCount} images.`);
}

// ---- helpers ----------------------------------------------------------------
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
