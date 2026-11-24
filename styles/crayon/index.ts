// Crayon: Waxy crayon that spills past a wobbly dark line, on twos.
// See STYLE.md (generated from style.json by scripts/style-docs.mjs).
import { darken, lighten, saturate } from '../../kit/color.js';
import type { Style } from '../../kit/style.js';
import { isArea, makePainter, mapPalette, pat } from '../../kit/stylekit.js';
import meta from './style.json';

export const crayon: Style = {
  ...(meta as Omit<Style, 'painter'>),
  painter: (palette, uid) => makePainter(palette, uid, {
    palette: (P) => mapPalette(P, (c, r) => (isArea(r) ? saturate(c, 0.2) : c)),
    fill: (role, P, book) => (isArea(role) ? book.use(`wax-${role}`, (id) => pat.wax(id, lighten(P[role], 0.45), P[role])) : P[role]),
    look: (P) => ({ edge: { color: darken(P.body, 0.45), width: 2.2 }, drop: { dx: 2, dy: 1.5, color: P.body, opacity: 0.35 } }),
    boil: 1.2,
    step: 83,
  }),
};

