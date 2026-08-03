# Brand assets

Everything visual that isn't a photograph is **generated from code**, so the favicon, the
PWA icons and the logo lockups can never drift apart. Nothing here should be edited in an
image editor and committed back — change the source and re-run.

```sh
npm run brand      # both of the below
npm run icons      # favicon, PWA, apple-touch
npm run logo       # wordmark lockups (needs Chrome, see below)
```

## The mark

A six-blade lens iris: a disc with a hexagonal opening and six tangential blade
separations. It signals "photography" without depending on the viewer knowing the initials
— which the previous `VB` monogram did — and it stays legible at 16px, which the old
favicon did not.

| Token | Value | Used for |
| --- | --- | --- |
| Ink | `#191817` | tile, blade separations, wordmark, `<meta name="theme-color">` |
| Amber | `#D8A64A` | the iris — sampled from the candlelight in the hero photograph |

The geometry lives in **`tools/brand-mark.mjs`** and is the single source of truth. The
blade separations are offset 38° off radial on purpose: perfectly radial lines read as a
star or an asterisk rather than a lens.

The old coral (`--primary-brand: #FD574E`) is deliberately **not** part of the mark. It is
still in `variables.css` for buttons and links; see the open task about replacing it.

## Files `npm run icons` writes

| File | Size | Notes |
| --- | --- | --- |
| `src/favicon.ico` | 16, 32, 48 | Multi-image ICO with PNG payloads, written by a small encoder in the tool — no binary dependency |
| `src/assets/img/icon.svg` | vector | What modern browsers prefer; crisp at any DPI |
| `src/assets/img/apple-touch-icon.png` | 180 | **Square on purpose** — iOS applies its own squircle mask, so baked-in corners would double-round |
| `src/assets/img/icon-192.png`, `icon-512.png` | 192, 512 | Referenced by `site.webmanifest` |
| `src/assets/img/maskable-512.png` | 512 | Android adaptive icons crop to a circle; the mark is scaled to 72% to stay inside the safe zone |

Referenced from `src/index.html`, `src/404.html` and `src/site.webmanifest`. `favicon.ico`
and `site.webmanifest` must stay listed in `angular.json` → `build.options.assets` or they
won't ship.

## Files `npm run logo` writes

| File | Use |
| --- | --- |
| `logo.webp` / `logo.png` | Horizontal lockup, dark text. `logo.webp` is the `logo` field in the `LocalBusiness` JSON-LD |
| `logo-on-dark.png` | Same lockup with light text, for dark backgrounds |
| `logo-stacked.png` | Mark over wordmark — social avatars, watermarks |

All transparent-background and trimmed tight to their own ink.

The wordmark is set in the site's **own** webfonts, not a lookalike: Cormorant italic 500
for `Victoria Borisova`, Overpass 600 at `0.4em` tracking for `PHOTOGRAPHY` — the same
values as `.brand-name` / `.brand-tag` in `navigation-desktop.component.css`. If those
change, change them here too.

### Why the logo tool needs Chrome

Cormorant ships as `woff2` in `src/assets/fonts`. librsvg — what sharp uses to rasterize
SVG — cannot load `woff2` or honour `@font-face`, and installing the family system-wide to
build an asset would make the output depend on the machine. So `generate-logo.mjs` lays the
lockups out in HTML, inlines the repo's own font files as data URIs, and screenshots them
headlessly at 3x. It reads no network.

Override the binary with `CHROME_BIN=/path/to/chrome npm run logo`. Pass `--keep` to leave
the rendered page and screenshot on disk for inspection.

Note: the tool measures each lockup's bounding box from the alpha channel rather than using
sharp's `trim()`, which collapses to an empty region on transparent-edged images and fails
with a misleading `extract_area: bad extract area`.

## Changing the brand

1. Edit the constants in `tools/brand-mark.mjs` (colours, radii, blade count/angle).
2. `npm run brand`
3. Check the 16px rendering before committing — it is the binding constraint, and most
   marks that look good at 512px fall apart there.
4. If the ink colour changed, update `<meta name="theme-color">` in `src/index.html` and
   `src/404.html`, plus `theme_color` / `background_color` in `src/site.webmanifest`.
