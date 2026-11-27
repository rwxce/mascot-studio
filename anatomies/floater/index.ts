// floater: a body with no legs that floats — round top, a wavy hem that ripples on every
// frame (same commands, so it morphs), small arms, a mouth that can open. It can spin, swell
// and fade. Example: mascots/ghost.
import type { Anatomy, Built } from '../../kit/character.js';
import { eyePart, eyePoses, FACE_DEFAULTS, renderEyes } from '../../kit/face.js';
import { browSet, eyeModel, faceInks, mouthSet, type BrowSet, type EyeSet, type MouthSet } from '../../kit/faces/index.js';
import { markParts, renderMarks } from '../../kit/faces/marks.js';
import { DEFAULT_FORM, isDefaultForm, scales, snapTo, type Form } from '../../kit/form.js';
import { blendPaths, mapPoints, parse, toD, type PathSpec } from '../../kit/morph.js';
import { backLimb, frontLimb, frontWhenRaised } from '../../kit/limbs.js';
import { wave } from '../../kit/motion.js';
import type { Part, Rig, Shape } from '../../kit/rig.js';
import { ellipse, roundRect as roundRectD } from '../../kit/shapes.js';
import type { AnatomyContract, MascotSpec } from '../../kit/spec.js';
import type { Painter } from '../../kit/style.js';
import type { ActionSpec, Pose } from '../../kit/timeline.js';

const det = (s: Shape): Shape => ({ ...s, kind: 'detail' });
/** The ghost's body, in the arms' parent space (the 'ghost' group): what a back arm hides behind. */
const GHOST: Part[] = [{ shapes: [{ pathRef: 'body' }] }];
/** How raised a ghost arm is (0 at rest, 1 at 100°: the flipper above the shoulder). */
const armLift = (rot: number) => Math.max(0, -rot / 100);
const EYES = eyePoses(6, 8);
const MOUTH = eyePoses(4, 5).open;
const MOUTH_BIG = eyePoses(7, 9).open;
const MOUTH_SMILE = mapPoints(eyePoses(5.5, 6).happy, (_, x, y) => [x, -y + 1]);
const HEM_X = [34, 22.7, 11.3, 0, -11.3, -22.7, -34];

/** The body, centred on its middle, with a hem rippling at phase `ph` and amplitude `amp`. */
function bodyPath(ph: number, amp: number) {
  let d = 'M-34 -4C-34 -30 -19 -46 0 -46C19 -46 34 -30 34 -4L34 44';
  for (let i = 0; i < 6; i++) {
    const cx = (HEM_X[i] + HEM_X[i + 1]) / 2;
    const cy = 44 + (i % 2 === 0 ? -1 : 1) * 8 * amp * Math.sin(ph);
    d += `Q${cx.toFixed(2)} ${cy.toFixed(2)} ${HEM_X[i + 1]} 44`;
  }
  return parse(d + 'L-34 -4Z');
}

const DEFAULTS = {
  'body.x': 0, 'body.y': 0, 'body.sx': 1, 'body.sy': 1, 'body.rot': 0,
  armL: 0, armR: 0, hem: 1, 'mouth.open': 0, 'mouth.smile': 0, fade: 1,
  ...FACE_DEFAULTS,
};

export const contract: AnatomyContract = {
  name: 'floater',
  channels: Object.keys(DEFAULTS),
  palette: ['body', 'body-dark', 'eye', 'cheek', 'glow', 'accent', 'ink', 'shine', 'prop'],
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
      { ch: 'armR', keys: C(2600, -115), osc: { amp: 22, period: 480 } },
      { ch: 'body.rot', keys: C(2600, -4) },
      { ch: 'eyes.happy', keys: C(2600, 0.8) },
      { ch: 'mouth.smile', keys: C(2600, 1) },
    ],
  },
  {
    name: 'hop', duration: 1800, weight: 2,
    tracks: [
      { ch: 'body.y', env: false, keys: [[0, 0], [250, 4], [700, -24], [1100, -24], [1600, 0], [1800, 0]] },
      { ch: 'body.sy', op: 'mul', keys: [[0, 1], [250, 0.92], [500, 1.08], [1000, 1], [1500, 1.04], [1800, 1]] },
      { ch: 'hem', op: 'mul', keys: [[0, 1], [500, 1.8], [1200, 1.8], [1800, 1]] },
      { ch: 'armL', keys: [[0, 0], [400, -60], [1300, -60], [1800, 0]] },
      { ch: 'armR', keys: [[0, 0], [400, -60], [1300, -60], [1800, 0]] },
      { ch: 'eyes.happy', keys: C(1800, 1) },
      { ch: 'prop.sparkles', op: 'set', curve: 'linear', keys: [[0, -1], [399, -1], [400, 0], [1400, 1], [1401, -1], [1800, -1]] },
    ],
  },
  {
    name: 'look-around', duration: 2600, weight: 3,
    tracks: [
      { ch: 'look.x', op: 'set', keys: [[0, 0], [400, -1], [1100, -1], [1500, 1], [2200, 1], [2600, 0]] },
      { ch: 'look.w', keys: C(2600, 1) },
      { ch: 'body.x', keys: [[0, 0], [400, -6], [1100, -6], [1500, 6], [2200, 6], [2600, 0]] },
      { ch: 'body.rot', keys: [[0, 0], [400, -5], [1100, -5], [1500, 5], [2200, 5], [2600, 0]] },
    ],
  },
  {
    name: 'stretch', duration: 2400, weight: 1.5,
    tracks: [
      { ch: 'body.sy', op: 'mul', keys: [[0, 1], [600, 1.14], [1500, 1.14], [1800, 0.94], [2100, 1.02], [2400, 1]] },
      { ch: 'body.sx', op: 'mul', keys: [[0, 1], [600, 0.92], [1500, 0.92], [1800, 1.04], [2400, 1]] },
      { ch: 'armL', keys: [[0, 0], [600, -150], [1500, -150], [1800, 0], [2400, 0]] },
      { ch: 'armR', keys: [[0, 0], [600, -150], [1500, -150], [1800, 0], [2400, 0]] },
      { ch: 'eyes.open', op: 'min', keys: [[0, 1], [600, 0.1], [1500, 0.1], [1800, 1], [2400, 1]] },
      { ch: 'mouth.open', keys: [[0, 0], [600, 0.6], [1500, 0.6], [1800, 0], [2400, 0]] },
    ],
  },
  {
    name: 'notice', duration: 1800,
    tracks: [
      { ch: 'eyes.scale', op: 'mul', keys: [[0, 1], [250, 1.3], [500, 1], [1800, 1]] },
      { ch: 'body.y', env: false, keys: [[0, 0], [200, -10], [500, 0], [1800, 0]] },
      { ch: 'armR', keys: [[0, 0], [500, 0], [800, -115], [1800, -115]], osc: { amp: 20, period: 460, window: [700, 1800] } },
      { ch: 'eyes.happy', keys: [[0, 0], [450, 0], [700, 1], [1800, 1]] },
      { ch: 'mouth.smile', keys: [[0, 0], [450, 0], [700, 1], [1800, 1]] },
    ],
  },
  {
    name: 'surprise', duration: 1500,
    tracks: [
      { ch: 'eyes.scale', op: 'mul', keys: [[0, 1], [300, 1.45], [900, 1], [1500, 1]] },
      { ch: 'mouth.open', keys: [[0, 0], [150, 1], [900, 1], [1300, 0], [1500, 0]] },
      { ch: 'body.y', env: false, keys: [[0, 0], [150, -22], [700, -18], [1200, 0], [1500, 0]] },
      { ch: 'body.sx', op: 'mul', keys: [[0, 1], [150, 1.12], [400, 0.96], [700, 1], [1500, 1]] },
      { ch: 'body.sy', op: 'mul', keys: [[0, 1], [150, 0.9], [400, 1.05], [700, 1], [1500, 1]] },
      { ch: 'hem', op: 'mul', keys: [[0, 1], [150, 2.2], [900, 2.2], [1500, 1]] },
      { ch: 'armL', keys: [[0, 0], [150, -130], [800, -130], [1200, 0], [1500, 0]] },
      { ch: 'armR', keys: [[0, 0], [150, -130], [800, -130], [1200, 0], [1500, 0]] },
    ],
  },
];

// ---------------------------------------------------------------- form
// The authored ghost (default form) keeps its own fast path below, byte for byte. A style with a
// form redraws it from these numbers: the same parts and channels, in the style's shape language.

const K = 0.5523;
const r2 = (n: number) => Math.round(n * 100) / 100;
/** Bounds of the authored ghost a form may not exceed (it spins, swells ×1.22 and lifts). */
const MAX_HALF = 36, MAX_TOP = 48, MAX_HEM = 46;
/** The farthest an arm and its hand may reach from the shoulder. */
const MAX_REACH = 27;

/** Numbers for a form (only used when the form is not the default one). */
interface Geo {
  /** Half width, shoulder line (where the dome meets the sides), top of the dome, hem line. */
  W: number; y0: number; top: number; hem: number;
  /** Dome tangents (fractions of its height and half width) and the outward bulge of the sides. */
  a: number; b: number; bulge: number;
  /** Hem ripple amplitude and roundness (0 = zigzag teeth … 1 = round scallops). */
  amp: number; round: number;
  /** Arm pivot, length (shoulder to hand), half thickness at the root and at the end. */
  armAt: [number, number]; armLen: number; armW: number; armE: number;
  eyesY: number; eyeX: number; eyeRx: number; eyeRy: number;
  mouthY: number; mouthScale: number;
  cheek: [number, number];
}

function geometry(form: Form): Geo {
  const S = scales(form);
  const g = (v: number) => snapTo(form, v);
  const c = form.corners;
  // The ghost is all head: the head scale is its width and dome, the body scale its skirt.
  let hx = S.head, hy = S.head * S.aspect, sk = S.body;
  // Sharp corners pull the dome towards a true half circle (geometric); blobby ones fill it out.
  const domeK = c < 0.5 ? 34 / 42 + (1 - 34 / 42) * (c / 0.5) : 1;
  // Keep the bigger forms inside the authored bounds (every action is checked against them).
  const u = Math.max(0, c - 0.5) / 0.5, v = Math.max(0, 0.5 - c) / 0.5;
  // (the half width counts the sides' bulge: a blobby skirt is wider)
  const fit = Math.min(1, MAX_HALF / (34 * hx + 4 * hx * u), MAX_TOP / (4 + 42 * hy * domeK), MAX_HEM / (-4 + 48 * sk));
  hx *= fit; hy *= fit; sk *= fit;
  const W = g(34 * hx), y0 = -4, top = -g(4 + 42 * hy * domeK), hem = g(-4 + 48 * sk);
  const a = c < 0.5 ? 0.619 + (K - 0.619) * v : 0.619 + 0.13 * u;
  const b = c < 0.5 ? 0.559 + (K - 0.559) * v : 0.559 + 0.17 * u;
  const fs = form.face.scale * hx;
  const eyeRx = 6 * fs, eyeRy = 8 * fs;
  const fy = form.face.y * eyeRy;
  const eyesY = -8 * hy + fy;
  const eyeX = g(12 * hx * form.face.spacing);
  const thick = S.thick;
  const armW = 7 * Math.min(1.6, thick);
  return {
    W, y0, top, hem, a, b, bulge: 4 * hx * u, amp: 8 * Math.min(1, sk) * (1 - 0.25 * v), round: Math.min(1, c / 0.4),
    armAt: [W + 4 * hx * u * 0.6, 2], armLen: g(20 * S.arm), armW, armE: armW * (1 - 0.6 * form.taper),
    eyesY, eyeX, eyeRx, eyeRy,
    mouthY: 10 * hy + fy * 0.55, mouthScale: 1.15 * hx * form.face.mouth,
    cheek: [22 * hx, 6 * hy + fy * 0.55],
  };
}

/** The body of a form, hem rippling at phase `ph` with amplitude multiplier `amp` (same commands every frame). */
function formBody(G: Geo, ph: number, amp: number): PathSpec {
  const { W, y0, top, hem, a, b, bulge } = G;
  const h = y0 - top;
  const n = 6;
  let d = `M${r2(-W)} ${r2(y0)}C${r2(-W)} ${r2(y0 - a * h)} ${r2(-b * W)} ${r2(top)} 0 ${r2(top)}C${r2(b * W)} ${r2(top)} ${r2(W)} ${r2(y0 - a * h)} ${r2(W)} ${r2(y0)}`;
  // sides: straight (bulge 0) or swelling out like a soft puppet
  d += `C${r2(W + bulge)} ${r2(y0 + (hem - y0) * 0.35)} ${r2(W + bulge)} ${r2(y0 + (hem - y0) * 0.7)} ${r2(W)} ${r2(hem)}`;
  // hem: n lobes, each two quadratics through its tip; the control points slide between the
  // straight line (zigzag teeth) and the corner of the lobe (round scallops).
  const w = (2 * W) / n;
  for (let i = 0; i < n; i++) {
    const x0 = W - i * w, x1 = x0 - w, xm = (x0 + x1) / 2;
    const ym = hem + (i % 2 === 0 ? -1 : 1) * 0.5 * G.amp * amp * Math.sin(ph);
    const q1 = [xm + w / 4, hem + (ym - hem) * (0.5 + 0.5 * G.round)];
    const q2 = [xm - w / 4, hem + (ym - hem) * (0.5 + 0.5 * G.round)];
    d += `Q${r2(q1[0])} ${r2(q1[1])} ${r2(xm)} ${r2(ym)}Q${r2(q2[0])} ${r2(q2[1])} ${r2(x1)} ${r2(hem)}`;
  }
  d += `C${r2(-W - bulge)} ${r2(y0 + (hem - y0) * 0.7)} ${r2(-W - bulge)} ${r2(y0 + (hem - y0) * 0.35)} ${r2(-W)} ${r2(y0)}Z`;
  return parse(d);
}

/** An arm hanging down from its pivot: round at the shoulder, `e` half thick at the end. */
function armPath(w: number, len: number, e: number, m: number): string {
  const y0 = -2, c = w, ce = e;
  const x = (v: number) => r2(v + 2 * m);
  return `M${x(-w)} ${r2(y0 + c)}C${x(-w)} ${r2(y0 + c - K * c)} ${x(-K * w)} ${r2(y0)} ${x(0)} ${r2(y0)}C${x(K * w)} ${r2(y0)} ${x(w)} ${r2(y0 + c - K * c)} ${x(w)} ${r2(y0 + c)}`
    + `L${x(e)} ${r2(len - ce)}C${x(e)} ${r2(len - ce + K * ce)} ${x(K * e)} ${r2(len)} ${x(0)} ${r2(len)}C${x(-K * e)} ${r2(len)} ${x(-e)} ${r2(len - ce + K * ce)} ${x(-e)} ${r2(len - ce)}Z`;
}

/** Rotate an authored path by deg about the origin. */
const turn = (dd: string, deg: number) => {
  const a = (deg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
  return toD(mapPoints(parse(dd), (_, x, y) => [x * c - y * s, x * s + y * c]));
};

/** A hand drawn along +x (m = 1) or −x (m = −1), turned to point down the arm. */
function handShapes(kind: Form['hands'], m: number, thick: number, paint: Painter): Shape[] {
  const k = Math.sqrt(Math.min(1.6, thick));
  const sh: Shape[] = [];
  if (kind === 'glove') {
    const w = paint.flat('shine');
    sh.push(
      { d: roundRectD(m > 0 ? -3 : -1, -5.2 * k, m > 0 ? 1 : 3, 5.2 * k, 1.5), fill: w },
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
  return sh.map((x) => ({ ...x, d: turn(x.d!, 90 * m) }));
}

/** How far a hand reaches past the end of its arm. */
const handReach = (kind: Form['hands'], thick: number) => {
  const k = Math.sqrt(Math.min(1.6, thick));
  return kind === 'glove' ? 15 * k : kind === 'mitten' ? 11 * k : kind === 'knob' ? 8.5 * k : 0;
};

/** A noodle arm from the pivot to the hand, sagging under gravity, in the arm's own frame. */
function noodlePath(len: number, angDeg: number, m: number): PathSpec {
  const a = (angDeg * Math.PI) / 180;
  const sag = len * 0.35;
  return [['M', 2 * m, 0], ['Q', 2 * m + Math.sin(a) * sag, len / 2, 2 * m, len]];
}

/** Per character: its geometry and face models (keyed by the character's painter). */
interface Instance { custom: true; geo: Geo; len: number; eyes: EyeSet; mouth: MouthSet; brows: BrowSet; noodle: boolean; marks: Form['marks'] }
const instances = new WeakMap<Painter, Instance>();

function buildForm(spec: MascotSpec, paint: Painter, form: Form): Built {
  const G = geometry(form);
  const out = paint.outline(0.55);
  const noodle = form.limbs === 'noodle';
  const hands = form.hands === 'default' || form.hands === 'none' ? null : form.hands;
  const thick = scales(form).thick;
  const root = (children: Part[]): Part => ({ id: 'root', at: [80, 82], children });
  // with a hand the arm is a short limb; without one it is the ghost's own flipper
  // (arm and hand together reach at most MAX_REACH, so a raised glove stays in frame when it swells)
  const len = hands ? Math.max(G.armW, Math.min(G.armLen - handReach(hands, thick) * 0.35, MAX_REACH - handReach(hands, thick))) : G.armLen;
  const arm = (side: 'L' | 'R'): Part => {
    const m = side === 'L' ? -1 : 1;
    const shapes: Shape[] = noodle
      ? [{ pathRef: `noodle${side}`, stroke: paint.flat('body-dark'), width: G.armW * 1.25 }]
      : form.hands === 'none' ? [] : [{ d: armPath(G.armW, len, hands ? Math.min(G.armE, G.armW * 0.8) : G.armE, m), fill: paint.fill('body-dark') }];
    const children: Part[] = hands ? [{ id: `hand${side}`, at: [2 * m, len], shapes: handShapes(hands, m, thick, paint) }] : [];
    return { id: `arm${side}`, at: [m * G.armAt[0], G.armAt[1]], shapes, children };
  };
  const eyes = eyeModel(form.eyes).make(G.eyeRx, G.eyeRy, paint);
  const mouth = mouthSet(form.mouth, G.mouthScale);
  const brows = browSet(form.brows, eyes.rx, eyes.ry, faceInks(paint).line);
  const browParts = (['L', 'R'] as const).map((sd) => brows.part(sd, [(sd === 'L' ? -1 : 1) * G.eyeX, -eyes.ry * 1.42 - 1.5])).filter((x): x is Part => !!x);
  // Big, low eyes push the cheeks down and out so the blush sits under the eyes, not on them.
  const cheek: [number, number] = [Math.min(G.W - 6, Math.max(G.cheek[0], G.eyeX + eyes.rx * 0.5)), Math.max(G.cheek[1], G.eyesY + eyes.ry * 0.95)];
  const marks = markParts(form.marks, {
    sweat: [G.W * 0.74, G.y0 + (G.top - G.y0) * 0.62, 4.6 * G.W / 34],
    cheeks: [[-cheek[0], cheek[1]], [cheek[0], cheek[1]]],
    speed: [G.W * 0.6, G.hem + 12],
  }, paint);
  instances.set(paint, { custom: true, geo: G, len, eyes, mouth, brows, noodle, marks: form.marks });
  return {
    viewBox: '0 -6 160 166',
    rootAt: [80, 148],
    stage: [80, 88, 70],
    label: `${spec.title} mascot`,
    layers: [
      { outline: null, root: { id: 'shadow', at: [80, 148], shapes: [det({ el: { tag: 'ellipse', attrs: { rx: 30, ry: 5, fill: paint.shadow } }, ref: 'shadow' })] } },
      // speed lines trail under the ghost but do not spin with it
      ...(marks.behind.length ? [{ outline: null, root: { id: 'fx', at: [80, 82] as [number, number], children: [{ id: 'ghost', children: marks.behind }] } }] : []),
      { outline: out, root: root([{ id: 'ghost', children: [backLimb(arm('L'), GHOST), backLimb(arm('R'), GHOST)] }]) },
      {
        outline: out,
        root: root([{
          id: 'ghost', data: { body: '' }, shapes: [{ pathRef: 'body', fill: paint.fill('body') }],
          children: [
            { id: 'eyes', at: [0, G.eyesY], children: [eyes.part('L', [-G.eyeX, 0]), eyes.part('R', [G.eyeX, 0]), ...browParts] },
            mouth.part([0, G.mouthY], paint.flat('eye')),
            {
              shapes: [
                det({ el: { tag: 'ellipse', attrs: { cx: -cheek[0], cy: cheek[1], rx: 5, ry: 3, fill: paint.flat('cheek') } }, ref: 'blush' }),
                det({ el: { tag: 'ellipse', attrs: { cx: cheek[0], cy: cheek[1], rx: 5, ry: 3, fill: paint.flat('cheek') } }, ref: 'blush' }),
              ],
            },
            ...marks.face,
          ],
        }]),
      },
      // A raised arm is drawn in front of the body (no drop shadow on the body).
      { outline: out, tag: 'front', root: root([{ id: 'ghost', children: [frontLimb(arm('L')), frontLimb(arm('R'))] }]) },
    ],
  };
}

function build(spec: MascotSpec, paint: Painter, form: Form = DEFAULT_FORM): Built {
  if (!isDefaultForm(form)) return buildForm(spec, paint, form);
  instances.delete(paint);
  return buildAuthored(spec, paint);
}

function buildAuthored(spec: MascotSpec, paint: Painter): Built {
  const out = paint.outline(0.55);
  const root = (children: Part[]): Part => ({ id: 'root', at: [80, 82], children });
  const arm = (side: 'L' | 'R'): Part => ({ id: `arm${side}`, at: [side === 'L' ? -34 : 34, 2], shapes: [{ d: ellipse(side === 'L' ? -2 : 2, 9, 7, 11), fill: paint.fill('body-dark') }] });
  return {
    viewBox: '0 -6 160 166',
    rootAt: [80, 148],
    stage: [80, 88, 70],
    label: `${spec.title} mascot`,
    layers: [
      { outline: null, root: { id: 'shadow', at: [80, 148], shapes: [det({ el: { tag: 'ellipse', attrs: { rx: 30, ry: 5, fill: paint.shadow } }, ref: 'shadow' })] } },
      { outline: out, root: root([{ id: 'ghost', children: [backLimb(arm('L'), GHOST), backLimb(arm('R'), GHOST)] }]) },
      {
        outline: out,
        root: root([{
          id: 'ghost', data: { body: '' }, shapes: [{ pathRef: 'body', fill: paint.fill('body') }],
          children: [
            { id: 'eyes', at: [0, -8], children: [eyePart('L', [-12, 0], EYES, paint), eyePart('R', [12, 0], EYES, paint)] },
            { at: [0, 10], shapes: [det({ pathRef: 'mouth', fill: paint.flat('eye') })] },
            {
              shapes: [
                det({ el: { tag: 'ellipse', attrs: { cx: -22, cy: 6, rx: 5, ry: 3, fill: paint.flat('cheek') } }, ref: 'blush' }),
                det({ el: { tag: 'ellipse', attrs: { cx: 22, cy: 6, rx: 5, ry: 3, fill: paint.flat('cheek') } }, ref: 'blush' }),
              ],
            },
          ],
        }]),
      },
      // A raised arm is drawn in front of the body (no drop shadow on the body).
      { outline: out, tag: 'front', root: root([{ id: 'ghost', children: [frontLimb(arm('L')), frontLimb(arm('R'))] }]) },
    ],
  };
}

export const floater: Anatomy = {
  contract,
  usesForm: true,
  defaults: DEFAULTS,
  builtins,
  springs: {
    armL: { freq: 2.8, damping: 0.45 },
    armR: { freq: 2.8, damping: 0.45 },
    'mouth.open': { freq: 4, damping: 0.5 },
  },
  build,
  idle(p, t) {
    p['body.y'] = 5 * wave(t, 2600);
    p['body.rot'] = 2 * wave(t, 3600, 0.3);
    p.armL = 8 * wave(t, 2600, 0.2);
    p.armR = 8 * wave(t, 2600, 0.45);
  },
  render(rig, p, gaze, t, paint) {
    rig.set('root', { x: p['body.x'] + gaze.x * 2, y: p['body.y'], rot: p['body.rot'], sx: p['body.sx'], sy: p['body.sy'] });
    rig.opacity('ghost', p.fade);
    // the shadow tightens and fades as the ghost rises
    const lift = Math.max(0, -p['body.y']);
    rig.set('shadow', { sx: 1 - lift * 0.012, sy: 1 - lift * 0.012 });
    rig.attr('shadow', 'opacity', Math.max(0.2, 1 - lift * 0.02) * p.fade);
    const I = instances.get(paint);
    if (I) return renderForm(rig, p, gaze, t, paint, I, lift);
    rig.path('body', bodyPath((t / 1100) * Math.PI * 2, p.hem));
    rig.set('armR', { rot: p.armR });
    rig.set('armL', { rot: -p.armL });
    frontWhenRaised(rig, 'armR', armLift(p.armR));
    frontWhenRaised(rig, 'armL', armLift(p.armL));
    rig.set('eyes', { x: gaze.x * 4, y: gaze.y * 3 });
    renderEyes(rig, p, EYES);
    const open = Math.max(0, Math.min(1, p['mouth.open']));
    rig.path('mouth', blendPaths(MOUTH, [[MOUTH_BIG, open], [MOUTH_SMILE, Math.min(1, p['mouth.smile']) * (1 - open)]]));
    rig.attr('blush', 'opacity', Math.max(paint.cheekRest, Math.min(1, p['face.blush']) * 0.9));
  },
};

function renderForm(rig: Rig, p: Pose, gaze: { x: number; y: number }, t: number, paint: Painter, I: Instance, lift: number) {
  const G = I.geo;
  rig.set('fx', { x: p['body.x'] + gaze.x * 2, y: p['body.y'] });
  rig.path('body', formBody(G, (t / 1100) * Math.PI * 2, p.hem));
  rig.set('armR', { rot: p.armR });
  rig.set('armL', { rot: -p.armL });
  frontWhenRaised(rig, 'armR', armLift(p.armR));
  frontWhenRaised(rig, 'armL', armLift(p.armL));
  if (I.noodle) {
    rig.path('noodleR', noodlePath(I.len, p['body.rot'] + p.armR, 1));
    rig.path('noodleL', noodlePath(I.len, p['body.rot'] - p.armL, -1));
  }
  rig.set('eyes', { x: gaze.x * 4, y: gaze.y * 3 });
  I.eyes.render(rig, p, gaze);
  I.brows.render(rig, p);
  I.mouth.render(rig, p);
  renderMarks(rig, p, I.marks, lift);
  rig.attr('blush', 'opacity', Math.max(paint.cheekRest, Math.min(1, p['face.blush']) * 0.9));
}
