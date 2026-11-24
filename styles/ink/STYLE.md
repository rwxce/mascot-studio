<!-- Generated from style.json by scripts/style-docs.mjs. Edit style.json, then run it. -->
# Ink

**Family:** Drawn by hand · **Look:** A heavy black line around every shape, flat paper colours, one accent.

| line | fill | texture | palette | eyes | stage | rhythm |
|---|---|---|---|---|---|---|
| ink | flat | none | character | solid | paper | smooth |

## Essence, and what it is not
A sticker-clean cartoon on paper: one heavy, even black line around every silhouette, flat colours inside, one accent.

Not a sketch (the line never wobbles) and not a comic (no shading, no halftone).

## Shapes and line
The outline is its own pass under the fills, so touching parts fuse with no seam. ~5.5 px at the scale of a 160-unit viewBox; anatomies scale it.

## Colour
Flat fills straight from the palette on paper (#FAF8F4). Body colour, one accent, ink.

## Eyes and face
Solid ink, no shine; cheeks only when blushing.

## Motion
Smooth, 60 fps.

## Pitfalls
- Thin limbs drawn as strokes need their outline too: the rig draws a wider stroke underneath.

## Checklist
- `pnpm check --style ink` is green for every mascot.
- The look matches the line above at a glance, next to its neighbours in the gallery.
- No two styles share more than 3 of the 7 axes (`pnpm test`).
