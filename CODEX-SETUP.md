# How to run this in Codex

Simple steps. Nothing runs on your computer.

---

## Step 1 — Put the folder on GitHub

Codex reads from a GitHub repo.

1. Make a new **private** repo. Call it `tuskmelon-carousel-system`.
2. Upload the whole unzipped folder to it.
3. You can do this in the browser. GitHub has an "upload files" button.
   You do not need to use the command line.

---

## Step 2 — Make a Codex environment

In Codex, create a new environment and pick your repo.

Find the box called **Setup script**. Paste this in:

```bash
npm install
npx playwright install --with-deps chromium
node src/fetch-fonts.js
```

**Why this matters:** Codex has internet during setup, but often blocks it
after. This script downloads the browser and the fonts while internet still
works. If you skip it, the render will fail later.

---

## Step 3 — First prompt in Codex

Paste this:

```
Read AGENTS.md first, then docs/design-system.md.

Run: npm run build

This reads content/september-2026.xlsx and renders slides to output/.

Rules:
- One slide = one PNG file. Never combine slides into one image.
- Every PNG must be 1080x1350.
- Do not change any copy in the spreadsheet.

When done, tell me how many PNGs were made per post folder.
```

That is it. Codex does the rest.

---

## Step 4 — Look at the slides

Codex will show you the PNG files. Open a few.

Tell me what looks wrong. Text too big, spacing off, magenta too strong —
anything. I will fix the CSS and give you a new file.

---

## Later prompts you will use

**To change a design:**
```
The hook text on slide 1 is too large. Reduce it and re-render
post 2026-09-03_performance-marketing only.
```

**To add a new month:**
```
I added content/october-2026.xlsx.
Run: node src/parse-content.js content/october-2026.xlsx
Then: npm run render && npm run verify
```

**To check nothing broke:**
```
Run npm run verify and show me any failures.
```

---

## If something fails

Copy the error message and send it to me.

Two common ones:

**"Chromium not found"** — the setup script did not run. Go back to Step 2.

**"FONT ERROR"** — fonts did not download. In Codex, run:
`node src/fetch-fonts.js`
If that fails too, internet is blocked. Add it to the setup script instead.
