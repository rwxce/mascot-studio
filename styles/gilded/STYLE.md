<!-- Generated from style.json by scripts/style-docs.mjs. Edit style.json, then run it. -->
# Gilded

**Family:** Fine art · **Look:** An illuminated manuscript: lapis, vermilion and malachite on vellum, a lozenge diaper, gold leaf all round.

| line | fill | texture | palette | eyes | stage | rhythm |
|---|---|---|---|---|---|---|
| gold | diaper | vellum | lapis-gold | solid | initial | smooth |

## Essence, and what it is not
A figure from a book of hours, painted into the bowl of an illuminated initial: deep mineral colours tiled with a fine gold diaper, framed in burnished gold leaf on vellum.

Not stained glass (opaque mineral colours on a pale page, gold not lead), not art-deco (medieval: diaper and vine ornament, no fans), not screenprint (no grain, gold).

## Shapes and line
A gold contour with a fine brown line inside it, like gold leaf laid next to an ink rule.

## Colour
Areas snap to lapis blue, vermilion, malachite green, pale vellum or gold. Gold areas are a burnished leaf gradient; the rest carry a gold lozenge grid with a dot at every crossing.

## Eyes and face
Brown ink on pale areas, pale vellum on dark ones.

## Motion
Smooth.

## Pitfalls
- Dark mineral colours swallow dark eyes: the eye colour follows the body's lightness.
- The diaper must stay finer than the face.

## Checklist
- `pnpm check --style gilded` is green for every mascot.
- The look matches the line above at a glance, next to its neighbours in the gallery.
- No two styles share more than 3 of the 7 axes (`pnpm test`).
