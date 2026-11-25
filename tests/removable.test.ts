// Extra mascots must be removable at any time: deleting a folder under mascots/ must not break
// anything. Every mascot the README does not show is an extra one, so nothing outside its own
// folder (and the CHANGELOG, which is history) may name it; the registry finds mascots by folder.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = join(__dirname, '..');
const SKIP = new Set(['node_modules', '.git', 'dist', 'out', '_site', 'mascots', 'CHANGELOG.md', 'pnpm-lock.yaml']);
const README = readFileSync(join(ROOT, 'README.md'), 'utf8');
const REMOVABLE = readdirSync(join(ROOT, 'mascots')).filter((n) => statSync(join(ROOT, 'mascots', n)).isDirectory() && !README.includes(`mascots/${n}/`));

function files(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name) || name.startsWith('.')) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) files(p, out);
    else if (/\.(ts|mjs|js|json|md|html|css|yml)$/.test(name)) out.push(p);
  }
  return out;
}

describe('example mascots are removable', () => {
  for (const name of REMOVABLE) {
    it(`nothing outside mascots/${name} names it`, () => {
      const hits = files(ROOT).filter((f) => new RegExp(`\\b${name}\\b`).test(readFileSync(f, 'utf8'))).map((f) => f.slice(ROOT.length + 1));
      expect(hits).toEqual([]);
    });
  }
  it('the registry finds mascots by folder', () => {
    const src = readFileSync(join(ROOT, 'mascots/index.ts'), 'utf8');
    expect(src).toMatch(/import\.meta\.glob/);
    for (const name of REMOVABLE) expect(src).not.toContain(name);
  });
});
