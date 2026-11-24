<!-- Generated from style.json by scripts/style-docs.mjs. Edit style.json, then run it. -->
# Ink Wash

**Family:** Drawn by hand · **Look:** Chinese ink wash: grey ink pooling at the edges, a dry-brush contour, empty paper and a red seal.

| line | fill | texture | palette | eyes | stage | rhythm |
|---|---|---|---|---|---|---|
| dry-brush | wash-grey | rice-paper | ink-grey | solid | seal | smooth |

## Essence, and what it is not
A brush painting in one stick of ink diluted to many greys: soft wet areas that darken where the water dried, a quick contour, most of the sheet left empty, and the painter's red seal.

Not ink (no colour, wet grey washes and a seal), not pencil (brush and wash, not graphite hatching), not ukiyo-e (no colour, no carved key line, no composed stage).

## Shapes and line
A dark contour that sits a little transparent, and a pale grey copy of the silhouette offset beside it, the way ink bleeds into damp paper.

## Colour
Every colour becomes a grey of the same lightness. Areas are lighter in the middle and pool darker at their edges. Only the seal is red.

## Eyes and face
Solid black ink.

## Motion
Smooth, with a slight boil on the brush line.

## Pitfalls
- Characters whose colours share a lightness turn into one grey: the contour separates them.
- Keep the stage sparse: the empty paper is part of the look.

## Checklist
- `pnpm check --style ink-wash` is green for every mascot.
- The look matches the line above at a glance, next to its neighbours in the gallery.
- No two styles share more than 3 of the 7 axes (`pnpm test`).
