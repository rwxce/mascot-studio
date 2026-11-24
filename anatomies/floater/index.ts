// floater: a body with no legs that floats — round top, a wavy hem that ripples on every
// frame (same commands, so it morphs), small arms, a mouth that can open. It can spin, swell
// and fade. Example: mascots/ghost.
import type { Anatomy, Built } from '../../kit/character.js';
import { eyePart, eyePoses, FACE_DEFAULTS, renderEyes } from '../../kit/face.js';
import { blendPaths, mapPoints, parse } from '../../kit/morph.js';
import { wave } from '../../kit/motion.js';
import type { Part, Shape } from '../../kit/rig.js';
import { ellipse } from '../../kit/shapes.js';
import type { AnatomyContract, MascotSpec } from '../../kit/spec.js';
import type { Painter } from '../../kit/style.js';
import type { ActionSpec } from '../../kit/timeline.js';

const det = (s: Shape): Shape => ({ ...s, kind: 'detail' });
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

function build(spec: MascotSpec, paint: Painter): Built {
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
      { outline: out, root: root([{ id: 'ghost', children: [arm('L'), arm('R')] }]) },
      {
        outline: out,
        root: root([{
          id: 'ghost', shapes: [{ pathRef: 'body', fill: paint.fill('body') }],
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
    ],
  };
}

export const floater: Anatomy = {
  contract,
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
    rig.path('body', bodyPath((t / 1100) * Math.PI * 2, p.hem));
    rig.set('armR', { rot: p.armR });
    rig.set('armL', { rot: -p.armL });
    rig.set('eyes', { x: gaze.x * 4, y: gaze.y * 3 });
    renderEyes(rig, p, EYES);
    const open = Math.max(0, Math.min(1, p['mouth.open']));
    rig.path('mouth', blendPaths(MOUTH, [[MOUTH_BIG, open], [MOUTH_SMILE, Math.min(1, p['mouth.smile']) * (1 - open)]]));
    rig.attr('blush', 'opacity', Math.max(paint.cheekRest, Math.min(1, p['face.blush']) * 0.9));
  },
};
