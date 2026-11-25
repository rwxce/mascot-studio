// Build the GitHub Pages site into _site/: the landing page in en (/), es (/es/) and ca (/ca/),
// its images, the vendored Lenis, and the live style gallery at /gallery/.
//   node tools/build-site.mjs [--out _site]
import { cpSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { localise } from './site-i18n.mjs';
import { LOCALES, es, ca, ui, families } from '../site/i18n.mjs';

const args = process.argv.slice(2);
const out = args.includes('--out') ? args[args.indexOf('--out') + 1] : '_site';
const ORIGIN = 'https://rwxce.github.io/mascot-studio';
const media = ['nodi.webp', 'nodi-actions.png', 'styles-nodi.png', 'forms.png', 'robot.webp', 'fox.webp', 'ghost.webp'];
const template = readFileSync('site/index.html', 'utf8');
const dicts = { en: null, es, ca };
const path = (l) => (l === 'en' ? '/' : `/${l}/`);

for (const loc of LOCALES) {
  const base = loc === 'en' ? './' : '../';
  let html = dicts[loc] ? localise(template, dicts[loc]) : template;
  const fam = families[loc] ?? {};
  const T = JSON.stringify(ui[loc]);
  html = html
    .replace('{{lang}}', loc)
    .replace('{{T}}', T)
    .replace(/"name": "([^"]+)", "styles"/g, (m, n) => `"name": "${fam[n] ?? n}", "styles"`)
    .replace(
      '<!--HEAD-->',
      [
        '<link rel="icon" type="image/svg+xml" href="./logo.svg">',
        `<link rel="canonical" href="${ORIGIN}${path(loc)}">`,
        ...LOCALES.map((l) => `<link rel="alternate" hreflang="${l}" href="${ORIGIN}${path(l)}">`),
        `<link rel="alternate" hreflang="x-default" href="${ORIGIN}/">`,
        '<meta property="og:type" content="website">',
        `<meta property="og:title" content="mascot-studio">`,
        `<meta property="og:description" content="${ui[loc].og}">`,
        `<meta property="og:image" content="${ORIGIN}/og/${loc}.png">`,
        '<meta name="twitter:card" content="summary_large_image">',
      ].join('\n'),
    )
    .replaceAll('<!--LANGS-->', `<div role="group" aria-label="${ui[loc].lang}" style="display: flex; gap: 10px; align-items: center; font-size: 14px; font-family: 'JetBrains Mono', monospace">${LOCALES.map((l) => (l === loc ? `<span aria-current="page" style="color: #F4F2EC">${l.toUpperCase()}</span>` : `<a href="${loc === 'en' ? '.' : '..'}${path(l)}" hreflang="${l}" lang="${l}" style="color: #8E8DA0; text-decoration: none">${l.toUpperCase()}</a>`)).join('<span aria-hidden="true" style="color: #34344A">·</span>')}</div>`);
  if (loc !== 'en') html = html.replace(/(["'(])\.\/(media|gallery|vendor|logo\.svg|smooth-scroll\.js)/g, '$1../$2');
  void base;
  const file = loc === 'en' ? `${out}/index.html` : `${out}/${loc}/index.html`;
  mkdirSync(file.replace(/\/index\.html$/, ''), { recursive: true });
  writeFileSync(file, html);
}
mkdirSync(`${out}/media`, { recursive: true });
for (const f of media) cpSync(`docs/media/${f}`, `${out}/media/${f}`);
for (const f of ['logo.svg', 'smooth-scroll.js']) cpSync(`site/${f}`, `${out}/${f}`);
cpSync('site/vendor', `${out}/vendor`, { recursive: true });
cpSync('site/og', `${out}/og`, { recursive: true });
const r = spawnSync(process.execPath, ['tools/build-gallery.mjs', '--out', `${out}/gallery/index.html`], { stdio: 'inherit' });
if (r.status) process.exit(r.status);
console.log(`site → ${out}/ (en, es, ca + gallery + ${media.length} images)`);
