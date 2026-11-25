// Circuit Board: A chip on a green PCB: black epoxy body edged in tin, copper traces and pads all
// round, LED eyes. See STYLE.md (generated from style.json by scripts/style-docs.mjs).
import type { Style } from '../../kit/style.js';
import { makePainter } from '../../kit/stylekit.js';
import { dot, f1, path, rnd } from '../paint.js';
import meta from './style.json';

const COPPER = '#D08A3E', TIN = '#C8CCD0', CHIP = '#1E2022', DIE = '#3A3E42', PCB = '#0E5A32', LED = '#FFB13B', RED = '#FF4A3D', SILK = '#EDEDE4';

export const circuitBoard: Style = {
  ...(meta as Omit<Style, 'painter'>),
  painter: (palette, uid) => makePainter(palette, uid, {
    palette: (P) => ({ ...P, body: CHIP, 'body-dark': '#2A2D30', belly: DIE, inside: '#111214', visor: '#111214', accent: TIN, prop: RED, glow: LED, eye: LED, shine: '#FFF4D6', ink: SILK, line: SILK, cheek: RED }),
    fill: (role, P, book) => (role === 'body'
      ? book.use('chip', (id) => `<pattern id="${id}" width="5" height="5" patternUnits="userSpaceOnUse"><rect width="5" height="5" fill="${CHIP}"/><circle cx="2.5" cy="2.5" r=".45" fill="#33373B"/></pattern>`)
      : P[role]),
    flat: (role, P) => (role === 'body-dark' ? COPPER : P[role]),
    keepLightEyes: false,
    shine: true,
    look: () => ({ edge: { color: TIN, width: 1.2 } }),
    shadow: 'rgba(0,0,0,.3)',
    stage: () => (at, r) => {
      let d = '';
      const pads: ReturnType<typeof dot>[] = [];
      for (let i = 0; i < 14; i++) {
        const a = (i / 14) * Math.PI * 2 + 0.2;
        const r0 = 0.62 * r, r1 = (0.86 + rnd(i, 81) * 0.1) * r;
        const x0 = Math.cos(a) * r0, y0 = Math.sin(a) * r0;
        // out radially, then a 45° dog-leg, then straight on: how a router lays traces
        const xm = Math.cos(a) * (r0 + 0.12 * r), ym = Math.sin(a) * (r0 + 0.12 * r);
        const s = rnd(i, 82) > 0.5 ? 1 : -1, j = 0.1 * r;
        const x1 = Math.abs(Math.cos(a)) > Math.abs(Math.sin(a)) ? xm + Math.sign(Math.cos(a)) * j : xm + s * j;
        const y1 = Math.abs(Math.cos(a)) > Math.abs(Math.sin(a)) ? ym + s * j : ym + Math.sign(Math.sin(a)) * j;
        const x2 = Math.abs(Math.cos(a)) > Math.abs(Math.sin(a)) ? Math.sign(Math.cos(a)) * r1 : x1;
        const y2 = Math.abs(Math.cos(a)) > Math.abs(Math.sin(a)) ? y1 : Math.sign(Math.sin(a)) * r1;
        d += `M${f1(x0)} ${f1(y0)}L${f1(xm)} ${f1(ym)}L${f1(x1)} ${f1(y1)}L${f1(x2)} ${f1(y2)}`;
        pads.push(dot(x2, y2, 3.2, COPPER), dot(x2, y2, 1.2, PCB));
      }
      for (let i = 0; i < 6; i++) pads.push(dot((rnd(i, 83) - 0.5) * 1.8 * r, (rnd(i, 84) - 0.5) * 1.8 * r, 1.8, 'none'), dot((rnd(i, 83) - 0.5) * 1.8 * r, (rnd(i, 84) - 0.5) * 1.8 * r, 1, TIN, 0.7));
      return [{
        at, shapes: [
          path(d, { stroke: COPPER, 'stroke-width': 2.2, 'stroke-linejoin': 'round', opacity: 0.9 }),
          ...pads,
          path(`M${f1(-0.97 * r)} ${f1(-0.97 * r)}L${f1(-0.8 * r)} ${f1(-0.97 * r)}M${f1(-0.97 * r)} ${f1(-0.97 * r)}L${f1(-0.97 * r)} ${f1(-0.8 * r)}`, { stroke: SILK, 'stroke-width': 1, opacity: 0.6 }),
        ],
      }];
    },
  }),
};
