// Pointer tracking shared by every mascot on the page: where to look, and hover / click
// reactions. One listener for the whole page; each mascot reads it in its own frame.
import { clamp, seeded } from './motion.js';

const pointer = { x: 0, y: 0, at: -1e9 };
if (typeof window !== 'undefined') {
  addEventListener('pointermove', (e) => {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.at = performance.now();
  }, { passive: true });
}

/**
 * Where a mascot should look, -1..1 on each axis: at the pointer when it moved in the last
 * 2.5 s, otherwise idle glances held for a while (seeded, so exports are repeatable).
 */
export function gazeTarget(el: Element, t: number, scripted: boolean, salt: number): [number, number] {
  if (scripted) return [Math.sin(t / 1900 + salt) * 0.8, Math.cos(t / 2600 + salt) * 0.4];
  if (performance.now() - pointer.at < 2500) {
    const r = el.getBoundingClientRect();
    return [
      clamp((pointer.x - (r.left + r.width / 2)) / (r.width * 0.9), -1, 1),
      clamp((pointer.y - (r.top + r.height * 0.45)) / (r.height * 0.9), -1, 1),
    ];
  }
  const beat = Math.floor((t + salt * 997) / 1700);
  return [(seeded(beat, salt) - 0.5) * 1.5, (seeded(beat, salt + 3) - 0.5) * 0.8];
}

/** Call `onHover` when the pointer enters (at most every 4 s) and `onClick` on click. */
export function bindReactions(el: Element, onHover: () => void, onClick: () => void) {
  let lastHover = -1e9;
  el.addEventListener('pointerenter', () => {
    const now = performance.now();
    if (now - lastHover > 4000) {
      lastHover = now;
      onHover();
    }
  });
  el.addEventListener('click', onClick);
}
