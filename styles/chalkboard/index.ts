// Chalkboard: Chalk on a green board: dusty hatching, a light boiling line, a wooden frame.
// See STYLE.md (generated from style.json by scripts/style-docs.mjs).
import { mix } from '../../kit/color.js';
import type { Style } from '../../kit/style.js';
import { isArea, makePainter, mapPalette, pat, stages } from '../../kit/stylekit.js';
import meta from './style.json';

export const chalkboard: Style = {
  ...(meta as Omit<Style, 'painter'>),
  painter: (palette, uid) => makePainter(palette, uid, {
    palette: (P) => mapPalette(P, (c, r) => (r === 'eye' || r === 'ink' || r === 'line' ? '#F4F4EE' : mix(c, '#ffffff', 0.35))),
    fill: (role, P, book) => (isArea(role) ? book.use(`chalk-${role}`, (id) => pat.hatch(id, mix(P[role], '#2F4A3A', 0.62), P[role], 3.4, 60, 1.1)) : P[role]),
    look: () => ({ edge: { color: '#F2F2EC', width: 1.8, opacity: 0.9 } }),
    boil: 1.1,
    step: 83,
    shadow: 'rgba(0,0,0,.25)',
    stage: () => stages.board('#8B6A44'),
  }),
};

