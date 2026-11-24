// Sticker: A thick white border and a hard shadow, like a die-cut sticker on a dotted page.
// See STYLE.md (generated from style.json by scripts/style-docs.mjs).
import { saturate } from '../../kit/color.js';
import type { Style } from '../../kit/style.js';
import { isArea, makePainter, mapPalette, stages } from '../../kit/stylekit.js';
import meta from './style.json';

export const sticker: Style = {
  ...(meta as Omit<Style, 'painter'>),
  painter: (palette, uid) => makePainter(palette, uid, {
    palette: (P) => mapPalette(P, (c, r) => (isArea(r) ? saturate(c, 0.15) : c)),
    outline: (w) => ({ color: '#FFFFFF', width: 7 * w }),
    look: () => ({ drop: { dx: 3, dy: 4, color: '#1B1B2E', opacity: 0.22 } }),
    shine: true,
    stage: (book) => stages.dots(book, '#CFC8F2'),
  }),
};

