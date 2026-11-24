<!-- Generated from style.json by scripts/style-docs.mjs. Edit style.json, then run it. -->
# Pop Art

**Family:** Graphic · **Look:** A 1960s pop canvas: giant Ben-Day dots, flat primaries, a thick black line and a white speech burst on cyan.

| line | fill | texture | palette | eyes | stage | rhythm |
|---|---|---|---|---|---|---|
| heavy-black | big-dots | none | primary-pop | solid | speech-burst | smooth |

## Essence, and what it is not
A comic frame blown up to gallery size and repainted by hand: the printing dots become huge and deliberate, the colours are straight from the tube, and a jagged white balloon shouts behind.

Not comic (dots on a white ground, only primaries, flat cyan and pink grounds, a speech balloon instead of a sunburst), not riso (black line, no misregistration), not bauhaus (dots, line, a balloon).

## Shapes and line
A thick black line on every part, squarer corners, bold brows and a wide mouth.

## Colour
Areas snap to red, yellow, blue, pink, green or white. The body is printed as big coloured dots on white; the rest is flat.

## Eyes and face
Solid black with a white glint.

## Motion
Smooth.

## Form
How this style constructs the character (`kit/form.ts`); every other field keeps the anatomy as authored.

| field | value |
|---|---|
| corners | 0.38 |
| brows | bold |
| mouth | wide |
| face.scale | 1.1 |

## Pitfalls
- Big dots behind small eyes flicker at small sizes: the dot screen stays coarser than the eyes.
- Body and accent snapping to the same primary merge: the line keeps them apart.

## Checklist
- `pnpm check --style pop-art` is green for every mascot.
- The look matches the line above at a glance, next to its neighbours in the gallery.
- No two styles share more than 3 of the 7 axes (`pnpm test`).
