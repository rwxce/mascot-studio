// Actions as data. An action is a list of tracks over named channels (`armR.rot`,
// `eyes.happy`, `prop.heart`…) plus optional jumps, so a mascot's repertoire lives in its
// mascot.json and anyone can write one without touching the engine.
import type { Action } from './director.js';
import { flow, track, type Key } from './motion.js';

export type Pose = Record<string, number>;

export interface TrackSpec {
  /** Channel name, e.g. "armR.rot". Must exist in the anatomy. */
  ch: string;
  /** [ms, value] keys. `curve: "track"` keys may carry a third element: "out" | "in". */
  keys?: Array<[number, number] | [number, number, 'out' | 'in']>;
  /** How the value combines with the pose: add (default), mul, set, min, max. */
  op?: 'add' | 'mul' | 'set' | 'min' | 'max';
  /** flow (default: smooth through poses), track (ease in/out of every key) or linear. */
  curve?: 'flow' | 'track' | 'linear';
  /** Add a sine on top: amplitude, period ms, optional phase 0..1, abs (|sin|), and a
   *  [from, to] window in ms outside which it is silent (it fades in/out over 150 ms). */
  osc?: { amp: number; period: number; phase?: number; abs?: boolean; window?: [number, number] };
  /** Scale an `add` track by the action's fade envelope (default true). */
  env?: boolean;
}

export interface JumpSpec {
  /** Take-off time (ms), time in the air (ms), height (px). */
  at: number;
  air: number;
  height: number;
  /** A startle: leaves the ground at once, no anticipation squash. */
  startle?: boolean;
}

export interface ActionSpec {
  name: string;
  duration: number;
  /** Chance of being picked when idle; 0 = only on request (reactions, buttons). */
  weight?: number;
  fade?: number;
  tracks?: TrackSpec[];
  jumps?: JumpSpec[];
}

function linear(t: number, keys: readonly (readonly [number, number])[]): number {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const [t0, v0] = keys[i - 1], [t1, v1] = keys[i];
      return t1 === t0 ? v1 : v0 + ((v1 - v0) * (t - t0)) / (t1 - t0);
    }
  }
  return keys[keys.length - 1][1];
}

/** A jump: anticipation squash, gravity arc, landing squash. Returns [y offset, sy factor]. */
export function jump(u: number, j: JumpSpec): [number, number] {
  const { at, air, height } = j;
  let y = 0;
  if (u > at && u < at + air) {
    const p = (u - at) / air;
    y = -height * 4 * p * (1 - p);
  }
  const pre: [number, number][] = j.startle ? [[0, 1], [at, 1]] : [[0, 1], [at - 180, 1], [at - 20, 0.88]];
  const sy = flow(u, [...pre, [at + 60, 1.1], [at + air * 0.5, 1.02], [at + air - 30, 1.05], [at + air + 60, 0.86], [at + air + 260, 1.04], [at + air + 520, 1], [at + air + 2000, 1]]);
  return [y, sy];
}

/** Value of one track at time u (ms since the action started). */
export function trackValue(tr: TrackSpec, u: number): number {
  let v = 0;
  if (tr.keys?.length) {
    const keys = tr.keys;
    if (tr.curve === 'track') v = track(u, keys as unknown as Key[]);
    else if (tr.curve === 'linear') v = linear(u, keys as [number, number][]);
    else v = flow(u, keys.map((k) => [k[0], k[1]] as const));
  }
  if (tr.osc) {
    const s = Math.sin((u / tr.osc.period + (tr.osc.phase ?? 0)) * Math.PI * 2);
    const [a, b] = tr.osc.window ?? [-Infinity, Infinity];
    const gate = Math.max(0, Math.min(1, (u - a) / 150, (b - u) / 150));
    v += gate * tr.osc.amp * (tr.osc.abs ? Math.abs(s) : s);
  }
  return v;
}

/** Apply one action's tracks and jumps onto the pose. */
export function applyAction(spec: ActionSpec, pose: Pose, u: number, env: number) {
  for (const tr of spec.tracks ?? []) {
    const v = trackValue(tr, u);
    const cur = pose[tr.ch] ?? 0;
    switch (tr.op ?? 'add') {
      case 'add': pose[tr.ch] = cur + v * (tr.env === false ? 1 : env); break;
      case 'mul': pose[tr.ch] = cur * v; break;
      case 'set': pose[tr.ch] = v; break;
      case 'min': pose[tr.ch] = Math.min(cur, v); break;
      case 'max': pose[tr.ch] = Math.max(cur, v); break;
    }
  }
  for (const j of spec.jumps ?? []) {
    const [y, sy] = jump(u, j);
    pose['body.y'] = (pose['body.y'] ?? 0) + y;
    pose['body.sy'] = (pose['body.sy'] ?? 1) * sy;
  }
}

/** Turn data actions into director actions. */
export function toActions(specs: ActionSpec[]): Action<Pose>[] {
  return specs.map((s) => ({
    name: s.name,
    duration: s.duration,
    weight: s.weight ?? 0,
    fade: s.fade,
    apply: (pose, u, env) => applyAction(s, pose, u, env),
  }));
}

/** Every channel an action writes to (for validation). */
export function channelsOf(spec: ActionSpec): string[] {
  const out = (spec.tracks ?? []).map((t) => t.ch);
  if (spec.jumps?.length) out.push('body.y', 'body.sy');
  return out;
}
