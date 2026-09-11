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
    content/              # ALL page copy — prose lives here, not in templates
      contact.ts          #   phone / Viber / email / areas + the credentials strip figures
      services.ts         #   per-category service copy, "what's included", FAQ, <title>s
      home.ts             #   the four process steps + the homepage FAQ
      testimonials.ts     #   client quotes — SHIPS EMPTY, see the header comment
    components/
      landing/            # home page
        intro-section/    #   hero
        credentials/      #   the 4+ / 30+ / 24ч strip under the hero
        projects/         #   featured work strip
        process/          #   "how it works", four numbered steps
      galleries-index/    # /galerii — the category index
      galleries-cards/    # category page: subgallery CARDS + the service copy for that category
      gallery/            # single subgallery: PHOTO grid, lightbox, sibling strip
      contact-page/       # /kontakti — contact methods + the form
      about-me/
      contact-me/         # the form itself; [embedded] drops its own heading
      shared/             # used by more than one page
        faq/              #   <details> accordion, no JS
        cta-band/         #   the closing "book a date" band on ink
        testimonials/     #   renders nothing while the list is empty
      layout/             # shell: header/footer/navigation wrapping routed pages
        footer/
        call-bar/         #   fixed phone + Viber bar on handhelds
        navigation/
          navigation-desktop/
          navigation-mobile/
    services/
      dimension.service.ts       # responsive helper (isMobile / isDesktop)
      seo.service.ts             # sets <title>/<meta> per route from assets/seo.json
      structured-data.service.ts # per-route JSON-LD (breadcrumbs, FAQ, Service, ImageGallery)
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
| `/galerii` | galleries-index | the category index |
| `/galerii/:galleryType` | galleries-cards | category page, e.g. `/galerii/svatbi` |
| `/galeriya/:galleryType/:galleryName` | gallery | a subgallery, e.g. `/galeriya/svatbi/Натали и Валентин` |
| `/galeriya/:galleryName` | gallery | legacy one-segment form (`svatbi%2FНатали и Валентин`) |
| `/kontakti` | contact-page | |
| `/about-me` | about-me | |
| `/galleries/*`, `/gallery/*` | (redirects) | legacy EN → BG equivalents |
| `**` | not-found | catch-all; see §5 on 404 handling |

**`/galerii` must be declared before `/galerii/:galleryType`.** The router takes the first
match in declaration order, so the parameterised route would otherwise swallow the index.

The single-gallery and category routes deliberately declare **no static `title`** — the
title depends on the URL, so `SEOService` (galleries) and the component (categories, via
`SERVICE_TITLES`) own it. Angular's `TitleStrategy` only overrides routes that declare one.

Every route that a visitor can reach also needs a matching **rewrite in `firebase.json`**.
The rewrites are scoped rather than a catch-all (see §5 on 404s), so a new top-level route
without one returns a hard 404 in production while working perfectly in `npm start`.

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

- `src/index.html` — global `<head>`, Cormorant font preconnect, hero preload, and the
  **site-wide JSON-LD** (LocalBusiness + WebSite). Inherited by every prerendered page.
- `services/seo.service.ts` — on each route change, sets `<title>`/`<meta>` from
  `src/assets/seo.json` (keyed by path).
- `services/structured-data.service.ts` — **per-route JSON-LD**: BreadcrumbList, FAQPage,
  Service, ImageGallery. Scripts it writes carry `data-page-schema` so they can be cleared
  on navigation without touching the two static graphs. It runs on the server too, so the
  schema lands in the prerendered HTML.
- `src/sitemap.xml` + `robots.txt` — served as static assets (see Firebase headers).
- `prerender-routes.txt` — every route prerendered to static HTML at build time.

Titles are kept **under 60 characters** and descriptions **under ~155**; past that Google
truncates mid-phrase. Category titles live in `SERVICE_TITLES` (`content/services.ts`),
separate from the page copy because they never appear on the page.

There is deliberately **no `Review` or `AggregateRating` markup**. Google has not shown
review rich results for a business's own site since 2019 (self-serving reviews), so it would
buy nothing while making a fabricated entry a policy problem. Stars come from the Google
Business Profile. The on-page testimonials block exists to convince humans.

### Generated from the manifest — `npm run publish` runs `npm run sitemap` for you

`tools/generate-sitemap.mjs` reads the live R2 manifest and rewrites three files. `publish`
ends by running it; run it on its own only if the manifest changed by some other route:

| Generated file | Purpose |
|---|---|
| `src/sitemap.xml` | home, `/galerii`, `/kontakti`, `/about-me`, all 7 categories, one URL per gallery + `<image:image>` entries |
| `prerender-routes.txt` | the same set of routes, so all 31 galleries prerender |
| `src/app/generated/galleries.ts` | build-time card list, so prerendered category pages contain a real `<a href>` per gallery |

**All seven categories are included, with or without photographs.** They used to be
excluded when empty — correctly at the time, because they rendered a heading over blank
space. Each one now carries several hundred words of service copy from `content/services.ts`
plus a FAQ. Leaving them out had a specific cost: `/galerii/krushteneta` and its three
siblings fell through to the SPA shell and served the *prerendered home page* — homepage
`<h1>`, homepage title, canonical pointing at `/` — while the LocalBusiness `makesOffer`
schema advertised all four as services.

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
- **Never navigate with `href="/"` plus a scroll handler.** The nav, hero and footer all did
  this for "Галерия" and "Контакти": no crawlable destination, no URL to send anyone, and
  clicking either from a gallery page threw the visitor back to the home page. Both are real
  routes now. The one remaining in-page scroll is the hero's scroll cue, which points at a
  section of the page the visitor is already on.
- **Breakpoint classes on `.app-container` must be discrete `[class.x]` bindings.** A single
  `[class]="[...]"` array does not clear what it did not write, and the prerendered HTML
  always says `desktop` (there is no window to measure on the server). Phones ended up as
  `app-container desktop home mobile`, so every `:host-context(.desktop)` rule kept applying.

When adding a new service category, update: `SLUG_TO_TYPE`, `TYPE_TO_SLUG` in
`tools/generate-sitemap.mjs`, the `SERVICES` entry + `SERVICE_TITLES` in
`content/services.ts`, `seo.json`, the JSON-LD offers in `index.html`, and
`GALLERY_TYPE_COPY` / `TYPE_HEADING` for gallery-page wording. The sitemap, prerender routes
and both nav/footer link lists then follow automatically.

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
| Add/replace photos in a gallery | `to-upload/<Type>/<Gallery>/`, `npm run publish` (regenerates the sitemap itself), `npm run deploy` |
| Pick a gallery's card cover | drop a `cover.*` into its folder before publishing |
| Add a brand-new service category | see the list at the end of §5 |
| Change any page copy | `src/app/content/*.ts` — prose does not live in templates |
| Add a client testimonial | `src/app/content/testimonials.ts` (read its header first) |
| Change the phone number or email | `src/app/content/contact.ts`, plus the JSON-LD in `index.html` |
| Change page meta/description | `src/assets/seo.json` |
| Change a category `<title>` | `SERVICE_TITLES` in `src/app/content/services.ts` |
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
- **Two slug maps must agree** (`SLUG_TO_TYPE` and `SLUG_TO_PREFIX` in `gallery.component.ts`).
- **A new top-level route needs a `firebase.json` rewrite** or it 404s in production only.
- **Chrome cannot open a window narrower than 500 CSS px on macOS**, so `--window-size=390`
  silently renders at 500 and crops the screenshot. Anything checking the mobile layout has
  to drive `Emulation.setDeviceMetricsOverride` over the DevTools Protocol instead.
- **R2 credentials** live only in `tools/.env` (gitignored). They must never appear in the
  app bundle — the public bucket means the site needs no keys at all.
