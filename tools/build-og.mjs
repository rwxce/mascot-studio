// Regenerate site/og/{en,es,ca}.png (1200x630 social cards).  node tools/build-og.mjs
import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { ui } from '../site/i18n.mjs';

const logo = readFileSync('site/logo.svg', 'utf8');
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const loc of Object.keys(ui)) {
  await page.setContent(`<body style="margin:0;width:1200px;height:630px;background:radial-gradient(600px 420px at 80% 40%,rgba(62,211,190,.22),#0F0F17 70%);color:#F4F2EC;font-family:'Helvetica Neue',Arial,sans-serif;display:flex;flex-direction:column;justify-content:center;padding:0 90px;box-sizing:border-box">
<div style="display:flex;align-items:center;gap:20px"><div style="width:72px;height:72px">${logo}</div><span style="font-size:44px;font-weight:700;letter-spacing:-.01em">mascot-studio</span></div>
<h1 style="font-size:84px;line-height:1.02;letter-spacing:-.035em;margin:44px 0 26px;max-width:960px">${ui[loc].og}</h1>
<p style="font-size:30px;color:#B4B3C2;margin:0">${ui[loc].ogSub}</p></body>`);
  await page.screenshot({ path: `site/og/${loc}.png` });
}
await browser.close();
