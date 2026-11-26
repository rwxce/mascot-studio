// Build the GitHub Pages site into _site/: the landing page in en (/), es (/es/) and ca (/ca/),
// its images, the vendored Lenis, and the live style gallery at /gallery/.
//   node tools/build-site.mjs [--out _site]
import { cpSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { localise } from './site-i18n.mjs';
import { LOCALES, es, ca, ui, families } from '../site/i18n.mjs';
import { gallery } from '../site/gallery-i18n.mjs';
import { buildGallery } from './build-gallery.mjs';

const args = process.argv.slice(2);
const out = args.includes('--out') ? args[args.indexOf('--out') + 1] : '_site';
const ORIGIN = 'https://rwxce.github.io/mascot-studio';
const media = ['nodi.webp', 'nodi-actions.png', 'styles-nodi.png', 'forms.png', 'robot.webp', 'fox.webp', 'ghost.webp'];
const template = readFileSync('site/index.html', 'utf8');
const dicts = { en: null, es, ca };
const path = (l) => (l === 'en' ? '/' : `/${l}/`);
const NAMES = { en: 'English', es: 'Español', ca: 'Català' };
const header = {};

// The language switch: a compact block on desktop, a labelled section of pills inside the mobile menu.
function langs(loc, hrefOf, mobile) {
  const items = LOCALES.map((l) => {
    const cur = l === loc;
    const cls = mobile ? 'pill' : 'lang';
    const label = mobile ? NAMES[l] : l.toUpperCase();
    return cur
      ? `<span class="${cls}" aria-current="page" lang="${l}">${label}</span>`
      : `<a class="${cls}" href="${hrefOf(l)}" hreflang="${l}" lang="${l}" data-gallery-lang="${l}">${label}</a>`;
  }).join('');
  return mobile
    ? `<div class="mlangs" role="group" aria-label="${ui[loc].lang}"><p class="mlabel" aria-hidden="true">${ui[loc].lang}</p><div class="mpills">${items}</div></div>`
    : `<div class="langs" role="group" aria-label="${ui[loc].lang}">${items}</div>`;
}

// The landing header, rewired for /gallery/ (en) or /<lang>/gallery/: anchors point back to the
// landing of the same language, "Gallery" is the current page, the switch goes to the other galleries.
function galleryHeader(loc) {
  const up = loc === 'en' ? '../' : '../../';
  let h = header[loc]
    .replaceAll('href="#top"', 'href="../"')
    .replace(/href="(#[a-z]+)"/g, 'href="../$1"')
    .replaceAll('src="./logo.svg"', `src="${up}logo.svg"`)
    .replace(/<a href="\.\/gallery\/" style="color: #B4B3C2;/, '<a href="./" aria-current="page" style="color: #F4F2EC;')
    .replace(/<a href="\.\/gallery\/" style="color: #F4F2EC;/, '<a href="./" aria-current="page" style="color: #5EE0CC;')
    .replace(/position: sticky; top: 0; z-index: 10; /, '');
  for (const l of LOCALES) h = h.replaceAll(`href="${loc === 'en' ? '.' : '..'}${path(l)}" hreflang="${l}"`, `href="${up}${l === 'en' ? '' : l + '/'}gallery/" hreflang="${l}"`);
  return h;
}

function galleryHead(loc) {
  const up = loc === 'en' ? '../' : '../../';
  const g = (l) => `${ORIGIN}${path(l)}gallery/`;
  return [
    `<link rel="icon" type="image/svg+xml" href="${up}logo.svg">`,
    `<link rel="icon" type="image/png" sizes="32x32" href="${up}favicon-32.png">`,
    `<link rel="apple-touch-icon" href="${up}apple-touch-icon.png">`,
    `<link rel="stylesheet" href="${up}vendor/lenis.css">`,
    `<script src="${up}vendor/lenis.min.js" defer></script>`,
    `<script src="${up}smooth-scroll.js" defer></script>`,
    `<link rel="canonical" href="${g(loc)}">`,
    ...LOCALES.map((l) => `<link rel="alternate" hreflang="${l}" href="${g(l)}">`),
    `<link rel="alternate" hreflang="x-default" href="${g('en')}">`,
    '<meta property="og:type" content="website">',
    `<meta property="og:title" content="${gallery[loc].pageTitle}">`,
    `<meta property="og:description" content="${gallery[loc].description.replace('{n}', '50')}">`,
    `<meta property="og:image" content="${ORIGIN}/og/${loc}.png">`,
    '<meta name="twitter:card" content="summary_large_image">',
  ].join('\n');
}

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
        '<link rel="icon" type="image/png" sizes="32x32" href="./favicon-32.png">',
        '<link rel="apple-touch-icon" href="./apple-touch-icon.png">',
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
    .replace('id="menubtn"', `id="menubtn" data-open="${ui[loc].openMenu}" data-close="${ui[loc].closeMenu}"`)
    .replace('<!--LANGS-->', langs(loc, (l) => `${loc === 'en' ? '.' : '..'}${path(l)}`, false))
    .replace('<!--LANGS-MOBILE-->', langs(loc, (l) => `${loc === 'en' ? '.' : '..'}${path(l)}`, true));
  header[loc] = html.match(/<header[\s\S]*?<\/header>/)[0];
  if (loc !== 'en') html = html.replace(/(["'(])\.\/(media|vendor|logo\.svg|favicon-32\.png|apple-touch-icon\.png|smooth-scroll\.js|chrome\.css|menu\.js)/g, '$1../$2');
  void base;
  const file = loc === 'en' ? `${out}/index.html` : `${out}/${loc}/index.html`;
  mkdirSync(file.replace(/\/index\.html$/, ''), { recursive: true });
  writeFileSync(file, html);
}
mkdirSync(`${out}/media`, { recursive: true });
for (const f of media) cpSync(`docs/media/${f}`, `${out}/media/${f}`);
for (const f of ['logo.svg', 'favicon-32.png', 'apple-touch-icon.png', 'smooth-scroll.js', 'chrome.css', 'menu.js']) cpSync(`site/${f}`, `${out}/${f}`);
cpSync('site/vendor', `${out}/vendor`, { recursive: true });
cpSync('site/og', `${out}/og`, { recursive: true });
for (const loc of LOCALES) {
  await buildGallery({ out: loc === 'en' ? `${out}/gallery/index.html` : `${out}/${loc}/gallery/index.html`, lang: loc, header: galleryHeader(loc), head: galleryHead(loc) });
}
console.log(`site → ${out}/ (en, es, ca + 3 galleries + ${media.length} images)`);
