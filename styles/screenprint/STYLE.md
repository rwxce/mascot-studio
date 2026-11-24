<!-- Generated from style.json by scripts/style-docs.mjs. Edit style.json, then run it. -->
# Screenprint

**Family:** Print · **Look:** Flat posterised colours with an accent plate printed off register.

| line | fill | texture | palette | eyes | stage | rhythm |
|---|---|---|---|---|---|---|
| none | posterized | grain | posterized | dot | color | smooth |

## Essence, and what it is not
A gig-poster screenprint: a few posterised flat inks and an accent plate that slipped.

Not riso (flat, not halftone), not flat (posterised, offset plate, grain).

## Shapes and line
No outline; an accent-coloured offset copy of each silhouette.

## Colour
Each channel quantised to 3 levels.

## Eyes and face
Dots.

## Motion
Smooth.

## Pitfalls
- Posterising can push two roles to the same colour.

## Checklist
- `pnpm check --style screenprint` is green for every mascot.
- The look matches the line above at a glance, next to its neighbours in the gallery.
- No two styles share more than 3 of the 7 axes (`pnpm test`).
