<!-- Generated from style.json by scripts/style-docs.mjs. Edit style.json, then run it. -->
# Bauhaus

**Family:** Graphic · **Look:** Circles, squares and three primaries on cream, moving like a machine.

| line | fill | texture | palette | eyes | stage | rhythm |
|---|---|---|---|---|---|---|
| none | flat | none | primary | circle | composition | mechanical |

## Essence, and what it is not
A character built the way a 1920s design school poster is: from circles, squares and bars, in red, yellow, blue and black on cream.

Not flat (primaries only, sharp corners, a geometric composition behind, mechanical timing), not screenprint (no grain, no posterized character colour).

## Shapes and line
Sharp corners everywhere, round knobs for hands, block feet. No outline: the shapes meet edge to edge.

## Colour
The body takes the nearest primary, the details black, the accent the next primary. Eyes are black, or yellow on a black visor.

## Eyes and face
A perfect dot that becomes a bar on a blink and a half disc when happy; the mouth is a half disc or a circle.

## Motion
Mechanical: 10 fps steps that hold, then jump ahead together, like a machine indexing.

## Form
How this style constructs the character (`kit/form.ts`); every other field keeps the anatomy as authored.

| field | value |
|---|---|
| proportions.limbThickness | 1.25 |
| corners | 0 |
| eyes | dot |
| mouth | geo |
| hands | knob |
| feet | block |
| face.scale | 1.05 |
| face.spacing | 1.1 |
| motion.snap | 0.6 |

## Pitfalls
- Characters whose colour sits between two primaries can flip to an unexpected one: set a per-style palette in the mascot.

## Checklist
- `pnpm check --style bauhaus` is green for every mascot.
- The look matches the line above at a glance, next to its neighbours in the gallery.
- No two styles share more than 3 of the 7 axes (`pnpm test`).
