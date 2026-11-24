// biped: a body standing on two legs, a head on a neck, arms with a shoulder and an elbow,
// and an antenna that lags the head on a loose spring. Example: mascots/robot.
import type { Anatomy, Built } from '../../kit/character.js';
import { FACE_DEFAULTS } from '../../kit/face.js';
import { browSet, eyeModel, faceInks, type BrowSet, type EyeSet } from '../../kit/faces/index.js';
import { markParts, renderMarks } from '../../kit/faces/marks.js';
import { cornerScale, DEFAULT_FORM, isDefaultForm, scales, snapTo, type Form } from '../../kit/form.js';
import { mapPoints, parse, toD, type PathSpec } from '../../kit/morph.js';
import { wave } from '../../kit/motion.js';
import type { Part, Shape } from '../../kit/rig.js';
import { ellipse, roundRect } from '../../kit/shapes.js';
import type { AnatomyContract, MascotSpec } from '../../kit/spec.js';
import type { Painter } from '../../kit/style.js';
import type { ActionSpec } from '../../kit/timeline.js';

const det = (s: Shape): Shape => ({ ...s, kind: 'detail' });

const DEFAULTS = {
  'body.x': 0, 'body.y': 0, 'body.sx': 1, 'body.sy': 1, 'body.rot': 0,
  'head.rot': 0, 'head.y': 0, antenna: 0,
  'armR.sh': 0, 'armR.el': 0, 'armL.sh': 0, 'armL.el': 0,
  'legL.lift': 0, 'legR.lift': 0, core: 1,
  ...FACE_DEFAULTS,
};

export const contract: AnatomyContract = {
  name: 'biped',
  channels: Object.keys(DEFAULTS),
  palette: ['body', 'body-dark', 'visor', 'eye', 'accent', 'cheek', 'glow', 'ink', 'shine', 'prop'],
  required: ['body'],
  contrastPairs: [['eye', 'visor']],
  body: {},
  builtins: ['wave', 'hop', 'look-around', 'stretch', 'notice', 'surprise'],
};

const UP = (ms: number, v: number): [number, number][] => [[0, v], [ms, v]];

export const builtins: ActionSpec[] = [
  {
    name: 'wave', duration: 2600, weight: 3,
    tracks: [
      { ch: 'armR.sh', keys: UP(2600, -78) },
      { ch: 'armR.el', keys: UP(2600, -72), osc: { amp: 26, period: 520 } },
      { ch: 'eyes.happy', keys: UP(2600, 0.8) },
      { ch: 'head.rot', keys: UP(2600, 4) },
      { ch: 'look.x', op: 'set', keys: UP(2600, 0.3) },
      { ch: 'look.w', keys: UP(2600, 1) },
    ],
  },
  {
    name: 'hop', duration: 1700, weight: 2,
    jumps: [{ at: 300, air: 420, height: 22 }],
    tracks: [
      { ch: 'armR.sh', env: false, keys: [[0, 0], [250, 0], [400, -70], [700, -70], [1000, 0], [1700, 0]] },
      { ch: 'armL.sh', env: false, keys: [[0, 0], [250, 0], [400, -70], [700, -70], [1000, 0], [1700, 0]] },
      { ch: 'legL.lift', env: false, keys: [[0, 0], [300, 0], [420, 6], [640, 6], [720, 0], [1700, 0]] },
      { ch: 'legR.lift', env: false, keys: [[0, 0], [300, 0], [420, 6], [640, 6], [720, 0], [1700, 0]] },
      { ch: 'eyes.happy', keys: UP(1700, 1) },
      { ch: 'prop.sparkles', op: 'set', curve: 'linear', keys: [[0, -1], [299, -1], [300, 0], [1300, 1], [1301, -1], [1700, -1]] },
    ],
  },
  {
    name: 'look-around', duration: 2600, weight: 3,
    tracks: [
      { ch: 'look.x', op: 'set', keys: [[0, 0], [400, -1], [1100, -1], [1500, 1], [2200, 1], [2600, 0]] },
      { ch: 'look.w', keys: UP(2600, 1) },
      { ch: 'head.rot', keys: [[0, 0], [400, -7], [1100, -7], [1500, 7], [2200, 7], [2600, 0]] },
    ],
  },
  {
    name: 'stretch', duration: 2400, weight: 1.5,
    tracks: [
      { ch: 'armR.sh', keys: [[0, 0], [600, -95], [1500, -95], [1800, 0], [2400, 0]] },
      { ch: 'armL.sh', keys: [[0, 0], [600, -95], [1500, -95], [1800, 0], [2400, 0]] },
      { ch: 'armR.el', keys: [[0, 0], [600, -60], [1500, -60], [1800, 0], [2400, 0]] },
      { ch: 'armL.el', keys: [[0, 0], [600, -60], [1500, -60], [1800, 0], [2400, 0]] },
      { ch: 'body.sy', op: 'mul', keys: [[0, 1], [600, 1.08], [1500, 1.08], [1800, 0.97], [2100, 1.01], [2400, 1]] },
      { ch: 'eyes.open', op: 'min', keys: [[0, 1], [600, 0.1], [1500, 0.1], [1800, 1], [2400, 1]] },
      { ch: 'head.rot', osc: { amp: 4, period: 1200, window: [300, 1600] } },
    ],
  },
  {
    name: 'notice', duration: 1900,
    jumps: [{ at: 250, air: 260, height: 8 }],
    tracks: [
      { ch: 'eyes.scale', op: 'mul', keys: [[0, 1], [250, 1.3], [500, 1], [1900, 1]] },
      { ch: 'armR.sh', keys: [[0, 0], [500, 0], [800, -78], [1900, -78]] },
      { ch: 'armR.el', keys: [[0, 0], [500, 0], [800, -72], [1900, -72]], osc: { amp: 24, period: 480, window: [600, 1900] } },
      { ch: 'eyes.happy', keys: [[0, 0], [450, 0], [700, 1], [1900, 1]] },
    ],
  },
  {
    name: 'surprise', duration: 1500,
    jumps: [{ at: 120, air: 380, height: 26, startle: true }],
    tracks: [
      { ch: 'eyes.scale', op: 'mul', keys: [[0, 1], [400, 1.4], [900, 1], [1500, 1]] },
      { ch: 'armR.sh', keys: [[0, 0], [80, 0], [220, -150], [600, -150], [1000, 0], [1500, 0]] },
      { ch: 'armL.sh', keys: [[0, 0], [80, 0], [220, -150], [600, -150], [1000, 0], [1500, 0]] },
      { ch: 'legL.lift', env: false, keys: [[0, 0], [120, 0], [240, 5], [450, 5], [520, 0], [1500, 0]] },
      { ch: 'legR.lift', env: false, keys: [[0, 0], [120, 0], [240, 5], [450, 5], [520, 0], [1500, 0]] },
    ],
  },
];

/** Numbers for a form; the default form gives exactly the authored ones. */
interface Geo {
  custom: boolean;
  hs: number; vy: number; bs: number; arm: number; leg: number; thick: number; kr: number;
  legLen: number; legW: number; hipX: number;
  torsoY: number; headY: number;
  upper: [number, number]; fore: [number, number];
  eyeX: number; eyeY: number; gazeX: number;
  visor: [number, number, number, number];
}

function geometry(form: Form): Geo {
  const custom = !isDefaultForm(form);
  const S = scales(form);
  const g = (v: number) => (custom ? snapTo(form, v) : v);
  const hs = S.head, vy = S.head * S.aspect, bs = S.body;
  const legLen = g(26 * S.leg);
  const fs = custom ? form.face.scale : 1;
  const eyeX = g(11.5 * hs * form.face.spacing);
  const ery = 6 * hs * fs;
  const eyeY = -18 * vy + form.face.y * ery;
  // The visor grows to hold bigger eyes (and brows), but stays inside the head.
  const browRoom = form.brows === 'none' ? 0 : ery * 0.7 + 2;
  const vTop = custom ? Math.max(-40 * vy + 6, Math.min(-30 * vy, eyeY - ery * 1.35 - 3 - browRoom)) : -30;
  const vBot = custom ? Math.min(4 * hs - 4, Math.max(-6 * vy, eyeY + ery * 1.35 + 3)) : -6;
  const vHalf = custom ? Math.min(30 * hs, Math.max(26 * hs, eyeX + 4.5 * hs * fs * 1.5 + 4)) : 26;
  return {
    custom, hs, vy, bs, arm: S.arm, leg: S.leg, thick: S.thick, kr: cornerScale(form.corners),
    legLen, legW: 5.5 * S.thick, hipX: 10.5 * bs,
    torsoY: 2 - legLen - 4 + 4, headY: -42 * bs - 8,
    upper: [14 * S.arm, 13 * S.arm], fore: [2 * S.arm, 16 * S.arm],
    eyeX, eyeY, gazeX: custom ? Math.max(1, Math.min(8, vHalf - eyeX - 4.5 * hs * fs * 1.3 - 1)) : 8,
    visor: [-vHalf, vTop, vHalf, vBot],
  };
}

interface Instance { geo: Geo; eyes: EyeSet; brows: BrowSet; noodle: boolean; marks: Form['marks'] }
const instances = new WeakMap<Painter, Instance>();

/** Rotate an authored path by deg about the origin. */
const turn = (dd: string, deg: number) => {
  const a = (deg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
  return toD(mapPoints(parse(dd), (_, x, y) => [x * c - y * s, x * s + y * c]));
};

/** A hand drawn along +x (m = 1) or −x (m = −1), turned to `deg`. */
function handShapes(kind: Form['hands'], m: number, deg: number, thick: number, paint: Painter): Shape[] {
  const k = Math.sqrt(thick);
  const sh: Shape[] = [];
  if (kind === 'glove') {
    const w = paint.flat('shine');
    sh.push(
      { d: roundRect(m > 0 ? -3 : -1, -5.2 * k, m > 0 ? 1 : 3, 5.2 * k, 1.5), fill: w },
      { d: ellipse(6 * m * k, 0, 6 * k, 5.8 * k), fill: w },
      { d: ellipse(11.2 * m * k, -3.6 * k, 2.8 * k, 2.3 * k), fill: w },
      { d: ellipse(12.2 * m * k, 0.4 * k, 2.8 * k, 2.3 * k), fill: w },
      { d: ellipse(10.8 * m * k, 4.2 * k, 2.6 * k, 2.2 * k), fill: w },
      { d: ellipse(4.6 * m * k, -6 * k, 2.3 * k, 2.5 * k), fill: w },
    );
  } else if (kind === 'mitten') {
    sh.push(
      { d: ellipse(4 * m * k, 0.5 * k, 7 * k, 6.2 * k), fill: paint.fill('body') },
      { d: ellipse(2.4 * m * k, -5.6 * k, 2.8 * k, 3 * k), fill: paint.fill('body') },
    );
  } else if (kind === 'knob') {
    sh.push({ d: ellipse(2 * m, 0, 6.5 * k, 6.5 * k), fill: paint.fill('accent') });
  }
  return sh.map((x) => ({ ...x, d: turn(x.d!, deg) }));
}

function build(spec: MascotSpec, paint: Painter, form: Form = DEFAULT_FORM): Built {
  const G = geometry(form);
  const out = paint.outline(0.62);
  const kr = G.kr;
  const noodle = form.limbs === 'noodle';
  const root = (children: Part[]): Part => ({ id: 'root', at: [80, 148], children });
  const torso = (children: Part[], shapes: Shape[] = []): Part => ({ id: 'torso', at: [0, G.torsoY], shapes, children });
  const head = (children: Part[], shapes: Shape[] = []): Part => ({ id: 'head', at: [0, G.headY], shapes, children });
  const leg = (side: 'L' | 'R'): Part => {
    const m = side === 'L' ? -1 : 1;
    const w = G.legW, l = G.legLen;
    const shapes: Shape[] = [{ d: G.custom && form.taper ? taperedLeg(w, l, form.taper, kr) : roundRect(-w, 0, w, l, w * Math.min(1, kr)), fill: paint.fill('body-dark') }];
    if (form.feet === 'shoe') shapes.push({ d: ellipse(3.5 * m, l - 1, 9.5, 5.6), fill: paint.fill('body-dark') });
    if (form.feet === 'block') shapes.push({ d: roundRect(m > 0 ? -w : -w - 4, l - 6, m > 0 ? w + 4 : w, l + 1, 1.5 * kr), fill: paint.fill('body-dark') });
    return { id: `leg${side}`, at: [side === 'L' ? -G.hipX : G.hipX, -(4 + l)], shapes };
  };
  const arm = (side: 'L' | 'R'): Part => {
    const m = side === 'L' ? -1 : 1;
    const [ux, uy] = G.upper, [fx, fy] = G.fore;
    const w = 10 * G.thick;
    const hands = form.hands === 'default' || form.hands === 'none' ? [] : [{ at: [fx * m, fy] as [number, number], shapes: handShapes(form.hands, m, m * (Math.atan2(fy, fx) * 180) / Math.PI, G.thick, paint) }];
    if (noodle) {
      return {
        id: `arm${side}`, at: [23 * G.bs * m, -42 * G.bs + 12 * G.bs],
        shapes: [{ pathRef: `noodle${side}`, stroke: paint.flat('body'), width: w }],
        children: [{ id: `elbow${side}`, at: [ux * m, uy], children: hands }],
      };
    }
    return {
      id: `arm${side}`, at: [23 * G.bs * m, -42 * G.bs + 12 * G.bs],
      shapes: [{ d: `M0 0L${ux * m} ${uy}`, stroke: paint.flat('body-dark'), width: w }],
      children: [{ id: `elbow${side}`, at: [ux * m, uy], shapes: [{ d: `M0 0L${fx * m} ${fy}`, stroke: paint.flat('body'), width: G.custom ? w * (1 - 0.4 * form.taper) : w }], children: hands }],
    };
  };
  const lw = paint.lineWidth(3.5);
  const { hs, vy, bs } = G;
  const eyes = eyeModel(form.eyes).make(4.5 * hs * (G.custom ? form.face.scale : 1), 6 * hs * (G.custom ? form.face.scale : 1), paint);
  const brows = browSet(form.brows, eyes.rx, eyes.ry, faceInks(paint).line);
  const browParts = (['L', 'R'] as const).map((sd) => brows.part(sd, [(sd === 'L' ? -1 : 1) * G.eyeX, -eyes.ry * 1.38 - 1.5])).filter((x): x is Part => !!x);
  const marks = markParts(form.marks, {
    sweat: [36 * hs, -32 * vy, 4.4],
    cheeks: [[-22 * hs, -1 * hs], [22 * hs, -1 * hs]],
    speed: [20 * bs, 0],
  }, paint);
  instances.set(paint, { geo: G, eyes, brows, noodle, marks: form.marks });
  const [v0, v1, v2, v3] = G.visor;
  return {
    viewBox: '0 -30 160 190',
    rootAt: [80, 148],
    stage: [80, 92, 70],
    label: `${spec.title} mascot`,
    layers: [
      { outline: null, root: { id: 'shadow', at: [80, 148], shapes: [det({ el: { tag: 'ellipse', attrs: { rx: 30, ry: 5, fill: paint.shadow } }, ref: 'shadow' })] } },
      ...(marks.behind.length ? [{ outline: null, root: root(marks.behind) }] : []),
      { outline: out, root: root([leg('L'), leg('R')]) },
      {
        outline: out,
        root: root([torso([], [
          { d: roundRect(-6, -42 * bs - 10, 6, -42 * bs + 2, 2), fill: paint.fill('body-dark') },
          { d: roundRect(-26 * bs, -42 * bs, 26 * bs, 0, 18 * bs * kr), fill: paint.fill('body') },
          det({ el: { tag: 'circle', attrs: { cx: 0, cy: -21 * bs, r: 6 * bs, fill: paint.flat('eye') } }, ref: 'core' }),
        ])]),
      },
      { outline: out, root: root([torso([arm('L'), arm('R')])]) },
      {
        outline: out,
        root: root([torso([head([
          {
            id: 'antenna', at: [0, -40 * vy], shapes: [
              { d: 'M0 0L0 -13', stroke: paint.flat('body-dark'), width: 3.5 },
              { d: 'M0 -21.5C3 -21.5 5.5 -19 5.5 -16C5.5 -13 3 -10.5 0 -10.5C-3 -10.5 -5.5 -13 -5.5 -16C-5.5 -19 -3 -21.5 0 -21.5Z', fill: paint.fill('accent') },
            ],
          },
        ], [
          { d: roundRect(-41 * hs, -26 * vy, -32 * hs, -9 * vy, 4.5 * kr), fill: paint.fill('body-dark') },
          { d: roundRect(32 * hs, -26 * vy, 41 * hs, -9 * vy, 4.5 * kr), fill: paint.fill('body-dark') },
          { d: roundRect(-34 * hs, -40 * vy, 34 * hs, 4 * hs, 18 * Math.min(hs, vy) * kr), fill: paint.fill('body') },
          det({ d: roundRect(v0, v1, v2, v3, 12 * kr), fill: paint.fill('visor'), stroke: out ? paint.flat('ink') : undefined, width: out ? lw : undefined }),
          det({ el: { tag: 'ellipse', attrs: { cx: -22 * hs, cy: -1 * hs, rx: 4.5, ry: 2.6, fill: paint.flat('cheek') } }, ref: 'blush' }),
          det({ el: { tag: 'ellipse', attrs: { cx: 22 * hs, cy: -1 * hs, rx: 4.5, ry: 2.6, fill: paint.flat('cheek') } }, ref: 'blush' }),
        ])])]),
      },
      // eyes inside the visor (their travel stays within it, so no clip is needed)
      {
        outline: null,
        root: root([torso([head([{ id: 'eyes', at: [0, G.eyeY], children: [eyes.part('L', [-G.eyeX, 0]), eyes.part('R', [G.eyeX, 0]), ...browParts] }, ...marks.face])])]),
      },
    ],
  };
}

/** A leg that thins towards the foot. */
function taperedLeg(w: number, l: number, taper: number, kr: number): string {
  const e = w * (1 - 0.45 * taper), r = Math.min(e, w * kr);
  return `M${-w} 0L${w} 0L${e} ${l - r}Q${e} ${l} ${e - r} ${l}L${-e + r} ${l}Q${-e} ${l} ${-e} ${l - r}Z`;
}

/** A noodle arm through shoulder, elbow and hand, in the arm's own frame. */
function noodlePath(G: Geo, m: number, elbowDeg: number): PathSpec {
  const [ux, uy] = G.upper, [fx, fy] = G.fore;
  const a = (elbowDeg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
  const ex = ux * m, ey = uy;
  const hx = ex + (fx * m) * c - fy * s, hy = ey + (fx * m) * s + fy * c;
  return [['M', 0, 0], ['Q', 2 * ex - hx / 2, 2 * ey - hy / 2, hx, hy]];
}

export const biped: Anatomy = {
  contract,
  usesForm: true,
  defaults: DEFAULTS,
  builtins,
  springs: {
    antenna: { freq: 2.2, damping: 0.22 },
    'head.rot': { freq: 2.6, damping: 0.6 },
    'armR.sh': { freq: 3, damping: 0.5 },
    'armL.sh': { freq: 3, damping: 0.5 },
    'armR.el': { freq: 3.6, damping: 0.45 },
    'armL.el': { freq: 3.6, damping: 0.45 },
  },
  build,
  idle(p, t) {
    const br = wave(t, 2800);
    p['body.sy'] = 1 + 0.015 * br;
    p['body.sx'] = 1 - 0.006 * br;
    p['head.y'] = 1.2 * wave(t, 2800, 0.2);
    p['body.rot'] = 0.8 * wave(t, 5600);
    p['armR.sh'] = 4 * wave(t, 3000, 0.1);
    p['armL.sh'] = 4 * wave(t, 3000, 0.4);
    p['armR.el'] = 3 * wave(t, 3000, 0.3);
    p['armL.el'] = 3 * wave(t, 3000, 0.6);
    p.core = 0.75 + 0.25 * wave(t, 1600);
  },
  derive(p, t) {
    // the antenna trails the head and the body, then wobbles back on a loose spring
    p.antenna = -1.6 * p['head.rot'] - 2 * p['body.rot'] + 0.25 * p['body.y'] + 2 * wave(t, 3400);
  },
  render(rig, p, gaze, _t, paint) {
    const I = instances.get(paint)!;
    const G = I.geo;
    rig.set('root', { x: p['body.x'], y: p['body.y'], rot: p['body.rot'] });
    rig.set('torso', { sx: p['body.sx'], sy: p['body.sy'] });
    const y = p['body.y'];
    rig.set('shadow', { sx: 1 + y * 0.008, sy: 1 + y * 0.008 });
    rig.attr('shadow', 'opacity', 1 + y * 0.014);
    rig.set('legL', { y: -p['legL.lift'] });
    rig.set('legR', { y: -p['legR.lift'] });
    rig.set('armR', { rot: p['armR.sh'] });
    rig.set('armL', { rot: -p['armL.sh'] });
    rig.set('elbowR', { rot: p['armR.el'] });
    rig.set('elbowL', { rot: -p['armL.el'] });
    rig.set('head', { x: gaze.x * 1.5, y: p['head.y'], rot: p['head.rot'] + gaze.x * 4 });
    rig.set('antenna', { rot: p.antenna });
    rig.set('eyes', { x: gaze.x * G.gazeX, y: gaze.y * 3 });
    I.eyes.render(rig, p, gaze);
    I.brows.render(rig, p);
    renderMarks(rig, p, I.marks, Math.max(0, -y));
    if (I.noodle) {
      rig.path('noodleR', noodlePath(G, 1, p['armR.el']));
      rig.path('noodleL', noodlePath(G, -1, -p['armL.el']));
    }
    rig.attr('core', 'opacity', 0.35 + 0.65 * Math.max(0, Math.min(1, p.core)));
    rig.attr('blush', 'opacity', Math.max(paint.cheekRest * 0.8, Math.min(1, p['face.blush']) * 0.9));
  },
};

