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
The whole drawing goes through a pixelate filter (4 px blocks); sizes snap to the 4 px grid, corners are nearly square, hands are round knobs and feet are blocks.

## Colour
Channels quantised to 4 levels.

## Eyes and face
Eyes and mouth are built from 4 px blocks (2 × 3 per eye, one shine block), so the pixelate filter never drops them.

## Motion
Time steps at 8 fps.

## Form
How this style constructs the character (`kit/form.ts`); every other field keeps the anatomy as authored.

| field | value |
|---|---|
| corners | 0.12 |
| grid | 4 |
| eyes | pixel |
| mouth | pixel |
| hands | knob |
| feet | block |

## Pitfalls
- SVG filters cost more than plain shapes: check the budget on phones.
- Check Safari: filters render differently.

## Checklist
- `pnpm check --style pixel` is green for every mascot.
- The look matches the line above at a glance, next to its neighbours in the gallery.
- No two styles share more than 3 of the 7 axes (`pnpm test`).
