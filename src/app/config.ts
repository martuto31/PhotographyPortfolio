// Public base URL of the R2 bucket (custom domain recommended, e.g. https://images.phbyviki.com).
// During testing you can temporarily use the bucket's https://<id>.r2.dev URL.
// No credentials live here — the bucket is public; images are plain URLs.
export const IMAGE_BASE_URL = 'https://images.phbyviki.com';

export const MANIFEST_URL = `${IMAGE_BASE_URL}/manifest.json`;

// Build a public image URL from a manifest gallery prefix + filename, encoding
// each path segment (handles spaces / & / Cyrillic in gallery folder names).
export function imageUrl(prefix: string, file: string): string {
  const path = prefix
    .split('/')
    .map(encodeURIComponent)
    .join('/');
  return `${IMAGE_BASE_URL}/${path}/${encodeURIComponent(file)}`;
}
