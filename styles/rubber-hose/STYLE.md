<!-- Generated from style.json by scripts/style-docs.mjs. Edit style.json, then run it. -->
# Rubber Hose

**Family:** Retro screen · **Look:** A 1930s cartoon: sepia, a fat black line, film grain, on twos.

| line | fill | texture | palette | eyes | stage | rhythm |
|---|---|---|---|---|---|---|
| ink | flat | film | sepia | pie | paper | twos |

## Essence, and what it is not
An early sound cartoon: sepia stock, fat black line, flickering projector, animated on twos.

Not ink (sepia, grain, flicker, on twos).

## Shapes and line
Fat black outline. Big round shapes, noodle arms that bend in one curve with no elbow, white four-finger gloves, big shoes.

## Colour
Every colour mapped to sepia.

## Eyes and face
Pie eyes: tall white ovals with black pupils that have a wedge cut out. A wide grin.

## Motion
On twos with a faint projector flicker, and a constant bounce on the beat.

## Form
How this style constructs the character (`kit/form.ts`); every other field keeps the anatomy as authored.

| field | value |
|---|---|
| proportions.head | 1.06 |
| proportions.limbThickness | 1.15 |
| proportions.limbLength | 1.08 |
| corners | 0.92 |
| limbs | noodle |
| hands | glove |
| feet | shoe |
| eyes | pie |
| mouth | wide |
| face.scale | 1.1 |
| face.spacing | 0.86 |
| face.y | 0.05 |
| motion.bounce | 3 |
| motion.overshoot | 0.3 |

## Pitfalls
- Flicker must stay subtle (±6 %).

## Checklist
- `pnpm check --style rubber-hose` is green for every mascot.
- The look matches the line above at a glance, next to its neighbours in the gallery.
- No two styles share more than 3 of the 7 axes (`pnpm test`).
