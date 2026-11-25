// Engraving: A copperplate engraving: tone built from fine parallel and crossed lines, dark sepia
// on cream, in an oval cartouche. See STYLE.md (generated from style.json by scripts/style-docs.mjs).
import { grey } from '../../kit/color.js';
import type { Role } from '../../kit/style.js';
import type { Style } from '../../kit/style.js';
import { det, isArea, makePainter } from '../../kit/stylekit.js';
import { f1 } from '../paint.js';
import meta from './style.json';

const INK = '#22170E', PAPER = '#F1E9D6';
const ANGLE: Partial<Record<Role, number>> = { body: 35, 'body-dark': -35, belly: 80, accent: 10, visor: -60, inside: 0 };

/** Parallel lines (and crossed ones for dark tones) at a gap that follows the tone. */
function rule(id: string, g: number, angle: number): string {
  const gap = +(2.1 + g * 3).toFixed(2), w = +(0.55 + (1 - g) * 0.35).toFixed(2);
  const cross = g < 0.5 ? `<line x1="0" y1="0" x2="${gap}" y2="0" stroke="${INK}" stroke-width="${(w * 0.8).toFixed(2)}"/>` : '';
  return `<pattern id="${id}" width="${gap}" height="${gap}" patternUnits="userSpaceOnUse" patternTransform="rotate(${angle})"><rect width="${gap}" height="${gap}" fill="${PAPER}"/><line x1="0" y1="0" x2="0" y2="${gap}" stroke="${INK}" stroke-width="${w}"/>${cross}</pattern>`;
}

export const engraving: Style = {
  ...(meta as Omit<Style, 'painter'>),
  painter: (palette, uid) => makePainter(palette, uid, {
    fill: (role, P, book) => {
      if (!isArea(role)) return role === 'shine' ? PAPER : INK;
      const g = +(Math.round((grey(P[role]) / 255) * 5) / 5).toFixed(1);
      if (g >= 0.9) return PAPER;
      if (g <= 0.05) return INK;
      const a = ANGLE[role] ?? 20;
      return book.use(`rule-${g}-${a}`.replace('.', ''), (id) => rule(id, g, a));
    },
    flat: (role, P) => (role === 'shine' ? PAPER : role === 'cheek' ? '#9C7A5C' : isArea(role) && grey(P[role]) > 150 ? '#7A6048' : INK),
    outline: (w) => ({ color: INK, width: 1.3 * w }),
    lineWidth: (w) => w * 0.5,
    shadow: 'rgba(34,23,14,.12)',
    stage: (book) => (at, r) => [{
      at, shapes: [
        det({ el: { tag: 'ellipse', attrs: { rx: f1(0.86 * 0.92 * r), ry: f1(0.86 * r), fill: book.use('sky', (id) => `<pattern id="${id}" width="6" height="2.2" patternUnits="userSpaceOnUse"><line x1="0" y1="1.1" x2="6" y2="1.1" stroke="${INK}" stroke-width=".75" opacity=".75"/></pattern>`) } } }),
        ...[0.86, 0.9, 0.94, 0.98].map((k, i) => det({ el: { tag: 'ellipse', attrs: { rx: f1(k * 0.92 * r), ry: f1(k * r), fill: 'none', stroke: INK, 'stroke-width': i === 3 ? 1.6 : 0.5, opacity: i === 3 ? 0.8 : 0.45 } } })),
        det({ el: { tag: 'ellipse', attrs: { rx: f1(0.8 * r), ry: f1(0.87 * r), fill: 'none', stroke: INK, 'stroke-width': 0.4, 'stroke-dasharray': '1 2.2', opacity: 0.6 } } }),
      ],
    }],
  }),
};
