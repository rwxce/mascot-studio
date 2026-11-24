// Pencil: Graphite on paper: hatched shading, a soft boiling line, on twos.
// See STYLE.md (generated from style.json by scripts/style-docs.mjs).
import { grey, mix, rgbToHex } from '../../kit/color.js';
import type { Style } from '../../kit/style.js';
import { det, isArea, makePainter, mapPalette, pat } from '../../kit/stylekit.js';
import meta from './style.json';

export const pencil: Style = {
  ...(meta as Omit<Style, 'painter'>),
  painter: (palette, uid) => makePainter(palette, uid, {
    palette: (P) => mapPalette(P, (c, r) => (r === 'shine' ? c : r === 'cheek' ? '#E7A8A2' : (() => { const g = Math.round(grey(c)); return rgbToHex([g, g, g]); })())),
    fill: (role, P, book) => (isArea(role) ? book.use(`hatch-${role}`, (id) => pat.hatch(id, mix(P[role], '#F5F1E8', 0.8), mix(P[role], '#3A3A3A', 0.4), 3.2, 45, 0.7)) : P[role]),
    flat: (role, P) => (role === 'eye' || role === 'ink' ? '#2A2A2A' : P[role]),
    look: () => ({ edge: { color: '#3A3A3A', width: 1.5, opacity: 0.9 } }),
    boil: 0.9,
    step: 83,
    overlay: (book) => (box) => [{ shapes: [det({ el: { tag: 'rect', attrs: { x: box[0], y: box[1], width: box[2], height: box[3], fill: book.use('grain', (id) => pat.grain(id, '#4A4A4A', 30, 24, 0.22)) } } })] }],
  }),
};

