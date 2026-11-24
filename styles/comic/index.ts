// Comic: Bold ink line, Ben-Day dots and a sunburst behind, like a comic panel.
// See STYLE.md (generated from style.json by scripts/style-docs.mjs).
import { darken, saturate } from '../../kit/color.js';
import type { Style } from '../../kit/style.js';
import { isArea, makePainter, mapPalette, pat, stages } from '../../kit/stylekit.js';
import meta from './style.json';

export const comic: Style = {
  ...(meta as Omit<Style, 'painter'>),
  painter: (palette, uid) => makePainter(palette, uid, {
    palette: (P) => mapPalette(P, (c, r) => (isArea(r) ? saturate(c, 0.25) : c)),
    fill: (role, P, book) => (isArea(role) ? book.use(`bd-${role}`, (id) => pat.halftone(id, P[role], darken(P[role], 0.22), 5, 1.2, 45)) : P[role]),
    outline: (w, P) => ({ color: '#111111', width: 4 * w }),
    shine: true,
    stage: () => stages.burst('#FFE45E'),
  }),
};

