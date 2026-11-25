<!-- Generated from style.json by scripts/style-docs.mjs. Edit style.json, then run it. -->
# Manga

**Family:** Print · **Look:** Black ink, white paper and screentone dots, with focus lines behind.

| line | fill | texture | palette | eyes | stage | rhythm |
|---|---|---|---|---|---|---|
| ink | screentone | tone | mono | manga | focus-lines | smooth |

## Essence, and what it is not
A panel from a printed manga: black ink on white paper, grey only as screentone dots, focus lines radiating behind the character.

Not comic (no colour, screentone instead of Ben-Day colour, focus lines not a sunburst), not one-bit (round tone dots, anime proportions), not ink (tone and focus lines).

## Shapes and line
Anime proportions, an even black line. Limbs thin towards the ends.

## Colour
Only black and white. Each area becomes a dot screen whose dot size follows how dark its colour was; very light areas stay paper.

## Eyes and face
The anime eye in ink: a solid black iris with two white highlights and a heavy lash line. Speed lines under the body when it jumps, a sweat drop on surprise.

## Motion
Smooth.

## Form
How this style constructs the character (`kit/form.ts`); every other field keeps the anatomy as authored.

| field | value |
|---|---|
| proportions.head | 1.06 |
| proportions.chibi | 0.2 |
| proportions.limbThickness | 0.85 |
| corners | 0.56 |
| taper | 0.4 |
| eyes | manga |
| mouth | small |
| brows | anime |
| face.scale | 1.14 |
| face.y | 0.28 |
| face.spacing | 1.05 |
| marks | sweat, speed-lines, blush-lines |

## Pitfalls
- Tone dots alias at small sizes: check the gallery card.
- Light palettes can turn every area white: the outline carries the drawing then.

## Checklist
- `pnpm check --style manga` is green for every mascot.
- The look matches the line above at a glance, next to its neighbours in the gallery.
- No two styles share more than 3 of the 7 axes (`pnpm test`).
