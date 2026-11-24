import { describe, expect, it } from 'vitest';
import { applyAction, jump, trackValue } from '../kit/timeline';

describe('timeline', () => {
  it('scales add tracks by the envelope and leaves set tracks alone', () => {
    const p: Record<string, number> = { a: 1, b: 1 };
    applyAction({ name: 'x', duration: 100, tracks: [{ ch: 'a', keys: [[0, 10], [100, 10]] }, { ch: 'b', op: 'set', keys: [[0, 5], [100, 5]] }] }, p, 50, 0.5);
    expect(p.a).toBe(6);
    expect(p.b).toBe(5);
  });
  it('mul, min and max combine with the pose', () => {
    const p: Record<string, number> = { s: 2, o: 1, m: 0.2 };
    applyAction({ name: 'x', duration: 100, tracks: [
      { ch: 's', op: 'mul', keys: [[0, 1.5], [100, 1.5]] },
      { ch: 'o', op: 'min', keys: [[0, 0.3], [100, 0.3]] },
      { ch: 'm', op: 'max', keys: [[0, 0.9], [100, 0.9]] },
    ] }, p, 50, 1);
    expect(p).toEqual({ s: 3, o: 0.3, m: 0.9 });
  });
  it('osc is silent outside its window', () => {
    const tr = { ch: 'a', osc: { amp: 10, period: 400, window: [1000, 2000] as [number, number] } };
    expect(trackValue(tr, 500)).toBe(0);
    expect(Math.abs(trackValue(tr, 1600))).toBeGreaterThan(0);
  });
  it('jumps follow gravity and land back on the ground', () => {
    const j = { at: 300, air: 400, height: 20 };
    expect(jump(500, j)[0]).toBeCloseTo(-20, 5);
    expect(jump(1400, j)).toEqual([0, 1]);
    expect(jump(290, j)[1]).toBeLessThan(1);
    expect(jump(290, { ...j, startle: true })[1]).toBe(1);
  });
});
