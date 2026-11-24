// Firefly Pointillism: The character made of glowing dots on a night field, among twinkling
// fireflies. See STYLE.md (generated from style.json by scripts/style-docs.mjs).
import { lighten, mix } from '../../kit/color.js';
import type { Style } from '../../kit/style.js';
import { isArea, makePainter } from '../../kit/stylekit.js';
import { dot, f1, rnd } from '../paint.js';
import meta from './style.json';

const NIGHT = '#0A0F24', SPARK = '#FFF6C8', FLY = '#E8FF8A';

function dots(id: string, c: string): string {
  let s = '';
  for (let i = 0; i < 16; i++) {
    const t = i % 3 === 0 ? lighten(c, 0.6) : i % 3 === 1 ? lighten(c, 0.25) : c;
    s += `<circle cx="${f1(rnd(i, 91) * 12)}" cy="${f1(rnd(i, 92) * 12)}" r="${(0.7 + rnd(i, 93) * 0.8).toFixed(2)}" fill="${t}"/>`;
  }
  return `<pattern id="${id}" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="12" fill="${mix(c, NIGHT, 0.72)}"/>${s}</pattern>`;
}

const stageOf = new WeakMap<SVGSVGElement, Element | null>();

export const pointillism: Style = {
  ...(meta as Omit<Style, 'painter'>),
  painter: (palette, uid) => makePainter(palette, uid, {
    fill: (role, P, book) => (isArea(role) ? book.use(`pt-${role}`, (id) => dots(id, P[role])) : role === 'eye' ? SPARK : role === 'shine' ? NIGHT : P[role]),
    flat: (role, P) => (role === 'eye' || role === 'ink' ? SPARK : role === 'body-dark' ? lighten(P.body, 0.3) : P[role]),
    keepLightEyes: false,
    look: (P) => ({ edge: { color: lighten(P.body, 0.35), width: 0.8, opacity: 0.45 } }),
    shadow: 'rgba(232,255,138,.08)',
    stage: () => (at, r) => [{
      at, shapes: Array.from({ length: 34 }, (_, i) => {
        const a = rnd(i, 94) * Math.PI * 2, d = (0.55 + rnd(i, 95) * 0.5) * r;
        const x = Math.cos(a) * d, y = Math.sin(a) * d, s = 0.8 + rnd(i, 96) * 1.4;
        return i % 4 === 0 ? [dot(x, y, s * 3.2, FLY, 0.12), dot(x, y, s, FLY, 0.95)] : [dot(x, y, s, FLY, 0.4 + rnd(i, 97) * 0.5)];
      }).flat(),
    }],
    frame: (t, svg) => {
      let g = stageOf.get(svg);
      if (g === undefined) { g = svg.querySelector('[data-stage]'); stageOf.set(svg, g); }
      g?.setAttribute('opacity', String(0.72 + 0.28 * Math.sin(t / 420)));
    },
  }),
};
