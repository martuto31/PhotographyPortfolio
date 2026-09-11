# Redesign spec — "Тъмна зала, изчистена"

**Live preview:** https://claude.ai/code/artifact/e277ac36-238b-459d-9974-bb89aeb8f9cc
Shared by link — Viki can open it. Four button colours, click to switch.

**Status: one decision open.** Everything below is settled except the button colour.
Nothing gets applied to the site until Viki names one.

---

## Where this came from

Viki, verbatim:

> "харесва ми комбинация от 01 Хартия и месинг с 02 Тъмна зала. от 01 ми харесва
> изчистеното семплото, но 02 дава по-скъп и премиум вайб, подчертаването на снимките
> все едно светят много ми харесва, но не ми харесва цвета на бутоните който е избран
> в тема 02"

| | |
|---|---|
| **Kept from 02 — Тъмна зала** | near-black ground, the glow under each photo, the premium feel |
| **Kept from 01 — Хартия и месинг** | clean and simple, Cormorant headings in normal case, air, one accent |
| **Dropped** | the filled gold button `#D8A64A` — she said so directly |
| **Dropped** | 02's wide-tracked uppercase headlines — half of why it read cold |

---

## Tokens

The site wrapper keeps full light/dark support. The preview commits to one dark world
on purpose — that is the look, not a theme.

```css
/* light */
--paper:#FAF7F2;  --surface:#FFFFFF;  --edge:#E7E0D5;
--text:#1A1714;   --text-mid:#5C5449; --text-low:#8B8175;  --accent:#8A6A22;

/* dark — :root[data-theme="dark"] and the prefers-color-scheme block */
--paper:#14120F;  --surface:#1C1916;  --edge:#302B25;
--text:#EFEAE1;   --text-mid:#ADA49A; --text-low:#7E766C;  --accent:#C8A05A;

/* the dark stage itself */
--pv-bg:#0D0C0B;  --pv-text:#EFEAE1;  --pv-muted:#A69E93;
--pv-line:rgba(216,166,74,.20);
--glow:rgba(255,206,148,.42);
```

## The glow — the thing she named

Warm light thrown *under* the photo, like a print lit from above. Not a border, not a
filter on the page.

```css
.pv-card img {
  filter: brightness(1.05) contrast(1.02);
  box-shadow: 0 0 0 1px rgba(255,255,255,.07),
              0 26px 52px -26px var(--glow);
  transition: transform .3s ease, box-shadow .3s ease;
}
.pv-card:hover img {
  transform: translateY(-3px);
  box-shadow: 0 0 0 1px rgba(255,255,255,.11),
              0 32px 60px -24px var(--glow);
}
```

Hero uses the same recipe on an overlay inset from the edges:
`.pv-hero-glow { position:absolute; inset:24px 24px 0; 0 30px 70px -30px var(--glow) }`
(mobile: `inset:16px 16px 0`).

## Type

```css
--serif: 'Cormorant Real', Georgia, 'Times New Roman', serif;
--ui: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
```

- **h1** — Cormorant 400, `clamp(27px, 4.4vw, 39px)`, line-height 1.05, normal case
- **h2** — Cormorant 400, `clamp(24px, 3.2vw, 31px)`, line-height 1.14
- **Wordmark** — Cormorant *italic* 20px, with `PHOTOGRAPHY` under it at 8px / .3em tracking
- **Buttons** — 11px, `.12em` tracking, uppercase, `padding: 12px 22px`, weight 500

Fonts are already in the repo: `src/assets/fonts/cormorant-{latin,cyrillic}-{regular,italic}.woff2`,
wired in `src/app/styles/fonts.css`. Cyrillic is a separate subset — Bulgarian headings
need it. Cormorant's italic is a real drawing, not a slant.

---

## The open decision — button colour

```css
.pv[data-btn="bone"]      { --btn-bg:#F1ECE3;    --btn-fg:#100E0C; --btn-line:transparent; }
.pv[data-btn="champagne"] { --btn-bg:#E6D2AB;    --btn-fg:#17130C; --btn-line:transparent; }
.pv[data-btn="rose"]      { --btn-bg:#CE9384;    --btn-fg:#1B100D; --btn-line:transparent; }
.pv[data-btn="outline"]   { --btn-bg:transparent;--btn-fg:#F1ECE3; --btn-line:rgba(241,236,227,.62); }
```

| | | |
|---|---|---|
| **Костено бяло** `#F1ECE3` | **recommended** | ages best, never competes with the photographs |
| Бледо шампанско `#E6D2AB` | | 02's gold idea, three tones quieter — if the *strength* was the problem, not gold |
| Пепелна роза `#CE9384` | | the only colour on the page; warm and wedding-ish, loud on near-black |
| Само контур | | most restrained, but the button gets noticed least — wrong trade for the thing that earns enquiries |

---

## Applying it

One pass over every page, not page by page — that's the recorded preference and it has
held up. Pages: home, galleries index, the four service pages, about, contacts.

Two things that must survive the redesign, both shipped for indexing reasons:

- the sibling-gallery strip at the bottom of `gallery.component.html`
- real `<img>` tags seeded from `src/app/generated/galleries.ts`, first row eager,
  first photo preloaded

See `TASKS.md` for everything else open, `HANDOFF.md` for where the project stands.
