import { createClock } from '../kit/clock';
import type { Mascot } from '../kit/mascot';
import { secretLetter } from '../mascots/secret-letter/index';

export const registry: Record<string, { title: string; make: () => Mascot; bg?: string }> = {
  'secret-letter': { title: 'Secret Letter', make: () => secretLetter() },
};

const params = new URLSearchParams(location.search);
const only = params.get('only');
const exporting = params.has('export');
if (exporting) document.body.classList.add('export');

const clock = createClock();
const grid = document.getElementById('grid')!;
const mascots: Record<string, Mascot> = {};

for (const [id, entry] of Object.entries(registry)) {
  if (only && id !== only) continue;
  const m = entry.make();
  mascots[id] = m;
  const card = document.createElement('section');
  card.className = 'card';
  card.id = `card-${id}`;
  if (entry.bg) card.style.background = entry.bg;
  card.innerHTML = `<h2>${entry.title}</h2>`;
  card.append(m.el);
  const actions = document.createElement('div');
  actions.className = 'actions';
  for (const a of m.actions) {
    const b = document.createElement('button');
    b.textContent = a;
    b.onclick = () => m.play(a);
    actions.append(b);
  }
  card.append(actions);
  grid.append(card);
  clock.add(m);
}

const rmQuery = matchMedia('(prefers-reduced-motion: reduce)');
const rm = document.getElementById('rm') as HTMLInputElement;
rm.checked = rmQuery.matches;
const apply = () => clock.freeze(rm.checked);
rm.addEventListener('change', apply);
rmQuery.addEventListener('change', () => { rm.checked = rmQuery.matches; apply(); });
if (!exporting) { apply(); clock.start(); }

let frames = 0, t0 = performance.now();
(function meter(now: number) {
  frames++;
  if (now - t0 >= 1000) {
    (document.getElementById('fps') as HTMLOutputElement).value = String(Math.round((frames * 1000) / (now - t0)));
    (document.getElementById('work') as HTMLOutputElement).value = `${clock.workMs.toFixed(2)} ms`;
    frames = 0; t0 = now;
  }
  requestAnimationFrame(meter);
})(t0);

// Deterministic hooks for tools/render.mjs
Object.assign(window, {
  __mascots: mascots,
  __clock: clock,
  __reset: (id: string, reel: string[]) => mascots[id].reset(reel),
  __render: (t: number, dt: number) => clock.render(t, dt),
});
