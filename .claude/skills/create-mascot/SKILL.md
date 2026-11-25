---
name: create-mascot
description: Create a new mascot (and optionally a new style) for mascot-studio, end to end, from interview to checked exports. Use when the user says "make a mascot", "create a mascot", "new mascot", "design a character", "new style", "add a style" or "own style".
---

# Create a mascot (or a style)

Run from the repo root. If your shell cannot `cd`, prefix commands: `pnpm -C <repo> check …`, `pnpm -C <repo> exec node tools/grid.mjs …`. This skill holds the workflow only; the rules live in the files below, **read them, do not rely on memory**:

| Source of truth | Read it for |
|---|---|
| `anatomies/<id>/ANATOMY.md` (there is no root `ANATOMY.md`; one file per anatomy: `anchor`, `biped`, `floater`, `object-limbs`, `quadruped`) | body params, palette roles, channels, built-in actions |
| `CRAFT.md` | every drawing, motion, style and budget rule (the ones marked ✓ are enforced by `pnpm check`) |
| `schema/mascot.schema.json` | the shape of `mascot.json` |
| `kit/form.ts` | `FORM_RANGES` / `FORM_ENUMS`: what a style `form` block may contain |
| `README.md` "Make your own" | a minimal `mascot.json` |

Autonomous run (nobody to answer)? Pick the most reasonable option, state the assumption in one line, and continue.

## Flow 1: a new mascot

1. **Interview** (one short message, 3 questions): what is it for, what personality (3 adjectives), where will it be seen (size, light or dark page, transparent embed?).
2. **Anatomy.** Read the 5 `ANATOMY.md` files and pick the one whose skeleton fits. Stretch a skeleton only as far as the body still reads (a sticky note on `object-limbs` is fine; a snake on `biped` is not). If none fits, **STOP**: tell the user and propose opening an issue (what skeleton is missing); do not invent engine code.
3. **Three concepts.** For each: anatomy, palette (roles from that ANATOMY.md), 3 own actions (names + one line each). For each concept write a draft `mascots/<name>-a|b|c/mascot.json` (copy the example of the same anatomy: anchor `nodi`, biped `robot`, floater `ghost`, object-limbs `secret-letter`, quadruped `fox`; strip its extra actions, `props` and `palettes`, then edit). The three concepts must differ in look AND in action ideas, not only palette, then show a still:
   ```bash
   node tools/grid.mjs <name>-a wave:1300 --out out/<name>-a.png
   ```
   Syntax: `grid.mjs <mascot> action:ms,action:ms [--cols 4] [--out file] [--style id] [--bg #hex]`. Show the PNGs and wait for the user's pick; autonomous: pick the one that best matches the personality. Delete the two losing folders.
4. **Storyboard** (after the OK on the look; in an autonomous run keep it to one line per action, but still write it). Show a table per own action: name, duration (ms, under 15 000), weight, then rows of `time -> channel -> value` and the beat it sells (anticipation, peak, settle). Channels come from the ANATOMY.md; follow the Motion rules in `CRAFT.md` (`flow` curves, springs for follow-through, jumps with anticipation and ~520 ms settle, `add` tracks start and end at 0).
5. **Write `mascots/<name>/mascot.json`** (folder name = `name`; `"$schema": "../../schema/mascot.schema.json"`; fields `name`, `title`, `description`, `anatomy`, `style`, `palette`, `props`, `actions`). Mascots are discovered by `mascots/index.ts` via glob: no registration needed. `props` maps anchor names to `[x, y]`; `{}` is fine. Only these `prop.*` channels exist: bulb, rays, heart, zzz, sparkles, note, question, exclaim (see `kit/props.ts`). Track syntax (`op` set/add/mul/max/min, `curve`, `osc`, `env`, `jumps`) is defined in `schema/mascot.schema.json`; copy patterns from the example mascots. Optional per-style palettes via `palettes` (style id or `"@no-outline"`).
6. **Check until green:**
   ```bash
   pnpm check <name>        # every rule, every action, frame by frame, across ALL styles
   ```
   Fix each `✗ rule where: message` line in the JSON (not in the engine) and rerun. Also run `pnpm typecheck` and `pnpm test` before finishing. Use `pnpm dev` to eyeball it (a button per action).
7. **Exports** (to `out/` by default):
   ```bash
   node tools/render.mjs <name> --reel <a>,<b>,<c> --transparent   # MP4, GIF, transparent WebP (needs ffmpeg + img2webp from `brew install webp`)
   node tools/grid.mjs <name> <a>:1300,<b>:1900 --out docs/media/<name>-actions.png
   ```
   `render.mjs` also takes `--ms --fps --width --out --stills --sheet --style`.
8. Do not commit unless asked. Report: anatomy, actions, check result, output paths.

## Flow 2: an own style

A style only decides how roles are painted (never geometry or motion). Read `CRAFT.md` "Styles" and `kit/form.ts` first.

1. **Pick the look** (ask or assume). `styles/<id>/style.json` needs `id`, `title`, `family`, `look`, `bg`, the 7 `axes` (`line, fill, texture, palette, eyes, stage, rhythm`) and a `doc` block (`essence, notIt, shapes, colour, eyes, motion, pitfalls`). Copy `styles/flat/style.json`. **Share at most 3 axes with any other style** (a test enforces it; compare against every `styles/*/style.json`).
2. **Optional `form` block** (how the character is built, not just painted): copy from `styles/anime/style.json`; every number must be inside `FORM_RANGES`, enums inside `FORM_ENUMS` (`kit/form.ts`). Omit it to draw the anatomy as authored.
3. **Painter** `styles/<id>/index.ts`: start from `styles/flat/index.ts` (simplest) or `styles/anime/index.ts` (has a form); it exports a `Style` built with `makePainter` from `kit/stylekit.ts`. Never edit anatomies for a style.
4. **Register** in `styles/index.ts`: add the `import { <camelId> } from './<id>/index.js'` and append it to the `styles` array.
5. **Docs and checks:**
   ```bash
   pnpm docs:styles                 # generates styles/<id>/STYLE.md; never hand-edit it
   pnpm check --style <id>          # every mascot in the new style
   pnpm check:styles                # no two styles may look alike
   pnpm test                        # axes overlap, form ranges, docs in sync
   ```
   Fix failures in `style.json` / `index.ts` and rerun. Look at it with `node tools/grid.mjs nodi wave:1300 --style <id>` and `node tools/matrix.mjs`.
6. A new style also appears in the README style table (family row) and image gallery; mention it to the user instead of regenerating the media unprompted.
