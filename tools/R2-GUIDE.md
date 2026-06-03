# R2 image hosting — full guide

How gallery images work after the S3 → Cloudflare R2 migration, plus all the setup and
"how do I…" answers in one place.

---

## How it works (the short version)

- Images live in a **public R2 bucket**, served from `https://images.phbyviki.com` (Cloudflare CDN, **zero egress cost**).
- No AWS/R2 credentials in the website. The bucket is public; images are plain URLs.
- A `manifest.json` in the bucket lists which photos belong to which gallery. The site fetches it at runtime.
- **Result: adding/changing photos = run one script. No code change, no redeploy.**
- The only place keys exist is `tools/.env` on your machine (gitignored, never shipped).

Files that make this work: `tools/publish.mjs` (the pipeline), `src/app/config.ts` (`IMAGE_BASE_URL`), `gallery.component.ts` (fetches the manifest).

---

## One-time Cloudflare setup (3 steps before it works live)

Your DNS zone is already on Cloudflare, so the custom domain is easy.

### Step 1 — Make the bucket public via the subdomain
Cloudflare Dashboard → **R2** → your bucket → **Settings** → **Custom Domains** → **Connect Domain**
→ enter `images.phbyviki.com` → Connect. It auto-creates the DNS record + SSL. Wait for **Active**.
(Don't use the `r2.dev` URL — it's rate-limited and not for production.)

### Step 2 — Add a CORS policy (required, or galleries load empty)
Same **Settings** tab → **CORS Policy** → **Add CORS policy** → paste:
```json
[
  {
    "AllowedOrigins": ["https://phbyviki.com", "http://localhost:4200"],
    "AllowedMethods": ["GET"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```
The manifest fetch is cross-origin (`phbyviki.com` → `images.phbyviki.com`); without this the browser blocks it.

### Step 3 — Confirm the URL in code
`src/app/config.ts` → `IMAGE_BASE_URL` is already `https://images.phbyviki.com`. If you used exactly
that subdomain, nothing to change. If different, update it here **and** the `preconnect` in `src/index.html`.

---

## Getting your existing photos into R2 (free options)

**Chosen path: originals are on the local machine → ignore S3 entirely.** Drop them in `to-upload/`
(see below), run the script, then delete the old S3 bucket. **$0, no AWS key, no S3 download needed.**

(For reference, if originals were *not* local you'd download from the S3 console or `rclone` into a
folder and run `npm run publish -- --dir ./that-folder` — at a few GB that's within AWS's free
100 GB/month egress anyway. Super Slurper is unnecessary. Not needed in this case.)

---

## How to place images for upload

Structure (the gallery folders are already created for you):
```
to-upload/<Type>/<Gallery Name>/your-photos.jpg
            │          │
            │          └─ MUST match the gallery name shown on the site
            └─ Weddings | Graduates | Personal | Baptisms | Corporate | Birthdays | Family
```

Steps:
1. In Terminal: `open to-upload` (opens it in Finder).
2. Open a gallery folder, e.g. `Weddings/Krysteena & Martin/`.
3. Drag your photos in. **Use the JPGs straight from the camera** — the script resizes + converts to
   webp. Filenames don't matter (they're renamed to clean ordered names); keep them in the order you
   want them shown (e.g. `001.jpg`, `002.jpg`).

Notes:
- Empty folders are skipped — only folders with photos get uploaded.
- New gallery: make a new folder under the right Type and drop photos in. (To also show it on the
  *listing/cards* page, it must be added to the gallery list in `galleries-cards.component.ts`.)
- Re-running is safe; same filename overwrites the same object.

---

## Running the pipeline

One-time: create an R2 API token (R2 → **Manage R2 API Tokens** → **Create** → Object Read & Write),
then `cp tools/.env.example tools/.env` and fill in `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`,
`R2_SECRET_ACCESS_KEY`, `R2_BUCKET`.

```sh
npm run publish                      # process ./to-upload, upload, rebuild manifest
npm run publish -- --dir ./folder    # use a different source folder
npm run publish -- --manifest-only   # just rebuild the manifest from what's in R2 (no upload)
```

Then `npm start` to test locally, `npm run deploy` to ship.

---

## Resolution & compression

In `tools/publish.mjs` / overridable in `tools/.env`:
- `MAX_EDGE` (default **2048**) — caps the **longest side**, keeps aspect ratio, never upscales.
  A 4K photo (3840×2160) → 2048×1152. Set `MAX_EDGE=1920` for ~1080p / smaller files.
- `WEBP_QUALITY` (default **82**) — good balance; a 4–8 MB JPEG → ~200–400 KB webp. Lower = smaller.

---

## Updating the manifest

- Upload **via the script** → manifest rebuilt automatically every run.
- Upload **by other means** (dashboard drag-drop, etc.) → run `npm run publish -- --manifest-only` once.
- To **delete** a photo: remove it in the R2 dashboard, then `npm run publish -- --manifest-only`.

---

## Prerendering (FYI — unrelated to R2, and free)

`angular.json` prerenders the routes in `prerender-routes.txt` at **build time, on your machine**,
during `npm run build`. The static HTML goes into `dist/` and Firebase serves it. It's part of the
Angular build — **no external service, no subscription, $0.** The gallery photo pages
(`galeriya/:galleryName`) are intentionally **not** prerendered; they render in the browser, which is
why they read the manifest at runtime.

---

## Cost summary

- R2 storage: $0.015/GB/mo, first 10 GB free. Egress: **$0**.
- No server, no env vars in the app, no credentials in the browser.
- Realistically **~$0/month** at this scale.
