// Build the GitHub Pages site into _site/: the landing page (site/index.html + its images from
// docs/media) at the root and the live style gallery at /gallery/.   node tools/build-site.mjs [--out _site]
import { cpSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
const out = args.includes('--out') ? args[args.indexOf('--out') + 1] : '_site';
const media = ['nodi.webp', 'nodi-actions.png', 'styles-nodi.png', 'forms.png', 'robot.webp', 'fox.webp', 'ghost.webp'];

mkdirSync(`${out}/media`, { recursive: true });
writeFileSync(`${out}/index.html`, readFileSync('site/index.html'));
for (const f of media) cpSync(`docs/media/${f}`, `${out}/media/${f}`);
const r = spawnSync(process.execPath, ['tools/build-gallery.mjs', '--out', `${out}/gallery/index.html`], { stdio: 'inherit' });
if (r.status) process.exit(r.status);
console.log(`site → ${out}/ (landing + gallery + ${media.length} images)`);
