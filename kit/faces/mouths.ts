// Mouth models: three poses with the same commands (rest, open, smile), driven by the
// mouth.open and mouth.smile channels. Only anatomies with a mouth use them.
import { blendPaths, mapPoints, type PathSpec } from '../morph.js';
import type { Part, Rig } from '../rig.js';
import type { Pose } from '../timeline.js';
import { eyePoses } from './default.js';
import { ellipseLens, lens, rects } from './geom.js';

export interface MouthPoses { rest: PathSpec; open: PathSpec; smile: PathSpec }
export interface MouthModel { id: string; poses(scale: number): MouthPoses }

export interface MouthSet {
  part(at: [number, number], fill: string): Part;
  render(rig: Rig, p: Pose): void;
}

const sc = (p: PathSpec, s: number): PathSpec => (s === 1 ? p : mapPoints(p, (_, x, y) => [x * s, y * s]));

export const mouthModels: Record<string, MouthModel> = {
  /** The original: a small oval that opens wide or curls into a smile. */
  default: {
    id: 'default',
    poses: (s) => ({
      rest: eyePoses(3.4 * s, 4 * s).open,
      open: eyePoses(6 * s, 7.5 * s).open,
      smile: mapPoints(eyePoses(5 * s, 5.5 * s).happy, (_, x, y) => [x, -y + s]),
    }),
  },
  /** A tiny line, a small D-shaped grin, a small open oval (anime). */
  small: {
    id: 'small',
    poses: (s) => ({
      rest: sc(lens([-2.6, 0], [0, 1.1], [2.6, 0], [0, 2.3]), s),
      open: sc(ellipseLens(2.6, 3.2, 0, 1.4), s),
      smile: sc(lens([-3.6, -0.4], [0, 0.4], [3.6, -0.4], [0, 4.4]), s),
    }),
  },
  /** A wide grin at rest, a huge one when happy (rubber-hose). */
  wide: {
    id: 'wide',
    poses: (s) => ({
      rest: sc(lens([-6.5, -1.2], [0, 1.4], [6.5, -1.2], [0, 6]), s),
      open: sc(ellipseLens(6, 7, 0, 2), s),
      smile: sc(lens([-8.5, -2.6], [0, 0.8], [8.5, -2.6], [0, 9]), s),
    }),
  },
  /** Half discs and a circle (geometric). */
  geo: {
    id: 'geo',
    poses: (s) => ({
      rest: sc(lens([-4.5, 0], [0, 0], [4.5, 0], [0, 4.5]), s),
      open: sc(ellipseLens(5, 5, 0, 1.5), s),
      smile: sc(lens([-6.5, -1], [0, -1], [6.5, -1], [0, 6.2]), s),
    }),
  },
  /** Blocks of 3 px (pixel art), every stroke two blocks thick so the filter never drops it. */
  pixel: {
    id: 'pixel',
    poses: () => ({
      rest: rects([[-6, 0, 0, 6], [0, 0, 6, 6], [-6, 0, 6, 6]]),
      open: rects([[-6, -6, 6, 6], [-6, -6, 6, 0], [-6, 0, 6, 6]]),
      smile: rects([[-9, -6, -3, 0], [-3, 0, 3, 6], [3, -6, 9, 0]]),
    }),
  },
};

export const mouthModel = (id: string): MouthModel => mouthModels[id] ?? mouthModels.default;

export function mouthSet(id: string, scale: number): MouthSet {
  const m = mouthModel(id).poses(scale);
  return {
    part: (at, fill) => ({ at, shapes: [{ kind: 'detail', pathRef: 'mouth', fill }] }),
    render(rig, p) {
      const open = Math.max(0, Math.min(1, p['mouth.open']));
      rig.path('mouth', blendPaths(m.rest, [[m.open, open], [m.smile, Math.min(1, p['mouth.smile']) * (1 - open)]]));
    },
  };
}
