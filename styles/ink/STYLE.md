# Ink

**Family:** Drawn by hand · **Axes:** line ink · fill flat · texture none · palette character · eyes solid · stage paper · rhythm smooth

## Essence, and what it is not
A sticker-clean cartoon on paper: one heavy, even black line around every silhouette, flat
colours inside, one accent. It is not a sketch (the line never wobbles) and not a comic (no
shading, no halftone).

## Shapes and line
- The outline is drawn as its own pass under the fills, so touching parts fuse with no seam.
- Line weight ≈ 5.5 px at Secret Letter's scale; anatomies scale it with `outline(weight)`.
- Inner details (cross lines, mouths) use the same ink, thinner than the outline.

## Colour
Flat fills straight from the palette. Paper is the card (`#FAF8F4`). Keep it to the body colour,
one accent and the ink.

## Eyes and face
Solid ink eyes, no shine. Cheeks only appear when blushing.

## Motion
Smooth, 60 fps. No boil.

## Pitfalls
- Thin limbs drawn as strokes need their outline too: the rig draws a wider stroke underneath.
- A white body on a white card disappears without the outline: never turn the outline off here.

## Checklist
Outline closed around every silhouette · no seam at joints · no shading · one accent.
