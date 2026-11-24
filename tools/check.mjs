// pnpm check [mascot…] — every rule a mascot must pass before it ships (see CRAFT.md).
// Static rules (mascot.json against its anatomy) and rendered rules (every action, frame by
// frame: stays in frame, no jumps, frame 0 is a good drawing, unique ids, JS budget, size).
import { chromium } from '@playwright/test';
import { gzipSync } from 'node:zlib';
import { createServer } from 'vite';

const want = process.argv.slice(2);
const server = await createServer({ root: 'playground', server: { port: 0 }, logLevel: 'error' });
await server.listen();
const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.goto(`${server.resolvedUrls.local[0]}check.html`);
await page.waitForFunction(() => window.__check);
const names = want.length ? want : await page.evaluate(() => window.__names());
let failed = 0;
for (const name of names) {
  await page.evaluate(() => { document.getElementById('stage').innerHTML = ''; document.getElementById('twin').innerHTML = ''; });
  const res = await page.evaluate((n) => window.__check(n), name);
  const issues = [...res.issues];
  if (res.stats) {
    const svg = await page.evaluate(() => document.querySelector('#stage svg').outerHTML);
    const kb = gzipSync(svg).length / 1024;
    if (kb > 30) issues.push({ rule: 'budget-size', where: 'svg', message: `${kb.toFixed(1)} KB gzipped (max 30 KB)` });
    res.stats.svgGzipKB = +kb.toFixed(1);
  }
  if (errors.length) issues.push({ rule: 'no-errors', where: 'page', message: errors.splice(0).join(' | ') });
  const ok = issues.length === 0;
  if (!ok) failed++;
  console.log(`${ok ? '✓' : '✗'} ${name}${res.stats ? `  (${res.stats.actions} actions, ${res.stats.frames} frames, ${res.stats.avgMs} ms/frame, ${res.stats.svgGzipKB} KB)` : ''}`);
  for (const i of issues) console.log(`    ${i.rule}  ${i.where}: ${i.message}`);
}
await browser.close();
await server.close();
process.exit(failed ? 1 : 0);
