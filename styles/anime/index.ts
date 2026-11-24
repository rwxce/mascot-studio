// Anime: Modern TV anime: flat cel colour, one hard shadow, a thin coloured line, big eyes.
// See STYLE.md (generated from style.json by scripts/style-docs.mjs).
import { darken, mix, saturate } from '../../kit/color.js';
import type { Style } from '../../kit/style.js';
import { isArea, makePainter, mapPalette, stages } from '../../kit/stylekit.js';
import meta from './style.json';

/** One hard-edged shadow across the lower right of an area: two flat tones, no blend. */
const cel = (id: string, c: string, shade: string, at = 0.6) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="${at}" stop-color="${c}"/><stop offset="${at}" stop-color="${shade}"/></linearGradient>`;

export const anime: Style = {
  ...(meta as Omit<Style, 'painter'>),
  painter: (palette, uid) => makePainter(palette, uid, {
    palette: (P) => mapPalette(P, (c, r) => (isArea(r) ? saturate(c, 0.12) : c)),
    fill: (role, P, book) => (isArea(role) ? book.use(`cel-${role}`, (id) => cel(id, P[role], mix(darken(P[role], 0.22), '#5A3FD0', 0.14))) : P[role]),
    outline: (w, P) => ({ color: mix(darken(P.body, 0.6), '#3A1E5C', 0.3), width: 2.3 * w }),
    lineWidth: (w) => w * 0.45,
    shine: true,
    cheekRest: 0.4,
    shadow: 'rgba(60,70,140,.16)',
    stage: (book) => stages.glow(book, '#FFFFFF', 0.85),
  }),
};
