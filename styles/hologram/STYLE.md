<!-- Generated from style.json by scripts/style-docs.mjs. Edit style.json, then run it. -->
# Hologram

**Family:** Sensors and circuits · **Look:** A sci-fi projection: cyan translucent light with scanline fill, HUD brackets, a projector base and the odd glitch.

| line | fill | texture | palette | eyes | stage | rhythm |
|---|---|---|---|---|---|---|
| hud-cyan | scan-fill | interlace | cyan | glow | hud | glitch |

## Essence, and what it is not
The character as a projected hologram: made of cyan light you can see through, drawn in horizontal scan bands, hovering above a projector inside a targeting HUD, glitching now and then.

Not neon (a scan-line fill you can see through, one cyan, a HUD and a projector), not glass (no colour blobs, no tint of the character's own colour), not x-ray (one hue, light not density).

## Shapes and line
A soft wide cyan glow under a crisp thin edge on every part.

## Colour
Only cyan: a faint translucent fill crossed by brighter scan lines.

## Eyes and face
Near-white cyan, the brightest thing in the frame.

## Motion
Smooth, with a two-frame horizontal glitch every few seconds.

## Pitfalls
- The glitch is a short shift, never longer than two frames, so it reads as a fault, not a jump.
- Translucent overlapping parts add up: the face sits on top so it stays readable.

## Checklist
- `pnpm check --style hologram` is green for every mascot.
- The look matches the line above at a glance, next to its neighbours in the gallery.
- No two styles share more than 3 of the 7 axes (`pnpm test`).
