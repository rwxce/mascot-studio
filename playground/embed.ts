// Live Nodi for other pages: one mascot that follows the pointer, waves on hover, jumps on
// click and changes style every few seconds with a crossfade. Built by tools/build-embed.mjs
// into one self-contained script. It mounts itself into every [data-nodi-live] element:
//   <div data-nodi-live data-styles="sticker,ink,low-poly,bauhaus,anime" data-every="5000"></div>
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

function mount(host: HTMLElement) {
  const ids = (host.dataset.styles ?? Object.keys(STYLES).join(',')).split(',').map((s) => s.trim()).filter((s) => STYLES[s]);
  if (!ids.length) return;
  const every = Math.max(2000, Number(host.dataset.every) || 5000);
  const clock = createClock();
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let i = 0;
  let live: Mascot | null = null;
  let timer = 0;
  const label = host.parentElement?.querySelector<HTMLElement>('[data-nodi-style]');

  const show = (id: string) => {
    const next = createCharacter(spec, anchor, STYLES[id]);
    next.el.style.opacity = '0';
    next.el.dataset.style = id;
    host.append(next.el);
    clock.add(next);
    host.dataset.current = id;
    if (label) label.textContent = id;
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

  const tick = () => {
    if (document.hidden) return;
    i = (i + 1) % ids.length;
    show(ids[i]);
  };

  host.querySelector('[data-fallback]')?.remove();
  show(ids[0]);
  const apply = () => {
    clock.freeze(reduce.matches);
    clearInterval(timer);
    if (!reduce.matches && ids.length > 1) timer = window.setInterval(tick, every);
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
