// Synthwave: Pink-to-purple gradients, a cyan neon edge, scanlines, a striped sun and a grid.
// See STYLE.md (generated from style.json by scripts/style-docs.mjs).
import { mix } from '../../kit/color.js';
import type { Style } from '../../kit/style.js';
import { det, isArea, makePainter, pat, stages } from '../../kit/stylekit.js';
import meta from './style.json';

export const synthwave: Style = {
  ...(meta as Omit<Style, 'painter'>),
  painter: (palette, uid) => makePainter(palette, uid, {
    fill: (role, P, book) => (isArea(role) ? book.use(`sw-${role}`, (id) => pat.vertical(id, mix(P[role], '#FF4FD8', 0.45), mix(P[role], '#3B1D8F', 0.5))) : P[role]),
    flat: (role, P) => (role === 'ink' ? '#F3F0FF' : P[role]),
    outline: (w) => ({ color: '#5CF2FF', width: 1.6 * w }),
    look: () => ({ hollow: true }),
    shine: true,
    shadow: 'rgba(0,0,0,.4)',
    stage: (book) => stages.sunGrid(book),
    overlay: (book) => (box) => [{ shapes: [det({ el: { tag: 'rect', attrs: { x: box[0], y: box[1], width: box[2], height: box[3], fill: book.use('scan', (id) => pat.scanlines(id, '#000000')) } } })] }],
  }),
};

