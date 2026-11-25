// quadruped: a sitting animal — body, front legs with paws, a head with ears, and a tail that
// swings from its base while its tip bends a beat later (two springs). Example: mascots/fox.
import type { Anatomy, Built } from '../../kit/character.js';
import { FACE_DEFAULTS } from '../../kit/face.js';
import { browSet, eyeModel, faceInks, type BrowSet, type EyeSet } from '../../kit/faces/index.js';
import { markParts, renderMarks } from '../../kit/faces/marks.js';
import { cornerScale, DEFAULT_FORM, isDefaultForm, scales, snapTo, type Form } from '../../kit/form.js';
import { mapPoints, parse, toD, type PathSpec } from '../../kit/morph.js';
import { seeded, track, wave } from '../../kit/motion.js';
import type { Part, Shape } from '../../kit/rig.js';
import { ellipse, roundRect, shift } from '../../kit/shapes.js';
import type { AnatomyContract, MascotSpec } from '../../kit/spec.js';
import type { Painter } from '../../kit/style.js';
import type { ActionSpec } from '../../kit/timeline.js';

const det = (s: Shape): Shape => ({ ...s, kind: 'detail' });

// Absolute drawing (160×160, ground at y=148), moved into each part's local space.
const TAIL = parse(shift('M98 140C128 142 148 120 141 97C137 84 124 82 122 92C120 102 131 108 127 121C123 131 110 133 98 131Z', -98, -136));
const TIP = parse(shift('M141 97C137 84 124 82 122 92C121 98 125 102 128 104C135 104 141 102 141 97Z', -98, -136));
const BODY = shift('M55 142C49 120 56 96 80 94C104 96 111 120 105 142Z', -80, -142);
const BELLY = shift('M68 142C66 125 70 110 80 108C90 110 94 125 92 142Z', -80, -142);
const HEAD = shift('M44 62C44 42 62 36 80 36C98 36 116 42 116 62C116 80 98 96 80 100C62 96 44 80 44 62Z', -80, -96);
const MASK = shift('M47 67C60 67 72 75 80 91C88 75 100 67 113 67C111 83 97 95 80 100C63 95 49 83 47 67Z', -80, -96);
const EAR_L = shift('M50 58L45 21L73 44Z', -60, -50);
const EAR_L_IN = shift('M53 51L51 32L65 45Z', -60, -50);
const EAR_R = shift('M110 58L115 21L87 44Z', -100, -50);
const EAR_R_IN = shift('M107 51L109 32L95 45Z', -100, -50);

/** Bend the upper half of the tail around its middle joint: the tip follows through. */
const JOINT: [number, number] = [27, -30];
function bendTail(spec: PathSpec, deg: number, k = 1) {
  const a = (deg * Math.PI) / 180;
  const jx = JOINT[0] * k, jy = JOINT[1] * k, y0 = 18 * k, span = 26 * k;
  return mapPoints(spec, (_, x, y) => {
    let w = Math.min(1, Math.max(0, (-y - y0) / span));
    w = w * w * (3 - 2 * w);
    const c = Math.cos(a * w), s = Math.sin(a * w);
    const dx = x - jx, dy = y - jy;
    return [jx + dx * c - dy * s, jy + dx * s + dy * c];
  });
}

const DEFAULTS = {
  'body.x': 0, 'body.y': 0, 'body.sx': 1, 'body.sy': 1, 'body.rot': 0,
  'head.rot': 0, 'head.y': 0, earL: 0, earR: 0,
  'tail.rot': 0, 'tail.bend': 0, pawL: 0, pawR: 0,
  ...FACE_DEFAULTS,
};

export const contract: AnatomyContract = {
  name: 'quadruped',
  channels: Object.keys(DEFAULTS),
  palette: ['body', 'body-dark', 'belly', 'eye', 'ink', 'cheek', 'glow', 'accent', 'shine', 'prop'],
  required: ['body'],
  contrastPairs: [['eye', 'body']],
  body: {},
  builtins: ['wave', 'hop', 'look-around', 'stretch', 'notice', 'surprise'],
};

const C = (ms: number, v: number): [number, number][] => [[0, v], [ms, v]];

export const builtins: ActionSpec[] = [
  {
    name: 'wave', duration: 2600, weight: 3,
    tracks: [
      { ch: 'pawR', keys: C(2600, -135), osc: { amp: 18, period: 480 } },
      { ch: 'head.rot', keys: C(2600, 7) },
      { ch: 'eyes.happy', keys: C(2600, 0.8) },
      { ch: 'tail.rot', osc: { amp: 14, period: 600 } },
    ],
  },
  {
    name: 'hop', duration: 1700, weight: 2,
    jumps: [{ at: 300, air: 420, height: 20 }],
    tracks: [
      { ch: 'tail.rot', env: false, keys: [[0, 0], [300, 0], [450, -28], [700, -28], [1000, 0], [1700, 0]] },
      { ch: 'earL', env: false, keys: [[0, 0], [300, 0], [450, 14], [700, 14], [900, 0], [1700, 0]] },
      { ch: 'earR', env: false, keys: [[0, 0], [300, 0], [450, 14], [700, 14], [900, 0], [1700, 0]] },
      { ch: 'eyes.happy', keys: C(1700, 1) },
      { ch: 'prop.sparkles', op: 'set', curve: 'linear', keys: [[0, -1], [299, -1], [300, 0], [1300, 1], [1301, -1], [1700, -1]] },
    ],
  },
  {
    name: 'look-around', duration: 2600, weight: 3,
    tracks: [
      { ch: 'look.x', op: 'set', keys: [[0, 0], [400, -1], [1100, -1], [1500, 1], [2200, 1], [2600, 0]] },
      { ch: 'look.w', keys: C(2600, 1) },
      { ch: 'head.rot', keys: [[0, 0], [400, -9], [1100, -9], [1500, 9], [2200, 9], [2600, 0]] },
      { ch: 'earL', keys: [[0, 0], [400, -8], [1100, -8], [1500, 4], [2600, 0]] },
      { ch: 'earR', keys: [[0, 0], [400, 4], [1100, 4], [1500, -8], [2200, -8], [2600, 0]] },
    ],
  },
  {
    name: 'stretch', duration: 2600, weight: 1.5,
    tracks: [
      { ch: 'body.sy', op: 'mul', keys: [[0, 1], [700, 0.88], [1600, 0.88], [2000, 1.03], [2300, 1], [2600, 1]] },
      { ch: 'body.sx', op: 'mul', keys: [[0, 1], [700, 1.06], [1600, 1.06], [2000, 0.99], [2600, 1]] },
      { ch: 'head.y', keys: [[0, 0], [700, 9], [1600, 9], [2000, 0], [2600, 0]] },
      { ch: 'tail.rot', keys: [[0, 0], [700, -30], [1600, -30], [2000, 0], [2600, 0]] },
      { ch: 'eyes.open', op: 'min', keys: [[0, 1], [700, 0.1], [1600, 0.1], [2000, 1], [2600, 1]] },
    ],
  },
  {
    name: 'notice', duration: 1800,
    jumps: [{ at: 250, air: 240, height: 7 }],
    tracks: [
      { ch: 'eyes.scale', op: 'mul', keys: [[0, 1], [250, 1.3], [500, 1], [1800, 1]] },
      { ch: 'earL', keys: [[0, 0], [150, -14], [400, -6], [1800, -6]] },
      { ch: 'earR', keys: [[0, 0], [150, -14], [400, -6], [1800, -6]] },
      { ch: 'pawR', keys: [[0, 0], [500, 0], [800, -130], [1800, -130]], osc: { amp: 16, period: 460, window: [700, 1800] } },
      { ch: 'eyes.happy', keys: [[0, 0], [450, 0], [700, 1], [1800, 1]] },
    ],
  },
  {
    name: 'surprise', duration: 1500,
    jumps: [{ at: 120, air: 380, height: 24, startle: true }],
    tracks: [
      { ch: 'eyes.scale', op: 'mul', keys: [[0, 1], [400, 1.4], [900, 1], [1500, 1]] },
      { ch: 'earL', keys: [[0, 0], [100, -20], [800, -20], [1200, 0], [1500, 0]] },
      { ch: 'earR', keys: [[0, 0], [100, -20], [800, -20], [1200, 0], [1500, 0]] },
      { ch: 'tail.rot', keys: [[0, 0], [100, -40], [800, -40], [1200, 0], [1500, 0]] },
    ],
  },
];

// ---------------------------------------------------------------- form

/** Numbers for a form; the default form gives exactly the authored ones. */
interface Geo {
  custom: boolean;
  hs: number; vy: number; bs: number; thick: number;
  /** Shoulder → paw centre (the shoulder sits this high above the paw line). */
  reach: number;
  /** Leg stroke width and half distance between the legs. */
  legW: number; legX: number;
  headY: number;
  eyeY: number; eyeX: number;
  cheek: [number, number];
}

function geometry(form: Form): Geo {
  const custom = !isDefaultForm(form);
  if (!custom) {
    return {
      custom, hs: 1, vy: 1, bs: 1, thick: 1, reach: 14, legW: 9, legX: 7, headY: -46,
      eyeY: -34, eyeX: 14, cheek: [24, -20],
    };
  }
  const S = scales(form);
  const g = (v: number) => snapTo(form, v);
  const hs = S.head, vy = S.head * S.aspect, bs = S.body;
  const ery = 6.4 * hs * form.face.scale;
  return {
    custom, hs, vy, bs, thick: S.thick,
    reach: g(14 * S.leg), legW: 9 * S.thick, legX: g(7 * bs),
    headY: g(-46 * bs),
    eyeY: g(-34 * vy + form.face.y * ery), eyeX: g(14 * hs * form.face.spacing),
    cheek: [24 * hs, -20 * vy],
  };
}

interface Instance {
  geo: Geo; eyes: EyeSet; brows: BrowSet; marks: Form['marks'];
  noodle: boolean; tail: PathSpec; tip: PathSpec;
}
const instances = new WeakMap<Painter, Instance>();

type Pt = [number, number];
const r2 = (n: number) => Math.round(n * 100) / 100;

/** A closed polygon whose corners are rounded by r (clamped to half of each edge). */
function roundPoly(pts: Pt[], r: number): string {
  const n = pts.length;
  if (r <= 0.05) return `M${pts.map(([x, y]) => `${r2(x)} ${r2(y)}`).join('L')}Z`;
  const cut = (i: number): [Pt, Pt, Pt] => {
    const v = pts[i], a = pts[(i + n - 1) % n], b = pts[(i + 1) % n];
    const la = Math.hypot(a[0] - v[0], a[1] - v[1]), lb = Math.hypot(b[0] - v[0], b[1] - v[1]);
    const c = Math.min(r, la / 2, lb / 2);
    return [[v[0] + ((a[0] - v[0]) / la) * c, v[1] + ((a[1] - v[1]) / la) * c], v, [v[0] + ((b[0] - v[0]) / lb) * c, v[1] + ((b[1] - v[1]) / lb) * c]];
  };
  const P = (p: Pt) => `${r2(p[0])} ${r2(p[1])}`;
  let d = `M${P(cut(0)[2])}`;
  for (let i = 1; i <= n; i++) {
    const [a, v, b] = cut(i % n);
    d += `L${P(a)}Q${P(v)} ${P(b)}`;
  }
  return `${d}Z`;
}

/** Absolute polygon (160×160 drawing) → a part's local space, scaled and snapped. */
const place = (pts: Pt[], ox: number, oy: number, sx: number, sy: number, form: Form): Pt[] =>
  pts.map(([x, y]) => [snapTo(form, (x - ox) * sx), snapTo(form, (y - oy) * sy)]);

/** Scale an authored local path. */
const scaleSpec = (spec: PathSpec, sx: number, sy: number) => mapPoints(spec, (_, x, y) => [x * sx, y * sy]);
const scaleD = (d: string, sx: number, sy: number) => scaleSpec(parse(d), sx, sy);

// Angular versions of the head, mask and body (for forms with sharp corners), same 160×160 space.
const HEAD_PTS: Pt[] = [[44, 60], [48, 40], [64, 35], [96, 35], [112, 40], [116, 60], [102, 85], [80, 100], [58, 85]];
const MASK_PTS: Pt[] = [[47.4, 66], [62, 69], [80, 90], [98, 69], [112.6, 66], [102, 85], [80, 100], [58, 85]];
const BODY_PTS: Pt[] = [[55, 142], [52, 120], [62, 100], [80, 94], [98, 100], [108, 120], [105, 142]];
const BELLY_PTS: Pt[] = [[68, 142], [67, 124], [72, 112], [80, 108], [88, 112], [93, 124], [92, 142]];
const EAR_L_PTS: Pt[] = [[50, 58], [45, 21], [73, 44]];
const EAR_L_IN_PTS: Pt[] = [[53, 51], [51, 32], [65, 45]];
const mirrorPts = (pts: Pt[]): Pt[] => pts.map(([x, y]) => [160 - x, y]);

/** The nose, in the shape language of the form's mouth model. */
function noseD(form: Form, G: Geo): string {
  const k = G.hs * form.face.mouth, y = -8 * G.vy;
  if (form.mouth === 'pixel') return roundRect(-6, snapTo(form, y) - 3, 6, snapTo(form, y) + 3, 0);
  if (form.mouth === 'geo') return `M${r2(-6.5 * k)} ${r2(y - 3.5 * k)}L${r2(6.5 * k)} ${r2(y - 3.5 * k)}L0 ${r2(y + 4.5 * k)}Z`;
  if (form.mouth === 'wide') return ellipse(0, y, 7 * k, 4.4 * k);
  if (form.mouth === 'small') return ellipse(0, y, 4.4 * k, 3 * k);
  return ellipse(0, y, 5.5 * k, 3.8 * k);
}

/** A leg that thins towards the paw (`w` is the full width at the shoulder), round at both ends. */
function taperedLeg(w: number, l: number, taper: number): string {
  const h = w / 2, e = h * (1 - 0.5 * taper);
  return `M${r2(-h)} 0Q${r2(-h)} ${r2(-h)} 0 ${r2(-h)}Q${r2(h)} ${r2(-h)} ${r2(h)} 0L${r2(e)} ${r2(l)}Q${r2(e)} ${r2(l + e)} 0 ${r2(l + e)}Q${r2(-e)} ${r2(l + e)} ${r2(-e)} ${r2(l)}Z`;
}

/** A noodle leg from the shoulder to the paw, sagging with gravity seen from the leg's frame. */
function noodleLeg(l: number, deg: number, m: number): PathSpec {
  const a = (deg * Math.PI) / 180;
  const gx = Math.sin(a);
  return [['M', 0, 0], ['Q', m * l * 0.22 + gx * l * 0.5, l / 2, 0, l]];
}

function build(spec: MascotSpec, paint: Painter, form: Form = DEFAULT_FORM): Built {
  const G = geometry(form);
  const { custom, hs, vy, bs } = G;
  const out = paint.outline(0.55);
  const noodle = custom && form.limbs === 'noodle';
  const kr = cornerScale(form.corners);
  const angular = custom && form.corners < 0.4;
  const root = (children: Part[]): Part => ({ id: 'root', at: [80, 148], children });
  const torso = (children: Part[], shapes: Shape[] = []): Part => ({ id: 'torso', at: [0, -6], shapes, children });
  const head = (children: Part[], shapes: Shape[] = []): Part => ({ id: 'head', at: [0, G.headY], shapes, children });
  const leg = (side: 'L' | 'R'): Part => {
    const m = side === 'L' ? -1 : 1;
    if (!custom) {
      return {
        id: `leg${side}`, at: [side === 'L' ? -7 : 7, -14],
        shapes: [
          { d: 'M0 0L0 10', stroke: paint.flat('belly'), width: 9 },
          { d: ellipse(0, 14, 9, 5), fill: paint.flat('eye') },
        ],
      };
    }
    const l = G.reach, w = G.legW, k = Math.sqrt(G.thick);
    // Block feet stand apart (a gap between them), so the two paws never merge into one bar.
    const blockHalf = snapTo(form, 6 * k);
    const legX = form.feet === 'block' ? Math.max(G.legX, snapTo(form, blockHalf + 3)) : G.legX;
    const shin: Shape = noodle
      ? { pathRef: `shin${side}`, stroke: paint.flat('belly'), width: w }
      : form.taper
        ? { d: taperedLeg(w, l - 4 * k, form.taper), fill: paint.flat('belly') }
        : { d: `M0 0L0 ${r2(l - 4 * k)}`, stroke: paint.flat('belly'), width: w };
    const paw: Shape =
      form.feet === 'shoe' ? { d: ellipse(2.5 * m, l + 0.5, 11 * k, 6.2 * k), fill: paint.flat('eye') }
      : form.feet === 'block' ? { d: roundRect(-blockHalf, l - 5 * k, blockHalf, l + 4 * k, 1.5 * kr), fill: paint.flat('eye') }
      : { d: ellipse(0, l, 9 * k, 5 * k), fill: paint.flat('eye') };
    return { id: `leg${side}`, at: [m * legX, -G.reach], shapes: [shin, paw] };
  };

  // Head, mask, body, belly, ears: authored curves, or rounded polygons when the form is angular.
  const headShapes: Shape[] = !custom
    ? [{ d: HEAD, fill: paint.fill('body') }, { d: MASK, fill: paint.fill('belly') }]
    : angular
      ? [
        { d: roundPoly(place(HEAD_PTS, 80, 96, hs, vy, form), 12 * kr * hs), fill: paint.fill('body') },
        { d: roundPoly(place(MASK_PTS, 80, 96, hs, vy, form), 6 * kr * hs), fill: paint.fill('belly') },
      ]
      : [{ d: toD(scaleD(HEAD, hs, vy)), fill: paint.fill('body') }, { d: toD(scaleD(MASK, hs, vy)), fill: paint.fill('belly') }];
  const bodyShapes: Shape[] = !custom
    ? [{ d: BODY, fill: paint.fill('body') }, { d: BELLY, fill: paint.fill('belly') }]
    : angular
      ? [
        { d: roundPoly(place(BODY_PTS, 80, 142, bs, bs, form), 12 * kr * bs), fill: paint.fill('body') },
        { d: roundPoly(place(BELLY_PTS, 80, 142, bs, bs, form), 8 * kr * bs), fill: paint.fill('belly') },
      ]
      : [{ d: toD(scaleD(BODY, bs, bs)), fill: paint.fill('body') }, { d: toD(scaleD(BELLY, bs, bs)), fill: paint.fill('belly') }];
  // Ears: sharp as authored; a soft form rounds their tips.
  const earR = Math.max(0, form.corners - 0.5) * 12;
  const ear = (side: 'L' | 'R'): Part => {
    const m = side === 'L' ? -1 : 1;
    if (!custom) {
      return side === 'L'
        ? { id: 'earL', at: [-20, -46], shapes: [{ d: EAR_L, fill: paint.fill('body') }, det({ d: EAR_L_IN, fill: paint.flat('eye') })] }
        : { id: 'earR', at: [20, -46], shapes: [{ d: EAR_R, fill: paint.fill('body') }, det({ d: EAR_R_IN, fill: paint.flat('eye') })] };
    }
    const outer = side === 'L' ? EAR_L_PTS : mirrorPts(EAR_L_PTS);
    const inner = side === 'L' ? EAR_L_IN_PTS : mirrorPts(EAR_L_IN_PTS);
    const ox = 80 + m * 20, oy = 50;
    return {
      id: `ear${side}`, at: [snapTo(form, m * 20 * hs), snapTo(form, -46 * vy)],
      shapes: [
        { d: roundPoly(place(outer, ox, oy, hs, vy, form), earR * hs), fill: paint.fill('body') },
        det({ d: roundPoly(place(inner, ox, oy, hs, vy, form), earR * 0.5 * hs), fill: paint.flat('eye') }),
      ],
    };
  };

  // Face: the style's eye and brow models (the default form keeps the original eyes).
  const fs = custom ? hs * form.face.scale : 1;
  const eyes = eyeModel(form.eyes).make(5 * fs, 6.4 * fs, paint);
  const brows = browSet(form.brows, eyes.rx, eyes.ry, faceInks(paint).line);
  const browParts = (['L', 'R'] as const).map((sd) => brows.part(sd, [(sd === 'L' ? -1 : 1) * G.eyeX, -eyes.ry * 1.38 - 1.5])).filter((x): x is Part => !!x);
  // Big, low eyes push the cheeks down and out so the blush sits under the eyes, not on them.
  if (custom) G.cheek = [Math.max(G.cheek[0], G.eyeX + eyes.rx * 0.6), Math.max(G.cheek[1], G.eyeY + eyes.ry * 1.05)];
  const [cx, cy] = G.cheek;
  const marks = markParts(form.marks, {
    sweat: [38 * hs, -46 * vy, 4.4 * hs],
    cheeks: [[-cx, cy], [cx, cy]],
    // under the body, high enough that the streaks stay above the viewBox floor at lift-off
    speed: [24 * bs, -4],
  }, paint);
  const tail = custom ? scaleSpec(TAIL, bs, bs) : TAIL;
  const tip = custom ? scaleSpec(TIP, bs, bs) : TIP;
  instances.set(paint, { geo: G, eyes, brows, marks: form.marks, noodle, tail, tip });

  return {
    viewBox: '-10 -32 180 192',
    rootAt: [80, 148],
    stage: [80, 92, 70],
    label: `${spec.title} mascot`,
    layers: [
      { outline: null, root: { id: 'shadow', at: [84, 148], shapes: [det({ el: { tag: 'ellipse', attrs: { rx: custom ? r2(40 * bs) : 40, ry: 5, fill: paint.shadow } }, ref: 'shadow' })] } },
      ...(marks.behind.length ? [{ outline: null, root: root(marks.behind) }] : []),
      {
        outline: out,
        root: root([torso([{ id: 'tail', at: custom ? [18 * bs, -6 * bs] : [18, -6], shapes: [{ pathRef: 'tail', fill: paint.fill('body') }, { pathRef: 'tailTip', fill: paint.fill('belly') }] }])]),
      },
      {
        outline: out,
        root: root([torso([leg('L'), leg('R')], bodyShapes)]),
      },
      {
        outline: out,
        root: root([torso([head([
          ear('L'),
          ear('R'),
          { shapes: headShapes },
          {
            id: 'face', children: [
              { id: 'eyes', at: [0, G.eyeY], children: [eyes.part('L', [-G.eyeX, 0]), eyes.part('R', [G.eyeX, 0]), ...browParts] },
              ...marks.face,
            ],
            shapes: [
              det({ el: { tag: 'ellipse', attrs: { cx: -cx, cy, rx: 5, ry: 3, fill: paint.flat('cheek') } }, ref: 'blush' }),
              det({ el: { tag: 'ellipse', attrs: { cx, cy, rx: 5, ry: 3, fill: paint.flat('cheek') } }, ref: 'blush' }),
              det({ d: custom ? noseD(form, G) : ellipse(0, -8, 5.5, 3.8), fill: paint.flat('eye') }),
            ],
          },
        ])])]),
      },
    ],
  };
}

/** A short ear twitch at seeded moments. */
function twitch(t: number, salt: number): number {
  const k = Math.floor(t / 3700);
  const at = k * 3700 + seeded(k, salt) * 2600;
  return seeded(k, salt + 9) > 0.45 ? track(t, [[at, 0], [at + 60, 1, 'in'], [at + 260, 0, 'out']]) : 0;
}

export const quadruped: Anatomy = {
  contract,
  usesForm: true,
  defaults: DEFAULTS,
  builtins,
  springs: {
    'tail.rot': { freq: 2.2, damping: 0.45 },
    'tail.bend': { freq: 1.5, damping: 0.32 },
    earL: { freq: 4.2, damping: 0.3 },
    earR: { freq: 4.2, damping: 0.3 },
    'head.rot': { freq: 2.6, damping: 0.6 },
    pawR: { freq: 3, damping: 0.5 },
    pawL: { freq: 3, damping: 0.5 },
  },
  build,
  idle(p, t) {
    const br = wave(t, 2900);
    p['body.sy'] = 1 + 0.014 * br;
    p['body.sx'] = 1 - 0.006 * br;
    p['head.rot'] = 2 * wave(t, 5200, 0.2);
    p['tail.rot'] = 7 * wave(t, 3200);
    p.earL = -10 * twitch(t, 3);
    p.earR = -10 * twitch(t + 900, 7);
  },
  derive(p) {
    // the tip bends the way the base swung, a beat later (its spring is slower and looser)
    p['tail.bend'] = p['tail.rot'] * 0.9;
  },
  render(rig, p, gaze, _t, paint) {
    const I = instances.get(paint)!;
    const G = I.geo;
    rig.set('root', { x: p['body.x'], y: p['body.y'], rot: p['body.rot'] });
    rig.set('torso', { sx: p['body.sx'], sy: p['body.sy'] });
    const y = p['body.y'];
    rig.set('shadow', { sx: 1 + y * 0.008, sy: 1 + y * 0.008 });
    rig.attr('shadow', 'opacity', 1 + y * 0.014);
    rig.set('tail', { rot: p['tail.rot'] });
    rig.path('tail', bendTail(I.tail, p['tail.bend'], G.bs));
    rig.path('tailTip', bendTail(I.tip, p['tail.bend'], G.bs));
    rig.set('legR', { rot: p.pawR });
    rig.set('legL', { rot: -p.pawL });
    if (I.noodle) {
      rig.path('shinR', noodleLeg(G.reach, p.pawR, 1));
      rig.path('shinL', noodleLeg(G.reach, -p.pawL, -1));
    }
    rig.set('head', { x: gaze.x * 1.5, y: p['head.y'], rot: p['head.rot'] + gaze.x * 5 });
    rig.set('earL', { rot: p.earL });
    rig.set('earR', { rot: -p.earR });
    rig.set('eyes', { x: gaze.x * 3, y: gaze.y * 2 });
    I.eyes.render(rig, p, gaze);
    I.brows.render(rig, p);
    renderMarks(rig, p, I.marks, Math.max(0, -y));
    rig.attr('blush', 'opacity', Math.max(paint.cheekRest, Math.min(1, p['face.blush']) * 0.9));
  },
};
