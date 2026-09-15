# Log

The only file you need to read. Newest first.

Worker writes this. Martin reads it, answers what is under **Needs you**, and pastes
more work into `QUEUE.md` → Intake.

---

## Needs you

### T-31 · Round two on the canvas - pick numbers
https://claude.ai/code/artifact/dfcba592-2a61-43f1-bd1c-0a5053c52f50 → page 7.
New options for the pages you sent back, each with the dark/light chip:
- **/galerii:** G4 колаж · G5 каталог (list + big photo of the pointed one; on
  phones = G3) · G6 ленти (each category with its latest covers). My pick: G5
  with G3 as its phone form, or G6 if the index should sell the work itself.
- **/galerii/svatbi:** K4 мозайка · K5 корица + три кадъра (needs no new data)
  · K6 списък с преглед (needs a date per gallery - same spreadsheet as the
  venue). My pick: K5 - the only one that shows what a click gets you.
- **About:** the coral is keyed out of the existing portrait (a real re-cut,
  `.verify/design-canvas/portrait-keyed.png`; a faint sunlit rim on the hair
  remains). A4 писмо · A5 портретът на хартия · A6 интервю (draft questions,
  yours to change). My pick: A4 - needs the portrait least and opens with her
  work. Better still: one new photo from Viki, her at work, 4:5, daylight.
- **Contacts, besides K3:** K4 три стъпки (chips + two fields; the send would
  need rebuilding) · K5 снимка + форма. K3 is built.
Say the numbers and they become tasks.

### T-24 · The preview for Viki
**https://phbyvikiprod--preview-yb28hwie.web.app** — expires 2026-10-15.
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
1. ~~Hero sentence 14px / 13.5px~~ - went to 16/15 with the H3 hero (T-27), as
   drawn on the canvas.
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
- **The About portrait** - see T-31 above: keyed off the coral now; a new photo
  from Viki is still the better fix.
- `WORKER.md` is untracked - commit it yourself or tell me to. Its "R2 CORS blocks
  localhost" trap is out of date after T-22: galleries fill locally now.

---

## Working on

**The auto queue is empty.** T-26…T-32 from your 2026-09-15 picks are shipped;
the next tasks come from your answers under Needs you.

---

## Shipped

### 2026-09-15
- **T-32 · Preview channel refreshed** — https://phbyvikiprod--preview-yb28hwie.web.app
  now shows the paper theme, the H3 hero, the new sections, W3 galleries and
  K3 contacts. Live untouched.
- **T-31 · Canvas round two** — artifact v6, page 7: eleven new boards (G4-G6,
  K4-K6, A4-A6, contacts K4-K5) with notes and a recommendation per row; the
  About portrait keyed off its coral disc (`rekey.mjs`, region-grown from the
  rim so skin tones stay). Rendered headless before publishing - three boards
  had nested `<a>` tags that broke their layout, fixed. See Needs you.
- **T-30 · Contacts K3** — commit "Centre the contact form" — the h1 and lead
  centred, the form under them at 560px, the four ways to write as one ruled
  line under it (stacked on phones); the form markup itself is untouched, only
  its duplicate embedded heading is off on /kontakti. Verifier PASS, `npm run
  ux` 0 FAIL.
- **T-29 · Gallery page W3** — commit "Show gallery photographs whole, one to
  a row" — one column of at most 1040px, every photo at its own ratio; two
  portraits share a row, a lone one is centred at 60%; one full-width column
  under 960px. The manifest has no dimensions yet, so orientation is read from
  each photo as it loads (rows re-lay as portraits arrive); each unloaded
  photo holds a 3:2 box so the lazy loader only fetches what is near the
  viewport - before this fix all 153 collapsed to zero height and every one
  was requested at once. Modal keeps the right index; arrows, Escape and
  focus return checked. First photo still eager, preloaded; siblings strip
  intact. Verifier PASS, gate green, `npm run ux` 0 FAIL.
- **T-28 · Home sections P1 · S3 · Q3** — commit "Rebuild the home sections
  Martin picked" — portfolio is three cards (cover 4:5, tag, italic name;
  the same object as a /galerii card, one step to a category) with "Всички
  категории" beside the heading; the three teaser paragraphs are gone from
  the page. Process is the four steps as a ruled list beside the hands
  photograph (hidden on phones, under the list between 481 and 719px).
  The quote is the photograph whole with the words beside it on the warm
  band - no scrim, no crop. N1, C1, F1, T1 and Ft1 were already what is
  shipped. String assertions 3/3 absent, cards 3/3 present; verifier PASS;
  `npm run ux` 0 FAIL.
- **T-27 · Hero H3** — commit "Show the whole hero photograph" — the photo is a
  real `<img>` at `width: min(100vw, 150vh, 2400px); height: auto`: the full
  viewport height at its own 3:2, never cropped, paper either side on screens
  wider than that (laptop 1350×900 with 45px sides, 27" 200px, 4K 720px - a
  3600px export would fill 4K). Copy bottom-left over the gradient on desktop,
  as you picked; on phones and tablets the photo is too short to carry it
  (390 wide → 260 tall) so the headline and buttons sit under it on paper.
  Hero sentence 16px/15px. Preload kept, exactly once. Verifier PASS at
  1440×900 (1350×900, copy inside the frame) and 390 (h1 under the photo).
- **T-26 · Хартия и месинг** — commit "Put the site on paper" — direction B's
  light tokens on every route in one pass: paper `#FAF7F2`, ink text, brass one
  step darker (`#806220`) so 12px labels clear 4.5:1 on the warm band, the glow
  turned into a warm shadow, ink-on-paper buttons that flip back to bone inside
  the one dark band left (the closing CTA, as on board B). Every stage colour
  that was hard-coded - nav bars, skeletons, mobile bar, inverted icons, the
  404 page, theme-color, the web manifest - now reads a token. One real bug
  found on the way: in the browser the nav decided "home" from the router's
  url before the first navigation finished, so every inner page started with a
  transparent bar - invisible on paper; it reads the address bar now. `npm run
  ux` 0 FAIL (the audit learned that text over a sibling `<img>` is over a
  photograph). New `npm run shots` (`tools/shots.mjs`) writes headless
  full-page or fold screenshots per route × width into `.verify/shots/` -
  nothing opens on screen. Verifier PASS, gate green.

### 2026-09-13
- **T-25 · Address out of the footer** — commit "Take the address out of the
  footer" — the "Виктория Борисова · ж.к. Александър Стамболийски 1, Видин"
  line is gone from all 43 pages; the © line still signs the footer with the
  name; `/usloviya` and `/poveritelnost` keep their "Адрес" row, which is what
  ЗЕТ чл. 4 needs. String assertions 4/4, verifier PASS, gate green. Preview
  channel refreshed.
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
