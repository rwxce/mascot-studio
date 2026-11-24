<!-- Generated from style.json by scripts/style-docs.mjs. Edit style.json, then run it. -->
# Circuit Board

**Family:** Sensors and circuits · **Look:** A chip on a green PCB: black epoxy body edged in tin, copper traces and pads all round, LED eyes.

| line | fill | texture | palette | eyes | stage | rhythm |
|---|---|---|---|---|---|---|
| tin | epoxy | solder-mask | pcb | led | traces | smooth |

## Essence, and what it is not
The character as a component soldered to a printed circuit board: its body a black chip package, its limbs copper traces, its hands tinned pads, its eyes two lit LEDs.

Not blueprint (a populated board in copper and green, not a white plan), not pixel (no grid snapping), not hologram (solid parts, no light).

## Shapes and line
A thin tin edge on every part; the body carries a faint laser-etched dot grid like a chip's surface.

## Colour
Body black epoxy, bellies a lighter die grey, limbs copper, accents tinned silver, props a red LED, all on solder-mask green.

## Eyes and face
Amber LEDs, lit.

## Motion
Smooth.

## Pitfalls
- Copper limbs on copper traces merge: the traces stay out of the character's centre.
- The black body needs its tin edge on dark pages.

## Checklist
- `pnpm check --style circuit-board` is green for every mascot.
- The look matches the line above at a glance, next to its neighbours in the gallery.
- No two styles share more than 3 of the 7 axes (`pnpm test`).
