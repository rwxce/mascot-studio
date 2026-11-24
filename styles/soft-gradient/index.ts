import { lighten } from '../../kit/color.js';
import { defsBook, det, radialGlow, resolvePalette, vertical, type Role, type Style } from '../../kit/style.js';
import meta from './style.json';

/** Roles that get volume (a vertical gradient); the rest stay flat. */
const VOLUME: Role[] = ['body', 'body-dark', 'belly', 'visor', 'accent', 'inside'];

export const softGradient: Style = {
  ...(meta as Omit<Style, 'painter'>),
  painter(palette, uid) {
    const P = resolvePalette(palette);
    const book = defsBook(uid);
    return {
      uid,
      fill: (role) => (VOLUME.includes(role)
        ? book.use(`g-${role}`, (id) => vertical(id, lighten(P[role], role === 'belly' ? 0.12 : 0.34), P[role]))
        : P[role]),
      // on the dark stage, ink-coloured props (zzz, ?, sparkles) turn light
      flat: (role) => (role === 'ink' ? '#F3F0FF' : P[role]),
      outline: () => null,
      lineWidth: (w) => w * 0.55,
      shine: true,
      cheekRest: 0.45,
      shadow: 'rgba(0,0,0,.35)',
      stage: (at, r) => [{
        at, shapes: [det({ el: { tag: 'circle', attrs: { r, fill: book.use('glow', (id) => radialGlow(id, P.glow, 0.45)) } } })],
      }],
      defs: () => book.markup(),
      time: (t) => t,
      boil: 0,
    };
  },
};
