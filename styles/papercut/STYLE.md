<!-- Generated from style.json by scripts/style-docs.mjs. Edit style.json, then run it. -->
# Papercut

**Family:** Materials · **Look:** Layers of cut paper casting shadows on each other, stop-motion.

| line | fill | texture | palette | eyes | stage | rhythm |
|---|---|---|---|---|---|---|
| none | layered | paper | warm | cutout | paper | stop-motion |

## Essence, and what it is not
A paper diorama: each layer of the rig is a sheet of cut paper casting a shadow on the one below.

Not flat (shadows between layers, stop-motion, paper grain).

## Shapes and line
Every layer casts an offset shadow.

## Colour
Warmed towards kraft paper.

## Eyes and face
Flat cut-outs.

## Motion
8 fps.

## Pitfalls
- Many layers stack many shadows: keep layers few.

## Checklist
- `pnpm check --style papercut` is green for every mascot.
- The look matches the line above at a glance, next to its neighbours in the gallery.
- No two styles share more than 3 of the 7 axes (`pnpm test`).
