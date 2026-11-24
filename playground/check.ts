// Rendered rules for `pnpm check`. tools/check.mjs opens this page and calls __check(name).
import { anatomies } from '../anatomies/index';
import { createClock } from '../kit/clock';
import { validateSpec } from '../kit/spec';
import { makeMascot, specs } from '../mascots/index';
import { styleById, styles } from '../styles/index';

interface Issue { rule: string; where: string; message: string }

/** Max movement of the drawing between two frames at 30 fps before it reads as a jump (px). */
const MAX_STEP = 22;

(window as any).__names = () => specs.map((s) => s.name);
(window as any).__styles = () => styles.map((s) => s.id);
(window as any).__styleMeta = () => Object.fromEntries(styles.map((s) => [s.id, { title: s.title, family: s.family, bg: s.bg }]));
(window as any).__check = async (name: string, style?: string) => {
  const issues: Issue[] = [];
  const spec = specs.find((s) => s.name === name);
  if (!spec) return { issues: [{ rule: 'exists', where: name, message: 'no mascot with this name in mascots/index.ts' }] };
  const anatomy = anatomies[spec.anatomy];
  if (!anatomy) return { issues: [{ rule: 'anatomy', where: spec.anatomy, message: 'unknown anatomy' }] };
  for (const i of validateSpec(spec, anatomy.contract)) issues.push({ rule: 'spec', where: i.path, message: i.message });
  if (issues.length) return { issues };

  const stage = document.getElementById('stage')!;
  const twin = document.getElementById('twin')!;
  const clock = createClock();
  const m = makeMascot(spec, { style });
  const m2 = makeMascot(spec, { salt: 1, style });
  stage.append(m.el); twin.append(m2.el);
  clock.add(m); clock.add(m2);

  // unique ids: two copies on one page must not share an id (gradients, clip paths)
  const ids = [...document.querySelectorAll('[id]')].map((e) => e.id).filter((id) => id !== 'stage' && id !== 'twin');
  const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dup.length) issues.push({ rule: 'unique-ids', where: dup[0], message: `${dup.length} ids repeat when the mascot is on the page twice` });

  const svg = m.el.querySelector('svg')!;
  const [vx, vy, vw, vh] = svg.getAttribute('viewBox')!.split(/\s+/).map(Number);
  // The character's visible ink: every leaf shape that is not part of the stage and is not
  // faded out, in viewBox coordinates.
  const leaves = [...svg.querySelectorAll('path, ellipse, circle, rect, text, line')].filter((el) => !el.closest('defs') && !el.closest('[data-stage]') && !el.closest('[data-drop]') && !el.closest('[data-overlay]')) as SVGGraphicsElement[];
  const visible = (el: Element) => {
    for (let n: Element | null = el; n && n !== svg; n = n.parentElement) {
      const o = n.getAttribute('opacity');
      if (o !== null && parseFloat(o) < 0.02) return false;
      if ((n as HTMLElement).style?.display === 'none') return false;
    }
    return true;
  };
  /** Centre of every visible body part (props excluded), in viewBox units; null when hidden. */
  const centres = () => {
    const inv = (svg as SVGSVGElement).getScreenCTM()!.inverse();
    return leaves.map((el) => {
      if (el.closest('[data-props]') || !visible(el)) return null;
      const b = el.getBBox();
      if (!b.width && !b.height) return null;
      const q = new DOMPoint(b.x + b.width / 2, b.y + b.height / 2).matrixTransform(inv.multiply(el.getScreenCTM()!));
      return [q.x, q.y] as [number, number];
    });
  };
  const box = () => {
    const inv = (svg as SVGSVGElement).getScreenCTM()!.inverse();
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const el of leaves) {
      if (!visible(el)) continue;
      const b = el.getBBox();
      if (!b.width && !b.height) continue;
      const m = inv.multiply(el.getScreenCTM()!);
      for (const [px, py] of [[b.x, b.y], [b.x + b.width, b.y], [b.x, b.y + b.height], [b.x + b.width, b.y + b.height]]) {
        const q = new DOMPoint(px, py).matrixTransform(m);
        x0 = Math.min(x0, q.x); y0 = Math.min(y0, q.y); x1 = Math.max(x1, q.x); y1 = Math.max(y1, q.y);
      }
    }
    return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
  };
  const inside = (b: ReturnType<typeof box>) => b.x >= vx - 0.5 && b.y >= vy - 0.5 && b.x + b.w <= vx + vw + 0.5 && b.y + b.h <= vy + vh + 0.5;

  // frame 0 (reduced motion) must be a complete, framed drawing
  clock.freeze(true);
  const still = box();
  if (!inside(still)) issues.push({ rule: 'frame-0', where: 'reduced motion', message: 'the rest pose does not fit in the viewBox' });
  clock.freeze(false);
  clock.stop();

  // Stepped styles (stop-motion, pixel) hold each pose for a step: sample at their rhythm, and
  // allow the distance a part travels in one of their steps.
  const styleDef = styleById[style ?? spec.style ?? 'soft-gradient'];
  const painter = styleDef.painter(spec.palette, 'probe');
  // A form with hold-then-snap timing remaps the clock the same way a stepped style does.
  const snapped = !!anatomy.usesForm && (styleDef.form?.motion?.snap ?? 0) > 0;
  let styleStep = 0;
  for (let t = 1; t <= 300; t++) if (painter.time(t) > 0) { styleStep = painter.time(t); break; }
  const step = styleStep > 1000 / 30 ? styleStep : 1000 / 30;
  const maxStep = MAX_STEP * (step / (1000 / 30));
  let worst = 0, total = 0, frames = 0;
  for (const action of m.actions) {
    m.reset([action]);
    let prevC: ([number, number] | null)[] | null = null;
    const moves: { t: number; d: number }[][] = [];
    const flagged = { out: false };
    for (let t = 0; t < 500 + 16000; t += step) {
      const t0 = performance.now();
      m.update(t, step, { scripted: true });
      const dt = performance.now() - t0;
      worst = Math.max(worst, dt); total += dt; frames++;
      const b = box();
      if (!flagged.out && !inside(b)) {
        flagged.out = true;
        issues.push({ rule: 'in-frame', where: `${action} @ ${Math.round(t - 500)} ms`, message: `drawing leaves the viewBox (${Math.round(b.x)},${Math.round(b.y)} ${Math.round(b.w)}×${Math.round(b.h)} vs ${vx},${vy} ${vw}×${vh})` });
      }
      const c = centres();
      if (prevC) {
        c.forEach((p, i) => {
          const q = prevC![i];
          if (!p || !q) return;
          (moves[i] ??= []).push({ t: Math.round(t - 500), d: Math.hypot(p[0] - q[0], p[1] - q[1]) });
        });
      }
      prevC = c;
      // stop once the action has finished and the idle has taken over again
      if (t > 700 && m.playing() === null) break;
    }
    // A pop: one part moves far more in one frame than it does in the frames around it.
    // Fast motion is fine; a part teleporting is not. Stepped styles (stop-motion, pixel) skip
    // it: the motion underneath is the same in every style and is checked in the smooth ones,
    // and a fast move landing in one step is what stop-motion looks like. Forms with
    // hold-then-snap timing (form.motion.snap) skip it for the same reason.
    let popped = styleStep > 34 || snapped;
    for (const steps of moves) {
      if (popped || !steps) continue;
      for (let i = 0; i < steps.length; i++) {
        const around = [steps[i - 2], steps[i - 1], steps[i + 1], steps[i + 2]].filter(Boolean).map((x) => x.d).sort((a, b) => a - b);
        const typical = around.length ? around[Math.floor(around.length / 2)] : 0;
        if (steps[i].d > maxStep && steps[i].d > 2.5 * typical + 4) {
          issues.push({ rule: 'no-jumps', where: `${action} @ ${steps[i].t} ms`, message: `a part pops ${Math.round(steps[i].d)} px in one ${styleStep > 34 ? `${Math.round(step)} ms step` : 'frame'} (around it: ~${Math.round(typical)} px)` });
          popped = true;
          break;
        }
      }
    }
  }
  const avg = total / Math.max(1, frames);
  if (avg > 2) issues.push({ rule: 'budget-js', where: 'all actions', message: `average update ${avg.toFixed(2)} ms per frame (max 2 ms)` });
  const bytes = new Blob([svg.outerHTML]).size;
  return { issues, stats: { actions: m.actions.length, frames, avgMs: +avg.toFixed(3), worstMs: +worst.toFixed(2), svgBytes: bytes } };
};

/** Visual distinctness: the rest pose of one mascot in every style, rasterised and compared. */
(window as any).__distinct = async (name: string) => {
  const spec = specs.find((s) => s.name === name)!;
  const N = 40;
  const pics: { id: string; px: Float32Array }[] = [];
  for (const st of styles) {
    const stage = document.getElementById('stage')!;
    stage.innerHTML = '';
    const clock = createClock();
    const m = makeMascot(spec, { style: st.id });
    stage.append(m.el);
    clock.add(m);
    clock.freeze(true);
    const svg = m.el.querySelector('svg')!.cloneNode(true) as SVGSVGElement;
    svg.setAttribute('width', String(N * 4));
    svg.setAttribute('height', String(N * 4));
    const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(svg));
    const img = new Image();
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url; });
    const c = document.createElement('canvas');
    c.width = N; c.height = N;
    const g = c.getContext('2d')!;
    g.fillStyle = st.bg; g.fillRect(0, 0, N, N);
    g.drawImage(img, 0, 0, N, N);
    const d = g.getImageData(0, 0, N, N).data;
    const px = new Float32Array(N * N * 3);
    for (let i = 0; i < N * N; i++) { px[i * 3] = d[i * 4]; px[i * 3 + 1] = d[i * 4 + 1]; px[i * 3 + 2] = d[i * 4 + 2]; }
    pics.push({ id: st.id, px });
    clock.stop();
  }
  const pairs: { a: string; b: string; diff: number }[] = [];
  for (let i = 0; i < pics.length; i++) for (let j = i + 1; j < pics.length; j++) {
    let s = 0;
    const A = pics[i].px, B = pics[j].px;
    for (let k = 0; k < A.length; k++) s += Math.abs(A[k] - B[k]);
    pairs.push({ a: pics[i].id, b: pics[j].id, diff: +(s / A.length).toFixed(1) });
  }
  return pairs.sort((x, y) => x.diff - y.diff);
};
