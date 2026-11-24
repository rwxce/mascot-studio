// Knit: A knitted plush: V-stitch texture in every colour, a soft darker seam.
// See STYLE.md (generated from style.json by scripts/style-docs.mjs).
import { darken, mix } from '../../kit/color.js';
import type { Style } from '../../kit/style.js';
import { isArea, makePainter, mapPalette, pat } from '../../kit/stylekit.js';
import meta from './style.json';

export const knit: Style = {
  ...(meta as Omit<Style, 'painter'>),
  painter: (palette, uid) => makePainter(palette, uid, {
    palette: (P) => mapPalette(P, (c, r) => (isArea(r) ? mix(c, '#E8C9A0', 0.1) : c)),
    fill: (role, P, book) => (isArea(role) ? book.use(`knit-${role}`, (id) => pat.knit(id, P[role], darken(P[role], 0.2))) : P[role]),
    look: (P) => ({ edge: { color: darken(P.body, 0.3), width: 1.2, opacity: 0.55 } }),
    cheekRest: 0.3,
  }),
};

