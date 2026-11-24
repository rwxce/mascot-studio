// CRT ASCII: A green phosphor terminal: the character drawn in text-mode glyphs, scanlines, a
// blinking prompt. See STYLE.md (generated from style.json by scripts/style-docs.mjs).
import { grey } from '../../kit/color.js';
import type { Style } from '../../kit/style.js';
import { isArea, makePainter } from '../../kit/stylekit.js';
import { box, covers } from '../paint.js';
import meta from './style.json';

const SCREEN = '#03130A', CELL = '#062A14', DIM = '#1E7A3C', MID = '#3FD06A', HOT = '#A8FFB4', WHITE = '#E4FFE6';

/** One 5×7 character cell: '.', '+', '#', or a full block. */
const GLYPH = [
  `<rect x="2" y="5" width="1" height="1" fill="${DIM}"/>`,
  `<rect x="2" y="1.5" width="1" height="4" fill="${MID}"/><rect x=".5" y="3" width="4" height="1" fill="${MID}"/>`,
  `<rect x="1" y="1" width="1" height="5" fill="${HOT}"/><rect x="3" y="1" width="1" height="5" fill="${HOT}"/><rect x="0" y="2" width="5" height="1" fill="${HOT}"/><rect x="0" y="4" width="5" height="1" fill="${HOT}"/>`,
  `<rect x=".5" y=".5" width="4" height="6" fill="${HOT}"/>`,
];

export const crtAscii: Style = {
  ...(meta as Omit<Style, 'painter'>),
  painter: (palette, uid) => makePainter(palette, uid, {
    fill: (role, P, book) => {
      if (!isArea(role)) return role === 'eye' ? WHITE : role === 'shine' ? SCREEN : MID;
      const level = Math.max(0, Math.min(2, Math.round((grey(P[role]) / 255) * 3) - (role === 'body' ? 1 : 0)));
      return book.use(`glyph-${level}`, (id) => `<pattern id="${id}" width="5" height="7" patternUnits="userSpaceOnUse"><rect width="5" height="7" fill="${CELL}"/>${GLYPH[level]}</pattern>`);
    },
    flat: (role) => (role === 'eye' ? WHITE : role === 'shine' ? SCREEN : role === 'cheek' ? DIM : role === 'ink' ? HOT : MID),
    keepLightEyes: false,
    look: () => ({ edge: { color: MID, width: 1.1, opacity: 0.9 } }),
    shadow: 'rgba(63,208,106,.12)',
    step: 66,
    stage: () => (at, r) => {
      const rows = [0.55, 0.3, 0.7, 0.45, 0.2, 0.6];
      return [{
        at, shapes: [
          ...rows.map((w, i) => box(-0.92 * r, (-0.92 + i * 0.09) * r, w * r, 0.045 * r, { fill: DIM, opacity: 0.45 })),
          box(-0.92 * r, 0.82 * r, 0.05 * r, 0.08 * r, { fill: MID }),
          box(-0.84 * r, 0.86 * r, 0.3 * r, 0.03 * r, { fill: DIM, opacity: 0.6 }),
        ],
      }];
    },
    overlay: (book) => covers(
      [book.use('scan', (id) => `<pattern id="${id}" width="4" height="3" patternUnits="userSpaceOnUse"><rect width="4" height="1" fill="#000000" opacity=".35"/></pattern>`)],
      [book.use('glass', (id) => `<radialGradient id="${id}" cx=".5" cy=".5" r=".75"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></radialGradient>`)],
    ),
  }),
};
