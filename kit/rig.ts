// A rig: a tree of parts with real pivots, rendered so outlines are seamless.
//
// Clean joins come from drawing each LAYER twice: first every part's silhouette as an
// outline pass (ink, stroke = 2 × line width), then every part's fill on top. Where two
// parts of the same layer overlap, the fills cover the outlines between them, so the joint
// reads as one shape with no seam. Parts that must show an outline over the body (an arm
// in front) go in a later layer. Details (eyes, inner lines) are drawn in the fill pass.
//
// Animation writes transforms and path data straight to the DOM through refs: no
// framework, no re-render, one string per changed attribute.
import { mapPoints, parse, toD, type PathSpec, type Seg } from './morph.js';
import { seeded } from './motion.js';

const SVGNS = 'http://www.w3.org/2000/svg';

export interface Shape {
  /** Static geometry (SVG path syntax, absolute M L Q C Z) or a ref to set each frame. */
  d?: string;
  /** Shape whose path is set every frame with rig.path(ref, spec). */
  pathRef?: string;
  /** 'body' joins the layer's outline; 'detail' is drawn on top in the fill pass only. */
  kind?: 'body' | 'detail';
  fill?: string;
  stroke?: string;
  width?: number;
  opacity?: number;
  /** Other SVG element instead of a path (ellipse, circle, rect, text…) — detail only. */
  el?: { tag: string; attrs: Record<string, string | number>; text?: string };
  /** Ref for an element whose attributes are animated (e.g. opacity). */
  ref?: string;
  /** Clip children shapes to this ellipse (eyes): [cx, cy, rx, ry]. */
  clip?: readonly [number, number, number, number];
  clipped?: Shape[];
}

export interface Part {
  /** Ref for transforms set with rig.set(id, …). */
  id?: string;
  /** Origin of this part in its parent's coordinates = its pivot. */
  at?: readonly [number, number];
  shapes?: Shape[];
  children?: Part[];
  /** Show this part only inside [x, y, w, h], in its own coordinates (it moves with the part). */
  clipRect?: readonly [number, number, number, number];
  /**
   * The body this part sits behind, as parts in this part's PARENT coordinates (usually the
   * same objects, or the same ids, the body is built from). The part is masked by their
   * silhouette, so in a translucent or hollow style nothing of it shows through the body. The
   * silhouette is built from the same ids and path refs, so it moves and morphs with the body.
   */
  behind?: Part[];
  /**
   * Parts drawn OVER this one that hide it (a corner of paper lifted in front of a letter), in
   * the same coordinates as `behind`. The same mask, so in a translucent style nothing of this
   * part shows through them; unlike `behind`, this part is not behind a body (checks skip it).
   */
  under?: Part[];
  /** Starting opacity of the part (e.g. 0 for a copy shown later with rig.opacity). */
  opacity?: number;
  /** data-* attributes on the part's group, for checks and tools (e.g. { limb: 'armR' }). */
  data?: Record<string, string>;
}

export interface Layer {
  root: Part;
  /** Line colour and width for this layer's outline pass; null = no outline. */
  outline: { color: string; width: number } | null;
  /** Marks the layer's groups with data-<tag> (e.g. "stage", "props"). */
  tag?: string;
}

export interface RigLook {
  /** Outline pass draws only the edge (no filled silhouette): neon, blueprint, line art. */
  hollow?: boolean;
  /** Opacity of the outline pass (a soft glow under a thin line). */
  outlineOpacity?: number;
  /** A stroke on every body shape in the fill pass (the bright tube of a neon sign). */
  edge?: { color: string; width: number; opacity?: number };
  /** An offset copy of every body silhouette drawn first: hard shadows, paper layers, misregistration. */
  drop?: { dx: number; dy: number; color: string; opacity: number };
}

export interface RigOptions {
  viewBox: string;
  label: string;
  layers: Layer[];
  look?: RigLook;
  /** Hand-drawn boil: amplitude in px (0 = off). Points move on 2s (12 fps), 3 variants. */
  boil?: number;
  defs?: string;
}

export interface Transform {
  x?: number;
  y?: number;
  rot?: number;
  sx?: number;
  sy?: number;
  /** Shear along x in degrees (smear on fast moves, lean). */
  skew?: number;
}

type Pass = 'drop' | 'outline' | 'fill' | 'mask';

const r2 = (n: number) => Math.round(n * 100) / 100;
const hash = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 9973, 7);

export function transformString(t: Transform): string {
  let s = '';
  if (t.x || t.y) s += `translate(${r2(t.x ?? 0)},${r2(t.y ?? 0)})`;
  if (t.rot) s += `rotate(${r2(t.rot)})`;
  if (t.skew) s += `skewX(${r2(t.skew)})`;
  if ((t.sx ?? 1) !== 1 || (t.sy ?? 1) !== 1) s += `scale(${r2((t.sx ?? 1) * 1000) / 1000},${r2((t.sy ?? 1) * 1000) / 1000})`;
  return s;
}

export class Rig {
  readonly svg: SVGSVGElement;
  private parts = new Map<string, Element[]>();
  private paths = new Map<string, { els: Element[]; spec: PathSpec | null }>();
  private refs = new Map<string, Element[]>();
  private statics = new Map<Shape, { els: Element[]; spec: Seg[] }>();
  private boilFrame = -1;
  /** One mask per part with `behind` or `under`, shared by its passes (they all draw in the same space). */
  private masks = new Map<Part, string>();
  private maskDefs: SVGDefsElement | null = null;
  private uid = Math.random().toString(36).slice(2, 8);

  constructor(private opts: RigOptions) {
    this.svg = document.createElementNS(SVGNS, 'svg') as SVGSVGElement;
    this.svg.setAttribute('viewBox', opts.viewBox);
    this.svg.setAttribute('role', 'img');
    this.svg.setAttribute('aria-label', opts.label);
    this.svg.setAttribute('shape-rendering', 'geometricPrecision');
    if (opts.defs) this.svg.innerHTML = `<defs>${opts.defs}</defs>`;
    const look = opts.look ?? {};
    for (const layer of opts.layers) {
      let drop: SVGGElement | null = null;
      if (look.drop && !layer.tag) {
        drop = document.createElementNS(SVGNS, 'g') as SVGGElement;
        drop.setAttribute('transform', `translate(${look.drop.dx},${look.drop.dy})`);
        drop.setAttribute('opacity', String(look.drop.opacity));
        drop.setAttribute('data-drop', '');
        drop.append(this.build(layer.root, 'drop', layer.outline));
      }
      const outlineG = layer.outline ? this.build(layer.root, 'outline', layer.outline) : null;
      if (outlineG && look.outlineOpacity !== undefined) outlineG.setAttribute('opacity', String(look.outlineOpacity));
      const groups = [...(drop ? [drop] : []), ...(outlineG ? [outlineG] : []), this.build(layer.root, 'fill', layer.outline)];
      for (const g of groups) {
        if (layer.tag) g.setAttribute(`data-${layer.tag}`, '');
        this.svg.append(g);
      }
    }
  }

  private add(map: Map<string, Element[]>, key: string, el: Element) {
    const list = map.get(key);
    if (list) list.push(el); else map.set(key, [el]);
  }

  private build(part: Part, pass: Pass, outline: Layer['outline']): SVGGElement {
    const g = document.createElementNS(SVGNS, 'g') as SVGGElement;
    // Pivot group (static translate) wrapping the animated group.
    const outer = document.createElementNS(SVGNS, 'g');
    if (part.at) outer.setAttribute('transform', `translate(${part.at[0]},${part.at[1]})`);
    if (part.clipRect) {
      // Unique per rig and per pass, so two copies on a page never borrow each other's clip.
      const id = `c${this.uid}${Math.random().toString(36).slice(2, 7)}`;
      const [x, y, w, h] = part.clipRect;
      const defs = document.createElementNS(SVGNS, 'defs');
      defs.innerHTML = `<clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath>`;
      outer.append(defs);
      g.setAttribute('clip-path', `url(#${id})`);
    }
    outer.append(g);
    if (part.id) this.add(this.parts, part.id, g);
    if (part.opacity !== undefined && pass !== 'mask') g.setAttribute('opacity', String(part.opacity));
    if (part.data && pass !== 'mask') for (const [k, v] of Object.entries(part.data)) g.setAttribute(`data-${k}`, v);
    for (const s of part.shapes ?? []) {
      const el = this.shape(s, pass, outline);
      if (el) g.append(el);
    }
    for (const c of part.children ?? []) g.append(this.build(c, pass, outline));
    if ((part.behind?.length || part.under?.length) && pass !== 'mask') {
      // The mask is read in the user space of the element it is set on: an untransformed
      // wrapper, so that space is the parent's, where the body's parts are given.
      const wrap = document.createElementNS(SVGNS, 'g') as SVGGElement;
      wrap.setAttribute('mask', `url(#${this.mask(part, outline)})`);
      wrap.setAttribute(part.behind?.length ? 'data-behind' : 'data-under', '');
      wrap.append(outer);
      return wrap;
    }
    return outer as SVGGElement;
  }

  /** The mask for a part drawn behind a body: everything, less the body's silhouette. */
  private mask(part: Part, outline: Layer['outline']): string {
    const known = this.masks.get(part);
    if (known) return known;
    const id = `m${this.uid}${Math.random().toString(36).slice(2, 7)}`;
    this.masks.set(part, id);
    if (!this.maskDefs) {
      this.maskDefs = document.createElementNS(SVGNS, 'defs') as SVGDefsElement;
      this.svg.append(this.maskDefs);
    }
    const m = document.createElementNS(SVGNS, 'mask');
    m.setAttribute('id', id);
    m.setAttribute('maskUnits', 'userSpaceOnUse');
    m.setAttribute('x', '-5000'); m.setAttribute('y', '-5000');
    m.setAttribute('width', '10000'); m.setAttribute('height', '10000');
    const all = document.createElementNS(SVGNS, 'rect');
    for (const [k, v] of Object.entries({ x: -5000, y: -5000, width: 10000, height: 10000, fill: '#fff' })) all.setAttribute(k, String(v));
    m.append(all);
    for (const b of [...(part.behind ?? []), ...(part.under ?? [])]) m.append(this.build(b, 'mask', outline));
    this.maskDefs.append(m);
    return id;
  }

  private shape(s: Shape, pass: Pass, outline: Layer['outline']): Element | null {
    const kind = s.kind ?? 'body';
    if (pass === 'outline' && (kind !== 'body' || !outline)) return null;
    if ((pass === 'drop' || pass === 'mask') && kind !== 'body') return null;
    if (s.clip) {
      if (pass !== 'fill') return null;
      const id = `c${this.uid}${Math.random().toString(36).slice(2, 7)}`;
      const g = document.createElementNS(SVGNS, 'g');
      g.innerHTML = `<clipPath id="${id}"><ellipse cx="${s.clip[0]}" cy="${s.clip[1]}" rx="${s.clip[2]}" ry="${s.clip[3]}"/></clipPath>`;
      const inner = document.createElementNS(SVGNS, 'g');
      inner.setAttribute('clip-path', `url(#${id})`);
      for (const c of s.clipped ?? []) {
        const el = this.shape({ ...c, kind: 'detail' }, 'fill', outline);
        if (el) inner.append(el);
      }
      g.append(inner);
      return g;
    }
    let el: Element;
    if (s.el) {
      el = document.createElementNS(SVGNS, s.el.tag);
      for (const [k, v] of Object.entries(s.el.attrs)) el.setAttribute(k, String(v));
      if (s.el.text) el.textContent = s.el.text;
    } else {
      el = document.createElementNS(SVGNS, 'path');
      if (s.d) {
        const spec = parse(s.d);
        el.setAttribute('d', toD(spec));
        if (this.opts.boil) {
          const entry = this.statics.get(s);
          if (entry) entry.els.push(el); else this.statics.set(s, { els: [el], spec });
        }
      }
      if (s.pathRef) {
        const entry = this.paths.get(s.pathRef);
        if (entry) entry.els.push(el); else this.paths.set(s.pathRef, { els: [el], spec: null });
      }
    }
    const look = this.opts.look ?? {};
    const strokeLimb = !!s.stroke && (!s.fill || s.fill === 'none');
    if (pass === 'mask') {
      // The body's fill area in black (hidden); its outline stays drawn over the part's edge.
      el.setAttribute('fill', strokeLimb ? 'none' : '#000');
      if (strokeLimb) {
        el.setAttribute('stroke', '#000');
        el.setAttribute('stroke-width', String(s.width ?? 2));
        el.setAttribute('stroke-linecap', 'round');
        el.setAttribute('stroke-linejoin', 'round');
      }
    } else if (pass === 'drop') {
      const c = look.drop!.color, w = outline ? outline.width * 2 : 0;
      el.setAttribute('fill', strokeLimb ? 'none' : c);
      el.setAttribute('stroke', c);
      el.setAttribute('stroke-width', String(strokeLimb ? (s.width ?? 2) + w : w));
      el.setAttribute('stroke-linejoin', 'round');
      el.setAttribute('stroke-linecap', 'round');
    } else if (pass === 'outline' && outline && look.hollow) {
      el.setAttribute('fill', 'none');
      el.setAttribute('stroke', outline.color);
      el.setAttribute('stroke-width', String(strokeLimb ? (s.width ?? 2) + outline.width * 2 : outline.width));
      el.setAttribute('stroke-linejoin', 'round');
      el.setAttribute('stroke-linecap', 'round');
    } else if (pass === 'outline' && outline && strokeLimb) {
      // a limb drawn as a thick stroke: its outline is a wider stroke underneath
      el.setAttribute('fill', 'none');
      el.setAttribute('stroke', outline.color);
      el.setAttribute('stroke-width', String((s.width ?? 2) + outline.width * 2));
      el.setAttribute('stroke-linejoin', 'round');
      el.setAttribute('stroke-linecap', 'round');
    } else if (pass === 'outline' && outline) {
      el.setAttribute('fill', outline.color);
      el.setAttribute('stroke', outline.color);
      el.setAttribute('stroke-width', String(outline.width * 2));
      el.setAttribute('stroke-linejoin', 'round');
      el.setAttribute('stroke-linecap', 'round');
    } else {
      // Non-path elements keep the fill they were authored with unless one is given.
      if (s.fill !== undefined || !s.el) el.setAttribute('fill', s.fill ?? 'none');
      if (s.stroke) {
        el.setAttribute('stroke', s.stroke);
        el.setAttribute('stroke-width', String(s.width ?? 2));
        el.setAttribute('stroke-linejoin', 'round');
        el.setAttribute('stroke-linecap', 'round');
      }
      if (s.opacity !== undefined) el.setAttribute('opacity', String(s.opacity));
      if (look.edge && kind === 'body' && !strokeLimb) {
        el.setAttribute('stroke', look.edge.color);
        el.setAttribute('stroke-width', String(look.edge.width));
        el.setAttribute('stroke-linejoin', 'round');
        if (look.edge.opacity !== undefined) el.setAttribute('stroke-opacity', String(look.edge.opacity));
      }
    }
    if (s.ref) this.add(this.refs, s.ref, el);
    return el;
  }

  /** Set a part's transform (all passes). */
  set(id: string, t: Transform) {
    const els = this.parts.get(id);
    if (!els) return;
    const s = transformString(t);
    for (const el of els) el.setAttribute('transform', s);
  }

  /** Fade a whole part (all passes). */
  opacity(id: string, v: number) {
    const els = this.parts.get(id);
    if (!els) return;
    const o = String(Math.round(Math.max(0, Math.min(1, v)) * 1000) / 1000);
    for (const el of els) el.setAttribute('opacity', o);
  }

  /** Set a data-* attribute on a part's groups (all passes), for checks and tools. */
  data(id: string, name: string, value: string) {
    const els = this.parts.get(id);
    if (!els) return;
    for (const el of els) el.setAttribute(`data-${name}`, value);
  }

  /** Set a morphing shape's path. */
  path(ref: string, spec: PathSpec) {
    const entry = this.paths.get(ref);
    if (!entry) return;
    entry.spec = spec;
    const d = toD(this.boilFrame >= 0 && this.opts.boil ? this.jitter(spec, hash(ref)) : spec);
    for (const el of entry.els) el.setAttribute('d', d);
  }

  /** Set an attribute on referenced elements. */
  attr(ref: string, name: string, value: string | number) {
    const els = this.refs.get(ref);
    if (!els) return;
    const v = typeof value === 'number' ? String(r2(value)) : value;
    for (const el of els) el.setAttribute(name, v);
  }

  has(id: string) {
    return this.parts.has(id) || this.paths.has(id) || this.refs.has(id);
  }

  private jitter(spec: PathSpec, salt: number): Seg[] {
    const a = this.opts.boil ?? 0;
    const f = this.boilFrame;
    return mapPoints(spec, (i, x, y) => [
      x + (seeded(i + salt, f * 7 + 1) - 0.5) * 2 * a,
      y + (seeded(i + salt, f * 7 + 2) - 0.5) * 2 * a,
    ]);
  }

  /** Advance the hand-drawn boil: 3 variants, changing on 2s (every 83 ms). */
  boil(timeMs: number) {
    if (!this.opts.boil) return;
    const f = Math.floor(timeMs / 83) % 3;
    if (f === this.boilFrame) return;
    this.boilFrame = f;
    let k = 0;
    for (const s of this.statics.values()) {
      const d = toD(this.jitter(s.spec, ++k * 13));
      for (const el of s.els) el.setAttribute('d', d);
    }
    for (const [ref, entry] of this.paths) if (entry.spec) this.path(ref, entry.spec);
  }
}
