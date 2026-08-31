#!/usr/bin/env node
/**
 * render.js
 * Renders build/slides.json to PNGs.
 *
 *   ONE SLIDE  =  ONE BROWSER PAGE  =  ONE PNG FILE
 *
 * Do not batch slides into a single page. The whole point of this renderer
 * is that each slide is isolated. If you find yourself building a loop that
 * puts several slides in one HTML document, that is the bug.
 */

const fs   = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const W = 1080;
const H = 1350;

const BASE_CSS = fs.readFileSync(
  path.join(__dirname, 'templates', 'base.css'), 'utf8'
);
const SHELL = fs.readFileSync(
  path.join(__dirname, 'templates', 'slide.html'), 'utf8'
);

const esc = s => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* Turn **bold** into markup, keep line breaks. */
function rich(s) {
  return esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
}

/* Wrap the annotated word in the requested device. */
function annotate(text, word, type) {
  if (!word || !type) return rich(text);
  const safe = esc(word);
  const idx  = esc(text).indexOf(safe);
  if (idx === -1) return rich(text);

  let wrapped;
  switch (type.toLowerCase()) {
    case 'circle':
      wrapped = `<span class="circled">${safe}` +
        `<svg viewBox="0 0 330 110" fill="none">` +
        `<use href="#ellipse-stroke" stroke="var(--magenta)" ` +
        `stroke-width="7" stroke-linecap="round"/></svg></span>`;
      break;
    case 'underline':
      wrapped = `<span class="underlined">${safe}` +
        `<svg viewBox="0 0 300 24" fill="none" preserveAspectRatio="none">` +
        `<use href="#underline-stroke" stroke="var(--magenta)" ` +
        `stroke-width="7" stroke-linecap="round"/></svg></span>`;
      break;
    case 'highlight':
    case 'highlight-block':
      wrapped = `<span class="hl hl--ink">${safe}</span>`;
      break;
    case 'strike':
    case 'strike-through':
      wrapped = `<span class="struck">${safe}</span>`;
      break;
    case 'selection':
      wrapped = `<span class="selection">${safe}` +
        `<i class="handle tl"></i><i class="handle tr"></i>` +
        `<i class="handle bl"></i><i class="handle br"></i></span>`;
      break;
    default:
      wrapped = `<span class="accent">${safe}</span>`;
  }
  return rich(text).replace(safe, wrapped);
}

/* ---------------- block types ---------------- */
function buildContent(slide, post) {
  const isB = post.design_set === 'B';
  const t   = slide.block_type.toLowerCase();

  const hookClass = isB ? 'hook hook--sans' : 'hook';

  switch (t) {

    case 'hook':
      return `
        <div class="stack">
          <div class="${hookClass}">${annotate(slide.headline, slide.annotation_word, slide.annotation_type)}</div>
          ${slide.body ? `<div class="subhook">${rich(slide.body)}</div>` : ''}
        </div>`;

    case 'text':
      return `
        <div class="stack">
          ${slide.headline ? `<div class="header">${annotate(slide.headline, slide.annotation_word, slide.annotation_type)}</div>` : ''}
          ${slide.body ? `<div class="body">${rich(slide.body)}</div>` : ''}
        </div>`;

    case 'quote':
    case 'reframe':
      return `
        <div class="stack">
          <div class="rule"></div>
          <div class="quote">${annotate(slide.headline, slide.annotation_word, slide.annotation_type)}</div>
          ${slide.body ? `<div class="body body--soft">${rich(slide.body)}</div>` : ''}
        </div>`;

    case 'cols':
    case 'compare': {
      // body format:  Left title | left copy  ||  Right title | right copy
      const [L = '', R = ''] = slide.body.split('||');
      const [lt, lb = ''] = L.split('|');
      const [rt, rb = ''] = R.split('|');
      return `
        <div class="stack">
          ${slide.headline ? `<div class="header">${rich(slide.headline)}</div>` : ''}
          <div class="cols">
            <div class="stack--tight">
              <div class="header header--sm accent">${rich(lt)}</div>
              <div class="body body--sm">${rich(lb)}</div>
            </div>
            <div class="stack--tight">
              <div class="header header--sm accent2">${rich(rt)}</div>
              <div class="body body--sm">${rich(rb)}</div>
            </div>
          </div>
        </div>`;
    }

    case 'overlap':
      return `
        <div class="stack">
          ${slide.headline ? `<div class="header">${rich(slide.headline)}</div>` : ''}
          <div class="overlap">
            <div class="blob blob--a"></div>
            <div class="blob blob--b"></div>
          </div>
          ${slide.body ? `<div class="body">${rich(slide.body)}</div>` : ''}
        </div>`;

    case 'bar': {
      const pct = Math.max(0, Math.min(100, Number(slide.extra) || 20));
      return `
        <div class="stack">
          ${slide.headline ? `<div class="header">${rich(slide.headline)}</div>` : ''}
          <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
          ${slide.body ? `<div class="body">${rich(slide.body)}</div>` : ''}
        </div>`;
    }

    case 'checklist': {
      const rows = slide.body.split('\n').filter(Boolean).map(r =>
        `<div class="checkrow"><span class="accent">✓</span><span>${rich(r)}</span></div>`
      ).join('');
      return `
        <div class="stack">
          ${slide.headline ? `<div class="header">${rich(slide.headline)}</div>` : ''}
          <div class="card">${rows}</div>
          ${slide.extra ? `<div class="hand">${esc(slide.extra)}</div>` : ''}
        </div>`;
    }

    case 'searchbar':
      return `
        <div class="stack">
          ${slide.headline ? `<div class="header">${rich(slide.headline)}</div>` : ''}
          <div class="searchbar"><span class="body--soft">⌕</span><span>${esc(slide.extra || '')}</span></div>
          ${slide.body ? `<div class="body">${rich(slide.body)}</div>` : ''}
        </div>`;

    case 'card':
      return `
        <div class="stack">
          <div class="card">${rich(slide.body)}</div>
          ${slide.headline ? `<div class="${hookClass}">${annotate(slide.headline, slide.annotation_word, slide.annotation_type)}</div>` : ''}
        </div>`;

    case 'close':
      return `
        <div class="stack">
          <div class="header">${rich(slide.headline)}</div>
          ${slide.body ? `<div class="body body--soft">${rich(slide.body)}</div>` : ''}
        </div>`;

    default:
      return `<div class="body">${rich(slide.headline + '\n' + slide.body)}</div>`;
  }
}

/* ---------------- main ---------------- */
(async () => {
  if (!fs.existsSync('build/slides.json')) {
    console.error('\n  ERROR: build/slides.json missing. Run `npm run parse` first.\n');
    process.exit(1);
  }

  const posts = JSON.parse(fs.readFileSync('build/slides.json', 'utf8'));
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: W, height: H },
    deviceScaleFactor: 1
  });

  let count = 0;

  for (const post of posts) {
    const dir = path.join('output', post.post_id);
    fs.mkdirSync(dir, { recursive: true });

    for (const slide of post.slides) {
      // ---- ONE PAGE PER SLIDE. This is the guardrail. ----
      const page = await ctx.newPage();

      const isFirst = slide.slide_no === 1;
      const isLast  = slide.slide_no === post.slides.length;

      const html = SHELL
        .replace('{{BASE_CSS}}', BASE_CSS)
        .replace('{{EXTRA_CSS}}', '')
        .replace('{{SLIDE_MODIFIER}}', isFirst ? 'slide--center' : 'slide--center')
        .replace('{{CONTENT}}', buildContent(slide, post))
        // slide 1 carries no furniture except its number
        .replace('{{SLIDE_NO}}',
          `<div class="slide-no">[${String(slide.slide_no).padStart(2, '0')}]</div>`)
        .replace('{{BRAND}}',
          isLast ? `<div class="brand">Tuskmelon</div>` : '');

      await page.setContent(html, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(250);

      // Fonts failing to load is silent and ruins every slide. Fail loudly.
      const fontsOk = await page.evaluate(() => {
        const need = ['Poppins', 'Instrument Serif', 'Caveat'];
        return need.filter(f => !document.fonts.check(`32px "${f}"`));
      });
      if (fontsOk.length) {
        console.error(
          `\n  FONT ERROR on ${post.post_id} slide ${slide.slide_no}: ` +
          `${fontsOk.join(', ')} did not load.`
        );
        console.error('  Slides would render in a fallback face. Aborting.');
        console.error('  Check network access to fonts.googleapis.com, or run');
        console.error('  `npm run fonts` to vendor the fonts locally.\n');
        await browser.close();
        process.exit(1);
      }

      const file = path.join(
        dir,
        `${post.post_id}_slide-${String(slide.slide_no).padStart(2, '0')}.png`
      );

      await page.screenshot({ path: file, clip: { x: 0, y: 0, width: W, height: H } });
      await page.close();

      count++;
      console.log('  ✓ ' + file);
    }

    // captions + alt text alongside the images
    if (post.caption_linkedin)
      fs.writeFileSync(path.join(dir, `${post.post_id}_CAPTION-linkedin.txt`), post.caption_linkedin);
    if (post.caption_instagram)
      fs.writeFileSync(path.join(dir, `${post.post_id}_CAPTION-instagram.txt`), post.caption_instagram);
    if (post.alt_text)
      fs.writeFileSync(path.join(dir, `${post.post_id}_ALT-TEXT.txt`), post.alt_text);
  }

  await browser.close();
  console.log(`\n  rendered ${count} slides across ${posts.length} posts\n`);
})();
