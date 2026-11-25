// Ink Wash: Chinese ink wash: grey ink pooling at the edges, a dry-brush contour, empty paper and
// a red seal. See STYLE.md (generated from style.json by scripts/style-docs.mjs).
import { darken, grey, lighten, rgbToHex } from '../../kit/color.js';
import type { Style } from '../../kit/style.js';
import { det, isArea, makePainter, mapPalette, pat } from '../../kit/stylekit.js';
import { box, cover, f1, path } from '../paint.js';
import meta from './style.json';

const SUMI = '#161514', SEAL = '#B8282B';
/** The colour's lightness, as a grey of diluted ink. */
const tone = (c: string) => { const v = Math.round(48 + (grey(c) / 255) * 170); return rgbToHex([v, v, v - 4]); };

export const inkWash: Style = {
  ...(meta as Omit<Style, 'painter'>),
  painter: (palette, uid) => makePainter(palette, uid, {
    palette: (P) => mapPalette(P, (c, r) => (r === 'eye' || r === 'ink' || r === 'line' ? SUMI : r === 'shine' ? '#F7F4EC' : r === 'cheek' ? '#C9837A' : tone(c))),
    fill: (role, P, book) => (isArea(role) ? book.use(`wash-${role}`, (id) => `<radialGradient id="${id}" cx=".45" cy=".4" r=".7"><stop offset="0" stop-color="${lighten(P[role], 0.4)}"/><stop offset=".72" stop-color="${P[role]}"/><stop offset="1" stop-color="${darken(P[role], 0.28)}"/></radialGradient>`) : P[role]),
    outline: (w) => ({ color: SUMI, width: 3 * w }),
    lineWidth: (w) => w * 0.75,
    look: () => ({ outlineOpacity: 0.82, drop: { dx: 3.2, dy: 2.2, color: '#77736C', opacity: 0.22 } }),
    boil: 0.5,
    shadow: 'rgba(22,21,20,.08)',
    stage: () => (at, r) => {
      const p = (x: number, y: number) => `${f1(x * r)} ${f1(y * r)}`;
      const s = 0.24 * r, x0 = 0.66 * r, y0 = 0.56 * r;
      return [{
        at, shapes: [
          det({ d: `M${p(0.1, 0.35)}Q${p(0.45, -0.55)} ${p(0.62, -0.62)}Q${p(0.8, -0.3)} ${p(1.2, 0.35)}Z`, fill: '#8F8B84', opacity: 0.16 }),
          det({ d: `M${p(0.55, 0.35)}Q${p(0.8, -0.2)} ${p(0.92, -0.25)}Q${p(1.05, 0)} ${p(1.3, 0.35)}Z`, fill: '#8F8B84', opacity: 0.12 }),
          box(x0, y0, s, s, { fill: SEAL, rx: 1.5, opacity: 0.9 }),
          path(`M${f1(x0 + s * 0.22)} ${f1(y0 + s * 0.25)}h${f1(s * 0.56)}M${f1(x0 + s * 0.5)} ${f1(y0 + s * 0.25)}v${f1(s * 0.52)}M${f1(x0 + s * 0.25)} ${f1(y0 + s * 0.55)}h${f1(s * 0.5)}M${f1(x0 + s * 0.28)} ${f1(y0 + s * 0.77)}h${f1(s * 0.44)}`, { stroke: '#F3EFE6', 'stroke-width': 1.4 }),
        ],
      }];
    },
    overlay: (book) => cover(book.use('rice', (id) => pat.grain(id, '#6E6A60', 18, 26, 0.12))),
  }),
};
