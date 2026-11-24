import { resolvePalette, type Style } from '../../kit/style.js';
import meta from './style.json';

export const ink: Style = {
  ...(meta as Omit<Style, 'painter'>),
  painter(palette, uid) {
    const P = resolvePalette(palette);
    return {
      uid,
      fill: (role) => P[role],
      flat: (role) => P[role],
      outline: (w = 1) => ({ color: P.ink, width: 5.5 * w }),
      lineWidth: (w) => w,
      shine: false,
      cheekRest: 0,
      shadow: 'rgba(20,20,20,.12)',
      stage: () => [],
      defs: () => '',
      time: (t) => t,
      boil: 0,
    };
  },
};
