// Papercut: Layers of cut paper casting shadows on each other, stop-motion.
// See STYLE.md (generated from style.json by scripts/style-docs.mjs).
import { mix } from '../../kit/color.js';
import type { Style } from '../../kit/style.js';
import { det, isArea, makePainter, mapPalette, pat } from '../../kit/stylekit.js';
import meta from './style.json';

export const papercut: Style = {
  ...(meta as Omit<Style, 'painter'>),
  painter: (palette, uid) => makePainter(palette, uid, {
    palette: (P) => mapPalette(P, (c, r) => (isArea(r) ? mix(c, '#F6D7B0', 0.12) : c)),
    look: () => ({ drop: { dx: 2.5, dy: 3.5, color: '#000000', opacity: 0.28 } }),
    step: 125,
    overlay: (book) => (box) => [{ shapes: [det({ el: { tag: 'rect', attrs: { x: box[0], y: box[1], width: box[2], height: box[3], fill: book.use('grain', (id) => pat.grain(id, '#6A5240', 20, 18, 0.14)) } } })] }],
  }),
};

