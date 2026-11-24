// Watercolor: Pale washes that bleed past their edges, a faint darker rim, paper grain.
// See STYLE.md (generated from style.json by scripts/style-docs.mjs).
import { darken, mix } from '../../kit/color.js';
import type { Style } from '../../kit/style.js';
import { det, isArea, makePainter, mapPalette, pat } from '../../kit/stylekit.js';
import meta from './style.json';

export const watercolor: Style = {
  ...(meta as Omit<Style, 'painter'>),
  painter: (palette, uid) => makePainter(palette, uid, {
    palette: (P) => mapPalette(P, (c, r) => (isArea(r) ? mix(c, '#ffffff', 0.35) : c)),
    look: (P) => ({ edge: { color: darken(P.body, 0.15), width: 1.2, opacity: 0.5 }, drop: { dx: 2.5, dy: 2, color: P.body, opacity: 0.25 } }),
    boil: 0.4,
    cheekRest: 0.3,
    overlay: (book) => (box) => [{ shapes: [det({ el: { tag: 'rect', attrs: { x: box[0], y: box[1], width: box[2], height: box[3], fill: book.use('grain', (id) => pat.grain(id, '#8A7A66', 22, 20, 0.2)) } } })] }],
  }),
};

