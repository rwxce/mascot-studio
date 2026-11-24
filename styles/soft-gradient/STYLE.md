# Soft Gradient

**Family:** Clean vector · **Axes:** line none · fill gradient · texture none · palette character · eyes oval-shine · stage glow · rhythm smooth

## Essence, and what it is not
Friendly product-mascot vector, lit from above: no outline at all, every piece a vertical
gradient (light at the top, saturated at the bottom), a soft glow of the character's colour
behind it on a dark stage. It is not glassy (no reflections), not 3D (no shading beyond the
gradient).

## Shapes and line
- No outline. Edges come from colour contrast, so neighbouring parts need different roles
  (`body` vs `body-dark` vs `belly`).
- Details that would vanish without an outline (an envelope's lid edges) are drawn as thin lines
  in the `line` role.

## Colour
- Volume roles (`body`, `body-dark`, `belly`, `visor`, `accent`, `inside`) get a gradient from
  34 % lighter (12 % for `belly`) down to the role colour.
- The stage is `#15121F` with a radial glow in the `glow` role.
- Ink-coloured props (zzz, ?, sparkles) turn light so they read on the dark stage.
- A light body (paper white) looks unfinished here: tune it with `palettes["soft-gradient"]`.

## Eyes and face
Dark oval eyes with a white shine at the top left; cheeks always faintly visible (0.45).

## Motion
Smooth, 60 fps. The ground shadow narrows and fades as the character leaves the floor.

## Pitfalls
- Gradients on thin strokes break (zero-width box): limbs drawn as strokes use flat colours.
- Gradient ids must be unique per instance (the painter prefixes them).

## Checklist
No outline · a gradient on every big piece · glow behind · eye shine · readable on dark.
