// Every mascot in the repo. A mascot is its mascot.json; this file only lists them.
import { anatomies } from '../anatomies/index.js';
import { createCharacter } from '../kit/character.js';
import { styleById } from '../styles/index.js';
import type { Mascot } from '../kit/mascot.js';
import type { MascotSpec } from '../kit/spec.js';
// Every folder with a mascot.json is a mascot: adding or deleting a folder is all it takes.
// The repo's own mascot comes first, then the rest in a fixed order, then any others by name.
const found = import.meta.glob<{ default: MascotSpec }>('./*/mascot.json', { eager: true });
const ORDER = ['nodi', 'robot', 'fox', 'ghost'];
const rank = (n: string) => (ORDER.includes(n) ? ORDER.indexOf(n) : ORDER.length);
export const specs: MascotSpec[] = Object.values(found)
  .map((m) => m.default as unknown as MascotSpec)
  .sort((a, b) => rank(a.name) - rank(b.name) || a.name.localeCompare(b.name));

export function makeMascot(spec: MascotSpec, opts: { salt?: number; style?: string; unsnapped?: boolean } = {}): Mascot {
  const anatomy = anatomies[spec.anatomy];
  if (!anatomy) throw new Error(`unknown anatomy "${spec.anatomy}" in ${spec.name}`);
  const style = styleById[opts.style ?? spec.style ?? 'soft-gradient'];
  if (!style) throw new Error(`unknown style "${opts.style ?? spec.style}"`);
  return createCharacter(spec, anatomy, style, opts);
}
