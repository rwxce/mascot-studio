<!-- Generated from style.json by scripts/style-docs.mjs. Edit style.json, then run it. -->
# Firefly Pointillism

**Family:** Fine art · **Look:** The character made of glowing dots on a night field, among twinkling fireflies.

| line | fill | texture | palette | eyes | stage | rhythm |
|---|---|---|---|---|---|---|
| none | glow-dots | fireflies | night-glow | spark | fireflies | twinkle |

## Essence, and what it is not
A pointillist picture painted with light: every area is a scatter of small luminous dots in three values of its colour, as if a swarm of fireflies had settled into the shape of the character on a summer night.

Not riso or comic (scattered glowing dots on dark, no regular screen), not neon (filled with dots, no tubes), not synthwave (no gradient, no grid).

## Shapes and line
No outline, only a faint lighter rim. The shape is carried by the density of the dots.

## Colour
Each area keeps its hue: dots in its own colour, a lighter tint and a near-white, over a deep tint of the same colour mixed into the night.

## Eyes and face
Warm white sparks, the brightest dots in the frame.

## Motion
Smooth; the fireflies around the character slowly pulse.

## Pitfalls
- Dark palettes make dim dots: the lightest tint keeps every area visible.
- Dense dots behind the eyes compete with them: the dot tile is kept sparse.

## Checklist
- `pnpm check --style pointillism` is green for every mascot.
- The look matches the line above at a glance, next to its neighbours in the gallery.
- No two styles share more than 3 of the 7 axes (`pnpm test`).
