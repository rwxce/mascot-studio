// Pictogram: A public sign: one white silhouette of rounded geometric parts, knocked out of a
// green plate. See STYLE.md (generated from style.json by scripts/style-docs.mjs).
import type { Style } from '../../kit/style.js';
import { makePainter, ROLES } from '../../kit/stylekit.js';
import { box, f1 } from '../paint.js';
import meta from './style.json';

const SIGN = '#00754A', WHITE = '#FFFFFF';
const KNOCKOUT = new Set(['eye', 'ink', 'line', 'inside', 'visor-eye']);

export const pictogram: Style = {
  ...(meta as Omit<Style, 'painter'>),
  painter: (palette, uid) => makePainter(palette, uid, {
    palette: (P) => {
      const out = { ...P };
      for (const r of ROLES) out[r] = KNOCKOUT.has(r) ? SIGN : WHITE;
      out.visor = SIGN;
      out.eye = SIGN;
      return out;
    },
    keepLightEyes: false,
    shadow: 'rgba(0,0,0,0)',
    stage: () => (at, r) => [{
      at, shapes: [
        box(-0.96 * r, -0.96 * r, 1.92 * r, 1.92 * r, { rx: f1(0.2 * r), fill: SIGN }),
        box(-0.89 * r, -0.89 * r, 1.78 * r, 1.78 * r, { rx: f1(0.15 * r), fill: 'none', stroke: WHITE, 'stroke-width': 2.2 }),
      ],
    }],
  }),
};
