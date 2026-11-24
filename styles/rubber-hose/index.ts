// Rubber Hose: A 1930s cartoon: sepia, a fat black line, film grain, on twos.
// See STYLE.md (generated from style.json by scripts/style-docs.mjs).
import type { Style } from '../../kit/style.js';
import { det, makePainter, mapPalette, pat, sepia } from '../../kit/stylekit.js';
import meta from './style.json';

export const rubberHose: Style = {
  ...(meta as Omit<Style, 'painter'>),
  painter: (palette, uid) => makePainter(palette, uid, {
    palette: (P) => mapPalette(P, (c, r) => (r === 'eye' || r === 'ink' || r === 'line' ? '#1A1410' : r === 'shine' ? '#F6EEDB' : sepia(c))),
    outline: (w) => ({ color: '#1A1410', width: 6 * w }),
    step: 83,
    overlay: (book) => (box) => [{ shapes: [det({ el: { tag: 'rect', attrs: { x: box[0], y: box[1], width: box[2], height: box[3], fill: book.use('grain', (id) => pat.grain(id, '#1A1410', 34, 26, 0.2)) } } })] }],
    frame: (t, svg) => svg.setAttribute('opacity', String(0.94 + 0.06 * Math.abs(Math.sin(t / 97)))),
  }),
};

