import { describe, expect, it } from 'vitest';
import { bezier, flow, seg, track, EASE_IN_OUT } from '../kit/motion';

describe('bezier', () => {
  it('matches the endpoints and is monotone for an ease curve', () => {
    const f = bezier(0.23, 1, 0.32, 1);
    expect(f(0)).toBe(0);
    expect(f(1)).toBe(1);
    let prev = 0;
    for (let x = 0.01; x <= 1; x += 0.01) {
      const y = f(x);
      expect(y).toBeGreaterThanOrEqual(prev - 1e-9);
      prev = y;
    }
  });
  it('linear control points give a straight line', () => {
    const f = bezier(0.25, 0.25, 0.75, 0.75);
    expect(f(0.3)).toBeCloseTo(0.3, 4);
  });
  it('ease-in-out crosses the middle near half way', () => {
    expect(EASE_IN_OUT(0.5)).toBeGreaterThan(0.4); expect(EASE_IN_OUT(0.5)).toBeLessThan(0.65);
  });
});

describe('track / flow / seg', () => {
  it('track holds the ends and hits every key', () => {
    const k = [[0, 0], [100, 10], [200, 0]] as const;
    expect(track(-5, k)).toBe(0);
    expect(track(100, k)).toBe(10);
    expect(track(300, k)).toBe(0);
  });
  it('flow passes through keys without overshooting them', () => {
    const k = [[0, 0], [100, 10], [200, 10], [300, 0]] as const;
    for (let t = 0; t <= 300; t += 5) {
      const v = flow(t, k);
      expect(v).toBeGreaterThanOrEqual(-1e-9);
      expect(v).toBeLessThanOrEqual(10 + 1e-9);
    }
    expect(flow(100, k)).toBeCloseTo(10, 6);
  });
  it('flow keeps moving through a middle key of a rising chain', () => {
    const k = [[0, 0], [100, 5], [200, 10]] as const;
    expect(flow(101, k) - flow(99, k)).toBeGreaterThan(0.05);
  });
  it('seg is 0 before, 1 after', () => {
    expect(seg(0, 10, 20)).toBe(0);
    expect(seg(30, 10, 20)).toBe(1);
  });
});
