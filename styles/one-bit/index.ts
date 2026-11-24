// One-bit: Black and white only, with ordered dither for grey, like an early Mac.
// See STYLE.md (generated from style.json by scripts/style-docs.mjs).
import { grey } from '../../kit/color.js';
import type { Style } from '../../kit/style.js';
import { isArea, makePainter, pat } from '../../kit/stylekit.js';
import meta from './style.json';

export const oneBit: Style = {
  ...(meta as Omit<Style, 'painter'>),
  painter: (palette, uid) => makePainter(palette, uid, {
    fill: (role, P, book) => {
      if (!isArea(role)) return role === 'shine' ? '#F4F1E8' : '#111111';
      const level = Math.max(0, Math.min(4, Math.round(4 - (grey(P[role]) / 255) * 4)));
      return book.use(`dither-${level}`, (id) => pat.dither(id, level));
    },
    flat: (role) => (role === 'shine' || role === 'cheek' ? '#F4F1E8' : '#111111'),
    outline: (w) => ({ color: '#111111', width: 2.2 * w }),
    step: 100,
  }),
};

