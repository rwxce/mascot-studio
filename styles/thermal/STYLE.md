<!-- Generated from style.json by scripts/style-docs.mjs. Edit style.json, then run it. -->
# Thermal

**Family:** Sensors and circuits · **Look:** A thermal camera view: false-colour heat from cold violet through magenta and orange to white-hot, a scale bar and crosshair.

| line | fill | texture | palette | eyes | stage | rhythm |
|---|---|---|---|---|---|---|
| none | heat | none | ironbow | hot | cold-field | smooth |

## Essence, and what it is not
What an infrared camera sees: not the character's colours but its warmth, mapped onto a false-colour scale, glowing hottest in the core of the body and cooling towards the edges, against a cold room.

Not synthwave (no grid, no sun, heat gradients from the centre out), not soft-gradient (the colour ignores the palette and follows the heat scale), not neon (filled, no tubes).

## Shapes and line
No outline: each part is a soft blob of heat, brightest in its middle.

## Colour
Every area uses the same heat scale (violet, magenta, red, orange, yellow, white). The belly runs hottest, the body warm, dark parts and limbs cooler.

## Eyes and face
Dark cool spots on the hot face, or white-hot where the eyes were light.

## Motion
Smooth.

## Pitfalls
- The palette is ignored by design: two mascots in this style differ only in shape.
- The scale bar and crosshair sit in the corners and centre, never over the eyes.

## Checklist
- `pnpm check --style thermal` is green for every mascot.
- The look matches the line above at a glance, next to its neighbours in the gallery.
- No two styles share more than 3 of the 7 axes (`pnpm test`).
