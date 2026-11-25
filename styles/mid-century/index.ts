// Mid-century: A 1950s modern cartoon: a loose ink line with one flat colour block printed out of
// register, on textured paper. See STYLE.md (generated from style.json by scripts/style-docs.mjs).
import type { Style } from '../../kit/style.js';
import { det, isArea, makePainter, mapPalette, nearest, pat } from '../../kit/stylekit.js';
import { box, cover, f1 } from '../paint.js';
import meta from './style.json';

const INK = '#2B2724', PAPER = '#F2E8D5', MUSTARD = '#E0A526', TEAL = '#2A8C82', CORAL = '#E76F51', OLIVE = '#8A9A3B', SKY = '#9CC5C9';

export const midCentury: Style = {
  ...(meta as Omit<Style, 'painter'>),
  painter: (palette, uid) => makePainter(palette, uid, {
    palette: (P) => mapPalette(P, (c, r) => (r === 'eye' || r === 'ink' || r === 'line' ? INK : r === 'shine' ? PAPER : nearest(c, [MUSTARD, TEAL, CORAL, OLIVE, SKY]))),
    // Areas stay unfilled: the colour is the offset block below, the drawing is the line.
    fill: (role, P) => (isArea(role) ? 'none' : P[role]),
    flat: (role, P) => (role === 'body-dark' ? INK : P[role]),
    outline: (w) => ({ color: INK, width: 1.5 * w }),
    look: (P) => ({ hollow: true, drop: { dx: -3.5, dy: 3, color: P.body, opacity: 0.95 } }),
    keepLightEyes: false,
    lineWidth: (w) => w * 0.5,
    shadow: 'rgba(43,39,36,.12)',
    stage: () => (at, r) => [{
      at, shapes: [
        box(-0.92 * r, -0.75 * r, 1.1 * r, 1.25 * r, { fill: SKY, opacity: 0.55, transform: 'rotate(-6)' }),
        det({ el: { tag: 'circle', attrs: { cx: f1(0.62 * r), cy: f1(-0.55 * r), r: f1(0.16 * r), fill: MUSTARD, opacity: 0.8 } } }),
        det({ el: { tag: 'line', attrs: { x1: f1(0.72 * r), y1: f1(-0.2 * r), x2: f1(0.72 * r), y2: f1(0.8 * r), stroke: INK, 'stroke-width': 1.2 } } }),
        det({ el: { tag: 'ellipse', attrs: { cx: f1(0.72 * r), cy: f1(-0.25 * r), rx: f1(0.1 * r), ry: f1(0.2 * r), fill: OLIVE, opacity: 0.85 } } }),
      ],
    }],
    overlay: (book) => cover(book.use('grain', (id) => pat.grain(id, '#6A5A40', 30, 22, 0.18))),
  }),
};
