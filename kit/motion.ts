// Motion engine: a web port of rossark-motion-skill's motion.ts (MIT, Ross — see NOTICE).
// The math is unchanged; Reanimated curves become a local cubic-bezier solver, and the
// worklet clock becomes kit/clock.ts. Everything here is pure: same input, same output.

export type Curve = (p: number) => number;

/** CSS-style cubic-bezier(x1, y1, x2, y2) as a function of progress. */
export function bezier(x1: number, y1: number, x2: number, y2: number): Curve {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sy = (t: number) => ((ay * t + by) * t + cy) * t;
  const dx = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  return (x) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) {
      const d = dx(t);
      if (Math.abs(d) < 1e-7) break;
      t -= (sx(t) - x) / d;
    }
    // Newton can leave [0, 1] on steep curves: finish with bisection.
    if (t < 0 || t > 1 || Math.abs(sx(t) - x) > 1e-5) {
      let lo = 0, hi = 1;
      t = x;
      for (let i = 0; i < 30; i++) {
        if (sx(t) < x) lo = t; else hi = t;
        t = (lo + hi) / 2;
      }
    }
    return sy(t);
  };
}

/** Things that travel (gaze, sway, a head turning, a lid closing). */
export const EASE_IN_OUT = bezier(0.77, 0, 0.175, 1);
/** Things that open or arrive (a mouth, a lid reopening, a prop appearing). */
export const EASE_OUT = bezier(0.23, 1, 0.32, 1);
/** Only for things leaving or falling away. Never for something the eye waits on. */
export const EASE_IN = bezier(0.55, 0, 1, 0.45);

/** A keyframe: time (ms), value, and the curve of the segment ARRIVING at it. */
export type Key = readonly [number, number, ('out' | 'in' | 'inOut')?];

/** Value of a keyframe track at `t`. Eases in and out of every key (one move: a blink, a lid). */
export function track(t: number, keys: readonly Key[]): number {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const k1 = keys[i];
    if (t <= k1[0]) {
      const k0 = keys[i - 1];
      const span = k1[0] - k0[0];
      const p = span > 0 ? (t - k0[0]) / span : 1;
      const e = k1[2] === 'out' ? EASE_OUT(p) : k1[2] === 'in' ? EASE_IN(p) : EASE_IN_OUT(p);
      return k0[1] + (k1[1] - k0[1]) * e;
    }
  }
  return keys[keys.length - 1][1];
}

export type FlowKey = readonly [number, number];

/**
 * A smooth path through key poses (monotone cubic): acting without stopping at every pose
 * and without overshooting one. Repeat a value to hold.
 */
export function flow(t: number, k: readonly FlowKey[]): number {
  const n = k.length;
  if (t <= k[0][0]) return k[0][1];
  if (t >= k[n - 1][0]) return k[n - 1][1];
  let i = 0;
  while (k[i + 1][0] < t) i++;
  const slope = (j: number) => (k[j + 1][1] - k[j][1]) / (k[j + 1][0] - k[j][0]);
  const tangent = (j: number) => {
    if (j === 0 || j === n - 1) return 0;
    const a = slope(j - 1), b = slope(j);
    if (a * b <= 0) return 0;
    const h0 = k[j][0] - k[j - 1][0], h1 = k[j + 1][0] - k[j][0];
    const w0 = 2 * h1 + h0, w1 = h1 + 2 * h0;
    return (w0 + w1) / (w0 / a + w1 / b);
  };
  const h = k[i + 1][0] - k[i][0];
  const s = (t - k[i][0]) / h, s2 = s * s, s3 = s2 * s;
  return (2 * s3 - 3 * s2 + 1) * k[i][1] + (s3 - 2 * s2 + s) * h * tangent(i) +
    (-2 * s3 + 3 * s2) * k[i + 1][1] + (s3 - s2) * h * tangent(i + 1);
}

/** 0 → 1 inside [a, b] (eased), 0 before, 1 after. One beat of a scene. */
export function seg(t: number, a: number, b: number, curve: 'out' | 'inOut' | 'in' = 'out'): number {
  if (t <= a) return 0;
  if (t >= b) return 1;
  const p = (t - a) / (b - a);
  return curve === 'out' ? EASE_OUT(p) : curve === 'in' ? EASE_IN(p) : EASE_IN_OUT(p);
}

/** Smooth -1..1 back-and-forth. `phase` (0..1) offsets one item from the next. */
export const wave = (t: number, period: number, phase = 0) => Math.sin((t / period + phase) * Math.PI * 2);
/** Progress through a loop, 0..1. */
export const loop = (t: number, period: number, phase = 0) => {
  const p = (t / period + phase) % 1;
  return p < 0 ? p + 1 : p;
};
/** 0 at both ends, 1 in the middle: fade in and out. */
export const bell = (p: number) => Math.sin(Math.PI * Math.min(1, Math.max(0, p)));
/** Stable pseudo-random number in [0, 1) for item `i`. */
export const seeded = (i: number, salt = 0) => {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
};
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
