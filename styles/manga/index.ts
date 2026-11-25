// Manga: Black ink, white paper and screentone dots, with focus lines behind.
// See STYLE.md (generated from style.json by scripts/style-docs.mjs).
import { grey } from '../../kit/color.js';
import type { Style } from '../../kit/style.js';
import { det, isArea, makePainter, pat } from '../../kit/stylekit.js';
import meta from './style.json';

const INK = '#111111', PAPER = '#FFFFFF';

export const manga: Style = {
  ...(meta as Omit<Style, 'painter'>),
  painter: (palette, uid) => makePainter(palette, uid, {
    // Screentone: darker colours get bigger dots; very light areas stay paper white.
    fill: (role, P, book) => {
      if (!isArea(role)) return role === 'shine' ? PAPER : INK;
      const g = grey(P[role]) / 255;
      if (g > 0.86) return PAPER;
      if (g < 0.12) return INK;
      const r = +(0.35 + (1 - g) * 1.25).toFixed(2);
      return book.use(`tone-${r}`, (id) => pat.halftone(id, PAPER, INK, 3.6, r, 45));
    },
    flat: (role, P) => (role === 'shine' ? PAPER : role === 'cheek' ? '#555555' : isArea(role) && grey(P[role]) > 150 ? PAPER : INK),
    outline: (w) => ({ color: INK, width: 2.4 * w }),
    keepLightEyes: true,
    shine: true,
    shadow: 'rgba(0,0,0,.16)',
    stage: () => (at, r) => {
      let d = '';
      for (let i = 0; i < 56; i++) {
        const a = (i / 56) * Math.PI * 2 + ((i * 7) % 5) * 0.01;
        const r0 = r * (0.62 + ((i * 13) % 7) * 0.035);
        d += `M${(Math.cos(a) * r0).toFixed(1)} ${(Math.sin(a) * r0).toFixed(1)}L${(Math.cos(a) * r * 1.25).toFixed(1)} ${(Math.sin(a) * r * 1.25).toFixed(1)}`;
      }
      return [{ at, shapes: [det({ d, stroke: INK, width: 0.9, opacity: 0.75 })] }];
    },
  }),
};
