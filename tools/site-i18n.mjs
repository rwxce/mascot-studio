// Localise site/index.html. The template is English; every visible string (text nodes, alt and
// aria-label attributes, <title> and the description) is a key of the per-locale dictionaries in
// site/i18n.mjs. A key missing from a dictionary fails the build and tests/site-i18n.test.ts.
const SKIP = /^[\W\d_]*$/; // punctuation or numbers only

const norm = (t) => t.replace(/\s+/g, ' ').trim();
const strip = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/<style[\s\S]*?<\/style>/g, '')
    .replace(/<pre[\s\S]*?<\/pre>/g, '')
    .replace(/<svg[\s\S]*?<\/svg>/g, '')
    .replace(/<!--[\s\S]*?-->/g, '');

/** Every translatable string of the template, in document order. */
export function extract(html) {
  const out = new Set();
  const body = strip(html);
  for (const m of body.matchAll(/>([^<>]+)</g)) {
    const t = norm(m[1].replace(/&amp;/g, '&'));
    if (t && !SKIP.test(t) && !/^(pnpm|git|cd) /.test(t)) out.add(t);
  }
  for (const m of body.matchAll(/\s(?:alt|aria-label)="([^"]+)"/g)) out.add(norm(m[1]));
  out.add(norm(html.match(/<title>([^<]+)<\/title>/)[1]));
  out.add(norm(html.match(/<meta name="description" content="([^"]+)"/)[1]));
  return [...out];
}

/** Translate the template into one locale; `dict` maps English → locale. */
export function localise(html, dict) {
  const t = (s) => {
    const key = norm(s.replace(/&amp;/g, '&'));
    if (!(key in dict)) throw new Error(`missing translation: ${key}`);
    return dict[key].replace(/&/g, '&amp;');
  };
  const keep = (re, fn) => (h) => h.replace(re, fn);
  const parts = html.split(/(<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<pre[\s\S]*?<\/pre>|<svg[\s\S]*?<\/svg>|<!--[\s\S]*?-->)/);
  return parts
    .map((chunk, i) => {
      if (i % 2) return chunk; // protected block
      return chunk
        .replace(/>([^<>]+)</g, (m, text) => {
          const key = norm(text.replace(/&amp;/g, '&'));
          if (!key || SKIP.test(key) || /^(pnpm|git|cd) /.test(key)) return m;
          const lead = text.match(/^\s*/)[0];
          const trail = text.match(/\s*$/)[0];
          return `>${lead}${t(text)}${trail}<`;
        })
        .replace(/(\s(?:alt|aria-label)=")([^"]+)"/g, (m, a, v) => `${a}${t(v)}"`)
        .replace(/(<meta name="description" content=")([^"]+)"/, (m, a, v) => `${a}${t(v)}"`);
    })
    .join('');
}
