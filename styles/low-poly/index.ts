// Low Poly: Faceted shading in hard diagonal bands, like a low-polygon model.
// See STYLE.md (generated from style.json by scripts/style-docs.mjs).
import { saturate } from '../../kit/color.js';
import type { Style } from '../../kit/style.js';
import { isArea, makePainter, mapPalette, pat } from '../../kit/stylekit.js';
import meta from './style.json';

export const lowPoly: Style = {
  ...(meta as Omit<Style, 'painter'>),
  painter: (palette, uid) => makePainter(palette, uid, {
    palette: (P) => mapPalette(P, (c, r) => (isArea(r) ? saturate(c, 0.1) : c)),
    fill: (role, P, book) => (isArea(role) ? book.use(`facet-${role}`, (id) => pat.facets(id, P[role])) : P[role]),
  }),
};

