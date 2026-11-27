// Limbs that come in front of the body when they rise.
//
// At rest a limb joins the body from behind: its root sits inside the body, so the joint has no
// seam (CRAFT.md → Drawing). Raised (waving, hopping, cheering) it must be drawn in front of the
// body and the face, or the body's corner covers it and its outline pokes out as a dark smudge.
// So each limb is built twice with the same ids (the rig moves both copies together): a back
// copy in the layer it always had, and a front copy in a layer over the body. frontWhenRaised()
// shows one and hides the other, with a one-frame switch (a crossfade would show both at once)
// and hysteresis, so a waving arm oscillating around the threshold does not flicker.
import type { Part, Rig } from './rig.js';

/** The back copy of a limb: its usual place, masked by the body it hides behind. */
export function backLimb(limb: Part, behind?: Part[]): Part {
  return { id: `${limb.id}@back`, data: { limb: limb.id!, copy: 'back' }, children: [{ ...limb, behind }] };
}

/** The front copy of a limb, hidden until the limb rises. */
export function frontLimb(limb: Part): Part {
  return { id: `${limb.id}@front`, opacity: 0, data: { limb: limb.id!, copy: 'front' }, children: [limb] };
}

/** Lift at which a limb comes to the front, and the lower one at which it goes back. */
export const FRONT_UP = 0.5, FRONT_DOWN = 0.4;

const state = new WeakMap<Rig, Map<string, { front: boolean; lift: string }>>();

/**
 * Show the front or the back copy of limb `id`. `lift` is how raised it is: 0 at rest, 1 when
 * the hand is clearly above the shoulder (each anatomy maps its own channels to it).
 */
export function frontWhenRaised(rig: Rig, id: string, lift: number): boolean {
  let m = state.get(rig);
  if (!m) state.set(rig, (m = new Map()));
  const s = m.get(id);
  const front = s?.front ? lift > FRONT_DOWN : lift > FRONT_UP;
  if (!s || s.front !== front) {
    rig.opacity(`${id}@front`, front ? 1 : 0);
    rig.opacity(`${id}@back`, front ? 0 : 1);
  }
  // Recorded for `pnpm check` (front-limbs), only when it changes.
  const l = (Math.round(Math.max(0, lift) * 20) / 20).toFixed(2);
  if (!s || s.lift !== l) rig.data(`${id}@front`, 'lift', l);
  m.set(id, { front, lift: l });
  return front;
}
