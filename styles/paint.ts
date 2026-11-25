// Small helpers shared by several style painters (overlays that cover the whole viewBox,
// seeded scatter). Not a style itself: it lives beside the style folders, not in one.
import { seeded } from '../kit/motion.js';
import type { Part, Shape } from '../kit/rig.js';
import { det } from '../kit/stylekit.js';

/** One rect over the whole viewBox, filled with a colour, gradient or pattern. */
export const cover = (fill: string, opacity = 1) => (box: [number, number, number, number]): Part[] => [{
  shapes: [det({ el: { tag: 'rect', attrs: { x: box[0], y: box[1], width: box[2], height: box[3], fill, opacity } } })],
}];

/** Several covers in one overlay, drawn in order. */
export const covers = (...fills: [string, number?][]) => (box: [number, number, number, number]): Part[] =>
  fills.map(([fill, o]) => cover(fill, o ?? 1)(box)[0]);

/** Deterministic pseudo-random number in [0, 1) for scatter i, channel k. */
export const rnd = (i: number, k: number) => seeded(i, k);

/** A fixed number with one decimal, for compact path data. */
export const f1 = (n: number) => n.toFixed(1);

/** A detail circle (stage decoration). */
export const dot = (cx: number, cy: number, r: number, fill: string, opacity = 1): Shape =>
  det({ el: { tag: 'circle', attrs: { cx: f1(cx), cy: f1(cy), r: f1(r), fill, opacity } } });

/** A detail rect (stage decoration). */
export const box = (x: number, y: number, width: number, height: number, attrs: Record<string, string | number>): Shape =>
  det({ el: { tag: 'rect', attrs: { x: f1(x), y: f1(y), width: f1(width), height: f1(height), ...attrs } } });

/** A detail <path> element with any path syntax (bypasses the rig's morph parser, which only
 *  takes absolute M L Q C Z): stage and overlay decoration that never morphs. */
export const path = (d: string, attrs: Record<string, string | number>): Shape =>
  det({ el: { tag: 'path', attrs: { d, fill: 'none', ...attrs } } });
