# Changelog

## Unreleased

## 0.9.0

- Landing page in English, Spanish (`/es/`) and Catalan (`/ca/`), with a language switcher, hreflang, a logo and favicon, social cards and Lenis smooth scrolling (vendored, MIT). The nav collapses into the menu below 1020 px so the longer Spanish and Catalan labels never overflow.

## 0.8.0

- Landing page on GitHub Pages (`pnpm build:site`): the project story, the 50 styles, the cast and how to make your own; the live gallery moves to `/gallery/` and accepts `?style=`.

## 0.7.0

- **Forms**: a style can now construct the character, not only paint it (`kit/form.ts`, the
  `"form"` block of `style.json`): proportions, corners, taper, noodle limbs, hands, feet, a grid,
  hold-then-snap timing and eye, mouth and brow models (`kit/faces/`). Every anatomy reads it:
  anchor, biped, quadruped, floater and object-limbs. A style without a form renders exactly as
  before.
- 25 new styles (50 in all): Anime, Cel Anime 80s, Manga, Bauhaus, Impasto, Ukiyo-e, Ink Wash,
  Shadow Puppet, Gilded, Engraving, Scratchboard, Pop Art, Art Deco, Pictogram, Mid-century,
  Silent Film, CRT ASCII, Hologram, Circuit Board, Firefly Pointillism, Brick Toy, Memphis,
  Thermal, X-ray and Marker. Comic, Rubber Hose, Clay and Pixel gain a form.
- Nodi: smooth morphs (every shape sampled at the same angles; star to heart goes through the
  circle), the wave beside the head, Pixel faces that survive any tilt.
- Pixel: 3 px blocks and a pixelate filter whose dilation fits the block, so dark details no
  longer shrink to slivers.
- `tools/render.mjs --transparent`: an animated WebP with alpha and a transparent GIF. The README
  heroes are transparent WebPs.
- Fix: a startle jump at 0 ms gave a NaN squash for one frame.
- `pnpm check`: hold-then-snap forms are checked on the continuous timeline instead of skipping
  the no-jumps rule.
- README: how to report a vulnerability privately.

## 0.6.0

- Nodi, the mascot-studio mascot: a vector anchor point whose Bézier handles are its arms. A new
  anatomy, `anchor`, with a body that morphs between a rounded square, a circle, a star and a
  heart, and five built-in actions: draw (sketches a curve in the air), morph, select (a
  selection box appears and it gets resized), snap (steps along a dot grid) and spin.
- The README shows Nodi: a large animated hero, its twelve actions, all 25 styles and the matrix.
- Mascots are discovered from `mascots/*/mascot.json`: adding or deleting a folder is all it
  takes, and nothing else in the repo names a specific example mascot.

## 0.5.0

- 25 styles in 6 families (clean vector, drawn by hand, print, retro screen, materials, light and
  plan), each a plugin with `style.json` (7 axes + docs) and a generated `STYLE.md`.
- The style gallery (`playground/styles.html`, `pnpm build:gallery` for one HTML file): pick a
  mascot, see it alive in every style, open one to play its actions; shareable URLs.
- Diversity is enforced: no two styles share more than 3 axes (`pnpm test`), and
  `pnpm check:styles` fails when two styles render alike.
- Rig: hollow outlines, edge strokes, an offset drop pass (hard shadows, paper layers,
  misregistration), per-frame style hooks, a pixelate filter in viewBox space.
- `pnpm check` covers every mascot × style (100 combinations); stepped styles are sampled at
  their own rhythm. `@no-outline` palettes; light eyes stay light on dark visors.

## 0.4.0

- Styles: anatomies paint by role and a style answers (`kit/style.ts`, `styles/`). Two styles:
  Soft Gradient (the look of plate 004) and Ink. A mascot can tune its palette per style.
- Three new anatomies — `biped` (shoulders and elbows, an antenna on a loose spring),
  `quadruped` (a tail whose tip bends a beat later, twitching ears) and `floater` (a hem that
  ripples, spins, fades) — and three mascots: Robot, Fox and Ghost.
- `pnpm check` runs every mascot in every style; the jump rule now tracks each part, so fast
  motion passes and only real pops fail.
- `tools/matrix.mjs` (mascot × style stills); GIF exports with a full palette and dithering.

## 0.3.0

- Mascots are data: `mascot.json` (anatomy + palette + body + props + actions as keyframes on
  channels). Secret Letter is now only its `mascot.json`.
- `pnpm check`: static rules (spec vs anatomy, contrast, channels, keys, jumps) and rendered rules
  (every action frame by frame: in frame, no jumps, rest pose, unique ids, JS and size budget).
- `CRAFT.md`, `anatomies/object-limbs/ANATOMY.md`, `schema/mascot.schema.json`, generic props
  (`kit/props.ts`), the character runtime (`kit/character.ts`) and data timelines (`kit/timeline.ts`).
- CI runs `pnpm check`.

## 0.2.1

- The first mascot is now called Secret Letter (`mascots/secret-letter/`).

## 0.2.0

- Secret Letter mascot: an envelope that is also a puzzle
  piece, with 12 actions (wave, thumbs-up, idea, heart, reveal, look-around, stretch, sleepy, shy,
  hop, notice, surprise), idle life and hover/click reactions.
- Director (`kit/director.ts`), pointer reactions (`kit/interact.ts`), playground, deterministic
  render and stills-grid tools.
- Release workflow now publishes the GitHub release.

## 0.1.0

- Kit: motion engine (port of rossark-motion-skill), closed-form springs, shape morphs, seamless
  two-pass rig, one clock paused off screen and reduced-motion aware.
