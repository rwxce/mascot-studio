<!-- Generated from style.json by scripts/style-docs.mjs. Edit style.json, then run it. -->
# Cel Anime 80s

**Family:** Animation · **Look:** Hand-painted 1980s cels: a coloured line, a hard shadow and a highlight band, on 12 fps.

| line | fill | texture | palette | eyes | stage | rhythm |
|---|---|---|---|---|---|---|
| colored | cel-highlight | none | dusk | almond | sunset | twelve-fps |

## Essence, and what it is not
A frame from a late-1980s anime film painted on acetate: a taller, leaner character, sharp almond eyes, every colour cut into a lit band, a base and a shadow, in front of a dusk sky.

Not anime (taller, leaner, almond eyes, three tones with a highlight, 12 fps), not synthwave (painted cel, no neon).

## Shapes and line
A taller egg-shaped head, longer thin limbs that taper, a coloured line darker than the body.

## Colour
Three hard tones per area: a pale highlight crescent at the top left, the base colour and a plum-tinted shadow. Slightly warm, dusky palette.

## Eyes and face
Almond eyes with a heavy upper line that sweeps past the outer corner, a thin lower line, a small iris with one slanted highlight. Long thin brows.

## Motion
12 fps, with a little overshoot on the arms.

## Form
How this style constructs the character (`kit/form.ts`); every other field keeps the anatomy as authored.

| field | value |
|---|---|
| proportions.head | 0.96 |
| proportions.aspect | 1.14 |
| proportions.limbLength | 1.2 |
| proportions.limbThickness | 0.72 |
| corners | 0.5 |
| taper | 0.45 |
| eyes | almond-80s |
| mouth | small |
| brows | thin |
| face.scale | 1.22 |
| face.y | 0.1 |
| face.spacing | 1.1 |
| face.mouth | 1.05 |
| motion.snap | 0.2 |
| motion.overshoot | 0.2 |

## Pitfalls
- The 12 fps step plus a slight snap can feel slow on short actions.
- Long limbs reach the edge of the frame on big poses: keep limb length modest.

## Checklist
- `pnpm check --style cel-anime-80s` is green for every mascot.
- The look matches the line above at a glance, next to its neighbours in the gallery.
- No two styles share more than 3 of the 7 axes (`pnpm test`).
