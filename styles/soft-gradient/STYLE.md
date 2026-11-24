<!-- Generated from style.json by scripts/style-docs.mjs. Edit style.json, then run it. -->
# Soft Gradient

**Family:** Clean vector · **Look:** No outline: every piece has a vertical gradient, a glow of the character's colour behind it, eyes with a shine.

| line | fill | texture | palette | eyes | stage | rhythm |
|---|---|---|---|---|---|---|
| none | gradient | none | character | oval-shine | glow | smooth |

## Essence, and what it is not
Friendly product-mascot vector lit from above: no outline, every piece a vertical gradient, a glow of the character's colour behind it on a dark stage.

Not glassy (no reflections), not 3D (no shading beyond the gradient).

## Shapes and line
No outline: edges come from colour contrast, so neighbouring parts need different roles. Details that would vanish (an envelope's lid edges) are drawn as thin lines.

## Colour
Volume roles get a gradient from 34 % lighter (12 % for belly) down to the role colour. Stage #15121F with a radial glow; ink-coloured props turn light.

## Eyes and face
Dark ovals with a white shine; cheeks always faintly visible (0.45).

## Motion
Smooth; the ground shadow narrows as the character rises.

## Pitfalls
- Gradients on thin strokes break (zero-width box): stroke limbs use flat colours.
- A paper-white body looks unfinished here: tune it with palettes['@no-outline'].

## Checklist
- `pnpm check --style soft-gradient` is green for every mascot.
- The look matches the line above at a glance, next to its neighbours in the gallery.
- No two styles share more than 3 of the 7 axes (`pnpm test`).
