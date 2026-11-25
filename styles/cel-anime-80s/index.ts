// Cel Anime 80s: Hand-painted 1980s cels: a coloured line, a hard shadow and a highlight band, on 12 fps.
// See STYLE.md (generated from style.json by scripts/style-docs.mjs).
import { darken, lighten, mix, saturate } from '../../kit/color.js';
import type { Style } from '../../kit/style.js';
import { det, isArea, makePainter, mapPalette } from '../../kit/stylekit.js';
import meta from './style.json';

/** Three flat bands: a highlight crescent at the top left, the base, a hard shadow below. */
const cel3 = (id: string, c: string) =>
  `<linearGradient id="${id}" x1="0.1" y1="0" x2="0.7" y2="1"><stop offset=".16" stop-color="${lighten(c, 0.32)}"/><stop offset=".16" stop-color="${c}"/><stop offset=".58" stop-color="${c}"/><stop offset=".58" stop-color="${mix(darken(c, 0.3), '#6B2D6B', 0.25)}"/></linearGradient>`;

export const celAnime80s: Style = {
  ...(meta as Omit<Style, 'painter'>),
  painter: (palette, uid) => makePainter(palette, uid, {
    palette: (P) => mapPalette(P, (c, r) => (isArea(r) ? mix(saturate(c, 0.08), '#E8A27C', 0.12) : c)),
    fill: (role, P, book) => (isArea(role) ? book.use(`c80-${role}`, (id) => cel3(id, P[role])) : P[role]),
    outline: (w, P) => ({ color: mix(darken(P.body, 0.5), '#4A1F3A', 0.4), width: 2.8 * w }),
    shine: true,
    shadow: 'rgba(30,10,40,.35)',
    step: 83,
    stage: () => (at, r) => [{
      at, shapes: [
        det({ el: { tag: 'circle', attrs: { cx: r * 0.28, cy: -r * 0.3, r: r * 0.46, fill: '#F6C98E', opacity: 0.85 } } }),
        det({ d: `M${-r} ${r * 0.18}L${r} ${r * 0.18}`, stroke: '#E37A6C', width: 2, opacity: 0.55 }),
        det({ d: `M${-r * 0.8} ${r * 0.3}L${r * 0.8} ${r * 0.3}`, stroke: '#E37A6C', width: 1.2, opacity: 0.4 }),
      ],
    }],
  }),
};
