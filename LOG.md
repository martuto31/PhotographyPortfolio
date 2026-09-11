# Log

The only file you need to read. Newest first.

Worker writes this. Martin reads it, answers what is under **Needs you**, and pastes
more work into `QUEUE.md` → Intake.

---

## Needs you

### T-08 · "30+ заснети събития"
Viki wants the number raised but did not say to what. What number? The snapshot has
31 published galleries if you want one that stays verifiable from the site.

### T-11 · Prom FAQ rewrite
Her "какво включва" text for abiturienti implies the class-group offering is gone,
so I read "да се променят на" as *replace all four items with the two she lists*
(T-10, now shipped — one `git revert` if wrong) and drafted three FAQs from her
text (T-11, in `QUEUE.md`). Approve, edit, or send her wording. Also: the
`/galerii` index teaser still says "Индивидуални и групови фотосесии" — want it
changed too? That is copy, so it waits for you.

### T-16 · Remove the "корпоративни" gallery
It is a live prerendered URL, in the sitemap and in the LocalBusiness schema, so I
parked it. Confirm: (1) whole category goes — page, nav, footer, index card, sitemap,
schema offer; (2) plain 404 is fine, or do you want a 301 to `/galerii`?

### About-me meta description (no task yet)
The verifier noticed "Документален и спокоен подход" also lives in the About-me
page's meta description (`src/assets/seo.json`). Viki only asked about the
homepage, so I left it. Say if you want it rewritten to match her new wording —
that would be needs-you copy.

### T-17 · Long dashes (no answer needed unless I guessed wrong)
I will replace every "—" in visible text with " - ", the way Viki writes it herself,
and run it **last** so it also sweeps her new family and birthday texts, which
contain "—". `<title>`s and meta descriptions included. En dashes in ranges
("май–октомври") stay.

Still parked from before: **T-04** (delete `prod`), **T-05** (legal name + address —
needs the address from you), **T-06** (refund clause).

`WORKER.md` is untracked and not mine to commit — `QUEUE.md` and `LOG.md` go in
with each task, as it says. Commit it yourself or tell me to.

---

## Working on

All of Viki's copy that could ship without you is shipped (T-07, T-09, T-10,
T-12, T-13, T-14, T-15). Next tick: **T-17 · Remove long dashes** across all
visible text — the last of her batch. Then T-02 (og:image) and T-03 (sitemap
in publish). T-02 and T-03 (og:image, sitemap-in-publish) queue behind the
copy, since her texts are what she is waiting on.

---

## Shipped

### 2026-09-11
- **T-15 · Birthdays gallery copy** — commit "Put Viki's birthdays copy on /galerii/rojdeni-dni" —
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
