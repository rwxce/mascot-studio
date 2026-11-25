// Marks: small cartoon signs a style may add (form.marks). They are driven by channels every
// face already has, so no action needs to know about them:
//   sweat        a drop at the temple on surprise (eyes.scale up)
//   blush-lines  short hatched strokes over the cheeks when blushing or squinting happily
//   speed-lines  streaks under the body while it is in the air
import { darken } from '../color.js';
import type { Part, Rig, Shape } from '../rig.js';
import type { Painter } from '../style.js';
import type { MarkKind } from '../form.js';
import type { Pose } from '../timeline.js';

const det = (s: Shape): Shape => ({ ...s, kind: 'detail' });
const clamp = (v: number) => Math.max(0, Math.min(1, v));

export interface MarkPlaces {
  /** Temple where the sweat drop sits (body coordinates) and its size. */
  sweat: [number, number, number];
  /** Cheek centres. */
  cheeks: [[number, number], [number, number]];
  /** Half width of the streaks and the y where they start. */
  speed: [number, number];
}

export function markParts(marks: readonly MarkKind[], at: MarkPlaces, paint: Painter): { face: Part[]; behind: Part[] } {
  const face: Part[] = [], behind: Part[] = [];
  const ink = paint.flat('ink');
  if (marks.includes('blush-lines')) {
    const c = paint.flat('cheek');
    const line = /^#/.test(c) ? darken(c, 0.2) : c;
    let dd = '';
    for (const [cx, cy] of at.cheeks) for (let i = -1; i <= 1; i++) dd += `M${cx + i * 3 - 1.4} ${cy + 1.8}L${cx + i * 3 + 1.4} ${cy - 1.8}`;
    face.push({ id: 'blushLines', shapes: [det({ d: dd, stroke: line, width: 1.3 })] });
  }
  if (marks.includes('sweat')) {
    const [x, y, s] = at.sweat;
    face.push({
      id: 'sweat', at: [x, y], shapes: [det({
        d: `M0 ${-s}C${s * 0.35} ${-s * 0.35} ${s * 0.62} ${s * 0.05} ${s * 0.62} ${s * 0.38}C${s * 0.62} ${s * 0.78} ${s * 0.34} ${s} 0 ${s}C${-s * 0.34} ${s} ${-s * 0.62} ${s * 0.78} ${-s * 0.62} ${s * 0.38}C${-s * 0.62} ${s * 0.05} ${-s * 0.35} ${-s * 0.35} 0 ${-s}Z`,
        fill: paint.flat('shine'), stroke: ink, width: Math.max(0.8, paint.lineWidth(1.8)),
      })],
    });
  }
  if (marks.includes('speed-lines')) {
    const [w, y0] = at.speed;
    let dd = '';
    for (const [k, l] of [[-1, 12], [-0.45, 18], [0.1, 14], [0.6, 18], [1, 10]] as const) dd += `M${k * w} ${y0}L${k * w} ${y0 + l}`;
    behind.push({ id: 'speed', shapes: [det({ d: dd, stroke: ink, width: 1.4, opacity: 0.8 })] });
  }
  return { face, behind };
}

export function renderMarks(rig: Rig, p: Pose, marks: readonly MarkKind[], lift: number) {
  if (!marks.length) return;
  if (marks.includes('blush-lines')) rig.opacity('blushLines', Math.max(clamp(p['face.blush']), clamp(p['eyes.happy']) * 0.75));
  if (marks.includes('sweat')) {
    const k = clamp((p['eyes.scale'] - 1.3) * 6);
    rig.opacity('sweat', k);
    rig.set('sweat', { y: (1 - k) * -3, sx: 0.7 + 0.3 * k, sy: 0.7 + 0.3 * k });
  }
  if (marks.includes('speed-lines')) rig.opacity('speed', clamp((lift - 6) / 10));
}
