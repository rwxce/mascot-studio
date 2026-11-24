// One clock for the whole page. Each subject gets update(t, dt, mode) every frame while it
// is on screen. Hidden tabs stop the loop; reduced motion freezes every subject on frame 0,
// which must therefore be a good drawing.

export interface FrameMode {
  /** Reduced motion: hold the rest pose. */
  still?: boolean;
  /** Deterministic export: no pointer, scripted gaze. */
  scripted?: boolean;
}

export interface Subject {
  el: Element;
  update(t: number, dt: number, mode: FrameMode): void;
  visible?: boolean;
}

export function createClock() {
  const subjects = new Set<Subject>();
  let raf = 0, last = 0, start = 0, frozen = false, manual = false;
  const io = typeof IntersectionObserver !== 'undefined'
    ? new IntersectionObserver((entries) => {
        for (const e of entries) for (const s of subjects) if (s.el === e.target) s.visible = e.isIntersecting;
      })
    : null;

  const clock = {
    /** Smoothed JS time spent updating all subjects, per frame (ms). */
    workMs: 0,
    add(s: Subject) {
      s.visible = true;
      subjects.add(s);
      io?.observe(s.el);
      s.update(0, 16, frozen ? { still: true } : {});
    },
    remove(s: Subject) {
      subjects.delete(s);
      io?.unobserve(s.el);
    },
    start() {
      if (!raf && !frozen && !manual) {
        last = 0;
        raf = requestAnimationFrame(frame);
      }
    },
    stop() {
      cancelAnimationFrame(raf);
      raf = 0;
    },
    freeze(on: boolean) {
      frozen = on;
      if (on) {
        clock.stop();
        for (const s of subjects) s.update(0, 16, { still: true });
      } else {
        start = 0;
        clock.start();
      }
    },
    /** Render every subject at time t without the rAF loop (exports, tests). */
    render(t: number, dt = 1000 / 60) {
      manual = true;
      clock.stop();
      for (const s of subjects) s.update(t, dt, { scripted: true });
    },
  };

  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    if (!start) start = now;
    const dt = Math.min(64, now - (last || now - 16));
    last = now;
    const t = now - start;
    const t0 = performance.now();
    for (const s of subjects) if (s.visible) s.update(t, dt, {});
    clock.workMs = clock.workMs * 0.95 + (performance.now() - t0) * 0.05;
  }

  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => (document.hidden ? clock.stop() : clock.start()));
  }
  return clock;
}

export type Clock = ReturnType<typeof createClock>;
