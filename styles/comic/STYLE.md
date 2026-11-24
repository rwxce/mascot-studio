<!-- Generated from style.json by scripts/style-docs.mjs. Edit style.json, then run it. -->
# Comic

**Family:** Print · **Look:** Bold ink line, Ben-Day dots and a sunburst behind, like a comic panel.

| line | fill | texture | palette | eyes | stage | rhythm |
|---|---|---|---|---|---|---|
| ink | halftone | dots | bright | oval-shine | burst | smooth |

## Essence, and what it is not
A pulp comic panel: saturated colour printed with Ben-Day dots, a heavy ink line, a sunburst.

Not ink (dots and burst), not riso (black line, saturated process colour).

## Shapes and line
Heavy black outline pass.

## Colour
Saturated +25 %, darker dots over each area.

## Eyes and face
Ovals with a shine.

## Motion
Smooth.

## Pitfalls
- Dots alias at tiny sizes.

## Checklist
- `pnpm check --style comic` is green for every mascot.
- The look matches the line above at a glance, next to its neighbours in the gallery.
- No two styles share more than 3 of the 7 axes (`pnpm test`).
