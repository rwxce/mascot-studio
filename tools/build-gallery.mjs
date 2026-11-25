// Build the style gallery as ONE self-contained HTML file (CSS and JS inline): for GitHub Pages,
// for sharing, or to embed anywhere.
//   node tools/build-gallery.mjs [--out dist/gallery/index.html] [--lang en|es|ca]
// Without options it is the plain English page (what `pnpm dev` shows). tools/build-site.mjs calls
// buildGallery() once per language with the localised site header and <head> extras.
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'vite';
import { gallery, looks } from '../site/gallery-i18n.mjs';
import { families } from '../site/i18n.mjs';

const styleCount = readdirSync('styles').filter((d) => existsSync(`styles/${d}/style.json`)).length;
let compiled;
async function compile() {
  if (compiled) return compiled;
  const res = await build({
    configFile: false,
    logLevel: 'error',
    build: {
      write: false,
      minify: true,
      lib: { entry: 'playground/gallery.ts', formats: ['iife'], name: 'MascotGallery', fileName: () => 'gallery.js' },
    },
  });
  const js = (Array.isArray(res) ? res[0] : res).output.find((o) => o.type === 'chunk').code;
  return (compiled = { js, css: readFileSync('playground/gallery.css', 'utf8') });
}

/**
 * @param {{ out: string, lang?: string, header?: string, head?: string }} o
 * `header` is the site header HTML (landing links, language switch, menu); with it the page also
 * inlines site/chrome.css and site/menu.js. `head` is extra <head> markup (icon, canonical…).
 */
export async function buildGallery({ out, lang = 'en', header = '', head = '' }) {
  const { js, css } = await compile();
  const ui = gallery[lang];
  const GT = { ui, looks: looks[lang] ?? {}, fams: families[lang] ?? {} };
  const esc = (s) => s.replace(/<\/script/g, '<\\/script');
  const nav = header
    ? `<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&amp;family=JetBrains+Mono:wght@400;500&amp;family=Space+Grotesk:wght@500;600;700&amp;display=swap" rel="stylesheet">\n<style>${readFileSync('site/chrome.css', 'utf8')}</style>`
    : '';
  const desc = ui.description.replace('{n}', String(styleCount));
  const html = `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${ui.pageTitle}</title>
<meta name="description" content="${desc}">
${head}
${nav}
<style>${css}</style>
</head>
<body${header ? ' class="hasnav"' : ''}>
${header ? `<div class="ms" style="position: sticky; top: 0; z-index: 10; background: rgba(15,15,23,0.86); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); color: #F4F2EC">${header}</div>\n` : ''}<div id="app"></div>
${header ? `<script>${esc(readFileSync('site/menu.js', 'utf8'))}</script>\n` : ''}<script>window.__GT = ${esc(JSON.stringify(GT))};</script>
<script>${esc(js)}</script>
</body>
</html>
`;
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html);
  console.log(`gallery (${lang}) → ${out} (${(html.length / 1024).toFixed(0)} KB)`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  const arg = (k, d) => (args.includes(k) ? args[args.indexOf(k) + 1] : d);
  await buildGallery({ out: arg('--out', 'dist/gallery/index.html'), lang: arg('--lang', 'en') });
}
