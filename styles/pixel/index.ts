// Pixel: Big pixels, a limited palette and motion that steps at 8 fps.
// See STYLE.md (generated from style.json by scripts/style-docs.mjs).
import type { Style } from '../../kit/style.js';
import { makePainter, mapPalette, pixelateFilter, posterize } from '../../kit/stylekit.js';
import meta from './style.json';

export const pixel: Style = {
  ...(meta as Omit<Style, 'painter'>),
  painter: (palette, uid) => makePainter(palette, uid, {
    palette: (P) => mapPalette(P, (c, r) => (r === 'shine' ? c : posterize(c, 4))),
    flat: (role, P) => (role === 'ink' ? '#F3F0FF' : P[role]),
    outline: (w) => ({ color: '#0E0C1A', width: 3 * w }),
    shine: true,
    shadow: 'rgba(0,0,0,.4)',
    step: 125,
    filter: (book) => book.use('px', (id) => pixelateFilter(id, 4)),
  }),
};

