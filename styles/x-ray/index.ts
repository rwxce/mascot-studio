// X-ray: A security scanner image: translucent orange and blue layers on black, every inner part
// showing through, on a belt. See STYLE.md (generated from style.json by scripts/style-docs.mjs).
import type { Role } from '../../kit/style.js';
import type { Style } from '../../kit/style.js';
import { makePainter } from '../../kit/stylekit.js';
import { box, f1, path } from '../paint.js';
import meta from './style.json';

const DENSE = '#EAF6FF', RIM = '#BFE3FF', METAL = '#5AA8FF';
const LAYER: Partial<Record<Role, string>> = {
  body: 'rgba(255,160,70,.55)', belly: 'rgba(255,200,130,.42)', 'body-dark': 'rgba(90,170,255,.42)',
  accent: 'rgba(70,140,255,.6)', visor: 'rgba(60,120,255,.5)', inside: 'rgba(30,60,140,.6)', prop: 'rgba(70,140,255,.6)', cheek: 'rgba(255,120,60,.5)',
};

export const xRay: Style = {
  ...(meta as Omit<Style, 'painter'>),
  painter: (palette, uid) => makePainter(palette, uid, {
    fill: (role) => LAYER[role] ?? (role === 'eye' ? DENSE : role === 'shine' ? 'none' : RIM),
    flat: (role) => (role === 'eye' ? DENSE : role === 'cheek' ? 'rgba(255,120,60,.5)' : role === 'ink' || role === 'line' ? RIM : METAL),
    keepLightEyes: false,
    outline: (w) => ({ color: '#2E6FD0', width: 2.6 * w }),
    look: () => ({ hollow: true, outlineOpacity: 0.5, edge: { color: RIM, width: 1, opacity: 0.85 } }),
    shadow: 'rgba(0,0,0,0)',
    stage: () => (at, r) => {
      let ticks = '';
      for (let i = 0; i <= 16; i++) { const y = (-0.9 + i * 0.1) * r; ticks += `M${f1(-0.98 * r)} ${f1(y)}h${i % 4 ? 4 : 8}`; }
      let rollers = '';
      for (let i = 0; i < 9; i++) { const x = (-1 + i * 0.25) * r; rollers += `M${f1(x)} ${f1(0.8 * r)}v${f1(0.2 * r)}`; }
      return [{
        at, shapes: [
          box(-1.2 * r, 0.8 * r, 2.4 * r, 0.3 * r, { fill: '#0B1A2A' }),
          path(rollers, { stroke: '#1C3550', 'stroke-width': 2 }),
          path(`M${f1(-1.2 * r)} ${f1(0.8 * r)}H${f1(1.2 * r)}`, { stroke: METAL, 'stroke-width': 1, opacity: 0.6 }),
          path(ticks, { stroke: METAL, 'stroke-width': 0.8, opacity: 0.5 }),
        ],
      }];
    },
  }),
};
