<div align="center">

# mascot-studio

**Original SVG mascots that feel alive** — real rigs, clean lines, 60 fps motion, zero dependencies.

<img src="docs/media/nodi.webp" width="420" alt="Nodi, a vector anchor point with Bézier handles for arms, waves, sketches a curve in the air, morphs into a star and a heart, gets selected and snaps to a grid">

<sub><b>Nodi</b>, the mascot-studio mascot · anchor · soft gradient · transparent, on any background</sub>

<sub>Every frame is drawn and animated in code. Same mascot, any style: the anatomy says what is drawn, the style how.</sub>

</div>

**[Browse the gallery](https://rwxce.github.io/mascot-studio/)**: every mascot in every style, live.

## What it does

A mascot here is not a video: it is a live SVG that breathes, blinks, looks at your pointer, says hi when you hover it and jumps when you click it. Between those moments it picks what to do next on its own — never the same thing twice in a row.

<img src="docs/media/nodi-actions.png" alt="Twelve stills of Nodi: wave, draw, morph, select, stretch, snap, idea, heart, spin, sleepy, hop and surprise" width="100%">

| | |
|---|---|
| **Idle life that never stops** | breathing, weight shifts, blinks (fast to close, slower to open), glances |
| **Reactions** | hover → it notices you and waves; click → surprise jump |
| **Actions** | wave, draw, morph, select, stretch, snap, idea, heart, spin, sleepy, hop, surprise |
| **Light** | each SVG is a few KB; the whole kit has no runtime dependencies |
| **Polite** | pauses off screen and in hidden tabs; reduced motion holds a still pose |

## One mascot, 50 styles

<img src="docs/media/styles-nodi.png" alt="Nodi drawn in each of the 50 styles" width="100%">

A style decides how a mascot is drawn — line, fill, texture, palette, eyes, stage and rhythm.
Anatomies never pick colours: they ask the style for a role (`body`, `belly`, `eye`…), so every
mascot works in every style. **No two styles share more than 3 of those 7 axes** (a test checks
it), and a visual check renders every style and fails if two look alike.

Some styles also carry a **form** (`kit/form.ts`, the `"form"` block of `style.json`): how the
character is constructed, not just painted — proportions, corners, limb taper and noodle arms,
hands and feet, and an eye, mouth and brow model from `kit/faces/` (anime, almond-80s, manga,
comic, pie, bead, pixel, dot). **Every anatomy reads the form**, so Nodi, the robot, the fox and the
ghost are each redrawn in the shape language of the style; the channels never change, so every
action plays in every style. A style without a form draws the anatomy exactly as authored.

<img src="docs/media/forms.png" alt="Nodi, the robot, the fox and the ghost redrawn by each style that carries a form" width="100%">

**Try them all:** `pnpm dev` and open `/styles.html` — pick a mascot, watch it in every style,
open one to play its actions. `pnpm build:gallery` makes the same page as one HTML file.

<img src="docs/media/matrix.png" alt="Each mascot in six of the styles" width="100%">

| Family | Style | Look |
|---|---|---|
| Clean vector | [Soft Gradient](styles/soft-gradient/STYLE.md) | No outline: every piece has a vertical gradient, a glow of the character's colour behind it, eyes with a shine. |
|  | [Flat](styles/flat/STYLE.md) | Solid colours, no outline, no gradient: shapes and nothing else. |
|  | [Sticker](styles/sticker/STYLE.md) | A thick white border and a hard shadow, like a die-cut sticker on a dotted page. |
|  | [Glass](styles/glass/STYLE.md) | Translucent tinted glass with a bright edge, over colourful blurred blobs. |
|  | [Low Poly](styles/low-poly/STYLE.md) | Faceted shading in hard diagonal bands, like a low-polygon model. |
|  | [Line Art](styles/line-art/STYLE.md) | A single thin line around every piece on white paper; colour only in the eyes. |
| Drawn by hand | [Ink](styles/ink/STYLE.md) | A heavy black line around every shape, flat paper colours, one accent. |
|  | [Pencil](styles/pencil/STYLE.md) | Graphite on paper: hatched shading, a soft boiling line, on twos. |
|  | [Crayon](styles/crayon/STYLE.md) | Waxy crayon that spills past a wobbly dark line, on twos. |
|  | [Watercolor](styles/watercolor/STYLE.md) | Pale washes that bleed past their edges, a faint darker rim, paper grain. |
|  | [Chalkboard](styles/chalkboard/STYLE.md) | Chalk on a green board: dusty hatching, a light boiling line, a wooden frame. |
|  | [Ink Wash](styles/ink-wash/STYLE.md) | Chinese ink wash: grey ink pooling at the edges, a dry-brush contour, empty paper and a red seal. |
|  | [Marker](styles/marker/STYLE.md) | Felt-tip marker on a whiteboard: a thick contour, streaky fills in four marker colours, ghosts of erased drawings. |
| Print | [Riso](styles/riso/STYLE.md) | Two-ink risograph: halftone fills in pink and blue, slightly misregistered, grainy paper. |
|  | [Comic](styles/comic/STYLE.md) | Bold ink line, Ben-Day dots and a sunburst behind, like a comic panel. |
|  | [Woodblock](styles/woodblock/STYLE.md) | A woodblock print: muted flat colours with wood grain, a fine dark key line. |
|  | [Screenprint](styles/screenprint/STYLE.md) | Flat posterised colours with an accent plate printed off register. |
|  | [Engraving](styles/engraving/STYLE.md) | A copperplate engraving: tone built from fine parallel and crossed lines, dark sepia on cream, in an oval cartouche. |
|  | [Manga](styles/manga/STYLE.md) | Black ink, white paper and screentone dots, with focus lines behind. |
|  | [Scratchboard](styles/scratchboard/STYLE.md) | White lines scratched out of a black board: the light is what was taken away. |
|  | [Ukiyo-e](styles/ukiyo-e/STYLE.md) | A Japanese woodblock print: flat pigments fading in bokashi gradients, a fine key line, washi paper, a curling wave. |
| Retro screen | [Pixel](styles/pixel/STYLE.md) | Big pixels, a limited palette and motion that steps at 8 fps. |
|  | [One-bit](styles/one-bit/STYLE.md) | Black and white only, with ordered dither for grey, like an early Mac. |
|  | [Rubber Hose](styles/rubber-hose/STYLE.md) | A 1930s cartoon: sepia, a fat black line, film grain, on twos. |
|  | [Synthwave](styles/synthwave/STYLE.md) | Pink-to-purple gradients, a cyan neon edge, scanlines, a striped sun and a grid. |
|  | [CRT ASCII](styles/crt-ascii/STYLE.md) | A green phosphor terminal: the character drawn in text-mode glyphs, scanlines, a blinking prompt. |
|  | [Silent Film](styles/silent-film/STYLE.md) | A 1920s reel: silver greys with a sepia tint, grain and scratches, a dark vignette, flicker, 16 fps. |
| Materials | [Clay](styles/clay/STYLE.md) | Plasticine: round soft highlights, a contact shadow, stop-motion at 8 fps. |
|  | [Papercut](styles/papercut/STYLE.md) | Layers of cut paper casting shadows on each other, stop-motion. |
|  | [Stained Glass](styles/stained-glass/STYLE.md) | Jewel-coloured glass in heavy lead came, glowing from behind. |
|  | [Knit](styles/knit/STYLE.md) | A knitted plush: V-stitch texture in every colour, a soft darker seam. |
|  | [Brick Toy](styles/brick-toy/STYLE.md) | Built from glossy plastic bricks: studs on every surface, toy primaries, a studded baseplate, stop-motion. |
|  | [Shadow Puppet](styles/shadow-puppet/STYLE.md) | A dark leather puppet with punched-out holes, pressed against a lamp-lit screen. |
| Light and plan | [Neon](styles/neon/STYLE.md) | Glass tubes of light on a dark wall: no fill, a bright core and a glow, a flicker. |
|  | [Blueprint](styles/blueprint/STYLE.md) | White technical lines on blueprint blue over a grid. |
| Animation | [Anime](styles/anime/STYLE.md) | Modern TV anime: flat cel colour, one hard shadow, a thin coloured line, big eyes. |
|  | [Cel Anime 80s](styles/cel-anime-80s/STYLE.md) | Hand-painted 1980s cels: a coloured line, a hard shadow and a highlight band, on 12 fps. |
|  | [Mid-century](styles/mid-century/STYLE.md) | A 1950s modern cartoon: a loose ink line with one flat colour block printed out of register, on textured paper. |
| Graphic | [Art Deco](styles/art-deco/STYLE.md) | Gold on black: a symmetric sunburst fan, stepped arcs, pinstripes and metallic edges. |
|  | [Bauhaus](styles/bauhaus/STYLE.md) | Circles, squares and three primaries on cream, moving like a machine. |
|  | [Memphis](styles/memphis/STYLE.md) | 1980s Memphis design: pastel blocks, black squiggles and confetti, a dotted belly and a striped accent. |
|  | [Pictogram](styles/pictogram/STYLE.md) | A public sign: one white silhouette of rounded geometric parts, knocked out of a green plate. |
|  | [Pop Art](styles/pop-art/STYLE.md) | A 1960s pop canvas: giant Ben-Day dots, flat primaries, a thick black line and a white speech burst on cyan. |
| Sensors and circuits | [Circuit Board](styles/circuit-board/STYLE.md) | A chip on a green PCB: black epoxy body edged in tin, copper traces and pads all round, LED eyes. |
|  | [Hologram](styles/hologram/STYLE.md) | A sci-fi projection: cyan translucent light with scanline fill, HUD brackets, a projector base and the odd glitch. |
|  | [Thermal](styles/thermal/STYLE.md) | A thermal camera view: false-colour heat from cold violet through magenta and orange to white-hot, a scale bar and crosshair. |
|  | [X-ray](styles/x-ray/STYLE.md) | A security scanner image: translucent orange and blue layers on black, every inner part showing through, on a belt. |
| Fine art | [Gilded](styles/gilded/STYLE.md) | An illuminated manuscript: lapis, vermilion and malachite on vellum, a lozenge diaper, gold leaf all round. |
|  | [Impasto](styles/impasto/STYLE.md) | Oil paint laid on thick: ridged brush strokes in warm colour on a canvas weave. |
|  | [Firefly Pointillism](styles/pointillism/STYLE.md) | The character made of glowing dots on a night field, among twinkling fireflies. |

A mascot can tune its palette per style (`palettes` in `mascot.json`, by style id or
`"@no-outline"` for every style without an outline). The style catalogue takes inspiration from
[Lemo-Opuscar](https://github.com/lemomo-ai/lemo-opuscar)'s film styles (see THIRD_PARTY.md).

## How it works

1. **An anatomy** — the skeleton: parts, real pivots, channels, built-in life and actions (`anatomies/`).
2. **A seamless rig** — each layer is drawn twice, outlines first and fills on top, so where parts meet there is no seam (`kit/rig.ts`).
3. **One clock** and the motion engine ported from [rossark-motion-skill](https://github.com/rossark0/rossark-motion-skill): smooth paths through key poses, never stopping dead at each one (`kit/motion.ts`).
4. **Springs for follow-through** — handles, tails, antennas, props and the gaze trail the body a beat later (`kit/spring.ts`).
5. **Shape morphs** — a rounded square becomes a circle, a star or a heart, point by point (`kit/morph.ts`).
6. **A director** that blends actions over the idle life and reacts to you (`kit/director.ts`).

## Make your own

A mascot is a `mascot.json`: an anatomy (the skeleton, with idle life and reactions built in),
a palette, proportions, props and its own actions as keyframes on named channels. No engine code.

```jsonc
{
  "name": "my-mascot", "title": "My Mascot", "anatomy": "anchor",
  "palette": { "body": "#FFB547", "body-dark": "#B9741A", "eye": "#2A1A08", "accent": "#5B63E8", "prop": "#E5383B" },
  "props": { "heart": [0, -80] },
  "actions": [
    { "name": "love", "duration": 2400, "weight": 2, "tracks": [
      { "ch": "prop.heart", "op": "set", "curve": "linear", "keys": [[0, 0], [2400, 1]] },
      { "ch": "eyes.happy", "keys": [[0, 1], [2400, 1]] }
    ] }
  ]
}
```

An agent can do this end to end with the [`create-mascot` skill](.claude/skills/create-mascot/SKILL.md).

Then `pnpm check my-mascot` runs every rule in [CRAFT.md](CRAFT.md): the spec against its
[anatomy](anatomies/anchor/ANATOMY.md), and every action frame by frame (in frame, no jumps,
a good rest pose, budget). Green means it ships.

## Try it

```bash
pnpm install
pnpm dev                                   # playground: every mascot, a button per action
pnpm check                                 # every rule, every mascot, every style, every frame
node tools/render.mjs nodi \
  --reel wave,draw,morph --transparent   # MP4 + transparent WebP and GIF
node tools/grid.mjs nodi wave:1300,morph:1900   # labelled stills
node tools/matrix.mjs                      # every mascot in every style
pnpm check:styles                          # no two styles may look alike
```

## Mascots and anatomies

| Mascot | Anatomy | Default style | Its own actions |
|---|---|---|---|
| [Nodi](mascots/nodi/mascot.json) | [anchor](anatomies/anchor/ANATOMY.md) | soft-gradient | idea, heart, sleepy (plus the anchor's draw, morph, select, snap, spin) |
| [Robot](mascots/robot/mascot.json) | [biped](anatomies/biped/ANATOMY.md) | soft-gradient | scan, dance, think, nap |
| [Fox](mascots/fox/mascot.json) | [quadruped](anatomies/quadruped/ANATOMY.md) | soft-gradient | wag, ear-flick, pounce, curl-up |
| [Ghost](mascots/ghost/mascot.json) | [floater](anatomies/floater/ANATOMY.md) | soft-gradient | loop, boo, vanish, giggle, sleepy |

<p align="center">
<img src="docs/media/robot.webp" width="200" alt="A robot scans with its visor, dances and thinks">
<img src="docs/media/fox.webp" width="200" alt="A fox wags its tail, pounces and flicks an ear">
<img src="docs/media/ghost.webp" width="200" alt="A ghost loops the loop, says boo, giggles and vanishes">
</p>

Every anatomy also brings `wave`, `hop`, `look-around`, `stretch` and the reactions `notice`
(hover) and `surprise` (click).

## Branches and releases

- `main` (default) holds one `release: vX.Y.Z` commit per release, made by the **Release** workflow.
- `dev` holds every commit; pull requests always target `dev`. Details in [BRANCHING.md](BRANCHING.md).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md), the [Code of Conduct](CODE_OF_CONDUCT.md) and the [security policy](SECURITY.md).

Found a vulnerability? Report it privately from the **Security** tab → **Report a vulnerability**
([private vulnerability reporting](https://github.com/rwxce/mascot-studio/security/advisories/new) is on), not in a public issue.

## License

MIT. The motion engine is derived from rossark-motion-skill (MIT): see `NOTICE` and [THIRD_PARTY.md](THIRD_PARTY.md).
