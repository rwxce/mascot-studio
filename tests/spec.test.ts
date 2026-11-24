import { describe, expect, it } from 'vitest';
import { contract } from '../anatomies/anchor/index';
import { contrast, validateSpec, type MascotSpec } from '../kit/spec';
import base from '../mascots/nodi/mascot.json';

const ok = () => structuredClone(base) as unknown as MascotSpec;
const rules = (s: MascotSpec) => validateSpec(s, contract).map((i) => `${i.path}: ${i.message}`);

describe('validateSpec', () => {
  it('accepts Nodi', () => {
    expect(rules(ok())).toEqual([]);
  });
  it('needs kebab-case names', () => {
    const s = ok(); s.name = 'My Mascot';
    expect(rules(s).join()).toMatch(/kebab-case/);
  });
  it('needs the required palette roles, as hex', () => {
    const s = ok(); delete (s.palette as any).body; s.palette.ink = 'black';
    const r = rules(s).join();
    expect(r).toMatch(/palette.body: is required/);
    expect(r).toMatch(/not a hex colour/);
  });
  it('rejects unknown palette roles and body parameters', () => {
    const s = ok(); s.palette.sky = '#000000'; s.body = { ...s.body, wings: 2 };
    const r = rules(s).join();
    expect(r).toMatch(/palette.sky: unknown role/);
    expect(r).toMatch(/body.wings: unknown parameter/);
  });
  it('needs 3:1 contrast between the eyes and the body', () => {
    const s = ok(); s.palette.eye = '#EEEEEE';
    expect(rules(s).join()).toMatch(/contrast with body/);
    expect(contrast('#000000', '#FFFFFF')).toBeCloseTo(21, 0);
  });
  it('rejects unknown channels and props without anchors', () => {
    const s = ok();
    s.actions!.push({ name: 'fly', duration: 1000, tracks: [{ ch: 'wing.rot', keys: [[0, 0], [1000, 0]] }, { ch: 'prop.note', op: 'set', keys: [[0, 1], [1000, 0]] }] });
    const r = rules(s).join();
    expect(r).toMatch(/unknown channel "wing.rot"/);
    expect(r).toMatch(/props.note has no anchor/);
  });
  it('rejects unsorted keys, keys past the end and duplicates', () => {
    const s = ok();
    s.actions!.push({ name: 'twitch', duration: 500, tracks: [{ ch: 'body.rot', keys: [[300, 0], [100, 2], [900, 0]] }] });
    s.actions!.push({ name: 'twitch', duration: 500, tracks: [{ ch: 'body.rot', keys: [[0, 0], [500, 0]] }] });
    const r = rules(s).join();
    expect(r).toMatch(/sorted by time/);
    expect(r).toMatch(/after the end/);
    expect(r).toMatch(/duplicate action name/);
  });
  it('rejects add tracks without envelope that do not return to 0 (a jump)', () => {
    const s = ok();
    s.actions!.push({ name: 'pop', duration: 800, tracks: [{ ch: 'handleR', env: false, keys: [[0, 0], [800, -60]] }] });
    expect(rules(s).join()).toMatch(/start and end at 0/);
  });
  it('rejects jumps without room to anticipate or settle', () => {
    const s = ok();
    s.actions!.push({ name: 'leap', duration: 900, jumps: [{ at: 100, air: 400, height: 20 }] });
    const r = rules(s).join();
    expect(r).toMatch(/anticipation/);
    expect(r).toMatch(/settle/);
  });
});

describe('every mascot in the repo', () => {
  it('passes the static rules of its anatomy', async () => {
    const { anatomies } = await import('../anatomies/index');
    const { specs } = await import('../mascots/index');
    for (const s of specs) expect(validateSpec(s, anatomies[s.anatomy].contract), s.name).toEqual([]);
  });
  it('checks per-style palettes too', () => {
    const s = ok(); s.palettes = { 'soft-gradient': { body: '#2A0F1A', eye: '#2A0F1A', wings: '#fff' } };
    const r = rules(s).join();
    expect(r).toMatch(/palettes.soft-gradient.wings: unknown role/);
    expect(r).toMatch(/palettes.soft-gradient.eye: contrast/);
  });
});
