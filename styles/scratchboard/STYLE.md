<!-- Generated from style.json by scripts/style-docs.mjs. Edit style.json, then run it. -->
# Scratchboard

**Family:** Print · **Look:** White lines scratched out of a black board: the light is what was taken away.

| line | fill | texture | palette | eyes | stage | rhythm |
|---|---|---|---|---|---|---|
| scratched | scratch-lines | none | white-on-black | white | scratch-halo | smooth |

## Essence, and what it is not
A board coated in black ink, worked with a blade: every light in the picture is a line scraped back to the white clay underneath.

Not engraving (white on black, light carved out of dark), not neon (scraped lines, no glow, no colour), not chalkboard (pure black, crisp blade lines, no green board).

## Shapes and line
A thin white scraped edge on every part. Inside, white lines that are closer together where the area was lighter, each part at its own angle.

## Colour
Only black and white. Very dark areas stay unscratched black.

## Eyes and face
Solid white, scraped clean, so the face reads first.

## Motion
Smooth.

## Pitfalls
- Dense white lines around the eyes drown them: the line gap never drops below 3 px.
- Mascots with very dark palettes become a white outline only: that is correct.

## Checklist
- `pnpm check --style scratchboard` is green for every mascot.
- The look matches the line above at a glance, next to its neighbours in the gallery.
- No two styles share more than 3 of the 7 axes (`pnpm test`).
