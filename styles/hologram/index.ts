// Hologram: A sci-fi projection: cyan translucent light with scanline fill, HUD brackets, a
// projector base and the odd glitch. See STYLE.md (generated from style.json by scripts/style-docs.mjs).
import type { Style } from '../../kit/style.js';
import { isArea, makePainter } from '../../kit/stylekit.js';
import { f1, path } from '../paint.js';
import meta from './style.json';

const CY = '#5FF4FF', DEEP = '#0E6E8C', BRIGHT = '#E8FEFF';

export const hologram: Style = {
  ...(meta as Omit<Style, 'painter'>),
  painter: (palette, uid) => makePainter(palette, uid, {
    fill: (role, P, book) => (isArea(role)
      ? book.use(`scan-${role === 'belly' ? 'b' : 'a'}`, (id) => `<pattern id="${id}" width="4" height="3" patternUnits="userSpaceOnUse"><rect width="4" height="3" fill="${CY}" opacity="${role === 'belly' ? 0.2 : 0.1}"/><rect width="4" height="1" fill="${CY}" opacity=".5"/></pattern>`)
      : role === 'eye' ? BRIGHT : role === 'shine' ? 'none' : CY),
    flat: (role) => (role === 'eye' ? BRIGHT : role === 'cheek' ? DEEP : CY),
    keepLightEyes: false,
    outline: (w) => ({ color: CY, width: 5 * w }),
    look: () => ({ hollow: true, outlineOpacity: 0.2, edge: { color: CY, width: 1.3 } }),
    shadow: 'rgba(0,0,0,0)',
    stage: () => (at, r) => {
      const b = 0.9 * r, k = 0.2 * r;
      const brackets = [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy]) => `M${f1(sx * b)} ${f1(sy * (b - k))}L${f1(sx * b)} ${f1(sy * b)}L${f1(sx * (b - k))} ${f1(sy * b)}`).join('');
      return [{
        at, shapes: [
          path(`M${f1(-0.3 * r)} ${f1(0.78 * r)}L${f1(-0.62 * r)} ${f1(-0.55 * r)}L${f1(0.62 * r)} ${f1(-0.55 * r)}L${f1(0.3 * r)} ${f1(0.78 * r)}Z`, { fill: CY, opacity: 0.06 }),
          path(brackets, { stroke: CY, 'stroke-width': 1.6, opacity: 0.8 }),
          path(`M${f1(-0.7 * r)} 0A${f1(0.7 * r)} ${f1(0.7 * r)} 0 1 1 ${f1(0.7 * r)} 0A${f1(0.7 * r)} ${f1(0.7 * r)} 0 1 1 ${f1(-0.7 * r)} 0`, { stroke: CY, 'stroke-width': 0.8, 'stroke-dasharray': '2 7', opacity: 0.45 }),
          path(`M${f1(0.62 * r)} ${f1(-0.82 * r)}L${f1(0.86 * r)} ${f1(-0.82 * r)}M${f1(0.62 * r)} ${f1(-0.76 * r)}L${f1(0.78 * r)} ${f1(-0.76 * r)}`, { stroke: CY, 'stroke-width': 1.2, opacity: 0.5 }),
          path(`M${f1(-0.42 * r)} ${f1(0.86 * r)}A${f1(0.42 * r)} ${f1(0.08 * r)} 0 1 0 ${f1(0.42 * r)} ${f1(0.86 * r)}A${f1(0.42 * r)} ${f1(0.08 * r)} 0 1 0 ${f1(-0.42 * r)} ${f1(0.86 * r)}`, { stroke: CY, 'stroke-width': 1.4, fill: DEEP, 'fill-opacity': 0.5 }),
        ],
      }];
    },
    frame: (t, svg) => {
      const k = Math.floor(t / 70) % 61;
      const glitch = k === 7 || k === 8;
      svg.style.transform = glitch ? `translateX(${k === 7 ? 3 : -2}px)` : '';
      svg.setAttribute('opacity', glitch ? '0.72' : String(0.94 + 0.06 * Math.sin(t / 130)));
    },
  }),
};
