#!/usr/bin/env node
/**
 * dryrun.js — validates that every slide produces sane HTML, without needing
 * a browser. Useful in CI or when Chromium isn't installed yet.
 *
 *   npm run dryrun
 *
 * Writes build/preview/<post_id>_slide-NN.html so you can open any slide in a
 * normal browser and eyeball it before committing to a full render.
 */

const fs = require('fs');
const path = require('path');

const BASE_CSS = fs.readFileSync(path.join(__dirname, 'templates', 'base.css'), 'utf8');
const SHELL    = fs.readFileSync(path.join(__dirname, 'templates', 'slide.html'), 'utf8');

// Reuse render.js's builders without executing its main() block.
let src = fs.readFileSync(path.join(__dirname, 'render.js'), 'utf8');
src = src.replace(/const \{ chromium \} = require\('playwright'\);/, '');
src = src.replace(/\(async \(\) => \{[\s\S]*$/, '');
src += '\nmodule.exports = { buildContent };\n';

const tmp = path.join(__dirname, '.__dryrun_tmp.js');
fs.writeFileSync(tmp, src);
const { buildContent } = require(tmp);
fs.unlinkSync(tmp);

if (!fs.existsSync('build/slides.json')) {
  console.error('  ERROR: run `npm run parse` first.');
  process.exit(1);
}

const posts = JSON.parse(fs.readFileSync('build/slides.json', 'utf8'));
fs.mkdirSync('build/preview', { recursive: true });

let n = 0, errs = [];

for (const post of posts) {
  for (const slide of post.slides) {
    try {
      const body = buildContent(slide, post);
      if (!body || body.trim().length < 20)
        errs.push(`${post.post_id} slide ${slide.slide_no}: empty content`);

      // unreplaced placeholders are a template bug
      const html = SHELL
        .replace('{{BASE_CSS}}', BASE_CSS)
        .replace('{{EXTRA_CSS}}', '')
        .replace('{{SLIDE_MODIFIER}}', 'slide--center')
        .replace('{{CONTENT}}', body)
        .replace('{{SLIDE_NO}}', `<div class="slide-no">[${String(slide.slide_no).padStart(2,'0')}]</div>`)
        .replace('{{BRAND}}', slide.slide_no === post.slides.length ? '<div class="brand">Tuskmelon</div>' : '');

      const left = html.match(/\{\{[A-Z_]+\}\}/g);
      if (left) errs.push(`${post.post_id} slide ${slide.slide_no}: unreplaced ${left.join(', ')}`);

      fs.writeFileSync(
        path.join('build/preview', `${post.post_id}_slide-${String(slide.slide_no).padStart(2,'0')}.html`),
        html
      );
      n++;
    } catch (e) {
      errs.push(`${post.post_id} slide ${slide.slide_no}: ${e.message}`);
    }
  }
}

console.log(`\n  built ${n} slide documents -> build/preview/`);
if (errs.length) {
  console.error('\n  PROBLEMS:');
  errs.forEach(e => console.error('   ✗ ' + e));
  console.error('');
  process.exit(1);
}
console.log('  no errors\n');
console.log('  Open any file in build/preview/ in a browser to check a slide');
console.log('  before running the full render.\n');
