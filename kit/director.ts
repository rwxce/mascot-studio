// The director decides what a mascot is doing. Idle life always runs underneath; on top of
// it the director plays one action at a time, fading it in and out so poses blend instead of
// cutting. Between actions it waits a varied gap and picks the next idle action by weight,
// never the same one twice in a row. Reactions (hover, click) interrupt the current action.
import { seeded } from './motion.js';

export interface Action<P> {
  name: string;
  /** Length in ms. */
  duration: number;
  /** Fade in/out at the edges, ms (blend with idle). Default 250. */
  fade?: number;
  /** Relative chance of being picked as an idle action; 0 = only on request. */
  weight?: number;
  /**
   * Write this action's contribution into the pose. `u` is ms since the action started,
   * `env` the 0..1 blend envelope (use it to scale offsets so the action eases in and out).
   */
  apply(pose: P, u: number, env: number): void;
}

export interface Playing {
  name: string;
  start: number;
}

export class Director<P> {
  private current: { action: Action<P>; start: number } | null = null;
  private nextAt = 1200;
  private last = '';
  private pick = 0;
  private queue: string[] = [];
  private byName: Map<string, Action<P>>;

  constructor(
    private actions: Action<P>[],
    private opts: { gap?: [number, number]; salt?: number } = {},
  ) {
    this.byName = new Map(actions.map((a) => [a.name, a]));
  }

  get playing(): Playing | null {
    return this.current ? { name: this.current.action.name, start: this.current.start } : null;
  }

  /** Play an action now (reactions, buttons). Replaces the current one. */
  play(name: string, t: number) {
    const action = this.byName.get(name);
    if (!action) return;
    this.current = { action, start: t };
    this.last = name;
  }

  /** Queue actions to play in order (showreels, exports). Disables random picks while queued. */
  enqueue(...names: string[]) {
    this.queue.push(...names);
  }

  /** Reset to a fresh state (deterministic exports start here). */
  reset(nextAt = 600) {
    this.current = null;
    this.nextAt = nextAt;
    this.last = '';
    this.pick = 0;
    this.queue = [];
  }

  /** Advance to time t and apply the active action onto the pose. */
  update(pose: P, t: number) {
    if (this.current && t - this.current.start >= this.current.action.duration) {
      this.current = null;
      const [lo, hi] = this.opts.gap ?? [900, 2600];
      this.nextAt = t + lo + seeded(this.pick, (this.opts.salt ?? 0) + 5) * (hi - lo);
    }
    if (!this.current && t >= this.nextAt) {
      const name = this.queue.length ? this.queue.shift()! : this.choose();
      if (name) this.play(name, t);
    }
    if (!this.current) return;
    const { action, start } = this.current;
    const u = t - start;
    const fade = action.fade ?? 250;
    const env = Math.min(1, u / fade, (action.duration - u) / fade);
    action.apply(pose, u, Math.max(0, smooth(env)));
  }

  private choose(): string | null {
    const pool = this.actions.filter((a) => (a.weight ?? 0) > 0 && a.name !== this.last);
    if (!pool.length) return null;
    const total = pool.reduce((s, a) => s + (a.weight ?? 0), 0);
    let r = seeded(++this.pick, this.opts.salt ?? 0) * total;
    for (const a of pool) {
      r -= a.weight ?? 0;
      if (r <= 0) return a.name;
    }
    return pool[pool.length - 1].name;
  }
}

/** Smoothstep for envelopes. */
const smooth = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
