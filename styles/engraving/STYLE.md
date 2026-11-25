<!-- Generated from style.json by scripts/style-docs.mjs. Edit style.json, then run it. -->
# Engraving

**Family:** Print · **Look:** A copperplate engraving: tone built from fine parallel and crossed lines, dark sepia on cream, in an oval cartouche.

| line | fill | texture | palette | eyes | stage | rhythm |
|---|---|---|---|---|---|---|
| burin | cross-hatch | plate | sepia-black | solid | cartouche | smooth |

## Essence, and what it is not
An illustration cut into a copper plate with a burin and printed in dark ink: no flat tone at all, only lines, closer together where it is darker and crossed where it is darkest.

Not pencil (crisp printed lines of even ink, crossed for dark tones, an engraved frame), not manga (lines, not dots), not woodblock (no colour, no wood grain).

## Shapes and line
A thin, firm contour. Every area is ruled with parallel lines whose angle changes from part to part, so the parts read as separate planes.

## Colour
Only dark sepia ink on cream. The gap between lines follows how dark the area was; below mid-grey a second set of lines crosses the first.

## Eyes and face
Solid ink, or cream on a dark visor.

## Motion
Smooth.

## Pitfalls
- Close line gaps alias into moiré at small sizes: the gap never drops below 2 px.
- Light palettes leave areas blank: the contour carries them.

## Checklist
- `pnpm check --style engraving` is green for every mascot.
- The look matches the line above at a glance, next to its neighbours in the gallery.
- No two styles share more than 3 of the 7 axes (`pnpm test`).
