// Gilded: An illuminated manuscript: lapis, vermilion and malachite on vellum, a lozenge diaper,
// gold leaf all round. See STYLE.md (generated from style.json by scripts/style-docs.mjs).
import { grey } from '../../kit/color.js';
import type { Style } from '../../kit/style.js';
import { det, isArea, makePainter, mapPalette, nearest, pat } from '../../kit/stylekit.js';
import { box, cover, dot, f1 } from '../paint.js';
import meta from './style.json';

const LAPIS = '#1E3F8F', VERM = '#B3261E', MALA = '#2F7A4A', PALE = '#E9D8A6', GOLD = '#C9A227', VELLUM = '#F6EBCF', BROWN = '#3B2412';

const leaf = (id: string) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F6E27A"/><stop offset=".45" stop-color="${GOLD}"/><stop offset=".7" stop-color="#E9CF62"/><stop offset="1" stop-color="#8C6A12"/></linearGradient>`;
const diaper = (id: string, base: string) =>
  `<pattern id="${id}" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="9" height="9" fill="${base}"/><path d="M0 0H9M0 0V9" stroke="${GOLD}" stroke-width=".55" opacity=".85"/><circle cx="4.5" cy="4.5" r=".8" fill="${GOLD}"/></pattern>`;

export const gilded: Style = {
  ...(meta as Omit<Style, 'painter'>),
  painter: (palette, uid) => makePainter(palette, uid, {
    palette: (P) => {
      const out = mapPalette(P, (c, r) => (r === 'ink' || r === 'line' ? BROWN : r === 'shine' ? VELLUM : r === 'accent' || r === 'prop' || r === 'glow' ? GOLD : nearest(c, [LAPIS, VERM, MALA, PALE])));
      out.eye = grey(out.body) < 120 ? VELLUM : BROWN;
      out.cheek = VERM;
      return out;
    },
    fill: (role, P, book) => (!isArea(role) ? P[role] : P[role] === GOLD ? book.use('leaf', leaf) : P[role] === PALE ? PALE : book.use(`diaper-${P[role]}`, (id) => diaper(id, P[role]))),
    outline: (w) => ({ color: GOLD, width: 2.4 * w }),
    look: () => ({ edge: { color: BROWN, width: 0.9 } }),
    keepLightEyes: true,
    shadow: 'rgba(59,36,18,.18)',
    stage: (book) => (at, r) => {
      const vine: ReturnType<typeof dot>[] = [];
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        const x = Math.cos(a) * 0.78 * r, y = Math.sin(a) * 0.78 * r;
        vine.push(dot(x, y, 1.6, VELLUM, 0.85), dot(x + 3, y - 2, 1.1, VELLUM, 0.85), dot(x - 3, y - 2, 1.1, VELLUM, 0.85));
      }
      return [{
        at, shapes: [
          box(-0.98 * r, -0.98 * r, 1.96 * r, 1.96 * r, { fill: book.use('leaf', leaf), rx: 2 }),
          box(-0.86 * r, -0.86 * r, 1.72 * r, 1.72 * r, { fill: book.use('field', (id) => diaper(id, '#24356E')), stroke: BROWN, 'stroke-width': 1 }),
          det({ el: { tag: 'circle', attrs: { r: f1(0.78 * r), fill: 'none', stroke: VELLUM, 'stroke-width': 0.9, opacity: 0.5 } } }),
          ...vine,
        ],
      }];
    },
    overlay: (book) => cover(book.use('vellum', (id) => pat.grain(id, '#7A5A30', 20, 22, 0.14))),
  }),
};
