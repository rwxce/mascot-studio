// Rendered rules for `pnpm check`. tools/check.mjs opens this page and calls __check(name).
import { anatomies } from '../anatomies/index';
import { createClock } from '../kit/clock';
import { validateSpec } from '../kit/spec';
import { makeMascot, specs } from '../mascots/index';
import { styles } from '../styles/index';

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
  const leaves = [...svg.querySelectorAll('path, ellipse, circle, rect, text, line')].filter((el) => !el.closest('[data-stage]')) as SVGGraphicsElement[];
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

  const step = 1000 / 30;
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
    // Fast motion is fine; a part teleporting is not.
    let popped = false;
    for (const steps of moves) {
      if (popped || !steps) continue;
      for (let i = 0; i < steps.length; i++) {
        const around = [steps[i - 2], steps[i - 1], steps[i + 1], steps[i + 2]].filter(Boolean).map((x) => x.d).sort((a, b) => a - b);
        const typical = around.length ? around[Math.floor(around.length / 2)] : 0;
        if (steps[i].d > MAX_STEP && steps[i].d > 2.5 * typical + 4) {
          issues.push({ rule: 'no-jumps', where: `${action} @ ${steps[i].t} ms`, message: `a part pops ${Math.round(steps[i].d)} px in one frame (around it: ~${Math.round(typical)} px)` });
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
