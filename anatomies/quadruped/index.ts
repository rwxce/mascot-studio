// quadruped: a sitting animal — body, front legs with paws, a head with ears, and a tail that
// swings from its base while its tip bends a beat later (two springs). Example: mascots/fox.
import type { Anatomy, Built } from '../../kit/character.js';
import { eyePart, eyePoses, FACE_DEFAULTS, renderEyes } from '../../kit/face.js';
import { mapPoints, parse, type PathSpec } from '../../kit/morph.js';
import { seeded, track, wave } from '../../kit/motion.js';
import type { Part, Shape } from '../../kit/rig.js';
import { ellipse, shift } from '../../kit/shapes.js';
import type { AnatomyContract, MascotSpec } from '../../kit/spec.js';
import type { Painter } from '../../kit/style.js';
import type { ActionSpec } from '../../kit/timeline.js';

const det = (s: Shape): Shape => ({ ...s, kind: 'detail' });
const EYES = eyePoses(5, 6.4);

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
function bendTail(spec: PathSpec, deg: number) {
  const a = (deg * Math.PI) / 180;
  return mapPoints(spec, (_, x, y) => {
    let w = Math.min(1, Math.max(0, (-y - 18) / 26));
    w = w * w * (3 - 2 * w);
    const c = Math.cos(a * w), s = Math.sin(a * w);
    const dx = x - JOINT[0], dy = y - JOINT[1];
    return [JOINT[0] + dx * c - dy * s, JOINT[1] + dx * s + dy * c];
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

function build(spec: MascotSpec, paint: Painter): Built {
  const out = paint.outline(0.55);
  const root = (children: Part[]): Part => ({ id: 'root', at: [80, 148], children });
  const torso = (children: Part[], shapes: Shape[] = []): Part => ({ id: 'torso', at: [0, -6], shapes, children });
  const head = (children: Part[], shapes: Shape[] = []): Part => ({ id: 'head', at: [0, -46], shapes, children });
  const leg = (side: 'L' | 'R'): Part => ({
    id: `leg${side}`, at: [side === 'L' ? -7 : 7, -14],
    shapes: [
      { d: 'M0 0L0 10', stroke: paint.flat('belly'), width: 9 },
      { d: ellipse(0, 14, 9, 5), fill: paint.flat('eye') },
    ],
  });
  return {
    viewBox: '-10 -32 180 192',
    rootAt: [80, 148],
    stage: [80, 92, 70],
    label: `${spec.title} mascot`,
    layers: [
      { outline: null, root: { id: 'shadow', at: [84, 148], shapes: [det({ el: { tag: 'ellipse', attrs: { rx: 40, ry: 5, fill: paint.shadow } }, ref: 'shadow' })] } },
      {
        outline: out,
        root: root([torso([{ id: 'tail', at: [18, -6], shapes: [{ pathRef: 'tail', fill: paint.fill('body') }, { pathRef: 'tailTip', fill: paint.fill('belly') }] }])]),
      },
      {
        outline: out,
        root: root([torso([leg('L'), leg('R')], [
          { d: BODY, fill: paint.fill('body') },
          { d: BELLY, fill: paint.fill('belly') },
        ])]),
      },
      {
        outline: out,
        root: root([torso([head([
          { id: 'earL', at: [-20, -46], shapes: [{ d: EAR_L, fill: paint.fill('body') }, det({ d: EAR_L_IN, fill: paint.flat('eye') })] },
          { id: 'earR', at: [20, -46], shapes: [{ d: EAR_R, fill: paint.fill('body') }, det({ d: EAR_R_IN, fill: paint.flat('eye') })] },
          { shapes: [{ d: HEAD, fill: paint.fill('body') }, { d: MASK, fill: paint.fill('belly') }] },
          {
            id: 'face', children: [
              { id: 'eyes', at: [0, -34], children: [eyePart('L', [-14, 0], EYES, paint), eyePart('R', [14, 0], EYES, paint)] },
            ],
            shapes: [
              det({ el: { tag: 'ellipse', attrs: { cx: -24, cy: -20, rx: 5, ry: 3, fill: paint.flat('cheek') } }, ref: 'blush' }),
              det({ el: { tag: 'ellipse', attrs: { cx: 24, cy: -20, rx: 5, ry: 3, fill: paint.flat('cheek') } }, ref: 'blush' }),
              det({ d: ellipse(0, -8, 5.5, 3.8), fill: paint.flat('eye') }),
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
    rig.set('root', { x: p['body.x'], y: p['body.y'], rot: p['body.rot'] });
    rig.set('torso', { sx: p['body.sx'], sy: p['body.sy'] });
    const y = p['body.y'];
    rig.set('shadow', { sx: 1 + y * 0.008, sy: 1 + y * 0.008 });
    rig.attr('shadow', 'opacity', 1 + y * 0.014);
    rig.set('tail', { rot: p['tail.rot'] });
    rig.path('tail', bendTail(TAIL, p['tail.bend']));
    rig.path('tailTip', bendTail(TIP, p['tail.bend']));
    rig.set('legR', { rot: p.pawR });
    rig.set('legL', { rot: -p.pawL });
    rig.set('head', { x: gaze.x * 1.5, y: p['head.y'], rot: p['head.rot'] + gaze.x * 5 });
    rig.set('earL', { rot: p.earL });
    rig.set('earR', { rot: -p.earR });
    rig.set('eyes', { x: gaze.x * 3, y: gaze.y * 2 });
    renderEyes(rig, p, EYES);
    rig.attr('blush', 'opacity', Math.max(paint.cheekRest, Math.min(1, p['face.blush']) * 0.9));
  },
};
