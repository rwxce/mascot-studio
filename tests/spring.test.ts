import { describe, expect, it } from 'vitest';
import { stepSpring } from '../kit/spring';

const run = (damping: number, dt: number, total = 3000) => {
  const s = { value: 0, velocity: 0 };
  let max = 0;
  for (let t = 0; t < total; t += dt) {
    stepSpring(s, 1, dt, { freq: 2, damping });
    max = Math.max(max, s.value);
  }
  return { s, max };
};

describe('stepSpring', () => {
  it('settles on the target', () => {
    for (const z of [0.3, 1, 1.6]) expect(run(z, 16).s.value).toBeCloseTo(1, 3);
  });
  it('underdamped overshoots, critical does not', () => {
    expect(run(0.3, 16).max).toBeGreaterThan(1.2);
    expect(run(1, 16).max).toBeLessThanOrEqual(1 + 1e-9);
  });
  it('is frame-rate independent (closed form)', () => {
    const a = { value: 0, velocity: 0 };
    const b = { value: 0, velocity: 0 };
    for (let i = 0; i < 60; i++) stepSpring(a, 1, 1000 / 60, { freq: 2, damping: 0.4 });
    for (let i = 0; i < 30; i++) stepSpring(b, 1, 1000 / 30, { freq: 2, damping: 0.4 });
    expect(a.value).toBeCloseTo(b.value, 6);
  });
});
