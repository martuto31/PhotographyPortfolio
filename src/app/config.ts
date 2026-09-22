import { HIDDEN_GALLERIES, HIDDEN_TYPES } from './generated/site-target';

// Public base URL of the R2 bucket (custom domain recommended, e.g. https://images.phbyviki.com).
// During testing you can temporarily use the bucket's https://<id>.r2.dev URL.
// No credentials live here — the bucket is public; images are plain URLs.
export const IMAGE_BASE_URL = 'https://images.phbyviki.com';

export const MANIFEST_URL = `${IMAGE_BASE_URL}/manifest.json`;

// The site's own photographs (hero, quote, process, category cards, the About
// portrait) also live in the bucket, under site/ - tools/publish-site-images.mjs
// puts them there. Served from Cloudflare instead of Firebase Hosting, whose Spark
// plan pauses the site after 360 MB a day; these were 2.6 MB of every first visit.
export const SITE_IMAGE_BASE_URL = `${IMAGE_BASE_URL}/site`;

// Build-time copy of the same manifest, written by tools/generate-sitemap.mjs and served
// from this site's own origin. The bucket's CORS policy allows https://phbyviki.com only,
// so on localhost or a Firebase preview channel the live fetch is refused; without this
// a 120-photo wedding shows its 8 seeded photographs and stops. Same-origin, so it can
// never be blocked - and stale by at most one publish, same as the snapshot.
export const MANIFEST_FALLBACK_URL = '/assets/manifest.json';

// A gallery whose file list contains this name uses it as the card cover, and it is
// hidden from the in-gallery photo grid. The publish pipeline lowercases + slugifies
// basenames, so any uploaded `cover.*` always lands as exactly this filename.
export const COVER_FILENAME = 'cover.webp';

// The `sizes` slot every layout uses on a phone, and the one deliberate departure
// from "describe the box truthfully". A photo fills ~94vw there, so a 3x screen would
// ask for ~1100px and be handed the 1600px derivative — four times the bytes of the
// 1024px one, over the slowest connection any visitor has, for a difference nobody can
// see in a photograph on a 6-inch screen. Capping the declared slot at 341px puts
// every phone from 1x to 3x on 512 or 1024 instead. The cap is in px rather than vw
// because a vw ceiling drifts with viewport width and a 430px phone would slip past it.
export const PHONE_SLOT = 'min(94vw, 341px)';

// Measured pixel size of every full-size photo in one gallery. `sizes[i]` belongs to
// `files[i]`. Written by tools/publish.mjs; a photo only appears here once its
// derivatives are actually in the bucket.
export interface GalleryDims {
  files: string[];
  sizes: [number, number][];
}

export interface GalleryManifest {
  generated: string;
  // Derivative widths the publish pipeline produced, smallest first.
  widths?: number[];
  // keyed by "<Type>/<Gallery>" prefix, value is the list of image filenames
  galleries: Record<string, string[]>;
  dims?: Record<string, GalleryDims>;
}

// One <img>'s worth of data. `srcset` is empty for a photo with no derivatives, in
// which case the template must not emit the attribute at all — an empty srcset is
// not the same as an absent one.
export interface ResponsiveImage {
  src: string;
  srcset: string;
  width: number;
  height: number;
}

// Fetch the R2 manifest, live first. Cross-origin to the images domain, so a CORS/network
// failure throws a TypeError (not a non-ok response); either way fall back to the
// same-origin copy, and only if that fails too return null so callers can degrade
// gracefully (snapshot cards/gallery) instead of crashing.
export async function fetchManifest(): Promise<GalleryManifest | null> {
  const manifest = (await fetchManifestFrom(MANIFEST_URL)) ?? (await fetchManifestFrom(MANIFEST_FALLBACK_URL));
  return manifest && withoutHiddenGalleries(manifest);
}

// Galleries kept off the site (content/hidden-galleries.json) stay in the bucket and
// in the live manifest; drop them here so no card, page or sibling list shows them.
// The lists come from generated/site-target.ts: what tools/generate-sitemap.mjs left
// out of the sitemap and snapshot for this build's target (preview or live site).
const HIDDEN = new Set(HIDDEN_GALLERIES.map((prefix) => prefix.normalize('NFC')));

function isHidden(prefix: string): boolean {
  return HIDDEN.has(prefix.normalize('NFC')) || HIDDEN_TYPES.includes(prefix.slice(0, prefix.indexOf('/')));
}

function withoutHiddenGalleries(manifest: GalleryManifest): GalleryManifest {
  const galleries = Object.fromEntries(Object.entries(manifest.galleries).filter(([prefix]) => !isHidden(prefix)));
  return { ...manifest, galleries };
}

async function fetchManifestFrom(url: string): Promise<GalleryManifest | null> {
  try {
    const response = await fetch(url, { cache: 'no-cache' });
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as GalleryManifest;
  } catch {
    return null;
  }
}

// A route segment as the visitor typed or pasted it. The router decodes once; a link
// that went through a chat app or a share sheet often arrives encoded twice
// ("Лора%2520и%2520Асен" → "Лора%20и%20Асен"), and then nothing matches the manifest.
// Decode until the value stops changing. Malformed sequences are left as they are.
export function decodeRouteSegment(raw: string): string {
  let value = raw;
  for (let i = 0; i < 3 && value.includes('%'); i++) {
    try {
      const next = decodeURIComponent(value);
      if (next === value) break;
      value = next;
    } catch {
      break;
    }
  }
  return value;
}

// Build a public image URL from a manifest gallery prefix + filename, encoding
// each path segment (handles spaces / & / Cyrillic in gallery folder names).
export function imageUrl(prefix: string, file: string): string {
  const path = prefix
    .split('/')
    .map(encodeURIComponent)
    .join('/');
  return `${IMAGE_BASE_URL}/${path}/${encodeURIComponent(file)}`;
}

// Turn a gallery's filenames into <img> data with a responsive srcset.
//
// The publish pipeline writes a derivative only when its width is smaller than the
// full-size photo, so "w1024/x.webp exists" and "1024 < full width" are the same
// statement — which is why nothing about the derivatives themselves has to be stored.
// Reading the rule the same way here is what keeps the `w` descriptors honest: a
// candidate advertised as 1024w really is 1024 pixels wide.
//
// The full-size file is the last candidate and carries its own measured width. That
// width is not a constant: the pipeline caps the *longest* edge, so a portrait shot
// tops out around 1365px wide while a landscape one reaches 2048.
export function galleryImages(
  manifest: GalleryManifest | null | undefined,
  prefix: string,
  files: string[],
): ResponsiveImage[] {
  const widths = manifest?.widths ?? [];
  const dims = manifest?.dims?.[prefix];

  // files[] and dims.files[] are both sorted, but they can disagree — a photo
  // uploaded since the last derivative run is in one and not the other.
  const sizeOf = new Map<string, [number, number]>();
  dims?.files.forEach((file, i) => {
    const size = dims.sizes[i];
    if (size) {
      sizeOf.set(file, size);
    }
  });

  return files.map((file) => {
    const src = imageUrl(prefix, file);
    const size = sizeOf.get(file);

    if (!size) {
      return { src, srcset: '', width: 0, height: 0 };
    }

    const [width, height] = size;
    const candidates = widths
      .filter((w) => w < width)
      .map((w) => `${imageUrl(`${prefix}/w${w}`, file)} ${w}w`);

    return {
      src,
      // A lone full-size candidate is no better than plain src — leave it off so the
      // browser doesn't have to parse a srcset that can only resolve one way.
      srcset: candidates.length ? [...candidates, `${src} ${width}w`].join(', ') : '',
      width,
      height,
    };
  });
}

// Single-image convenience wrapper, for the gallery card covers.
export function coverImage(
  manifest: GalleryManifest | null | undefined,
  prefix: string,
  file: string,
): ResponsiveImage {
  return galleryImages(manifest, prefix, [file])[0];
}

// A cover is shown cropped to a fixed box (the wall's 4:5, the sibling cards' 4:3)
// with object-fit: cover. A photograph wider than the box is scaled to the box's
// *height*, so the pixels it needs across are more than the box's width - a 3:2
// landscape in a 4:5 tile needs 1.875x. `sizes` only knows the box width, so the
// browser picked a 512px file for a 790px job and the wall looked soft on any
// 1x monitor. Scale every slot by that factor; a photograph narrower than the box
// is cropped by width and needs nothing extra.
//
// On top of the crop, covers ask for one tier more than they strictly need
// (COVER_OVERSAMPLE): the browser takes the first copy at or above the requested
// width, so +30% pushes a 790px need past the 1024 copy to the 1600 one, and a
// 2x need past 1600 to the full file - the covers are the shop window and Martin
// wants them a step sharper than the maths (2026-09-22). Costs roughly double the
// bytes per cover; the wall is lazy-loaded, so only tiles on screen pay it.
export const COVER_OVERSAMPLE = 1.3;

export function coverSizes(slots: string, boxWidth: number, boxHeight: number, imageWidth: number, imageHeight: number): string {
  const crop = imageWidth && imageHeight ? Math.max(1, (imageWidth / imageHeight) / (boxWidth / boxHeight)) : 1;
  const f = (crop * COVER_OVERSAMPLE).toFixed(3);
  return splitSlots(slots)
    .map((slot) => {
      // "(max-width: 480px) min(94vw, 341px)" -> condition + value; the last slot has no condition.
      const condition = slot.startsWith('(') ? slot.slice(0, slot.indexOf(')') + 1) : '';
      const value = slot.slice(condition.length).trim();
      return `${condition ? condition + ' ' : ''}calc(${value} * ${f})`;
    })
    .join(', ');
}

// Split a `sizes` list on the commas between slots, not the ones inside min()/calc().
function splitSlots(sizes: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < sizes.length; i++) {
    const ch = sizes[i];
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    else if (ch === ',' && depth === 0) {
      out.push(sizes.slice(start, i).trim());
      start = i + 1;
    }
  }
  out.push(sizes.slice(start).trim());
  return out.filter(Boolean);
}
