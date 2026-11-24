# floater

A body with no legs that floats: a round top, a wavy hem that ripples on every frame, small
arms, a mouth that opens or smiles. It can spin, swell and fade. Example: `mascots/ghost`.
viewBox `0 -6 160 166`; the body is centred at (80, 82), its shadow on the ground at y=148.

## Palette roles

Required: `body`. Optional: `body-dark` (arms), `eye` (eyes, mouth), `cheek`, `glow`, `accent`,
`ink`, `shine`, `prop`. Contrast rule: `eye` on `body` ≥ 3:1.

## Channels

| Channel | Rest | Meaning |
|---|---|---|
| `body.x`, `body.y` | 0 | Float offset (idle bobs ±5 px); the shadow tightens as it rises |
| `body.rot` | 0 | Spin around the middle (use `op: set` up to 360 for a loop) |
| `body.sx`, `body.sy` | 1 | Swell and squash |
| `armL`, `armR` | 0 | Arm angle; **negative raises** |
| `hem` | 1 | Ripple amplitude multiplier (0 = still, 2 = wild) |
| `mouth.open` | 0 | 0 small "o" → 1 big "O" |
| `mouth.smile` | 0 | 0..1 smile (ignored while the mouth is open) |
| `fade` | 1 | Opacity of the whole ghost |
| face | — | `look.x/y/w`, `eyes.open/happy/scale`, `face.blush` |

Springs: both arms, `mouth.open`.

## Built-in actions

`wave`, `hop` (a bob), `look-around`, `stretch`, `notice`, `surprise`.
