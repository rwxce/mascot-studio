<!-- Generated from style.json by scripts/style-docs.mjs. Edit style.json, then run it. -->
# Comic

**Family:** Print · **Look:** Bold ink line, Ben-Day dots and a sunburst behind, like a comic panel.

| line | fill | texture | palette | eyes | stage | rhythm |
|---|---|---|---|---|---|---|
| ink | halftone | dots | bright | comic | burst | smooth |

## Essence, and what it is not
A pulp comic panel: saturated colour printed with Ben-Day dots, a heavy ink line, a sunburst.

Not ink (dots and burst), not riso (black line, saturated process colour).

## Shapes and line
Heavy black outline pass. Squarer corners, thicker limbs that thin towards the hands.

## Colour
Saturated +25 %, darker dots over each area.

## Eyes and face
White ovals with a black pupil that looks around, a heavy upper lid and bold slab brows.

## Motion
Smooth, with springs loose enough to overshoot and settle.

## Form
How this style constructs the character (`kit/form.ts`); every other field keeps the anatomy as authored.

| field | value |
|---|---|
| proportions.limbThickness | 1.15 |
| corners | 0.3 |
| taper | 0.5 |
| eyes | comic |
| brows | bold |
| face.scale | 1.08 |
| face.spacing | 1.05 |
| face.mouth | 1.1 |
| motion.overshoot | 0.45 |

## Pitfalls
- Dots alias at tiny sizes.

## Checklist
- `pnpm check --style comic` is green for every mascot.
- The look matches the line above at a glance, next to its neighbours in the gallery.
- No two styles share more than 3 of the 7 axes (`pnpm test`).
