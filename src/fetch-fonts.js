#!/usr/bin/env node
/**
 * fetch-fonts.js — vendors Poppins, Instrument Serif and Caveat into
 * src/templates/fonts/ and rewrites base.css to use local @font-face rules.
 *
 *   npm run fonts
 *
 * Run this once. After it, renders work offline and are byte-reproducible —
 * you are no longer depending on Google Fonts being reachable at build time.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const OUT = path.join(__dirname, 'templates', 'fonts');
fs.mkdirSync(OUT, { recursive: true });

const CSS_URL =
  'https://fonts.googleapis.com/css2' +
  '?family=Poppins:wght@400;500;600;700' +
  '&family=Instrument+Serif:ital@0;1' +
  '&family=Caveat:wght@400;600' +
  '&display=swap';

// Ask for woff2 by presenting a modern UA.
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 ' +
           '(KHTML, like Gecko) Chrome/120.0 Safari/537.36';

function get(url, headers = {}) {
  return new Promise((res, rej) => {
    https.get(url, { headers: { 'User-Agent': UA, ...headers } }, r => {
      if (r.statusCode >= 300 && r.statusCode < 400 && r.headers.location)
        return res(get(r.headers.location, headers));
      const chunks = [];
      r.on('data', c => chunks.push(c));
      r.on('end', () => res(Buffer.concat(chunks)));
    }).on('error', rej);
  });
}

(async () => {
  console.log('  fetching font CSS...');
  let css = (await get(CSS_URL)).toString('utf8');

  const urls = [...css.matchAll(/url\((https:\/\/[^)]+\.woff2)\)/g)].map(m => m[1]);
  const unique = [...new Set(urls)];
  console.log(`  ${unique.length} font files to download`);

  for (const u of unique) {
    const name = path.basename(new URL(u).pathname);
    const buf = await get(u);
    fs.writeFileSync(path.join(OUT, name), buf);
    css = css.split(u).join(`fonts/${name}`);
    console.log('   ✓ ' + name);
  }

  fs.writeFileSync(path.join(OUT, '..', 'fonts.css'), css);

  // swap the @import in base.css for a local import
  const basePath = path.join(__dirname, 'templates', 'base.css');
  let base = fs.readFileSync(basePath, 'utf8');
  base = base.replace(
    /@import url\('https:\/\/fonts\.googleapis\.com[^']*'\);/,
    "@import url('fonts.css');"
  );
  fs.writeFileSync(basePath, base);

  console.log('\n  fonts vendored. base.css now imports fonts.css locally.');
  console.log('  Renders no longer require network access.\n');
})();
