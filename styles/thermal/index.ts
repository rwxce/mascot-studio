// Thermal: A thermal camera view: false-colour heat from cold violet through magenta and orange to
// white-hot, a scale bar and crosshair. See STYLE.md (generated from style.json by scripts/style-docs.mjs).
import { grey, mix } from '../../kit/color.js';
import type { Role } from '../../kit/style.js';
import type { Style } from '../../kit/style.js';
import { det, isArea, makePainter } from '../../kit/stylekit.js';
import { box, f1, path } from '../paint.js';
import meta from './style.json';

const IRONBOW = ['#0B0630', '#3A0B6B', '#9C1C7A', '#E0452B', '#F9A825', '#FFF6C8'];
/** Heat 0..1 → ironbow colour. */
function heat(v: number): string {
  const x = Math.max(0, Math.min(1, v)) * (IRONBOW.length - 1), i = Math.min(IRONBOW.length - 2, Math.floor(x));
  return mix(IRONBOW[i], IRONBOW[i + 1], x - i);
}
const HEAT: Partial<Record<Role, number>> = { body: 0.72, belly: 0.86, 'body-dark': 0.5, accent: 0.62, inside: 0.38, visor: 0.4 };
const bar = (id: string) => `<linearGradient id="${id}" x1="0" y1="1" x2="0" y2="0">${IRONBOW.map((c, i) => `<stop offset="${(i / (IRONBOW.length - 1)).toFixed(2)}" stop-color="${c}"/>`).join('')}</linearGradient>`;

export const thermal: Style = {
  ...(meta as Omit<Style, 'painter'>),
  painter: (palette, uid) => {
    let lightEyes = false;
    return makePainter(palette, uid, {
      palette: (P) => { lightEyes = grey(P.eye) > 140; return P; },
      fill: (role, P, book) => {
        if (!isArea(role)) return role === 'eye' ? (lightEyes ? '#FFFFFF' : '#1A0838') : role === 'shine' ? 'none' : heat(0.9);
        const h = HEAT[role] ?? 0.6;
        return book.use(`heat-${role}`, (id) => `<radialGradient id="${id}" cx=".5" cy=".45" r=".65"><stop offset="0" stop-color="${heat(h + 0.18)}"/><stop offset=".6" stop-color="${heat(h)}"/><stop offset="1" stop-color="${heat(h - 0.28)}"/></radialGradient>`);
      },
      flat: (role) => (role === 'eye' ? (lightEyes ? '#FFFFFF' : '#1A0838') : role === 'body-dark' ? heat(0.5) : role === 'cheek' ? heat(0.95) : role === 'line' ? heat(0.3) : heat(0.85)),
      keepLightEyes: false,
      shadow: 'rgba(156,28,122,.45)',
      stage: (book) => (at, r) => [{ at, shapes: [det({ el: { tag: 'circle', attrs: { r: f1(1.1 * r), fill: book.use('cold', (id) => `<radialGradient id="${id}"><stop offset="0" stop-color="#3A0B6B" stop-opacity=".7"/><stop offset="1" stop-color="#3A0B6B" stop-opacity="0"/></radialGradient>`) } } })] }],
      overlay: (book) => (b) => {
        const [x, y, w, h] = b, cx = x + w / 2, cy = y + h * 0.5, k = Math.min(w, h) * 0.04;
        return [{
          shapes: [
            box(x + w - 10, y + h * 0.2, 4, h * 0.6, { fill: book.use('bar', bar), stroke: '#FFFFFF', 'stroke-width': 0.5, 'stroke-opacity': 0.6 }),
            path(`M${f1(cx - 2 * k)} ${f1(cy)}H${f1(cx - k)}M${f1(cx + k)} ${f1(cy)}H${f1(cx + 2 * k)}M${f1(cx)} ${f1(cy - 2 * k)}V${f1(cy - k)}M${f1(cx)} ${f1(cy + k)}V${f1(cy + 2 * k)}`, { stroke: '#FFFFFF', 'stroke-width': 0.8, opacity: 0.55 }),
            path(`M${f1(x + 6)} ${f1(y + 14)}V${f1(y + 6)}H${f1(x + 14)}M${f1(x + w - 14)} ${f1(y + 6)}H${f1(x + w - 6)}V${f1(y + 14)}`, { stroke: '#FFFFFF', 'stroke-width': 0.8, opacity: 0.45 }),
          ],
        }];
      },
    });
  },
};
