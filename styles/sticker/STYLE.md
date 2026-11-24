<!-- Generated from style.json by scripts/style-docs.mjs. Edit style.json, then run it. -->
# Sticker

**Family:** Clean vector · **Look:** A thick white border and a hard shadow, like a die-cut sticker on a dotted page.

| line | fill | texture | palette | eyes | stage | rhythm |
|---|---|---|---|---|---|---|
| sticker | flat | gloss | bright | oval-shine | dots | smooth |

## Essence, and what it is not
A vinyl sticker: bright flat colours inside a fat white die-cut border, lifted off the page by a hard shadow.

Not ink (the border is white and fat, not a black line).

## Shapes and line
The white border is the outline pass; the shadow is an offset copy of the silhouette.

## Colour
Saturated +15 %. Page: pale lilac with a dot pattern.

## Eyes and face
Ovals with a shine.

## Motion
Smooth.

## Pitfalls
- A white mascot loses its edge on the white border: give it a palette tweak.

## Checklist
- `pnpm check --style sticker` is green for every mascot.
- The look matches the line above at a glance, next to its neighbours in the gallery.
- No two styles share more than 3 of the 7 axes (`pnpm test`).
