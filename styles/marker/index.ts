// Marker: Felt-tip marker on a whiteboard: a thick contour, streaky fills in four marker colours,
// ghosts of erased drawings. See STYLE.md (generated from style.json by scripts/style-docs.mjs).
import { mix } from '../../kit/color.js';
import type { Style } from '../../kit/style.js';
import { isArea, makePainter, mapPalette, nearest } from '../../kit/stylekit.js';
import { box, f1, path } from '../paint.js';
import meta from './style.json';

const BLACK = '#232323', BLUE = '#1F5FBF', RED = '#D7263D', GREEN = '#2A9D4B', BOARD = '#F7F8F6';

const streaks = (id: string, c: string) =>
  `<pattern id="${id}" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)"><rect width="12" height="12" fill="${mix(c, BOARD, 0.75)}"/><line x1="3" y1="0" x2="3" y2="12" stroke="${c}" stroke-width="6.6" opacity=".82"/><line x1="9.2" y1="0" x2="9.2" y2="12" stroke="${c}" stroke-width="6.6" opacity=".82"/></pattern>`;

export const marker: Style = {
  ...(meta as Omit<Style, 'painter'>),
  painter: (palette, uid) => makePainter(palette, uid, {
    palette: (P) => mapPalette(P, (c, r) => (r === 'eye' || r === 'ink' || r === 'line' ? BLACK : r === 'shine' ? BOARD : r === 'cheek' ? RED : nearest(c, [BLUE, RED, GREEN, BOARD]))),
    fill: (role, P, book) => (isArea(role) && P[role] !== BOARD && P[role] !== BLACK ? book.use(`mk-${P[role]}`, (id) => streaks(id, P[role])) : P[role]),
    outline: (w) => ({ color: BLACK, width: 3.4 * w }),
    lineWidth: (w) => w * 0.9,
    boil: 0.7,
    step: 83,
    shadow: 'rgba(35,35,35,.08)',
    stage: () => (at, r) => {
      const p = (x: number, y: number) => `${f1(x * r)} ${f1(y * r)}`;
      return [{
        at, shapes: [
          box(-1.02 * r, -1.02 * r, 2.04 * r, 2.04 * r, { rx: 4, fill: 'none', stroke: '#AEB5BB', 'stroke-width': 7 }),
          box(-0.6 * r, 0.98 * r, 1.2 * r, 0.06 * r, { rx: 2, fill: '#8E969C' }),
          path(`M${p(-0.95, -0.7)}C${p(-0.8, -0.9)} ${p(-0.55, -0.5)} ${p(-0.4, -0.78)}M${p(0.5, 0.75)}L${p(0.95, 0.62)}M${p(0.55, 0.85)}L${p(0.9, 0.78)}`, { stroke: '#C9CDD0', 'stroke-width': 5, 'stroke-linecap': 'round', opacity: 0.4 }),
          path(`M${p(0.55, -0.85)}C${p(0.75, -0.95)} ${p(0.95, -0.75)} ${p(0.8, -0.6)}C${p(0.7, -0.5)} ${p(0.55, -0.65)} ${p(0.62, -0.75)}`, { stroke: '#BFD0E6', 'stroke-width': 4, 'stroke-linecap': 'round', opacity: 0.4 }),
        ],
      }];
    },
  }),
};
