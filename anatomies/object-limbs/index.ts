// object-limbs: an object (an envelope) with puzzle tabs, a face on a lid that opens,
// and a secret inside that rises out of its mouth. Parametric: width, height, the bottom notch,
// the cross lines and the inner secret (and its size) are body parameters in mascot.json.
// No arms: the tabs are part of the envelope's outline and never move. A raised "arm" channel
// (wave, hop…) flattens its tab into the side edge and curls that side's top corner up into a thin
// paper hook, growing from where the tab was.
import type { Anatomy, Built } from '../../kit/character.js';
import { browSet, eyeModel, faceInks, mouthSet, type BrowSet, type EyeSet, type MouthSet } from '../../kit/faces/index.js';
import { markParts, renderMarks } from '../../kit/faces/marks.js';
import { DEFAULT_FORM, isDefaultForm, scales, snapTo, type Form } from '../../kit/form.js';
import { blendPaths, mapPoints, parse, toD, type PathSpec, type Seg } from '../../kit/morph.js';
import { lerp, wave } from '../../kit/motion.js';
import type { Part, Shape } from '../../kit/rig.js';
import type { Painter } from '../../kit/style.js';
import type { AnatomyContract, MascotSpec } from '../../kit/spec.js';
import type { ActionSpec } from '../../kit/timeline.js';

type P = [number, number];
const det = (s: Shape): Shape => ({ ...s, kind: 'detail' });
const r = (n: number) => Math.round(n * 100) / 100;

// A puzzle tab as a stretch of the pocket's side edge: x outwards from the edge, y from the
// middle of the side, walked top to bottom. The knob grows out of the edge through a narrow neck,
// with no straight wrist. Same commands with a thumb, so it morphs (thumbs-up).
const TAB_REST = parse('M0 -7C4 -7 1 -16 12 -16C14 -16 18 -16 20 -16C27 -16 32 -9 32 0C32 9 26 16 16 16C5 16 4 7 0 7');
const TAB_THUMB = parse('M0 -7C4 -7 1 -16 12 -16C10 -40 22 -40 20 -16C27 -16 32 -9 32 0C32 9 26 16 16 16C5 16 4 7 0 7');
/** Half the tab's neck, where it leaves the edge. */
const TAB_NECK = 7;

/** The same open path walked the other way (M, L and C only). */
function reverseOpen(spec: PathSpec): Seg[] {
  const ends: P[] = [];
  for (const sg of spec) if (sg[0] !== 'Z') ends.push([sg[sg.length - 2] as number, sg[sg.length - 1] as number]);
  const out: Seg[] = [['M', ends[ends.length - 1][0], ends[ends.length - 1][1]]];
  for (let i = spec.length - 1; i >= 1; i--) {
    const sg = spec[i], to = ends[i - 1];
    if (sg[0] === 'C') out.push(['C', sg[3], sg[4], sg[1], sg[2], to[0], to[1]]);
    else out.push(['L', to[0], to[1]]);
  }
  return out;
}

/**
 * The tab's stretch of edge in pocket coordinates, flattened into the edge by `flat` (1 = gone).
 * side 1: the right edge, walked down; side -1: the left edge, walked up.
 */
function tabEdge(thumb: number, flat: number, ts: number, x0: number, midY: number, side: 1 | -1): string {
  const f = 1 - flat;
  let spec: PathSpec = mapPoints(blendPaths(TAB_REST, [[TAB_THUMB, thumb]]), (_, x, y) => [x0 + side * x * f * ts, midY + y * ts]);
  if (side < 0) spec = reverseOpen(spec);
  return toD(spec).replace(/^M/, 'L');
}

const K = 0.5523;
const ellipse = (a: number, b: number) =>
  parse(`M0 ${-b}C${K * a} ${-b} ${a} ${-K * b} ${a} 0C${a} ${K * b} ${K * a} ${b} 0 ${b}C${-K * a} ${b} ${-a} ${K * b} ${-a} 0C${-a} ${-K * b} ${-K * a} ${-b} 0 ${-b}Z`);
const EYE = ellipse(6, 9);
const EYE_SHUT = ellipse(6.5, 1.3);
const EYE_HAPPY = parse('M0 -5C4.5 -5 7.5 -1 7.5 3C6 3 4 -1.5 0 -1.5C-4 -1.5 -6 3 -7.5 3C-7.5 -1 -4.5 -5 0 -5Z');
const INNER = 'M-16 -12L-5 -12C-8 -26 8 -26 5 -12L16 -12L16 2L22 2C28 2 28 12 22 12L16 12L16 16L-16 16L-16 12L-22 12C-28 12 -28 2 -22 2L-16 2Z';
// The corner curl: a thin paper strip that grows out of the side edge where the tab was, rises
// past the top corner and curls inward over the envelope, like the corner of the letter lifting.
// Local to the middle of the right side (the tab's root, its pivot), x outwards; `drop` is how
// far below the top corner the tab sits.
const CURL_N = 18;
interface Curl { pts: P[]; len: number }
function makeCurl(drop: number): Curl {
  const pts: P[] = [];
  const R = 13, cx = -6, cy = -13, TIP = 12;
  // out of the side where the tab was, slanting up and out past the corner
  for (let i = 0; i <= 10; i++) pts.push([1 + (cx + R - 1) * (i / 10), drop + (cy - drop) * (i / 10)]);
  // the hook: over the top and down inward (half a turn)…
  for (let i = 1; i <= 20; i++) {
    const a = (i / 20) * Math.PI;
    pts.push([cx + R * Math.cos(a), cy - R * Math.sin(a)]);
  }
  // …and its tip hangs down in front of the letter, past the top edge onto the lid
  for (let i = 1; i <= 6; i++) pts.push([cx - R + 1.5 * (i / 6), cy + (TIP - cy) * (i / 6)]);
  // relative to the root, which is the curl's pivot (it rocks from where the tab was)
  for (const q of pts) q[1] -= drop;
  let len = 0;
  for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  return { pts, len };
}
/** The point at arc length s along the curl's centreline, and its direction. */
function curlAt(c: Curl, s: number): [P, P] {
  let acc = 0;
  for (let i = 1; i < c.pts.length; i++) {
    const a = c.pts[i - 1], b = c.pts[i], l = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (acc + l >= s || i === c.pts.length - 1) {
      const t = Math.min(1, Math.max(0, (s - acc) / (l || 1)));
      return [[a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t], [(b[0] - a[0]) / (l || 1), (b[1] - a[1]) / (l || 1)]];
    }
    acc += l;
  }
  return [c.pts[0], [0, -1]];
}
/**
 * The curl unrolled to u (0 = only its root, hidden under the corner; 1 = the whole hook), as a
 * closed ribbon `w` wide that narrows to the tip. Same commands for every u, so it can boil.
 */
function curlPath(c: Curl, u: number, w: number, scale: number, side: 1 | -1): Seg[] {
  const len = c.len * Math.max(0.04, Math.min(1, u));
  const L: P[] = [], Rt: P[] = [];
  for (let i = 0; i <= CURL_N; i++) {
    const [p, d] = curlAt(c, (len * i) / CURL_N);
    const hw2 = (w / 2) * (1 - 0.35 * (i / CURL_N));
    L.push([(p[0] - d[1] * hw2) * scale * side, (p[1] + d[0] * hw2) * scale]);
    Rt.push([(p[0] + d[1] * hw2) * scale * side, (p[1] - d[0] * hw2) * scale]);
  }
  const ring = [...L, ...Rt.reverse()];
  const segs: Seg[] = [['M', r(ring[0][0]), r(ring[0][1])]];
  for (let i = 1; i < ring.length; i++) {
    const a = ring[i - 1], b = ring[i];
    segs.push(['Q', r(a[0]), r(a[1]), r((a[0] + b[0]) / 2), r((a[1] + b[1]) / 2)]);
  }
  segs.push(['L', r(ring[ring.length - 1][0]), r(ring[ring.length - 1][1])], ['Z']);
  return segs;
}
/** The curl as one open line along its centreline (styles with an outline: like the drawing). */
/**
 * The curl as one open line along its centreline (styles with an outline: like the drawing),
 * ending in the fold back to the side edge once its tip has come over the letter. With `fill`,
 * the same outline closed down the side edge to the root: the lifted corner of paper, opaque, so
 * nothing of the letter shows inside the hook.
 */
function curlLine(c: Curl, u: number, scale: number, side: 1 | -1, fill = false): Seg[] {
  const len = c.len * Math.max(0.04, Math.min(1, u));
  const pts: P[] = [];
  for (let i = 0; i <= CURL_N; i++) {
    const [p] = curlAt(c, (len * i) / CURL_N);
    pts.push([p[0] * scale * side, p[1] * scale]);
  }
  const segs: Seg[] = [['M', r(pts[0][0]), r(pts[0][1])]];
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i];
    segs.push(['Q', r(a[0]), r(a[1]), r((a[0] + b[0]) / 2), r((a[1] + b[1]) / 2)]);
  }
  const end = pts[pts.length - 1];
  segs.push(['L', r(end[0]), r(end[1])]);
  // the fold: from the tip straight back to the edge, only once the tip is over the letter
  const over = end[0] * side < 0;
  segs.push(['L', over ? 0 : r(end[0]), r(end[1])]);
  if (fill) segs.push(['L', r(pts[0][0]), r(pts[0][1])], ['Z']);
  return segs;
}
/** Width of the curl as a filled strip, in styles without an outline. */
const CURL_W = 5;
/** Paper takes a moment to curl: the hook unrolls at most this fast (whole hook per ms). */
const CURL_RATE = 1 / 140;
/** The tab flattens at most this fast (whole tab per ms), so a fast raise does not pop. */
const FLAT_RATE = 1 / 120;
const curlState = new WeakMap<object, { t: number; R: number; L: number; fR: number; fL: number }>();

/** How far the secret reaches above (its knob) and below its origin, at size 1. */
const INNER_UP = 23, INNER_DOWN = 16;
/** The secret's path at size s: the path is scaled, not the group, so its outline keeps its width. */
const innerPath = (s: number) => INNER.replace(/-?\d+(\.\d+)?/g, (n) => String(r(Number(n) * s)));

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
  body: { width: 'number', height: 'number', notch: 'number', crossLines: 'boolean', inner: 'boolean', innerScale: 'number', line: 'number' },
  builtins: ['wave', 'hop', 'look-around', 'stretch', 'notice', 'surprise'],
};

const ENV1 = (ms: number): [number, number][] => [[0, 1], [ms, 1]];

/** Built-in actions every object-limbs mascot gets. Raise an arm with a negative `rot`. */
export const builtins: ActionSpec[] = [
  {
    name: 'wave', duration: 2600, weight: 3,
    tracks: [
      { ch: 'armR.rot', keys: [[0, -100], [2600, -100]], osc: { amp: 20, period: 560 } },
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
  /** Scale of the tabs and the corner curl (they only shrink with a smaller envelope). */
  ts: number;
  /** Scale of the face features (the envelope is all head). */
  F: number;
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
      vbW, rootX, rootY, vbTop, ts: 1, F: 1,
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
  // The tabs keep their authored shape in every form; they only shrink with a smaller envelope.
  const ts = Math.min(1, W / Wa);
  return {
    custom, W, H, hw, top, bot, vy, flapH, midY, k: W / 148, notch: g(notchA * Math.min(1, W / Wa)), rc,
    vbW, rootX, rootY, vbTop, ts, F,
  };
}

interface Instance {
  geo: Geo; eyes: EyeSet; brows: BrowSet; mouth: MouthSet; marks: Form['marks'];
}
const instances = new WeakMap<Painter, Instance>();
/** Where the secret sits hidden (inner = 0) and fully out (inner = 1), and its size. */
interface Secret { rest: number; out: number; size: number }
const secrets = new WeakMap<Painter, Secret>();

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

/**
 * The pocket (the envelope's front), its outer corners rounded by G.rc, with the two tabs as part
 * of its side edges. Always the same commands for one geometry, so it can be set every frame.
 */
function pocketPath(G: Geo, notchD: string, tabR: string, tabL: string): string {
  const { hw, top, bot, vy, rc } = G;
  const TL: P = [-hw, top], V: P = [0, vy], TR: P = [hw, top], BR: P = [hw, bot], BL: P = [-hw, bot];
  return `M${pt([-hw, G.midY + TAB_NECK * G.ts])}${tabL}${corner(BL, TL, V, rc)}${corner(TL, V, TR, 0)}${corner(V, TR, BR, rc)}${tabR}${corner(TR, BR, BL, rc)}${notchD}${corner(BR, BL, TL, rc)}Z`;
}
/** Per mascot instance: the pocket for a pose of the tabs, and the corner curl. */
const pockets = new WeakMap<Painter, { at: (thR: number, flR: number, thL: number, flL: number) => Seg[]; curl: Curl }>();

function build(spec: MascotSpec, paint: Painter, form: Form = DEFAULT_FORM): Built {
  const b = spec.body ?? {};
  const G = geometry(spec, form);
  const { W, H, notch, hw, top, bot, vy, flapH, midY, k, vbW, rootX, rootY, vbTop } = G;
  const line = ((b.line as number) ?? 5.5) / 5.5;
  const cross = b.crossLines !== false, hasInner = b.inner !== false;
  const notchD = notch > 0 ? `L${r(notch)} ${bot}C${r(notch)} ${r(bot - notch * 1.35)} ${r(-notch)} ${r(bot - notch * 1.35)} ${r(-notch)} ${bot}` : '';
  const pocketAt = (thR: number, flR: number, thL: number, flL: number) =>
    parse(pocketPath(G, notchD, tabEdge(thR, flR, G.ts, hw, midY, 1), tabEdge(thL, flL, G.ts, -hw, midY, -1)));
  pockets.set(paint, { at: pocketAt, curl: makeCurl((midY - top) / G.ts) });
  const pocket = toD(pocketAt(0, 0, 0, 0));
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
    instances.set(paint, { geo: G, eyes, brows, mouth, marks: form.marks });
  }

  // The corner curl is drawn in front of the pocket and the lid, so its hook (the ball) curls
  // over the corner instead of hiding behind it, as in the original drawing.
  const curl = (side: 'L' | 'R'): Part => ({
    id: `curl${side}`, at: [side === 'L' ? -hw : hw, midY], opacity: 0,
    // the lifted corner is opaque paper (it hides the corner of the letter under it); with an
    // outline its edge is one line as thick as the visible edge, without one a strip of the body
    shapes: [
      det({ pathRef: `curlF${side}`, fill: paint.fill('body') }),
      ink
        ? det({ pathRef: `curl${side}`, stroke: ink.color, width: r(Math.max(lw, ink.width * 0.5)) })
        : { pathRef: `curl${side}`, fill: paint.fill('body') },
    ],
  });

  // The lifted corners' silhouette (same ids and refs as the curls, so it moves with them): the
  // pocket and the lid are masked by it, so the letter never shows under a raised corner.
  const lifted: Part[] = (['L', 'R'] as const).map((sd) => ({
    id: `curl${sd}`, at: [sd === 'L' ? -hw : hw, midY], shapes: [{ pathRef: `curlF${sd}` }],
  }));

  // The secret rises out of the mouth: hidden with its knob just under the V of the pocket,
  // fully out with its base on the top edge. A clip at the V keeps it from showing anywhere
  // below the mouth (through the bottom notch, or under the pocket's edges).
  const ss = (b.innerScale as number) ?? 1;
  const ol = 5.5 * line * 0.64;
  secrets.set(paint, { rest: vy + INNER_UP * ss + ol, out: top - INNER_DOWN * ss - ol / 2, size: ss });
  const e = (cx: number, cy: number, rx: number, ry: number, fill: string, ref: string) =>
    det({ el: { tag: 'ellipse', attrs: { cx: r(cx * ss), cy: r(cy * ss), rx: r(rx * ss), ry: r(ry * ss), fill } }, ref });
  const big = ss > 1.2;
  const innerShapes: Shape[] = big
    ? [
      { d: innerPath(ss), fill: paint.fill('accent'), ref: 'inner' },
      e(-12, 3.5, 3, 1.7, paint.flat('cheek'), 'innerEye'),
      e(12, 3.5, 3, 1.7, paint.flat('cheek'), 'innerEye'),
      e(-6.5, -3, 3.2, 4.6, paint.flat('eye'), 'innerEye'),
      e(6.5, -3, 3.2, 4.6, paint.flat('eye'), 'innerEye'),
      ...(paint.shine ? [e(-7.4, -4.6, 1.1, 1.1, paint.flat('shine'), 'innerEye'), e(5.6, -4.6, 1.1, 1.1, paint.flat('shine'), 'innerEye')] : []),
    ]
    : [
      { d: innerPath(ss), fill: paint.fill('accent'), ref: 'inner' },
      e(-6, 1, 3, 4.5, paint.flat('eye'), 'innerEye'),
      e(6, 1, 3, 4.5, paint.flat('eye'), 'innerEye'),
    ];

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
          clipRect: [-vbW, r(vy - 2 * vbW), 2 * vbW, 2 * vbW],
          children: [{ id: 'inner', children: [{ id: 'innerBody', shapes: innerShapes }] }],
        }]),
      }] : []),
      {
        outline: ink,
        root: root([
          {
            data: { body: '' },
            // under a lifted corner nothing of the letter shows, in a translucent style too
            under: lifted,
            shapes: [
              // the tabs are part of this outline: no joint, nothing behind
              { pathRef: 'pocket', d: pocket, fill: paint.fill('body') },
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
          id: 'lidF', at: [0, top], under: lifted, shapes: [
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
      { outline: ink, root: root([curl('L'), curl('R')]) },
    ],
  };
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const smooth = (t: number) => t * t * (3 - 2 * t);

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
  },
  render(rig, p, gaze, t, paint) {
    const I = instances.get(paint);
    const G = I?.geo;
    rig.set('root', { x: p['body.x'], y: p['body.y'], rot: p['body.rot'], sx: p['body.sx'], sy: p['body.sy'] });
    const y = p['body.y'];
    rig.set('shadow', { sx: 1 + y * 0.006, sy: 1 + y * 0.006 });
    rig.attr('shadow', 'opacity', 1 + y * 0.012);

    // No arms. The tabs never move: raising an "arm" channel flattens that tab into the side edge
    // and curls the top corner up into a paper hook that grows from where the tab was. A small
    // raise (heart, below about 0.3) or a lowered one (shy, sleepy) changes nothing.
    const tr = p['armR.rot'], tl = p['armL.rot'];
    const ts = G ? G.ts : 1;
    const lined = !!paint.outline(1);
    const pk = pockets.get(paint);
    let st = curlState.get(rig);
    if (!st) curlState.set(rig, (st = { t, R: 0, L: 0, fR: 0, fL: 0 }));
    const dt = t - st.t;
    st.t = t;
    // a jump in time (a reset, a seek) snaps; otherwise follow at most at `rate`
    const follow = (prev: number, target: number, rate: number) =>
      dt <= 0 || dt > 250 ? target : prev + Math.max(-dt * rate, Math.min(dt * rate, target - prev));
    const side = (id: 'R' | 'L', rot: number, sign: 1 | -1) => {
      const lift = clamp01(-rot / 95);
      const fk = id === 'R' ? 'fR' : 'fL';
      st[fk] = follow(st[fk], smooth(clamp01((lift - 0.3) / 0.4)), FLAT_RATE);
      const roll = (st[id] = follow(st[id], smooth(clamp01((lift - 0.3) / 0.55)), CURL_RATE));
      // past fully up, the extra (wave's swing) rocks the hook outwards from its root
      rig.set(`curl${id}`, { rot: sign * Math.min(8, Math.max(0, -rot - 95) * 0.4) });
      rig.opacity(`curl${id}`, roll > 0.01 ? 1 : 0);
      if (pk) {
        // hidden, the corner's silhouette is moved out of the way so it masks nothing
        rig.path(`curlF${id}`, roll > 0.01 ? curlLine(pk.curl, roll, ts, sign, true) : mapPoints(curlLine(pk.curl, 0, ts, sign, true), () => [9999, 9999]));
        rig.path(`curl${id}`, lined ? curlLine(pk.curl, roll, ts, sign) : curlPath(pk.curl, roll, CURL_W, ts, sign));
      }
    };
    side('R', tr, 1);
    side('L', tl, -1);
    // armX.long is kept as a channel so older actions stay valid; it has no effect.
    if (pk) rig.path('pocket', pk.at(p['armR.thumb'], st.fR, p['armL.thumb'], st.fL));

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
    const sec = secrets.get(paint) ?? { rest: -22, out: -122, size: 1 };
    rig.set('inner', { y: lerp(sec.rest, sec.out, inner) });
    rig.attr('inner', 'opacity', inner > 0.02 ? 1 : 0);
    rig.attr('innerEye', 'opacity', inner > 0.02 ? 1 : 0);
    rig.set('innerBody', { x: p['inner.look'] * 4 * sec.size, rot: p['inner.look'] * 6 });
    rig.attr('blush', 'opacity', Math.max(paint.cheekRest, Math.min(1, p['face.blush']) * 0.9));
    if (!I) rig.attr('shine', 'opacity', happy > 0.3 || shut > 0.5 ? 0 : 1);
  },
};
