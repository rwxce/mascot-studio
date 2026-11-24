// Every mascot in the repo. A mascot is its mascot.json; this file only lists them.
import { anatomies } from '../anatomies/index.js';
import { createCharacter } from '../kit/character.js';
import type { Mascot } from '../kit/mascot.js';
import type { MascotSpec } from '../kit/spec.js';
import secretLetter from './secret-letter/mascot.json';

export const specs: MascotSpec[] = [secretLetter as unknown as MascotSpec];

export function makeMascot(spec: MascotSpec, opts: { salt?: number } = {}): Mascot {
  const anatomy = anatomies[spec.anatomy];
  if (!anatomy) throw new Error(`unknown anatomy "${spec.anatomy}" in ${spec.name}`);
  return createCharacter(spec, anatomy, opts);
}
