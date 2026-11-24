<!-- Generated from style.json by scripts/style-docs.mjs. Edit style.json, then run it. -->
# Flat

**Family:** Clean vector · **Look:** Solid colours, no outline, no gradient: shapes and nothing else.

| line | fill | texture | palette | eyes | stage | rhythm |
|---|---|---|---|---|---|---|
| none | flat | none | pastel | dot | light | smooth |

## Essence, and what it is not
Pure geometry in solid colour. Volume comes only from neighbouring colours, never from light.

Not soft-gradient (no gradient, no glow) and not ink (no line).

## Shapes and line
No outline: separate parts with different roles, or they merge.

## Colour
The character's palette, lifted 12 % towards white.

## Eyes and face
Solid dots, no shine; cheeks faintly visible.

## Motion
Smooth.

## Pitfalls
- Two touching parts in the same colour become one blob: give one a darker role.

## Checklist
- `pnpm check --style flat` is green for every mascot.
- The look matches the line above at a glance, next to its neighbours in the gallery.
- No two styles share more than 3 of the 7 axes (`pnpm test`).
