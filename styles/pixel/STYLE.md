<!-- Generated from style.json by scripts/style-docs.mjs. Edit style.json, then run it. -->
# Pixel

**Family:** Retro screen · **Look:** Big pixels, a limited palette and motion that steps at 8 fps.

| line | fill | texture | palette | eyes | stage | rhythm |
|---|---|---|---|---|---|---|
| dark-pixel | pixels | none | limited | pixel | dark | steps |

## Essence, and what it is not
A sprite from an old console: chunky pixels, few colours, steps instead of tweens.

Not one-bit (colour), not flat (pixelated, stepped).

## Shapes and line
The whole drawing goes through a pixelate filter (4 px blocks).

## Colour
Channels quantised to 4 levels.

## Eyes and face
Pixel blocks.

## Motion
Time steps at 8 fps.

## Pitfalls
- SVG filters cost more than plain shapes: check the budget on phones.
- Check Safari: filters render differently.

## Checklist
- `pnpm check --style pixel` is green for every mascot.
- The look matches the line above at a glance, next to its neighbours in the gallery.
- No two styles share more than 3 of the 7 axes (`pnpm test`).
