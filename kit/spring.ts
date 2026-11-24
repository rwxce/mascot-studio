// Damped springs, solved in closed form so they are exact at any frame rate and stable
// for any dt. Use them for everything that should *follow* (secondary motion): ears, tabs,
// tails, a head trailing the eyes, a prop that settles.

export interface SpringParams {
  /** Natural frequency in Hz: how fast it moves (1.5 = lazy, 4 = snappy). */
  freq: number;
  /** Damping ratio: < 1 overshoots and wobbles, 1 settles without overshoot. */
  damping: number;
}

export interface SpringState {
  value: number;
  velocity: number;
}

/**
 * Advance a spring towards `target` by `dtMs`, in place. Exact solution of
 * x'' + 2ζω x' + ω² (x − target) = 0.
 */
export function stepSpring(s: SpringState, target: number, dtMs: number, p: SpringParams): SpringState {
  const t = dtMs / 1000;
  if (t <= 0) return s;
  const w = 2 * Math.PI * p.freq;
  const z = p.damping;
  const x0 = s.value - target;
  const v0 = s.velocity;
  let x: number, v: number;
  if (z < 1) {
    const wd = w * Math.sqrt(1 - z * z);
    const e = Math.exp(-z * w * t);
    const c = Math.cos(wd * t), sn = Math.sin(wd * t);
    const b = (v0 + z * w * x0) / wd;
    x = e * (x0 * c + b * sn);
    // derivative of e·(x0·cos + b·sin)
    v = e * (-z * w * (x0 * c + b * sn) - x0 * wd * sn + b * wd * c);
  } else if (z === 1) {
    const e = Math.exp(-w * t);
    const b = v0 + w * x0;
    x = e * (x0 + b * t);
    v = e * (b - w * (x0 + b * t));
  } else {
    const r = w * Math.sqrt(z * z - 1);
    const r1 = -z * w + r, r2 = -z * w - r;
    const c2 = (v0 - r1 * x0) / (r2 - r1);
    const c1 = x0 - c2;
    const e1 = Math.exp(r1 * t), e2 = Math.exp(r2 * t);
    x = c1 * e1 + c2 * e2;
    v = c1 * r1 * e1 + c2 * r2 * e2;
  }
  s.value = target + x;
  s.velocity = v;
  return s;
}

/** A 2D spring follower, e.g. for gaze or a dangling prop. */
export class Spring2 {
  x: SpringState = { value: 0, velocity: 0 };
  y: SpringState = { value: 0, velocity: 0 };
  constructor(public params: SpringParams) {}
  step(tx: number, ty: number, dtMs: number) {
    stepSpring(this.x, tx, dtMs, this.params);
    stepSpring(this.y, ty, dtMs, this.params);
    return this;
  }
  reset(x = 0, y = 0) {
    this.x = { value: x, velocity: 0 };
    this.y = { value: y, velocity: 0 };
  }
}

/** A 1D spring follower. */
export class Spring1 {
  s: SpringState = { value: 0, velocity: 0 };
  constructor(public params: SpringParams, initial = 0) {
    this.s.value = initial;
  }
  get value() {
    return this.s.value;
  }
  step(target: number, dtMs: number) {
    return stepSpring(this.s, target, dtMs, this.params).value;
  }
  reset(v = 0) {
    this.s = { value: v, velocity: 0 };
  }
}
