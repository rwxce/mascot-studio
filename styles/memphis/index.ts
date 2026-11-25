// Memphis: 1980s Memphis design: pastel blocks, black squiggles and confetti, a dotted belly and a
// striped accent. See STYLE.md (generated from style.json by scripts/style-docs.mjs).
import type { Style } from '../../kit/style.js';
import { makePainter, mapPalette, nearest, pat } from '../../kit/stylekit.js';
import { box, dot, f1, path, rnd } from '../paint.js';
import meta from './style.json';

const PINK = '#FF8FB1', MINT = '#7FE0C3', YEL = '#FFD23F', LILAC = '#B59CFF', CYAN = '#4CC9F0', BLACK = '#141414', WHITE = '#FFFFFF';

export const memphis: Style = {
  ...(meta as Omit<Style, 'painter'>),
  painter: (palette, uid) => makePainter(palette, uid, {
    palette: (P) => mapPalette(P, (c, r) => (r === 'eye' || r === 'ink' || r === 'line' ? BLACK : r === 'shine' ? WHITE : r === 'belly' ? WHITE : nearest(c, [PINK, MINT, YEL, LILAC, CYAN]))),
    fill: (role, P, book) => (role === 'belly' ? book.use('m-dots', (id) => pat.halftone(id, WHITE, BLACK, 6, 1.1, 0))
      : role === 'accent' ? book.use(`m-stripe-${P.accent}`, (id) => pat.hatch(id, P.accent, BLACK, 4, 45, 1.4))
      : P[role]),
    outline: (w) => ({ color: BLACK, width: 2.6 * w }),
    shadow: 'rgba(20,20,20,.16)',
    stage: () => (at, r) => {
      const p = (x: number, y: number) => `${f1(x * r)} ${f1(y * r)}`;
      let squig = `M${p(-0.95, -0.75)}`;
      for (let i = 1; i <= 6; i++) squig += `Q${p(-0.95 + i * 0.09 - 0.045, i % 2 ? -0.9 : -0.6)} ${p(-0.95 + i * 0.09, -0.75)}`;
      let zig = `M${p(0.35, 0.85)}`;
      for (let i = 1; i <= 7; i++) zig += `L${p(0.35 + i * 0.08, i % 2 ? 0.75 : 0.85)}`;
      const colors = [PINK, MINT, YEL, LILAC, CYAN];
      const confetti = Array.from({ length: 16 }, (_, i) => {
        const a = rnd(i, 101) * Math.PI * 2, d = (0.7 + rnd(i, 102) * 0.3) * r, x = Math.cos(a) * d, y = Math.sin(a) * d;
        const c = i % 3 === 0 ? BLACK : colors[i % 5];
        return i % 2
          ? path(`M${f1(x)} ${f1(y - 4)}L${f1(x + 4)} ${f1(y + 3)}L${f1(x - 4)} ${f1(y + 3)}Z`, { fill: c, transform: `rotate(${Math.round(rnd(i, 103) * 90)} ${f1(x)} ${f1(y)})` })
          : box(x - 1.2, y - 4, 2.4, 8, { fill: c, transform: `rotate(${Math.round(rnd(i, 104) * 180)} ${f1(x)} ${f1(y)})` });
      });
      return [{
        at, shapes: [
          dot(0.62 * r, -0.6 * r, 0.24 * r, YEL),
          path(squig, { stroke: BLACK, 'stroke-width': 3, 'stroke-linecap': 'round' }),
          path(zig, { stroke: CYAN, 'stroke-width': 3, 'stroke-linejoin': 'round' }),
          det2(-0.85 * r, 0.6 * r, r),
          ...confetti,
        ],
      }];
    },
  }),
};

/** A small black dot grid patch (Memphis' favourite filler). */
function det2(x: number, y: number, r: number) {
  let d = '';
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) d += `M${f1(x + i * 0.07 * r)} ${f1(y + j * 0.07 * r)}h.01`;
  return path(d, { stroke: BLACK, 'stroke-width': 3, 'stroke-linecap': 'round' });
}
