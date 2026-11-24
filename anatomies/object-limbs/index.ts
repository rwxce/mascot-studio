// object-limbs: an object (an envelope) with puzzle-tab arms, a face on a lid that opens,
// and a secret inside that can peek out. Parametric: width, height, the bottom notch, the
// cross lines and the inner secret are body parameters in mascot.json.
import type { Anatomy, Built } from '../../kit/character.js';
import { blendPaths, mapPoints, parse, type PathSpec } from '../../kit/morph.js';
import { wave } from '../../kit/motion.js';
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

function build(spec: MascotSpec, paint: Painter): Built {
  const b = spec.body ?? {};
  const W = (b.width as number) ?? 148, H = (b.height as number) ?? 96;
  const notch = (b.notch as number) ?? 17, line = ((b.line as number) ?? 5.5) / 5.5;
  const cross = b.crossLines !== false, hasInner = b.inner !== false;
  const hw = W / 2, top = -8 - H, bot = -8, vy = top + H * 0.583, flapH = vy - top;
  const midY = (top + bot) / 2 - 2;
  const k = W / 148;
  const vbW = W + 112, rootX = vbW / 2, rootY = 184;
  const vbTop = Math.floor(rootY + top - flapH - 60);
  const notchD = notch > 0 ? `L${r(notch)} ${bot}C${r(notch)} ${r(bot - notch * 1.35)} ${r(-notch)} ${r(bot - notch * 1.35)} ${r(-notch)} ${bot}` : '';
  const pocket = `M${-hw} ${top}L0 ${r(vy)}L${hw} ${top}L${hw} ${bot}${notchD}L${-hw} ${bot}Z`;
  const flap = `M${-hw} 0L${hw} 0L0 ${r(flapH)}Z`;
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

  return {
    viewBox: `0 ${vbTop} ${vbW} ${220 - vbTop}`,
    rootAt: [rootX, rootY],
    stage: [rootX, rootY + top / 2, W * 0.62],
    label: `${spec.title} mascot`,
    layers: [
      { outline: null, root: { id: 'shadow', at: [rootX, rootY + 4], shapes: [det({ el: { tag: 'ellipse', attrs: { rx: hw - 2, ry: 6, fill: paint.shadow } }, ref: 'shadow' })] } },
      {
        outline: ink,
        root: root([
          { shapes: [{ d: `M${-hw} ${top}L${hw} ${top}L0 ${r(vy)}Z`, fill: paint.fill('inside') }] },
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
          { id: 'armL', at: [-hw, midY], shapes: [{ pathRef: 'armL', fill: paint.fill('body') }] },
          { id: 'armR', at: [hw, midY], shapes: [{ pathRef: 'armR', fill: paint.fill('body') }] },
          {
            shapes: [
              { d: pocket, fill: paint.fill('body') },
              ...(cross ? [det({ d: `M${-hw} ${bot}L${r(-cx)} ${r(cy)}`, stroke: paint.flat('line'), width: lw }), det({ d: `M${hw} ${bot}L${r(cx)} ${r(cy)}`, stroke: paint.flat('line'), width: lw })] : []),
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
            ...(ink ? [] : [det({ d: `M${-hw} 0L0 ${r(flapH)}L${hw} 0`, stroke: paint.flat('line'), width: lw })]),
          ],
          children: [{ id: 'eyes', at: [0, r(flapH * 0.34)], children: [eye('L'), eye('R')] }],
        }]),
      },
    ],
  };
}

export const objectLimbs: Anatomy = {
  contract,
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
    rig.set('root', { x: p['body.x'], y: p['body.y'], rot: p['body.rot'], sx: p['body.sx'], sy: p['body.sy'] });
    const y = p['body.y'];
    rig.set('shadow', { sx: 1 + y * 0.006, sy: 1 + y * 0.006 });
    rig.attr('shadow', 'opacity', 1 + y * 0.012);

    // Raising an arm slides its root up the side to the top corner, so the arm leaves the body
    // from the corner instead of sweeping behind the lid.
    const tr = p['armR.rot'], tl = p['armL.rot'];
    const liftR = Math.min(1, Math.max(0, -tr / 95)), liftL = Math.min(1, Math.max(0, -tl / 95));
    rig.set('armR', { y: -40 * liftR, x: -3 * liftR, rot: tr });
    rig.set('armL', { y: -40 * liftL, x: 3 * liftL, rot: -tl });
    rig.path('armR', blendPaths(TAB_REST, [[TAB_LONG, Math.min(1, p['armR.long'])], [TAB_THUMB, p['armR.thumb']]]));
    rig.path('armL', blendPaths(TABL_REST, [[TABL_LONG, Math.min(1, p['armL.long'])], [TABL_THUMB, p['armL.thumb']]]));

    rig.set('lidF', { sy: Math.max(p.lid, 0.001) });
    rig.set('lidB', { sy: Math.min(p.lid, -0.001) });
    rig.set('eyes', { x: gaze.x * 5, y: gaze.y * 4 });
    const happy = Math.min(1, p['eyes.happy']);
    const shut = 1 - Math.max(0, Math.min(1, p['eyes.open']));
    const eye = blendPaths(EYE, [[EYE_SHUT, shut * (1 - happy)], [EYE_HAPPY, happy]]);
    rig.path('eyeL', eye);
    rig.path('eyeR', eye);
    rig.set('eyeL', { sx: p['eyes.scale'], sy: p['eyes.scale'] });
    rig.set('eyeR', { sx: p['eyes.scale'], sy: p['eyes.scale'] });

    const inner = p.inner;
    rig.set('inner', { y: 34 + (-62 - 34) * inner });
    rig.attr('inner', 'opacity', inner > 0.02 ? 1 : 0);
    rig.attr('innerEye', 'opacity', inner > 0.02 ? 1 : 0);
    rig.set('innerBody', { x: p['inner.look'] * 4, rot: p['inner.look'] * 6 });
    rig.attr('blush', 'opacity', Math.max(paint.cheekRest, Math.min(1, p['face.blush']) * 0.9));
    rig.attr('shine', 'opacity', happy > 0.3 || shut > 0.5 ? 0 : 1);
  },
};
