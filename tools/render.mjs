// Render a mascot deterministically, frame by frame, with Playwright, then encode with ffmpeg.
//   node tools/render.mjs <mascot> [--reel a,b,c] [--ms 12000] [--fps 30] [--width 520]
//                         [--out out/<mascot>] [--stills 0,1500,3000] [--sheet 12]
// Outputs <out>.mp4, <out>.gif (README size), optional stills and a contact sheet.
import { chromium } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { createServer } from 'vite';

const args = process.argv.slice(2);
const id = args[0];
if (!id) throw new Error('usage: node tools/render.mjs <mascot> [--reel a,b] [--ms 12000]');
const opt = (k, d) => (args.includes(`--${k}`) ? args[args.indexOf(`--${k}`) + 1] : d);
const reel = opt('reel', '') ? opt('reel', '').split(',') : [];
const ms = Number(opt('ms', 12000));
const fps = Number(opt('fps', 30));
const width = Number(opt('width', 520));
const out = opt('out', `out/${id}`);
const stills = opt('stills', '') ? opt('stills', '').split(',').map(Number) : [];
const sheet = Number(opt('sheet', 0));
const style = opt('style', '');

const server = await createServer({ root: 'playground', server: { port: 0 }, logLevel: 'error' });
await server.listen();
const url = server.resolvedUrls.local[0];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: width + 40, height: 600 }, deviceScaleFactor: 2 });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.goto(`${url}?export&only=${id}${style ? `&style=${style}` : ''}`);
await page.waitForFunction(() => window.__mascots);
await page.addStyleTag({ content: `body.export .card { width: ${width}px }` });
await page.evaluate(([id, reel]) => window.__reset(id, reel), [id, reel]);
const card = await page.$(`#card-${id}`);
const frames = join(dirname(out), `.frames-${id}`);
rmSync(frames, { recursive: true, force: true });
mkdirSync(frames, { recursive: true });
const step = 1000 / fps;
const n = Math.round(ms / step);
for (let i = 0; i < n; i++) {
  await page.evaluate(([t, dt]) => window.__render(t, dt), [i * step, step]);
  await card.screenshot({ path: join(frames, `${String(i).padStart(5, '0')}.png`) });
  const t = Math.round(i * step);
  if (stills.some((s) => Math.abs(s - t) < step / 2)) await card.screenshot({ path: `${out}-${t}.png` });
}
await browser.close();
await server.close();
if (errors.length) console.error('page errors:', errors);

const ff = (...a) => execFileSync('ffmpeg', ['-loglevel', 'error', '-y', ...a]);
const input = ['-framerate', String(fps), '-i', join(frames, '%05d.png')];
ff(...input, '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', `${out}.mp4`);
ff(...input, '-vf', `fps=${Math.min(fps, 30)},scale=${width}:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=256:stats_mode=diff[p];[b][p]paletteuse=dither=sierra2_4a:diff_mode=rectangle`, `${out}.gif`);
if (sheet) {
  const every = Math.max(1, Math.round(n / sheet));
  ff(...input, '-vf', `select='not(mod(n\\,${every}))',scale=260:-1,tile=${Math.min(sheet, 6)}x${Math.ceil(sheet / 6)}`, '-frames:v', '1', `${out}-sheet.png`);
}
rmSync(frames, { recursive: true, force: true });
console.log(`rendered ${id}: ${n} frames → ${out}.mp4, ${out}.gif${sheet ? `, ${out}-sheet.png` : ''}`);
