// Brows: a lens above each eye, raised by surprise (eyes.scale) and by a happy squint.
import type { Part, Rig } from '../rig.js';
import type { BrowKind } from '../form.js';
import type { Pose } from '../timeline.js';
import { d, lens, mirror } from './geom.js';
import type { PathSpec } from '../morph.js';

export interface BrowSet {
  part(side: 'L' | 'R', at: [number, number]): Part | null;
  render(rig: Rig, p: Pose): void;
}

/** Brows for an eye of half size W × H (right brow; the left one is mirrored). */
export function browSet(kind: BrowKind, W: number, H: number, fill: string): BrowSet {
  let shape: PathSpec | null = null;
  if (kind === 'thin') shape = lens([-1.1 * W, 0.12 * H], [0.15 * W, -0.22 * H], [1.5 * W, 0.2 * H], [0.15 * W, -0.06 * H]);
  if (kind === 'bold') shape = lens([-1.08 * W, 0.14 * H], [0, -0.3 * H], [1.08 * W, 0.1 * H], [0, 0.14 * H]);
  if (kind === 'anime') shape = lens([-0.7 * W, 0.08 * H], [0.1 * W, -0.14 * H], [0.85 * W, 0.04 * H], [0.1 * W, -0.02 * H]);
  return {
    part(side, at) {
      if (!shape) return null;
      return { id: `brow${side}`, at, shapes: [{ kind: 'detail', d: d(side === 'L' ? mirror(shape) : shape), fill }] };
    },
    render(rig, p) {
      if (!shape) return;
      const happy = Math.max(0, Math.min(1, p['eyes.happy']));
      const lift = Math.max(0, p['eyes.scale'] - 1) * H * 1.4 + happy * H * 0.18 + (1 - Math.max(0, Math.min(1, p['eyes.open']))) * -H * 0.12;
      const tilt = happy * 5;
      rig.set('browR', { y: -lift, rot: -tilt });
      rig.set('browL', { y: -lift, rot: tilt });
    },
  };
}
