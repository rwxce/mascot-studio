// Build the live Nodi embed (playground/embed.ts) as one minified, self-contained script.
//   node tools/build-embed.mjs [--out dist/nodi-live.js]
// The rwxce site vendors this file (site/assets/vendor/nodi-live.js): rebuild and copy it there
// whenever Nodi, the anchor anatomy or one of the bundled styles changes.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { gzipSync } from 'node:zlib';
import { build } from 'vite';

const args = process.argv.slice(2);
const out = args.includes('--out') ? args[args.indexOf('--out') + 1] : 'dist/nodi-live.js';
const res = await build({
  configFile: false,
  logLevel: 'error',
  build: {
    write: false,
    minify: true,
    lib: { entry: 'playground/embed.ts', formats: ['iife'], name: 'NodiLive', fileName: () => 'nodi-live.js' },
  },
});
const code = (Array.isArray(res) ? res[0] : res).output.find((o) => o.type === 'chunk').code;
const banner = '/*! mascot-studio · live Nodi · MIT · https://github.com/rwxce/mascot-studio */\n';
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, banner + code);
console.log(`embed → ${out} (${(code.length / 1024).toFixed(1)} KB, ${(gzipSync(code).length / 1024).toFixed(1)} KB gz)`);
