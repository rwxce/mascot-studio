import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { eyeModels, mouthModels, browSet } from '../kit/faces/index';
import { mouthSet } from '../kit/faces/mouths';
import { DEFAULT_FORM, resolveForm, snapTime, validateForm } from '../kit/form';
import type { Rig } from '../kit/rig';
import { flat } from '../styles/flat/index';
import { styles } from '../styles/index';

const models = { eyes: Object.keys(eyeModels), mouths: Object.keys(mouthModels) };
const metas = readdirSync('styles', { withFileTypes: true }).filter((e) => e.isDirectory())
  .map((e) => JSON.parse(readFileSync(`styles/${e.name}/style.json`, 'utf8')));

/** A rig that only records what it is told (no DOM). */
function fakeRig() {
  const paths: Record<string, unknown> = {};
  return { paths, rig: { path: (r: string, p: unknown) => { paths[r] = p; }, set() {}, opacity() {}, attr() {} } as unknown as Rig };
}
const POSES = [
  { 'eyes.open': 1, 'eyes.happy': 0, 'eyes.scale': 1 },
  { 'eyes.open': 0, 'eyes.happy': 0, 'eyes.scale': 1 },
  { 'eyes.open': 0.4, 'eyes.happy': 0.6, 'eyes.scale': 1.4 },
  { 'eyes.open': 1, 'eyes.happy': 1, 'eyes.scale': 1 },
];

describe('form', () => {
  it('a style without a form resolves to the default form itself', () => {
    expect(resolveForm(undefined)).toBe(DEFAULT_FORM);
    expect(resolveForm({ corners: 0.2 }).proportions).toEqual(DEFAULT_FORM.proportions);
  });
  it('every style.json form is valid', () => {
    const issues = metas.flatMap((m) => validateForm(m.form, models).map((i) => `${m.id}: ${i.path} ${i.message}`));
    expect(issues).toEqual([]);
  });
  it('rejects unknown fields, models and out-of-range values', () => {
    const bad = validateForm({ eyes: 'nope', corners: 3, proportions: { size: 1 }, marks: ['glitter'], limbs: 'wobbly' }, models);
    expect(bad.map((i) => i.path).sort()).toEqual(['form.corners', 'form.eyes', 'form.limbs', 'form.marks', 'form.proportions.size']);
  });
  it('the styles that redraw the character carry a form', () => {
    const withForm = styles.filter((s) => s.form).map((s) => s.id).sort();
    expect(withForm).toEqual(['anime', 'bauhaus', 'brick-toy', 'cel-anime-80s', 'clay', 'comic', 'manga', 'mid-century', 'pictogram', 'pixel', 'pop-art', 'rubber-hose', 'shadow-puppet', 'ukiyo-e']);
  });
  it('snap time holds, then catches up, and never runs backwards', () => {
    let prev = -1;
    for (let t = 0; t < 2000; t += 7) { const v = snapTime(t, 1); expect(v).toBeGreaterThanOrEqual(prev); prev = v; }
    expect(snapTime(240 * 5, 1)).toBeCloseTo(240 * 5);
    expect(snapTime(123, 0)).toBe(123);
  });
});

describe('face registry', () => {
  const paint = flat.painter({ body: '#2EC4B6', eye: '#0E2A33' }, 't');
  for (const id of Object.keys(eyeModels)) {
    it(`eye model "${id}" blends every pose (same commands) and builds both eyes`, () => {
      const set = eyeModels[id].make(5, 7, paint);
      expect(set.part('L', [-11, 0]).id).toBe('eyeL');
      expect(set.part('R', [11, 0]).id).toBe('eyeR');
      const { rig } = fakeRig();
      for (const p of POSES) expect(() => set.render(rig, p as never, { x: 0.5, y: -0.5 })).not.toThrow();
    });
  }
  for (const id of Object.keys(mouthModels)) {
    it(`mouth model "${id}" blends rest, open and smile`, () => {
      const { rig, paths } = fakeRig();
      const m = mouthSet(id, 1);
      for (const p of [{ 'mouth.open': 0, 'mouth.smile': 0 }, { 'mouth.open': 1, 'mouth.smile': 1 }, { 'mouth.open': 0.3, 'mouth.smile': 0.7 }]) {
        expect(() => m.render(rig, p as never)).not.toThrow();
      }
      expect(paths.mouth).toBeTruthy();
    });
  }
  it('brows exist for every kind but none', () => {
    for (const k of ['thin', 'bold', 'anime'] as const) expect(browSet(k, 5, 7, '#000').part('R', [0, 0])).toBeTruthy();
    expect(browSet('none', 5, 7, '#000').part('R', [0, 0])).toBeNull();
  });
});
