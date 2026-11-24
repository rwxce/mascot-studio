// Neon: Glass tubes of light on a dark wall: no fill, a bright core and a glow, a flicker.
// See STYLE.md (generated from style.json by scripts/style-docs.mjs).
import { lighten } from '../../kit/color.js';
import type { Style } from '../../kit/style.js';
import { isArea, makePainter } from '../../kit/stylekit.js';
import meta from './style.json';

export const neon: Style = {
  ...(meta as Omit<Style, 'painter'>),
  painter: (palette, uid) => makePainter(palette, uid, {
    fill: (role, P) => (isArea(role) ? 'none' : role === 'eye' ? lighten(P.body, 0.6) : P[role]),
    flat: (role, P) => (role === 'eye' ? lighten(P.body, 0.6) : role === 'ink' ? '#F3F0FF' : P[role]),
    outline: (w, P) => ({ color: P.body, width: 6 * w }),
    look: (P) => ({ hollow: true, outlineOpacity: 0.35, edge: { color: lighten(P.body, 0.5), width: 1.8 } }),
    shadow: 'rgba(0,0,0,0)',
    frame: (t, svg) => {
      const k = Math.floor(t / 90);
      const off = (k % 97 === 3 || k % 97 === 5) ? 0.45 : 1;
      svg.setAttribute('opacity', String(off));
    },
  }),
};

