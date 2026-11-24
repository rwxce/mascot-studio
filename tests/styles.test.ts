import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const ids = readdirSync('styles', { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name);
const metas = ids.map((id: string) => JSON.parse(readFileSync(`styles/${id}/style.json`, 'utf8')));
const AXES = ['line', 'fill', 'texture', 'palette', 'eyes', 'stage', 'rhythm'] as const;

describe('style catalogue', () => {
  it('has at least 24 styles, each documented', () => {
    expect(metas.length).toBeGreaterThanOrEqual(24);
    for (const m of metas) {
      for (const k of ['id', 'title', 'family', 'look', 'bg', 'axes', 'doc']) expect(m[k], `${m.id}.${k}`).toBeTruthy();
      for (const a of AXES) expect(m.axes[a], `${m.id}.axes.${a}`).toBeTruthy();
    }
  });
  it('no two styles share more than 3 of the 7 axes', () => {
    const clashes: string[] = [];
    for (let i = 0; i < metas.length; i++) for (let j = i + 1; j < metas.length; j++) {
      const shared = AXES.filter((a) => metas[i].axes[a] === metas[j].axes[a]);
      if (shared.length > 3) clashes.push(`${metas[i].id} ~ ${metas[j].id}: ${shared.join(', ')}`);
    }
    expect(clashes).toEqual([]);
  });
  it('every style is registered', async () => {
    const { styles } = await import('../styles/index');
    expect(styles.map((s) => s.id).sort()).toEqual([...ids].sort());
  });
});
