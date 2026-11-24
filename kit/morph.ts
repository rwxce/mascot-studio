// Shape morphing between paths with the same structure (same commands, same order).
// Drawing every pose of a part with the same commands is what keeps a character on model
// while it changes shape (a puzzle tab bending into an arm, an arm growing a thumb).

export type Seg =
  | readonly ['M' | 'L', number, number]
  | readonly ['Q', number, number, number, number]
  | readonly ['C', number, number, number, number, number, number]
  | readonly ['Z'];
export type PathSpec = readonly Seg[];

const r2 = (n: number) => Math.round(n * 100) / 100;

export function toD(spec: PathSpec): string {
  let d = '';
  for (const s of spec) {
    d += s[0];
    for (let i = 1; i < s.length; i++) d += (i > 1 ? ' ' : '') + r2(s[i] as number);
  }
  return d;
}

export function sameShape(a: PathSpec, b: PathSpec): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i][0] !== b[i][0]) return false;
  return true;
}

export function lerpPath(a: PathSpec, b: PathSpec, p: number): Seg[] {
  if (!sameShape(a, b)) throw new Error('lerpPath: paths must have the same commands in the same order');
  return a.map((s, i) => {
    const t = b[i];
    return s.map((v, j) => (j === 0 ? v : (v as number) + ((t[j] as number) - (v as number)) * p)) as unknown as Seg;
  });
}

/**
 * Blend several poses by weight (weights need not sum to 1: the base pose takes the rest).
 * `base` is the neutral pose; each entry moves it towards its pose by its weight.
 */
export function blendPaths(base: PathSpec, poses: ReadonlyArray<readonly [PathSpec, number]>): Seg[] {
  const out = base.map((s) => [...s]) as unknown as (string | number)[][];
  for (const [pose, w] of poses) {
    if (!w) continue;
    if (!sameShape(base, pose)) throw new Error('blendPaths: pose does not match the base shape');
    for (let i = 0; i < base.length; i++) {
      for (let j = 1; j < base[i].length; j++) {
        (out[i][j] as number) += ((pose[i][j] as number) - (base[i][j] as number)) * w;
      }
    }
  }
  return out as unknown as Seg[];
}

/** Move every point of a path (for hand-drawn boil): f gets point index and coords. */
export function mapPoints(spec: PathSpec, f: (i: number, x: number, y: number) => [number, number]): Seg[] {
  let k = 0;
  return spec.map((s) => {
    if (s[0] === 'Z') return s;
    const out: (string | number)[] = [s[0]];
    for (let j = 1; j < s.length; j += 2) {
      const [x, y] = f(k++, s[j] as number, s[j + 1] as number);
      out.push(x, y);
    }
    return out as unknown as Seg;
  });
}

/** Parse the subset of SVG path syntax we author in (absolute M L Q C Z). */
export function parse(d: string): Seg[] {
  const tokens = d.match(/[MLQCZ]|-?\d*\.?\d+(?:e-?\d+)?/gi) ?? [];
  const out: Seg[] = [];
  let i = 0;
  const n = () => parseFloat(tokens[i++]);
  while (i < tokens.length) {
    const c = tokens[i++].toUpperCase();
    if (c === 'M' || c === 'L') out.push([c, n(), n()]);
    else if (c === 'Q') out.push(['Q', n(), n(), n(), n()]);
    else if (c === 'C') out.push(['C', n(), n(), n(), n(), n(), n()]);
    else if (c === 'Z') out.push(['Z']);
    else throw new Error(`parse: unsupported command ${c}`);
  }
  return out;
}
