// What every mascot exposes: an element to mount, a frame update for the clock, and its
// actions so a page (or an export) can trigger them.
import type { FrameMode, Subject } from './clock.js';

export interface Mascot extends Subject {
  name: string;
  el: HTMLElement;
  /** Every action name, in display order. */
  actions: string[];
  /** Play an action now. */
  play(action: string): void;
  /** Deterministic start for exports: clear state, optionally queue a showreel. */
  reset(showreel?: string[]): void;
  update(t: number, dt: number, mode: FrameMode): void;
}

/** Wrap an SVG in the mascot's container element. */
export function container(svg: SVGSVGElement, name: string): HTMLElement {
  const el = document.createElement('div');
  el.className = 'mascot';
  el.dataset.mascot = name;
  el.style.cursor = 'pointer';
  el.append(svg);
  return el;
}
