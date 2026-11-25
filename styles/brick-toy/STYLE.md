<!-- Generated from style.json by scripts/style-docs.mjs. Edit style.json, then run it. -->
# Brick Toy

**Family:** Materials · **Look:** Built from glossy plastic bricks: studs on every surface, toy primaries, a studded baseplate, stop-motion.

| line | fill | texture | palette | eyes | stage | rhythm |
|---|---|---|---|---|---|---|
| mould | studs | plastic | toy-primary | printed | baseplate | stop-motion |

## Essence, and what it is not
The character rebuilt from a box of plastic construction bricks and filmed one frame at a time on a baseplate: square-cornered parts, studs catching the light, a printed face.

Not clay (hard square plastic with studs, no thumbprints), not pixel (studs and gloss, no pixel filter), not bauhaus (toy palette, studs, a baseplate).

## Shapes and line
Nearly square corners, thick even limbs, round knob hands and block feet. A thin darker mould line at every edge.

## Colour
Areas snap to the toy colours: red, yellow, blue, green, orange, azure, lime, tan, white or black. Every area is covered in studs with a highlight on top.

## Eyes and face
Small printed black dots and a thin printed smile.

## Motion
Stop-motion at 12 fps, like a brick film.

## Form
How this style constructs the character (`kit/form.ts`); every other field keeps the anatomy as authored.

| field | value |
|---|---|
| proportions.limbThickness | 1.3 |
| proportions.limbLength | 0.9 |
| corners | 0.12 |
| hands | knob |
| feet | block |
| eyes | dot |
| mouth | small |

## Pitfalls
- Studs behind the face compete with the printed eyes: the stud shading stays subtle.
- Dark bricks swallow dark printed eyes: light eyes stay light.

## Checklist
- `pnpm check --style brick-toy` is green for every mascot.
- The look matches the line above at a glance, next to its neighbours in the gallery.
- No two styles share more than 3 of the 7 axes (`pnpm test`).
