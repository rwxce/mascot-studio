// The generic character runtime. An anatomy says how a body is built and drawn; this file
// gives every mascot the same life: idle, blinks, gaze, springs on the channels that should
// follow, the director playing data actions, props, hover/click reactions, reduced motion.
import type { FrameMode } from './clock.js';
import { Director } from './director.js';
import { bindReactions, gazeTarget } from './interact.js';
import { container, type Mascot } from './mascot.js';
import { lerp, seeded, track } from './motion.js';
import { buildProps, PROP_DEFAULTS, propsAnimator } from './props.js';
import { Rig, type Layer } from './rig.js';
import type { Painter, Style } from './style.js';
import type { AnatomyContract, MascotSpec, Point } from './spec.js';
import { Spring1, Spring2, type SpringParams } from './spring.js';
import { toActions, type ActionSpec, type Pose } from './timeline.js';

export interface Built {
  viewBox: string;
  /** Where the body's root (bottom centre) sits in the viewBox. */
  rootAt: Point;
  layers: Layer[];
  label: string;
  /** Centre and radius of the style's stage (the glow behind the character). */
  stage: [number, number, number];
}

export interface Anatomy {
  contract: AnatomyContract;
  /** Every channel with its rest value (props excluded: they are generic). */
  defaults: Pose;
  /** Built-in actions every mascot of this anatomy gets (overridable by name). */
  builtins: ActionSpec[];
  /** Channels smoothed by a spring (follow-through), with their spring. */
  springs: Record<string, SpringParams>;
  build(spec: MascotSpec, paint: Painter): Built;
  /** Idle life written onto the pose every frame (breath, sway, small fidgets). */
  idle(p: Pose, t: number): void;
  /** Channels computed from others after the actions (e.g. an antenna that lags the head). */
  derive?(p: Pose, t: number): void;
  /** Draw the pose. `gaze` is already smoothed, -1..1. */
  render(rig: Rig, p: Pose, gaze: { x: number; y: number }, t: number, paint: Painter): void;
}

export function mergeActions(builtins: ActionSpec[], own: ActionSpec[] = []): ActionSpec[] {
  const byName = new Map(builtins.map((a) => [a.name, a]));
  for (const a of own) byName.set(a.name, a);
  return [...byName.values()];
}

function blinkAt(t: number, salt: number, every: number): number {
  const k = Math.floor(t / every);
  let b = 0;
  for (const i of [k - 1, k]) {
    const tb = i * every + seeded(i, salt + 1) * every * 0.6;
    b = Math.max(b, track(t, [[tb, 0], [tb + 70, 1, 'in'], [tb + 120, 1], [tb + 280, 0, 'out']]));
    if (seeded(i, salt + 2) > 0.7) {
      const t2 = tb + 330;
      b = Math.max(b, track(t, [[t2, 0], [t2 + 70, 1, 'in'], [t2 + 110, 1], [t2 + 260, 0, 'out']]));
    }
  }
  return b;
}

let instances = 0;

export function createCharacter(spec: MascotSpec, anatomy: Anatomy, style: Style, opts: { salt?: number } = {}): Mascot {
  const salt = opts.salt ?? 0;
  const paint = style.painter({ ...spec.palette, ...(spec.palettes?.[style.id] ?? {}) }, `m${(instances++).toString(36)}${spec.name.slice(0, 3)}`);
  const built = anatomy.build(spec, paint);
  const anchors = spec.props ?? {};
  const [sx, sy, sr] = built.stage;
  const layers: Layer[] = [
    { outline: null, tag: 'stage', root: { children: paint.stage([sx, sy], sr) } },
    ...built.layers,
    { outline: null, tag: 'props', root: { at: built.rootAt, children: buildProps(anchors, { ink: paint.flat('ink'), prop: paint.flat('prop'), accent: paint.flat('accent'), glow: paint.flat('glow') }) } },
  ];
  const vb = built.viewBox.split(/\s+/).map(Number) as [number, number, number, number];
  if (paint.overlay) layers.push({ outline: null, root: { children: paint.overlay(vb) } });
  const rig = new Rig({ viewBox: built.viewBox, label: built.label, boil: paint.boil, defs: paint.defs(), layers });
  if (paint.filter) rig.svg.querySelectorAll(':scope > g').forEach((g) => g.setAttribute('filter', `url(#${paint.filter})`));
  rig.svg.dataset.style = style.id;
  const actions = mergeActions(anatomy.builtins, spec.actions);
  const director = new Director(toActions(actions), { salt: salt + 11, gap: spec.life?.gap ?? [1200, 3000] });
  const gaze = new Spring2({ freq: 2.6, damping: 0.75 });
  const springs = Object.fromEntries(Object.entries(anatomy.springs).map(([ch, p]) => [ch, new Spring1(p, anatomy.defaults[ch] ?? 0)]));
  const props = propsAnimator(anchors);
  const blinkEvery = spec.life?.blinkEvery ?? 4000;
  let lastT = 0;
  const el = container(rig.svg, spec.name);
  bindReactions(el, () => director.play('notice', lastT), () => director.play('surprise', lastT));

  function update(time: number, dt: number, mode: FrameMode) {
    lastT = time;
    const t = paint.time(time);
    const still = !!mode.still;
    const p: Pose = { ...anatomy.defaults, ...PROP_DEFAULTS };
    if (!still) {
      anatomy.idle(p, t);
      p['eyes.open'] = 1 - blinkAt(t, salt, blinkEvery);
      director.update(p, t);
      anatomy.derive?.(p, t);
    }
    let [gx, gy] = still ? [0, 0] : gazeTarget(el, t, !!mode.scripted, salt);
    const w = Math.min(1, Math.max(0, p['look.w'] ?? 0));
    gx = lerp(gx, p['look.x'] ?? 0, w);
    gy = lerp(gy, p['look.y'] ?? 0, w);
    if (still) gaze.reset(); else gaze.step(gx, gy, dt);
    for (const [ch, s] of Object.entries(springs)) {
      if (still) s.reset(anatomy.defaults[ch] ?? 0);
      else p[ch] = s.step(p[ch], dt);
    }
    rig.boil(time);
    anatomy.render(rig, p, { x: gaze.x.value, y: gaze.y.value }, t, paint);
    props.update(rig, p, dt, still, t);
  }

  return {
    name: spec.name,
    el,
    actions: actions.map((a) => a.name),
    play: (name) => director.play(name, lastT),
    playing: () => director.playing?.name ?? null,
    reset(showreel) {
      director.reset(showreel?.length ? 500 : 1200);
      if (showreel?.length) director.enqueue(...showreel);
      for (const [ch, s] of Object.entries(springs)) s.reset(anatomy.defaults[ch] ?? 0);
      gaze.reset();
      props.reset();
    },
    update,
  };
}
