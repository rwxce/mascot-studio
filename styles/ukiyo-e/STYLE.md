<!-- Generated from style.json by scripts/style-docs.mjs. Edit style.json, then run it. -->
# Ukiyo-e

**Family:** Print · **Look:** A Japanese woodblock print: flat pigments fading in bokashi gradients, a fine key line, washi paper, a curling wave.

| line | fill | texture | palette | eyes | stage | rhythm |
|---|---|---|---|---|---|---|
| fine-key | bokashi | washi | pigment | small-ink | wave | smooth |

## Essence, and what it is not
An Edo-period colour print: a hair-thin black key block, a handful of mineral and plant pigments, each one wiped into a soft gradient on the block, on fibrous paper with a stylised wave behind.

Not woodblock (no wood grain, no muted brown inks: indigo, vermilion and ochre fading in bokashi), not ink-wash (colour, a crisp key line, a composed stage), not flat (gradients and paper).

## Shapes and line
A fine, even key line. Slightly softer corners and limbs that thin towards their ends, the way a carver's line tapers.

## Colour
Every area snaps to the nearest of six pigments (indigo, vermilion, ochre, sage, pale pink, paper) and fades from full strength at the top to half strength at the bottom.

## Eyes and face
Small sumi-ink eyes with thin brows and a small mouth: a quiet face.

## Motion
Smooth.

## Form
How this style constructs the character (`kit/form.ts`); every other field keeps the anatomy as authored.

| field | value |
|---|---|
| corners | 0.62 |
| taper | 0.35 |
| brows | thin |
| mouth | small |
| face.scale | 0.92 |
| face.spacing | 0.95 |

## Pitfalls
- Two roles snapping to the same pigment merge: the key line keeps them apart.
- The wave must stay behind the feet, never over the face.

## Checklist
- `pnpm check --style ukiyo-e` is green for every mascot.
- The look matches the line above at a glance, next to its neighbours in the gallery.
- No two styles share more than 3 of the 7 axes (`pnpm test`).
