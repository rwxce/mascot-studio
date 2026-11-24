// A labelled grid of stills: each action captured at its most readable moment.
//   node tools/grid.mjs <mascot> action:ms,action:ms,... [--cols 4] [--out docs/media/<mascot>-actions.png]
import { chromium } from '@playwright/test';
import { createServer } from 'vite';

const [id, list] = process.argv.slice(2);
const args = process.argv.slice(2);
const opt = (k, d) => (args.includes(`--${k}`) ? args[args.indexOf(`--${k}`) + 1] : d);
const cols = Number(opt('cols', 4));
const out = opt('out', `docs/media/${id}-actions.png`);
const items = list.split(',').map((s) => { const [name, ms] = s.split(':'); return { name, ms: Number(ms) }; });

const server = await createServer({ root: 'playground', server: { port: 0 }, logLevel: 'error' });
await server.listen();
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 400, height: 400 }, deviceScaleFactor: 2 });
await page.goto(`${server.resolvedUrls.local[0]}?export&only=${id}`);
await page.waitForFunction(() => window.__mascots);
await page.addStyleTag({ content: 'body.export, body.export .card { background: transparent } body.export .card { width: 300px }' });
const card = await page.$(`#card-${id}`);
const shots = [];
for (const { name, ms } of items) {
  await page.evaluate(([id, name]) => window.__reset(id, [name]), [id, name]);
  const step = 1000 / 30, end = 500 + ms;
  for (let t = 0; t <= end; t += step) await page.evaluate(([t, dt]) => window.__render(t, dt), [t, step]);
  shots.push({ name, src: `data:image/png;base64,${(await card.screenshot({ omitBackground: true })).toString('base64')}` });
}
const html = `<body style="margin:0;background:#FAF8F4;font:600 15px ui-sans-serif,system-ui,sans-serif;color:#141414">
<div id="g" style="display:grid;grid-template-columns:repeat(${cols},300px);gap:8px;padding:16px;width:max-content">
${shots.map((s) => `<figure style="margin:0;background:#FFFFFF;border-radius:16px;padding:6px 6px 12px;text-align:center"><img src="${s.src}" style="width:288px;display:block"><figcaption style="margin-top:2px">${s.name}</figcaption></figure>`).join('')}
</div></body>`;
await page.setViewportSize({ width: cols * 308 + 40, height: 400 });
await page.setContent(html);
await (await page.$('#g')).screenshot({ path: out });
await browser.close();
await server.close();
console.log(`grid → ${out}`);
