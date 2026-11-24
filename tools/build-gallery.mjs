// Build the style gallery as ONE self-contained HTML file (CSS and JS inline): for GitHub Pages,
// for sharing, or to embed anywhere.   node tools/build-gallery.mjs [--out dist/gallery/index.html]
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { build } from 'vite';

const args = process.argv.slice(2);
const out = args.includes('--out') ? args[args.indexOf('--out') + 1] : 'dist/gallery/index.html';
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
const css = readFileSync('playground/gallery.css', 'utf8');
const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>mascot-studio — styles</title>
<meta name="description" content="Original SVG mascots in 25 styles, alive in your browser.">
<style>${css}</style>
</head>
<body>
<div id="app"></div>
<script>${js.replace(/<\/script/g, '<\\/script')}</script>
</body>
</html>
`;
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, html);
console.log(`gallery → ${out} (${(html.length / 1024).toFixed(0)} KB)`);
