// Impasto: Oil paint laid on thick: ridged brush strokes in warm colour on a canvas weave.
// See STYLE.md (generated from style.json by scripts/style-docs.mjs).
import { darken, lighten, mix, saturate } from '../../kit/color.js';
import type { Style } from '../../kit/style.js';
import { det, isArea, makePainter, mapPalette } from '../../kit/stylekit.js';
import { cover, f1, rnd } from '../paint.js';
import meta from './style.json';

const UMBER = '#2E1B10';

/** A tile of short, loaded strokes in three values of one colour, each with a light ridge. */
function strokes(id: string, c: string, size = 24, n = 10, w = 4.6): string {
  let s = '';
  for (let i = 0; i < n; i++) {
    const x = rnd(i, 21) * size, y = rnd(i, 22) * size, l = 6 + rnd(i, 23) * 8, a = -0.5 + rnd(i, 24) * 0.9;
    const dx = Math.cos(a) * l, dy = Math.sin(a) * l, bend = (rnd(i, 25) - 0.5) * 4;
    const d = `M${f1(x)} ${f1(y)}q${f1(dx / 2 + bend)} ${f1(dy / 2 - bend)} ${f1(dx)} ${f1(dy)}`;
    const tone = i % 3 === 0 ? lighten(c, 0.22) : i % 3 === 1 ? darken(c, 0.16) : mix(c, '#E8A040', 0.18);
    s += `<path d="${d}" stroke="${tone}" stroke-width="${w}" stroke-linecap="round" fill="none"/>`;
    s += `<path d="${d}" stroke="${lighten(c, 0.5)}" stroke-width="1" stroke-linecap="round" fill="none" opacity=".6" transform="translate(-.6 -.9)"/>`;
  }
  return `<pattern id="${id}" width="${size}" height="${size}" patternUnits="userSpaceOnUse"><rect width="${size}" height="${size}" fill="${c}"/>${s}</pattern>`;
}

export const impasto: Style = {
  ...(meta as Omit<Style, 'painter'>),
  painter: (palette, uid) => makePainter(palette, uid, {
    palette: (P) => mapPalette(P, (c, r) => (r === 'eye' || r === 'ink' || r === 'line' ? UMBER : r === 'shine' ? '#FFF3DC' : mix(saturate(c, 0.2), '#E8A040', 0.16))),
    fill: (role, P, book) => (isArea(role) ? book.use(`oil-${role}`, (id) => strokes(id, P[role])) : P[role]),
    flat: (role, P) => (role === 'ink' ? '#FFE9C2' : P[role]),
    outline: (w) => ({ color: UMBER, width: 3.2 * w }),
    lineWidth: (w) => w * 0.8,
    boil: 0.55,
    shadow: 'rgba(30,14,6,.35)',
    stage: (book) => (at, r) => [{
      at, shapes: [
        det({ d: `M${f1(-r * 0.95)} ${f1(r * 0.1)}C${f1(-r * 0.9)} ${f1(-r * 0.8)} ${f1(r * 0.7)} ${f1(-r * 0.95)} ${f1(r * 0.95)} ${f1(-r * 0.15)}C${f1(r * 1.1)} ${f1(r * 0.6)} ${f1(r * 0.1)} ${f1(r * 0.95)} ${f1(-r * 0.4)} ${f1(r * 0.8)}C${f1(-r * 0.85)} ${f1(r * 0.7)} ${f1(-r)} ${f1(r * 0.45)} ${f1(-r * 0.95)} ${f1(r * 0.1)}Z`, fill: book.use('daub', (id) => strokes(id, '#C98A3E', 34, 12, 7)) }),
      ],
    }],
    overlay: (book) => cover(book.use('canvas', (id) => `<pattern id="${id}" width="4" height="4" patternUnits="userSpaceOnUse"><path d="M0 1h4M0 3h4" stroke="#FFF4E0" stroke-width=".6" opacity=".09"/><path d="M1 0v4M3 0v4" stroke="#1A0E06" stroke-width=".6" opacity=".08"/></pattern>`)),
  }),
};
