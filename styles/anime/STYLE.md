<!-- Generated from style.json by scripts/style-docs.mjs. Edit style.json, then run it. -->
# Anime

**Family:** Animation · **Look:** Modern TV anime: flat cel colour, one hard shadow, a thin coloured line, big eyes.

| line | fill | texture | palette | eyes | stage | rhythm |
|---|---|---|---|---|---|---|
| colored-thin | cel | none | character | anime | sky | snap |

## Essence, and what it is not
A character from a current TV anime: a bigger head on a smaller body, tall eyes that hold most of the face, colour laid down in two flat tones.

Not flat (a hard shadow tone and a line), not manga (colour, no screentone), not cel-anime-80s (rounder, shorter, glossy round eyes, smooth fills).

## Shapes and line
Super-deformed proportions: the head grows, the body and limbs shrink and thin towards the ends. A thin line tinted from the body colour, never pure black.

## Colour
Cel paint: every area is its colour plus one hard-edged shadow tone across the lower right, slightly cooler than the base.

## Eyes and face
Tall eyes with a white, a layered iris (darker on top, lighter at the bottom, a pupil), two highlights and a heavy upper lash line that flicks out at the corner. Short thin brows, a tiny mouth. Sweat drop on surprise, hatched blush lines when happy.

## Motion
Limited animation: each pose holds, then snaps quickly to the next.

## Form
How this style constructs the character (`kit/form.ts`); every other field keeps the anatomy as authored.

| field | value |
|---|---|
| proportions.head | 1.08 |
| proportions.chibi | 0.3 |
| proportions.limbThickness | 0.8 |
| proportions.limbLength | 1.05 |
| corners | 0.62 |
| taper | 0.35 |
| eyes | anime |
| mouth | small |
| brows | anime |
| face.scale | 1.18 |
| face.y | 0.32 |
| face.spacing | 1.06 |
| face.mouth | 0.9 |
| marks | sweat, blush-lines |
| motion.snap | 0.45 |

## Pitfalls
- The hold-then-snap timing makes fast actions look abrupt; that is the look, keep actions readable at the held poses.
- Big eyes crowd small faces: keep the face scale so the eyes stay inside the head.

## Checklist
- `pnpm check --style anime` is green for every mascot.
- The look matches the line above at a glance, next to its neighbours in the gallery.
- No two styles share more than 3 of the 7 axes (`pnpm test`).
