// Eye models. Every model answers the same face channels (eyes.open, eyes.happy, eyes.scale,
// and the gaze), so any action plays with any eye. A layered eye has two parts:
//   - the open eye (sclera, iris layers, pupil, highlights), squashed towards the lid line on a
//     blink and hidden when the eye squints happily;
//   - the lid, a lens that blends between three poses with the same commands: open (a lash
//     line, or nothing), shut (a closed-eye curve) and happy (an arch).
import { darken, grey, lighten } from '../color.js';
import { blendPaths, type PathSpec } from '../morph.js';
import type { Part, Rig, Shape } from '../rig.js';
import type { Painter } from '../style.js';
import type { Pose } from '../timeline.js';
import { eyePart, eyePoses, renderEyes } from './default.js';
import { d, lens, mirror, nothing, rects } from './geom.js';

export interface EyeSet {
  /** Half width and half height of the drawn eye (for brows and layout). */
  rx: number;
  ry: number;
  part(side: 'L' | 'R', at: [number, number]): Part;
  render(rig: Rig, p: Pose, gaze: { x: number; y: number }): void;
}

export interface EyeModel {
  id: string;
  /** Eyes sized for a nominal eye of radii rx × ry. `colour` overrides the eye role. */
  make(rx: number, ry: number, paint: Painter, colour?: string): EyeSet;
}

const det = (s: Shape): Shape => ({ ...s, kind: 'detail' });
const ell = (cx: number, cy: number, rx: number, ry: number, fill: string, extra: Record<string, string | number> = {}): Shape =>
  det({ el: { tag: 'ellipse', attrs: { cx, cy, rx, ry, fill, ...extra } } });
const clamp = (v: number) => Math.max(0, Math.min(1, v));

/** Colours a face needs, from the painter. A light eye colour means the face sits on a dark visor. */
export function faceInks(paint: Painter, colour?: string) {
  const eye = colour ?? paint.flat('eye');
  const light = /^#/.test(eye) && grey(eye) > 140;
  const iris = paint.flat('body-dark');
  return {
    eye,
    light,
    /** Lids, lashes and brows: the eye colour (dark on a body, light on a visor). */
    line: eye,
    sclera: paint.flat('shine'),
    shine: paint.flat('shine'),
    iris,
    pupil: /^#/.test(iris) ? darken(iris, 0.6) : eye,
    /** A dark pupil that reads on a white sclera even when the eye colour is light. */
    dot: light ? '#15121C' : eye,
  };
}

interface Layered {
  rx: number;
  ry: number;
  /** y of the line the lids close on (the open layer squashes towards it). */
  pivot: number;
  /** Shapes of the open right eye (s = 1) or left eye (s = −1), relative to the eye centre. */
  open(s: 1 | -1): Shape[];
  /** Shapes that follow the gaze inside the open eye. */
  pupil?(s: 1 | -1): Shape[];
  gaze?: number;
  /** Lid poses for the right eye (mirrored for the left). */
  lid: { open: PathSpec; shut: PathSpec; happy: PathSpec };
  lidFill: string;
  /** 'scale' squashes the open eye on a blink; 'cut' swaps it (pixel art, hard geometry). */
  blink: 'scale' | 'cut';
}

function layered(L: Layered): EyeSet {
  const lids = {
    R: L.lid,
    L: { open: mirror(L.lid.open), shut: mirror(L.lid.shut), happy: mirror(L.lid.happy) },
  };
  return {
    rx: L.rx,
    ry: L.ry,
    part(side, at) {
      const s = side === 'L' ? -1 : 1;
      return {
        id: `eye${side}`, at, children: [
          {
            id: `eyeOpen${side}`, at: [0, L.pivot], children: [{
              at: [0, -L.pivot], shapes: L.open(s),
              children: L.pupil ? [{ id: `pupil${side}`, shapes: L.pupil(s) }] : [],
            }],
          },
          { shapes: [det({ pathRef: `lid${side}`, fill: L.lidFill })] },
        ],
      };
    },
    render(rig, p, gaze) {
      const happy = clamp(p['eyes.happy']);
      const open = clamp(p['eyes.open']);
      const shut = 1 - open;
      const sc = p['eyes.scale'];
      const show = happy < 0.5 && open > (L.blink === 'cut' ? 0.45 : 0.06);
      const sy = L.blink === 'cut' ? 1 : Math.max(0.06, open) * (1 - happy * 0.8);
      for (const side of ['L', 'R'] as const) {
        const lid = lids[side];
        rig.path(`lid${side}`, blendPaths(lid.open, [[lid.shut, shut * (1 - happy)], [lid.happy, happy]]));
        rig.set(`eyeOpen${side}`, { sy });
        rig.opacity(`eyeOpen${side}`, show ? 1 : 0);
        rig.set(`eye${side}`, { sx: sc, sy: sc });
        if (L.pupil) rig.set(`pupil${side}`, { x: gaze.x * (L.gaze ?? 0), y: gaze.y * (L.gaze ?? 0) * 0.6 });
      }
    },
  };
}

/** Big tall eyes with a layered iris and two highlights (anime; `mono` = manga in black ink). */
function animeEye(rx: number, ry: number, paint: Painter, colour: string | undefined, mono: boolean): EyeSet {
  const k = faceInks(paint, colour);
  const W = rx * 1.15, H = ry * 1.3;
  const ink = mono ? paint.flat('ink') : k.iris;
  const iris: Shape = {
    kind: 'detail', clip: [0, 0.1 * H, 0.74 * W, 0.86 * H], clipped: mono
      ? [ell(0, 0.1 * H, 0.74 * W, 0.86 * H, ink), ell(0, 0.95 * H, 0.5 * W, 0.3 * H, lighten(ink, 0.3))]
      : [
        ell(0, 0.1 * H, 0.74 * W, 0.86 * H, ink),
        ell(0, -0.6 * H, W, 0.5 * H, darken(ink, 0.35)),
        ell(0, 0.8 * H, 0.62 * W, 0.42 * H, lighten(ink, 0.4)),
        ell(0, 0.05 * H, 0.34 * W, 0.46 * H, k.pupil),
      ],
  };
  return layered({
    rx: W, ry: H, pivot: 0.45 * H, blink: 'scale',
    open: () => [
      ell(0, 0, W, H, k.sclera),
      iris,
      ell(-0.3 * W, -0.34 * H, 0.27 * W, 0.3 * H, k.shine),
      det({ el: { tag: 'circle', attrs: { cx: 0.3 * W, cy: 0.42 * H, r: 0.14 * W, fill: k.shine } } }),
    ],
    lid: {
      open: lens([-1.04 * W, -0.05 * H], [0.05 * W, -1.14 * H], [1.24 * W, -0.42 * H], [0.05 * W, -0.84 * H]),
      shut: lens([-1.05 * W, 0.3 * H], [0, 0.52 * H], [1.15 * W, 0.22 * H], [0, 0.7 * H]),
      happy: lens([-1.0 * W, 0.4 * H], [0, -0.42 * H], [1.05 * W, 0.35 * H], [0, -0.14 * H]),
    },
    lidFill: mono && !k.light ? paint.flat('ink') : k.line,
  });
}

/** Almond eyes with a heavy upper line that flicks outward (1980s cel animation). */
function almondEye(rx: number, ry: number, paint: Painter, colour?: string): EyeSet {
  const k = faceInks(paint, colour);
  const W = rx * 1.3, H = ry * 1.0;
  return layered({
    rx: W, ry: H, pivot: 0.2 * H, blink: 'scale',
    open: (s) => [
      det({ d: d(lens([-W * s, 0.12 * H], [0, -1.05 * H], [W * s, -0.18 * H], [0, 0.98 * H])), fill: k.sclera }),
      ell(0.04 * W * s, 0.06 * H, 0.5 * W, 0.84 * H, k.iris),
      ell(0.04 * W * s, 0.1 * H, 0.22 * W, 0.5 * H, k.pupil),
      ell(-0.12 * W, -0.32 * H, 0.1 * W, 0.3 * H, k.shine, { transform: `rotate(28 ${-0.12 * W} ${-0.32 * H})` }),
      det({ el: { tag: 'circle', attrs: { cx: 0.2 * W, cy: 0.45 * H, r: 0.08 * W, fill: k.shine } } }),
      det({ d: d(lens([0.15 * W * s, 1.0 * H], [0.7 * W * s, 0.78 * H], [1.12 * W * s, 0.12 * H], [0.7 * W * s, 0.92 * H])), fill: k.line }),
    ],
    lid: {
      open: lens([-1.06 * W, 0.16 * H], [0, -1.14 * H], [1.5 * W, -0.6 * H], [0, -0.88 * H]),
      shut: lens([-1.06 * W, 0.18 * H], [0.1 * W, 0.4 * H], [1.35 * W, -0.22 * H], [0.1 * W, 0.6 * H]),
      happy: lens([-1.0 * W, 0.35 * H], [0, -0.5 * H], [1.15 * W, 0.25 * H], [0, -0.22 * H]),
    },
    lidFill: k.line,
  });
}

/** A white sclera with a black pupil that looks around, and a heavy upper lid (comics). */
function comicEye(rx: number, ry: number, paint: Painter, colour?: string): EyeSet {
  const k = faceInks(paint, colour);
  const W = rx * 1.08, H = ry * 1.15;
  const lw = Math.max(1, paint.lineWidth(2.6));
  return layered({
    rx: W, ry: H, pivot: 0.1 * H, blink: 'scale', gaze: 0.24 * W,
    open: () => [ell(0, 0, W, H, k.sclera, { stroke: k.light ? k.eye : paint.flat('ink'), 'stroke-width': lw })],
    pupil: () => [
      ell(0.08 * W, 0.12 * H, 0.44 * W, 0.52 * H, k.dot),
      det({ el: { tag: 'circle', attrs: { cx: -0.06 * W, cy: -0.08 * H, r: 0.15 * W, fill: k.shine } } }),
    ],
    lid: {
      open: lens([-1.04 * W, -0.12 * H], [0, -1.12 * H], [1.04 * W, -0.12 * H], [0, -0.9 * H]),
      shut: lens([-1.12 * W, 0.1 * H], [0, 0.32 * H], [1.12 * W, 0.1 * H], [0, 0.55 * H]),
      happy: lens([-1.08 * W, 0.32 * H], [0, -0.58 * H], [1.08 * W, 0.32 * H], [0, -0.26 * H]),
    },
    lidFill: k.light ? k.eye : paint.flat('ink'),
  });
}

/** Rubber-hose pie eyes: tall white ovals, black pupils with a wedge cut out. */
function pieEye(rx: number, ry: number, paint: Painter, colour?: string): EyeSet {
  const k = faceInks(paint, colour);
  const W = rx * 1.0, H = ry * 1.42;
  const ink = paint.flat('ink');
  const lw = Math.max(1, paint.lineWidth(2.4));
  const cx = 0.1 * W, cy = 0.2 * H, pw = 0.6 * W, ph = 0.66 * H;
  return layered({
    rx: W, ry: H, pivot: 0.2 * H, blink: 'scale', gaze: 0.16 * W,
    open: () => [ell(0, 0, W, H, k.sclera, { stroke: k.light ? k.eye : ink, 'stroke-width': lw })],
    pupil: () => [{
      kind: 'detail', clip: [cx, cy, pw, ph], clipped: [
        ell(cx, cy, pw, ph, k.dot),
        det({ d: `M${cx + 0.08 * W} ${cy - 0.12 * H}L${cx + pw * 1.1} ${cy - ph * 0.62}L${cx + pw * 0.45} ${cy - ph * 1.1}Z`, fill: k.sclera }),
      ],
    }],
    lid: {
      open: nothing(0.2 * H, W),
      shut: lens([-1.12 * W, 0.16 * H], [0, 0.34 * H], [1.12 * W, 0.16 * H], [0, 0.62 * H]),
      happy: lens([-1.1 * W, 0.36 * H], [0, -0.6 * H], [1.1 * W, 0.36 * H], [0, -0.22 * H]),
    },
    lidFill: k.light ? k.eye : ink,
  });
}

/** Small glossy beads (clay puppets). */
function beadEye(rx: number, ry: number, paint: Painter, colour?: string): EyeSet {
  const k = faceInks(paint, colour);
  const R = Math.min(rx, ry) * 0.8;
  return layered({
    rx: R, ry: R, pivot: 0, blink: 'scale',
    open: () => [
      det({ el: { tag: 'circle', attrs: { r: R, fill: k.eye } } }),
      det({ el: { tag: 'circle', attrs: { cx: -0.32 * R, cy: -0.36 * R, r: 0.34 * R, fill: k.shine } } }),
      det({ el: { tag: 'circle', attrs: { cx: 0.38 * R, cy: 0.32 * R, r: 0.13 * R, fill: k.shine, opacity: 0.8 } } }),
    ],
    lid: {
      open: nothing(0, R),
      shut: lens([-1.25 * R, 0], [0, 0.28 * R], [1.25 * R, 0], [0, 0.66 * R]),
      happy: lens([-1.2 * R, 0.35 * R], [0, -0.62 * R], [1.2 * R, 0.35 * R], [0, -0.12 * R]),
    },
    lidFill: k.eye,
  });
}

/** A perfect circle, a bar when shut and a half disc when happy (geometric, Bauhaus). */
function dotEye(rx: number, ry: number, paint: Painter, colour?: string): EyeSet {
  const k = faceInks(paint, colour);
  const R = Math.min(rx, ry) * 0.9;
  return layered({
    rx: R, ry: R, pivot: 0, blink: 'cut',
    open: () => [det({ el: { tag: 'circle', attrs: { r: R, fill: k.eye } } })],
    lid: {
      open: nothing(0, R),
      shut: lens([-1.1 * R, 0], [0, -0.3 * R], [1.1 * R, 0], [0, 0.3 * R]),
      happy: lens([-R, 0.25 * R], [0, -1.1 * R], [R, 0.25 * R], [0, 0.25 * R]),
    },
    lidFill: k.eye,
  });
}

/** Pixel-art eyes: 2 × 3 blocks of 4 px with a one-block shine; shut and happy are block rows. */
function pixelEye(_rx: number, _ry: number, paint: Painter, colour?: string): EyeSet {
  const k = faceInks(paint, colour);
  // One pixel block (the Pixel style's filter block). The filter keeps one sample per block, so every
  // piece is at least 2 × 2 blocks: it survives any tilt, when the blocks fall off the grid.
  const u = 3;
  const z = [0, 0, 0, 0] as const;
  return layered({
    rx: u, ry: 2 * u, pivot: 0, blink: 'cut',
    open: () => [
      det({ d: d(rects([[-u, -2 * u, u, 2 * u]])), fill: k.eye }),
      det({ d: d(rects([[-u, -2 * u, 0, -u]])), fill: k.shine }),
    ],
    lid: {
      open: rects([z, z, z]),
      shut: rects([[-3 * u, -u, -u, u], [-u, -u, u, u], [u, -u, 3 * u, u]]),
      happy: rects([[-3 * u, -0.5 * u, -u, 1.5 * u], [-u, -1.5 * u, u, 0.5 * u], [u, -0.5 * u, 3 * u, 1.5 * u]]),
    },
    lidFill: k.eye,
  });
}

export const eyeModels: Record<string, EyeModel> = {
  default: {
    id: 'default',
    make(rx, ry, paint, colour) {
      const e = eyePoses(rx, ry);
      return { rx, ry, part: (side, at) => eyePart(side, at, e, paint, colour), render: (rig, p) => renderEyes(rig, p, e) };
    },
  },
  anime: { id: 'anime', make: (rx, ry, paint, c) => animeEye(rx, ry, paint, c, false) },
  manga: { id: 'manga', make: (rx, ry, paint, c) => animeEye(rx, ry, paint, c, true) },
  'almond-80s': { id: 'almond-80s', make: almondEye },
  comic: { id: 'comic', make: comicEye },
  pie: { id: 'pie', make: pieEye },
  bead: { id: 'bead', make: beadEye },
  pixel: { id: 'pixel', make: pixelEye },
  dot: { id: 'dot', make: dotEye },
};

/** An eye model by id (unknown ids fall back to the default eye). */
export const eyeModel = (id: string): EyeModel => eyeModels[id] ?? eyeModels.default;
