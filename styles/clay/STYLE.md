<!-- Generated from style.json by scripts/style-docs.mjs. Edit style.json, then run it. -->
# Clay

**Family:** Materials · **Look:** Plasticine: round soft highlights, a contact shadow, stop-motion at 8 fps.

| line | fill | texture | palette | eyes | stage | rhythm |
|---|---|---|---|---|---|---|
| none | radial | fingerprint | character | bead | desk | stop-motion |

## Essence, and what it is not
A stop-motion puppet in plasticine: lit from the top left, every frame posed by hand.

Not soft-gradient (radial light, contact shadow, stop-motion).

## Shapes and line
No outline; a soft offset contact shadow. A chunky, squat puppet: blobby corners, short thick limbs, mitten hands.

## Colour
Radial highlight to a darker rim.

## Eyes and face
Small glossy beads with a shine.

## Motion
8 fps with a tiny wobble and a little overshoot.

## Form
How this style constructs the character (`kit/form.ts`); every other field keeps the anatomy as authored.

| field | value |
|---|---|
| proportions.head | 1.04 |
| proportions.aspect | 0.88 |
| proportions.body | 1.08 |
| proportions.limbLength | 0.72 |
| proportions.limbThickness | 1.55 |
| corners | 0.9 |
| eyes | bead |
| mouth | default |
| hands | mitten |
| face.scale | 0.95 |
| face.y | 0.15 |
| face.mouth | 0.85 |
| motion.overshoot | 0.15 |

## Pitfalls
- Fast actions look jerky at 8 fps on purpose.

## Checklist
- `pnpm check --style clay` is green for every mascot.
- The look matches the line above at a glance, next to its neighbours in the gallery.
- No two styles share more than 3 of the 7 axes (`pnpm test`).
