# Publish pipeline (Phase 1)

Compress local photos → WebP → upload to the public R2 bucket → rebuild `manifest.json`.
The site reads `manifest.json` at runtime, so **adding photos needs no code change and no redeploy.**

## One-time setup

1. Install deps (adds `sharp` + the AWS SDK as dev-only tooling):
   ```sh
   npm install
   ```
2. Create an R2 API token in Cloudflare → **R2 → Manage API Tokens → Create** (Object Read & Write).
3. Copy the env template and fill it in:
   ```sh
   cp tools/.env.example tools/.env
   ```
   `tools/.env` is gitignored. These keys live only on this machine — they never reach the website or the browser.

## Adding / updating a gallery

1. Put full-res originals in this layout (the `<Type>` folder must be one of
   `Weddings`, `Graduates`, `Personal`, `Baptisms`, `Corporate`, `Birthdays`, `Family`):
   ```
   to-upload/
     Weddings/
       Krysteena & Martin/
         DSC_001.jpg
         DSC_002.jpg
   ```
   The gallery folder name must match what the site links to (e.g. `Krysteena & Martin`).
2. Run:
   ```sh
   npm run publish
   ```
   It resizes (longest side 2048px, quality 82), converts to WebP, uploads, and rebuilds the manifest.
3. The new photos are live immediately (the manifest is served with `no-cache`).

### Useful variants
```sh
npm run publish -- --dir ./some-folder     # use a different source folder
npm run publish -- --manifest-only         # rebuild manifest from what's already in R2 (no upload)
```

## Notes
- Re-running is safe: same filename overwrites the same object.
- To **delete** a photo, remove it from the R2 bucket (dashboard) and run `npm run publish -- --manifest-only`.
- Tune `MAX_EDGE` / `WEBP_QUALITY` in `tools/.env`.
- The public URL the site uses is set in `src/app/config.ts` (`IMAGE_BASE_URL`).
