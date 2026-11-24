// Glass: Translucent tinted glass with a bright edge, over colourful blurred blobs.
// See STYLE.md (generated from style.json by scripts/style-docs.mjs).
import { mix } from '../../kit/color.js';
import type { Style } from '../../kit/style.js';
import { isArea, makePainter, mapPalette, pat, stages } from '../../kit/stylekit.js';
import meta from './style.json';

export const glass: Style = {
  ...(meta as Omit<Style, 'painter'>),
  painter: (palette, uid) => makePainter(palette, uid, {
    palette: (P) => mapPalette(P, (c, r) => (isArea(r) ? mix(c, '#7FD3FF', 0.25) : c)),
    fill: (role, P, book) => (isArea(role) ? book.use(`glass-${role}`, (id) => pat.glass(id, P[role])) : P[role]),
    flat: (role, P) => (role === 'ink' ? '#EAF2FF' : P[role]),
    outline: (w) => ({ color: '#FFFFFF', width: 1.6 * w }),
    look: () => ({ hollow: true, outlineOpacity: 0.75 }),
    shine: true,
    shadow: 'rgba(0,0,0,.3)',
    stage: () => stages.blobs(['#7AF0FF', '#B48CFF', '#FF8FD8']),
  }),
};

