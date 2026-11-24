// Styles decide how a mascot is drawn; anatomies decide what is drawn. An anatomy never
// writes a colour: it asks the painter for a role (`body`, `belly`, `eye`…), and the style
// answers with a fill (flat, gradient, pattern…), an outline or none, eye shines, a stage
// behind the character and a ground shadow. Swapping the style redraws the same rig.
import { darken, lighten } from './color.js';
import type { Part, RigLook, Shape } from './rig.js';

export type Role =
  | 'body' | 'body-dark' | 'belly' | 'inside' | 'accent' | 'eye' | 'shine'
  | 'cheek' | 'line' | 'visor' | 'prop' | 'glow' | 'ink';

export type Palette = Record<string, string>;

/** The seven axes every style picks a value on (see STYLE.md). Two styles may share ≤ 3. */
export interface Axes {
  line: string;
  fill: string;
  texture: string;
  palette: string;
  eyes: string;
  stage: string;
  rhythm: string;
}

export interface StyleMeta {
  id: string;
  title: string;
  family: string;
  /** One line: what it looks like. */
  look: string;
  axes: Axes;
  /** Background of the card the mascot sits on. */
  bg: string;
}

export interface Painter {
  uid: string;
  /** Fill for a role: a colour or url(#…) of a gradient/pattern this painter defined. */
  fill(role: Role): string;
  /** Always a flat colour (strokes, thin limbs). */
  flat(role: Role): string;
  /** Outline for a layer, or null when the style draws no outline. `weight` scales it. */
  outline(weight?: number): { color: string; width: number } | null;
  /** Width for a detail stroke whose base width is w. */
  lineWidth(w: number): number;
  /** Eye highlights. */
  shine: boolean;
  /** Cheek opacity at rest (0 = only when blushing). */
  cheekRest: number;
  /** Ground shadow colour. */
  shadow: string;
  /** Shapes behind the character (a glow, a sun, a grid…), centred at `at`. */
  stage(at: [number, number], r: number): Part[];
  /** Everything the painter needs in <defs>. Call after building. */
  defs(): string;
  /** Snap animation time to the style's rhythm (stop-motion, on twos…). */
  time(t: number): number;
  /** Hand-drawn boil amplitude in px (0 = none). */
  boil: number;
  /** Extra shapes drawn over the whole character (texture, scanlines). */
  overlay?(box: [number, number, number, number]): Part[];
  /** SVG filter id applied to the whole drawing, if any. */
  filter?: string;
  /** Rig-level look: hollow outlines, edge strokes, offset drop pass. */
  look?: RigLook;
  /** Called every frame (flicker, scanline drift). */
  frame?(t: number, svg: SVGSVGElement): void;
}

export interface Style extends StyleMeta {
  painter(palette: Palette, uid: string): Painter;
}

/** Fill in the roles a mascot did not set, from the ones it did. */
export function resolvePalette(p: Palette): Required<Record<Role, string>> & Palette {
  const body = p.body ?? '#8899ff';
  const ink = p.ink ?? '#141414';
  return {
    ...p,
    body,
    ink,
    'body-dark': p['body-dark'] ?? darken(body, 0.18),
    belly: p.belly ?? lighten(body, 0.78),
    inside: p.inside ?? darken(body, 0.6),
    accent: p.accent ?? '#FF5A7A',
    eye: p.eye ?? ink,
    shine: p.shine ?? '#FFFFFF',
    cheek: p.cheek ?? '#FF8FA8',
    line: p.line ?? ink,
    visor: p.visor ?? '#14163A',
    prop: p.prop ?? '#E5383B',
    glow: p.glow ?? body,
  };
}

/** Helper for styles: collect <defs> with ids unique to this painter. */
export function defsBook(uid: string) {
  const defs: string[] = [];
  const made = new Map<string, string>();
  return {
    /** Register a def once per key; `make(id)` returns its markup. Returns url(#id). */
    use(key: string, make: (id: string) => string): string {
      let id = made.get(key);
      if (!id) {
        id = `${uid}-${key.replace(/[^a-z0-9-]/gi, '')}`;
        made.set(key, id);
        defs.push(make(id));
      }
      return `url(#${id})`;
    },
    id(key: string) {
      return made.get(key);
    },
    markup: () => defs.join(''),
  };
}

export const vertical = (id: string, top: string, bottom: string) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient>`;

export const radialGlow = (id: string, c: string, o = 0.45) =>
  `<radialGradient id="${id}"><stop offset="0" stop-color="${c}" stop-opacity="${o}"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`;

export const det = (s: Shape): Shape => ({ ...s, kind: 'detail' });
