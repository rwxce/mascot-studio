<!-- Generated from style.json by scripts/style-docs.mjs. Edit style.json, then run it. -->
# Pictogram

**Family:** Graphic · **Look:** A public sign: one white silhouette of rounded geometric parts, knocked out of a green plate.

| line | fill | texture | palette | eyes | stage | rhythm |
|---|---|---|---|---|---|---|
| none | one-colour | none | signage | knockout | sign-plate | smooth |

## Essence, and what it is not
The figure on a wayfinding sign: a single flat colour, no line, built from fat round-ended bars and circles so it reads from across a station.

Not bauhaus (one colour only, rounded, a sign plate), not flat (no second colour, no shading, signage green), not line-art (filled, no line).

## Shapes and line
No outline. Round corners, thick limbs of even width, round knob hands and block feet: every part reads as a simple geometric piece.

## Colour
Every part is the same white; eyes, mouth and details are knocked out in the plate's green.

## Eyes and face
Round dots punched out of the silhouette and a geometric mouth.

## Motion
Smooth.

## Form
How this style constructs the character (`kit/form.ts`); every other field keeps the anatomy as authored.

| field | value |
|---|---|
| proportions.head | 1.05 |
| proportions.limbThickness | 1.35 |
| corners | 0.85 |
| taper | 0 |
| hands | knob |
| feet | block |
| eyes | dot |
| mouth | geo |

## Pitfalls
- Parts that overlap merge into one shape: that is the point, but the face must stay inside the head.
- Props in white on white parts disappear: they sit over the green plate.

## Checklist
- `pnpm check --style pictogram` is green for every mascot.
- The look matches the line above at a glance, next to its neighbours in the gallery.
- No two styles share more than 3 of the 7 axes (`pnpm test`).
