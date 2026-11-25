// Live Nodi for other pages: one mascot that follows the pointer, waves on hover, jumps on
// click and changes style every few seconds with a crossfade. Built by tools/build-embed.mjs
// into one self-contained script. It mounts itself into every [data-nodi-live] element:
//   <div data-nodi-live data-styles="sticker,ink,low-poly,bauhaus,anime" data-actions="wave,draw,morph"></div>
// A [data-nodi-style] element next to it (same parent) shows the current style's name; a
// [data-fallback] child (a still SVG for no-JS pages) is removed once the live mascot mounts.
// Only the styles listed in STYLES are bundled, so the script stays small.
import { createCharacter } from '../kit/character';
import { createClock } from '../kit/clock';
import type { Mascot } from '../kit/mascot';
import type { MascotSpec } from '../kit/spec';
import type { Style } from '../kit/style';
import { anchor } from '../anatomies/anchor/index';
import nodiSpec from '../mascots/nodi/mascot.json';
import { sticker } from '../styles/sticker/index';
import { ink } from '../styles/ink/index';
import { lowPoly } from '../styles/low-poly/index';
import { bauhaus } from '../styles/bauhaus/index';
import { anime } from '../styles/anime/index';

const STYLES: Record<string, Style> = { sticker, ink, 'low-poly': lowPoly, bauhaus, anime };
const spec = nodiSpec as unknown as MascotSpec;
const FADE = 450;

const css = `[data-nodi-live]{position:relative;display:grid}
[data-nodi-live]>.mascot{grid-area:1/1;transition:opacity ${FADE}ms ease}
[data-nodi-live] .mascot svg{display:block;width:100%;height:auto;overflow:visible}
[data-nodi-live] [data-stage]{display:none}`;

const ACTIONS = ['wave', 'draw', 'morph', 'select', 'heart', 'snap', 'spin', 'idea', 'hop'];
const REST = 600;
const MAX_SEGMENT = 7000;

// Each style gets its own action, like the README render: wave in the first style, then the style
// changes and Nodi draws, then it changes again and morphs… A fresh mascot's director always makes
// the same first pick, so every new style is handed the next action of the script instead.
function mount(host: HTMLElement) {
  const ids = (host.dataset.styles ?? Object.keys(STYLES).join(',')).split(',').map((s) => s.trim()).filter((s) => STYLES[s]);
  if (!ids.length) return;
  const script = (host.dataset.actions ?? ACTIONS.join(',')).split(',').map((s) => s.trim()).filter(Boolean);
  const clock = createClock();
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let i = 0, step = 0;
  let live: Mascot | null = null;
  let timer = 0, segmentStart = 0, started = false, doneAt = 0;
  const label = host.parentElement?.querySelector<HTMLElement>('[data-nodi-style]');

  const show = (id: string) => {
    const next = createCharacter(spec, anchor, STYLES[id], { salt: step + 1 });
    next.reset([script[step % script.length]]);
    step++;
    next.el.style.opacity = '0';
    next.el.dataset.style = id;
    host.append(next.el);
    clock.add(next);
    host.dataset.current = id;
    if (label) label.textContent = id;
    segmentStart = performance.now();
    started = false;
    doneAt = 0;
    const prev = live;
    live = next;
    requestAnimationFrame(() => {
      next.el.style.opacity = '1';
      if (prev) {
        prev.el.style.opacity = '0';
        prev.el.style.pointerEvents = 'none';
        setTimeout(() => { clock.remove(prev); prev.el.remove(); }, FADE + 50);
      }
    });
  };

  // The style changes once this segment's action (or a hover/click reaction that replaced it) has
  // finished and Nodi has rested a moment; MAX_SEGMENT is a safety net.
  const tick = () => {
    if (document.hidden || !live) return;
    const now = performance.now();
    if (live.playing()) started = true;
    else if (started && !doneAt) doneAt = now;
    if ((doneAt && now - doneAt >= REST) || now - segmentStart >= MAX_SEGMENT) {
      i = (i + 1) % ids.length;
      show(ids[i]);
    }
  };

  host.querySelector('[data-fallback]')?.remove();
  show(ids[0]);
  const apply = () => {
    clock.freeze(reduce.matches);
    clearInterval(timer);
    if (!reduce.matches && ids.length > 1) timer = window.setInterval(tick, 100);
  };
  reduce.addEventListener('change', apply);
  apply();
  clock.start();
}

const start = () => {
  if (!document.getElementById('nodi-live-css')) {
    const s = document.createElement('style');
    s.id = 'nodi-live-css';
    s.textContent = css;
    document.head.append(s);
  }
  document.querySelectorAll<HTMLElement>('[data-nodi-live]').forEach(mount);
};
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
else start();
