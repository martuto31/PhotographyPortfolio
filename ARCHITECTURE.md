# Photography Portfolio — how everything works

A single-page Angular site for **Виктория Борисова (phbyviki)**, a wedding/event
photographer in Sofia & Vidin, Bulgaria. This file is the orientation map: read it
first (human or AI) before changing anything. Deeper topics link out to focused docs.

- **Galleries / image system →** [`GALLERIES.md`](./GALLERIES.md)
- **Image publish pipeline →** [`tools/README.md`](./tools/README.md)
- **R2 setup details →** [`tools/R2-GUIDE.md`](./tools/R2-GUIDE.md)

---

## 1. Stack at a glance

| Concern | Choice |
|---|---|
| Framework | Angular 17, **standalone components** (no NgModules) |
| Rendering | Client SPA + **SSR/prerendering** via `@angular/ssr` (static prerender of fixed routes) |
| Hosting | **Firebase Hosting** (two sites — see §6) |
| Images | **Cloudflare R2** public bucket, runtime `manifest.json` (no images in the app bundle) |
| Styling | Plain CSS — global stylesheets in `src/app/styles/` + per-component CSS |
| Language | UI is in **Bulgarian**; internal type keys are English (`Weddings`, `Graduates`, …) |

There is **no backend / database / API**. Content is either compiled into the app
(text, layout) or fetched at runtime from R2 (gallery images via the manifest).

---

## 2. Project layout

```
src/
  index.html              # <head>, fonts preconnect, JSON-LD structured data
  app/
    app.routes.ts         # all routes (BG canonical + legacy EN redirects)
    app.config.ts         # router + hydration providers (client)
    app.config.server.ts  # SSR providers
    config.ts             # R2 image config: IMAGE_BASE_URL, imageUrl(), fetchManifest(), COVER_FILENAME
    components/
      landing/            # home page
        intro-section/    #   hero
        projects/         #   featured work strip
      galleries-cards/    # category page: grid of subgallery CARDS (manifest-driven)
      gallery/            # single subgallery: the PHOTO grid + lightbox modal (manifest-driven)
      about-me/
      contact-me/
      layout/             # shell: header/footer/navigation wrapping routed pages
        footer/
        navigation/
          navigation-desktop/
          navigation-mobile/
    services/
      dimension.service.ts  # responsive helper (isMobile / isDesktop)
      seo.service.ts        # sets <title>/<meta> per route from assets/seo.json
    styles/                 # global CSS: variables, fonts, headings, buttons, global
  assets/
    seo.json              # per-route meta (title/description/keywords/ogImage)
    sitemap.xml, robots.txt
    fonts/                # Cormorant (self-hosted woff2, latin + cyrillic)
    img/                  # bundled UI imagery (hero, landing) — NOT gallery photos
tools/
  publish.mjs             # image pipeline (resize→webp→upload R2→rebuild manifest)
  .env / .env.example     # R2 credentials (gitignored) — never reach the browser
prerender-routes.txt      # routes statically prerendered at build time
firebase.json, .firebaserc
redirect-empty/.gitkeep   # placeholder dir for the redirect hosting target (see §6)
```

---

## 3. Routing (`src/app/app.routes.ts`)

Bulgarian routes are **canonical**; old English routes **redirect** to them for SEO continuity.
Route params bind directly to component `@Input()`s via `withComponentInputBinding()`.

| Path | Component | Notes |
|---|---|---|
| `/` | landing | home |
| `/galerii/:galleryType` | galleries-cards | category page, e.g. `/galerii/svatbi` |
| `/galeriya/:galleryType/:galleryName` | gallery | a subgallery, e.g. `/galeriya/svatbi/Натали и Валентин` |
| `/galeriya/:galleryName` | gallery | legacy one-segment form (`svatbi%2FНатали и Валентин`) |
| `/about-me` | about-me | |
| `/galleries/*`, `/gallery/*` | (redirects) | legacy EN → BG equivalents |
| `**` | not-found | catch-all; see §5 on 404 handling |

The single-gallery routes deliberately declare **no static `title`** — the title depends on
the URL, so `SEOService` owns it. Angular's `TitleStrategy` only overrides routes that
declare one.

**Slug ↔ type mapping** lives in two places that must stay in sync:
`SLUG_TO_TYPE` in `galleries-cards.component.ts` and `translateSlugToS3Prefix()` in
`gallery.component.ts`. Slugs: `svatbi=Weddings, abiturienti=Graduates, lichni=Personal,
krushteneta=Baptisms, korporativni=Corporate, rojdeni-dni=Birthdays, semeyni=Family`.

---

## 4. The image / gallery system (the important part)

Full detail in [`GALLERIES.md`](./GALLERIES.md). Summary:

- Gallery photos live in a **public Cloudflare R2 bucket** at `images.phbyviki.com`,
  **not** in the app bundle. No credentials ship to the browser — the bucket is public.
- A `manifest.json` in R2 maps `"<Type>/<Gallery>"` → list of image filenames. Both the
  **category cards** (`galleries-cards`) and the **photo grid** (`gallery`) are built from it.
- Adding photos = run the publish pipeline; **no code change, no redeploy** of code logic
  needed for new galleries to appear (you do redeploy if you want prerendered HTML fresh).
- Card cover = `cover.webp` in the folder if present, else the first image.
- `src/app/config.ts` is the single source of truth for the image base URL and the shared
  `fetchManifest()` / `imageUrl()` / `COVER_FILENAME` helpers.

**One required setup step:** the R2 bucket needs a **CORS policy** allowing `GET` from
`https://phbyviki.com` (+ `http://localhost:4200` for dev). Without it the manifest fetch
is blocked and galleries silently show empty. JSON is in `GALLERIES.md`.

### Publishing images
```sh
cp tools/.env.example tools/.env     # one-time: fill in R2 credentials
# stage NEW galleries under  to-upload/<Type>/<Gallery>/
npm run publish                      # resize→webp→upload→rebuild manifest
npm run publish -- --concurrency 8   # parallel (default 6)
npm run publish -- --manifest-only   # just rebuild manifest from current bucket
```
See [`tools/README.md`](./tools/README.md). Deletions are manual (R2 dashboard) — the
pipeline never deletes.

---

## 5. SEO

- `src/index.html` — global `<head>`, Cormorant font preconnect, and **JSON-LD**
  structured data (LocalBusiness + service Offers pointing at the `/galerii/*` URLs).
- `services/seo.service.ts` — on each route change, sets `<title>`/`<meta>` from
  `src/assets/seo.json` (keyed by path).
- `src/sitemap.xml` + `robots.txt` — served as static assets (see Firebase headers).
- `prerender-routes.txt` — every route prerendered to static HTML at build time.

### Generated from the manifest — run `npm run sitemap`

`tools/generate-sitemap.mjs` reads the live R2 manifest and rewrites three files. **Run it
after `npm run publish` and before `npm run deploy`:**

| Generated file | Purpose |
|---|---|
| `src/sitemap.xml` | home, about, non-empty categories, one URL per gallery + `<image:image>` entries |
| `prerender-routes.txt` | the same set of routes, so all 31 galleries prerender |
| `src/app/generated/galleries.ts` | build-time card list, so prerendered category pages contain a real `<a href>` per gallery |

Categories with no photos in the manifest are **excluded on purpose** — an empty category
prerenders to a heading over blank space and reads as thin content.

Gallery cards render from the snapshot synchronously (server + client), then refresh from the
live manifest on the client — so newly published galleries appear without a redeploy, while
crawlers still get real links. `SEOService` derives per-gallery `<title>`/description/canonical
from the URL.

### 404s

Firebase rewrites are **scoped to known path prefixes** so unknown top-level URLs fall
through to `src/404.html` with a real HTTP 404 status. A `**` Angular route covers unknown
paths *inside* a valid prefix (e.g. `/galerii/nesushtestvuvasht`); `SEOService` emits
`noindex` for those. Before this, `**` → `index.html` returned 200 with an empty body — a
soft 404 on every bogus URL.

### Careful with these

- **Never `@defer` content carrying internal links or primary copy** — deferred blocks are
  skipped during prerender, so crawlers see nothing. This previously hid the entire
  portfolio section (and every link to `/galerii/*`) from the homepage HTML.
- **Anything clickable that should be crawlable must be `<a routerLink>`** — `routerLink` on
  a `<div>` renders no `href`, which orphaned all 31 galleries.

When adding a new service category, update: `SLUG_TO_TYPE`, `TYPE_TO_SLUG` in
`tools/generate-sitemap.mjs`, `seo.json`, the JSON-LD offers in `index.html`, and
`GALLERY_TYPE_COPY` / `TYPE_HEADING` for gallery-page wording. The sitemap and prerender
routes then follow automatically once the manifest has content.

---

## 6. Hosting & deploy (Firebase)

`firebase.json` defines **two hosting targets** (`.firebaserc` maps them to sites):

| Target | Firebase site | Role |
|---|---|---|
| `app` | `phbyvikiprod` | the real site; serves `dist/photography-portfolio/browser` |
| `redirect` | `phbyviki` | serves nothing — 301-redirects every path to `https://phbyviki.com/:path` |

The `redirect` target's `public` folder is `redirect-empty/`, intentionally empty.
Git can't track empty dirs and Firebase requires the dir to exist, so
`redirect-empty/.gitkeep` is a zero-byte placeholder keeping the folder in the repo.

**Cache headers** (set in `firebase.json`): `index.html` = no-cache (instant deploys),
hashed `js/css/woff2` + images = 1-year immutable, `sitemap/robots` = 1 hour. Security
headers (HSTS, nosniff, Referrer-Policy, Permissions-Policy) applied to all responses.

### Deploy
```sh
npm run deploy            # = ng build && firebase deploy --only hosting  (both targets)
# app only:
npm run build && firebase deploy --only hosting:app
```
If auth fails, run `firebase login` first. **Auto-deploy on push to `prod` is a planned
GitHub Action — not set up yet.**

---

## 7. Common tasks → where to go

| I want to… | Do this |
|---|---|
| Add/replace photos in a gallery | `to-upload/<Type>/<Gallery>/`, `npm run publish`, `npm run sitemap`, `npm run deploy` |
| Pick a gallery's card cover | drop a `cover.*` into its folder before publishing |
| Add a brand-new service category | update `SLUG_TO_TYPE`, `seo.json`, `sitemap.xml`, JSON-LD, `prerender-routes.txt` |
| Change page meta/title | `src/assets/seo.json` |
| Change the images domain | `IMAGE_BASE_URL` in `src/app/config.ts` (+ `index.html` preconnect) |
| Galleries show empty in browser | check the R2 **CORS** policy (§4) |
| Run locally | `npm start` (needs R2 CORS to include `localhost:4200`) |
| Deploy | `npm run deploy` |

---

## 8. Gotchas

- **Empty galleries/cards after deploy** → almost always the missing R2 CORS policy.
- **The pipeline never deletes.** Removing a folder from `to-upload/` does not remove it
  from R2 or the manifest; delete in the R2 dashboard then `--manifest-only`.
- **Filenames are slugified** on upload (lowercased, ascii). Re-exporting a photo under a
  different name uploads a *new* object next to the old one.
- **Two slug maps must agree** (`SLUG_TO_TYPE` and `translateSlugToS3Prefix`).
- **R2 credentials** live only in `tools/.env` (gitignored). They must never appear in the
  app bundle — the public bucket means the site needs no keys at all.
