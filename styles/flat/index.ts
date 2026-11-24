// Flat: Solid colours, no outline, no gradient: shapes and nothing else.
// See STYLE.md (generated from style.json by scripts/style-docs.mjs).
import { mix } from '../../kit/color.js';
import type { Style } from '../../kit/style.js';
import { isArea, makePainter, mapPalette } from '../../kit/stylekit.js';
import meta from './style.json';

export const flat: Style = {
  ...(meta as Omit<Style, 'painter'>),
  painter: (palette, uid) => makePainter(palette, uid, {
    palette: (P) => mapPalette(P, (c, r) => (isArea(r) ? mix(c, '#ffffff', 0.12) : c)),
    cheekRest: 0.35,
  }),
};

