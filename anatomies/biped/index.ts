// biped: a body standing on two legs, a head on a neck, arms with a shoulder and an elbow,
// and an antenna that lags the head on a loose spring. Example: mascots/robot.
import type { Anatomy, Built } from '../../kit/character.js';
import { eyePart, eyePoses, FACE_DEFAULTS, renderEyes } from '../../kit/face.js';
import { wave } from '../../kit/motion.js';
import type { Part, Shape } from '../../kit/rig.js';
import { roundRect } from '../../kit/shapes.js';
import type { AnatomyContract, MascotSpec } from '../../kit/spec.js';
import type { Painter } from '../../kit/style.js';
import type { ActionSpec } from '../../kit/timeline.js';

const det = (s: Shape): Shape => ({ ...s, kind: 'detail' });
const EYES = eyePoses(4.5, 6);

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

function build(spec: MascotSpec, paint: Painter): Built {
  const out = paint.outline(0.62);
  const root = (children: Part[]): Part => ({ id: 'root', at: [80, 148], children });
  const torso = (children: Part[], shapes: Shape[] = []): Part => ({ id: 'torso', at: [0, -24], shapes, children });
  const head = (children: Part[], shapes: Shape[] = []): Part => ({ id: 'head', at: [0, -50], shapes, children });
  const leg = (side: 'L' | 'R'): Part => ({ id: `leg${side}`, at: [side === 'L' ? -10.5 : 10.5, -30], shapes: [{ d: roundRect(-5.5, 0, 5.5, 26, 5.5), fill: paint.fill('body-dark') }] });
  const arm = (side: 'L' | 'R'): Part => {
    const m = side === 'L' ? -1 : 1;
    return {
      id: `arm${side}`, at: [23 * m, -30],
      shapes: [{ d: `M0 0L${14 * m} 13`, stroke: paint.flat('body-dark'), width: 10 }],
      children: [{ id: `elbow${side}`, at: [14 * m, 13], shapes: [{ d: `M0 0L${2 * m} 16`, stroke: paint.flat('body'), width: 10 }] }],
    };
  };
  const lw = paint.lineWidth(3.5);
  return {
    viewBox: '0 -30 160 190',
    rootAt: [80, 148],
    stage: [80, 92, 70],
    label: `${spec.title} mascot`,
    layers: [
      { outline: null, root: { id: 'shadow', at: [80, 148], shapes: [det({ el: { tag: 'ellipse', attrs: { rx: 30, ry: 5, fill: paint.shadow } }, ref: 'shadow' })] } },
      { outline: out, root: root([leg('L'), leg('R')]) },
      {
        outline: out,
        root: root([torso([], [
          { d: roundRect(-6, -52, 6, -40, 2), fill: paint.fill('body-dark') },
          { d: roundRect(-26, -42, 26, 0, 18), fill: paint.fill('body') },
          det({ el: { tag: 'circle', attrs: { cx: 0, cy: -21, r: 6, fill: paint.flat('eye') } }, ref: 'core' }),
        ])]),
      },
      { outline: out, root: root([torso([arm('L'), arm('R')])]) },
      {
        outline: out,
        root: root([torso([head([
          {
            id: 'antenna', at: [0, -40], shapes: [
              { d: 'M0 0L0 -13', stroke: paint.flat('body-dark'), width: 3.5 },
              { d: 'M0 -21.5C3 -21.5 5.5 -19 5.5 -16C5.5 -13 3 -10.5 0 -10.5C-3 -10.5 -5.5 -13 -5.5 -16C-5.5 -19 -3 -21.5 0 -21.5Z', fill: paint.fill('accent') },
            ],
          },
        ], [
          { d: roundRect(-41, -26, -32, -9, 4.5), fill: paint.fill('body-dark') },
          { d: roundRect(32, -26, 41, -9, 4.5), fill: paint.fill('body-dark') },
          { d: roundRect(-34, -40, 34, 4, 18), fill: paint.fill('body') },
          det({ d: roundRect(-26, -30, 26, -6, 12), fill: paint.fill('visor'), stroke: out ? paint.flat('ink') : undefined, width: out ? lw : undefined }),
          det({ el: { tag: 'ellipse', attrs: { cx: -22, cy: -1, rx: 4.5, ry: 2.6, fill: paint.flat('cheek') } }, ref: 'blush' }),
          det({ el: { tag: 'ellipse', attrs: { cx: 22, cy: -1, rx: 4.5, ry: 2.6, fill: paint.flat('cheek') } }, ref: 'blush' }),
        ])])]),
      },
      // eyes inside the visor (their travel stays within it, so no clip is needed)
      {
        outline: null,
        root: root([torso([head([{ id: 'eyes', at: [0, -18], children: [eyePart('L', [-11.5, 0], EYES, paint), eyePart('R', [11.5, 0], EYES, paint)] }])])]),
      },
    ],
  };
}

export const biped: Anatomy = {
  contract,
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
    rig.set('eyes', { x: gaze.x * 8, y: gaze.y * 3 });
    renderEyes(rig, p, EYES);
    rig.attr('core', 'opacity', 0.35 + 0.65 * Math.max(0, Math.min(1, p.core)));
    rig.attr('blush', 'opacity', Math.max(paint.cheekRest * 0.8, Math.min(1, p['face.blush']) * 0.9));
  },
};

