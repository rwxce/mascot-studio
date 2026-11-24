// Every mascot in the repo. A mascot is its mascot.json; this file only lists them.
import { anatomies } from '../anatomies/index.js';
import { createCharacter } from '../kit/character.js';
import { styleById } from '../styles/index.js';
import type { Mascot } from '../kit/mascot.js';
import type { MascotSpec } from '../kit/spec.js';
import fox from './fox/mascot.json';
import ghost from './ghost/mascot.json';
import robot from './robot/mascot.json';
import secretLetter from './secret-letter/mascot.json';

export const specs: MascotSpec[] = [secretLetter, robot, fox, ghost].map((s) => s as unknown as MascotSpec);

export function makeMascot(spec: MascotSpec, opts: { salt?: number; style?: string } = {}): Mascot {
  const anatomy = anatomies[spec.anatomy];
  if (!anatomy) throw new Error(`unknown anatomy "${spec.anatomy}" in ${spec.name}`);
  const style = styleById[opts.style ?? spec.style ?? 'soft-gradient'];
  if (!style) throw new Error(`unknown style "${opts.style ?? spec.style}"`);
  return createCharacter(spec, anatomy, style, opts);
}
