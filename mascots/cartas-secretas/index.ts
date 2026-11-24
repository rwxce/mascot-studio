// Cartas Secretas: an envelope that is also a puzzle piece. The side tabs are its arms, the
// bottom notch is where another piece would fit, and the flap opens to show the secret inside
// (a small pink envelope-piece). Drawn from the founder's sketches: heavy black line, white
// paper, one accent colour.
import { Director, type Action } from '../../kit/director.js';
import { gazeTarget, bindReactions } from '../../kit/interact.js';
import { container, type Mascot } from '../../kit/mascot.js';
import { blendPaths, mapPoints, parse, type PathSpec } from '../../kit/morph.js';
import { bell, flow, lerp, seeded, seg, track, wave } from '../../kit/motion.js';
import { Rig, type Part, type Shape } from '../../kit/rig.js';
import { Spring1, Spring2 } from '../../kit/spring.js';

const INK = '#141414';
const PAPER = '#FFFDF8';
const PINK = '#EC4899';
const RED = '#E5383B';
const BULB = '#FFE680';
const LINE = 5.5;

// ---------------------------------------------------------------- geometry
const POCKET = 'M-74 -104L0 -48L74 -104L74 -8L17 -8C17 -30.7 -17 -30.7 -17 -8L-74 -8Z';
const FLAP = 'M-74 0L74 0L0 56Z';
// Right tab, local to its pivot on the side edge. Same commands in every pose so they morph:
// the top segment is flat at rest and becomes a thumb; the neck stretches into an arm.
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
const MINI = 'M-16 -12L-5 -12C-8 -26 8 -26 5 -12L16 -12L16 2L22 2C28 2 28 12 22 12L16 12L16 16L-16 16L-16 12L-22 12C-28 12 -28 2 -22 2L-16 2Z';
const HEART = 'M0 6C-10 -2 -12 -10 -6 -13C-2 -15 0 -12 0 -10C0 -12 2 -15 6 -13C12 -10 10 -2 0 6Z';
const STAR = 'M0 -7L1.8 -1.8L7 0L1.8 1.8L0 7L-1.8 1.8L-7 0L-1.8 -1.8Z';

// ---------------------------------------------------------------- pose
interface Tab { rot: number; long: number; thumb: number }
interface Pose {
  x: number; y: number; sx: number; sy: number; rot: number;
  tabR: Tab; tabL: Tab;
  look: [number, number] | null; lookW: number;
  open: number; happy: number; eyeScale: number;
  flap: number; mini: number; miniLook: number;
  bulb: number; rays: number;
  heart: number; blush: number; zzz: number; sparkle: number;
}

const pose0 = (): Pose => ({
  x: 0, y: 0, sx: 1, sy: 1, rot: 0,
  tabR: { rot: 0, long: 0, thumb: 0 }, tabL: { rot: 0, long: 0, thumb: 0 },
  look: null, lookW: 0, open: 1, happy: 0, eyeScale: 1,
  flap: 1, mini: 0, miniLook: 0, bulb: 0, rays: 0,
  heart: -1, blush: 0, zzz: -1, sparkle: -1,
});

/** A jump: anticipation squash, gravity arc, landing squash. Returns [y, sy]. */
function jump(u: number, at: number, air: number, height: number): [number, number] {
  let y = 0;
  if (u > at && u < at + air) {
    const p = (u - at) / air;
    y = -height * 4 * p * (1 - p);
  }
  const sy = flow(u, [[0, 1], [at - 180, 1], [at - 20, 0.88], [at + 60, 1.1], [at + air * 0.5, 1.02], [at + air - 30, 1.05], [at + air + 60, 0.86], [at + air + 260, 1.04], [at + air + 520, 1], [at + air + 2000, 1]]);
  return [y, sy];
}

// ---------------------------------------------------------------- actions
const actions: Action<Pose>[] = [
  {
    name: 'wave', duration: 2600, weight: 3,
    apply(p, u, e) {
      p.tabR.rot += e * (-100 + 20 * wave(u, 560));
      p.tabR.long += e;
      p.happy += e * 0.7;
      p.rot += e * -2.5;
      p.look = [0.2, -0.1]; p.lookW = e;
    },
  },
  {
    name: 'thumbs-up', duration: 2300, weight: 2,
    apply(p, u, e) {
      p.tabR.rot += e * -6;
      p.tabR.thumb += flow(u, [[0, 0], [260, 0], [520, 1.18], [700, 1], [1900, 1], [2300, 0]]);
      p.happy += e * 0.9;
      const [y, sy] = jump(u, 380, 300, 7);
      p.y += y; p.sy *= sy;
    },
  },
  {
    name: 'idea', duration: 3200, weight: 2,
    apply(p, u, e) {
      const lookUp = 1 - seg(u, 2500, 3000);
      p.look = [0.05, -1]; p.lookW = e * lookUp;
      p.bulb = u > 350 && u < 2700 ? 1 : 0;
      p.rays = u > 700 && u < 2600 ? 0.6 + 0.4 * Math.abs(wave(u, 360)) : 0;
      p.happy += e * seg(u, 800, 1100) * 0.9;
      p.tabL.rot += e * seg(u, 700, 1000) * 55;
      p.tabL.long += e * seg(u, 700, 1000) * 0.6;
      const [y, sy] = jump(u, 900, 280, 9);
      p.y += y; p.sy *= sy;
    },
  },
  {
    name: 'heart', duration: 2800, weight: 2,
    apply(p, u, e) {
      p.heart = u / 2800;
      p.blush = Math.max(p.blush, e);
      p.happy += e;
      p.rot += e * 3 * wave(u, 900);
      p.tabR.rot += e * -25;
      p.tabL.rot += e * 25;
    },
  },
  {
    name: 'reveal', duration: 5600, weight: 1.5, fade: 1,
    apply(p, u) {
      const e = 1 - seg(u, 5300, 5600);
      p.look = [0, -1]; p.lookW = (seg(u, 0, 300) * (1 - seg(u, 700, 900)));
      const squash = flow(u, [[0, 1], [300, 1], [500, 0.93], [700, 1.04], [900, 1], [5600, 1]]);
      p.sy *= squash;
      p.flap = track(u, [[0, 1], [500, 1], [1100, -1, 'out'], [4700, -1], [5300, 1]]);
      p.mini = flow(u, [[0, 0], [1000, 0], [1500, 1.12], [1700, 1], [4100, 1], [4600, 0], [5600, 0]]);
      p.miniLook = flow(u, [[0, 0], [1900, 0], [2300, -1], [2900, -1], [3300, 1], [3800, 1], [4100, 0], [5600, 0]]);
      p.tabR.rot += e * seg(u, 300, 700) * -60 * (1 - seg(u, 1100, 1500));
      p.tabL.rot += e * seg(u, 300, 700) * 60 * (1 - seg(u, 1100, 1500));
      p.sparkle = u > 1400 && u < 2600 ? (u - 1400) / 1200 : -1;
    },
  },
  {
    name: 'look-around', duration: 2600, weight: 3,
    apply(p, u, e) {
      p.look = [flow(u, [[0, 0], [400, -1], [1100, -1], [1500, 1], [2200, 1], [2600, 0]]), 0.1];
      p.lookW = e;
      p.open = Math.min(p.open, 1 - e * 0.25);
      p.rot += e * flow(u, [[0, 0], [400, -2], [1100, -2], [1500, 2], [2200, 2], [2600, 0]]);
    },
  },
  {
    name: 'stretch', duration: 2400, weight: 1.5,
    apply(p, u, e) {
      const s = flow(u, [[0, 0], [600, 1], [1500, 1], [1800, -0.3], [2100, 0.1], [2400, 0]]);
      p.sy *= 1 + 0.12 * s * e;
      p.sx *= 1 - 0.07 * s * e;
      p.tabR.rot += e * -80 * Math.max(0, s); p.tabR.long += e * Math.max(0, s);
      p.tabL.rot += e * 80 * Math.max(0, s); p.tabL.long += e * Math.max(0, s);
      p.open = Math.min(p.open, 1 - e * 0.9 * Math.max(0, s));
      p.rot += e * 2 * wave(u, 1200) * Math.max(0, s);
    },
  },
  {
    name: 'sleepy', duration: 5200, weight: 1, fade: 500,
    apply(p, u, e) {
      const doze = seg(u, 0, 1400, 'inOut') * (1 - seg(u, 4300, 4500));
      p.open = Math.min(p.open, 1 - 0.95 * doze);
      p.sy *= 1 - 0.035 * doze + 0.02 * doze * wave(u, 1800);
      p.rot += doze * 4;
      p.zzz = u > 1300 && u < 4300 ? (u - 1300) / 3000 : -1;
      if (u > 4300) {
        p.eyeScale *= 1 + 0.3 * bell((u - 4300) / 600);
        const [y, sy] = jump(u, 4380, 260, 12);
        p.y += y; p.sy *= sy;
      }
      p.tabR.rot += e * 18 * doze; p.tabL.rot += e * -18 * doze;
    },
  },
  {
    name: 'shy', duration: 2600, weight: 1.5,
    apply(p, u, e) {
      p.blush = Math.max(p.blush, e);
      p.happy += e;
      p.look = [-0.4, 0.8]; p.lookW = e;
      p.tabR.rot += e * 38; p.tabL.rot += e * -38;
      p.rot += e * (-3 + 2 * wave(u, 1300));
      p.sx *= 1 - 0.03 * e; p.sy *= 1 - 0.03 * e;
    },
  },
  {
    name: 'hop', duration: 1700, weight: 2,
    apply(p, u, e) {
      const [y, sy] = jump(u, 300, 420, 24);
      p.y += y; p.sy *= sy;
      const air = seg(u, 250, 400) * (1 - seg(u, 700, 1000));
      p.tabR.rot += e * -85 * air; p.tabL.rot += e * 85 * air;
      p.happy += e;
      p.sparkle = u > 300 && u < 1300 ? (u - 300) / 1000 : -1;
    },
  },
  {
    name: 'notice', duration: 1900, weight: 0,
    apply(p, u, e) {
      p.eyeScale *= 1 + 0.28 * bell(u / 500);
      const [y, sy] = jump(u, 250, 260, 8);
      p.y += y; p.sy *= sy;
      p.tabR.rot += e * seg(u, 500, 800) * (-95 + 18 * wave(u, 500)); p.tabR.long += e * seg(u, 500, 800);
      p.happy += e * seg(u, 450, 700);
    },
  },
  {
    name: 'surprise', duration: 1500, weight: 0,
    apply(p, u, e) {
      p.eyeScale *= 1 + 0.45 * bell(u / 900);
      const [y, sy] = jump(u, 120, 380, 30);
      p.y += y; p.sy *= sy;
      const up = seg(u, 60, 200) * (1 - seg(u, 600, 1000));
      p.tabR.rot += e * -115 * up; p.tabL.rot += e * 115 * up;
      p.tabR.long += e * up; p.tabL.long += e * up;
    },
  },
];

// ---------------------------------------------------------------- rig
const det = (s: Shape): Shape => ({ ...s, kind: 'detail' });

export const ACTIONS = actions.map((a) => a.name);

export function cartasSecretas(opts: { salt?: number } = {}): Mascot {
  const salt = opts.salt ?? 0;
  const root = (children: Part[]): Part => ({ id: 'root', at: [130, 184], children });
  const rig = new Rig({
    viewBox: '0 -24 260 244',
    label: 'Cartas Secretas mascot: an envelope shaped like a puzzle piece',
    layers: [
      { outline: null, root: { id: 'shadow', at: [130, 188], shapes: [det({ el: { tag: 'ellipse', attrs: { rx: 72, ry: 6, fill: 'rgba(20,20,20,.12)' } }, ref: 'shadow' })] } },
      // back: the dark inside of the envelope and the flap when it is open
      {
        outline: { color: INK, width: LINE },
        root: root([
          { shapes: [{ d: 'M-74 -104L74 -104L0 -48Z', fill: '#2A1F2B' }] },
          { id: 'flapB', at: [0, -104], shapes: [{ d: FLAP, fill: '#2A1F2B' }] },
        ]),
      },
      // the secret inside
      {
        outline: { color: INK, width: 3.5 },
        root: root([{
          id: 'mini', at: [0, -60], children: [{
            id: 'miniBody', shapes: [
              { d: MINI, fill: PINK, ref: 'mini' },
              det({ el: { tag: 'ellipse', attrs: { cx: -6, cy: 1, rx: 3, ry: 4.5, fill: INK } }, ref: 'miniEye' }),
              det({ el: { tag: 'ellipse', attrs: { cx: 6, cy: 1, rx: 3, ry: 4.5, fill: INK } }, ref: 'miniEye' }),
            ],
          }],
        }]),
      },
      // body: pocket + both tabs in one layer, so the joints are seamless
      {
        outline: { color: INK, width: LINE },
        root: root([
          { id: 'tabL', at: [-74, -58], shapes: [{ pathRef: 'tabL', fill: PAPER }] },
          { id: 'tabR', at: [74, -58], shapes: [{ pathRef: 'tabR', fill: PAPER }] },
          {
            shapes: [
              { d: POCKET, fill: PAPER },
              det({ d: 'M-74 -8L-26 -67.7', stroke: INK, width: LINE }),
              det({ d: 'M74 -8L26 -67.7', stroke: INK, width: LINE }),
              det({ el: { tag: 'ellipse', attrs: { cx: -44, cy: -40, rx: 9, ry: 5, fill: '#F7A8B8' } }, ref: 'blush' }),
              det({ el: { tag: 'ellipse', attrs: { cx: 44, cy: -40, rx: 9, ry: 5, fill: '#F7A8B8' } }, ref: 'blush' }),
            ],
          },
        ]),
      },
      // front flap with the face
      {
        outline: { color: INK, width: LINE },
        root: root([{
          id: 'flapF', at: [0, -104], shapes: [{ d: FLAP, fill: PAPER }],
          children: [{
            id: 'eyes', at: [0, 19], children: [
              { id: 'eyeL', at: [-13, 0], shapes: [det({ pathRef: 'eyeL', fill: INK })] },
              { id: 'eyeR', at: [13, 0], shapes: [det({ pathRef: 'eyeR', fill: INK })] },
            ],
          }],
        }]),
      },
      // props
      {
        outline: null,
        root: root([
          {
            id: 'bulb', at: [0, -110], shapes: [
              det({ el: { tag: 'circle', attrs: { cx: 0, cy: -24, r: 24, fill: BULB, opacity: 0 } }, ref: 'glow' }),
              det({ d: 'M0 -38C-8 -38 -14 -32 -14 -24C-14 -18 -10 -14 -7 -10L7 -10C10 -14 14 -18 14 -24C14 -32 8 -38 0 -38Z', fill: '#FFFBE6', stroke: INK, width: 3.5 }),
              det({ d: 'M-6 -10L6 -10L6 -2L-6 -2Z', fill: '#D9D4C7', stroke: INK, width: 3.5 }),
              det({ d: 'M-3 -11L-3 -22C-3 -26 3 -26 3 -22L3 -11', stroke: INK, width: 2 }),
              det({ d: 'M0 -46L0 -54M-17 -40L-23 -46M17 -40L23 -46M-24 -24L-32 -24M24 -24L32 -24', stroke: INK, width: 3, ref: 'rays' }),
            ],
          },
          { id: 'heart', at: [104, -84], shapes: [det({ d: HEART, fill: RED, ref: 'heart' })] },
          { id: 'z1', at: [52, -122], shapes: [det({ el: { tag: 'text', attrs: { 'font-family': 'ui-rounded, system-ui, sans-serif', 'font-weight': 800, 'font-size': 16, fill: INK, 'text-anchor': 'middle' }, text: 'z' }, ref: 'z1' })] },
          { id: 'z2', at: [64, -136], shapes: [det({ el: { tag: 'text', attrs: { 'font-family': 'ui-rounded, system-ui, sans-serif', 'font-weight': 800, 'font-size': 20, fill: INK, 'text-anchor': 'middle' }, text: 'z' }, ref: 'z2' })] },
          { id: 'z3', at: [78, -152], shapes: [det({ el: { tag: 'text', attrs: { 'font-family': 'ui-rounded, system-ui, sans-serif', 'font-weight': 800, 'font-size': 24, fill: INK, 'text-anchor': 'middle' }, text: 'Z' }, ref: 'z3' })] },
          ...[[-92, -128], [94, -132], [-60, -158], [66, -166]].map(([x, y], i) => ({ id: `sp${i}`, at: [x, y] as const, shapes: [det({ d: STAR, fill: i % 2 ? PINK : INK, ref: `sp${i}` })] })),
        ]),
      },
    ],
  });

  const director = new Director(actions, { salt: salt + 11, gap: [1200, 3000] });
  const gaze = new Spring2({ freq: 2.6, damping: 0.75 });
  const miniGaze = new Spring1({ freq: 3, damping: 0.6 });
  const tabR = new Spring1({ freq: 3.2, damping: 0.42 });
  const tabL = new Spring1({ freq: 3.0, damping: 0.42 });
  const bulb = new Spring1({ freq: 3.6, damping: 0.38 });
  const heartPop = new Spring1({ freq: 3.4, damping: 0.4 });
  let lastT = 0;
  const el = container(rig.svg, 'cartas-secretas');

  bindReactions(el, () => director.play('notice', lastT), () => director.play('surprise', lastT));

  function blinkAt(t: number): number {
    // a blink every 2.8–5.2 s, sometimes a double one; closes fast, opens slower
    const k = Math.floor(t / 4000);
    let b = 0;
    for (const i of [k - 1, k]) {
      const tb = i * 4000 + seeded(i, salt + 1) * 2400;
      b = Math.max(b, track(t, [[tb, 0], [tb + 70, 1, 'in'], [tb + 120, 1], [tb + 280, 0, 'out']]));
      if (seeded(i, salt + 2) > 0.7) {
        const t2 = tb + 330;
        b = Math.max(b, track(t, [[t2, 0], [t2 + 70, 1, 'in'], [t2 + 110, 1], [t2 + 260, 0, 'out']]));
      }
    }
    return b;
  }

  function update(t: number, dt: number, mode: { still?: boolean; scripted?: boolean }) {
    lastT = t;
    const p = pose0();
    if (!mode.still) {
      // idle life: breath, weight shift, tabs that never quite stop
      const br = wave(t, 2600);
      p.sy = 1 + 0.018 * br;
      p.sx = 1 - 0.008 * br;
      p.rot = 1.2 * wave(t, 5200, 0.1);
      p.tabR.rot = 5 * wave(t, 2600, 0.15);
      p.tabL.rot = -5 * wave(t, 2600, 0.42);
      p.open = 1 - blinkAt(t);
      director.update(p, t);
    }
    // gaze: pointer or idle glances, overridden by actions that look somewhere
    let [gx, gy] = mode.still ? [0, 0] : gazeTarget(el, t, !!mode.scripted, salt);
    if (p.look) { gx = lerp(gx, p.look[0], p.lookW); gy = lerp(gy, p.look[1], p.lookW); }
    if (mode.still) gaze.reset(); else gaze.step(gx, gy, dt);
    const tr = mode.still ? (tabR.reset(), 0) : tabR.step(p.tabR.rot, dt);
    const tl = mode.still ? (tabL.reset(), 0) : tabL.step(p.tabL.rot, dt);
    const bulbS = mode.still ? (bulb.reset(), 0) : bulb.step(p.bulb, dt);
    const ml = mode.still ? (miniGaze.reset(), 0) : miniGaze.step(p.miniLook, dt);

    rig.set('root', { x: p.x, y: p.y, rot: p.rot, sx: p.sx, sy: p.sy });
    rig.set('shadow', { sx: 1 + p.y * 0.006, sy: 1 + p.y * 0.006 });
    rig.attr('shadow', 'opacity', 1 + p.y * 0.012);

    // Raising an arm slides its root up the side to the top corner (as in the sketches), so the
    // arm leaves the body from the corner instead of sweeping behind the flap.
    const liftR = Math.min(1, Math.max(0, -tr / 95)), liftL = Math.min(1, Math.max(0, tl / 95));
    rig.set('tabR', { y: -40 * liftR, x: -3 * liftR, rot: tr });
    rig.set('tabL', { y: -40 * liftL, x: 3 * liftL, rot: tl });
    rig.path('tabR', blendPaths(TAB_REST, [[TAB_LONG, Math.min(1, p.tabR.long)], [TAB_THUMB, p.tabR.thumb]]));
    rig.path('tabL', blendPaths(TABL_REST, [[TABL_LONG, Math.min(1, p.tabL.long)], [TABL_THUMB, p.tabL.thumb]]));

    rig.set('flapF', { sy: Math.max(p.flap, 0.001) });
    rig.set('flapB', { sy: Math.min(p.flap, -0.001) });
    rig.set('eyes', { x: gaze.x.value * 5, y: gaze.y.value * 4 });
    const happy = Math.min(1, p.happy);
    const shut = 1 - Math.max(0, Math.min(1, p.open));
    const eye = blendPaths(EYE, [[EYE_SHUT, shut * (1 - happy)], [EYE_HAPPY, happy]]);
    rig.path('eyeL', eye);
    rig.path('eyeR', eye);
    rig.set('eyeL', { sx: p.eyeScale, sy: p.eyeScale });
    rig.set('eyeR', { sx: p.eyeScale, sy: p.eyeScale });

    rig.set('mini', { y: lerp(34, -62, p.mini) });
    rig.attr('mini', 'opacity', p.mini > 0.02 ? 1 : 0);
    rig.attr('miniEye', 'opacity', p.mini > 0.02 ? 1 : 0);
    rig.set('miniBody', { x: ml * 4, rot: ml * 6 });

    rig.set('bulb', { sx: Math.max(0.001, bulbS), sy: Math.max(0.001, bulbS) });
    rig.attr('glow', 'opacity', 0.55 * p.rays);
    rig.attr('rays', 'opacity', p.rays);

    const hp = p.heart;
    const hs = mode.still ? (heartPop.reset(), 0) : heartPop.step(hp >= 0 && hp < 0.8 ? 1 : 0, dt);
    rig.set('heart', { x: hp >= 0 ? 6 * wave(hp * 2800, 700) : 0, y: hp >= 0 ? -46 * seg(hp, 0.05, 1, 'out') : 0, sx: 1.5 * Math.max(0.001, hs), sy: 1.5 * Math.max(0.001, hs), rot: hp >= 0 ? 10 * wave(hp * 2800, 700) : 0 });
    rig.attr('heart', 'opacity', hp >= 0 ? 1 - seg(hp, 0.75, 1) : 0);
    rig.attr('blush', 'opacity', Math.min(1, p.blush) * 0.9);

    for (let i = 0; i < 3; i++) {
      const z = p.zzz;
      const local = z < 0 ? -1 : (z * 3 - i * 0.45) % 1.4;
      const o = local >= 0 && local <= 1 ? bell(local) : 0;
      rig.set(`z${i + 1}`, { x: local > 0 ? 6 * local : 0, y: local > 0 ? -10 * local : 0 });
      rig.attr(`z${i + 1}`, 'opacity', o);
    }
    for (let i = 0; i < 4; i++) {
      const s = p.sparkle;
      const local = s < 0 ? -1 : (s - i * 0.12) / 0.6;
      const o = local >= 0 && local <= 1 ? bell(local) : 0;
      rig.set(`sp${i}`, { rot: 90 * Math.max(0, local), sx: 0.4 + o, sy: 0.4 + o });
      rig.attr(`sp${i}`, 'opacity', o);
    }
  }

  return {
    name: 'cartas-secretas',
    el,
    actions: ACTIONS,
    play: (name) => director.play(name, lastT),
    reset(showreel) {
      director.reset(showreel?.length ? 500 : 1200);
      if (showreel?.length) director.enqueue(...showreel);
      for (const s of [tabR, tabL, bulb, heartPop, miniGaze]) s.reset();
      gaze.reset();
    },
    update,
  };
}
