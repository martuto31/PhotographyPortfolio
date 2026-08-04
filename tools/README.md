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
npm run publish -- --thumbs                # backfill responsive sizes for photos already in R2
npm run publish -- --thumbs --prefix "Weddings/Лора и Асен"   # …just one gallery
npm run publish -- --manifest-only         # rebuild manifest from what's already in R2 (no upload)
```

## Responsive sizes

Every photo is stored four times: full size, plus 512 / 1024 / 1600px wide copies in
`wNNN/` folders next to it.

```
Weddings/Лора и Асен/dsc00066.webp          full size (longest edge 2048)
Weddings/Лора и Асен/w512/dsc00066.webp
Weddings/Лора и Асен/w1024/dsc00066.webp
Weddings/Лора и Асен/w1600/dsc00066.webp
```

The site puts all four in a `srcset` and the browser downloads whichever one fits the
screen. On that 153-photo wedding gallery that is **33.6 MB → 4.4 MB** on an ordinary
laptop and **11.8 MB** on a retina screen or a modern phone.

`npm run publish` does this automatically for anything you upload. **`--thumbs` is only
for photos that were already in the bucket before this existed**, and it can be re-run
safely — it skips whatever is already done. After it finishes, run `npm run sitemap`
so the prerendered pages pick the new sizes up too.

To change the ladder, set `THUMB_WIDTHS` / `THUMB_QUALITY` in `tools/.env`, then re-run
`--thumbs` and `npm run sitemap`. Note that the widths are also baked into the `sizes`
attributes in `src/app/config.ts`, so a big change wants a look there as well.

## Notes
- Re-running is safe: same filename overwrites the same object.
- To **delete** a photo, remove it from the R2 bucket (dashboard) and run `npm run publish -- --manifest-only`.
- Tune `MAX_EDGE` / `WEBP_QUALITY` in `tools/.env`.
- The public URL the site uses is set in `src/app/config.ts` (`IMAGE_BASE_URL`).
- The token needs **Object Read & Write**. Reads go over the public CDN, so only listing
  and writing actually use it — but if it 403s on `ListObjectsV2`, it has expired or been
  scoped down and a new one has to be issued.
