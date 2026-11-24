import { describe, expect, it } from 'vitest';
import { Director, type Action } from '../kit/director';

type P = { v: number; names: string[] };
const act = (name: string, weight = 1): Action<P> => ({
  name, duration: 1000, weight, apply(p, _u, e) { p.v += e; p.names.push(name); },
});

const run = (d: Director<P>, until: number) => {
  const seen: string[] = [];
  for (let t = 0; t < until; t += 16) {
    const p = { v: 0, names: [] as string[] };
    d.update(p, t);
    const n = p.names[0];
    if (n && seen[seen.length - 1] !== n) seen.push(n);
  }
  return seen;
};

describe('Director', () => {
  it('never plays the same idle action twice in a row', () => {
    const seen = run(new Director([act('a'), act('b'), act('c')]), 60000);
    expect(seen.length).toBeGreaterThan(8);
    for (let i = 1; i < seen.length; i++) expect(seen[i]).not.toBe(seen[i - 1]);
  });
  it('is deterministic for the same salt', () => {
    const a = run(new Director([act('a'), act('b'), act('c')], { salt: 3 }), 30000);
    const b = run(new Director([act('a'), act('b'), act('c')], { salt: 3 }), 30000);
    expect(a).toEqual(b);
  });
  it('plays a queued showreel in order, then reactions on request', () => {
    const d = new Director([act('a'), act('b'), act('x', 0)]);
    d.reset(0);
    d.enqueue('x', 'a');
    expect(run(d, 2900).slice(0, 2)).toEqual(['x', 'a']);
  });
  it('fades the action in and out', () => {
    const d = new Director([act('a')], { gap: [0, 0] });
    d.reset(0);
    d.enqueue('a');
    const p0 = { v: 0, names: [] as string[] };
    d.update(p0, 0);
    const p1 = { v: 0, names: [] as string[] };
    d.update(p1, 500);
    expect(p0.v).toBe(0);
    expect(p1.v).toBe(1);
  });
});
