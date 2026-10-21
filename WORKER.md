# Worker — standing orders

You are the worker session for phbyviki.com. Martin drops work into `QUEUE.md`
and walks away. You do it, prove it, commit it, and write down what happened.

Read this once per tick. Everything you need is in this repo — nothing depends on
plugins, MCP servers or settings on any particular machine.

## Start command

Normally you don't start this worker yourself. `agents`, typed in any terminal, runs
every project's worker from `~/git/9.user/hq` and stops when nothing is left. See
`~/git/9.user/hq/README.md`. To run only this one:

```sh
cd ~/git/9.user/PhotographyPortfolio
claude-personal
> /loop 45m Work the queue per WORKER.md
```

If the loop dies — rate limit, closed lid, crash — nothing is lost. All state is in
`QUEUE.md` and `LOG.md`. Run the same command and carry on.

---

## The tick

One pass, in this order. Then update `LOG.md` and sleep.

### 1. Drain Intake — triage cheap, spec late

`QUEUE.md` has an `## Intake` section where Martin pastes raw, unstructured notes.
He may paste thirty lines at once. Draining that into thirty full specs in one tick
would burn most of a 5-hour window writing paperwork and shipping nothing.

So drain in two stages.

**Triage — every line, every tick.** Clear Intake completely. For each line write a
one-line stub under `## Triaged` in `QUEUE.md`:

```
- [ ] T-12 · Venue name on gallery cards · needs-you · blocked: spreadsheet
```

Title, `auto` or `needs-you`, and what blocks it if anything. Cheap enough for
thirty lines. Then delete the raw lines from Intake.

While triaging:
- **Merge trivial siblings.** Three typo fixes are one task, not three ticks.
- **Split a line carrying independent changes.** One line often holds three:
  rename a heading, add a section, rewrite the FAQ under it. Those are three
  stubs, and the third may be a different autonomy class from the first two.
- **Group by surface.** Ten copy edits to the same gallery, or the same file, are
  **one** task and one reviewable diff — not ten ticks. Grouping beats the
  one-task-per-tick cap; the cap exists to stop runaway work, not to make you do
  six file edits across six hours.
- **A line ending in `!` jumps the queue.** Otherwise keep Martin's paste order.

**Spec — only when someone is about to read it.**

| | When you write the full task block |
|---|---|
| `auto` | Lazily, on the tick you actually work it. Nobody reads it before then. |
| `needs-you` | Eagerly, so Martin can approve it at his next check-in. **At most five per tick** — the rest stay stubs and get written next tick. |

You are guessing at intent, always. Say so. Put the assumption you made in the
**Why** line, in plain words, so it is obvious when you guessed wrong.

### 2. Classify each new task

| `auto` — just do it | `needs-you` — write the spec, park it |
|---|---|
| Build, tooling, scripts | Layout, spacing, colour, design |
| Meta tags, schema, sitemap, `og:` | Copy **you** would have to write |
| Refactors with no visual change | Prices, legal text, brand decisions |
| Anything one `git revert` undoes | Anything destructive or outward-facing |
| **Copy whose exact final text was supplied** | Deleting a page or a live URL |

**The verbatim rule.** Copy changes are `needs-you` because an agent inventing
Bulgarian for a real photographer's live site is a bad idea. That risk is absent
when Martin pastes the finished text in quotes — then the only question left is
whether you put it in the right place, which the diff and `npm run verify` answer.

So: **exact text given → `auto`. Text you would have to invent → `needs-you`.**

"Change the heading to «Заснемам вашите събития…»" is `auto`.
"Increase the 30+ number" is `needs-you` — increase it to *what*?
"Rewrite the FAQs based on the above" is `needs-you` — that is you writing copy.

When in doubt it is `needs-you`. Parking costs Martin one glance. Building the wrong
thing costs him a morning.

### 3. Work exactly one `auto` task

Top unblocked one. **One per tick, never two** — that is a cost control, not a
suggestion.

1. Implement it.
2. Run the gate: `sh scripts/qa.sh` — typecheck, build and prerender, then the
   assertions in `tools/verify.mjs` once task T-01 has built it.
3. Hand it to a **separate verifier agent** with fresh context. Give it only the
   task's **Done when** lines and the diff. Never give it your reasoning — a
   verifier that has seen the implementer's argument just agrees with it.
4. **PASS** → commit. **FAIL** → fix, retry once, then park it with what broke.

### 4. Never stall the queue

A blocked, ambiguous or twice-failed task does **not** stop you. Write the one
question into `LOG.md` under **Needs you** and move to the next task.

Martin should come back to finished work and a short decision list. Never to a
session frozen on question one.

### 5. Write `LOG.md`

Three sections, newest first: **Shipped**, **Needs you**, **Working on**.
That file is the only thing he reads. Keep it short enough to scan in a minute.

---

## Task format

````markdown
### T-07 · Per-gallery og:image
**Why** — shared links show the homepage, not that couple. Kills click-through.
**Scope** — `gallery.component.ts`, `tools/generate-sitemap.mjs`
**Done when**
- WHEN a gallery route is prerendered, THE page SHALL contain an `og:image`
  pointing at that gallery's first photograph
- IF a gallery has no photographs, THEN the page SHALL fall back to the site default
- All 44 routes prerender and typecheck stays clean
**Evidence** — `npm run verify` green, plus the `og:image` line from three routes
**Autonomy** — auto
````

**Done when** lines use EARS: `WHEN <trigger>, THE <thing> SHALL <response>` /
`IF <trigger>, THEN …` / `WHILE <state>, …`. One line, one check. Prose criteria are
where a task quietly becomes whatever you felt like building.

**Evidence** is not optional. "Done" is a claim; the gate output is the proof.

### Copy tasks get string assertions

`npm run verify` checks structure — routes, titles, images, schema. It cannot tell
whether the right Bulgarian sentence landed. So any task that changes visible text
**must** carry present-and-absent assertions against the prerendered HTML:

````markdown
**Done when**
- WHEN `/svatbi` is prerendered, THE page SHALL contain
  "Сватбеният ден минава по-бързо, отколкото очаквате"
- THE page SHALL NOT contain "Сватбата минава по-бързо, отколкото очаквате."
- `npm run verify` stays green
````

New text present, old text gone, on the named route. It either greps or it does
not — no judgment, no opinion, nothing for a verifier to be talked out of.

Rules for writing them:

- **Quote from Martin's text, never retype it.** Copy-paste the string out of
  Intake. A rekeyed Cyrillic string with one wrong letter is a false failure you
  will then "fix" by changing his words.
- **Match on a distinctive fragment, not the whole paragraph.** Long strings break
  on a curly quote, a non-breaking space or a line wrap in the rendered HTML. One
  unmistakable clause is enough.
- **Always assert the old text is gone.** Adding the new sentence while the old one
  survives further down the page is the most likely way this silently half-works.
- **Name the route.** "The site contains X" passes when X landed on the wrong page.
- **Normalise before comparing** — collapse whitespace and decode HTML entities.
  Angular will re-encode the quotes in «…» and they will not match raw.

For a grouped task — one gallery, several edits — every edit gets its own pair of
lines. Ten assertions in one task is correct and cheap.

### What not to build

Do not add Karma or Jasmine specs. Karma is configured in this repo and has zero
tests, deliberately. Unit tests here would check components in isolation while the
bug that actually happens — text not reaching the prerendered HTML — lives in the
build output, which unit tests never see. The prerender assertions test the real
artefact and are the stronger check.

If genuine logic ever lands — a booking form, a price calculator — unit tests earn
their place then. Ask first.

---

## What you may and may not do

| May | May not |
|---|---|
| Edit, build, typecheck | `git push` |
| `npm run verify`, `npm run build`, `npm run preview` | `npm run deploy` |
| Commit each verified task, on the current branch | `bash commit-plan.sh` |
| Create files, scripts, docs | Delete or force-push any branch |
| Draft copy for Martin to approve | Publish anything to R2 |
| | Touch Search Console |

Deploying is public and it is her business. That stays his hand on the lever.

### Commits

**Always commit explicit paths. Never `git add -A`, never a bare `git commit -a`.**

```sh
git commit tools/verify.mjs package.json QUEUE.md LOG.md -m "..."
```

This is not style. The working tree already carries seven modified files from an
unshipped SEO pass, held back on purpose and waiting on `commit-plan.sh`. A bare
commit sweeps them into your task's commit and silently ships work Martin decided
not to ship yet. List the files you touched, and only those.

One logical task per commit. Fold that task's `QUEUE.md` and `LOG.md` updates into
the **same** commit — so one commit is one task plus its own paper trail, and the
log never generates commits of its own.

Subject line in the repo's existing voice — plain, imperative, sentence case, no
prefixes, no `+`/`-`/`;`. Never add Co-Authored-By or any Claude Code attribution.

Before committing, read the diff of what you are about to stage. If a file is in
there that your task did not need, take it out.

---

## Cost controls

Martin runs this on a Pro plan, which is roughly 45 prompts per 5-hour window.
Without these you would burn the whole window before his first check-in.

1. **45-minute interval.** Idle ticks are cheap but not free.
2. **One task per tick.** Hard cap.
3. **Screenshots to disk, not into context.** Save to `.verify/`, and only read a
   PNG if the gate flagged something. Images are the single biggest spend on
   frontend work.
4. **Idle tick = write nothing.** Nothing in Intake, no unblocked `auto` task?
   Sleep. Do not touch `LOG.md`, do not commit, do not go looking for work. An
   idle tick should leave the repo byte-identical.

---

## Test first, and a bug hunt for risky changes

- **Every task starts with its tests, features as well as bugs.** Before any code, turn each **Done when** line into
  a test (unit, browser, or a string assertion for copy) and run it: it must fail. Keep that run in
  `.verify/<task>-before.txt`. The task is done when the same tests pass. A line no test can judge (looks, tone)
  says so and goes under **Test by hand**.
- **A bug:** the failing test reproduces it first. It is the only proof the bug was real.
- **A risky change** (money, sign-in, personal data, data migrations, legal rules) also gets a fresh `reviewer`
  agent on the diff besides the verifier. It hunts for bugs the Done when lines don't cover. Fix its real defects
  before READY; its optional notes go to `LOG.md`. Under `/work` the dispatcher starts it; in a direct session,
  start it yourself.

## The QA gate

One command, everywhere:

```sh
sh scripts/qa.sh          # full pass — run this before writing any commit
sh scripts/qa.sh --fast   # quick pass — while iterating
```

It exits non-zero on the first failure and writes each step's output to `.verify/`,
which is gitignored. **Read back only the part you need** — never pull a whole build
log into context.

There is also a `.git/hooks/pre-commit` on this machine that runs the fast pass and
blocks the commit. It lives in `.git`, so it is never committed and never shared —
no husky, nothing added to `package.json`. It is a safety net for hand commits, not
a substitute for running the full pass yourself.

A red gate is never something you route around. Do not `--no-verify`, do not skip a
step, do not weaken an assertion to get green. Fix it, or park the task with the
failure pasted into `LOG.md`.

**A green gate is not a passing task.** It proves the code compiles and matches
house style. It proves nothing about behaviour. The **Done when** lines are still
yours to demonstrate.

---

## Traps in this repo

These are real and they have all bitten before. `README.md` and `ARCHITECTURE.md`
have the full list.

- **R2 CORS blocks localhost.** Photo grids come up **empty** on a local server —
  only card covers render, from the build-time snapshot. A screenshot of a local
  gallery page showing no photos is **not a bug you found**. Verify photo work
  against production, or add a localhost origin to the bucket CORS first.
- **`npm run publish -- --thumbs` is blocked** — the R2 token 403s. Anything
  needing `srcset` or real image dimensions is blocked on a credential, not code.
  Park it, do not work around it.
- **Verify against `npm run preview`, not `ng serve`.** Preview serves the built,
  prerendered output. The prerender path is where the SEO bugs actually live.
- **Anything crawlable must be `<a routerLink>`.** `routerLink` on a `<div>`
  renders no `href` and orphans the page.
- **Never wrap link-carrying content in `@defer`.** Deferred blocks do not render
  during prerender, so the links vanish from the static HTML.
- **A new top-level route needs a rewrite in `firebase.json`.** Without one it
  works locally and hard-404s in production.
- **Re-run `npm run sitemap` after every publish**, or the sitemap drifts.
- **Page copy lives in `src/app/content/`**, not in templates. Meta descriptions
  are in `src/assets/seo.json`.
- **Deploys come from `master`.** The `prod` branch has been dead since June.

## The point of all of it

More people contact Viki and book her. A task that does not move that is a task
worth questioning in `LOG.md` before building it.
