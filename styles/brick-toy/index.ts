// Brick Toy: Built from glossy plastic bricks: studs on every surface, toy primaries, a studded
// baseplate, stop-motion. See STYLE.md (generated from style.json by scripts/style-docs.mjs).
import { darken, lighten } from '../../kit/color.js';
import type { Style } from '../../kit/style.js';
import { isArea, makePainter, mapPalette, nearest } from '../../kit/stylekit.js';
import { box } from '../paint.js';
import meta from './style.json';

const BRICKS = ['#C91A09', '#F2CD37', '#0055BF', '#237841', '#FE8A18', '#36AEBF', '#A5CA18', '#E4CD9E', '#F4F4F4', '#1B2A34'];
const PRINT = '#1B2A34', PLATE = '#4B9F4A';

const studs = (id: string, c: string, size = 10) =>
  `<pattern id="${id}" width="${size}" height="${size}" patternUnits="userSpaceOnUse"><rect width="${size}" height="${size}" fill="${c}"/><circle cx="${size / 2 + 0.5}" cy="${size / 2 + 0.6}" r="${size * 0.31}" fill="${darken(c, 0.14)}"/><circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.3}" fill="${c}"/><path d="M${size / 2 - 2} ${size / 2 - 0.8}a2.2 2.2 0 0 1 2.6 -1.6" stroke="${lighten(c, 0.55)}" stroke-width=".8" fill="none" stroke-linecap="round" opacity=".8"/></pattern>`;

export const brickToy: Style = {
  ...(meta as Omit<Style, 'painter'>),
  painter: (palette, uid) => makePainter(palette, uid, {
    palette: (P) => mapPalette(P, (c, r) => (r === 'eye' || r === 'ink' || r === 'line' ? PRINT : r === 'shine' ? '#FFFFFF' : nearest(c, BRICKS))),
    fill: (role, P, book) => (isArea(role) ? book.use(`stud-${P[role]}`, (id) => studs(id, P[role])) : P[role]),
    look: () => ({ edge: { color: 'rgba(0,0,0,.32)', width: 1 } }),
    shine: true,
    step: 83,
    shadow: 'rgba(20,40,20,.25)',
    stage: (book) => (at, r) => [{
      at, shapes: [
        box(-1.15 * r, 0.66 * r, 2.3 * r, 0.5 * r, { fill: book.use('plate', (id) => studs(id, PLATE, 9)) }),
        box(-1.15 * r, 0.66 * r, 2.3 * r, 1.6, { fill: lighten(PLATE, 0.3) }),
      ],
    }],
  }),
};
