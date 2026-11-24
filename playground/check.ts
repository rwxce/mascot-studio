// Rendered rules for `pnpm check`. tools/check.mjs opens this page and calls __check(name).
import { anatomies } from '../anatomies/index';
import { createClock } from '../kit/clock';
import { validateSpec } from '../kit/spec';
import { makeMascot, specs } from '../mascots/index';

interface Issue { rule: string; where: string; message: string }

/** Max movement of the drawing between two frames at 30 fps before it reads as a jump (px). */
const MAX_STEP = 22;

(window as any).__names = () => specs.map((s) => s.name);
(window as any).__check = async (name: string) => {
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
  const m = makeMascot(spec);
  const m2 = makeMascot(spec, { salt: 1 });
  stage.append(m.el); twin.append(m2.el);
  clock.add(m); clock.add(m2);

  // unique ids: two copies on one page must not share an id (gradients, clip paths)
  const ids = [...document.querySelectorAll('[id]')].map((e) => e.id).filter((id) => id !== 'stage' && id !== 'twin');
  const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dup.length) issues.push({ rule: 'unique-ids', where: dup[0], message: `${dup.length} ids repeat when the mascot is on the page twice` });

  const svg = m.el.querySelector('svg')!;
  const [vx, vy, vw, vh] = svg.getAttribute('viewBox')!.split(/\s+/).map(Number);
  const box = () => {
    const b = (svg as SVGSVGElement).getBBox();
    return { x: b.x, y: b.y, w: b.width, h: b.height };
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
    let prev = null as ReturnType<typeof box> | null;
    let flagged = { out: false, jump: false };
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
      if (prev && !flagged.jump) {
        const d = Math.max(Math.abs(b.x - prev.x), Math.abs(b.y - prev.y), Math.abs(b.x + b.w - prev.x - prev.w), Math.abs(b.y + b.h - prev.y - prev.h));
        if (d > MAX_STEP) {
          flagged.jump = true;
          issues.push({ rule: 'no-jumps', where: `${action} @ ${Math.round(t - 500)} ms`, message: `the drawing moves ${Math.round(d)} px in one frame (max ${MAX_STEP})` });
        }
      }
      prev = b;
      // stop once the action has finished and the idle has taken over again
      if (t > 700 && m.playing() === null) break;
    }
  }
  const avg = total / Math.max(1, frames);
  if (avg > 2) issues.push({ rule: 'budget-js', where: 'all actions', message: `average update ${avg.toFixed(2)} ms per frame (max 2 ms)` });
  const bytes = new Blob([svg.outerHTML]).size;
  return { issues, stats: { actions: m.actions.length, frames, avgMs: +avg.toFixed(3), worstMs: +worst.toFixed(2), svgBytes: bytes } };
};
