# quadruped

A sitting animal: body, front legs with paws, a head with ears, and a tail that swings from its
base while its tip bends a beat later (two springs). Example: `mascots/fox`.
viewBox `-10 -32 180 192`, ground at y=148.

## Palette roles

Required: `body`. Optional: `belly` (chest, face mask, tail tip, legs), `eye` (eyes, nose, inner
ears, paws), `body-dark`, `cheek`, `glow`, `accent`, `ink`, `shine`, `prop`.
Contrast rule: `eye` on `body` ≥ 3:1.

## Channels

| Channel | Rest | Meaning |
|---|---|---|
| `body.x`, `body.y`, `body.rot` | 0 | Whole body offset and lean |
| `body.sx`, `body.sy` | 1 | Squash and stretch from the ground |
| `head.rot`, `head.y` | 0 | Head tilt and drop |
| `earL`, `earR` | 0 | Ear angle; negative perks it up/out, positive folds it back |
| `tail.rot` | 0 | Tail swing from its base; negative lifts it towards the back |
| `tail.bend` | — | Derived: the tip follows `tail.rot` a beat later; don't set it |
| `pawR`, `pawL` | 0 | Front leg angle; **negative raises** (a wave) |
| face | — | `look.x/y/w`, `eyes.open/happy/scale`, `face.blush` |

Springs: `tail.rot`, `tail.bend` (slower, looser), both ears (snappy), `head.rot`, both paws.
Ears twitch on their own at seeded moments.

## Built-in actions

`wave`, `hop`, `look-around`, `stretch` (a play bow), `notice`, `surprise`.
