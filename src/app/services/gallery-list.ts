import { COVER_FILENAME, GalleryManifest, coverImage } from './../config';
import { GALLERY_SNAPSHOT } from './../generated/galleries';

// One gallery as the wall shows it: a name, a cover, where it links.
export interface GalleryListing {
  name: string;
  imageSrc: string;
  imageSrcset: string;
}

// The build-time snapshot's list for a type - what the prerendered HTML carries,
// so a crawler sees a real <a> and a real <img> per gallery.
export function snapshotGalleries(type: string): GalleryListing[] {
  return (GALLERY_SNAPSHOT[type] ?? []).map(({ name, imageSrc, imageSrcset }) => ({ name, imageSrc, imageSrcset }));
}

// The live manifest's list for a type, so galleries published since the last
// deploy show up without a code change. Name = the folder after "<type>/";
// cover = cover.webp if present, otherwise the first file (the manifest lists
// are already naturally sorted). Galleries without a usable cover are skipped.
export function manifestGalleries(manifest: GalleryManifest, type: string): GalleryListing[] {
  const typePrefix = `${type}/`;
  return Object.keys(manifest.galleries)
    .filter((prefix) => prefix.startsWith(typePrefix))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
    .map((prefix) => {
      const files = manifest.galleries[prefix];
      const cover = files.includes(COVER_FILENAME) ? COVER_FILENAME : files[0];
      const image = cover ? coverImage(manifest, prefix, cover) : null;
      return { name: prefix.slice(typePrefix.length), imageSrc: image?.src ?? '', imageSrcset: image?.srcset ?? '' };
    })
    .filter((gallery) => gallery.imageSrc);
}

// Deals the lists out in turns - first of each, then second of each - so a wall
// of every category reads as a mix rather than thirteen weddings then fourteen
// balls. Order inside a category is kept.
export function interleave<T>(lists: T[][]): T[] {
  const out: T[] = [];
  const longest = Math.max(0, ...lists.map((list) => list.length));
  for (let i = 0; i < longest; i++) {
    for (const list of lists) {
      if (i < list.length) out.push(list[i]);
    }
  }
  return out;
}
