// Public base URL of the R2 bucket (custom domain recommended, e.g. https://images.phbyviki.com).
// During testing you can temporarily use the bucket's https://<id>.r2.dev URL.
// No credentials live here — the bucket is public; images are plain URLs.
export const IMAGE_BASE_URL = 'https://images.phbyviki.com';

export const MANIFEST_URL = `${IMAGE_BASE_URL}/manifest.json`;

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

// Fetch the R2 manifest. Cross-origin to the images domain, so a CORS/network
// failure throws a TypeError (not a non-ok response) — return null so callers can
// degrade gracefully (empty cards/gallery) instead of crashing.
export async function fetchManifest(): Promise<GalleryManifest | null> {
  try {
    const response = await fetch(MANIFEST_URL, { cache: 'no-cache' });
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as GalleryManifest;
  } catch {
    return null;
  }
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
