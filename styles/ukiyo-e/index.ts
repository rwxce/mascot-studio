// Ukiyo-e: A Japanese woodblock print: flat pigments fading in bokashi gradients, a fine key line,
// washi paper, a curling wave. See STYLE.md (generated from style.json by scripts/style-docs.mjs).
import { mix } from '../../kit/color.js';
import type { Style } from '../../kit/style.js';
import { det, isArea, makePainter, mapPalette, nearest, pat } from '../../kit/stylekit.js';
import { cover, dot, f1, rnd } from '../paint.js';
import meta from './style.json';

const INDIGO = '#2B4C7E', PRUSSIAN = '#1C3563', VERMILION = '#C8452C', OCHRE = '#D9A441', SAGE = '#7E9A6B', PINK = '#E8A39A', PAPER = '#F3E9D0', SUMI = '#26211E';

export const ukiyoE: Style = {
  ...(meta as Omit<Style, 'painter'>),
  painter: (palette, uid) => makePainter(palette, uid, {
    palette: (P) => mapPalette(P, (c, r) => (r === 'eye' || r === 'ink' || r === 'line' ? SUMI : r === 'shine' ? PAPER : nearest(c, [INDIGO, VERMILION, OCHRE, SAGE, PINK, PAPER]))),
    // Bokashi: the pigment wiped from full strength at the top to half strength at the bottom.
    fill: (role, P, book) => (isArea(role) ? book.use(`boka-${role}`, (id) => pat.vertical(id, P[role], mix(P[role], PAPER, 0.55))) : P[role]),
    outline: (w) => ({ color: SUMI, width: 1.4 * w }),
    lineWidth: (w) => w * 0.5,
    shadow: 'rgba(38,33,30,.12)',
    stage: (book) => (at, r) => {
      const sea = book.use('sea', (id) => pat.vertical(id, PRUSSIAN, mix(INDIGO, PAPER, 0.35)));
      const p = (x: number, y: number) => `${f1(x * r)} ${f1(y * r)}`;
      const wave = `M${p(-1.25, 1)}C${p(-1.2, 0.3)} ${p(-0.75, -0.3)} ${p(-0.15, -0.28)}C${p(-0.5, -0.12)} ${p(-0.62, 0.15)} ${p(-0.4, 0.32)}C${p(-0.62, 0.38)} ${p(-0.4, 0.75)} ${p(0.15, 1)}Z`;
      const swell = `M${p(0.15, 1)}C${p(0.5, 0.62)} ${p(0.9, 0.5)} ${p(1.25, 0.62)}L${p(1.25, 1)}Z`;
      const lines = `M${p(-1.1, 0.8)}C${p(-1, 0.3)} ${p(-0.7, -0.05)} ${p(-0.35, -0.16)}M${p(-0.95, 0.9)}C${p(-0.85, 0.45)} ${p(-0.62, 0.15)} ${p(-0.42, 0.08)}M${p(0.4, 0.9)}C${p(0.6, 0.72)} ${p(0.9, 0.66)} ${p(1.15, 0.7)}`;
      const foam = Array.from({ length: 9 }, (_, i) => {
        const u = i / 8, x = -0.72 + u * 0.55 + rnd(i, 31) * 0.03, y = -0.27 + Math.sin(u * 2.6) * 0.06;
        return dot(x * r, y * r, r * (0.035 + rnd(i, 32) * 0.02), PAPER);
      });
      return [{
        at, shapes: [
          dot(0.48 * r, -0.55 * r, 0.26 * r, VERMILION, 0.9),
          det({ el: { tag: 'rect', attrs: { x: f1(-0.2 * r), y: f1(-0.82 * r), width: f1(1.05 * r), height: f1(0.1 * r), rx: f1(0.05 * r), fill: '#E3CFA3' } } }),
          det({ el: { tag: 'rect', attrs: { x: f1(-1.1 * r), y: f1(-0.6 * r), width: f1(0.8 * r), height: f1(0.08 * r), rx: f1(0.04 * r), fill: '#E3CFA3' } } }),
          det({ d: swell, fill: INDIGO, opacity: 0.85 }),
          det({ d: wave, fill: sea }),
          det({ d: lines, stroke: PAPER, width: 1.1, opacity: 0.8 }),
          ...foam,
        ],
      }];
    },
    overlay: (book) => cover(book.use('washi', (id) => {
      let s = '';
      for (let i = 0; i < 10; i++) {
        const x = rnd(i, 41) * 32, y = rnd(i, 42) * 32, l = 5 + rnd(i, 43) * 8;
        s += `<path d="M${f1(x)} ${f1(y)}q${f1(l / 2)} ${f1(rnd(i, 44) * 3 - 1.5)} ${f1(l)} ${f1(rnd(i, 45) * 2 - 1)}" stroke="#9C845A" stroke-width=".35" fill="none" opacity=".35"/>`;
      }
      return `<pattern id="${id}" width="32" height="32" patternUnits="userSpaceOnUse">${s}</pattern>`;
    })),
  }),
};
