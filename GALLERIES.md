# How galleries work (R2 manifest-driven)

This explains how the gallery pages get their content, the decisions we made, and
exactly what you do to add / change / remove a gallery. Read this before touching
gallery code or wondering "why didn't my upload show up".

## The two layers

There are two different screens, and **both now read from R2** — nothing about the
galleries is hardcoded in the app anymore.

| Screen | Component | Source |
|---|---|---|
| Category page — the grid of subgallery **cards** (e.g. `/galerii/svatbi`) | `galleries-cards.component.ts` | `manifest.json` in R2 |
| A single subgallery — the **photo grid** (e.g. `/galeriya/svatbi/Натали и Валентин`) | `gallery.component.ts` | `manifest.json` in R2 |

Before this change the card list + cover thumbnails were hardcoded arrays in
`galleries-cards.component.ts`, so uploading images to R2 never changed which
subgalleries appeared. That is fixed: **the cards are now generated from the
manifest**, so an upload is all it takes.

## How a card is built

For category type `T` (Weddings, Graduates, Personal, …) the page lists every
manifest prefix that starts with `T/`. For each one:

- **Card title** = the part after `T/` (the raw folder name, e.g. `Натали и Валентин`).
- **Cover image** = **`cover.webp` if that file exists in the gallery, otherwise the
  first image** (natural sort order).
- **Link** = `/galeriya/<slug>/<title>` which resolves back to the manifest key.

### Decision: cover = `cover.webp`, else first image

We chose this so cards are fully automatic **and** you can still control the cover:
drop a file named `cover.*` (any image) into a gallery folder before publishing and
the pipeline turns it into `cover.webp`; that becomes the card cover and is **hidden
from the photo grid** inside the gallery (so it isn't shown twice). No code change ever.

If you don't add a `cover.*`, the first photo (alphabetically/naturally) is used.

## Adding a new gallery (the whole flow)

1. Put originals in `to-upload/<Type>/<Gallery Name>/` — `<Type>` must be one of the
   English keys: `Weddings, Graduates, Personal, Baptisms, Corporate, Birthdays, Family`.
   Optionally add a `cover.jpg` (or any `cover.*`) to pick the card thumbnail.
2. `npm run publish` (encodes → uploads to R2 → rebuilds `manifest.json`).
   - Parallel uploads: `npm run publish -- --concurrency 8` (default 6).
   - Only stage NEW galleries in `to-upload/`; the manifest is rebuilt from the whole
     bucket, so existing galleries are preserved without re-uploading them.
3. Deploy the site: `npm run deploy`.

That's it — no code edits to add galleries.

## Removing / renaming

- **No deletes happen automatically.** Removing a folder from `to-upload/` does NOT
  remove it from R2 or the manifest. To remove a photo or a whole gallery: delete the
  object(s) in the Cloudflare R2 dashboard, then run `npm run publish -- --manifest-only`
  to refresh the manifest, then `npm run deploy`.
- Renaming a photo file = a new object next to the old one (no replace). Same cleanup
  applies.

## Required one-time setup: R2 CORS

The browser fetches `manifest.json` cross-origin (`phbyviki.com` → `images.phbyviki.com`).
Without a CORS policy on the bucket the fetch is blocked and **both the cards and the
photos come up empty** (no error shown to visitors). Set this once in
**Cloudflare dash → R2 → bucket → Settings → CORS Policy**:

```json
[
  {
    "AllowedOrigins": ["https://phbyviki.com", "https://www.phbyviki.com", "http://localhost:4200"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

`localhost:4200` is included so the cards/photos also work when running `ng serve` locally.

## Gotchas

- **Cards/photos empty after deploy?** 99% of the time it's the CORS policy above.
  Note the policy shown above is the *intended* one — as of 2026-07-31 the live bucket
  answers only `https://phbyviki.com`, so photo grids are empty on localhost. Card covers
  still render locally because they come from the build-time snapshot, not a `fetch`.
- The manifest is served `no-cache`, so updates show immediately — no cache busting needed.

## SEO: run `npm run sitemap` after publishing

`npm run publish` puts photos in R2, but two build inputs are derived from the manifest and
must be regenerated before deploying:

```sh
npm run sitemap      # rewrites src/sitemap.xml, prerender-routes.txt, src/app/generated/galleries.ts
```

- **`src/sitemap.xml`** — home, about, every non-empty category, and **one URL per gallery**
  (with `<image:image>` entries for Google Images). Categories with no photos are left out
  on purpose: submitting empty pages reads as thin content.
- **`src/app/generated/galleries.ts`** — a build-time copy of the card lists, so the
  prerendered `/galerii/*` HTML contains a real `<a href>` per gallery. Without it the grid
  only exists after JS runs, and the galleries are invisible to most crawlers.
- **`prerender-routes.txt`** — only the categories that actually have content.

At runtime the live manifest still wins, so a gallery published without re-running this
appears on the site immediately; it just won't be in the sitemap or the static HTML until
the next `npm run sitemap && npm run deploy`.
