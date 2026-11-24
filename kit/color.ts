// Small colour helpers for styles (no dependencies).

export type RGB = [number, number, number];

export function hexToRgb(hex: string): RGB {
  const h = hex.length === 4 ? hex.replace(/^#(.)(.)(.)$/, '#$1$1$2$2$3$3') : hex;
  return [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)) as RGB;
}

export function rgbToHex([r, g, b]: RGB): string {
  return '#' + [r, g, b].map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('');
}

/** Mix a towards b by t (0..1). */
export function mix(a: string, b: string, t: number): string {
  const x = hexToRgb(a), y = hexToRgb(b);
  return rgbToHex([0, 1, 2].map((i) => x[i] + (y[i] - x[i]) * t) as RGB);
}

export const lighten = (c: string, t: number) => mix(c, '#ffffff', t);
export const darken = (c: string, t: number) => mix(c, '#000000', t);

/** Grey value 0..255 (for monochrome styles). */
export function grey(c: string): number {
  const [r, g, b] = hexToRgb(c);
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

/** Hue-preserving saturation boost/cut, t in -1..1. */
export function saturate(c: string, t: number): string {
  const [r, g, b] = hexToRgb(c);
  const l = (r + g + b) / 3;
  return rgbToHex([r, g, b].map((v) => l + (v - l) * (1 + t)) as RGB);
}
