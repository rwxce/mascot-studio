// pnpm check:styles — no two styles may look alike: renders one mascot's rest pose in every
// style, compares every pair pixel by pixel (mean absolute difference per channel, 0–255) and
// fails under the threshold.
import { chromium } from '@playwright/test';
import { createServer } from 'vite';

const THRESHOLD = Number(process.env.DISTINCT_MIN ?? 12);
const mascots = process.argv.slice(2).length ? process.argv.slice(2) : ['robot', 'fox'];
const server = await createServer({ root: 'playground', server: { port: 0 }, logLevel: 'error' });
await server.listen();
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(`${server.resolvedUrls.local[0]}check.html`);
await page.waitForFunction(() => window.__distinct);
let failed = 0;
for (const m of mascots) {
  const pairs = await page.evaluate((n) => window.__distinct(n), m);
  const close = pairs.filter((p) => p.diff < THRESHOLD);
  console.log(`${close.length ? '✗' : '✓'} ${m}: closest pairs ${pairs.slice(0, 4).map((p) => `${p.a}~${p.b} ${p.diff}`).join(', ')}`);
  for (const p of close) console.log(`    too alike: ${p.a} ~ ${p.b} (${p.diff} < ${THRESHOLD})`);
  failed += close.length;
}
await browser.close();
await server.close();
process.exit(failed ? 1 : 0);
