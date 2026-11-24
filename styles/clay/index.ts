// Clay: Plasticine: round soft highlights, a contact shadow, stop-motion at 8 fps.
// See STYLE.md (generated from style.json by scripts/style-docs.mjs).
import type { Style } from '../../kit/style.js';
import { isArea, makePainter, pat } from '../../kit/stylekit.js';
import meta from './style.json';

export const clay: Style = {
  ...(meta as Omit<Style, 'painter'>),
  painter: (palette, uid) => makePainter(palette, uid, {
    fill: (role, P, book) => (isArea(role) ? book.use(`clay-${role}`, (id) => pat.radial(id, P[role])) : P[role]),
    look: () => ({ drop: { dx: 2, dy: 3, color: '#3A2A1A', opacity: 0.18 } }),
    shine: true,
    step: 125,
    boil: 0.35,
  }),
};

