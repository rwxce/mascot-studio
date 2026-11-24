// mascot.json: everything a mascot is, as data. The anatomy brings the skeleton and the
// built-in life (idle, blinks, gaze, reactions); the spec brings proportions, colours,
// props and its own actions. validateSpec() is what `pnpm check` runs first.
import { resolvePalette } from './style.js';
import type { ActionSpec } from './timeline.js';

export type Point = [number, number];

export interface MascotSpec {
  $schema?: string;
  /** Folder name, kebab-case. */
  name: string;
  /** Display name. */
  title: string;
  /** One line: who it is and how it moves. */
  description?: string;
  anatomy: string;
  /** Style id (styles/<id>); defaults to the anatomy's. */
  style?: string;
  /** Colours by role. Which roles exist depends on the anatomy (see its ANATOMY.md). */
  palette: Record<string, string>;
  /** Per-style tweaks merged over `palette` (e.g. a pink body in soft-gradient). */
  palettes?: Record<string, Record<string, string>>;
  /** Anatomy parameters (sizes, optional parts). */
  body?: Record<string, number | boolean | string>;
  /** Props by name → anchor point (root coordinates, y up is negative). */
  props?: Partial<Record<PropName, Point | Point[]>>;
  /** The mascot's own actions; same-name entries replace the anatomy's built-ins. */
  actions?: ActionSpec[];
  /** Blink/gaze/idle tuning. */
  life?: { blinkEvery?: number; gap?: [number, number] };
}

export const PROP_NAMES = ['bulb', 'heart', 'zzz', 'sparkles', 'note', 'question', 'exclaim'] as const;
export type PropName = (typeof PROP_NAMES)[number];

export interface SpecIssue {
  path: string;
  message: string;
}

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
const KEBAB = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

/** Relative luminance (WCAG). */
export function luminance(hex: string): number {
  const h = hex.length === 4 ? hex.replace(/^#(.)(.)(.)$/, '#$1$1$2$2$3$3') : hex;
  const c = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

export function contrast(a: string, b: string): number {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

export interface AnatomyContract {
  name: string;
  channels: readonly string[];
  /** Palette roles the anatomy uses; any missing one is derived from `body` (kit/style.ts). */
  palette: readonly string[];
  /** Roles a mascot must set. */
  required: readonly string[];
  /** [eye colour role, the role the eyes sit on] pairs that must reach 3:1. */
  contrastPairs: readonly [string, string][];
  body?: Record<string, 'number' | 'boolean' | 'string'>;
  builtins: readonly string[];
}

/** Static rules. Returns every problem found (empty = valid). */
export function validateSpec(spec: MascotSpec, anatomy: AnatomyContract): SpecIssue[] {
  const issues: SpecIssue[] = [];
  const add = (path: string, message: string) => issues.push({ path, message });
  if (!spec || typeof spec !== 'object') return [{ path: '', message: 'spec must be an object' }];
  if (!KEBAB.test(spec.name ?? '')) add('name', 'must be kebab-case, e.g. "my-mascot"');
  if (!spec.title) add('title', 'is required');
  if (spec.anatomy !== anatomy.name) add('anatomy', `is "${spec.anatomy}", expected "${anatomy.name}"`);

  for (const role of anatomy.required) {
    if (!spec.palette?.[role]) add(`palette.${role}`, 'is required by the anatomy');
  }
  for (const [role, c] of Object.entries(spec.palette ?? {})) {
    if (!anatomy.palette.includes(role)) add(`palette.${role}`, `unknown role (known: ${anatomy.palette.join(', ')})`);
    else if (!HEX.test(c)) add(`palette.${role}`, `"${c}" is not a hex colour`);
  }
  for (const [style, over] of Object.entries(spec.palettes ?? {})) {
    for (const [role, c] of Object.entries(over)) {
      if (!anatomy.palette.includes(role)) add(`palettes.${style}.${role}`, 'unknown role');
      else if (!HEX.test(c)) add(`palettes.${style}.${role}`, `"${c}" is not a hex colour`);
    }
    const merged = { ...spec.palette, ...over };
    for (const [eye, on] of anatomy.contrastPairs) {
      const f = resolvePalette(merged);
      if (HEX.test(f[eye]) && HEX.test(f[on]) && contrast(f[eye], f[on]) < 3) add(`palettes.${style}.${eye}`, `contrast with ${on} is ${contrast(f[eye], f[on]).toFixed(2)}:1, needs 3:1`);
    }
  }
  const full = issues.length ? {} as Record<string, string> : resolvePalette(spec.palette);
  for (const [eye, on] of anatomy.contrastPairs) {
    const a = full[eye], b = full[on];
    if (a && b && HEX.test(a) && HEX.test(b) && contrast(a, b) < 3) {
      add(`palette.${eye}`, `contrast with ${on} is ${contrast(a, b).toFixed(2)}:1, needs 3:1 so the face reads`);
    }
  }
  for (const [k, v] of Object.entries(spec.body ?? {})) {
    const t = anatomy.body?.[k];
    if (!t) add(`body.${k}`, `unknown parameter (known: ${Object.keys(anatomy.body ?? {}).join(', ') || 'none'})`);
    else if (typeof v !== t) add(`body.${k}`, `must be a ${t}`);
  }
  for (const k of Object.keys(spec.props ?? {})) {
    if (!(PROP_NAMES as readonly string[]).includes(k)) add(`props.${k}`, `unknown prop (known: ${PROP_NAMES.join(', ')})`);
  }

  const names = new Set<string>();
  (spec.actions ?? []).forEach((a, i) => {
    const at = `actions[${i}]${a?.name ? ` (${a.name})` : ''}`;
    if (!a?.name || !KEBAB.test(a.name)) add(at, 'name must be kebab-case');
    if (names.has(a.name)) add(at, 'duplicate action name');
    names.add(a.name);
    if (!(a.duration > 0)) add(at, 'duration must be > 0 ms');
    if (a.duration > 15000) add(at, 'duration over 15 s: split it, idle life should come back');
    (a.tracks ?? []).forEach((tr, j) => {
      const tp = `${at}.tracks[${j}]`;
      const isProp = tr.ch?.startsWith('prop.');
      const prop = isProp ? tr.ch.slice(5) : '';
      const propOk = isProp && (['rays', 'heart', 'bulb', 'zzz', 'sparkles', 'note', 'question', 'exclaim'].includes(prop));
      if (!anatomy.channels.includes(tr.ch) && !propOk) add(tp, `unknown channel "${tr.ch}"`);
      if (propOk && prop !== 'rays' && !spec.props?.[prop as PropName]) add(tp, `uses prop "${prop}" but props.${prop} has no anchor`);
      if (!tr.keys?.length && !tr.osc) add(tp, 'needs keys or osc');
      let last = -Infinity;
      for (const k of tr.keys ?? []) {
        if (k[0] < last) add(tp, 'keys must be sorted by time');
        if (k[0] > a.duration) add(tp, `key at ${k[0]} ms is after the end (${a.duration} ms)`);
        last = k[0];
      }
      if ((tr.op ?? 'add') === 'add' && tr.keys?.length) {
        const first = tr.keys[0][1], lastV = tr.keys[tr.keys.length - 1][1];
        if (tr.env === false && (Math.abs(first) > 1e-6 || Math.abs(lastV) > 1e-6)) {
          add(tp, 'an add track without the envelope must start and end at 0, or it jumps');
        }
      }
    });
    for (const j of a.jumps ?? []) {
      if (!j.startle && j.at - 200 < 0) add(at, `jump at ${j.at} ms leaves no room for the anticipation (needs ≥ 200 ms)`);
      if (j.at + j.air + 520 > a.duration) add(at, `jump lands too late to settle before the end (${a.duration} ms)`);
    }
  });
  return issues;
}
