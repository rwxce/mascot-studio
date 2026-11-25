// Bauhaus: Circles, squares and three primaries on cream, moving like a machine.
// See STYLE.md (generated from style.json by scripts/style-docs.mjs).
import { grey } from '../../kit/color.js';
import type { Style } from '../../kit/style.js';
import { det, makePainter, nearest } from '../../kit/stylekit.js';
import meta from './style.json';

const RED = '#D7263D', YELLOW = '#F2B705', BLUE = '#1F4E9E', BLACK = '#161616', CREAM = '#F3ECDC';

export const bauhaus: Style = {
  ...(meta as Omit<Style, 'painter'>),
  painter: (palette, uid) => makePainter(palette, uid, {
    palette: (P) => {
      const body = nearest(P.body, [RED, YELLOW, BLUE]);
      const accent = body === RED ? YELLOW : RED;
      return {
        ...P,
        body, accent,
        'body-dark': BLACK, inside: BLACK, visor: BLACK, line: BLACK, ink: BLACK,
        belly: CREAM, shine: CREAM, prop: RED, glow: YELLOW,
        cheek: accent,
        eye: grey(P.eye) > 140 ? YELLOW : BLACK,
      };
    },
    keepLightEyes: false,
    shadow: BLACK,
    step: 100,
    stage: () => (at, r) => [{
      at, shapes: [
        det({ el: { tag: 'circle', attrs: { cx: -r * 0.32, cy: -r * 0.28, r: r * 0.52, fill: YELLOW } } }),
        det({ el: { tag: 'rect', attrs: { x: r * 0.18, y: r * 0.05, width: r * 0.62, height: r * 0.62, fill: RED } } }),
        det({ el: { tag: 'rect', attrs: { x: -r * 0.95, y: r * 0.5, width: r * 1.6, height: r * 0.06, fill: BLACK } } }),
      ],
    }],
  }),
};
