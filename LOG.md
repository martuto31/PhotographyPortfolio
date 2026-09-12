# Log

The only file you need to read. Newest first.

Worker writes this. Martin reads it, answers what is under **Needs you**, and pastes
more work into `QUEUE.md` → Intake.

---

## Needs you

### T-24 · The preview for Viki
**https://phbyvikiprod--preview-yb28hwie.web.app** — expires 2026-10-13.
A Firebase *preview channel* on the prod site: its own URL, nothing on
phbyviki.com changed (the `live` release is still 2026-08-03). Galleries are
complete on it - the bucket's CORS refuses that origin, so T-22's fallback
copy is doing the work; photos published after 2026-09-12 will not show there
until the next `npm run sitemap` + redeploy. To refresh it after more commits:
`npm run build && npx firebase hosting:channel:deploy preview --project phbyvikiprod --only app --expires 30d`
(the `app` target mapping for that project lives in the gitignored
`.firebaserc`; on another machine run
`npx firebase target:apply hosting app phbyvikiprod --project phbyvikiprod` first).

### T-23 · Taste calls the audit only warns about - yours if you want them
1. **Hero sentence is 14px desktop / 13.5px phone** (`.hero-sub`) - the most
   important sentence on the site and its smallest body text. I would go 16/15.
2. **Buttons are 43px tall on phones**, one under the 44px thumb guideline.
3. **Footer "Пишете в Messenger / Instagram" links are 24px tall** on phones.
4. **Mobile drawer links are 33px tall** - fine by WCAG, under Apple's 44.
5. **Headings read well at the spec's sizes:** h1 39/27, h2 31/24, h3 19-20,
   body 17px/1.7. I would not take the h1 up.

### T-21 · The "missing" gallery photos - nothing to fix, but read this once
You were looking at localhost (the `.verify` screenshots or a preview server). The
bucket's CORS policy allows `https://phbyviki.com` only, so off that origin the
manifest fetch is refused and a gallery shows the 8 seeded photographs and stops -
Лора и Асен has 153. Production was never affected; the built HTML carries the
seeds; every image URL answers 200. T-22 (shipped below) makes the site fall back
to its own copy of the manifest, so localhost and the preview link for Viki now
show whole galleries. New photos still need `npm run sitemap` after a publish,
which `npm run publish` already does.

### Still open from T-20
- **The About portrait** has the old coral backdrop baked into `about-me.png` and
  is the loudest thing on the dark stage. Needs a new portrait from Viki, not CSS.
- `WORKER.md` is untracked - commit it yourself or tell me to. Its "R2 CORS blocks
  localhost" trap is out of date after T-22: galleries fill locally now.

---

## Working on

**The auto queue is empty.** Idle until you paste into Intake or answer a
Needs-you item.

---

## Shipped

### 2026-09-13
- **T-24 · Preview channel** — https://phbyvikiprod--preview-yb28hwie.web.app
  (expires 2026-10-13) — `firebase hosting:channel:deploy preview --project
  phbyvikiprod --only app --expires 30d`; the `live` channel's release time is
  unchanged; the Лора и Асен grid shows all 153 photographs on that origin
  (headless Chrome), the HTML carries `<main>` and the 12px floor. `npm run
  deploy` was not used.
- **T-23 · UI/UX audit of the redesign** — commit "Bring the redesign up to the
  measurable UI rules" — new `npm run ux` (`tools/audit-ux.mjs`) loads eight
  routes at 1440 and 390 in headless Chrome and measures heading order, text
  size, WCAG contrast against the rendered background (opacity included),
  tap targets with WCAG 2.5.8's own exceptions, horizontal overflow, alt text,
  accessible names, landmarks, line-height, paragraph measure and form labels.
  Before: 392 FAIL. After: 0 FAIL, 201 WARN (all "under 44px", listed above).
  What changed, all threshold failures:
  - **12px floor on reading text** - eyebrows 9→12, buttons 11→12, desktop nav
    10→12, breadcrumbs / tags / labels / footer headings / row counts / CTA
    note 9.5-11→12. Same tracking, same weights. The 8px "Photography" under
    the wordmark stays: it is the logo lockup and the audit exempts it by name.
  - **Contrast** - `--font-low-emphasis` #7E766C → #8A8278 (4.37:1 → 5.2:1 on
    the stage, 4.6:1 on a card); the mobile Messenger bar #0084FF → #0068CC
    (3.05:1 → 4.55:1); the footer credit and address lines drop `opacity: 0.7`
    (composited to 4.4:1) for the token.
  - **One `<main>`** around the router outlet - no page had one.
  - **Category cards are `<h2>`** - the outline jumped h1 → h3.
  - **Hit areas** - footer social icons 22 → 32px, hamburger 36×32 → 44×44.
    Neither moves a pixel.
  Three verifier rounds: the first caught the footer opacity (real, fixed on
  both sides); the second failed the home-page display quote at line-height
  1.2 against a rule written as "every `<p>`" - you said "exempt", so display
  paragraphs (24px+) are leaded like headings and the rule stays for reading
  text; the third: PASS on all twelve lines. Gate green. One commit.

### 2026-09-12
- **T-22 · Same-origin manifest fallback** — commit "Fall back to a same-origin
  copy of the manifest" — `npm run sitemap` now also writes
  `src/assets/manifest.json`; `fetchManifest()` tries the live manifest, then that
  copy, then gives up. On localhost the Лора и Асен grid went from 8 tiles to 153
  (headless Chrome, DOM count); the gate has a new `manifest-fallback` check that
  fails on a missing, malformed or stale copy - proven on a throwaway dist. No
  visual change, one TypeScript file. Verifier PASS, gate green.
- **T-21 · Gallery photos "missing"** — diagnosed, not a bug: the localhost CORS
  trap. See Needs you.
- Triaged your four lines: T-21 closed, T-22 shipped, T-23 (audit) and T-24
  (preview deploy) queued in that order. "The redesign is fine" closes the T-20
  question; T-19 reconfirmed.

### 2026-09-11
- **T-20 · The redesign** — commit "Apply the redesign direction to every page" —
  "Тъмна зала, изчистена" on every route in one pass: dark stage tokens, brass
  hairlines, bone-white buttons, the spec's type scale, the hero as the inset
  lit print, the glow under every photograph, nav wordmark and CTA, mobile bar,
  inverted social icons. 24 files, CSS plus one template; no TypeScript touched,
  hero preload and the seeded photographs intact. Verifier PASS, gate green.
- **T-06b · Deposit sentence** — `55c93ce` — verifier PASS.
- **T-10b · /galerii teaser** — commit "Match the prom teaser to the new offering" — verifier PASS.
- **T-16b · Corporate, part B** — `c99ab6e` —
  slug maps, LocalBusiness offer + description + keywords, sitemap generator,
  docs; `/galerii/<anything unknown>` is now a real 404 (noindex,
  prerender-status-code 404) via a route guard - proven on a throwaway build for
  `korporativni` and `constructor`. Verifier failed the first guard (`in`
  admitted prototype names), fixed with `Object.hasOwn`, PASS on retry.
- **T-17b · Long dashes, part B** — `53e2fa1` — the 26 dashes in the SEO-pass
  files and the sitemap image titles; only two invisible comments still carry
  one. Testimonial attribution: dash dropped, my call.
- **Triaged your answers of the night:** T-04 closed (you keep `prod`); T-18
  answered (Костено бяло); T-19 decided (mood only); About-me meta closed - the
  About page itself was never edited, so its meta still fits it; T-06b, T-10b
  queued; T-20 scoped.
- **T-16 · Remove корпоративни, part A** — `965a79b` —
  gone from the service copy, /galerii index, footer, meta, type map, routes
  file and sitemap; 43 routes; no link or label to it on any page. Verifier
  PASS. **Part B waits on `commit-plan.sh`:** until then `/galerii/korporativni`
  renders an empty page client-side instead of a 404, the LocalBusiness JSON-LD
  in `index.html` still offers "Корпоративна фотография", and the next
  `npm run sitemap` would put the route back. Nothing of that is live until you
  deploy.
- **T-11 · Prom FAQ** — `68f4631` —
  the three approved questions, byte-exact, class-group ones gone; the FAQ under
  her new "какво включва" is consistent again. Verifier PASS, gate green.
- **T-08 · 150+ заснети събития** — `01b2c18` —
  homepage credibility line; "30+" gone from the whole build. Verifier PASS.
- **T-05 · Legal name and address** — `34fbaa6` —
  "Виктория Борисова · ж.к. Александър Стамболийски 1, Видин" in the footer of
  all 44 pages and as an "Адрес" row on both legal pages; the strings live once,
  in `contact.ts`. Verifier PASS (44/44), gate green.
- **T-06 · Refund clause** — `3dcc310` —
  new "Отказ от запазена дата" section on `/usloviya`, citing ЗЗП чл. 57; terms
  page dated 11 септември 2026, privacy page untouched. Verifier PASS, gate green.
- **T-04 · Delete `prod`** — closed, you keep it.
- Triaged your six answers: T-05, T-08, T-11, T-16 are `auto` now, in that order.
- **T-03 · Fold sitemap into publish** — `62fc654` —
  `publish.mjs` chains `generate-sitemap.mjs` after the manifest rebuild in every
  mode and fails the run if it fails; a failed upload never reaches it. Proven
  with a stubbed harness, no R2 writes. Runbooks in README, GALLERIES,
  ARCHITECTURE, tools/README and R2-GUIDE now say publish → deploy. Verifier PASS.
- **T-02 · Per-gallery og:image** — `ff10b6a` —
  all 31 gallery pages now carry `og:image`/`twitter:image` = their cover on
  images.phbyviki.com; category pages unchanged; falls back to the site default
  for a gallery missing from the snapshot. Verifier PASS, gate green.
  **Deviation:** cover, not first photograph — the first-photo data only exists
  in the held-back SEO pass and a commit must compile at its own HEAD; one
  property name to switch later. **Cost:** the snapshot chunk (~40 kB raw,
  ~2 kB gzipped) moved from lazy to the initial bundle because the root SEO
  service now imports it. Say if you would rather it stayed lazy — then the
  gallery component (held back) has to hand the cover to the service instead.
- **T-17 · Long dashes, part A** — `4916d15` —
  97 "—" → "-" across 22 files (content, seo.json, route titles, templates,
  404 page), nothing else changed; verifier PASS; gate green. **905 dashes
  remain in the build and every one comes from the five files `commit-plan.sh`
  holds back** (category H1s "… — София и Видин", gallery titles and alt text,
  og:site_name, LocalBusiness name). `node tools/dashes.mjs residual` proves it.
  Run `bash commit-plan.sh` and T-17b is one tick. Side effect until then: card
  alt text reads "Абитуриентска фотосесия — Ванеса - фотограф…" (one of each).
- **T-15 · Birthdays gallery copy** — `29fe1bf` —
  description in four paragraphs (her block byte-identical when rejoined, three
  "—" kept for T-17), "заведение" FAQ swapped for "Колко снимки ще получим?" in
  the same slot. 12/12 assertions, verifier PASS, gate green.
- **T-14 · Family gallery copy** — `8596a66` —
  description (her two "—" kept for T-17), location and processing items, the
  clothes answer (+ final full stop); lead and other items untouched. 13/13
  assertions, verifier PASS, gate green.
- **T-13 · Christening gallery copy** — `2102781` —
  description, three "какво включва" texts and the first FAQ answer; "Семейни
  кадри" and the lead untouched. Three of her strings got only a capital first
  letter / final full stop to match their siblings — no word changed. 14/14
  assertions, verifier PASS, gate green.
- **T-12 · Other events gallery copy** — `75130ba` —
  description byte-identical, "Локация и светлина" item gone (three remain),
  lead untouched. 8/8 assertions, verifier PASS, gate green.
- **T-10 · Prom gallery copy** — `b0fd56a` —
  description paragraph and a two-item "Какво включва" list, byte-identical to
  her text; the lead under the H1 untouched. 12/12 assertions, verifier PASS,
  gate green. **Until T-11 is approved the FAQ under it still says "преди бала"
  and mentions class groups** — one more reason to answer T-11.
- **T-09 · Wedding gallery copy** — `5bddf5e` —
  lead, three body paragraphs, two "какво включва" items and the travel FAQ, all
  byte-identical to her text (her long block split into three `<p>`, words
  untouched). 16/16 string assertions, old lead gone from the whole dist,
  verifier PASS, gate green.
- **T-07 · Homepage hero subtitle** — `86b457d` —
  her text landed byte-identical on `/`; old paragraph gone from the whole dist;
  verifier PASS; gate green.
- **Copy assertion helper** — `50ecc44` — `node tools/check-text.mjs <route> --has "…" --not "…"`
  is the proof line for every copy task from here on.
- **T-01 · Verification gate** — `7f56c51` — `npm run verify` builds and checks
  all 44 routes: 13 checks, 44/44 prerendered, 31 gallery pages, unique titles,
  exits 1 with a per-route message on a broken copy of dist (missing route,
  duplicate title, hero preload on a gallery page, `routerLink` on a `<div>`,
  lazy LCP photo — all caught). `img-dimensions` reports SKIP ×31 because the
  manifest has no dims yet (R2 token). `--no-build` and `--dist <dir>` flags.
- Triaged 21 Intake lines into 11 tasks (T-07…T-17): 8 auto, 3 needs-you. Viki's
  original lines are kept verbatim under each stub in `QUEUE.md`, so specs are
  copy-pasted from her text, never retyped.
