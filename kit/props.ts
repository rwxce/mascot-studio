// Props any mascot can use: a light bulb, a heart, zzz, sparkles, a music note, a question
// mark and an exclamation mark. A mascot places them with anchors in its mascot.json and
// drives them with `prop.<name>` channels from its actions:
//   prop.bulb      0/1 (pops on a spring)        prop.rays   0..1 glow and rays
//   prop.heart     0..1 progress, -1 = hidden    prop.zzz    0..1 progress, -1 = hidden
//   prop.sparkles  0..1 progress, -1 = hidden    prop.note / prop.question / prop.exclaim  0/1
import { bell, seg, wave } from './motion.js';
import type { Part, Rig, Shape } from './rig.js';
import type { Point, PropName } from './spec.js';
import { Spring1 } from './spring.js';
import type { Pose } from './timeline.js';

export interface PropColors {
  ink: string;
  prop: string;
  accent: string;
  glow: string;
}

const det = (s: Shape): Shape => ({ ...s, kind: 'detail' });
const HEART = 'M0 6C-10 -2 -12 -10 -6 -13C-2 -15 0 -12 0 -10C0 -12 2 -15 6 -13C12 -10 10 -2 0 6Z';
const STAR = 'M0 -7L1.8 -1.8L7 0L1.8 1.8L0 7L-1.8 1.8L-7 0L-1.8 -1.8Z';
const FONT = { 'font-family': 'ui-rounded, system-ui, sans-serif', 'font-weight': 800, 'text-anchor': 'middle' };

export const PROP_DEFAULTS: Pose = {
  'prop.bulb': 0, 'prop.rays': 0, 'prop.heart': -1, 'prop.zzz': -1, 'prop.sparkles': -1,
  'prop.note': 0, 'prop.question': 0, 'prop.exclaim': 0,
};

export function buildProps(anchors: Partial<Record<PropName, Point | Point[]>>, c: PropColors): Part[] {
  const parts: Part[] = [];
  const one = (k: PropName) => anchors[k] as Point | undefined;
  if (one('bulb')) {
    parts.push({
      id: 'bulb', at: one('bulb'), shapes: [
        det({ el: { tag: 'circle', attrs: { cx: 0, cy: -24, r: 24, fill: c.glow, opacity: 0 } }, ref: 'glow' }),
        det({ d: 'M0 -38C-8 -38 -14 -32 -14 -24C-14 -18 -10 -14 -7 -10L7 -10C10 -14 14 -18 14 -24C14 -32 8 -38 0 -38Z', fill: '#FFFBE6', stroke: c.ink, width: 3.5 }),
        det({ d: 'M-6 -10L6 -10L6 -2L-6 -2Z', fill: '#D9D4C7', stroke: c.ink, width: 3.5 }),
        det({ d: 'M-3 -11L-3 -22C-3 -26 3 -26 3 -22L3 -11', stroke: c.ink, width: 2 }),
        det({ d: 'M0 -46L0 -54M-17 -40L-23 -46M17 -40L23 -46M-24 -24L-32 -24M24 -24L32 -24', stroke: c.ink, width: 3, ref: 'rays' }),
      ],
    });
  }
  if (one('heart')) parts.push({ id: 'heart', at: one('heart'), shapes: [det({ d: HEART, fill: c.prop, ref: 'heart' })] });
  if (one('zzz')) {
    const [x, y] = one('zzz')!;
    [[0, 0, 16, 'z'], [12, -14, 20, 'z'], [26, -30, 24, 'Z']].forEach(([dx, dy, size, ch], i) => {
      parts.push({ id: `z${i + 1}`, at: [x + (dx as number), y + (dy as number)], shapes: [det({ el: { tag: 'text', attrs: { ...FONT, 'font-size': size as number, fill: c.ink }, text: ch as string }, ref: `z${i + 1}` })] });
    });
  }
  const sparks = anchors.sparkles as Point[] | undefined;
  sparks?.forEach((p, i) => parts.push({ id: `sp${i}`, at: p, shapes: [det({ d: STAR, fill: i % 2 ? c.accent : c.ink, ref: `sp${i}` })] }));
  const glyph = (k: PropName, text: string, color: string) => {
    if (one(k)) parts.push({ id: k, at: one(k), shapes: [det({ el: { tag: 'text', attrs: { ...FONT, 'font-size': 30, fill: color }, text }, ref: k })] });
  };
  glyph('note', '♪', c.accent);
  glyph('question', '?', c.ink);
  glyph('exclaim', '!', c.prop);
  return parts;
}

/** Per-frame prop animation from the pose. */
export function propsAnimator(anchors: Partial<Record<PropName, Point | Point[]>>) {
  const bulb = new Spring1({ freq: 3.6, damping: 0.38 });
  const heart = new Spring1({ freq: 3.4, damping: 0.4 });
  const pops = { note: new Spring1({ freq: 3.4, damping: 0.4 }), question: new Spring1({ freq: 3.4, damping: 0.4 }), exclaim: new Spring1({ freq: 4, damping: 0.35 }) };
  const sparkCount = (anchors.sparkles as Point[] | undefined)?.length ?? 0;
  return {
    reset() {
      bulb.reset(); heart.reset();
      for (const s of Object.values(pops)) s.reset();
    },
    update(rig: Rig, p: Pose, dt: number, still: boolean, t: number) {
      if (anchors.bulb) {
        const b = still ? (bulb.reset(), 0) : bulb.step(p['prop.bulb'], dt);
        rig.set('bulb', { sx: Math.max(0.001, b), sy: Math.max(0.001, b) });
        rig.attr('glow', 'opacity', 0.55 * p['prop.rays']);
        rig.attr('rays', 'opacity', p['prop.rays']);
      }
      if (anchors.heart) {
        const hp = p['prop.heart'];
        const hs = still ? (heart.reset(), 0) : heart.step(hp >= 0 && hp < 0.8 ? 1 : 0, dt);
        const w = hp >= 0 ? wave(hp * 2800, 700) : 0;
        rig.set('heart', { x: 6 * w, y: hp >= 0 ? -46 * seg(hp, 0.05, 1, 'out') : 0, sx: 1.5 * Math.max(0.001, hs), sy: 1.5 * Math.max(0.001, hs), rot: 10 * w });
        rig.attr('heart', 'opacity', hp >= 0 ? 1 - seg(hp, 0.75, 1) : 0);
      }
      if (anchors.zzz) {
        for (let i = 0; i < 3; i++) {
          const z = p['prop.zzz'];
          const local = z < 0 ? -1 : (z * 3 - i * 0.45) % 1.4;
          const o = local >= 0 && local <= 1 ? bell(local) : 0;
          rig.set(`z${i + 1}`, { x: local > 0 ? 6 * local : 0, y: local > 0 ? -10 * local : 0 });
          rig.attr(`z${i + 1}`, 'opacity', o);
        }
      }
      for (let i = 0; i < sparkCount; i++) {
        const s = p['prop.sparkles'];
        const local = s < 0 ? -1 : (s - i * 0.12) / 0.6;
        const o = local >= 0 && local <= 1 ? bell(local) : 0;
        rig.set(`sp${i}`, { rot: 90 * Math.max(0, local), sx: 0.4 + o, sy: 0.4 + o });
        rig.attr(`sp${i}`, 'opacity', o);
      }
      for (const k of ['note', 'question', 'exclaim'] as const) {
        if (!anchors[k]) continue;
        const v = still ? (pops[k].reset(), 0) : pops[k].step(p[`prop.${k}`], dt);
        const bob = k === 'note' ? wave(t, 600) * 4 : 0;
        rig.set(k, { y: bob - 6 * v, rot: k === 'note' ? 8 * wave(t, 900) : 0, sx: Math.max(0.001, v), sy: Math.max(0.001, v) });
        rig.attr(k, 'opacity', Math.min(1, Math.max(0, v)));
      }
    },
  };
}
