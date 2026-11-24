// Every anatomy, by name. A mascot.json picks one with "anatomy".
import type { Anatomy } from '../kit/character.js';
import { objectLimbs } from './object-limbs/index.js';

export const anatomies: Record<string, Anatomy> = {
  'object-limbs': objectLimbs,
};
