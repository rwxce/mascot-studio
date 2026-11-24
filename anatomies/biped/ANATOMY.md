# biped

A body on two legs, a head on a neck, arms with a shoulder and an elbow, and an antenna that
lags the head on a loose spring. Example: `mascots/robot`. viewBox `0 -30 160 190`, ground at y=148.

## Palette roles

Required: `body`. Optional (derived from `body` when missing): `body-dark` (legs, upper arms,
ears, neck), `visor`, `eye` (eyes and the chest core), `accent` (antenna bulb), `cheek`, `glow`,
`ink`, `shine`, `prop`. Contrast rule: `eye` on `visor` ≥ 3:1.

## Channels

| Channel | Rest | Meaning |
|---|---|---|
| `body.x`, `body.y`, `body.rot` | 0 | Whole body offset and lean (y < 0 is up) |
| `body.sx`, `body.sy` | 1 | Torso squash and stretch from the hips |
| `head.rot`, `head.y` | 0 | Head tilt (deg) and bob (px) |
| `antenna` | — | Derived: trails the head and body; don't set it |
| `armR.sh`, `armL.sh` | 0 | Shoulder angle; **negative raises** on both sides |
| `armR.el`, `armL.el` | 0 | Elbow angle; negative bends the forearm up |
| `legL.lift`, `legR.lift` | 0 | Lift a foot (px) — marching, tucking in a jump |
| `core` | 1 | Chest light brightness 0..1 |
| face | — | `look.x/y/w`, `eyes.open/happy/scale`, `face.blush` |

Springs: `antenna` (loose), `head.rot`, both shoulders and elbows.

Tip: to wave without the hand hiding behind the head, keep the shoulder near -80 and bend the
elbow (~-70); a straight arm at -125 ends up behind the head.

## Built-in actions

`wave`, `hop`, `look-around`, `stretch`, `notice` (hover), `surprise` (click).
