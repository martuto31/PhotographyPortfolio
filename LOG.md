# Log

The only file you need to read. Newest first.

Worker writes this. Martin reads it, answers what is under **Needs you**, and pastes
more work into `QUEUE.md` → Intake.

---

## Needs you

### T-06b · Deposit sentence - veto window
Now on `/usloviya`, at the end of the "Отказ от запазена дата" section:

> При отказ от ваша страна платеното капаро не се възстановява - датата е била
> пазена за вас и не е могла да бъде предложена на друг.

It covers cancellation only; moving a date stays "we will work it out".

### T-10b · /galerii teaser - veto window
Abiturienti now reads "Индивидуална фотосесия в деня на бала и семеен бал."

### T-20 · The redesign pass - my decision, as you asked
- Direction: `DESIGN-SPEC.md` as written. Viki chose a button from that preview,
  which is her accepting the direction.
- Button: Костено бяло `#F1ECE3`, her answer.
- anastasiiakharyna.com: mood reference only. Nothing from it is copied unless
  she names an element ("the big full-width photo", "the thin serif menu"…).
- One pass over every page, then you look at one preview build, not page by
  page. The sibling strip and the seeded `<img>` tags survive - the gate checks
  both on every build.
- Order: T-06b and T-10b first (two quick ticks), then T-20 starts. It will take
  several ticks; `Working on` will say where it is.

`WORKER.md` is untracked - commit it yourself or tell me to.

---

## Working on

Next tick: **T-20 · the redesign pass** starts - first the scope and plan get
written into `QUEUE.md`, then tokens and shared styles, then the pages, one
preview build at the end. Several ticks; this line will say where it is.

---

## Shipped

### 2026-09-11
- **T-06b · Deposit sentence** — commit "Say the deposit stays when a booked date is cancelled" — verifier PASS.
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
