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

> **Heads up when working locally:** the R2 bucket's CORS policy allows `https://phbyviki.com`
> only, so photo grids come up **empty on localhost**. Card covers still render because they
> come from a build-time snapshot. Verify gallery work against production, or add a localhost
> origin to the bucket's CORS policy. See [GALLERIES.md](GALLERIES.md#required-one-time-setup-r2-cors).

## Publishing a new gallery

All four steps are required. Skipping `sitemap` leaves the gallery visible to visitors and
invisible to Google.

```sh
# stage originals in to-upload/<Type>/<Gallery Name>/*.jpg

npm run publish     # compress → WebP → upload to R2 → rebuild manifest.json
npm run sitemap     # regenerate sitemap.xml, prerender-routes.txt, generated/galleries.ts
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
| `npm run publish` | Compress and upload photos to R2, rebuild the manifest |
| `npm run sitemap` | Regenerate sitemap and prerender inputs from the manifest |
| `npm run icons` | Regenerate favicon / PWA / apple-touch icons |
| `npm run logo` | Regenerate the wordmark lockups |
| `npm run brand` | `icons` + `logo` |

## Docs

| | |
| --- | --- |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Routes, rendering, SEO service, hosting config, and the traps that make pages uncrawlable |
| [GALLERIES.md](GALLERIES.md) | How galleries work, publishing runbook, R2 setup, gotchas |
| [BRAND.md](BRAND.md) | The mark, generated icon/logo assets, how to change the brand |

## Things that bite

- **Anything crawlable must be `<a routerLink>`.** `routerLink` on a `<div>` renders no
  `href`, so the target becomes an orphan page.
- **Never wrap link-carrying content in `@defer`.** Deferred blocks do not render during
  prerender, so the links are missing from the static HTML.
- **Re-run `npm run sitemap` after every publish.** See above.
