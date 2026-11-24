// Stained Glass: Jewel-coloured glass in heavy lead came, glowing from behind.
// See STYLE.md (generated from style.json by scripts/style-docs.mjs).
import { saturate } from '../../kit/color.js';
import type { Style } from '../../kit/style.js';
import { isArea, makePainter, mapPalette, pat, stages } from '../../kit/stylekit.js';
import meta from './style.json';

export const stainedGlass: Style = {
  ...(meta as Omit<Style, 'painter'>),
  painter: (palette, uid) => makePainter(palette, uid, {
    palette: (P) => mapPalette(P, (c, r) => (r === 'eye' || r === 'ink' || r === 'line' ? '#1F1A24' : isArea(r) ? saturate(c, 0.35) : c)),
    fill: (role, P, book) => (isArea(role) ? book.use(`jewel-${role}`, (id) => pat.radial(id, P[role], 0.55, 0.3)) : P[role]),
    flat: (role, P) => (role === 'ink' ? '#F3F0FF' : P[role]),
    outline: (w) => ({ color: '#1F1A24', width: 3.2 * w }),
    shadow: 'rgba(0,0,0,.4)',
    stage: (book) => stages.glow(book, '#FFF4C2', 0.35),
  }),
};

