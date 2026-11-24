// Path builders that only use the commands the rig parses (M L Q C Z), so every static shape
// can boil in hand-drawn styles.
const r2 = (n: number) => Math.round(n * 100) / 100;
const K = 0.5523;

/** Rounded rectangle from (x0, y0) to (x1, y1) with corner radius r. */
export function roundRect(x0: number, y0: number, x1: number, y1: number, r: number): string {
  r = Math.min(r, (x1 - x0) / 2, (y1 - y0) / 2);
  const k = r * (1 - K);
  return [
    `M${r2(x0 + r)} ${r2(y0)}`,
    `L${r2(x1 - r)} ${r2(y0)}`,
    `C${r2(x1 - k)} ${r2(y0)} ${r2(x1)} ${r2(y0 + k)} ${r2(x1)} ${r2(y0 + r)}`,
    `L${r2(x1)} ${r2(y1 - r)}`,
    `C${r2(x1)} ${r2(y1 - k)} ${r2(x1 - k)} ${r2(y1)} ${r2(x1 - r)} ${r2(y1)}`,
    `L${r2(x0 + r)} ${r2(y1)}`,
    `C${r2(x0 + k)} ${r2(y1)} ${r2(x0)} ${r2(y1 - k)} ${r2(x0)} ${r2(y1 - r)}`,
    `L${r2(x0)} ${r2(y0 + r)}`,
    `C${r2(x0)} ${r2(y0 + k)} ${r2(x0 + k)} ${r2(y0)} ${r2(x0 + r)} ${r2(y0)}`,
    'Z',
  ].join('');
}

/** Ellipse centred at (cx, cy). */
export function ellipse(cx: number, cy: number, a: number, b: number): string {
  return `M${r2(cx)} ${r2(cy - b)}C${r2(cx + K * a)} ${r2(cy - b)} ${r2(cx + a)} ${r2(cy - K * b)} ${r2(cx + a)} ${r2(cy)}C${r2(cx + a)} ${r2(cy + K * b)} ${r2(cx + K * a)} ${r2(cy + b)} ${r2(cx)} ${r2(cy + b)}C${r2(cx - K * a)} ${r2(cy + b)} ${r2(cx - a)} ${r2(cy + K * b)} ${r2(cx - a)} ${r2(cy)}C${r2(cx - a)} ${r2(cy - K * b)} ${r2(cx - K * a)} ${r2(cy - b)} ${r2(cx)} ${r2(cy - b)}Z`;
}

/** Translate every coordinate of an M/L/Q/C/Z path by (dx, dy). */
export function shift(d: string, dx: number, dy: number): string {
  let i = 0;
  return d.replace(/-?\d*\.?\d+/g, (n) => String(r2(parseFloat(n) + (i++ % 2 === 0 ? dx : dy))));
}
