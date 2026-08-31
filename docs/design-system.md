# Tuskmelon Carousel Design System

## Colour

Derived from the Tuskmelon logo — a play/arrow triangle built from overlapping
translucent shapes. The ownable idea is the **overlap**: where two shapes cross,
the colour multiplies into a third. That is a design device, not just a palette.

| Token | Hex | Use |
|---|---|---|
| `--white` | `#FFFFFF` | Background. Every slide, this cycle. |
| `--ink` | `#141414` | All body and headline type. Near-black, not pure black. |
| `--ink-soft` | `#6B6B6B` | Secondary text, labels, footers. |
| `--grey-line` | `#E4E4E4` | Rules, borders, inactive UI elements. |
| `--grey-fill` | `#F4F4F4` | Card fills, inactive bars. |
| `--magenta` | `#EC1E79` | **Primary accent.** All annotation. |
| `--purple` | `#7C4DFF` | Secondary. The "other" element in a pair. |
| `--green` | `#8BC34A` | Held back. Overlap device + important-days post only. |
| `--yellow` | `#F5B800` | Held back. As above. |
| `--cyan` | `#22CFD4` | Held back. As above. |

### Rules

1. **One accent per slide.** If a slide needs magenta *and* purple, one is
   structural (a block, a shape) and the other is the annotation. Never two
   annotation colours competing for the eye.
2. **Yellow and cyan never carry annotation.** They fail contrast on white — a
   yellow circle around a word disappears at feed scale.
3. **Green, yellow and cyan appear only** in the overlap device and the monthly
   important-days post, where a full spectrum is appropriate because the content
   is itself a spectrum.
4. Type is `--ink`, never pure `#000`. It lets magenta sit forward.

### The overlap device

Two shapes in `--magenta` and `--purple` at ~70% opacity, overlapping. The
intersection multiplies to a third tone. Use for: before/after, rejected/chosen,
two problems that look identical in a dashboard. This is the one visual device
nobody else in the reference set has.

---

## Typography

| Role | Face | Weight / size (at 1080×1350) |
|---|---|---|
| Slide 1 hook | Instrument Serif Regular | 96–132px, line-height 0.95 |
| Slide headers (2+) | Poppins SemiBold | 46–56px, line-height 1.15 |
| Pull-quote / reframe slide | Instrument Serif Regular | 72–88px |
| Body copy | Poppins Regular | 32–38px, line-height 1.5 |
| Labels, slide numbers, footers | Poppins Medium | 22–24px, tracking 0.08em, uppercase |
| Annotations, margin notes | Caveat Regular | 34–44px, always in accent |

### Rules

1. **Instrument Serif is for hooks and pull-quotes only.** The moment it appears
   in body copy it stops signalling "this is the important line."
2. **Caveat never carries information that matters.** If a reader cannot decipher
   the handwriting, nothing is lost. It is emphasis, not content.
3. Sentence case for headers. Not all-caps. All-caps is reserved for the small
   letterspaced label style.
4. Body copy never below 32px — it has to survive being viewed on a phone.

### Fonts

All three are free on Google Fonts and are loaded locally by the renderer:
- Poppins — 400, 500, 600
- Instrument Serif — 400
- Caveat — 400, 600

If fonts fail to load, text falls back to Times/Arial and the build is invalid.

---

## Layout

- Canvas: **1080 × 1350** (4:5)
- Margin: 96px all sides. Nothing except a full-bleed background element crosses it.
- Slide number: bottom-left, inside margin, `[01]` style, magenta, Poppins Medium
- Logo: bottom-right, final slide only. Never on slide 1.
- Slide 1 carries **no** logo, CTA, URL, phone number or handle. The hook and its
  annotation only.

---

## The two design sets

Every service alternates between Set A and Set B each month. September's
assignment is in the spreadsheet. October flips all of them. This is what stops
the feed reading as a formula by post five.

### Set A — Editorial

Instrument Serif carries the hook. Type-dominant, heavy white space, minimal
graphic furniture, annotation used sparingly. The slides **build an argument**.

- Hook: Instrument Serif, large, filling the frame
- Slides 2+: mostly type, one idea per slide
- Graphic elements: rules, simple marks, restrained
- Feels: considered, quiet, editorial
- Reference: `liked/13-editorial-cream-serif-listicle.png`,
  `liked/14-editorial-minimal-carousel.png`

### Set B — Interface

Poppins carries the hook — no serif. Built from mimicked UI: cards, search bars,
dashboards, checklists, charts, screenshots. Bracketed slide numbers visible
throughout. The slides **show evidence** rather than argue.

- Hook: Poppins SemiBold or Bold, tighter, often paired with a UI element
- Slides 2+: interface mimicry, data, annotated artifacts
- Graphic elements: cards with soft shadows, form fields, progress bars
- Feels: forensic, evidence-led, screen-native
- Reference: `liked/08-BENCHMARK-gmb-ui-collage-circle.png`,
  `liked/11-BENCHMARK-carousel-system-bracket-numbers.png`

---

## Annotation devices

Rotate these. Do not use the same device twice in a month.

| Device | Description |
|---|---|
| Circle | Hand-drawn ellipse around one word. Loose, overshooting, real-pen feel. |
| Underline | Uneven stroke beneath one word. |
| Highlight block | Solid accent block behind a word, running slightly past it. |
| Strike-through | Accent line through rejected/wrong items. |
| Bracket | Accent bracket to the left of a group, with a Caveat note. |
| Margin note | Caveat text with a small arrow, in the outer margin. |
| Selection box | Dashed box with corner handles — reads as design-software UI. |

---

## Slide count

**5, 6 or 7 slides.** Not 8. The tighter count forces harder choices about which
beat survives, which is what keeps the structure from becoming predictable.
