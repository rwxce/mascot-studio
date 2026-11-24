<!-- Generated from style.json by scripts/style-docs.mjs. Edit style.json, then run it. -->
# Silent Film

**Family:** Retro screen · **Look:** A 1920s reel: silver greys with a sepia tint, grain and scratches, a dark vignette, flicker, 16 fps.

| line | fill | texture | palette | eyes | stage | rhythm |
|---|---|---|---|---|---|---|
| grey-thin | silver | scratches | silver-sepia | solid | vignette | sixteen-fps |

## Essence, and what it is not
A frame of silent-era film projected a century later: soft orthochromatic greys toned warm, dust and scratches on the print, the corners burned dark, the light pulsing and the motion a little jerky.

Not rubber-hose (no fat black line, no sepia paper: silver greys, a vignette and scratches, no bounce), not pencil (projected light, not graphite), not one-bit (continuous greys).

## Shapes and line
A thin dark grey contour; areas softly lit from the upper left.

## Colour
Every colour becomes a silver grey of the same lightness, tinted warm.

## Eyes and face
Solid near-black.

## Motion
Steps at 16 fps, the old hand-cranked rate, with an uneven projector flicker.

## Pitfalls
- Flicker must stay gentle (no more than 15 %) and never strobe.
- The vignette sits over the character: keep its centre fully clear.

## Checklist
- `pnpm check --style silent-film` is green for every mascot.
- The look matches the line above at a glance, next to its neighbours in the gallery.
- No two styles share more than 3 of the 7 axes (`pnpm test`).
