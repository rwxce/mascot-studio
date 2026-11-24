// Screenprint: Flat posterised colours with an accent plate printed off register.
// See STYLE.md (generated from style.json by scripts/style-docs.mjs).
import type { Style } from '../../kit/style.js';
import { det, makePainter, mapPalette, pat, posterize } from '../../kit/stylekit.js';
import meta from './style.json';

export const screenprint: Style = {
  ...(meta as Omit<Style, 'painter'>),
  painter: (palette, uid) => makePainter(palette, uid, {
    palette: (P) => mapPalette(P, (c, r) => (r === 'shine' ? c : posterize(c, 3))),
    look: (P) => ({ drop: { dx: -2.5, dy: 2, color: P.accent, opacity: 0.6 } }),
    overlay: (book) => (box) => [{ shapes: [det({ el: { tag: 'rect', attrs: { x: box[0], y: box[1], width: box[2], height: box[3], fill: book.use('grain', (id) => pat.grain(id, '#333333', 20, 20, 0.12)) } } })] }],
  }),
};

