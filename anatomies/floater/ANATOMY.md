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

## Form

The floater uses the form layer (`kit/form.ts`). A style without a form draws the authored ghost
exactly; a style with one redraws it from these rules, keeping every channel and action:

- **Head / aspect / chibi** scale the width and the dome; **body** scales the skirt. The whole
  ghost is fitted back inside the authored bounds (half width 36, top 48, hem 46) so it still
  spins, swells and lifts in frame.
- **Corners**: towards 0 the dome becomes a half circle and the hem turns into zigzag teeth
  (Bauhaus, pixel); towards 1 the dome fills out, the sides bulge and the scallops round off
  (clay, rubber-hose).
- **Face**: eye, mouth and brow models from `kit/faces`, sized by `face.*`; cheeks move under
  big, low eyes. Marks: sweat at the temple, blush lines on the cheeks, speed lines under the
  hem (they trail the float, not the spin).
- **Arms**: `taper` thins the flipper; `hands` (knob, glove, mitten) end a shorter arm, with arm
  and hand reaching at most 27 px from the shoulder; `limbs: noodle` draws a sagging curve.
- **Grid** snaps the main lengths for pixel art.
