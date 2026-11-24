// Silent Film: A 1920s reel: silver greys with a sepia tint, grain and scratches, a dark vignette,
// flicker, 16 fps. See STYLE.md (generated from style.json by scripts/style-docs.mjs).
import { grey, rgbToHex, type RGB } from '../../kit/color.js';
import type { Style } from '../../kit/style.js';
import { isArea, makePainter, mapPalette, pat, stages } from '../../kit/stylekit.js';
import { covers, f1, rnd } from '../paint.js';
import meta from './style.json';

const DARK = '#151210';
/** Silver grey of the same lightness, toned warm. */
const silver = (c: string) => { const v = 70 + grey(c) * 0.72; return rgbToHex([v * 0.98 + 6, v * 0.93 + 4, v * 0.8 + 2] as RGB); };

export const silentFilm: Style = {
  ...(meta as Omit<Style, 'painter'>),
  painter: (palette, uid) => makePainter(palette, uid, {
    palette: (P) => mapPalette(P, (c, r) => (r === 'eye' || r === 'ink' || r === 'line' ? DARK : r === 'shine' ? '#F2EADB' : silver(c))),
    fill: (role, P, book) => (isArea(role) ? book.use(`ag-${role}`, (id) => pat.radial(id, P[role], 0.28, 0.22)) : P[role]),
    flat: (role, P) => (role === 'ink' ? '#EDE4D2' : P[role]),
    outline: (w) => ({ color: '#2A2420', width: 1.6 * w }),
    shadow: 'rgba(21,18,16,.25)',
    step: 62.5,
    stage: (book) => stages.glow(book, '#FFF1D6', 0.3),
    overlay: (book) => covers(
      [book.use('grain', (id) => pat.grain(id, '#1A1410', 34, 24, 0.2))],
      [book.use('scratch', (id) => {
        let s = '';
        for (let i = 0; i < 3; i++) { const x = rnd(i, 71) * 90; s += `<path d="M${f1(x)} 0L${f1(x + rnd(i, 72) * 3 - 1.5)} 120" stroke="#F8F0E0" stroke-width="${f1(0.3 + rnd(i, 73) * 0.5)}" opacity=".4"/>`; }
        return `<pattern id="${id}" width="90" height="120" patternUnits="userSpaceOnUse">${s}<circle cx="61" cy="34" r=".9" fill="#F8F0E0" opacity=".5"/><circle cx="18" cy="88" r=".7" fill="#1A1410" opacity=".5"/></pattern>`;
      })],
      [book.use('vignette', (id) => `<radialGradient id="${id}" cx=".5" cy=".5" r=".72"><stop offset=".55" stop-color="#1A1410" stop-opacity="0"/><stop offset="1" stop-color="#1A1410" stop-opacity=".78"/></radialGradient>`)],
    ),
    frame: (t, svg) => {
      const k = Math.floor(t / 62.5);
      svg.setAttribute('opacity', String(0.88 + 0.12 * ((k * 7919) % 13) / 12));
    },
  }),
};
