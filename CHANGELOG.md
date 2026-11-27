# Changelog

## Unreleased

- Secret Letter: the secret puzzle piece is 1.9× bigger (`body.innerScale`) and rises whole out of
  the envelope's mouth; a clip at the mouth keeps it from showing through the bottom notch.
- `object-limbs`: the tabs stay puzzle tabs in every style. Styles no longer turn them into arms
  with hands, and `armX.long` no longer stretches them (the channel stays, with no effect).
- Rig: a part can carry `clipRect` (a rectangular clip in its own coordinates, unique per copy).

## 1.1.1

- The site shows its icon in Safari too (PNG favicon and `apple-touch-icon` next to the SVG), and the gallery scrolls with Lenis like the landing.

## 1.1.0

- The README and landing Nodi now changes style as it moves: sticker, ink, low poly, bauhaus and anime,
  crossfading on the same pose (`docs/media/nodi.webp`, transparent).
- `tools/render.mjs --styles a,b,c [--every ms] [--fade ms]`: one render that changes style over time;
  every style replays the same deterministic timeline, so the pose carries across each change.
- `pnpm build:embed` (`playground/embed.ts`): a self-contained live Nodi script (~23 KB gz) that
  follows the pointer and cycles styles in any `[data-nodi-live]` element; the rwxce site uses it.

## 1.0.0

**1.0: the format is now stable.** What a mascot, a style and an anatomy look like on disk is the
public interface from here on.

- Stable from 1.0: the `mascot.json` format (`schema/mascot.schema.json`), the `style.json` format
  (7 axes, docs and the optional `form` block), the five anatomies (`anchor`, `biped`,
  `quadruped`, `floater`, `object-limbs`) and their built-in actions, and the `pnpm check` rules a
  mascot must pass. A mascot or style written for 1.0 keeps rendering the same in every 1.x.
- Breaking changes to any of these wait for 2.0 and are announced here first.
- What 1.0 holds: 50 styles in 6 families, the form layer, Nodi and the plate 004 cast, the live
  style gallery, and the landing page in English, Spanish and Catalan.
- Fix: the cast images on the landing no longer overflow the page at 320-340 px.

## 0.10.0

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
