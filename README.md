# phbyviki.com

Portfolio site for **Виктория Борисова** — wedding and event photographer, Sofia and Vidin.

Angular 17 standalone components, statically prerendered per route, hosted on Firebase
Hosting. Photographs live in a public Cloudflare R2 bucket at `images.phbyviki.com` and are
discovered at runtime through a `manifest.json`, so publishing photos does not require a
code change.

```sh
npm install
npm start          # dev server on :4200
```

> **Working locally:** the R2 bucket's CORS policy allows `https://phbyviki.com` only, so
> the live manifest fetch is refused on localhost and on Firebase preview channels. The
> client then reads the build-time copy at `src/assets/manifest.json` (written by
> `npm run sitemap`), so galleries fill on any origin - stale by at most one publish. Run
> `npm run sitemap` after publishing photos or the local copy drifts.
> See [GALLERIES.md](GALLERIES.md#required-one-time-setup-r2-cors).

## Publishing a new gallery

Three steps. `publish` ends by regenerating the sitemap and prerender inputs itself, so
a gallery cannot end up visible to visitors and invisible to Google.

```sh
# stage originals in to-upload/<Type>/<Gallery Name>/*.jpg

npm run publish     # compress → WebP → upload to R2 → rebuild manifest.json → sitemap
npm run deploy      # build + push to Firebase Hosting
```

Full detail, naming rules, and how to remove or rename a gallery:
**[GALLERIES.md](GALLERIES.md#adding-a-new-gallery--the-whole-flow)**

## Commands

| Command | What it does |
| --- | --- |
| `npm start` | Dev server |
| `npm run build` | Production build + prerender |
| `npm run preview` | Serve the built output locally |
| `npm run deploy` | Build and deploy to Firebase Hosting |
| `npm run publish` | Compress and upload photos to R2, rebuild the manifest, regenerate the sitemap |
| `npm run sitemap` | Regenerate sitemap and prerender inputs from the manifest (publish runs this for you) |
| `npm run icons` | Regenerate favicon / PWA / apple-touch icons |
| `npm run logo` | Regenerate the wordmark lockups |
| `npm run brand` | `icons` + `logo` |

## Editing the words on the site

Page copy does not live in templates. Everything a non-developer is likely to want to change
is in **`src/app/content/`**:

| File | What is in it |
| --- | --- |
| `contact.ts` | Phone, Viber, email, service area, and the `4+ / 30+ / 24ч` figures under the hero |
| `services.ts` | Per-category copy, "what's included", FAQ, and the `<title>` for each category page |
| `home.ts` | The four process steps and the homepage FAQ |
| `testimonials.ts` | Client quotes — **ships empty on purpose**; read the header before adding any |

Meta descriptions are separate, in `src/assets/seo.json`.

## Docs

| | |
| --- | --- |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Routes, rendering, SEO services, hosting config, and the traps that make pages uncrawlable |
| [GALLERIES.md](GALLERIES.md) | How galleries work, publishing runbook, R2 setup, gotchas |
| [BRAND.md](BRAND.md) | The mark, generated icon/logo assets, how to change the brand |

## Things that bite

- **Anything crawlable must be `<a routerLink>`.** `routerLink` on a `<div>` renders no
  `href`, so the target becomes an orphan page.
- **Never wrap link-carrying content in `@defer`.** Deferred blocks do not render during
  prerender, so the links are missing from the static HTML.
- **Never navigate with `href="/"` plus a scroll handler.** No crawlable destination, no URL
  to share, and it throws the visitor home from any other page.
- **A new top-level route also needs a rewrite in `firebase.json`.** Without one it works in
  `npm start` and returns a hard 404 in production.
- **`npm run publish` regenerates the sitemap itself.** `npm run sitemap` alone is only for
  when the manifest changed by some other route.
