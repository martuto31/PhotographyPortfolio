# Log

The only file you need to read. Newest first.

Worker writes this. Martin reads it, answers what is under **Needs you**, and pastes
more work into `QUEUE.md` → Intake.

---

## Needs you

Tidied 2026-10-01 (T-55): only what is still open. Everything settled is under
Shipped or in `git log`. Live = 8b69e6b (master = prod = the branch).

1. **T-54 · GEO, one item left** - the „Накратко" blocks and the extra FAQ
   answers are deferred, as you said on 2026-10-01. Still open: do you want a
   list of ~15 Bulgarian questions („сватбен фотограф Видин" and the like) to
   paste into ChatGPT, Perplexity and Gemini once a month, noting whether Viki
   is named? About 15 minutes a month of your time; it is the only way to tell
   whether the GEO work does anything. My recommendation: yes. Say yes and I
   write it; say no and T-54 closes.
2. **Cloudflare token** - you deleted the one pasted in chat, so `npm run cf`
   fails and `npm run deploy` skips its edge purge. A new token in `tools/.env`
   when you want those back. If no purge has run since the photos were re-cut
   (370da8c), do Caching → Purge Everything once by hand - I cannot tell from here.
3. **Consent from the couples** → drop `Weddings` from `liveSiteOnly` in
   `src/app/content/hidden-galleries.json` and deploy.
4. **Standing, on Viki:** Google Business Profile, prices for `/tseni`; optional:
   camera originals of the 31 older galleries, and a new About portrait.
5. **Search Console:** Indexing → Pages, the indexed count (4 of 33 on 2026-09-22).
6. **`WORKER.md` is untracked** - commit it yourself or tell me to. Its "R2 CORS
   blocks localhost" trap is out of date since T-22.
7. **The preview channel expires 2026-10-15** - `npm run preview:deploy` renews it.

Town and month per gallery are no longer asked for anywhere (Martin, 2026-10-03:
Viki doesn't know them). The old T-45 message is gone; the reviews ask that was
inside it is now the message under Test by hand.

---

## Test by hand

### Forward to Viki: the reviews message (T-56)

Viki sends this to past clients on Messenger or Viber, one client at a time, and
fills in the bracket. Each paragraph is one line so it pastes without odd breaks.

```
Здравейте! Пише ви Вики, фотографката от [сватбата ви / бала / кръщенето / фотосесията].

Подготвям раздел с отзиви в сайта си и много ще се радвам, ако отделите минута да ми напишете няколко думи. Не е нужно да е дълго - и едно изречение е напълно достатъчно.

Ако ви помага, ето няколко въпроса:
1. По какъв повод снимахме?
2. Как се чувствахте по време на снимките?
3. Какво мислите за готовите снимки?
4. Бихте ли ме препоръчали на свои близки?

Можете да отговорите само на някои от тях, както ви е удобно.

И един последен въпрос: съгласни ли сте да публикувам отговора ви в сайта си с малкото ви име?

Благодаря ви от сърце!
```

**How an answer becomes a review** on the „Отзиви" section (one entry in
`src/app/content/testimonials.ts`; the section appears on the home page as soon
as there is one):

| Field | Comes from | Rule |
|---|---|---|
| `quote` | their answers to 2-4, in their order | their words; only typos fixed, nothing added or reworded |
| `name` | the first name they agreed to | e.g. „Мария" or „Мария и Иван"; no "да" → not published |
| `context` | answer 1 | the occasion only: „Сватба", „Абитуриентски бал", „Кръщене", „Рожден ден", „Семейна фотосесия" |
| `gallery` | optional | only if their gallery is visible on the live site (weddings stay hidden until consent) |

To get one on the site: paste the reply into `QUEUE.md` → Intake as
`from Viki, <date>: отзив, <name> said yes: „<their words>"`. Quoted text ships
on its own. Keep a screenshot of their "да".

---

## Working on

**The auto queue is empty.** T-54's test-prompt set waits for a yes (1 above).

---

## Shipped

### 2026-10-03
- **T-56 · Town/month dropped, reviews message written** - Viki doesn't know
  town or month for any gallery, so that ask is gone from LOG, TASKS, the Blocked
  table and HANDOFF's current snapshot; the old T-45 message is gone with it. The
  reviews message (4 guided questions, one sentence is enough, first-name
  permission) and the answer → review template are under Test by hand. Docs only.

### 2026-10-01
- **T-55 · Queue tidied** - thirteen shipped specs out of `QUEUE.md` → Ready,
  the "Was:" snapshots and closed tasks out of Needs you, T-47 marked done, the
  Blocked table brought up to date, the missing Shipped lines below added. No code.

### 2026-09-23
- **T-54 · GEO, first half** (8b69e6b, live) - `llms.txt` from existing copy;
  schema: ImageObject credit on gallery photos, About as ProfilePage,
  `knowsAbout`, Bulgaria in `areaServed`. No prices or reviews.

### 2026-09-22 (afternoon)
- **robots.txt matches the WAF** (b033de9) - answer engines allowed, training
  crawlers refused.
- **Cloudflare as code** (f5cc05f, 1ec669f) - proxied, cache key without the
  query string, image rate limit, training-bot WAF rule; `npm run cf kill on/off`
  creates and deletes the block rule (after the 15:40 incident).
- **T-53 · Gallery view toggle** (e22cc8c, de0bbed, live) - feed / mosaic,
  icons only, feed default. Also f963cd4: one-off tools removed.

### 2026-09-22
- **Site images to R2** (see `git log`) - hero, quote, process, category cards,
  About portrait now at images.phbyviki.com/site/ (`npm run publish:site`); a first
  visit takes ~350 KB from Firebase instead of ~2 MB. Spark confirmed by Martin
  (pauses at 360 MB/day, cannot bill). Audit page updated (v2).
- **Overbilling / scraping audit** - artifact EMRrKwnvZhC9XBwUF1D8NM. Findings:
  only R2 reads on edge misses are movable by strangers ($0.36/M past 10M);
  cache-busting via query strings and random 404 paths were open; Firebase plan
  unknown (Spark stops at 360 MB/day, Blaze bills). Code side: robots.txt now
  disallows AI-training crawlers (deployed). Everything else needs Martin's
  Cloudflare login - checklist in the artifact.
- **Image quality** (370da8c, deployed) - Martin: covers soft on a 2K monitor,
  twice. Cause: derivatives re-encoded from the compressed 2048 webp at q80, no
  sharpening. Now 2560/q88 full + 1024/1600 copies at q86 cut from the original
  with a light unsharp mask; the 31 older galleries re-cut from their 2048 files
  (no originals on hand); 512 copies pruned. Bucket ~0.9 GB. Two copies by
  Martin's decision. Comparison page: https://claude.ai/artifact/BQEaxRJWm1Nqg7ECNrqEoJ
- **Sharp covers** (1599111, deployed) - `sizes` on the wall tiles and sibling
  cards now allows for the object-fit crop (landscape cover in a 4:5 tile needs
  1.875x the width); a 1x 2K monitor was getting w512 for a 790px job. Cover
  pixel size added to the snapshot/listing; `coverSizes()` in config.ts.
- **DEPLOYED** - `npm run deploy` (SITE_TARGET=live): 33 routes, 21 galleries,
  weddings hidden; both hosting targets (app + the old-domain redirect). Live
  smoke test clean.
- **Thumbs backfill** (5d8c296) - `npm run publish -- --thumbs`, 915 older photos;
  srcset + width/height live on every gallery page. verify 50/38 PASS, 0 skipped.
- **T-52 · Seven new galleries** (f990874) - 537 photos to R2 with derivatives
  and dims; lone-gallery strip; verify counts own photographs only; to-upload
  folders + README. verify 50/38 PASS; preview refreshed.
- **T-51 · Weddings hidden on live only** (e726af6) - two-scope
  `hidden-galleries.json`, `SITE_TARGET=live` in `npm run deploy`,
  `generated/site-target.ts` for the runtime, `npm run preview:deploy`. verify
  43/31 and 29/17 PASS. Centering audit clean.
- **T-50 · Viki's second review** (e039344) - nine copy points verbatim; five
  galleries hidden via `hidden-galleries.json` (runtime + build); header pill
  centred. verify 38/26 PASS; six `check-text` runs; preview refreshed.

### 2026-09-21
- **Gallery page fixes from Martin's phone** (see `git log -1`) - the line is hidden
  (meta + JSON-LD only); links encoded twice (chat apps) decode until stable, so
  „Лора%20и%20Асен“ with no photos cannot happen again; `section-space` before the
  CTA band, as on the other pages.
- **T-47 · Gallery lines** (188b193 → e06c213) - first as 31 paragraphs from
  contact sheets of the R2 photos; Martin: cringe. Now one factual line + photo
  count under the noun, and a distinct meta/JSON-LD description per gallery.
  `content/gallery-texts.ts`; snapshot gains `photoCount`; Unicode-normalised
  lookup (Mac folder names carry decomposed „й“). verify 43/31 PASS; `check-text`
  on four galleries; preview refreshed.
- **„духването“** (e3f06b8) - put back on the birthdays page, Martin's call.

### 2026-09-19
- **T-49 · Viki's answers applied** — commit "Put in Viki's wording from her
  review of the texts". Nine sentences changed (hero line, process lead, step
  3, two FAQ answers, footer tagline, /galerii lead and band, family
  paragraph, "духането"), three FAQ entries she left out removed. Verified by
  a fresh agent on all 43 pages, 11/11; gate green. Two readings to confirm
  under Needs you.

### 2026-09-17
- **T-46 · Copy pass two** — commit "Put the texts in literary Bulgarian and
  drop the 24-hour promise". Hero line rebuilt from Viki's About vocabulary,
  the strip down to three tiles (cities without a label), every "отговарям
  до 24 часа" gone, FAQ 5 as Martin asked, colloquial phrasing in my earlier
  texts edited to literary register. Numbered list under Needs you → T-46.
  Verified by a fresh agent on the 43 pages + strip layout at 1440/390; gate green.

### 2026-09-16
- **T-44 · Font comparison page** — `tools/fonts-compare.html`, hosted at
  https://phbyvikiprod--fonts-cqv7luse.web.app/shriftove (expires 2026-10-16):
  A Source Sans 3 (current) · B Manrope · C Commissioner · D Overpass, same
  Cormorant heading, same copy, names hidden until "Покажи имената".
- **T-45 · Venue/date without the spreadsheet** — answered under Needs you:
  the R2 files carry no EXIF, so a Messenger message with the 31 gallery
  names is the replacement; the same message asks for client reviews.
- **T-43 · Copy pass** — commit "Say the cities once and drop the whole-country
  claim". Every changed sentence is under Needs you → T-43. Verified by a
  fresh agent against the 43 prerendered pages: new strings present, old
  ones absent, titles untouched; gate green. Also fixed on the way: the home
  CTA invited a phone call (no number on the site) and "фирмени" events were
  still offered twice after Viki removed the category.
- **T-42 · Bulgarian letterforms on every device** — commit "Set the body in
  a face with Bulgarian letterforms". What was true: the Cormorant headings
  already draw the Bulgarian в, д, т (the page is lang="bg" and the font
  has the forms); the body did so only on iPhone/Mac, because Windows and
  Android system fonts have no Bulgarian forms - so the two alphabets
  depended on the device. Now the reading face is Source Sans 3 (Adobe,
  open licence; Inter, Noto Sans, Fira, Onest checked and lacking the
  forms), one 40 KB file for Latin + Cyrillic + every weight, preloaded,
  sized to the old system font so nothing else moved. Same on the 404 page.
  **If Viki prefers another of the three that qualify (Manrope,
  Commissioner, Overpass) it is one line to swap** - say the name.
- **T-41 · SEO check - one fault, fixed** — commit "Share the hero photograph
  when a page is sent". All 43 pages: unique titles ≤ 60 and descriptions
  ≤ 160, one canonical, one h1, valid JSON-LD, sitemap 43/43, every page
  linked. The fault: the share image (what Messenger, Viber and Facebook
  show when someone sends a link) was a 892×1501 portrait WebP - blank or
  badly cropped in most previews. Now a 1200×630 JPEG of the hero, on every
  non-gallery page; category pages keep their cover, galleries their own.
  One oddity noted, not changed: the "Юбилей Сергей" URL carries the
  macOS-style decomposed "й" from its folder name - consistent everywhere
  (sitemap, links, canonical), so it works; renaming the folder would
  change the URL.
- **T-39 · The closing band asks with the channel that works** — commit
  "Lead the closing band with the channel that works on the device". On a
  phone or tablet the big action stays "Пишете в Messenger" (it opens the
  app). On a desktop it is now "Изпрати запитване" → the contact page, with
  Messenger and Instagram as the two buttons under it - the nav already
  made that call because an m.me link on a desktop lands on a Facebook
  login wall as often as an inbox. Everything else (hero, nav, phone bar,
  contacts page) reviewed and left as is.
- **T-38 · Type: the lead under every heading is one thing now** — commit
  "Give every page the same lead". Two leads exist - the serif italic
  statement (service pages, About) and the sans introduction (galleries,
  contacts, legal) - and each page had its own recipe; About's was two sizes
  smaller than the service pages'. One rule each in headings.css; h1, body,
  eyebrow untouched. Families and the scale stay as in DESIGN-SPEC.
- **T-37 · Buttons are pills** — commit "Round every button into a pill".
  Every `.btn`, the nav's "Пишете ми" and the static 404's links: full round,
  same ink/bone fills, still 44px tall, one line on a phone. The phone
  contact bar stays a bar, the form keeps its underline fields, the round
  photo controls were already round. Preview refreshed.
- **T-36 · The hero is Viki's three photographs** — commit "Cycle the hero
  through Viki's three photographs". The lift in the fog first, the colour
  smoke kiss, the first dance; a slow dissolve every 6.5s, in her order.
  Only the first is in the static page (the one Google and every visitor
  see first); the others arrive after it has loaded. Phones now get a
  1200px file instead of the 2400 (a quarter of the bytes). Nothing moves
  for someone who asked for reduced motion or while the tab is hidden; the
  frame never changes height. Preview refreshed.
  Assumption: "shuffle" = her order, not random - say if she wanted random.

### 2026-09-15
- **T-34 · Gallery kept the previous couple after a sibling click** — commit
  "Reload the gallery when only the URL changes". Viki's bug: open a gallery
  from the suggestions, go back, open another - the URL and the tab title
  changed, the page did not. Angular keeps the same component when only the
  parameters change and both list pages did their work once, on init. Now a
  parameter change resets and reloads (gallery page, category page, and the
  category row's mark), and a manifest arriving for a page already left is
  dropped. Verified headlessly: sibling → back → other sibling, and
  /galerii/svatbi → Абитуриенти, each shows its own h1, photographs, strip.
  Preview refreshed.
- **T-33 · One wall for /galerii and the category pages** — commit "Put every
  gallery on one wall" — on the preview now, as the proposal for the two
  pages you sent back twice. `/galerii` is every published gallery as a 4:5
  cover with the name and a small category label, the categories dealt in
  turns; a row of the categories with counts above it (real links, so the
  search landing pages keep their URLs and copy). Each category page is the
  same wall for its galleries with the row marking it, then the copy, FAQ
  and CTA as before. No card chrome; covers ease in, a touch of zoom on
  hover, tiles rise as they enter the viewport, the row scrolls sideways on
  phones with the current category brought into view. Three columns on
  desktop, two on tablets and phones. Verifier caught one thing - covers
  were invisible without script - fixed and re-verified PASS. Gate green,
  `npm run ux` 0 FAIL. If it is not it either, one `git revert` takes it
  out; say what is wrong with it rather than which number.
- **T-23b · Thumb targets** — commit "Give every phone tap target 44px" —
  buttons 43→44 (one pixel of padding, all sizes); on phones and tablets the
  footer links, the Messenger/email/Instagram lines, the legal links, the
  wordmark, the breadcrumbs, the "Всички" links, the social icons and the
  legal page's table of contents all get room for a thumb; the type itself
  does not change. Audit warnings at 390: 196 → 5 (the five left are links
  inside legal sentences, which WCAG exempts). One trap found: Angular's
  style scoper splits `:is(p, li, dd)` inside a `:host-context()` rule on its
  commas, and the unbalanced paren swallowed every rule after it - spelled
  out instead.
- **T-27b · Hero at the full width of the screen** — commit "Run the hero
  photograph the full width of the screen" — you said the photo was not 100%
  wide (the canvas rule left paper either side on screens wider than 3:2).
  Now: full width always, its own 3:2, capped at one viewport height with
  `object-fit: cover` centred on the couple. What that cuts: nothing on
  phones, tablets or any screen at 3:2 or narrower; 7% on a 1440×900 laptop,
  16% on 16:9 (1920×1080, 2560×1440) - sky and grass, never the couple; the
  old strip cut 45%. Checked at 320 / 390 / 768 / 1024 / 1280 / 1440 / 1920 /
  2560. If you would rather never cut, the alternative is full width with the
  photo running under the fold on 16:9 - say so. Above 2400px the file is
  upscaled; a 3600px export from Viki would fix 4K. Responsiveness: the audit
  ran at 320 / 768 / 1024 / 1920 on all eight routes - no overflow, no
  contrast failures (one transient: a tablet-width page is prerendered as
  desktop and re-lays after hydration - a brief flash inherent to the
  breakpoint service, not new). `tools/audit-ux.mjs` takes `--widths`,
  `tools/shots.mjs` takes `--height`.
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
