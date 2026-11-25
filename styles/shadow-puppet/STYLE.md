<!-- Generated from style.json by scripts/style-docs.mjs. Edit style.json, then run it. -->
# Shadow Puppet

**Family:** Materials · **Look:** A dark leather puppet with punched-out holes, pressed against a lamp-lit screen.

| line | fill | texture | palette | eyes | stage | rhythm |
|---|---|---|---|---|---|---|
| none | silhouette | perforated | lamp | hole | screen | smooth |

## Essence, and what it is not
Shadow theatre: a flat figure cut from dark hide, its decoration punched through so the lamp shines out of it, held against a glowing paper screen.

Not papercut (one dark colour, light coming through holes, a lit screen), not one-bit (warm glow, no dither), not neon (solid silhouette).

## Shapes and line
No outline: the silhouette is the drawing. Sharper corners and thinner limbs that taper to points, like jointed leather pieces. A second, softer shadow falls beside the figure on the screen.

## Colour
Every area becomes near-black hide. The body is punched with a lattice of small holes and the belly with slots, both showing the warm lamp light.

## Eyes and face
Small round holes the lamp shines through, and a small cut mouth.

## Motion
Smooth.

## Form
How this style constructs the character (`kit/form.ts`); every other field keeps the anatomy as authored.

| field | value |
|---|---|
| proportions.limbThickness | 0.75 |
| proportions.limbLength | 1.08 |
| corners | 0.25 |
| taper | 0.55 |
| eyes | dot |
| mouth | small |

## Pitfalls
- Without the screen behind it the silhouette disappears on dark pages: keep the stage.
- Holes behind the eyes compete with them: the lattice is kept sparse.

## Checklist
- `pnpm check --style shadow-puppet` is green for every mascot.
- The look matches the line above at a glance, next to its neighbours in the gallery.
- No two styles share more than 3 of the 7 axes (`pnpm test`).
