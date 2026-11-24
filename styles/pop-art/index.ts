// Pop Art: A 1960s pop canvas: giant Ben-Day dots, flat primaries, a thick black line and a white
// speech burst on cyan. See STYLE.md (generated from style.json by scripts/style-docs.mjs).
import type { Style } from '../../kit/style.js';
import { det, isArea, makePainter, mapPalette, nearest } from '../../kit/stylekit.js';
import { box, f1, rnd } from '../paint.js';
import meta from './style.json';

const RED = '#E4002B', YEL = '#FFD100', BLUE = '#0057B8', PINK = '#FF8FB0', GREEN = '#00A651', WHITE = '#FFFFFF', BLACK = '#111111', CYAN = '#00B5E2';

export const popArt: Style = {
  ...(meta as Omit<Style, 'painter'>),
  painter: (palette, uid) => makePainter(palette, uid, {
    palette: (P) => mapPalette(P, (c, r) => (r === 'eye' || r === 'ink' || r === 'line' ? BLACK : r === 'shine' ? WHITE : r === 'cheek' ? RED : nearest(c, [RED, YEL, BLUE, PINK, GREEN, WHITE]))),
    fill: (role, P, book) => (role === 'body' && P.body !== WHITE
      ? book.use(`bd-${P.body}`, (id) => `<pattern id="${id}" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="${WHITE}"/><circle cx="4" cy="4" r="2.9" fill="${P.body}"/><circle cx="0" cy="0" r="1.2" fill="${P.body}"/><circle cx="8" cy="0" r="1.2" fill="${P.body}"/><circle cx="0" cy="8" r="1.2" fill="${P.body}"/><circle cx="8" cy="8" r="1.2" fill="${P.body}"/></pattern>`)
      : P[role]),
    flat: (role, P) => (role === 'ink' ? BLACK : P[role]),
    outline: (w) => ({ color: BLACK, width: 4.6 * w }),
    keepLightEyes: true,
    shine: true,
    shadow: 'rgba(17,17,17,.28)',
    stage: () => (at, r) => {
      let d = '';
      const n = 18;
      for (let i = 0; i <= n * 2; i++) {
        const a = (i / (n * 2)) * Math.PI * 2 - Math.PI / 2;
        const k = i % 2 ? 0.66 + rnd(i, 61) * 0.06 : 0.86 + rnd(i, 62) * 0.16;
        d += `${i ? 'L' : 'M'}${f1(Math.cos(a) * k * r * 1.08)} ${f1(Math.sin(a) * k * r * 0.92)}`;
      }
      return [{
        at, shapes: [
          box(-0.98 * r, -0.98 * r, 1.96 * r, 1.96 * r, { fill: CYAN, stroke: BLACK, 'stroke-width': 4 }),
          det({ d: d + 'Z', fill: WHITE, stroke: BLACK, width: 4 }),
        ],
      }];
    },
  }),
};
