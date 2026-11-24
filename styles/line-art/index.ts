// Line Art: A single thin line around every piece on white paper; colour only in the eyes.
// See STYLE.md (generated from style.json by scripts/style-docs.mjs).
import type { Style } from '../../kit/style.js';
import { isArea, makePainter } from '../../kit/stylekit.js';
import meta from './style.json';

export const lineArt: Style = {
  ...(meta as Omit<Style, 'painter'>),
  painter: (palette, uid) => makePainter(palette, uid, {
    fill: (role, P) => (isArea(role) ? '#FFFFFF' : P[role]),
    flat: (role, P) => (role === 'eye' || role === 'ink' || role === 'line' ? '#1A1A1A' : role === 'cheek' ? '#F3B0BC' : P[role]),
    look: () => ({ edge: { color: '#1A1A1A', width: 1.4 } }),
    keepLightEyes: false,
  }),
};

