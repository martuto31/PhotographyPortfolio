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
(T-10, auto) and drafted three FAQs from her text (T-11, in `QUEUE.md`). Approve,
edit, or send her wording. If the replace-all reading is wrong, say so before
T-10 runs — it is next in line after T-07 and T-09.

### T-16 · Remove the "корпоративни" gallery
It is a live prerendered URL, in the sitemap and in the LocalBusiness schema, so I
parked it. Confirm: (1) whole category goes — page, nav, footer, index card, sitemap,
schema offer; (2) plain 404 is fine, or do you want a 301 to `/galerii`?

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

Next tick: **T-07 · Homepage hero subtitle** (exact text given, one line in
`intro-section.component.html`). Then T-09 → T-10 → T-12 → T-13 → T-14 → T-15 →
T-17, one per tick. T-02 and T-03 (og:image, sitemap-in-publish) queue behind the
copy, since her texts are what she is waiting on.

---

## Shipped

### 2026-09-11
- **T-01 · Verification gate** — commit "Add the verification gate" — `npm run verify` builds and checks
  all 44 routes: 13 checks, 44/44 prerendered, 31 gallery pages, unique titles,
  exits 1 with a per-route message on a broken copy of dist (missing route,
  duplicate title, hero preload on a gallery page, `routerLink` on a `<div>`,
  lazy LCP photo — all caught). `img-dimensions` reports SKIP ×31 because the
  manifest has no dims yet (R2 token). `--no-build` and `--dist <dir>` flags.
- Triaged 21 Intake lines into 11 tasks (T-07…T-17): 8 auto, 3 needs-you. Viki's
  original lines are kept verbatim under each stub in `QUEUE.md`, so specs are
  copy-pasted from her text, never retyped.
