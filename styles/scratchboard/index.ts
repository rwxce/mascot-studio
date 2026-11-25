// Scratchboard: White lines scratched out of a black board: the light is what was taken away.
// See STYLE.md (generated from style.json by scripts/style-docs.mjs).
import { grey } from '../../kit/color.js';
import type { Role } from '../../kit/style.js';
import type { Style } from '../../kit/style.js';
import { det, isArea, makePainter } from '../../kit/stylekit.js';
import { f1, path, rnd } from '../paint.js';
import meta from './style.json';

const BLACK = '#0E0D0C', WHITE = '#F2EEE6';
const ANGLE: Partial<Record<Role, number>> = { body: -30, 'body-dark': 30, belly: 75, accent: 0, visor: 60, inside: -75 };

export const scratchboard: Style = {
  ...(meta as Omit<Style, 'painter'>),
  painter: (palette, uid) => makePainter(palette, uid, {
    fill: (role, P, book) => {
      if (!isArea(role)) return role === 'eye' ? WHITE : role === 'shine' ? BLACK : WHITE;
      const g = Math.round((grey(P[role]) / 255) * 4) / 4;
      if (g <= 0.1) return BLACK;
      const gap = +(3.2 + (1 - g) * 3.2).toFixed(1), a = ANGLE[role] ?? 15;
      return book.use(`scr-${gap}-${a}`.replace('.', ''), (id) => `<pattern id="${id}" width="${gap}" height="${gap}" patternUnits="userSpaceOnUse" patternTransform="rotate(${a})"><rect width="${gap}" height="${gap}" fill="${BLACK}"/><line x1="0" y1="0" x2="0" y2="${gap}" stroke="${WHITE}" stroke-width=".8"/></pattern>`);
    },
    flat: (role) => (role === 'cheek' ? '#6E6A64' : role === 'shine' ? BLACK : role === 'eye' || role === 'ink' || role === 'line' ? WHITE : WHITE),
    look: () => ({ edge: { color: WHITE, width: 1.3 } }),
    keepLightEyes: false,
    shadow: 'rgba(242,238,230,.08)',
    stage: (book) => (at, r) => {
      let d = '';
      for (let i = 0; i < 64; i++) {
        const a = (i / 64) * Math.PI * 2 + rnd(i, 51) * 0.05;
        const r0 = r * (0.7 + rnd(i, 52) * 0.12), r1 = r0 + r * (0.06 + rnd(i, 53) * 0.2);
        d += `M${f1(Math.cos(a) * r0)} ${f1(Math.sin(a) * r0)}L${f1(Math.cos(a) * r1)} ${f1(Math.sin(a) * r1)}`;
      }
      return [{ at, shapes: [
        det({ el: { tag: 'circle', attrs: { r: f1(0.95 * r), fill: book.use('scraped', (id) => `<pattern id="${id}" width="3.6" height="3.6" patternUnits="userSpaceOnUse" patternTransform="rotate(20)"><line x1="0" y1="0" x2="0" y2="3.6" stroke="${WHITE}" stroke-width=".8" opacity=".75"/></pattern>`) } } }),
        path(d, { stroke: WHITE, 'stroke-width': 0.9, opacity: 0.6, 'stroke-linecap': 'round' })] }];
    },
  }),
};
