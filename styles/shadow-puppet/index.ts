// Shadow Puppet: A dark leather puppet with punched-out holes, pressed against a lamp-lit screen.
// See STYLE.md (generated from style.json by scripts/style-docs.mjs).
import type { Style } from '../../kit/style.js';
import { makePainter } from '../../kit/stylekit.js';
import { box, f1, path } from '../paint.js';
import meta from './style.json';

const HIDE = '#170C06', LAMP = '#FFC35A', GLOW = '#E9822F';

const holes = (id: string) =>
  `<pattern id="${id}" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="${HIDE}"/><circle cx="0" cy="0" r="1.15" fill="${GLOW}"/><circle cx="10" cy="0" r="1.15" fill="${GLOW}"/><circle cx="0" cy="10" r="1.15" fill="${GLOW}"/><circle cx="10" cy="10" r="1.15" fill="${GLOW}"/><circle cx="5" cy="5" r=".7" fill="${GLOW}"/></pattern>`;
const slots = (id: string) =>
  `<pattern id="${id}" width="7" height="6" patternUnits="userSpaceOnUse"><rect width="7" height="6" fill="${HIDE}"/><rect x="1" y="2.3" width="5" height="1.3" rx=".65" fill="${GLOW}"/></pattern>`;

export const shadowPuppet: Style = {
  ...(meta as Omit<Style, 'painter'>),
  painter: (palette, uid) => makePainter(palette, uid, {
    fill: (role, P, book) => (role === 'body' ? book.use('holes', holes) : role === 'belly' ? book.use('slots', slots) : role === 'eye' ? LAMP : role === 'shine' ? '#FFE9B0' : role === 'cheek' ? GLOW : HIDE),
    flat: (role) => (role === 'eye' ? LAMP : role === 'shine' ? '#FFE9B0' : role === 'cheek' ? GLOW : HIDE),
    keepLightEyes: false,
    look: () => ({ drop: { dx: 5, dy: 3, color: '#000000', opacity: 0.22 } }),
    shadow: 'rgba(0,0,0,0)',
    stage: (book) => (at, r) => [{
      at, shapes: [
        box(-1.05 * r, -1.05 * r, 2.1 * r, 2.0 * r, {
          rx: f1(0.08 * r), stroke: '#1A0A04', 'stroke-width': 5,
          fill: book.use('screen', (id) => `<radialGradient id="${id}" cx=".5" cy=".45" r=".7"><stop offset="0" stop-color="#FFE2A3"/><stop offset=".55" stop-color="#F0A04B"/><stop offset="1" stop-color="#9A3A15"/></radialGradient>`),
        }),
        path(`M${f1(-0.95 * r)} ${f1(0.95 * r)}H${f1(0.95 * r)}`, { stroke: '#5A2410', 'stroke-width': 2, opacity: 0.5 }),
      ],
    }],
  }),
};
