<!-- Generated from style.json by scripts/style-docs.mjs. Edit style.json, then run it. -->
# CRT ASCII

**Family:** Retro screen · **Look:** A green phosphor terminal: the character drawn in text-mode glyphs, scanlines, a blinking prompt.

| line | fill | texture | palette | eyes | stage | rhythm |
|---|---|---|---|---|---|---|
| phosphor | glyphs | scanlines | green-phosphor | block | terminal | refresh |

## Essence, and what it is not
ASCII art on a monochrome monitor: every area is filled with character cells whose glyph gets denser the brighter the area, glowing green behind the glass.

Not pixel (one green, text cells instead of colour pixels), not one-bit (glowing green on black, glyphs not dither), not synthwave (no neon gradient, no sun).

## Shapes and line
A thin phosphor edge on each part. Inside, a grid of 5 by 7 cells, each holding one glyph: a dot, a plus, a hash or a full block.

## Colour
Only green phosphor in four brightnesses on a near-black screen. Brighter areas get heavier glyphs.

## Eyes and face
The brightest phosphor, solid, like a cursor block.

## Motion
Redraws at 15 fps, like a slow terminal.

## Pitfalls
- Two areas of the same lightness get the same glyph: the edge keeps them apart.
- Scanlines over the eyes must stay faint.

## Checklist
- `pnpm check --style crt-ascii` is green for every mascot.
- The look matches the line above at a glance, next to its neighbours in the gallery.
- No two styles share more than 3 of the 7 axes (`pnpm test`).
