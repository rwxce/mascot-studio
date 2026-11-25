// The style gallery: pick a mascot, see it alive in every style (grouped by family), open a
// style to watch it big and trigger its actions. Shareable: ?mascot=fox&style=riso
import { grey } from '../kit/color';
import { createClock } from '../kit/clock';
import type { Mascot } from '../kit/mascot';
import { makeMascot, specs } from '../mascots/index';
import { styleById, styles } from '../styles/index';

const app = document.getElementById('app')!;
const params = new URLSearchParams(location.search);
let current = specs.find((s) => s.name === params.get('mascot')) ?? specs[0];
const clock = createClock();
let live: Mascot[] = [];

// Translations injected by tools/build-gallery.mjs (window.__GT); without it the page is English.
type GT = { ui?: Record<string, string>; looks?: Record<string, string>; fams?: Record<string, string> };
const gt: GT = (window as unknown as { __GT?: GT }).__GT ?? {};
const T = { title: 'mascot-studio · styles', mascot: 'Mascot', reducedMotion: 'Reduced motion', styles: '{n} styles', close: 'Close', hint: 'Hover the mascot to say hi, click it to surprise it. Move the pointer: it follows you.', ...gt.ui };
const look = (s: string) => gt.looks?.[s] ?? s;
const famName = (s: string) => gt.fams?.[s] ?? s;

app.innerHTML = `
<div class="top"><div class="in">
  <h1>${T.title}</h1>
  <div class="seg" role="group" aria-label="${T.mascot}">${specs.map((s) => `<button data-m="${s.name}">${s.title}</button>`).join('')}</div>
  <div class="meta">
    <label><input type="checkbox" id="rm"> ${T.reducedMotion}</label>
    <span>${T.styles.replace('{n}', String(styles.length))}</span>
    <span>FPS <output id="fps">–</output></span>
  </div>
</div></div>
<main id="families"></main>
<div class="focus" id="focus" aria-hidden="true"><div class="panel" role="dialog" aria-modal="true" aria-labelledby="f-title">
  <div class="stage" id="f-stage"></div>
  <div class="side">
    <button class="close" id="f-close">${T.close}</button>
    <div class="fam-l" id="f-fam"></div>
    <h3 id="f-title"></h3>
    <p id="f-look"></p>
    <div class="axes" id="f-axes"></div>
    <div class="acts" id="f-acts"></div>
    <div class="hint">${T.hint}</div>
  </div>
</div></div>`;

const families = [...new Set(styles.map((s) => s.family))];
const tone = (bg: string) => (grey(bg) > 128 ? 'light' : 'dark');

function render() {
  for (const m of live) clock.remove(m);
  live = [];
  document.querySelectorAll<HTMLButtonElement>('.seg button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.m === current.name)));
  const root = document.getElementById('families')!;
  root.innerHTML = '';
  for (const fam of families) {
    const sec = document.createElement('section');
    sec.className = 'fam';
    sec.innerHTML = `<h2>${famName(fam)}</h2><div class="grid"></div>`;
    const grid = sec.querySelector('.grid')!;
    for (const st of styles.filter((s) => s.family === fam)) {
      const card = document.createElement('div');
      card.className = `card ${tone(st.bg)}`;
      card.tabIndex = 0;
      card.style.background = st.bg;
      card.dataset.style = st.id;
      const m = makeMascot(current, { style: st.id, salt: live.length });
      card.append(m.el);
      card.insertAdjacentHTML('beforeend', `<div class="name">${st.title}</div><div class="look">${look(st.look)}</div>`);
      card.addEventListener('click', (e) => { if (!(e.target as Element).closest('.mascot')) open(st.id); });
      card.addEventListener('keydown', (e) => { if (e.key === 'Enter') open(st.id); });
      card.querySelector('.name')!.addEventListener('click', () => open(st.id));
      grid.append(card);
      live.push(m);
      clock.add(m);
    }
    root.append(sec);
  }
  applyRm();
}

let focusMascot: Mascot | null = null;
function open(id: string) {
  const st = styleById[id];
  if (!st) return;
  if (focusMascot) clock.remove(focusMascot);
  const m = makeMascot(current, { style: id });
  focusMascot = m;
  const stage = document.getElementById('f-stage')!;
  stage.innerHTML = '';
  stage.style.background = st.bg;
  stage.append(m.el);
  clock.add(m);
  document.getElementById('f-fam')!.textContent = famName(st.family);
  document.getElementById('f-title')!.textContent = `${current.title} · ${st.title}`;
  document.getElementById('f-look')!.textContent = look(st.look);
  document.getElementById('f-axes')!.innerHTML = Object.entries(st.axes).map(([k, v]) => `<span><b>${k}</b> ${v}</span>`).join('');
  const acts = document.getElementById('f-acts')!;
  acts.innerHTML = '';
  for (const a of m.actions) {
    const b = document.createElement('button');
    b.textContent = a;
    b.onclick = () => m.play(a);
    acts.append(b);
  }
  const f = document.getElementById('focus')!;
  f.classList.add('open');
  f.setAttribute('aria-hidden', 'false');
  history.replaceState(null, '', `?mascot=${current.name}&style=${id}`);
  syncLangLinks();
  applyRm();
}
function close() {
  const f = document.getElementById('focus')!;
  f.classList.remove('open');
  f.setAttribute('aria-hidden', 'true');
  if (focusMascot) clock.remove(focusMascot);
  focusMascot = null;
  history.replaceState(null, '', `?mascot=${current.name}`);
  syncLangLinks();
}
// The header's language links go to the same view in the other language.
function syncLangLinks() {
  document.querySelectorAll<HTMLAnchorElement>('a[data-gallery-lang]').forEach((a) => { a.search = location.search; });
}
document.getElementById('f-close')!.onclick = close;
document.getElementById('focus')!.addEventListener('click', (e) => { if (e.target === e.currentTarget) close(); });
addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
document.querySelectorAll<HTMLButtonElement>('.seg button').forEach((b) => b.addEventListener('click', () => {
  current = specs.find((s) => s.name === b.dataset.m)!;
  close();
  render();
}));

const rm = document.getElementById('rm') as HTMLInputElement;
rm.checked = matchMedia('(prefers-reduced-motion: reduce)').matches;
function applyRm() { clock.freeze(rm.checked); }
rm.addEventListener('change', applyRm);

render();
syncLangLinks();
clock.start();
const want = params.get('style');
if (want) open(want);

let frames = 0, t0 = performance.now();
(function meter(now: number) {
  frames++;
  if (now - t0 >= 1000) {
    (document.getElementById('fps') as HTMLOutputElement).value = String(Math.round((frames * 1000) / (now - t0)));
    frames = 0; t0 = now;
  }
  requestAnimationFrame(meter);
})(t0);
Object.assign(window, { __gallery: { open, close, clock } });
