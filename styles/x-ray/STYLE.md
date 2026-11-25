<!-- Generated from style.json by scripts/style-docs.mjs. Edit style.json, then run it. -->
# X-ray

**Family:** Sensors and circuits · **Look:** A security scanner image: translucent orange and blue layers on black, every inner part showing through, on a belt.

| line | fill | texture | palette | eyes | stage | rhythm |
|---|---|---|---|---|---|---|
| dense-edge | translucent-layers | none | scanner | dense | belt | smooth |

## Essence, and what it is not
The character passing through a baggage scanner: soft parts read as see-through orange, harder parts as blue, and wherever parts overlap the image gets denser, so you see right into it.

Not glass (dark scanner field, two material colours, no blobs), not hologram (two hues by density, a belt not a HUD, no scan lines), not blueprint (translucent fills, no grid).

## Shapes and line
Every part has a dense bright rim and a translucent inside, so overlapping parts and their edges all show.

## Colour
Body and belly in organic orange, darker and harder parts in metal blue, all translucent over near-black.

## Eyes and face
Near-white: the densest thing in the scan.

## Motion
Smooth.

## Pitfalls
- Overlaps add up to opaque: keep the fill opacities low.
- The palette only decides which parts are 'metal': colours themselves are not kept.

## Checklist
- `pnpm check --style x-ray` is green for every mascot.
- The look matches the line above at a glance, next to its neighbours in the gallery.
- No two styles share more than 3 of the 7 axes (`pnpm test`).
