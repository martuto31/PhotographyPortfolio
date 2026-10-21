# Conventions: commits, decisions, code documentation

For every session and every agent on this repo, on any account. Taken from Доставки's conventions (Martin, 21 Oct
2026: "every decision, every method documented, why it was made"). The verifier checks them.

## 1. Commit messages

```
[Type] What it is about, in plain words (at most ~72 characters)

Why: the request or problem this answers (Martin's words, a spec section, QUEUE T-NNN, a review finding).
What: the change, by area, in a few lines.
Decisions: each choice made and why; a lasting one gets a decision record (§2) and is named here: ADR-0003.
Tests: what ran and the result; what was not tested and why.
```

- **Types:** `[Feature]` something new for a user · `[Fix]` something wrong made right · `[Improve]` an existing
  feature made better (wording, layout, speed) · `[Refactor]` no behaviour change · `[Test]` tests only ·
  `[Docs]` documents only · `[Chore]` build, tooling, dependencies · `[Security]`.
- The title says what changes for the user or the code, not the file names. One idea per commit.
- `Why` and `What` are required for every type except a one-line `[Docs]` or `[Chore]`; `Decisions` whenever a
  choice was made; `Tests` for any code change.
- Merges, reverts and `fixup!` / `squash!` keep git's own wording.
- Author email `martuto31@gmail.com`; no AI attribution lines.
- `sh scripts/install-hooks.sh` installs `scripts/hooks/commit-msg`, which checks the title. Commits before 21 Oct
  2026 keep their old style.

## 2. Decision records (`docs/decisions/`)

A decision record is written for every choice a later session could undo by accident: a product rule, a data
shape, an algorithm, a default, a trade-off, a deviation from the spec, a "we decided not to".

- File: `docs/decisions/NNNN-short-title.md`, numbered in order, never renumbered. Template:
  `docs/decisions/0000-template.md`. Index: `docs/decisions/README.md` (one line per record).
- Status: `Proposed` (waiting for Martin), `Accepted`, `Superseded by ADR-NNNN`. A changed decision gets a new
  record that supersedes the old one; the old one stays.
- The code that carries the decision names it in a comment: `// ADR-0003: …`.
- The commit that makes the decision names it under `Decisions:`.

## 3. Code documentation

The code explains **why**. A reader who never saw the chat must understand each choice from the code and the
records.

- **Every class, component, service and util file** starts with a doc comment: what it is for, where it sits in the
  project's flow, and the spec section or decision record it implements.
- **Every method** has a doc comment unless its name says everything and it is a few lines: what it does, why it
  exists, the cases it handles (null, empty, limits), and what it returns or throws.
- **Every non-obvious line** (a constant's value, a workaround, an order that matters, a guard) gets a comment with
  the reason.
- **Numbers** carry their reason and unit.
- **Tests** are named by condition and expectation; a one-line comment when the scenario or its numbers aren't
  obvious.
- Comments use plain words and change in the same commit as the code they describe. A stale comment is a bug.
- Don't comment what the next line obviously does.

## 4. Where things are written

| What | Where |
|---|---|
| State, what's left, how to work, prompts | `HANDOFF.md` |
| Rules for sessions and agents | `CLAUDE.md`, `WORKER.md`, this file |
| What shipped, what Martin must check or decide | `LOG.md` |
| Tasks | `QUEUE.md` |
| Specs, plans, research | `docs/`, by topic |
| Decisions | `docs/decisions/` |
