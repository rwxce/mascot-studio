// Generates styles/<id>/STYLE.md from styles/<id>/style.json, so docs and code never drift.
//   node scripts/style-docs.mjs          write every STYLE.md
//   node scripts/style-docs.mjs --check  fail if any STYLE.md is out of date (CI)
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

export function render(s) {
  const a = s.axes;
  const d = s.doc;
  return `<!-- Generated from style.json by scripts/style-docs.mjs. Edit style.json, then run it. -->
# ${s.title}

**Family:** ${s.family} · **Look:** ${s.look}

| line | fill | texture | palette | eyes | stage | rhythm |
|---|---|---|---|---|---|---|
| ${a.line} | ${a.fill} | ${a.texture} | ${a.palette} | ${a.eyes} | ${a.stage} | ${a.rhythm} |

## Essence, and what it is not
${d.essence}

${d.notIt}

## Shapes and line
${d.shapes}

## Colour
${d.colour}

## Eyes and face
${d.eyes}

## Motion
${d.motion}

## Pitfalls
${d.pitfalls.map((p) => `- ${p}`).join('\n')}

## Checklist
- \`pnpm check --style ${s.id}\` is green for every mascot.
- The look matches the line above at a glance, next to its neighbours in the gallery.
- No two styles share more than 3 of the 7 axes (\`pnpm test\`).
`;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const check = process.argv.includes('--check');
  let stale = 0;
  for (const id of readdirSync('styles', { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name)) {
    const json = JSON.parse(readFileSync(join('styles', id, 'style.json'), 'utf8'));
    const md = render(json);
    const file = join('styles', id, 'STYLE.md');
    if (check) {
      if (!existsSync(file) || readFileSync(file, 'utf8') !== md) { console.error(`stale: ${file}`); stale++; }
    } else writeFileSync(file, md);
  }
  if (stale) process.exit(1);
  console.log(check ? 'STYLE.md files are up to date.' : 'STYLE.md files written.');
}
