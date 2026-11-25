// The original eye: a filled ellipse that blinks to a slit, squints into a happy arc and may
// carry one round shine. Kept byte for byte: it is the eye every style had before forms.
import { blendPaths, parse, type PathSpec } from '../morph.js';
import type { Part, Rig } from '../rig.js';
import type { Painter } from '../style.js';
import type { Pose } from '../timeline.js';

const K = 0.5523;
export const ellipsePath = (a: number, b: number, cx = 0, cy = 0) =>
  parse(`M${cx} ${cy - b}C${cx + K * a} ${cy - b} ${cx + a} ${cy - K * b} ${cx + a} ${cy}C${cx + a} ${cy + K * b} ${cx + K * a} ${cy + b} ${cx} ${cy + b}C${cx - K * a} ${cy + b} ${cx - a} ${cy + K * b} ${cx - a} ${cy}C${cx - a} ${cy - K * b} ${cx - K * a} ${cy - b} ${cx} ${cy - b}Z`);

export interface EyePoses {
  open: PathSpec;
  shut: PathSpec;
  happy: PathSpec;
  rx: number;
  ry: number;
}

/** Open, shut and happy (an arc) poses for an eye of radii rx × ry. */
export function eyePoses(rx: number, ry: number): EyePoses {
  const w = rx * 1.2, h = ry * 0.55;
  return {
    rx, ry,
    open: ellipsePath(rx, ry),
    shut: ellipsePath(rx * 1.05, Math.max(0.9, ry * 0.14)),
    happy: parse(`M0 ${-h}C${w * 0.6} ${-h} ${w} ${-h * 0.2} ${w} ${h * 0.6}C${w * 0.8} ${h * 0.6} ${w * 0.5} ${-h * 0.3} 0 ${-h * 0.3}C${-w * 0.5} ${-h * 0.3} ${-w * 0.8} ${h * 0.6} ${-w} ${h * 0.6}C${-w} ${-h * 0.2} ${-w * 0.6} ${-h} 0 ${-h}Z`),
  };
}

/** An eye part (with its shine when the style has one). `colour` defaults to the eye role. */
export function eyePart(side: 'L' | 'R', at: [number, number], e: EyePoses, paint: Painter, colour?: string): Part {
  return {
    id: `eye${side}`, at, shapes: [
      { kind: 'detail', pathRef: `eye${side}`, fill: colour ?? paint.flat('eye') },
      ...(paint.shine ? [{ kind: 'detail' as const, el: { tag: 'circle', attrs: { cx: -e.rx * 0.32, cy: -e.ry * 0.36, r: Math.max(1.2, e.rx * 0.36), fill: paint.flat('shine') } }, ref: 'shine' }] : []),
    ],
  };
}

/** Draw both eyes from the pose (eyes.open, eyes.happy, eyes.scale). */
export function renderEyes(rig: Rig, p: Pose, e: EyePoses) {
  const happy = Math.min(1, Math.max(0, p['eyes.happy']));
  const shut = 1 - Math.max(0, Math.min(1, p['eyes.open']));
  const path = blendPaths(e.open, [[e.shut, shut * (1 - happy)], [e.happy, happy]]);
  rig.path('eyeL', path);
  rig.path('eyeR', path);
  const s = p['eyes.scale'];
  rig.set('eyeL', { sx: s, sy: s });
  rig.set('eyeR', { sx: s, sy: s });
  rig.attr('shine', 'opacity', happy > 0.3 || shut > 0.5 ? 0 : 1);
}
