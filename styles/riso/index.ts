// Riso: Two-ink risograph: halftone fills in pink and blue, slightly misregistered, grainy paper.
// See STYLE.md (generated from style.json by scripts/style-docs.mjs).
import { mix } from '../../kit/color.js';
import type { Style } from '../../kit/style.js';
import { det, isArea, makePainter, mapPalette, nearest, pat } from '../../kit/stylekit.js';
import meta from './style.json';

export const riso: Style = {
  ...(meta as Omit<Style, 'painter'>),
  painter: (palette, uid) => makePainter(palette, uid, {
    palette: (P) => mapPalette(P, (c, r) => (r === 'ink' || r === 'line' ? '#1D3B6E' : r === 'eye' ? nearest(c, ['#1D3B6E', '#FFE800', '#F6F1E7']) : r === 'shine' ? c : nearest(c, ['#FF48B0', '#0078BF', '#FFE800', '#F6F1E7']))),
    fill: (role, P, book) => (isArea(role) ? book.use(`riso-${role}`, (id) => pat.halftone(id, mix(P[role], '#ffffff', 0.55), P[role], 4.5, 1.5, role === 'body' ? 15 : 75)) : P[role]),
    look: () => ({ drop: { dx: 2.2, dy: -1.6, color: '#0078BF', opacity: 0.5 } }),
    overlay: (book) => (box) => [{ shapes: [det({ el: { tag: 'rect', attrs: { x: box[0], y: box[1], width: box[2], height: box[3], fill: book.use('grain', (id) => pat.grain(id, '#1D3B6E', 30, 22, 0.16)) } } })] }],
  }),
};

