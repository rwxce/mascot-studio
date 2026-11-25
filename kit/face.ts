// Faces shared by anatomies: eyes that blink, squint happily and widen, with an optional
// shine. Every eye pose uses the same commands so they blend. The original eye lives in
// kit/faces/default.ts; every other eye, mouth and brow model is in the kit/faces registry.
import type { Pose } from './timeline.js';

export { ellipsePath, eyePart, eyePoses, renderEyes, type EyePoses } from './faces/default.js';
export { eyeModels, mouthModels, eyeModel, mouthModel, browSet } from './faces/index.js';

/** The channels every face-bearing anatomy shares. */
export const FACE_DEFAULTS: Pose = {
  'look.x': 0, 'look.y': 0, 'look.w': 0, 'eyes.open': 1, 'eyes.happy': 0, 'eyes.scale': 1, 'face.blush': 0,
};
export const FACE_CHANNELS = Object.keys(FACE_DEFAULTS);
