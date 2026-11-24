<!-- Generated from style.json by scripts/style-docs.mjs. Edit style.json, then run it. -->
# One-bit

**Family:** Retro screen · **Look:** Black and white only, with ordered dither for grey, like an early Mac.

| line | fill | texture | palette | eyes | stage | rhythm |
|---|---|---|---|---|---|---|
| thin-black | dither | none | mono | pixel | white | steps |

## Essence, and what it is not
A 1-bit screen: every grey is a dither pattern of black pixels on paper white.

Not pixel (no colour), not line art (dithered fills).

## Shapes and line
Thin black outline.

## Colour
Luminance → 5 dither levels.

## Eyes and face
Black.

## Motion
Steps at 10 fps.

## Pitfalls
- Mid-greys look alike: separate parts by luminance.

## Checklist
- `pnpm check --style one-bit` is green for every mascot.
- The look matches the line above at a glance, next to its neighbours in the gallery.
- No two styles share more than 3 of the 7 axes (`pnpm test`).
