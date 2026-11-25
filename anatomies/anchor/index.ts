// anchor: a vector anchor point come to life. The body is a closed curve of 40 smooth points
// that can morph between a rounded square (the anchor), a circle, a star and a heart; its arms
// are the two Bézier handles — a thin stick and a round knob — that swing from the centre.
// A handle can sketch a curve in the air, a selection box can appear around it, and a dot grid
// can show when it snaps. Example: mascots/nodi.
import type { Anatomy, Built } from '../../kit/character.js';
import { FACE_DEFAULTS } from '../../kit/face.js';
import { browSet, eyeModel, faceInks, mouthSet, type BrowSet, type EyeSet, type MouthSet } from '../../kit/faces/index.js';
import { mirror } from '../../kit/faces/geom.js';
import { markParts, renderMarks } from '../../kit/faces/marks.js';
import { DEFAULT_FORM, isDefaultForm, scales, snapTo, type Form } from '../../kit/form.js';
import { blendPaths, parse, toD, type PathSpec } from '../../kit/morph.js';
import { lerp, wave } from '../../kit/motion.js';
import type { Part, Shape } from '../../kit/rig.js';
import { ellipse, roundRect } from '../../kit/shapes.js';
import type { AnatomyContract, MascotSpec } from '../../kit/spec.js';
import type { Painter } from '../../kit/style.js';
import type { ActionSpec } from '../../kit/timeline.js';

const det = (s: Shape): Shape => ({ ...s, kind: 'detail' });
const N = 120;
const r2 = (n: number) => Math.round(n * 100) / 100;

/** A closed Catmull-Rom curve through `pts`, as N cubic segments (same commands for every shape). */
function closedCurve(pts: [number, number][]): PathSpec {
  const n = pts.length;
  const P = (i: number) => pts[((i % n) + n) % n];
  let d = `M${r2(pts[0][0])} ${r2(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const [p0, p1, p2, p3] = [P(i - 1), P(i), P(i + 1), P(i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${r2(c1[0])} ${r2(c1[1])} ${r2(c2[0])} ${r2(c2[1])} ${r2(p2[0])} ${r2(p2[1])}`;
  }
  return parse(d + 'Z');
}

/** Sample a polar radius function clockwise from the top. */
const polarPts = (r: (th: number) => number) =>
  Array.from({ length: N }, (_, i) => {
    const th = (i / N) * Math.PI * 2;
    return [Math.sin(th) * r(th), -Math.cos(th) * r(th)] as [number, number];
  });
const polar = (r: (th: number) => number) => closedCurve(polarPts(r));

/** The rest shape: a rounded square, like an anchor point on a canvas. */
const SQUARE = polar((th) => 31 / (Math.abs(Math.cos(th)) ** 5 + Math.abs(Math.sin(th)) ** 5) ** (1 / 5));
const CIRCLE = polar(() => 32);
const STAR = polar((th) => 24 + 19 * ((Math.cos(5 * th) + 1) / 2) ** 2.2);
/**
 * The heart, sampled at the same N angles as the other shapes (a ray from its centre per angle),
 * so point i of the heart lies in the same direction as point i of the square, circle and star:
 * every in-between frame of a morph is a clean shape instead of a twisted one.
 */
const HEART_PTS = (() => {
  const cy = 9;
  const dense = Array.from({ length: 4000 }, (_, i) => {
    const t = (i / 4000) * Math.PI * 2;
    const x = 16 * Math.sin(t) ** 3;
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    const X = x * 2.15, Y = (y + 2.5) * 2.15;
    const th = (Math.atan2(X, -(Y - cy)) + Math.PI * 2) % (Math.PI * 2);
    return { th, r: Math.hypot(X, Y - cy) };
  });
  return Array.from({ length: N }, (_, i) => {
    const th = (i / N) * Math.PI * 2;
    // the farthest boundary point along this ray (the top dip is a single crossing from the centre)
    let best = dense[0], bd = Infinity;
    for (const d of dense) {
      const dd = Math.abs(((d.th - th + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
      if (dd < bd) { bd = dd; best = d; }
    }
    return [Math.sin(th) * best.r, cy - Math.cos(th) * best.r] as [number, number];
  });
})();
const HEART = closedCurve(HEART_PTS);


/** Where the drawing handle goes while it sketches: angle (deg) and length along progress u. */
const drawAngle = (u: number) => -15 - 150 * u;
const drawLen = (u: number) => 58 + 9 * Math.sin(u * Math.PI * 3);
const TRAIL = (() => {
  let d = '';
  for (let i = 0; i <= 48; i++) {
    const u = i / 48, a = (drawAngle(u) * Math.PI) / 180, l = drawLen(u);
    d += `${i ? 'L' : 'M'}${r2(Math.cos(a) * l)} ${r2(Math.sin(a) * l)}`;
  }
  return d;
})();

const DEFAULTS = {
  'body.x': 0, 'body.y': 0, 'body.sx': 1, 'body.sy': 1, 'body.rot': 0,
  handleL: 0, handleR: 0, 'handleL.len': 0, 'handleR.len': 0, smooth: 0,
  'shape.circle': 0, 'shape.star': 0, 'shape.heart': 0,
  draw: -1, 'draw.w': 0, select: 0, grid: 0,
  'mouth.open': 0, 'mouth.smile': 0,
  ...FACE_DEFAULTS,
};

export const contract: AnatomyContract = {
  name: 'anchor',
  channels: Object.keys(DEFAULTS),
  palette: ['body', 'body-dark', 'eye', 'cheek', 'glow', 'accent', 'ink', 'shine', 'prop'],
  required: ['body'],
  contrastPairs: [['eye', 'body']],
  body: {},
  builtins: ['wave', 'hop', 'look-around', 'stretch', 'notice', 'surprise', 'draw', 'morph', 'select', 'snap', 'spin'],
};

const C = (ms: number, v: number): [number, number][] => [[0, v], [ms, v]];

export const builtins: ActionSpec[] = [
  {
    name: 'wave', duration: 2600, weight: 3,
    tracks: [
      { ch: 'handleR', keys: C(2600, -46), osc: { amp: 12, period: 480 } },
      { ch: 'handleR.len', keys: C(2600, 6) },
      { ch: 'smooth', op: 'set', keys: C(2600, 0.45) },
      { ch: 'body.rot', keys: C(2600, -5) },
      { ch: 'eyes.happy', keys: C(2600, 0.9) },
      { ch: 'mouth.smile', keys: C(2600, 1) },
    ],
  },
  {
    name: 'hop', duration: 1900, weight: 2,
    jumps: [{ at: 380, air: 520, height: 26 }],
    tracks: [
      { ch: 'handleL', keys: [[0, 0], [380, 30], [520, -70], [1100, -70], [1500, 0], [1900, 0]] },
      { ch: 'handleR', keys: [[0, 0], [380, 30], [520, -70], [1100, -70], [1500, 0], [1900, 0]] },
      { ch: 'shape.circle', keys: [[0, 0], [500, 1], [1000, 1], [1500, 0], [1900, 0]] },
      { ch: 'eyes.happy', keys: C(1900, 1) },
      { ch: 'mouth.smile', keys: C(1900, 1) },
      { ch: 'prop.sparkles', op: 'set', curve: 'linear', keys: [[0, -1], [899, -1], [900, 0], [1800, 1], [1801, -1], [1900, -1]] },
    ],
  },
  {
    name: 'look-around', duration: 2600, weight: 3,
    tracks: [
      { ch: 'look.x', op: 'set', keys: [[0, 0], [400, -1], [1100, -1], [1500, 1], [2200, 1], [2600, 0]] },
      { ch: 'look.w', keys: C(2600, 1) },
      { ch: 'body.x', keys: [[0, 0], [400, -5], [1100, -5], [1500, 5], [2200, 5], [2600, 0]] },
      { ch: 'body.rot', keys: [[0, 0], [400, -6], [1100, -6], [1500, 6], [2200, 6], [2600, 0]] },
      { ch: 'handleL', keys: [[0, 0], [400, 20], [1100, 20], [1500, -15], [2200, -15], [2600, 0]] },
      { ch: 'handleR', keys: [[0, 0], [400, -15], [1100, -15], [1500, 20], [2200, 20], [2600, 0]] },
    ],
  },
  {
    name: 'stretch', duration: 2600, weight: 1.5,
    tracks: [
      { ch: 'body.sy', op: 'mul', keys: [[0, 1], [700, 1.22], [1600, 1.22], [1900, 0.88], [2200, 1.04], [2600, 1]] },
      { ch: 'body.sx', op: 'mul', keys: [[0, 1], [700, 0.86], [1600, 0.86], [1900, 1.1], [2600, 1]] },
      { ch: 'handleL', keys: [[0, 0], [700, -150], [1600, -150], [1900, 0], [2600, 0]] },
      { ch: 'handleR', keys: [[0, 0], [700, -150], [1600, -150], [1900, 0], [2600, 0]] },
      { ch: 'handleL.len', keys: [[0, 0], [700, 18], [1600, 18], [1900, 0], [2600, 0]] },
      { ch: 'handleR.len', keys: [[0, 0], [700, 18], [1600, 18], [1900, 0], [2600, 0]] },
      { ch: 'eyes.open', op: 'min', keys: [[0, 1], [700, 0.1], [1600, 0.1], [1900, 1], [2600, 1]] },
      { ch: 'mouth.open', keys: [[0, 0], [700, 0.7], [1600, 0.7], [1900, 0], [2600, 0]] },
    ],
  },
  {
    name: 'notice', duration: 1900,
    tracks: [
      { ch: 'eyes.scale', op: 'mul', keys: [[0, 1], [250, 1.3], [500, 1], [1900, 1]] },
      { ch: 'body.y', env: false, keys: [[0, 0], [200, -10], [500, 0], [1900, 0]] },
      { ch: 'handleR', keys: [[0, 0], [500, 0], [800, -46], [1900, -46]], osc: { amp: 12, period: 460, window: [700, 1900] } },
      { ch: 'smooth', op: 'set', keys: C(1900, 0.4) },
      { ch: 'eyes.happy', keys: [[0, 0], [450, 0], [700, 1], [1900, 1]] },
      { ch: 'mouth.smile', keys: [[0, 0], [450, 0], [700, 1], [1900, 1]] },
    ],
  },
  {
    name: 'surprise', duration: 1600,
    jumps: [{ at: 0, air: 420, height: 14, startle: true }],
    tracks: [
      { ch: 'eyes.scale', op: 'mul', keys: [[0, 1], [200, 1.5], [900, 1], [1600, 1]] },
      { ch: 'mouth.open', keys: [[0, 0], [120, 1], [900, 1], [1300, 0], [1600, 0]] },
      { ch: 'shape.circle', keys: [[0, 0], [150, 1], [900, 1], [1300, 0], [1600, 0]] },
      { ch: 'handleL', keys: [[0, 0], [150, -110], [800, -110], [1300, 0], [1600, 0]] },
      { ch: 'handleR', keys: [[0, 0], [150, -110], [800, -110], [1300, 0], [1600, 0]] },
      { ch: 'handleL.len', keys: [[0, 0], [150, 4], [800, 4], [1300, 0], [1600, 0]] },
      { ch: 'handleR.len', keys: [[0, 0], [150, 4], [800, 4], [1300, 0], [1600, 0]] },
    ],
  },
  {
    // The right handle sketches an arc over the head; the line stays, then fades.
    name: 'draw', duration: 3600, weight: 2.5,
    tracks: [
      { ch: 'draw', op: 'set', curve: 'linear', keys: [[0, 0], [500, 0], [2300, 1], [3600, 1]] },
      { ch: 'draw.w', keys: [[0, 0], [450, 1], [2900, 1], [3300, 0], [3600, 0]] },
      { ch: 'look.x', op: 'set', curve: 'linear', keys: [[0, 0.8], [500, 0.8], [1400, 0], [2300, -0.9], [2900, 0], [3600, 0]] },
      { ch: 'look.y', op: 'set', keys: [[0, -0.6], [2400, -0.8], [2900, 0], [3600, 0]] },
      { ch: 'look.w', keys: [[0, 0], [400, 1], [2600, 1], [3000, 0], [3600, 0]] },
      { ch: 'handleL', keys: [[0, 0], [500, 25], [2300, 25], [2800, 0], [3600, 0]] },
      { ch: 'body.rot', keys: [[0, 0], [500, 6], [1400, 0], [2300, -6], [2800, 0], [3600, 0]] },
      { ch: 'eyes.happy', keys: [[0, 0], [2300, 0], [2500, 1], [3400, 1], [3600, 0]] },
      { ch: 'mouth.smile', keys: [[0, 0], [2300, 0], [2500, 1], [3600, 1]] },
    ],
  },
  {
    // Square → circle → star → heart → square, a little bounce at each one.
    name: 'morph', duration: 4200, weight: 2.5,
    tracks: [
      // Star → heart goes through the circle: two radial blends, never a star with lobes.
      { ch: 'shape.circle', keys: [[0, 0], [500, 1], [1100, 1], [1500, 0], [2300, 0], [2500, 1], [2700, 0], [4200, 0]] },
      { ch: 'shape.star', keys: [[0, 0], [1100, 0], [1500, 1], [2300, 1], [2500, 0], [4200, 0]] },
      { ch: 'shape.heart', keys: [[0, 0], [2500, 0], [2750, 1], [3500, 1], [3900, 0], [4200, 0]] },
      { ch: 'body.rot', keys: [[0, 0], [1500, 0], [1900, 14], [2300, 0], [4200, 0]] },
      { ch: 'body.sy', op: 'mul', keys: [[0, 1], [400, 0.9], [600, 1.06], [800, 1], [1400, 0.9], [1600, 1.06], [1800, 1], [2600, 0.9], [2800, 1.06], [3000, 1], [3800, 0.92], [4000, 1.04], [4200, 1]] },
      { ch: 'handleL', keys: [[0, 0], [1500, -30], [2300, -30], [2700, 10], [3500, 10], [4200, 0]] },
      { ch: 'handleR', keys: [[0, 0], [1500, -30], [2300, -30], [2700, 10], [3500, 10], [4200, 0]] },
      { ch: 'eyes.happy', keys: [[0, 0], [2600, 0], [2800, 1], [3600, 1], [3900, 0], [4200, 0]] },
      { ch: 'face.blush', keys: [[0, 0], [2600, 0], [2800, 1], [3600, 1], [3900, 0], [4200, 0]] },
      { ch: 'mouth.smile', keys: C(4200, 1) },
    ],
  },
  {
    // A selection box with corner handles appears; it gets "dragged" bigger, then deselected.
    name: 'select', duration: 3200, weight: 2,
    tracks: [
      { ch: 'select', op: 'set', keys: [[0, 0], [300, 1], [2700, 1], [3000, 0], [3200, 0]] },
      { ch: 'body.sx', op: 'mul', keys: [[0, 1], [900, 1], [1300, 1.18], [1900, 1.18], [2300, 1], [3200, 1]] },
      { ch: 'body.sy', op: 'mul', keys: [[0, 1], [900, 1], [1300, 1.18], [1900, 1.18], [2300, 1], [3200, 1]] },
      { ch: 'look.x', op: 'set', keys: [[0, 0], [400, 0.9], [900, 0.9], [1300, 0], [3200, 0]] },
      { ch: 'look.y', op: 'set', keys: [[0, 0], [400, -0.9], [900, -0.9], [1300, 0], [3200, 0]] },
      { ch: 'look.w', keys: [[0, 0], [300, 1], [1100, 1], [1400, 0], [3200, 0]] },
      { ch: 'eyes.scale', op: 'mul', keys: [[0, 1], [300, 1.25], [700, 1], [3200, 1]] },
      { ch: 'eyes.happy', keys: [[0, 0], [1200, 0], [1400, 1], [2600, 1], [3000, 0], [3200, 0]] },
      { ch: 'handleL', keys: [[0, 0], [1100, 0], [1400, -60], [2200, -60], [2600, 0], [3200, 0]] },
      { ch: 'handleR', keys: [[0, 0], [1100, 0], [1400, -60], [2200, -60], [2600, 0], [3200, 0]] },
      { ch: 'mouth.smile', keys: [[0, 0], [1200, 0], [1400, 1], [3200, 1]] },
    ],
  },
  {
    // A dot grid shows up; it steps left, right and back, landing on each dot with a snap.
    name: 'snap', duration: 3400, weight: 2,
    tracks: [
      { ch: 'grid', op: 'set', keys: [[0, 0], [300, 1], [2900, 1], [3300, 0], [3400, 0]] },
      { ch: 'body.x', env: false, curve: 'track', keys: [[0, 0], [500, 0], [680, -18, 'in'], [760, -15, 'out'], [1300, -15], [1520, 18, 'in'], [1600, 15, 'out'], [2200, 15], [2400, 0, 'in'], [2480, 0, 'out'], [3400, 0]] },
      { ch: 'body.sx', op: 'mul', keys: [[0, 1], [660, 1], [760, 1.12], [900, 1], [1500, 1], [1600, 1.12], [1740, 1], [2380, 1], [2480, 1.12], [2620, 1], [3400, 1]] },
      { ch: 'body.sy', op: 'mul', keys: [[0, 1], [660, 1], [760, 0.9], [900, 1], [1500, 1], [1600, 0.9], [1740, 1], [2380, 1], [2480, 0.9], [2620, 1], [3400, 1]] },
      { ch: 'handleL', keys: [[0, 0], [680, -40], [900, 10], [1520, 30], [1700, -10], [2400, -30], [2600, 0], [3400, 0]] },
      { ch: 'handleR', keys: [[0, 0], [680, 30], [900, -10], [1520, -40], [1700, 10], [2400, -30], [2600, 0], [3400, 0]] },
      { ch: 'eyes.happy', keys: [[0, 0], [2500, 0], [2700, 1], [3400, 1]] },
    ],
  },
  {
    // A full turn with the handles flung out, then a dizzy wobble.
    name: 'spin', duration: 2600, weight: 1.5,
    tracks: [
      { ch: 'body.rot', op: 'set', curve: 'track', keys: [[0, 0], [300, -12, 'out'], [1200, 360], [1500, 360], [1501, 0], [2600, 0]] },
      { ch: 'body.rot', osc: { amp: 7, period: 380, window: [1500, 2400] } },
      { ch: 'handleL.len', keys: [[0, 0], [400, 10], [1200, 10], [1500, 0], [2600, 0]] },
      { ch: 'handleR.len', keys: [[0, 0], [400, 10], [1200, 10], [1500, 0], [2600, 0]] },
      { ch: 'handleL', keys: [[0, 0], [400, -20], [1200, -20], [1500, 0], [2600, 0]] },
      { ch: 'handleR', keys: [[0, 0], [400, -20], [1200, -20], [1500, 0], [2600, 0]] },
      { ch: 'eyes.open', op: 'min', keys: [[0, 1], [300, 0.15], [1200, 0.15], [1400, 1], [2600, 1]] },
      { ch: 'mouth.open', keys: [[0, 0], [300, 0.5], [1200, 0.5], [1500, 0], [2600, 0]] },
    ],
  },
];

/** Geometry for a form: the default form gives exactly the authored numbers. */
interface Geo {
  hs: number;
  shapes: { square: PathSpec; circle: PathSpec; star: PathSpec; heart: PathSpec };
  stick: number;
  thick: number;
  eyesAt: [number, number];
  eyeX: number;
  mouthAt: [number, number];
  cheek: [number, number];
}

function geometry(form: Form): Geo {
  if (isDefaultForm(form)) {
    return {
      hs: 1, shapes: { square: SQUARE, circle: CIRCLE, star: STAR, heart: HEART }, stick: 50, thick: 2.2,
      eyesAt: [0, -5], eyeX: 11, mouthAt: [0, 10], cheek: [19, 6],
    };
  }
  const S = scales(form);
  // Nodi is all head: the head scale is the body; a grid snaps its half size to whole pixels.
  const hs = snapTo(form, 31 * S.head) / 31;
  const sx = hs, sy = hs * S.aspect;
  const fit = (pts: [number, number][]) => closedCurve(pts.map(([x, y]) => [x * sx, y * sy] as [number, number]));
  const n = form.corners <= 0.5 ? 5 + (0.5 - form.corners) * 30 : 5 - (form.corners - 0.5) * 5.2;
  const ry = 7 * hs * form.face.scale;
  const fy = form.face.y * ry;
  return {
    hs,
    shapes: {
      square: fit(polarPts((th) => 31 / (Math.abs(Math.cos(th)) ** n + Math.abs(Math.sin(th)) ** n) ** (1 / n))),
      circle: fit(polarPts(() => 32)),
      star: fit(polarPts((th) => 24 + 19 * ((Math.cos(5 * th) + 1) / 2) ** 2.2)),
      heart: fit(HEART_PTS),
    },
    // The stick reaches past the body (so the hand never sits on it) and the hand stays in frame.
    stick: snapDown(form, Math.min(FRAME - handReach(form.hands, 2.2 * S.thick),
      Math.max(Math.min(50 * S.arm, REACH - handReach(form.hands, 2.2 * S.thick)), 31 * hs * Math.max(1, S.aspect) + handReach(form.hands, 2.2 * S.thick) + 12))),
    thick: 2.2 * S.thick,
    eyesAt: [0, -5 * sy + fy],
    eyeX: snapTo(form, 11 * hs * form.face.spacing),
    mouthAt: [0, 10 * sy + fy * 0.55],
    cheek: [19 * hs, 6 * sy + fy * 0.55],
  };
}

/** Round down to the form's grid (no grid: unchanged). */
const snapDown = (form: Form, v: number) => (form.grid ? Math.floor(v / form.grid) * form.grid : v);

/** How far a hand reaches past the end of its stick. */
function handReach(kind: Form['hands'], thick: number): number {
  const k = Math.sqrt(thick / 2.2);
  return kind === 'glove' ? 16 * k : kind === 'mitten' ? 13 * k : kind === 'none' ? thick : 7.5 * k;
}
/** The farthest a handle (stick + hand) may reach from the centre and still keep every action in frame. */
const REACH = 56;
/** The farthest a form's handle may reach at rest (the viewBox edge, less a margin). */
const FRAME = 70;

/** Per character: its geometry and face models (keyed by the character's painter). */
interface Instance { geo: Geo; eyes: EyeSet; mouth: MouthSet; brows: BrowSet; noodle: boolean; marks: Form['marks']; hand: number; custom: boolean }
const instances = new WeakMap<Painter, Instance>();

/** A stick from the centre out along +x, `t` thick at the root, thinning by `taper`. */
function stickPath(len: number, t: number, taper: number): string {
  if (!taper) return roundRect(0, -t, len, t, t);
  const e = t * (1 - 0.75 * taper);
  return `M0 ${r2(-t)}L${r2(len)} ${r2(-e)}Q${r2(len + e * 1.3)} 0 ${r2(len)} ${r2(e)}L0 ${r2(t)}Q${r2(-t * 1.3)} 0 0 ${r2(-t)}Z`;
}

/** The hand at the end of a handle (right side; mirrored with m = −1). */
function hand(kind: Form['hands'], m: number, thick: number, paint: Painter): Shape[] {
  const k = Math.sqrt(thick / 2.2);
  if (kind === 'none') return [];
  if (kind === 'glove') {
    const g = paint.flat('shine');
    return [
      { d: roundRect(m > 0 ? -3 : -1, -5.5 * k, m > 0 ? 1 : 3, 5.5 * k, 1.5), fill: g },
      { d: ellipse(6.5 * m * k, 0, 6.4 * k, 6 * k), fill: g },
      { d: ellipse(12 * m * k, -3.8 * k, 3 * k, 2.4 * k), fill: g },
      { d: ellipse(13 * m * k, 0.4 * k, 3 * k, 2.4 * k), fill: g },
      { d: ellipse(11.6 * m * k, 4.4 * k, 2.8 * k, 2.3 * k), fill: g },
      { d: ellipse(5 * m * k, -6.4 * k, 2.4 * k, 2.6 * k), fill: g },
    ];
  }
  if (kind === 'mitten') {
    return [
      { d: ellipse(5.5 * m * k, 0.5 * k, 7.4 * k, 6 * k), fill: paint.fill('accent') },
      { d: ellipse(3.4 * m * k, -5.6 * k, 2.8 * k, 3 * k), fill: paint.fill('accent') },
    ];
  }
  const r = 7.5 * k;
  return [{ d: ellipse(0, 0, r, r), fill: paint.fill('accent') }];
}

function build(spec: MascotSpec, paint: Painter, form: Form = DEFAULT_FORM): Built {
  const g = geometry(form);
  const out = paint.outline(0.55);
  const root = (children: Part[]): Part => ({ id: 'root', at: [80, 84], children });
  const custom = !isDefaultForm(form);
  const noodle = form.limbs === 'noodle';
  const handle = (side: 'L' | 'R'): Part => {
    const s = side === 'L' ? -1 : 1;
    const stick: Shape = noodle
      ? { pathRef: `stick${side}`, stroke: paint.flat('body-dark'), width: g.thick * 2 }
      : custom
        ? { d: s > 0 ? stickPath(g.stick, g.thick, form.taper) : mirrorD(stickPath(g.stick, g.thick, form.taper)), fill: paint.fill('body-dark') }
        : { d: s > 0 ? roundRect(0, -2.2, 50, 2.2, 2.2) : roundRect(-50, -2.2, 0, 2.2, 2.2), fill: paint.fill('body-dark') };
    return {
      id: `handle${side}`,
      children: [
        { id: `stick${side}`, shapes: [stick] },
        {
          id: `knob${side}`, shapes: form.hands === 'default'
            ? [{ d: 'M0 -7.5C4.14 -7.5 7.5 -4.14 7.5 0C7.5 4.14 4.14 7.5 0 7.5C-4.14 7.5 -7.5 4.14 -7.5 0C-7.5 -4.14 -4.14 -7.5 0 -7.5Z', fill: paint.fill('accent') }]
            : hand(form.hands, s, g.thick, paint),
        },
      ],
    };
  };
  const dots: Shape[] = [];
  for (let gx = -2; gx <= 2; gx++) for (let gy = -1; gy <= 1; gy++) {
    dots.push(det({ el: { tag: 'circle', attrs: { cx: gx * 15, cy: 52 + gy * 8, r: 1.8, fill: paint.flat('body-dark') } } }));
  }
  const ink = paint.flat('accent');
  const corner = (x: number, y: number) => det({ el: { tag: 'rect', attrs: { x: x - 3.5, y: y - 3.5, width: 7, height: 7, fill: '#FFFFFF', stroke: ink, 'stroke-width': 1.6 } } });

  // Face: the style's eye, mouth and brow models (the default form keeps the original face).
  const fs = custom ? g.hs * form.face.scale : 1;
  const eyes = eyeModel(form.eyes).make(5 * fs, 7 * fs, paint);
  const mouth = mouthSet(form.mouth, custom ? g.hs * form.face.mouth : 1);
  const brows = browSet(form.brows, eyes.rx, eyes.ry, faceInks(paint).line);
  const browY = -eyes.ry * 1.42 - 1.5;
  const browParts = (['L', 'R'] as const).map((sd) => brows.part(sd, [(sd === 'L' ? -1 : 1) * g.eyeX, browY])).filter((x): x is Part => !!x);
  // Big, low eyes push the cheeks down and out so the blush sits under the eyes, not on them.
  if (custom) g.cheek = [Math.max(g.cheek[0], g.eyeX + eyes.rx * 0.5), Math.max(g.cheek[1], g.eyesAt[1] + eyes.ry * 0.95)];
  const half = 31 * g.hs;
  const marks = markParts(form.marks, {
    sweat: [half * 0.78, -half * 0.62 * (form.proportions.aspect), 4.6 * g.hs],
    cheeks: [[-g.cheek[0], g.cheek[1]], [g.cheek[0], g.cheek[1]]],
    speed: [half * 0.7, half + 8],
  }, paint);
  instances.set(paint, { geo: g, eyes, mouth, brows, noodle, marks: form.marks, hand: handReach(form.hands, g.thick), custom });

  return {
    viewBox: '0 -6 160 166',
    rootAt: [80, 148],
    stage: [80, 86, 70],
    label: `${spec.title} mascot`,
    layers: [
      { outline: null, root: { id: 'shadow', at: [80, 148], shapes: [det({ el: { tag: 'ellipse', attrs: { rx: 28, ry: 5, fill: paint.shadow } }, ref: 'shadow' })] } },
      { outline: null, root: { at: [80, 84], children: [{ id: 'grid', shapes: dots }] } },
      {
        outline: null,
        root: root([{ id: 'body', children: [{
          id: 'trailG', shapes: [det({
            el: { tag: 'path', attrs: { d: TRAIL, fill: 'none', stroke: paint.flat('accent'), 'stroke-width': 3, 'stroke-linecap': 'round', pathLength: 1, 'stroke-dasharray': 1, 'stroke-dashoffset': 1 } },
            ref: 'trail',
          })],
        }, ...marks.behind] }]),
      },
      { outline: out, root: root([{ id: 'body', children: [handle('L'), handle('R')] }]) },
      {
        outline: out,
        root: root([{
          id: 'body', shapes: [{ pathRef: 'shape', fill: paint.fill('body') }],
          children: [
            { id: 'eyes', at: g.eyesAt, children: [eyes.part('L', [-g.eyeX, 0]), eyes.part('R', [g.eyeX, 0]), ...browParts] },
            mouth.part(g.mouthAt, paint.flat('eye')),
            {
              shapes: [
                det({ el: { tag: 'ellipse', attrs: { cx: -g.cheek[0], cy: g.cheek[1], rx: 4.5, ry: 2.8, fill: paint.flat('cheek') } }, ref: 'blush' }),
                det({ el: { tag: 'ellipse', attrs: { cx: g.cheek[0], cy: g.cheek[1], rx: 4.5, ry: 2.8, fill: paint.flat('cheek') } }, ref: 'blush' }),
              ],
            },
            ...marks.face,
          ],
        }]),
      },
      {
        outline: null,
        root: root([{
          id: 'selBox', children: [{
            id: 'selScale', shapes: [
              det({ el: { tag: 'rect', attrs: { x: -44, y: -44, width: 88, height: 88, fill: 'none', stroke: ink, 'stroke-width': 1.4, 'stroke-dasharray': '4 3' } } }),
              corner(-44, -44), corner(44, -44), corner(-44, 44), corner(44, 44),
              corner(0, -44), corner(0, 44), corner(-44, 0), corner(44, 0),
            ],
          }],
        }]),
      },
    ],
  };
}

/** Mirror an authored path left↔right. */
const mirrorD = (dd: string) => toD(mirror(parse(dd)));

/** A noodle arm: a curve that sags under gravity, in the handle's own frame. */
function noodlePath(len: number, angDeg: number, side: 1 | -1, thick: number): PathSpec {
  const a = (angDeg * Math.PI) / 180;
  // gravity (0, 1) seen from the handle's rotated frame
  const gx = Math.sin(a), gy = Math.cos(a);
  const sag = len * 0.22;
  const cx = (side * len) / 2 + gx * sag * 0.4, cy = gy * sag;
  return [['M', 0, 0], ['Q', cx, cy, side * len, -thick * 0.2]];
}

export const anchor: Anatomy = {
  contract,
  usesForm: true,
  defaults: DEFAULTS,
  builtins,
  springs: {
    handleL: { freq: 2.6, damping: 0.42 },
    handleR: { freq: 2.6, damping: 0.42 },
    'handleL.len': { freq: 3.2, damping: 0.4 },
    'handleR.len': { freq: 3.2, damping: 0.4 },
    'mouth.open': { freq: 4, damping: 0.5 },
  },
  build,
  idle(p, t) {
    p['body.y'] = 4 * wave(t, 2800);
    p['body.rot'] = 2.5 * wave(t, 3900, 0.3);
    p.handleL = 9 * wave(t, 2800, 0.15);
    p.handleR = 9 * wave(t, 2800, 0.4);
    p['handleL.len'] = 2 * wave(t, 2100, 0.1);
    p['handleR.len'] = 2 * wave(t, 2100, 0.6);
  },
  derive(p) {
    // A smooth anchor keeps its handles in line: one goes up, the other dips like a seesaw.
    const s = Math.max(0, Math.min(1, p.smooth));
    if (s) p.handleL = lerp(p.handleL, -p.handleR * 0.6, s);
  },
  render(rig, p, gaze, _t, paint) {
    const I = instances.get(paint)!;
    const g = I.geo;
    rig.set('root', { x: p['body.x'] + gaze.x * 2, y: p['body.y'] });
    rig.set('body', { rot: p['body.rot'], sx: p['body.sx'], sy: p['body.sy'] });
    const lift = Math.max(0, -p['body.y']);
    rig.set('shadow', { sx: 1 - lift * 0.012, sy: 1 - lift * 0.012 });
    rig.attr('shadow', 'opacity', Math.max(0.2, 1 - lift * 0.02));
    const clamp = (v: number) => Math.max(0, Math.min(1.2, v));
    const sh = g.shapes;
    rig.path('shape', blendPaths(sh.square, [[sh.circle, clamp(p['shape.circle'])], [sh.star, clamp(p['shape.star'])], [sh.heart, clamp(p['shape.heart'])]]));
    // Handles: rest a little below horizontal; negative raises. The drawing pose overrides the right one.
    const dw = Math.max(0, Math.min(1, p['draw.w']));
    const du = Math.max(0, Math.min(1, p.draw));
    const L = g.stick;
    const angR = lerp(14 + p.handleR, drawAngle(du), dw);
    let lenR = lerp(L + p['handleR.len'], drawLen(du), dw);
    const angL = 14 + p.handleL;
    let lenL = L + p['handleL.len'];
    if (I.custom) {
      // A form's arm (stick + hand) stays in frame however the body stretches, jumps or scales.
      const cap = (FRAME - 0.8 * lift - 0.6 * Math.abs(p['body.x'])) / Math.max(1, Math.abs(p['body.sx']), Math.abs(p['body.sy'])) - I.hand;
      lenR = Math.min(lenR, cap);
      lenL = Math.min(lenL, cap);
    }
    rig.set('handleR', { rot: angR });
    rig.set('handleL', { rot: -angL });
    if (I.noodle) {
      rig.path('stickR', noodlePath(Math.max(2, lenR), angR, 1, g.thick));
      rig.path('stickL', noodlePath(Math.max(2, lenL), -angL, -1, g.thick));
    } else {
      rig.set('stickR', { sx: Math.max(0.1, lenR / L) });
      rig.set('stickL', { sx: Math.max(0.1, lenL / L) });
    }
    rig.set('knobR', { x: lenR });
    rig.set('knobL', { x: -lenL });
    rig.attr('trail', 'stroke-dashoffset', p.draw < 0 ? 1 : 1 - du);
    rig.opacity('trailG', p.draw < 0 ? 0 : du < 1 ? 1 : dw);
    rig.opacity('grid', Math.max(0, Math.min(1, p.grid)));
    rig.opacity('selBox', Math.max(0, Math.min(1, p.select)));
    rig.set('selScale', { sx: p['body.sx'], sy: p['body.sy'] });
    rig.set('eyes', { x: gaze.x * 4, y: gaze.y * 3 });
    I.eyes.render(rig, p, gaze);
    I.brows.render(rig, p);
    I.mouth.render(rig, p);
    renderMarks(rig, p, I.marks, lift);
    rig.attr('blush', 'opacity', Math.max(paint.cheekRest, Math.min(1, p['face.blush']) * 0.9));
  },
};
