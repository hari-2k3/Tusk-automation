#!/usr/bin/env node
/**
 * parse-content.js
 * Reads content/<month>.xlsx and emits build/slides.json
 *
 * Usage:  node src/parse-content.js content/september-2026.xlsx
 */

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const input = process.argv[2] || 'content/september-2026.xlsx';

if (!fs.existsSync(input)) {
  console.error(`\n  ERROR: cannot find ${input}`);
  console.error(`  Put the monthly workbook in content/ and pass its path.\n`);
  process.exit(1);
}

const wb = XLSX.readFile(input);

function sheet(name) {
  if (!wb.Sheets[name]) {
    console.error(`\n  ERROR: workbook has no sheet named "${name}"`);
    console.error(`  Found: ${wb.SheetNames.join(', ')}\n`);
    process.exit(1);
  }
  return XLSX.utils.sheet_to_json(wb.Sheets[name], { defval: '' });
}

const posts  = sheet('Posts');
const slides = sheet('Slides');

// ---- group slides under their post -------------------------------------
const byPost = {};
for (const s of slides) {
  const id = String(s.post_id || '').trim();
  if (!id) continue;
  (byPost[id] = byPost[id] || []).push(s);
}

const out = [];
const problems = [];

for (const p of posts) {
  const id = String(p.post_id || '').trim();
  if (!id) continue;

  // Skip rows Claude has not populated yet
  if (String(p.status || '').toUpperCase().includes('PENDING')) {
    console.log(`  skipping ${id} — marked PENDING`);
    continue;
  }

  const mySlides = (byPost[id] || []).sort(
    (a, b) => Number(a.slide_no) - Number(b.slide_no)
  );

  const declared = Number(p.slide_count) || 0;

  if (mySlides.length === 0) {
    problems.push(`${id}: no slide rows found`);
    continue;
  }
  if (declared && mySlides.length !== declared) {
    problems.push(
      `${id}: slide_count says ${declared} but ${mySlides.length} slide rows exist`
    );
  }
  if (mySlides.length < 5 || mySlides.length > 7) {
    problems.push(
      `${id}: ${mySlides.length} slides — system allows 5, 6 or 7 only`
    );
  }

  out.push({
    post_id:      id,
    live_date:    String(p.live_date || ''),
    day:          String(p.day || ''),
    service:      String(p.service || ''),
    bucket:       String(p.bucket || ''),
    design_set:   String(p.design_set || 'A').trim().toUpperCase(),
    slide_count:  mySlides.length,
    caption_linkedin:  String(p.caption_linkedin  || ''),
    caption_instagram: String(p.caption_instagram || ''),
    alt_text:     String(p.alt_text || ''),
    slides: mySlides.map(s => ({
      slide_no:        Number(s.slide_no),
      block_type:      String(s.block_type || 'text').trim(),
      headline:        String(s.headline || ''),
      body:            String(s.body || ''),
      annotation_word: String(s.annotation_word || ''),
      annotation_type: String(s.annotation_type || '').trim(),
      visual_spec:     String(s.visual_spec || ''),
      image_prompt:    String(s.image_prompt || ''),
      extra:           String(s.extra || '')
    }))
  });
}

if (problems.length) {
  console.error('\n  VALIDATION PROBLEMS:');
  problems.forEach(p => console.error('   - ' + p));
  console.error('');
  if (process.env.STRICT === '1') process.exit(1);
}

fs.mkdirSync('build', { recursive: true });
fs.writeFileSync('build/slides.json', JSON.stringify(out, null, 2));

const total = out.reduce((n, p) => n + p.slides.length, 0);
console.log(`\n  parsed ${out.length} posts / ${total} slides -> build/slides.json\n`);
