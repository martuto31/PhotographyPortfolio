#!/usr/bin/env node
// The site's own photographs - hero, quote, process, category cards, the About
// portrait - served from R2 like the galleries, so a first visit no longer pulls
// ~2.6 MB through Firebase Hosting (Spark plan: 360 MB/day, then the site pauses).
//
//   npm run publish:site
//
// Copies src/assets/img/{hero,card-covers}/*.webp and landing.webp as they are, and
// converts about-me.png to webp on the way, into  site/<same path>  in the bucket
// with a one-year immutable cache. A changed photograph therefore needs a NEW file
// name (hero-lift-2400-v2.webp), or browsers keep the old one for a year. The
// files stay in src/assets/img as the source of truth; angular.json keeps them out
// of the build. Needs the R2 token in tools/.env, like publish.mjs.

import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname, extname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const __dirname = dirname(fileURLToPath(import.meta.url));
const IMG = join(__dirname, '..', 'src', 'assets', 'img');

loadEnv(join(__dirname, '.env'));
const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET } = process.env;
if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET) {
  console.error('tools/.env is missing R2_* values (see tools/.env.example)');
  process.exit(1);
}
const s3 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT || `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
});

const jobs = [];
for (const dir of ['hero', 'card-covers']) {
  for (const file of readdirSync(join(IMG, dir)).filter((f) => f.endsWith('.webp'))) {
    jobs.push({ key: `site/${dir}/${file}`, body: readFileSync(join(IMG, dir, file)), type: 'image/webp' });
  }
}
jobs.push({ key: 'site/landing.webp', body: readFileSync(join(IMG, 'landing.webp')), type: 'image/webp' });
// The About portrait is a 1.4 MB PNG in the repo; the site gets a 1600px webp.
jobs.push({
  key: 'site/about-me.webp',
  body: await sharp(join(IMG, 'about-me.png')).resize(1600, 1600, { fit: 'inside', withoutEnlargement: true }).sharpen({ sigma: 0.6, m1: 0.6, m2: 0.3 }).webp({ quality: 88 }).toBuffer(),
  type: 'image/webp',
});

let total = 0;
for (const job of jobs) {
  await s3.send(new PutObjectCommand({
    Bucket: R2_BUCKET, Key: job.key, Body: job.body, ContentType: job.type,
    CacheControl: 'public, max-age=31536000, immutable',
  }));
  total += job.body.length;
  console.log(`  ↑ ${job.key}  (${(job.body.length / 1024).toFixed(0)} KB)`);
}
console.log(`• ${jobs.length} site image(s), ${(total / 1048576).toFixed(1)} MB → https://images.phbyviki.com/site/`);

function loadEnv(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    const val = m[2].replace(/^["']|["']$/g, '');
    if (!(m[1] in process.env)) process.env[m[1]] = val;
  }
}
