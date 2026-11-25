// Art Deco: Gold on black: a symmetric sunburst fan, stepped arcs, pinstripes and metallic edges.
// See STYLE.md (generated from style.json by scripts/style-docs.mjs).
import type { Style } from '../../kit/style.js';
import { makePainter } from '../../kit/stylekit.js';
import { f1, path } from '../paint.js';
import meta from './style.json';

const GOLD = '#D4AF37', PALE = '#F1D98A', BLACK = '#141416', DEEP = '#0B0B0D', CREAM = '#F3E9D2', EMERALD = '#0E5C4F';

const metal = (id: string) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${PALE}"/><stop offset=".4" stop-color="${GOLD}"/><stop offset=".6" stop-color="#8A6A1E"/><stop offset="1" stop-color="${GOLD}"/></linearGradient>`;

export const artDeco: Style = {
  ...(meta as Omit<Style, 'painter'>),
  painter: (palette, uid) => makePainter(palette, uid, {
    palette: (P) => ({ ...P, body: BLACK, 'body-dark': DEEP, belly: CREAM, accent: GOLD, prop: GOLD, glow: GOLD, visor: DEEP, inside: EMERALD, eye: PALE, shine: CREAM, ink: GOLD, line: GOLD, cheek: '#B8863B' }),
    fill: (role, P, book) => (role === 'body'
      ? book.use('pin', (id) => `<pattern id="${id}" width="5" height="5" patternUnits="userSpaceOnUse"><rect width="5" height="5" fill="${BLACK}"/><line x1="2.5" y1="0" x2="2.5" y2="5" stroke="${GOLD}" stroke-width=".45" opacity=".6"/></pattern>`)
      : role === 'accent' || role === 'prop' ? book.use('metal', metal) : P[role]),
    flat: (role, P) => (role === 'body-dark' ? GOLD : P[role]),
    keepLightEyes: false,
    look: () => ({ edge: { color: GOLD, width: 1.4 } }),
    shadow: 'rgba(212,175,55,.16)',
    stage: () => (at, r) => {
      const cy = 0.82 * r;
      let rays = '';
      for (let i = 0; i <= 20; i++) {
        const a = Math.PI + (i / 20) * Math.PI;
        rays += `M${f1(Math.cos(a) * 0.32 * r)} ${f1(cy + Math.sin(a) * 0.32 * r)}L${f1(Math.cos(a) * 1.3 * r)} ${f1(cy + Math.sin(a) * 1.3 * r)}`;
      }
      const arc = (k: number) => `M${f1(-k * r)} ${f1(cy)}A${f1(k * r)} ${f1(k * r)} 0 0 1 ${f1(k * r)} ${f1(cy)}`;
      let bars = '';
      for (const s of [-1, 1]) for (const [k, top] of [[0.96, -0.6], [1.04, -0.8], [1.12, -1]] as const) bars += `M${f1(s * k * r)} ${f1(top * r)}L${f1(s * k * r)} ${f1(1.1 * r)}`;
      return [{
        at, shapes: [
          path(rays, { stroke: GOLD, 'stroke-width': 0.9, opacity: 0.45 }),
          path(arc(0.5) + arc(0.66) + arc(0.82), { stroke: GOLD, 'stroke-width': 1.6, opacity: 0.85 }),
          path(arc(0.32), { fill: GOLD, opacity: 0.9 }),
          path(bars, { stroke: GOLD, 'stroke-width': 1.2, opacity: 0.7 }),
        ],
      }];
    },
  }),
};
