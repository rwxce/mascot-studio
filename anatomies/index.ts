// Every anatomy, by name. A mascot.json picks one with "anatomy".
import type { Anatomy } from '../kit/character.js';
import { anchor } from './anchor/index.js';
import { biped } from './biped/index.js';
import { floater } from './floater/index.js';
import { objectLimbs } from './object-limbs/index.js';
import { quadruped } from './quadruped/index.js';

export const anatomies: Record<string, Anatomy> = {
  'object-limbs': objectLimbs,
  biped,
  quadruped,
  floater,
  anchor,
};
