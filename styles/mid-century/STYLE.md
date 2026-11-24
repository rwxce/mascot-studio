<!-- Generated from style.json by scripts/style-docs.mjs. Edit style.json, then run it. -->
# Mid-century

**Family:** Animation · **Look:** A 1950s modern cartoon: a loose ink line with one flat colour block printed out of register, on textured paper.

| line | fill | texture | palette | eyes | stage | rhythm |
|---|---|---|---|---|---|---|
| offset | off-register | grain | limited-mod | dot | flat-shapes | limited |

## Essence, and what it is not
A modernist cartoon of the fifties: the drawing is a light, angular ink line, and the colour is a separate flat shape that does not quite land on it, over a couple of abstract background shapes.

Not screenprint (the colour sits off the line, not under it; one colour, a line), not line-art (a colour block and paper), not rubber-hose (angular, thin line, limited animation instead of a bounce).

## Shapes and line
The line traces every part's edge without filling it. Sharper corners, thinner tapering limbs, dot eyes and thin brows.

## Colour
One flat colour, the body's, snapped to mustard, teal, coral, olive or sky, printed a few pixels off the line. The page shows through every other area.

## Eyes and face
Small ink dots, a small mouth and thin brows.

## Motion
Limited animation: poses hold, then move quickly to the next.

## Form
How this style constructs the character (`kit/form.ts`); every other field keeps the anatomy as authored.

| field | value |
|---|---|
| proportions.limbThickness | 0.8 |
| corners | 0.2 |
| taper | 0.3 |
| eyes | dot |
| mouth | small |
| brows | thin |
| motion.snap | 0.35 |

## Pitfalls
- Overlapping parts show every edge, because nothing is filled: keep line weight light.
- The colour block must stay offset by less than the line's gap to the next part, or it reads as a second character.

## Checklist
- `pnpm check --style mid-century` is green for every mascot.
- The look matches the line above at a glance, next to its neighbours in the gallery.
- No two styles share more than 3 of the 7 axes (`pnpm test`).
