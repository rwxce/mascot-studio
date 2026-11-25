// object-limbs: an object (an envelope) with puzzle-tab arms, a face on a lid that opens,
// and a secret inside that can peek out. Parametric: width, height, the bottom notch, the
// cross lines and the inner secret are body parameters in mascot.json.
import type { Anatomy, Built } from '../../kit/character.js';
import { browSet, eyeModel, faceInks, mouthSet, type BrowSet, type EyeSet, type MouthSet } from '../../kit/faces/index.js';
import { markParts, renderMarks } from '../../kit/faces/marks.js';
import { cornerScale, DEFAULT_FORM, isDefaultForm, scales, snapTo, type Form } from '../../kit/form.js';
import { blendPaths, mapPoints, parse, type PathSpec } from '../../kit/morph.js';
import { lerp, wave } from '../../kit/motion.js';
import { ellipse as oval } from '../../kit/shapes.js';
import type { Part, Shape } from '../../kit/rig.js';
import type { Painter } from '../../kit/style.js';
import type { AnatomyContract, MascotSpec } from '../../kit/spec.js';
import type { ActionSpec } from '../../kit/timeline.js';

const det = (s: Shape): Shape => ({ ...s, kind: 'detail' });
const r = (n: number) => Math.round(n * 100) / 100;

// Right tab, local to its pivot on the side edge. Same commands in every pose so they morph:
// the top segment is flat at rest and becomes a thumb; the neck stretches into an arm; the
// round cap keeps the joint clean when the arm turns.
const TAB_REST = parse('M0 -9L11 -9C9 -17 15 -16 20 -16C22 -16 26 -16 28 -16C35 -16 40 -9 40 0C40 9 34 16 24 16C15 16 9 17 11 9L0 9C-5 9 -9 5 -9 0C-9 -5 -5 -9 0 -9Z');
const TAB_LONG = parse('M0 -9L31 -9C29 -17 35 -16 40 -16C42 -16 46 -16 48 -16C55 -16 60 -9 60 0C60 9 54 16 44 16C35 16 29 17 31 9L0 9C-5 9 -9 5 -9 0C-9 -5 -5 -9 0 -9Z');
const TAB_THUMB = parse('M0 -9L11 -9C9 -17 15 -16 20 -16C18 -40 30 -40 28 -16C35 -16 40 -9 40 0C40 9 34 16 24 16C15 16 9 17 11 9L0 9C-5 9 -9 5 -9 0C-9 -5 -5 -9 0 -9Z');
const mirror = (p: PathSpec) => mapPoints(p, (_, x, y) => [-x, y]);
const TABL_REST = mirror(TAB_REST), TABL_LONG = mirror(TAB_LONG), TABL_THUMB = mirror(TAB_THUMB);

const K = 0.5523;
const ellipse = (a: number, b: number) =>
  parse(`M0 ${-b}C${K * a} ${-b} ${a} ${-K * b} ${a} 0C${a} ${K * b} ${K * a} ${b} 0 ${b}C${-K * a} ${b} ${-a} ${K * b} ${-a} 0C${-a} ${-K * b} ${-K * a} ${-b} 0 ${-b}Z`);
const EYE = ellipse(6, 9);
const EYE_SHUT = ellipse(6.5, 1.3);
const EYE_HAPPY = parse('M0 -5C4.5 -5 7.5 -1 7.5 3C6 3 4 -1.5 0 -1.5C-4 -1.5 -6 3 -7.5 3C-7.5 -1 -4.5 -5 0 -5Z');
const INNER = 'M-16 -12L-5 -12C-8 -26 8 -26 5 -12L16 -12L16 2L22 2C28 2 28 12 22 12L16 12L16 16L-16 16L-16 12L-22 12C-28 12 -28 2 -22 2L-16 2Z';

export const contract: AnatomyContract = {
  name: 'object-limbs',
  channels: [
    'body.x', 'body.y', 'body.sx', 'body.sy', 'body.rot',
    'armR.rot', 'armR.long', 'armR.thumb', 'armL.rot', 'armL.long', 'armL.thumb',
    'look.x', 'look.y', 'look.w', 'eyes.open', 'eyes.happy', 'eyes.scale',
    'lid', 'inner', 'inner.look', 'face.blush',
  ],
  palette: ['ink', 'body', 'inside', 'accent', 'cheek', 'prop', 'glow', 'eye', 'line'],
  required: ['body'],
  contrastPairs: [['eye', 'body']],
  body: { width: 'number', height: 'number', notch: 'number', crossLines: 'boolean', inner: 'boolean', line: 'number' },
  builtins: ['wave', 'hop', 'look-around', 'stretch', 'notice', 'surprise'],
};

const ENV1 = (ms: number): [number, number][] => [[0, 1], [ms, 1]];

/** Built-in actions every object-limbs mascot gets. Raise an arm with a negative `rot`. */
export const builtins: ActionSpec[] = [
  {
    name: 'wave', duration: 2600, weight: 3,
    tracks: [
      { ch: 'armR.rot', keys: [[0, -100], [2600, -100]], osc: { amp: 20, period: 560 } },
      { ch: 'armR.long', keys: ENV1(2600) },
      { ch: 'eyes.happy', keys: [[0, 0.7], [2600, 0.7]] },
      { ch: 'body.rot', keys: [[0, -2.5], [2600, -2.5]] },
      { ch: 'look.x', op: 'set', keys: [[0, 0.2], [2600, 0.2]] },
      { ch: 'look.y', op: 'set', keys: [[0, -0.1], [2600, -0.1]] },
      { ch: 'look.w', keys: ENV1(2600) },
    ],
  },
  {
    name: 'hop', duration: 1700, weight: 2,
    jumps: [{ at: 300, air: 420, height: 24 }],
    tracks: [
      { ch: 'armR.rot', env: false, keys: [[0, 0], [250, 0], [400, -85], [700, -85], [1000, 0], [1700, 0]] },
      { ch: 'armL.rot', env: false, keys: [[0, 0], [250, 0], [400, -85], [700, -85], [1000, 0], [1700, 0]] },
      { ch: 'eyes.happy', keys: ENV1(1700) },
      { ch: 'prop.sparkles', op: 'set', curve: 'linear', keys: [[0, -1], [299, -1], [300, 0], [1300, 1], [1301, -1], [1700, -1]] },
    ],
  },
  {
    name: 'look-around', duration: 2600, weight: 3,
    tracks: [
      { ch: 'look.x', op: 'set', keys: [[0, 0], [400, -1], [1100, -1], [1500, 1], [2200, 1], [2600, 0]] },
      { ch: 'look.y', op: 'set', keys: [[0, 0.1], [2600, 0.1]] },
      { ch: 'look.w', keys: ENV1(2600) },
      { ch: 'eyes.open', op: 'min', keys: [[0, 1], [250, 0.75], [2350, 0.75], [2600, 1]] },
      { ch: 'body.rot', keys: [[0, 0], [400, -2], [1100, -2], [1500, 2], [2200, 2], [2600, 0]] },
    ],
  },
  {
    name: 'stretch', duration: 2400, weight: 1.5,
    tracks: [
      { ch: 'body.sy', op: 'mul', keys: [[0, 1], [600, 1.12], [1500, 1.12], [1800, 0.964], [2100, 1.012], [2400, 1]] },
      { ch: 'body.sx', op: 'mul', keys: [[0, 1], [600, 0.93], [1500, 0.93], [1800, 1.021], [2100, 0.993], [2400, 1]] },
      { ch: 'armR.rot', keys: [[0, 0], [600, -80], [1500, -80], [1800, 0], [2400, 0]] },
      { ch: 'armL.rot', keys: [[0, 0], [600, -80], [1500, -80], [1800, 0], [2400, 0]] },
      { ch: 'armR.long', keys: [[0, 0], [600, 1], [1500, 1], [1800, 0], [2400, 0]] },
      { ch: 'armL.long', keys: [[0, 0], [600, 1], [1500, 1], [1800, 0], [2400, 0]] },
      { ch: 'eyes.open', op: 'min', keys: [[0, 1], [600, 0.1], [1500, 0.1], [1800, 1], [2400, 1]] },
      { ch: 'body.rot', osc: { amp: 2, period: 1200, window: [300, 1600] } },
    ],
  },
  {
    name: 'notice', duration: 1900,
    jumps: [{ at: 250, air: 260, height: 8 }],
    tracks: [
      { ch: 'eyes.scale', op: 'mul', keys: [[0, 1], [250, 1.28], [500, 1], [1900, 1]] },
      { ch: 'armR.rot', keys: [[0, 0], [500, 0], [800, -95], [1900, -95]], osc: { amp: 18, period: 500, window: [500, 1900] } },
      { ch: 'armR.long', keys: [[0, 0], [500, 0], [800, 1], [1900, 1]] },
      { ch: 'eyes.happy', keys: [[0, 0], [450, 0], [700, 1], [1900, 1]] },
    ],
  },
  {
    name: 'surprise', duration: 1500,
    jumps: [{ at: 120, air: 380, height: 30, startle: true }],
    tracks: [
      { ch: 'eyes.scale', op: 'mul', keys: [[0, 1], [450, 1.45], [900, 1], [1500, 1]] },
      { ch: 'armR.rot', keys: [[0, 0], [60, 0], [200, -115], [600, -115], [1000, 0], [1500, 0]] },
      { ch: 'armL.rot', keys: [[0, 0], [60, 0], [200, -115], [600, -115], [1000, 0], [1500, 0]] },
      { ch: 'armR.long', keys: [[0, 0], [60, 0], [200, 1], [600, 1], [1000, 0], [1500, 0]] },
      { ch: 'armL.long', keys: [[0, 0], [60, 0], [200, 1], [600, 1], [1000, 0], [1500, 0]] },
    ],
  },
];

/** Numbers for a form; the default form gives exactly the authored ones. */
interface Geo {
  custom: boolean;
  W: number; H: number; hw: number; top: number; bot: number; vy: number; flapH: number; midY: number; k: number;
  notch: number;
  /** Corner radius of the envelope (0 = sharp, as authored). */
  rc: number;
  vbW: number; rootX: number; rootY: number; vbTop: number;
  /** How far a raised arm's root slides up the side. */
  lift: number;
  /** tab: the authored puzzle tab (scaled); stick: a straight arm with a hand; noodle: a hose. */
  arm: 'tab' | 'stick' | 'noodle';
  tabs: { R: [PathSpec, PathSpec, PathSpec]; L: [PathSpec, PathSpec, PathSpec] };
  /** Stick / noodle: half thickness, length at rest and stretched (armX.long = 1). */
  t: number; len: [number, number];
  /** Scale of the face features (the envelope is all head). */
  F: number;
}

/** How far a hand reaches past the end of its arm, for a hand of size k. */
function handReach(kind: Form['hands'], k: number, t: number): number {
  return kind === 'glove' ? 15 * k : kind === 'mitten' ? 11 * k : kind === 'knob' ? 2 + 6.5 * k : kind === 'none' ? 0 : 1.5 * t;
}

function geometry(spec: MascotSpec, form: Form): Geo {
  const b = spec.body ?? {};
  const Wa = (b.width as number) ?? 148, Ha = (b.height as number) ?? 96;
  const notchA = (b.notch as number) ?? 17;
  const custom = !isDefaultForm(form);
  // The viewBox (and so every prop anchor) stays the authored one in every form.
  const vbW = Wa + 112, rootX = vbW / 2, rootY = 184;
  const topA = -8 - Ha, flapA = Ha * 0.583;
  const vbTop = Math.floor(rootY + topA - flapA - 60);
  if (!custom) {
    const W = Wa, H = Ha, hw = W / 2, top = -8 - H, bot = -8, vy = top + H * 0.583, flapH = vy - top;
    return {
      custom, W, H, hw, top, bot, vy, flapH, midY: (top + bot) / 2 - 2, k: W / 148, notch: notchA, rc: 0,
      vbW, rootX, rootY, vbTop, lift: 40, arm: 'tab',
      tabs: { R: [TAB_REST, TAB_LONG, TAB_THUMB], L: [TABL_REST, TABL_LONG, TABL_THUMB] },
      t: 9, len: [40, 60], F: 1,
    };
  }
  const S = scales(form);
  const g = (v: number) => snapTo(form, v);
  // The envelope fits inside its authored box (so props never land on it): a taller aspect
  // narrows it, a flatter one lowers it. A bigger head shows as bigger features and shorter arms.
  const s = Math.min(1, S.head);
  const hw = g((Wa * s) / Math.max(1, S.aspect) / 2), W = 2 * hw;
  const H = g(Ha * s * Math.min(1, S.aspect));
  const top = -8 - H, bot = -8, vy = top + g(H * 0.583), flapH = vy - top;
  const midY = g((top + bot) / 2 - 2);
  const rc = form.corners > 0.5 ? (form.corners - 0.5) * 2 * Math.min(hw, H) * 0.22 : 0;
  const F = S.head;
  const A = S.arm / S.head;
  const noodle = form.limbs === 'noodle';
  const arm: Geo['arm'] = noodle ? 'noodle' : form.hands === 'default' ? 'tab' : 'stick';
  // Tab: the neck stretches or shrinks (the round end keeps its shape), thickness scales, and a
  // taper thins it towards the end. Its reach stays close to the authored one so it stays in frame.
  const d = Math.max(-9, Math.min(6, (A - 1) * 30));
  const tk = S.thick, taper = form.taper;
  const tab = (p: PathSpec) => mapPoints(p, (_, x, y) => {
    const xs = x <= 0 ? x * tk : x + d * Math.min(1, x / 11);
    const f = 1 - 0.45 * taper * Math.max(0, Math.min(1, xs / (40 + d)));
    return [xs, y * tk * f];
  });
  const R: [PathSpec, PathSpec, PathSpec] = [tab(TAB_REST), tab(TAB_LONG), tab(TAB_THUMB)];
  const t = g(5.5 * S.thick);
  const hr = handReach(form.hands, Math.sqrt(S.thick), t);
  const len0 = g(Math.max(t + 4, Math.min(40 * A, 44) - hr));
  const len1 = g(Math.max(len0 + 6, Math.min(60 * A, 62) - hr));
  return {
    custom, W, H, hw, top, bot, vy, flapH, midY, k: W / 148, notch: g(notchA * Math.min(1, W / Wa)), rc,
    vbW, rootX, rootY, vbTop, lift: midY - top - 6, arm,
    tabs: { R, L: [mirror(R[0]), mirror(R[1]), mirror(R[2])] },
    t, len: [len0, len1], F,
  };
}

interface Instance {
  geo: Geo; eyes: EyeSet; brows: BrowSet; mouth: MouthSet; marks: Form['marks']; taper: number; kr: number;
}
const instances = new WeakMap<Painter, Instance>();

type P = [number, number];
const pt = (p: P) => `${r(p[0])} ${r(p[1])}`;
const toward = (a: P, b: P, dist: number): P => {
  const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
  const s = Math.min(dist, l / 2) / l;
  return [a[0] + dx * s, a[1] + dy * s];
};
/** The corner at p between prev and next, rounded by rad. */
const corner = (prev: P, p: P, next: P, rad: number) => (rad > 0 ? `L${pt(toward(p, prev, rad))}Q${pt(p)} ${pt(toward(p, next, rad))}` : `L${pt(p)}`);

/** A flap-shaped triangle with its top edge at y0 and rounded top corners. */
function tri(G: Geo, y0: number): string {
  const a: P = [-G.hw, y0], b: P = [G.hw, y0], c: P = [0, y0 + G.flapH];
  return `M0 ${r(y0)}${corner(a, b, c, G.rc)}${corner(b, c, a, 0)}${corner(c, a, b, G.rc)}Z`;
}

/** The pocket (the envelope's front) with rounded outer corners. */
function pocketPath(G: Geo, notchD: string): string {
  const { hw, top, bot, vy, rc } = G;
  const TL: P = [-hw, top], V: P = [0, vy], TR: P = [hw, top], BR: P = [hw, bot], BL: P = [-hw, bot];
  return `M${pt([-hw, (top + bot) / 2])}${corner(BL, TL, V, rc)}${corner(TL, V, TR, 0)}${corner(V, TR, BR, rc)}${corner(TR, BR, BL, rc)}${notchD}${corner(BR, BL, TL, rc)}Z`;
}

/** A hand drawn along +x (m = 1) or −x (m = −1), sized by k. */
function handShapes(kind: Form['hands'], m: number, k: number, t: number, paint: Painter): Shape[] {
  if (kind === 'glove') {
    const w = paint.flat('shine');
    return [
      { d: oval(-1 * m, 0, 2.6 * k, 5.4 * k), fill: w },
      { d: oval(6 * m * k, 0, 6 * k, 5.8 * k), fill: w },
      { d: oval(11.2 * m * k, -3.6 * k, 2.8 * k, 2.3 * k), fill: w },
      { d: oval(12.2 * m * k, 0.4 * k, 2.8 * k, 2.3 * k), fill: w },
      { d: oval(10.8 * m * k, 4.2 * k, 2.6 * k, 2.2 * k), fill: w },
    ];
  }
  if (kind === 'mitten') {
    return [
      { d: oval(4 * m * k, 0.5 * k, 7 * k, 6.2 * k), fill: paint.fill('accent') },
      { d: oval(2.4 * m * k, -5.2 * k, 2.6 * k, 2.6 * k), fill: paint.fill('accent') },
    ];
  }
  if (kind === 'knob') return [{ d: oval(2 * m, 0, 6.5 * k, 6.5 * k), fill: paint.fill('accent') }];
  if (kind === 'none') return [];
  return [{ d: oval(0.5 * t * m, 0, 1.5 * t, 1.5 * t), fill: paint.fill('body') }];
}

/** Where the thumb grows from, on top of a hand of size k. */
function thumbAt(kind: Form['hands'], m: number, k: number, t: number): [number, number, number] {
  if (kind === 'glove') return [5 * m * k, -4.6 * k, k];
  if (kind === 'mitten') return [2.4 * m * k, -6 * k, k];
  if (kind === 'knob') return [2 * m, -5 * k, k];
  return [0.5 * t * m, -1.2 * t, t / 6];
}

/** A straight arm from inside the body out to `len` (m = ±1), thinning by `taper`. */
function stickPath(len: number, t: number, taper: number, kr: number, m: number): PathSpec {
  const e = t * (1 - 0.45 * taper), re = e * Math.min(1, kr);
  const x = (v: number) => r(v * m);
  return parse(`M${x(-t)} ${r(-t)}L${x(len - re)} ${r(-e)}Q${x(len)} ${r(-e)} ${x(len)} ${r(-e + re)}L${x(len)} ${r(e - re)}Q${x(len)} ${r(e)} ${x(len - re)} ${r(e)}L${x(-t)} ${r(t)}Z`);
}

/** A noodle arm that sags under gravity, in the arm's own frame (rotated by `deg`). */
function noodlePath(len: number, deg: number, m: number): PathSpec {
  const a = (deg * Math.PI) / 180;
  const gx = Math.sin(a), gy = Math.cos(a), sag = len * 0.24;
  return [['M', 0, 0], ['Q', (m * len) / 2 + gx * sag * 0.4, gy * sag, m * len, 0]];
}

function build(spec: MascotSpec, paint: Painter, form: Form = DEFAULT_FORM): Built {
  const b = spec.body ?? {};
  const G = geometry(spec, form);
  const { W, H, notch, hw, top, bot, vy, flapH, midY, k, vbW, rootX, rootY, vbTop } = G;
  const line = ((b.line as number) ?? 5.5) / 5.5;
  const cross = b.crossLines !== false, hasInner = b.inner !== false;
  const notchD = notch > 0 ? `L${r(notch)} ${bot}C${r(notch)} ${r(bot - notch * 1.35)} ${r(-notch)} ${r(bot - notch * 1.35)} ${r(-notch)} ${bot}` : '';
  const pocket = G.custom ? pocketPath(G, notchD) : `M${-hw} ${top}L0 ${r(vy)}L${hw} ${top}L${hw} ${bot}${notchD}L${-hw} ${bot}Z`;
  const flap = G.custom ? tri(G, 0) : `M${-hw} 0L${hw} 0L0 ${r(flapH)}Z`;
  const back = G.custom ? tri(G, top) : `M${-hw} ${top}L${hw} ${top}L0 ${r(vy)}Z`;
  const cx = hw * 0.35, cy = top + flapH * (1 - cx / hw);
  const root = (children: Part[]): Part => ({ id: 'root', at: [rootX, rootY], children });
  const ink = paint.outline(line);
  const lw = paint.lineWidth(5.5 * line);
  const eye = (side: 'L' | 'R'): Part => ({
    id: `eye${side}`, at: [side === 'L' ? -13 * k : 13 * k, 0], shapes: [
      det({ pathRef: `eye${side}`, fill: paint.flat('eye') }),
      ...(paint.shine ? [det({ el: { tag: 'circle', attrs: { cx: -1.8, cy: -3.4, r: 2, fill: paint.flat('shine') } }, ref: 'shine' })] : []),
    ],
  });

  // Face. The default form keeps the authored eyes; a form brings its eye, mouth and brow models.
  let eyesPart: Part = { id: 'eyes', at: [0, r(flapH * 0.34)], children: [eye('L'), eye('R')] };
  const lidExtra: Part[] = [];
  let marks: { face: Part[]; behind: Part[] } = { face: [], behind: [] };
  const crossFrom = (p: P, to: P) => (G.custom && G.rc ? toward(p, to, G.rc * 0.4) : p);
  if (G.custom) {
    const fs = G.F * form.face.scale;
    const eyes = eyeModel(form.eyes).make(6 * fs, 9 * fs, paint);
    const brows = browSet(form.brows, eyes.rx, eyes.ry, faceInks(paint).line);
    const ms = G.F * form.face.mouth;
    const mouth = mouthSet(form.mouth, ms);
    const g = (v: number) => snapTo(form, v);
    const eyeX = g(13 * form.face.spacing * Math.max(k, fs ** 0.6));
    // The eyes sit on the lid; big eyes (and brows) are pushed down so they stay on it.
    const room = form.brows === 'none' ? eyes.ry * 1.2 + 2 : eyes.ry * 1.75 + 3;
    const eyeY = g(Math.max(room, flapH * 0.34 + form.face.y * 9 * fs));
    const mouthY = g(Math.min(flapH - 9 * ms, eyeY + eyes.ry + 5 * ms));
    const browParts = (['L', 'R'] as const).map((sd) => brows.part(sd, [(sd === 'L' ? -1 : 1) * eyeX, -eyes.ry * 1.38 - 1.5])).filter((x): x is Part => !!x);
    eyesPart = { id: 'eyes', at: [0, eyeY], children: [eyes.part('L', [-eyeX, 0]), eyes.part('R', [eyeX, 0]), ...browParts] };
    lidExtra.push(mouth.part([0, mouthY], paint.flat('eye')));
    marks = markParts(form.marks, {
      sweat: [hw * 0.84, top + H * 0.2, 4.6 * G.F],
      cheeks: [[r(-hw * 0.6), r(bot - H * 0.333)], [r(hw * 0.6), r(bot - H * 0.333)]],
      speed: [hw * 0.55, bot + 6],
    }, paint);
    instances.set(paint, { geo: G, eyes, brows, mouth, marks: form.marks, taper: form.taper, kr: cornerScale(form.corners) });
  }

  const arm = (side: 'L' | 'R'): Part => {
    const m = side === 'L' ? -1 : 1;
    const at: [number, number] = [m * hw, midY];
    if (G.arm === 'tab') return { id: `arm${side}`, at, shapes: [{ pathRef: `arm${side}`, fill: paint.fill('body') }] };
    const hk = Math.sqrt(form.proportions.limbThickness);
    const [tx, ty, tk] = thumbAt(form.hands, m, hk, G.t);
    const hand = handShapes(form.hands, m, hk, G.t, paint);
    const thumbFill = form.hands === 'glove' ? paint.flat('shine') : form.hands === 'default' ? paint.fill('body') : paint.fill('accent');
    return {
      id: `arm${side}`, at,
      shapes: [G.arm === 'noodle'
        ? { pathRef: `arm${side}`, stroke: paint.flat('body'), width: 2 * G.t }
        : { pathRef: `arm${side}`, fill: paint.fill('body') }],
      children: [{
        id: `hand${side}`, shapes: hand,
        children: form.hands === 'none' ? [] : [{ id: `thumb${side}`, at: [tx, ty], shapes: [{ d: oval(0, -4.2 * tk, 2.5 * tk, 4.4 * tk), fill: thumbFill }] }],
      }],
    };
  };

  return {
    viewBox: `0 ${vbTop} ${vbW} ${220 - vbTop}`,
    rootAt: [rootX, rootY],
    stage: [rootX, rootY + top / 2, W * 0.62],
    label: `${spec.title} mascot`,
    layers: [
      { outline: null, root: { id: 'shadow', at: [rootX, rootY + 4], shapes: [det({ el: { tag: 'ellipse', attrs: { rx: hw - 2, ry: 6, fill: paint.shadow } }, ref: 'shadow' })] } },
      ...(marks.behind.length ? [{ outline: null, root: root(marks.behind) }] : []),
      {
        outline: ink,
        root: root([
          { shapes: [{ d: back, fill: paint.fill('inside') }] },
          { id: 'lidB', at: [0, top], shapes: [{ d: flap, fill: paint.fill('inside') }] },
        ]),
      },
      ...(hasInner ? [{
        outline: paint.outline(line * 0.64),
        root: root([{
          id: 'inner', at: [0, top + 44 * (H / 96)], children: [{
            id: 'innerBody', shapes: [
              { d: INNER, fill: paint.fill('accent'), ref: 'inner' },
              det({ el: { tag: 'ellipse', attrs: { cx: -6, cy: 1, rx: 3, ry: 4.5, fill: paint.flat('eye') } }, ref: 'innerEye' }),
              det({ el: { tag: 'ellipse', attrs: { cx: 6, cy: 1, rx: 3, ry: 4.5, fill: paint.flat('eye') } }, ref: 'innerEye' }),
            ],
          }],
        }]),
      }] : []),
      {
        outline: ink,
        root: root([
          arm('L'),
          arm('R'),
          {
            shapes: [
              { d: pocket, fill: paint.fill('body') },
              ...(cross ? [
                det({ d: `M${G.custom ? pt(crossFrom([-hw, bot], [-cx, cy])) : `${-hw} ${bot}`}L${r(-cx)} ${r(cy)}`, stroke: paint.flat('line'), width: lw }),
                det({ d: `M${G.custom ? pt(crossFrom([hw, bot], [cx, cy])) : `${hw} ${bot}`}L${r(cx)} ${r(cy)}`, stroke: paint.flat('line'), width: lw }),
              ] : []),
              det({ el: { tag: 'ellipse', attrs: { cx: r(-hw * 0.6), cy: r(bot - H * 0.333), rx: 9, ry: 5, fill: paint.flat('cheek') } }, ref: 'blush' }),
              det({ el: { tag: 'ellipse', attrs: { cx: r(hw * 0.6), cy: r(bot - H * 0.333), rx: 9, ry: 5, fill: paint.flat('cheek') } }, ref: 'blush' }),
            ],
          },
        ]),
      },
      {
        outline: ink,
        root: root([{
          id: 'lidF', at: [0, top], shapes: [
            { d: flap, fill: paint.fill('body') },
            // without an outline the lid's edges would vanish into the pocket: draw them
            ...(ink ? [] : [det({
              d: G.custom
                ? `M${pt(toward([-hw, 0], [0, flapH], G.rc))}L0 ${r(flapH)}L${pt(toward([hw, 0], [0, flapH], G.rc))}`
                : `M${-hw} 0L0 ${r(flapH)}L${hw} 0`,
              stroke: paint.flat('line'), width: lw,
            })]),
          ],
          children: [eyesPart, ...lidExtra],
        }]),
      },
      ...(marks.face.length ? [{ outline: null, root: root(marks.face) }] : []),
    ],
  };
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export const objectLimbs: Anatomy = {
  contract,
  usesForm: true,
  defaults: {
    'body.x': 0, 'body.y': 0, 'body.sx': 1, 'body.sy': 1, 'body.rot': 0,
    'armR.rot': 0, 'armR.long': 0, 'armR.thumb': 0, 'armL.rot': 0, 'armL.long': 0, 'armL.thumb': 0,
    'look.x': 0, 'look.y': 0, 'look.w': 0, 'eyes.open': 1, 'eyes.happy': 0, 'eyes.scale': 1,
    lid: 1, inner: 0, 'inner.look': 0, 'face.blush': 0,
  },
  builtins,
  springs: {
    'armR.rot': { freq: 3.2, damping: 0.42 },
    'armL.rot': { freq: 3.0, damping: 0.42 },
    'inner.look': { freq: 3, damping: 0.6 },
  },
  build,
  idle(p, t) {
    const br = wave(t, 2600);
    p['body.sy'] = 1 + 0.018 * br;
    p['body.sx'] = 1 - 0.008 * br;
    p['body.rot'] = 1.2 * wave(t, 5200, 0.1);
    p['armR.rot'] = 5 * wave(t, 2600, 0.15);
    p['armL.rot'] = 5 * wave(t, 2600, 0.42);
  },
  render(rig, p, gaze, _t, paint) {
    const I = instances.get(paint);
    const G = I?.geo;
    rig.set('root', { x: p['body.x'], y: p['body.y'], rot: p['body.rot'], sx: p['body.sx'], sy: p['body.sy'] });
    const y = p['body.y'];
    rig.set('shadow', { sx: 1 + y * 0.006, sy: 1 + y * 0.006 });
    rig.attr('shadow', 'opacity', 1 + y * 0.012);

    // Raising an arm slides its root up the side to the top corner, so the arm leaves the body
    // from the corner instead of sweeping behind the lid.
    const tr = p['armR.rot'], tl = p['armL.rot'];
    const liftR = Math.min(1, Math.max(0, -tr / 95)), liftL = Math.min(1, Math.max(0, -tl / 95));
    const lift = G ? G.lift : 40;
    rig.set('armR', { y: -lift * liftR, x: -3 * liftR, rot: tr });
    rig.set('armL', { y: -lift * liftL, x: 3 * liftL, rot: -tl });
    if (!G || G.arm === 'tab') {
      const T = G ? G.tabs : { R: [TAB_REST, TAB_LONG, TAB_THUMB], L: [TABL_REST, TABL_LONG, TABL_THUMB] };
      rig.path('armR', blendPaths(T.R[0], [[T.R[1], Math.min(1, p['armR.long'])], [T.R[2], p['armR.thumb']]]));
      rig.path('armL', blendPaths(T.L[0], [[T.L[1], Math.min(1, p['armL.long'])], [T.L[2], p['armL.thumb']]]));
    } else {
      for (const [side, m, deg] of [['R', 1, tr], ['L', -1, -tl]] as const) {
        const len = lerp(G.len[0], G.len[1], clamp01(p[`arm${side}.long`]));
        rig.path(`arm${side}`, G.arm === 'noodle' ? noodlePath(len, deg, m) : stickPath(len, G.t, I!.taper, I!.kr, m));
        rig.set(`hand${side}`, { x: m * len });
        const th = clamp01(p[`arm${side}.thumb`]);
        rig.set(`thumb${side}`, { sx: Math.max(0.001, th), sy: Math.max(0.001, th) });
        rig.opacity(`thumb${side}`, th > 0.02 ? 1 : 0);
      }
    }

    rig.set('lidF', { sy: Math.max(p.lid, 0.001) });
    rig.set('lidB', { sy: Math.min(p.lid, -0.001) });
    rig.set('eyes', { x: gaze.x * 5, y: gaze.y * 4 });
    const happy = Math.min(1, p['eyes.happy']);
    const shut = 1 - Math.max(0, Math.min(1, p['eyes.open']));
    if (I) {
      I.eyes.render(rig, p, gaze);
      I.brows.render(rig, p);
      // No mouth channels: the mouth smiles with the happy eyes and opens when they go wide.
      I.mouth.render(rig, { 'mouth.open': clamp01((p['eyes.scale'] - 1) * 2.2), 'mouth.smile': clamp01(happy) });
      renderMarks(rig, p, I.marks, Math.max(0, -y));
    } else {
      const eye = blendPaths(EYE, [[EYE_SHUT, shut * (1 - happy)], [EYE_HAPPY, happy]]);
      rig.path('eyeL', eye);
      rig.path('eyeR', eye);
      rig.set('eyeL', { sx: p['eyes.scale'], sy: p['eyes.scale'] });
      rig.set('eyeR', { sx: p['eyes.scale'], sy: p['eyes.scale'] });
    }

    const inner = p.inner;
    rig.set('inner', { y: 34 + (-62 - 34) * inner });
    rig.attr('inner', 'opacity', inner > 0.02 ? 1 : 0);
    rig.attr('innerEye', 'opacity', inner > 0.02 ? 1 : 0);
    rig.set('innerBody', { x: p['inner.look'] * 4, rot: p['inner.look'] * 6 });
    rig.attr('blush', 'opacity', Math.max(paint.cheekRest, Math.min(1, p['face.blush']) * 0.9));
    if (!I) rig.attr('shine', 'opacity', happy > 0.3 || shut > 0.5 ? 0 : 1);
  },
};
