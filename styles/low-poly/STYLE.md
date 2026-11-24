<!-- Generated from style.json by scripts/style-docs.mjs. Edit style.json, then run it. -->
# Low Poly

**Family:** Clean vector · **Look:** Faceted shading in hard diagonal bands, like a low-polygon model.

| line | fill | texture | palette | eyes | stage | rhythm |
|---|---|---|---|---|---|---|
| none | facets | none | shaded | square | sky | smooth |

## Essence, and what it is not
Four hard bands of the same hue across every shape, lit from the top left, read as facets.

Not soft-gradient: no smooth ramps, no glow.

## Shapes and line
No outline.

## Colour
Each area gets lighter / light / base / darker bands.

## Eyes and face
Flat.

## Motion
Smooth.

## Pitfalls
- Very small parts show one band only: that is fine.

## Checklist
- `pnpm check --style low-poly` is green for every mascot.
- The look matches the line above at a glance, next to its neighbours in the gallery.
- No two styles share more than 3 of the 7 axes (`pnpm test`).
