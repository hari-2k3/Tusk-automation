# Tuskmelon Carousel System

Turns a monthly content workbook into publish-ready carousel slides.

Claude writes the content and design specs into `content/<month>.xlsx`.
Codex renders that workbook into PNGs. **One slide = one PNG file.**

---

## Setup (once)

```bash
npm run setup     # installs deps + Chromium
npm run fonts     # vendors Poppins / Instrument Serif / Caveat locally
```

`npm run fonts` is optional but recommended — it removes the dependency on
Google Fonts being reachable at render time and makes builds reproducible.

Requires Node 18+.

---

## Monthly workflow

1. Drop the new workbook into `content/` (e.g. `october-2026.xlsx`)
2. Point the parse script at it in `package.json`, or run it directly:
   ```bash
   node src/parse-content.js content/october-2026.xlsx
   ```
3. Build:
   ```bash
   npm run build
   ```

`build` runs parse → render → verify. If verify fails, nothing ships.

To preview a single slide in a normal browser before committing to a full
render:

```bash
npm run dryrun
open build/preview/2026-09-03_performance-marketing_slide-01.html
```

---

## Output

```
output/2026-09-03_performance-marketing/
  2026-09-03_performance-marketing_slide-01.png   1080x1350
  2026-09-03_performance-marketing_slide-02.png
  ...
  2026-09-03_performance-marketing_CAPTION-linkedin.txt
  2026-09-03_performance-marketing_CAPTION-instagram.txt
  2026-09-03_performance-marketing_ALT-TEXT.txt
```

---

## Files

| Path | What it is |
|---|---|
| `AGENTS.md` | **Read first.** Instructions and hard constraints for Codex. |
| `docs/design-system.md` | Colour, type, layout, the two design sets, annotation devices. |
| `docs/content-principles.md` | Positioning rules, caption spine, anti-repetition system. |
| `content/*.xlsx` | The monthly workbook. Claude's output, Codex's input. |
| `src/parse-content.js` | Workbook → `build/slides.json`, with validation. |
| `src/render.js` | `slides.json` → PNGs. One browser page per slide. |
| `src/verify.js` | Post-render checks. Fails the build rather than shipping quietly. |
| `src/dryrun.js` | Generates HTML without a browser, for previewing. |
| `src/fetch-fonts.js` | Vendors webfonts locally. |
| `src/templates/base.css` | All design tokens and slide layout classes. |
| `references/liked/` | Devices being borrowed. Two are marked `BENCHMARK`. |
| `references/rejected/` | The template trap. Filenames give the reason. |
| `references/captions/` | Caption voice references. |

---

## Workbook structure

| Sheet | Purpose |
|---|---|
| `README` | Orientation for whoever opens the file. |
| `Posts` | One row per post: date, service, design set, captions, alt text, status. |
| `Slides` | One row per slide: block type, headline, body, annotation, visual spec. |
| `Device Tracker` | Which hook grammar / annotation / composition each post used. Prevents repetition. |
| `Screen Recordings` | Briefs for the three monthly screen recordings. |
| `Design Tokens` | Colour and type values, mirrored from `base.css`. |

Rows with `status = PENDING` are skipped by the parser. That is how a partially
written month still builds.

---

## Block types

`hook` · `text` · `quote` / `reframe` · `cols` / `compare` · `overlap` ·
`bar` · `checklist` · `searchbar` · `card` · `close`

Each maps to a layout in `src/render.js`. The `visual_spec` column describes the
intended result in prose — if a spec cannot be achieved with the existing block
types, that is worth raising rather than approximating.

---

## Known constraints

- Slide counts are 5, 6 or 7. The parser rejects anything outside that.
- Every output is 1080×1350. Other sizes are a build failure.
- `image_prompt` is almost always empty. It is only for a slide needing a
  photographic element containing **no text**. Text is always rendered as real
  type, never generated.
