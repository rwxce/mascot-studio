# anchor

A vector anchor point come to life. The body is one closed curve of 40 smooth points that
morphs between a rounded square (the anchor), a circle, a star and a heart. Its arms are the two
Bézier handles: a thin stick ending in a round knob, pivoting at the centre. A handle can sketch
a curve in the air, a selection box can appear around the body, and a dot grid can show when it
snaps. Example: `mascots/nodi`. viewBox `0 -6 160 166`; the body is centred at (80, 84), its
shadow on the ground at y=148, so a prop anchor of `[0, -64]` is the body's centre.

## Palette roles

Required: `body`. Optional: `body-dark` (handle sticks, grid dots), `accent` (knobs, the drawn
curve, the selection box), `eye` (eyes, mouth), `cheek`, `glow`, `ink`, `shine`, `prop`.
Contrast rule: `eye` on `body` ≥ 3:1.

## Channels

| Channel | Rest | Meaning |
|---|---|---|
| `body.x`, `body.y` | 0 | Float offset (idle bobs ±4 px); the shadow tightens as it rises |
| `body.rot` | 0 | Turn around the centre (use `op: set` up to 360 for a spin) |
| `body.sx`, `body.sy` | 1 | Swell and squash |
| `handleL`, `handleR` | 0 | Handle angle in degrees from a little below horizontal; **negative raises** |
| `handleL.len`, `handleR.len` | 0 | Extra handle length in px (rest is 50) |
| `smooth` | 0 | 0..1: a smooth anchor — the left handle seesaws against the right one |
| `shape.circle`, `shape.star`, `shape.heart` | 0 | 0..1 morph weights over the rounded square |
| `draw` | -1 | Progress 0..1 of the curve the right handle sketches; -1 hides it |
| `draw.w` | 0 | 0..1: how much the right handle follows the sketch (fade it in and out) |
| `select` | 0 | 0..1 opacity of the selection box; it scales with the body |
| `grid` | 0 | 0..1 opacity of the dot grid under the body |
| `mouth.open` | 0 | 0 small "o" → 1 big "O" |
| `mouth.smile` | 0 | 0..1 smile (ignored while the mouth is open) |
| face | — | `look.x/y/w`, `eyes.open/happy/scale`, `face.blush` |

Springs: both handle angles and lengths, `mouth.open`.

## Built-in actions

`wave`, `hop`, `look-around`, `stretch`, `notice`, `surprise`, and the anchor's own: `draw`,
`morph`, `select`, `snap`, `spin`.
