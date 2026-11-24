// A mascot × style matrix of stills, each on its style's background.
//   node tools/matrix.mjs [--action wave] [--at 1300] [--mascots a,b] [--styles x,y] [--out docs/media/matrix.png]
import { chromium } from '@playwright/test';
import { createServer } from 'vite';

const args = process.argv.slice(2);
const opt = (k, d) => (args.includes(`--${k}`) ? args[args.indexOf(`--${k}`) + 1] : d);
const action = opt('action', 'wave');
const at = Number(opt('at', 1300));
const out = opt('out', 'docs/media/matrix.png');
const size = Number(opt('size', 220));

const server = await createServer({ root: 'playground', server: { port: 0 }, logLevel: 'error' });
await server.listen();
const url = server.resolvedUrls.local[0];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 400, height: 400 }, deviceScaleFactor: 2 });
await page.goto(`${url}check.html`);
await page.waitForFunction(() => window.__names);
const mascots = opt('mascots', '') ? opt('mascots', '').split(',') : await page.evaluate(() => window.__names());
const styles = opt('styles', '') ? opt('styles', '').split(',') : await page.evaluate(() => window.__styles());
const meta = await page.evaluate(() => window.__styleMeta());
const rows = [];
for (const m of mascots) {
  const row = [];
  for (const s of styles) {
    await page.goto(`${url}?export&only=${m}&style=${s}`);
    await page.waitForFunction(() => window.__mascots);
    await page.addStyleTag({ content: `body.export { background: transparent } body.export .card { width: ${size}px }` });
    await page.evaluate(([m, a]) => window.__reset(m, [a]), [m, action]);
    const step = 1000 / 30;
    for (let t = 0; t <= 500 + at; t += step) await page.evaluate(([t, dt]) => window.__render(t, dt), [t, step]);
    const shot = await (await page.$(`#card-${m}`)).screenshot({ omitBackground: true });
    row.push(`data:image/png;base64,${shot.toString('base64')}`);
  }
  rows.push({ m, row });
}
const html = `<body style="margin:0;background:#0e0c14;font:600 13px ui-sans-serif,system-ui,sans-serif;color:#e9e6f2">
<table id="g" style="border-collapse:separate;border-spacing:6px;padding:8px"><tr><td></td>${styles.map((s) => `<td style="text-align:center;padding-bottom:2px">${meta[s]?.title ?? s}</td>`).join('')}</tr>
${rows.map((r) => `<tr><td style="padding-right:6px;text-align:right">${r.m}</td>${r.row.map((src) => `<td><img src="${src}" style="width:${size}px;display:block;border-radius:14px"></td>`).join('')}</tr>`).join('')}
</table></body>`;
await page.setViewportSize({ width: styles.length * (size + 6) + 160, height: 400 });
await page.setContent(html);
await (await page.$('#g')).screenshot({ path: out });
await browser.close();
await server.close();
console.log(`matrix → ${out}`);
