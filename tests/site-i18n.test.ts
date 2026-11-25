import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
// @ts-expect-error plain .mjs helpers
import { extract, localise } from '../tools/site-i18n.mjs';
// @ts-expect-error plain .mjs dictionaries
import { es, ca, families } from '../site/i18n.mjs';
// @ts-expect-error plain .mjs dictionaries
import { gallery, looks } from '../site/gallery-i18n.mjs';

const html = readFileSync('site/index.html', 'utf8');
const keys: string[] = extract(html);

describe('site i18n', () => {
  for (const [name, dict] of [['es', es], ['ca', ca]] as const) {
    it(`${name} translates every string and nothing stale`, () => {
      expect(keys.filter((k) => !(k in dict))).toEqual([]);
      expect(Object.keys(dict).filter((k) => !keys.includes(k) && !k.startsWith('Open menu'))).toEqual([]);
    });
    it(`${name} renders without leftovers`, () => {
      const out = localise(html, dict);
      expect(out).toContain('<!--HEAD-->');
      expect(out.length).toBeGreaterThan(html.length * 0.8);
    });
  }
  it('translates every style family', () => {
    const fams = JSON.parse(html.match(/const FAMS = (\[.*\]);/)![1]).map((f: { name: string }) => f.name);
    for (const d of [families.es, families.ca]) expect(fams.filter((n: string) => !(n in d))).toEqual([]);
  });
});

describe('gallery i18n', () => {
  const styleDirs = readdirSync('styles').filter((d) => existsSync(`styles/${d}/style.json`));
  const looksEn: string[] = styleDirs.map((d) => JSON.parse(readFileSync(`styles/${d}/style.json`, 'utf8')).look);
  const uiKeys = Object.keys(gallery.en);

  for (const lang of ['es', 'ca'] as const) {
    it(`${lang} translates every style description and nothing stale`, () => {
      expect(looksEn.filter((l) => !(l in looks[lang]))).toEqual([]);
      expect(Object.keys(looks[lang]).filter((k) => !looksEn.includes(k))).toEqual([]);
    });
    it(`${lang} has every gallery UI text`, () => {
      expect(uiKeys.filter((k) => !gallery[lang][k])).toEqual([]);
      expect(Object.keys(gallery[lang]).filter((k) => !uiKeys.includes(k))).toEqual([]);
    });
  }
});
