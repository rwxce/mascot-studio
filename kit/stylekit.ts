// Building blocks for styles: palette transforms, SVG patterns and stages. Each style folder
// composes these into a painter; nothing here knows about any anatomy.
import { darken, grey, hexToRgb, lighten, mix, rgbToHex, saturate, type RGB } from './color.js';
import { seeded } from './motion.js';
import type { Part, Shape } from './rig.js';
import { defsBook, resolvePalette, type Painter, type Palette, type Role } from './style.js';

export const det = (s: Shape): Shape => ({ ...s, kind: 'detail' });
export type Full = ReturnType<typeof resolvePalette>;

// ---------------------------------------------------------------- palettes
export const ROLES: Role[] = ['body', 'body-dark', 'belly', 'inside', 'accent', 'eye', 'shine', 'cheek', 'line', 'visor', 'prop', 'glow', 'ink'];

export function mapPalette(P: Full, f: (c: string, role: Role) => string): Full {
  const out = { ...P } as Full;
  for (const r of ROLES) out[r] = f(P[r], r);
  return out;
}

export const sepia = (c: string) => {
  const g = grey(c) / 255;
  return rgbToHex([g * 240 + 20, g * 205 + 18, g * 160 + 12] as RGB);
};
export const muted = (c: string) => mix(saturate(c, -0.45), '#8a7a66', 0.18);
export function posterize(c: string, levels = 3): string {
  const q = (v: number) => Math.round((v / 255) * (levels - 1)) * (255 / (levels - 1));
  return rgbToHex(hexToRgb(c).map(q) as RGB);
}
/** Nearest colour of a small set of inks (by RGB distance). */
export function nearest(c: string, inks: string[]): string {
  const x = hexToRgb(c);
  let best = inks[0], d = Infinity;
  for (const k of inks) {
    const y = hexToRgb(k);
    const e = (x[0] - y[0]) ** 2 + (x[1] - y[1]) ** 2 + (x[2] - y[2]) ** 2;
    if (e < d) { d = e; best = k; }
  }
  return best;
}
export const isDark = (c: string) => grey(c) < 110;

// ---------------------------------------------------------------- patterns (return markup)
export const pat = {
  halftone: (id: string, base: string, dot: string, size = 6, r = 1.6, angle = 45) =>
    `<pattern id="${id}" width="${size}" height="${size}" patternUnits="userSpaceOnUse" patternTransform="rotate(${angle})"><rect width="${size}" height="${size}" fill="${base}"/><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="${dot}"/></pattern>`,
  hatch: (id: string, base: string, line: string, gap = 4, angle = 45, w = 1) =>
    `<pattern id="${id}" width="${gap}" height="${gap}" patternUnits="userSpaceOnUse" patternTransform="rotate(${angle})"><rect width="${gap}" height="${gap}" fill="${base}"/><line x1="0" y1="0" x2="0" y2="${gap}" stroke="${line}" stroke-width="${w}"/></pattern>`,
  knit: (id: string, base: string, dark: string) =>
    `<pattern id="${id}" width="6" height="7" patternUnits="userSpaceOnUse"><rect width="6" height="7" fill="${base}"/><path d="M0.6 0.5Q1.6 4.6 3 6.4M5.4 0.5Q4.4 4.6 3 6.4" fill="none" stroke="${dark}" stroke-width="1.15" stroke-linecap="round"/></pattern>`,
  /** Ordered dither in black and white; level 0 (white) .. 4 (black). */
  dither: (id: string, level: number, ink = '#111111', paper = '#F4F1E8') => {
    const cells: Record<number, string> = {
      1: '<rect x="0" y="0" width="1" height="1"/>',
      2: '<rect x="0" y="0" width="1" height="1"/><rect x="2" y="2" width="1" height="1"/><rect x="2" y="0" width="1" height="1"/><rect x="0" y="2" width="1" height="1"/>',
      3: '<rect width="4" height="4"/><rect x="1" y="1" width="1" height="1" fill="PAPER"/><rect x="3" y="3" width="1" height="1" fill="PAPER"/>',
    };
    if (level <= 0) return `<pattern id="${id}" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="4" fill="${paper}"/></pattern>`;
    if (level >= 4) return `<pattern id="${id}" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="4" fill="${ink}"/></pattern>`;
    return `<pattern id="${id}" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="scale(1.6)"><rect width="4" height="4" fill="${paper}"/><g fill="${ink}">${cells[level].replace(/PAPER/g, paper)}</g></pattern>`;
  },
  wood: (id: string, base: string, line: string) =>
    `<pattern id="${id}" width="40" height="9" patternUnits="userSpaceOnUse"><rect width="40" height="9" fill="${base}"/><path d="M0 3Q10 1.5 20 3.4T40 3M0 7.5Q12 6.4 22 7.8T40 7.2" fill="none" stroke="${line}" stroke-width=".7" opacity=".55"/></pattern>`,
  wax: (id: string, base: string, color: string) => {
    let marks = '';
    for (let i = 0; i < 14; i++) {
      const x = seeded(i, 1) * 16, y = seeded(i, 2) * 16, l = 2 + seeded(i, 3) * 4;
      marks += `<path d="M${x.toFixed(1)} ${y.toFixed(1)}l${l.toFixed(1)} ${(-l * 0.6).toFixed(1)}" stroke="${base}" stroke-width="1.1" stroke-linecap="round" opacity=".55"/>`;
    }
    return `<pattern id="${id}" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="16" height="16" fill="${color}"/>${marks}</pattern>`;
  },
  grain: (id: string, color: string, n = 26, size = 24, alpha = 0.18) => {
    let dots = '';
    for (let i = 0; i < n; i++) dots += `<circle cx="${(seeded(i, 7) * size).toFixed(1)}" cy="${(seeded(i, 8) * size).toFixed(1)}" r="${(0.3 + seeded(i, 9) * 0.5).toFixed(2)}" fill="${color}" opacity="${alpha}"/>`;
    return `<pattern id="${id}" width="${size}" height="${size}" patternUnits="userSpaceOnUse">${dots}</pattern>`;
  },
  grid: (id: string, line: string, size = 10, w = 0.5) =>
    `<pattern id="${id}" width="${size}" height="${size}" patternUnits="userSpaceOnUse"><path d="M${size} 0L0 0L0 ${size}" fill="none" stroke="${line}" stroke-width="${w}"/></pattern>`,
  scanlines: (id: string, color: string) =>
    `<pattern id="${id}" width="4" height="3" patternUnits="userSpaceOnUse"><rect width="4" height="1" fill="${color}" opacity=".18"/></pattern>`,
  facets: (id: string, c: string) =>
    `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${lighten(c, 0.28)}"/><stop offset=".33" stop-color="${lighten(c, 0.28)}"/><stop offset=".33" stop-color="${lighten(c, 0.08)}"/><stop offset=".62" stop-color="${lighten(c, 0.08)}"/><stop offset=".62" stop-color="${c}"/><stop offset=".82" stop-color="${c}"/><stop offset=".82" stop-color="${darken(c, 0.16)}"/><stop offset="1" stop-color="${darken(c, 0.16)}"/></linearGradient>`,
  radial: (id: string, c: string, light = 0.42, dark = 0.18) =>
    `<radialGradient id="${id}" cx=".35" cy=".3" r=".85"><stop offset="0" stop-color="${lighten(c, light)}"/><stop offset=".55" stop-color="${c}"/><stop offset="1" stop-color="${darken(c, dark)}"/></radialGradient>`,
  vertical: (id: string, top: string, bottom: string) =>
    `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient>`,
  glass: (id: string, c: string) =>
    `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${lighten(c, 0.65)}" stop-opacity=".85"/><stop offset=".45" stop-color="${c}" stop-opacity=".55"/><stop offset="1" stop-color="${darken(c, 0.2)}" stop-opacity=".7"/></linearGradient>`,
};

/** Pixelate everything drawn through it (block size in px). The character runtime sets the
 *  filter region to the viewBox (userSpaceOnUse) and moves the sample point inside it. */
export const pixelateFilter = (id: string, block = 4) =>
  `<filter id="${id}" data-block="${block}" filterUnits="userSpaceOnUse" x="0" y="0" width="1" height="1"><feFlood x="${block / 2}" y="${block / 2}" height="1" width="1"/><feComposite width="${block}" height="${block}"/><feTile result="a"/><feComposite in="SourceGraphic" in2="a" operator="in"/><feMorphology operator="dilate" radius="${block / 2}"/></filter>`;

// ---------------------------------------------------------------- stages
export const stages = {
  none: (): Part[] => [],
  glow: (book: ReturnType<typeof defsBook>, c: string, o = 0.45) => (at: [number, number], r: number): Part[] => [{
    at, shapes: [det({ el: { tag: 'circle', attrs: { r, fill: book.use(`glow-${c}`, (id) => `<radialGradient id="${id}"><stop offset="0" stop-color="${c}" stop-opacity="${o}"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`) } } })],
  }],
  dots: (book: ReturnType<typeof defsBook>, c: string) => (at: [number, number], r: number): Part[] => [{
    at, shapes: [det({ el: { tag: 'circle', attrs: { r: r * 0.95, fill: book.use('stage-dots', (id) => pat.halftone(id, 'transparent', c, 9, 1.4, 0)) } } })],
  }],
  burst: (c: string) => (at: [number, number], r: number): Part[] => {
    let d = '';
    for (let i = 0; i < 16; i++) {
      const a0 = (i / 16) * Math.PI * 2, a1 = ((i + 0.5) / 16) * Math.PI * 2;
      d += `M0 0L${(Math.cos(a0) * r).toFixed(1)} ${(Math.sin(a0) * r).toFixed(1)}L${(Math.cos(a1) * r).toFixed(1)} ${(Math.sin(a1) * r).toFixed(1)}Z`;
    }
    return [{ at, shapes: [det({ d, fill: c })] }];
  },
  blobs: (colors: string[]) => (at: [number, number], r: number): Part[] => [{
    at, shapes: colors.map((c, i) => det({ el: { tag: 'circle', attrs: { cx: [-0.4, 0.45, 0.05][i % 3] * r, cy: [-0.45, -0.25, 0.55][i % 3] * r, r: r * 0.36, fill: c, opacity: 0.32 } } })),
  }],
  sunGrid: (book: ReturnType<typeof defsBook>) => (at: [number, number], r: number): Part[] => {
    const sun = book.use('sun', (id) => `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE45E"/><stop offset="1" stop-color="#FF3E9A"/></linearGradient>`);
    let grid = '';
    for (let i = -6; i <= 6; i++) grid += `M${i * 8} ${r * 0.18}L${i * 30} ${r * 0.62}`;
    for (let j = 0; j < 5; j++) { const y = r * 0.18 + (j * j + 1) * r * 0.022; grid += `M${-r} ${y.toFixed(1)}L${r} ${y.toFixed(1)}`; }
    return [{
      at, shapes: [
        det({ el: { tag: 'circle', attrs: { cx: 0, cy: -r * 0.12, r: r * 0.5, fill: sun, opacity: 0.85 } } }),
        det({ d: [0.0, 0.08, 0.15].map((k) => `M${(-r * 0.5).toFixed(1)} ${(r * k - r * 0.04).toFixed(1)}L${(r * 0.5).toFixed(1)} ${(r * k - r * 0.04).toFixed(1)}`).join(''), stroke: '#1A0B2E', width: 3 }),
        det({ d: grid, stroke: '#FF4FD8', width: 0.8, opacity: 0.7 }),
      ],
    }];
  },
  grid: (book: ReturnType<typeof defsBook>, line: string) => (at: [number, number], r: number): Part[] => [{
    at, shapes: [det({ el: { tag: 'rect', attrs: { x: -r * 1.3, y: -r * 1.3, width: r * 2.6, height: r * 2.6, fill: book.use('stage-grid', (id) => pat.grid(id, line, 10, 0.5)) } } })],
  }],
  board: (frame: string) => (at: [number, number], r: number): Part[] => [{
    at, shapes: [det({ el: { tag: 'rect', attrs: { x: -r * 0.92, y: -r * 0.92, width: r * 1.84, height: r * 1.84, rx: 6, fill: 'none', stroke: frame, 'stroke-width': 4, opacity: 0.55 } } })],
  }],
};

// ---------------------------------------------------------------- painter base
export interface PainterOptions {
  fill?: (role: Role, P: Full, book: ReturnType<typeof defsBook>) => string;
  flat?: (role: Role, P: Full) => string;
  outline?: ((w: number, P: Full) => { color: string; width: number } | null);
  lineWidth?: (w: number) => number;
  shine?: boolean;
  cheekRest?: number;
  shadow?: string;
  stage?: (book: ReturnType<typeof defsBook>, P: Full) => Painter['stage'];
  step?: number;
  boil?: number;
  overlay?: (book: ReturnType<typeof defsBook>, P: Full) => Painter['overlay'];
  filter?: (book: ReturnType<typeof defsBook>) => string | undefined;
  look?: (P: Full) => Painter['look'];
  frame?: Painter['frame'];
  /** Transform the whole palette first (sepia, inks, posterize…). */
  palette?: (P: Full) => Full;
  /** Keep light eyes light (on a dark visor). Off for styles that paint every area white. */
  keepLightEyes?: boolean;
}

export function makePainter(palette: Palette, uid: string, o: PainterOptions): Painter {
  const original = resolvePalette(palette) as Full;
  let P = original;
  if (o.palette) P = o.palette(P);
  // Light eyes stay light: a style must not turn a robot's glowing eyes dark on its dark visor.
  const eyesWereLight = (o.keepLightEyes ?? true) && grey(original.eye) > 140;
  const keepEye = (role: Role, c: string) => (role === 'eye' && eyesWereLight && /^#/.test(c) && grey(c) < 110 ? '#F4F1E8' : c);
  const book = defsBook(uid);
  const flat = (role: Role) => keepEye(role, o.flat ? o.flat(role, P) : P[role]);
  const filterId = o.filter?.(book);
  return {
    uid,
    fill: (role) => keepEye(role, o.fill ? o.fill(role, P, book) : P[role]),
    flat,
    outline: (w = 1) => (o.outline ? o.outline(w, P) : null),
    lineWidth: o.lineWidth ?? ((w) => w * 0.6),
    shine: o.shine ?? false,
    cheekRest: o.cheekRest ?? 0,
    shadow: o.shadow ?? 'rgba(20,20,20,.12)',
    stage: o.stage ? o.stage(book, P) : () => [],
    defs: () => book.markup(),
    time: o.step ? (t) => Math.floor(t / o.step!) * o.step! : (t) => t,
    boil: o.boil ?? 0,
    overlay: o.overlay?.(book, P),
    filter: filterId ? filterId.replace(/^url\(#|\)$/g, '') : undefined,
    look: o.look?.(P),
    frame: o.frame,
  };
}

/** Roles that carry big areas (bodies, bellies), as opposed to eyes, lines and props. */
export const AREA: Role[] = ['body', 'body-dark', 'belly', 'inside', 'visor', 'accent'];
export const isArea = (r: Role) => AREA.includes(r);
