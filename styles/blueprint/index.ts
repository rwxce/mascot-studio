// Blueprint: White technical lines on blueprint blue over a grid.
// See STYLE.md (generated from style.json by scripts/style-docs.mjs).
import type { Style } from '../../kit/style.js';
import { isArea, makePainter, stages } from '../../kit/stylekit.js';
import meta from './style.json';

export const blueprint: Style = {
  ...(meta as Omit<Style, 'painter'>),
  painter: (palette, uid) => makePainter(palette, uid, {
    fill: (role, P) => (isArea(role) ? 'rgba(255,255,255,0.06)' : role === 'shine' || role === 'cheek' ? 'rgba(255,255,255,0.2)' : '#EAF4FF'),
    flat: (role) => (role === 'cheek' ? 'rgba(255,255,255,0.2)' : '#EAF4FF'),
    look: () => ({ edge: { color: '#EAF4FF', width: 1.2 } }),
    shadow: 'rgba(0,0,0,.18)',
    stage: (book) => stages.grid(book, 'rgba(255,255,255,.14)'),
  }),
};

