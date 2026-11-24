<!-- Generated from style.json by scripts/style-docs.mjs. Edit style.json, then run it. -->
# Glass

**Family:** Clean vector · **Look:** Translucent tinted glass with a bright edge, over colourful blurred blobs.

| line | fill | texture | palette | eyes | stage | rhythm |
|---|---|---|---|---|---|---|
| thin-white | translucent | none | cool | glow | blobs | smooth |

## Essence, and what it is not
Frosted, tinted glass: you see the coloured stage through the body, edged with light.

Not soft-gradient (the body is see-through and edged), not stained glass (no lead).

## Shapes and line
A thin white hollow edge around each silhouette; fills fade from a bright corner.

## Colour
The palette cooled 25 % towards cyan. Stage: three soft colour blobs on navy.

## Eyes and face
Bright with a shine.

## Motion
Smooth.

## Pitfalls
- Overlapping translucent parts look darker where they overlap: that is part of the look.

## Checklist
- `pnpm check --style glass` is green for every mascot.
- The look matches the line above at a glance, next to its neighbours in the gallery.
- No two styles share more than 3 of the 7 axes (`pnpm test`).
