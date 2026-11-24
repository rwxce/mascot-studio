import { describe, expect, it } from 'vitest';
import { blendPaths, lerpPath, parse, toD } from '../kit/morph';

describe('morph', () => {
  const a = parse('M0 0L10 0Q10 10 0 10Z');
  const b = parse('M0 0L20 0Q20 20 0 20Z');
  it('round-trips the authored subset', () => {
    expect(toD(a)).toBe('M0 0L10 0Q10 10 0 10Z');
  });
  it('lerps point by point', () => {
    expect(toD(lerpPath(a, b, 0.5))).toBe('M0 0L15 0Q15 15 0 15Z');
  });
  it('refuses paths with different structure', () => {
    expect(() => lerpPath(a, parse('M0 0L1 1Z'), 0.5)).toThrow();
  });
  it('blends poses on top of a base', () => {
    expect(toD(blendPaths(a, [[b, 1]]))).toBe(toD(b));
    expect(toD(blendPaths(a, [[b, 0]]))).toBe(toD(a));
  });
});
