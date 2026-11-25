// Face geometry with one fixed command list, so every pose of a lid, lash or mouth blends
// with every other: a "lens" is M + 4 C + Z, starting at its left point, running along the top
// to the right point and back along the bottom. Crescents, closed-eye curves, happy arcs, half
// discs and ellipses are all lenses.
import type { PathSpec, Seg } from '../morph.js';

export type Pt = readonly [number, number];
const K = 0.5523;

/** Cubic halves of the parabola through a → b → c (exact). */
function parabola(a: Pt, b: Pt, c: Pt): [Seg, Seg] {
  const d0 = [(-3 * a[0] + 4 * b[0] - c[0]) / 2, (-3 * a[1] + 4 * b[1] - c[1]) / 2];
  const d1 = [(c[0] - a[0]) / 2, (c[1] - a[1]) / 2];
  const d2 = [(a[0] - 4 * b[0] + 3 * c[0]) / 2, (a[1] - 4 * b[1] + 3 * c[1]) / 2];
  return [
    ['C', a[0] + d0[0] / 3, a[1] + d0[1] / 3, b[0] - d1[0] / 3, b[1] - d1[1] / 3, b[0], b[1]],
    ['C', b[0] + d1[0] / 3, b[1] + d1[1] / 3, c[0] - d2[0] / 3, c[1] - d2[1] / 3, c[0], c[1]],
  ];
}

/** A lens from `left` over `top` to `right`, back under `bottom`. Crescent when both bulge the same way. */
export function lens(left: Pt, top: Pt, right: Pt, bottom: Pt): PathSpec {
  return [['M', left[0], left[1]], ...parabola(left, top, right), ...parabola(right, bottom, left), ['Z']];
}

/** An ellipse as a lens (same commands as `lens`, same start point). */
export function ellipseLens(a: number, b: number, cx = 0, cy = 0): PathSpec {
  return [
    ['M', cx - a, cy],
    ['C', cx - a, cy - K * b, cx - K * a, cy - b, cx, cy - b],
    ['C', cx + K * a, cy - b, cx + a, cy - K * b, cx + a, cy],
    ['C', cx + a, cy + K * b, cx + K * a, cy + b, cx, cy + b],
    ['C', cx - K * a, cy + b, cx - a, cy + K * b, cx - a, cy],
    ['Z'],
  ];
}

/** A flat lens that draws nothing (the "open" pose of a lid that only shows when closing). */
export const nothing = (y = 0, w = 1): PathSpec => lens([-w, y], [0, y], [w, y], [0, y]);

/** Three rectangles (pixel art); every pose is three rects so they blend. */
export function rects(r: readonly (readonly [number, number, number, number])[]): PathSpec {
  const out: Seg[] = [];
  for (const [x0, y0, x1, y1] of r) out.push(['M', x0, y0], ['L', x1, y0], ['L', x1, y1], ['L', x0, y1], ['Z']);
  return out;
}

/** Mirror a path left↔right (left eyes are mirrored right eyes). */
export function mirror(p: PathSpec): PathSpec {
  return p.map((s) => (s[0] === 'Z' ? s : (s.map((v, i) => (i > 0 && i % 2 === 1 ? -(v as number) : v)) as unknown as Seg)));
}

const r2 = (n: number) => Math.round(n * 100) / 100;
/** Path data for a spec (for static shapes). */
export const d = (p: PathSpec) => p.map((s) => s[0] + s.slice(1).map((v) => r2(v as number)).join(' ')).join('');
