# AGENTS.md — Instructions for Codex

You are the **production unit** for Tuskmelon's social carousel system.
Content, copy and design decisions are already made and live in the content
spreadsheet. Your job is to turn that spreadsheet into correctly-named,
correctly-sized PNG files. You are not being asked to write copy or invent
layouts.

---

## THE SINGLE MOST IMPORTANT RULE

**One slide = one PNG file. Never combine slides into a single image.**

A carousel with 6 slides produces exactly 6 separate PNG files. Not one image
containing 6 panels. Not a contact sheet. Not a grid. Six files.

This is the most common failure mode in this pipeline. If you find yourself
building a layout that contains more than one slide, stop — that is wrong.

The renderer enforces this: it opens one browser page per slide row and takes
one screenshot per page. Do not change that behaviour.

---

## HARD CONSTRAINTS

| Constraint | Value |
|---|---|
| Output dimensions | **1080 × 1350 px exactly** (4:5 portrait) |
| Output format | PNG |
| Files per slide | Exactly 1 |
| Background | White (`#FFFFFF`) — no exceptions in this cycle |
| Fonts | Poppins + Instrument Serif + Caveat only |
| Accent colour | Magenta `#EC1E79` primary, Purple `#7C4DFF` secondary |
| Accent per slide | **One only.** Never two annotation colours competing. |

---

## HOW SLIDES ARE PRODUCED

Slides are rendered from **HTML/CSS via headless Chromium**, not from an
image-generation model.

This is deliberate. Every slide in this system is typography with exact
wording — a specific headline in a specific typeface with a magenta annotation
on one specific word. Image models cannot render precise multi-line text
reliably and cannot be instructed to use a named font at a named size. Using
one would produce slides with mangled words that need hand-correction.

**Do not replace the HTML renderer with an image-generation model.**

The only place image generation is permitted is the `image_prompt` column,
which is populated only for the rare slide needing a photographic or textural
element with **no text in it**. If `image_prompt` is empty (it usually is),
generate nothing — render the HTML.

---

## PIPELINE

```
content/<month>.xlsx
        │
        ├─ npm run parse     → build/slides.json
        │
        └─ npm run render    → output/<post_id>/<post_id>_slide-01.png
                                                 <post_id>_slide-02.png
                                                 ...
```

Run both with `npm run build`.

---

## FILE NAMING

```
output/
  2026-09-03_performance-marketing/
    2026-09-03_performance-marketing_slide-01.png
    2026-09-03_performance-marketing_slide-02.png
    ...
    2026-09-03_performance-marketing_CAPTION-linkedin.txt
    2026-09-03_performance-marketing_CAPTION-instagram.txt
    2026-09-03_performance-marketing_ALT-TEXT.txt
```

Slide numbers are **zero-padded two digits** so they sort correctly. A folder
whose PNG count does not match the `slide_count` column is a failed build.

---

## VERIFICATION — run before reporting success

1. Every post folder contains exactly `slide_count` PNGs.
2. Every PNG is exactly 1080 × 1350.
3. No PNG contains more than one slide's content.
4. Fonts rendered as Poppins / Instrument Serif / Caveat — not fallback sans.
   (If fonts failed to load, text renders in Times or Arial. That is a failure.)
5. Slide 1 contains no CTA, no phone number, no logo lockup, no website URL.
6. Caption `.txt` files written alongside the PNGs.

`npm run verify` performs checks 1, 2 and 6 automatically. Checks 3–5 are
visual — open at least slide 1 of each post and look.

---

## THINGS THAT ARE ALWAYS WRONG

- Combining slides into one image
- Any dimension other than 1080×1350
- Stock 3D renders: seesaws, chess pieces, silver spheres, balance scales
- Decorative stock animals
- Icon rows along the bottom of a slide
- Phone numbers, email addresses or website URLs anywhere on slide 1
- A CTA button on slide 1
- Two annotation colours on one slide
- Dark or gradient backgrounds this cycle
- Inventing copy that is not in the spreadsheet
- Changing a headline because it "reads better" — the copy is final

See `references/rejected/` for what each of these looks like in the wild. Those
files are labelled with the reason they were rejected. Do not imitate them.

---

## REFERENCE FOLDERS

| Folder | Use |
|---|---|
| `references/liked/` | Devices we are borrowing. Two files are prefixed `BENCHMARK` — study those first. |
| `references/rejected/` | The template trap. Filenames state the reason. Never imitate. |
| `references/captions/` | Caption voice reference. Not your job to write, but useful context. |
| `references/brand/` | Logo and services list. |

---

## IF SOMETHING IS AMBIGUOUS

Ask rather than improvise. A slide rendered with invented copy is worse than a
slide not rendered at all, because it may get published.

Specific things to flag rather than guess:
- A `visual_spec` you cannot translate into HTML/CSS
- A slide whose text overflows 1080×1350 at the specified size
- A missing or malformed row in the spreadsheet
- Any instruction here that conflicts with the spreadsheet

The spreadsheet wins on **content**. This file wins on **process and format**.
