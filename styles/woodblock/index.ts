// Woodblock: A woodblock print: muted flat colours with wood grain, a fine dark key line.
// See STYLE.md (generated from style.json by scripts/style-docs.mjs).
import { darken } from '../../kit/color.js';
import type { Style } from '../../kit/style.js';
import { det, isArea, makePainter, mapPalette, muted, pat } from '../../kit/stylekit.js';
import meta from './style.json';

export const woodblock: Style = {
  ...(meta as Omit<Style, 'painter'>),
  painter: (palette, uid) => makePainter(palette, uid, {
    palette: (P) => mapPalette(P, (c, r) => (r === 'eye' || r === 'ink' || r === 'line' ? '#2B2420' : r === 'shine' ? c : muted(c))),
    fill: (role, P, book) => (isArea(role) ? book.use(`wood-${role}`, (id) => pat.wood(id, P[role], darken(P[role], 0.35))) : P[role]),
    outline: () => ({ color: '#2B2420', width: 2.2 }),
    overlay: (book) => (box) => [{ shapes: [det({ el: { tag: 'rect', attrs: { x: box[0], y: box[1], width: box[2], height: box[3], fill: book.use('grain', (id) => pat.grain(id, '#5A4A3A', 24, 22, 0.15)) } } })] }],
  }),
};

