// Form: how a style CONSTRUCTS a character, between the anatomy (what parts exist, where they
// pivot, which channels move them) and the paint (what each area is filled with). A style that
// only paints recolours the same drawing; a style with a form redraws it in its own shape
// language: anime proportions and layered eyes, rubber-hose noodle arms and gloves, a clay
// puppet's short thick limbs, a pixel sprite's grid.
//
// Every field is optional. The defaults reproduce the drawing every anatomy had before forms
// existed, so a style without a "form" block renders exactly as it did. Channels never change:
// a form only decides geometry, so every action of every mascot plays in every style.

export type BrowKind = 'none' | 'thin' | 'bold' | 'anime';
/** 'default' keeps the anatomy's own hand (Nodi's knob, the robot's round arm end). */
export type HandKind = 'default' | 'knob' | 'glove' | 'mitten' | 'none';
export type FootKind = 'default' | 'shoe' | 'block';
export type LimbKind = 'rigid' | 'noodle';
export type MarkKind = 'sweat' | 'blush-lines' | 'speed-lines';

export interface Proportions {
  /** Scale of the head (Nodi: the whole body, which is its head). */
  head: number;
  /** Height ÷ width of the head (1 = as authored, > 1 = a taller, egg-shaped head). */
  aspect: number;
  /** Scale of the torso under the head. */
  body: number;
  /** Scale of arm and leg length. */
  limbLength: number;
  /** Scale of arm and leg thickness. */
  limbThickness: number;
  /** 0 = as authored … 1 = super-deformed: the head grows, the body and limbs shrink. */
  chibi: number;
}

export interface FaceLayout {
  /** Scale of the eyes (and brows). */
  scale: number;
  /** Scale of the distance between the eyes. */
  spacing: number;
  /** Move the eyes down (+) or up (−), in units of the eye height. */
  y: number;
  /** Scale of the mouth. */
  mouth: number;
}

export interface FormMotion {
  /** 0 = smooth … 1 = hold each pose, then snap to the next (limited animation). */
  snap: number;
  /** Continuous bounce on the beat, in px (rubber-hose). 0 = none. */
  bounce: number;
  /** 0 = the anatomy's springs … 1 = loose springs that overshoot and settle. */
  overshoot: number;
}

export interface Form {
  proportions: Proportions;
  /** 0 = sharp corners … 0.5 = as authored … 1 = blobby. */
  corners: number;
  /** 0 = limbs keep their thickness … 1 = limbs thin to a point at the end. */
  taper: number;
  limbs: LimbKind;
  /** Eye model id (kit/faces). */
  eyes: string;
  /** Mouth model id (kit/faces). */
  mouth: string;
  brows: BrowKind;
  hands: HandKind;
  feet: FootKind;
  face: FaceLayout;
  /** Extra marks a style may draw (sweat drop, blush hatching, speed lines). */
  marks: MarkKind[];
  /** Snap geometry to a grid of this many px (0 = off): pixel art. */
  grid: number;
  motion: FormMotion;
}

/** Deep-partial form, as written in style.json under "form". */
export type FormSpec = Partial<Omit<Form, 'proportions' | 'face' | 'motion'>> & {
  proportions?: Partial<Proportions>;
  face?: Partial<FaceLayout>;
  motion?: Partial<FormMotion>;
};

export const DEFAULT_FORM: Form = Object.freeze({
  proportions: Object.freeze({ head: 1, aspect: 1, body: 1, limbLength: 1, limbThickness: 1, chibi: 0 }),
  corners: 0.5,
  taper: 0,
  limbs: 'rigid',
  eyes: 'default',
  mouth: 'default',
  brows: 'none',
  hands: 'default',
  feet: 'default',
  face: Object.freeze({ scale: 1, spacing: 1, y: 0, mouth: 1 }),
  marks: Object.freeze([]) as unknown as MarkKind[],
  grid: 0,
  motion: Object.freeze({ snap: 0, bounce: 0, overshoot: 0 }),
}) as Form;

/** Allowed range of every numeric field (kept small enough that characters stay in frame). */
export const FORM_RANGES: Record<string, readonly [number, number]> = {
  'proportions.head': [0.6, 1.5],
  'proportions.aspect': [0.7, 1.4],
  'proportions.body': [0.6, 1.4],
  'proportions.limbLength': [0.5, 1.5],
  'proportions.limbThickness': [0.5, 2],
  'proportions.chibi': [0, 1],
  corners: [0, 1],
  taper: [0, 1],
  'face.scale': [0.5, 1.8],
  'face.spacing': [0.6, 1.5],
  'face.y': [-1, 1.2],
  'face.mouth': [0.4, 1.8],
  grid: [0, 8],
  'motion.snap': [0, 1],
  'motion.bounce': [0, 8],
  'motion.overshoot': [0, 1],
};

export const FORM_ENUMS: Record<string, readonly string[]> = {
  limbs: ['rigid', 'noodle'],
  brows: ['none', 'thin', 'bold', 'anime'],
  hands: ['default', 'knob', 'glove', 'mitten', 'none'],
  feet: ['default', 'shoe', 'block'],
};
export const MARKS: readonly MarkKind[] = ['sweat', 'blush-lines', 'speed-lines'];

/** Fill every field a style did not set with the default. */
export function resolveForm(f: FormSpec | undefined): Form {
  if (!f) return DEFAULT_FORM;
  return {
    ...DEFAULT_FORM,
    ...f,
    proportions: { ...DEFAULT_FORM.proportions, ...f.proportions },
    face: { ...DEFAULT_FORM.face, ...f.face },
    motion: { ...DEFAULT_FORM.motion, ...f.motion },
    marks: [...(f.marks ?? [])],
  };
}

export interface FormIssue { path: string; message: string }

/** Check a style's form block. `eyes` and `mouth` are the ids of the registered models. */
export function validateForm(f: unknown, models: { eyes: readonly string[]; mouths: readonly string[] }): FormIssue[] {
  const issues: FormIssue[] = [];
  if (f === undefined) return issues;
  if (!f || typeof f !== 'object' || Array.isArray(f)) return [{ path: 'form', message: 'must be an object' }];
  const known = new Set(Object.keys(DEFAULT_FORM));
  const groups: Record<string, Set<string>> = {
    proportions: new Set(Object.keys(DEFAULT_FORM.proportions)),
    face: new Set(Object.keys(DEFAULT_FORM.face)),
    motion: new Set(Object.keys(DEFAULT_FORM.motion)),
  };
  for (const [k, v] of Object.entries(f as Record<string, unknown>)) {
    if (!known.has(k)) { issues.push({ path: `form.${k}`, message: 'unknown field' }); continue; }
    if (groups[k]) {
      if (!v || typeof v !== 'object') { issues.push({ path: `form.${k}`, message: 'must be an object' }); continue; }
      for (const [kk, vv] of Object.entries(v as Record<string, unknown>)) {
        if (!groups[k].has(kk)) issues.push({ path: `form.${k}.${kk}`, message: 'unknown field' });
        else checkNumber(`${k}.${kk}`, vv);
      }
    } else if (k in FORM_ENUMS) {
      if (!FORM_ENUMS[k].includes(v as string)) issues.push({ path: `form.${k}`, message: `"${String(v)}" is not one of ${FORM_ENUMS[k].join(', ')}` });
    } else if (k === 'eyes' || k === 'mouth') {
      const ids = k === 'eyes' ? models.eyes : models.mouths;
      if (!ids.includes(v as string)) issues.push({ path: `form.${k}`, message: `unknown ${k === 'eyes' ? 'eye' : 'mouth'} model "${String(v)}"` });
    } else if (k === 'marks') {
      if (!Array.isArray(v)) issues.push({ path: 'form.marks', message: 'must be an array' });
      else for (const m of v) if (!MARKS.includes(m)) issues.push({ path: 'form.marks', message: `unknown mark "${String(m)}"` });
    } else checkNumber(k, v);
  }
  function checkNumber(path: string, v: unknown) {
    const r = FORM_RANGES[path];
    if (typeof v !== 'number' || !Number.isFinite(v)) issues.push({ path: `form.${path}`, message: 'must be a number' });
    else if (r && (v < r[0] || v > r[1])) issues.push({ path: `form.${path}`, message: `${v} is outside ${r[0]}..${r[1]}` });
  }
  return issues;
}

// ---------------------------------------------------------------- helpers for anatomies

/** Effective scales once chibi has moved mass from the body into the head. */
export function scales(f: Form) {
  const p = f.proportions, c = p.chibi;
  return {
    head: p.head * (1 + 0.32 * c),
    aspect: p.aspect,
    body: p.body * (1 - 0.28 * c),
    arm: p.limbLength * (1 - 0.3 * c),
    leg: p.limbLength * (1 - 0.45 * c),
    thick: p.limbThickness,
  };
}

/** Multiplier for an authored corner radius: 1 at corners 0.5, ~0.1 at 0, 1.8 at 1. */
export const cornerScale = (c: number) => (c <= 0.5 ? 0.1 + 1.8 * c : 1 + 1.6 * (c - 0.5));

/** Snap a length to the form's grid (identity when the grid is off). */
export const snapTo = (f: Form, v: number) => (f.grid ? Math.round(v / f.grid) * f.grid || f.grid : v);

/**
 * Hold-then-snap time: each period holds most of its length, then moves through it quickly.
 * Applied to the character's clock, so every action keeps its timing on average.
 */
export function snapTime(t: number, snap: number, period = 240): number {
  if (snap <= 0) return t;
  const k = Math.floor(t / period), u = t / period - k;
  const hold = 0.55 * snap;
  const v = u <= hold ? 0 : (u - hold) / (1 - hold);
  const e = v * v * (3 - 2 * v);
  return (k + e) * period;
}

/** Is this the untouched default form? (Anatomies can take their original fast path.) */
export const isDefaultForm = (f: Form) => f === DEFAULT_FORM;
