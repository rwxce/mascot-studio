# Changelog

## Unreleased

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
