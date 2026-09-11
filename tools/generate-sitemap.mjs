#!/usr/bin/env node
// Regenerates src/sitemap.xml (and the category list in prerender-routes.txt) from the
// live R2 manifest, so the sitemap always matches the photos that actually exist.
//
// Usage:
//   npm run sitemap
//
// Why this is generated rather than hand-written:
//   - Every subgallery (Weddings/Лора и Асен, ...) is its own indexable page. Maintaining
//     ~30 of those by hand guarantees drift.
//   - Categories with no photos yet (Baptisms, Corporate, ...) must stay OUT of the
//     sitemap; submitting empty pages costs crawl budget and reads as thin content.
//     They come back automatically once the manifest has content under their prefix.
//
// Reads the public manifest — no credentials needed.

import { writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');

const SITE_URL = 'https://phbyviki.com';
const MANIFEST_URL = 'https://images.phbyviki.com/manifest.json';
const COVER_FILENAME = 'cover.webp';

// How many photographs of each gallery get compiled into the snapshot. Enough to fill
// the first screen of the grid on every breakpoint (three columns at 1400px), so the
// prerendered page is a real page rather than a heading over blank space. The rest
// arrive from the live manifest on the client.
const SNAPSHOT_PHOTOS = 8;

// Internal type key -> BG URL slug. Mirrors SLUG_TO_TYPE in galleries-cards.component.ts
// (inverted). Keep the two in sync when adding a category.
const TYPE_TO_SLUG = {
  'Weddings': 'svatbi',
  'Graduates': 'abiturienti',
  'Personal': 'lichni',
  'Baptisms': 'krushteneta',
  'Corporate': 'korporativni',
  'Birthdays': 'rojdeni-dni',
  'Family': 'semeyni',
};

// Per-category crawl hints for the category page itself.
const CATEGORY_PRIORITY = {
  'Weddings': { priority: '1.0', changefreq: 'weekly' },
  'Graduates': { priority: '0.9', changefreq: 'weekly' },
  'Personal': { priority: '0.8', changefreq: 'weekly' },
  'Baptisms': { priority: '0.8', changefreq: 'monthly' },
  'Corporate': { priority: '0.8', changefreq: 'monthly' },
  'Birthdays': { priority: '0.7', changefreq: 'monthly' },
  'Family': { priority: '0.7', changefreq: 'monthly' },
};

// Fixed pages that exist regardless of what is in the manifest.
const STATIC_PAGES = [
  { path: '/galerii', priority: '0.9', changefreq: 'weekly' },
  { path: '/kontakti', priority: '0.8', changefreq: 'monthly' },
  { path: '/about-me', priority: '0.6', changefreq: 'monthly' },
  // Legal pages are indexable on purpose — they are a trust signal, and a site
  // whose privacy policy cannot be found reads as one that does not have one.
  // Low priority because they should never outrank a gallery.
  { path: '/poveritelnost', priority: '0.2', changefreq: 'yearly' },
  { path: '/usloviya', priority: '0.2', changefreq: 'yearly' },
];

// Each path segment is encoded separately so "/" stays a real separator while spaces,
// "&" and Cyrillic get percent-encoded. Matches imageUrl() in src/app/config.ts.
function encodePath(path) {
  return path.split('/').map(encodeURIComponent).join('/');
}

// Mirrors galleryImages() in src/app/config.ts: a derivative exists exactly when its
// width is smaller than the full-size photo's, and the full size closes the list at
// its own measured width. Returns '' when the manifest has no dimensions for the
// photo yet, which is the signal for "no srcset attribute at all".
function buildSrcset(manifest, prefix, file) {
  const dims = manifest.dims?.[prefix];
  const index = dims?.files.indexOf(file) ?? -1;
  const size = index === -1 ? null : dims.sizes[index];
  if (!size) {
    return '';
  }

  const base = `https://images.phbyviki.com/${encodePath(prefix)}`;
  const full = `${base}/${encodeURIComponent(file)}`;
  const candidates = (manifest.widths ?? [])
    .filter((width) => width < size[0])
    .map((width) => `${base}/w${width}/${encodeURIComponent(file)} ${width}w`);

  return candidates.length ? [...candidates, `${full} ${size[0]}w`].join(', ') : '';
}

// The first few photographs of a gallery, in the exact shape the component's
// ResponsiveImage takes. Compiled into the app so a prerendered gallery page ships real
// <img> tags: the photo list itself comes from the manifest at runtime, which a crawler
// only sees if it executes JS and waits for a second network request. Width/height are
// the measured full-size pixels, so the browser reserves the right box before the photo
// lands; they are 0 for a photo the publish pipeline has not measured yet, which is the
// signal for "emit no width/height attributes".
function buildPhotos(manifest, gallery, limit) {
  const dims = manifest.dims?.[gallery.prefix];
  const base = `https://images.phbyviki.com/${encodePath(gallery.prefix)}`;

  return gallery.files
    .filter((file) => file !== COVER_FILENAME)
    .slice(0, limit)
    .map((file) => {
      const index = dims?.files.indexOf(file) ?? -1;
      const size = (index === -1 ? null : dims.sizes[index]) ?? [0, 0];
      return {
        src: `${base}/${encodeURIComponent(file)}`,
        srcset: buildSrcset(manifest, gallery.prefix, file),
        width: size[0],
        height: size[1],
      };
    });
}

function xmlEscape(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function urlEntry({ loc, changefreq, priority, images = [] }) {
  const imageTags = images
    .map((image) => `        <image:image>\n            <image:loc>${xmlEscape(image.loc)}</image:loc>\n            <image:title>${xmlEscape(image.title)}</image:title>\n        </image:image>`)
    .join('\n');

  return [
    '    <url>',
    `        <loc>${xmlEscape(loc)}</loc>`,
    `        <changefreq>${changefreq}</changefreq>`,
    `        <priority>${priority}</priority>`,
    imageTags,
    '    </url>',
  ].filter(Boolean).join('\n');
}

async function main() {
  const response = await fetch(MANIFEST_URL, { cache: 'no-cache' });
  if (!response.ok) {
    throw new Error(`Could not fetch manifest: HTTP ${response.status}`);
  }
  const manifest = await response.json();

  // Group manifest prefixes ("Weddings/Лора и Асен") by their type.
  const byType = new Map();
  for (const [prefix, files] of Object.entries(manifest.galleries)) {
    const slashIndex = prefix.indexOf('/');
    if (slashIndex === -1) continue;

    const type = prefix.slice(0, slashIndex);
    const name = prefix.slice(slashIndex + 1);
    if (!TYPE_TO_SLUG[type]) {
      console.warn(`  ! skipping unknown type "${type}" (add it to TYPE_TO_SLUG)`);
      continue;
    }
    if (!files.length) continue;

    if (!byType.has(type)) byType.set(type, []);
    byType.get(type).push({ name, prefix, files });
  }

  const entries = [
    urlEntry({ loc: `${SITE_URL}/`, changefreq: 'weekly', priority: '1.0' }),
  ];

  let galleryCount = 0;

  for (const type of Object.keys(TYPE_TO_SLUG)) {
    const slug = TYPE_TO_SLUG[type];
    const hints = CATEGORY_PRIORITY[type];
    const galleries = byType.get(type);

    // Every category page is indexable now, with or without galleries. They used
    // to be excluded when empty — correctly, because they rendered a heading over
    // blank space — but each one now carries several hundred words of service copy
    // from src/app/content/services.ts, plus a FAQ. The four that were left out
    // are exactly the four the LocalBusiness makesOffer schema has always
    // advertised, so keeping them unindexed made the schema promise pages Google
    // could not reach.
    entries.push(urlEntry({
      loc: `${SITE_URL}/galerii/${slug}`,
      changefreq: hints.changefreq,
      priority: hints.priority,
    }));

    if (!galleries?.length) {
      console.log(`  · ${type}: service page only (no galleries yet)`);
      continue;
    }

    galleries.sort((a, b) => a.name.localeCompare(b.name, 'bg'));

    for (const gallery of galleries) {
      // A handful of representative images per gallery — Google caps what it reads
      // per URL, and the full 154-image list would bloat the file for no gain.
      const images = gallery.files
        .filter((file) => file !== COVER_FILENAME)
        .slice(0, 5)
        .map((file) => ({
          loc: `https://images.phbyviki.com/${encodePath(gallery.prefix)}/${encodeURIComponent(file)}`,
          title: `${gallery.name} - фотограф София и Видин`,
        }));

      entries.push(urlEntry({
        loc: `${SITE_URL}/galeriya/${slug}/${encodePath(gallery.name)}`,
        changefreq: 'monthly',
        priority: '0.7',
        images,
      }));

      galleryCount += 1;
    }

    console.log(`  ✓ ${type}: ${galleries.length} galleries`);
  }

  for (const page of STATIC_PAGES) {
    entries.push(urlEntry({
      loc: `${SITE_URL}${page.path}`,
      changefreq: page.changefreq,
      priority: page.priority,
    }));
  }

  const xml = [
    `<?xml version='1.0' encoding='UTF-8'?>`,
    `<!-- Generated by tools/generate-sitemap.mjs — do not edit by hand. Run: npm run sitemap -->`,
    `<urlset xmlns='http://www.sitemaps.org/schemas/sitemap/0.9'`,
    `        xmlns:image='http://www.google.com/schemas/sitemap-image/1.1'>`,
    '',
    entries.join('\n\n'),
    '',
    '</urlset>',
    '',
  ].join('\n');

  await writeFile(join(REPO_ROOT, 'src', 'sitemap.xml'), xml, 'utf8');

  // Snapshot of the card lists, compiled into the app so the prerendered category pages
  // ship real <a href> links to every gallery. At runtime the component still refreshes
  // from the live manifest, so newly published galleries appear without a redeploy — the
  // snapshot only has to be good enough for the first paint and for crawlers.
  const snapshotEntries = [...byType.entries()].map(([type, galleries]) => {
    const items = galleries.map((gallery) => {
      const cover = gallery.files.includes(COVER_FILENAME) ? COVER_FILENAME : gallery.files[0];
      const coverUrl = `https://images.phbyviki.com/${encodePath(gallery.prefix)}/${encodeURIComponent(cover)}`;
      const srcset = buildSrcset(manifest, gallery.prefix, cover);
      const photos = buildPhotos(manifest, gallery, SNAPSHOT_PHOTOS)
        .map((photo) => `        { src: ${JSON.stringify(photo.src)}, srcset: ${JSON.stringify(photo.srcset)}, width: ${photo.width}, height: ${photo.height} },`)
        .join('\n');
      return [
        `    {`,
        `      name: ${JSON.stringify(gallery.name)},`,
        `      imageSrc: ${JSON.stringify(coverUrl)},`,
        `      imageSrcset: ${JSON.stringify(srcset)},`,
        `      photos: [`,
        photos,
        `      ],`,
        `    },`,
      ].filter((line) => line !== '').join('\n');
    });
    return `  ${JSON.stringify(type)}: [\n${items.join('\n')}\n  ],`;
  });

  const snapshotFile = [
    '// Generated by tools/generate-sitemap.mjs — do not edit by hand. Run: npm run sitemap',
    '//',
    '// Build-time copy of the R2 manifest\'s gallery list, keyed by internal type. Exists so',
    '// prerendered /galerii/* pages contain crawlable links and prerendered /galeriya/* pages',
    '// contain real photographs; the live manifest still wins at runtime (see',
    '// galleries-cards.component.ts and gallery.component.ts).',
    '',
    'export interface SnapshotPhoto {',
    '  src: string;',
    '  // Empty until the photo has responsive derivatives in R2 (npm run publish -- --thumbs).',
    '  srcset: string;',
    '  // Measured full-size pixels, or 0 when the photo has not been measured yet.',
    '  width: number;',
    '  height: number;',
    '}',
    '',
    'export interface GallerySnapshotItem {',
    '  name: string;',
    '  imageSrc: string;',
    '  // Empty until the cover has responsive derivatives in R2 (npm run publish -- --thumbs).',
    '  imageSrcset: string;',
    `  // First ${SNAPSHOT_PHOTOS} photographs, so a prerendered gallery page has real <img> tags.`,
    '  photos: SnapshotPhoto[];',
    '}',
    '',
    'export const GALLERY_SNAPSHOT: Record<string, GallerySnapshotItem[]> = {',
    ...snapshotEntries,
    '};',
    '',
  ].join('\n');

  await writeFile(join(REPO_ROOT, 'src', 'app', 'generated', 'galleries.ts'), snapshotFile, 'utf8');

  // Prerender every route: the fixed pages, all seven categories, and one page per
  // gallery so each ships complete static HTML (unique title/description/canonical/
  // h1/JSON-LD) instead of depending on the crawler executing JS.
  //
  // All seven categories are here, not just the ones with photographs. Without it,
  // /galerii/krushteneta and its three siblings fall through to the SPA shell and
  // serve the prerendered *home page* — homepage h1, homepage title, canonical
  // pointing at "/" — which is what they did before this file listed them.
  //
  // Routes are written unencoded; the builder handles spaces and Cyrillic in the path. If a
  // prerendered file is ever missing, the /galeriya/** rewrite still falls back to the SPA.
  const prerenderRoutes = [
    '/',
    ...STATIC_PAGES.map((page) => page.path),
    ...Object.values(TYPE_TO_SLUG).map((slug) => `/galerii/${slug}`),
    ...[...byType.entries()].flatMap(([type, galleries]) =>
      galleries.map((gallery) => `/galeriya/${TYPE_TO_SLUG[type]}/${gallery.name}`)),
  ];
  await writeFile(join(REPO_ROOT, 'prerender-routes.txt'), prerenderRoutes.join('\n') + '\n', 'utf8');

  console.log(`\nWrote src/sitemap.xml — ${entries.length} URLs (${galleryCount} galleries).`);
  console.log(`Wrote prerender-routes.txt — ${prerenderRoutes.length} routes.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
