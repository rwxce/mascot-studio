<!-- Generated from style.json by scripts/style-docs.mjs. Edit style.json, then run it. -->
# Line Art

**Family:** Clean vector · **Look:** A single thin line around every piece on white paper; colour only in the eyes.

| line | fill | texture | palette | eyes | stage | rhythm |
|---|---|---|---|---|---|---|
| hollow | none | none | mono | dot | paper | smooth |

## Essence, and what it is not
An architect's line drawing of the character: every shape edged by one even thin line, filled with paper.

Not ink (thin, even, and every inner shape is outlined too).

## Shapes and line
Every body shape gets a thin edge in the fill pass.

## Colour
Black on white, pink cheeks only.

## Eyes and face
Black dots.

## Motion
Smooth.

## Pitfalls
- Thick stroke limbs show as filled bars.

## Checklist
- `pnpm check --style line-art` is green for every mascot.
- The look matches the line above at a glance, next to its neighbours in the gallery.
- No two styles share more than 3 of the 7 axes (`pnpm test`).
