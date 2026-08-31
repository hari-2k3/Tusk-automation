#!/usr/bin/env node
/**
 * verify.js — run after render. Fails loudly rather than quietly shipping.
 *
 * Checks:
 *   1. every post folder has exactly slide_count PNGs
 *   2. every PNG is exactly 1080x1350
 *   3. caption + alt-text files present
 */

const fs = require('fs');
const path = require('path');

/* minimal PNG header reader — avoids pulling an image library */
function pngSize(file) {
  const fd = fs.openSync(file, 'r');
  const buf = Buffer.alloc(24);
  fs.readSync(fd, buf, 0, 24, 0);
  fs.closeSync(fd);
  if (buf.toString('ascii', 1, 4) !== 'PNG') return null;
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}

if (!fs.existsSync('build/slides.json')) {
  console.error('  ERROR: build/slides.json missing. Nothing to verify.');
  process.exit(1);
}

const posts = JSON.parse(fs.readFileSync('build/slides.json', 'utf8'));
const fails = [];

for (const post of posts) {
  const dir = path.join('output', post.post_id);

  if (!fs.existsSync(dir)) {
    fails.push(`${post.post_id}: output folder missing`);
    continue;
  }

  const pngs = fs.readdirSync(dir).filter(f => f.endsWith('.png')).sort();

  if (pngs.length !== post.slide_count) {
    fails.push(
      `${post.post_id}: expected ${post.slide_count} PNGs, found ${pngs.length}` +
      (pngs.length === 1 && post.slide_count > 1
        ? '  <-- slides may have been combined into one image'
        : '')
    );
  }

  for (const f of pngs) {
    const s = pngSize(path.join(dir, f));
    if (!s) { fails.push(`${f}: not a valid PNG`); continue; }
    if (s.w !== 1080 || s.h !== 1350)
      fails.push(`${f}: ${s.w}x${s.h} — must be 1080x1350`);
  }

  for (const suffix of ['CAPTION-linkedin', 'CAPTION-instagram', 'ALT-TEXT']) {
    const f = path.join(dir, `${post.post_id}_${suffix}.txt`);
    if (!fs.existsSync(f)) fails.push(`${post.post_id}: missing ${suffix}.txt`);
  }
}

if (fails.length) {
  console.error('\n  VERIFICATION FAILED\n');
  fails.forEach(f => console.error('   ✗ ' + f));
  console.error('\n  See AGENTS.md — "one slide = one PNG" is the rule most often broken.\n');
  process.exit(1);
}

console.log(`\n  ✓ all checks passed — ${posts.length} posts verified\n`);
console.log('  Still to check by eye:');
console.log('   - fonts rendered as Poppins / Instrument Serif / Caveat, not fallback');
console.log('   - slide 1 has no CTA, URL, phone number or logo');
console.log('   - one accent colour per slide\n');
