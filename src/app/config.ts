// Public base URL of the R2 bucket (custom domain recommended, e.g. https://images.phbyviki.com).
// During testing you can temporarily use the bucket's https://<id>.r2.dev URL.
// No credentials live here — the bucket is public; images are plain URLs.
export const IMAGE_BASE_URL = 'https://images.phbyviki.com';

export const MANIFEST_URL = `${IMAGE_BASE_URL}/manifest.json`;

// A gallery whose file list contains this name uses it as the card cover, and it is
// hidden from the in-gallery photo grid. The publish pipeline lowercases + slugifies
// basenames, so any uploaded `cover.*` always lands as exactly this filename.
export const COVER_FILENAME = 'cover.webp';

export interface GalleryManifest {
  generated: string;
  // keyed by "<Type>/<Gallery>" prefix, value is the list of image filenames
  galleries: Record<string, string[]>;
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
