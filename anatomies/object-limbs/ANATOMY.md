# object-limbs

An object with puzzle-tab arms, a face on a lid that opens, and an optional secret inside.
Any `mascot.json` with `"anatomy": "object-limbs"` uses it.

## Body parameters (`body`)

| Parameter | Type | Default | What it does |
|---|---|---|---|
| `width`, `height` | number | 148, 96 | Size of the object |
| `notch` | number | 17 | Radius of the puzzle notch at the bottom; 0 = none |
| `crossLines` | boolean | true | The envelope's lower cross lines |
| `inner` | boolean | true | A small secret that can rise when the lid opens |
| `line` | number | 5.5 | Outline width |

## Palette roles (`palette`, all required)

`ink` (outline and eyes), `body`, `inside` (the dark inside), `accent` (the secret, sparkles),
`cheek`, `prop` (heart, exclamation), `glow` (the bulb's light).

## Channels

| Channel | Rest | Meaning |
|---|---|---|
| `body.x`, `body.y` | 0 | Offset of the whole body (y < 0 is up) |
| `body.sx`, `body.sy` | 1 | Squash and stretch from the bottom |
| `body.rot` | 0 | Lean, degrees |
| `armR.rot`, `armL.rot` | 0 | Arm angle; **negative raises** (both sides), positive lowers. Raising slides the arm to the top corner |
| `armR.long`, `armL.long` | 0 | 0..1: the tab stretches into an arm |
| `armR.thumb`, `armL.thumb` | 0 | 0..1: a thumb grows from the tab |
| `look.x`, `look.y`, `look.w` | 0 | Where to look (-1..1) and how much that overrides the pointer (0..1) |
| `eyes.open` | 1 | 0 = shut (blinks write here) |
| `eyes.happy` | 0 | 0..1: happy arcs |
| `eyes.scale` | 1 | Wide eyes |
| `lid` | 1 | 1 closed → -1 open |
| `inner`, `inner.look` | 0 | The secret rising (0..1) and looking around (-1..1) |
| `face.blush` | 0 | 0..1 |
| `prop.*` | — | See `kit/props.ts` |

Springs smooth `armR.rot`, `armL.rot` and `inner.look`.

## Built-in actions

`wave`, `hop`, `look-around`, `stretch`, and the reactions `notice` (hover) and `surprise`
(click). A mascot overrides one by declaring an action with the same name.

## Form

The anatomy uses a style's `form` (`kit/form.ts`); without one it draws exactly as authored.

- **Envelope.** It stays inside its authored box, so prop anchors never land on it: `aspect` > 1
  narrows it, < 1 lowers it. `head` (and `chibi`) shows as bigger features and shorter arms.
  `corners` above 0.5 round the outer corners; at or below 0.5 they stay sharp. `grid` snaps
  its size. `body` and `feet` are ignored (no torso, no legs).
- **Arms.** `hands: default` keeps the puzzle tab: its neck follows `limbLength`, its thickness
  `limbThickness`, and `taper` thins it towards the end. Any other hand turns the tab into a
  straight arm (or a hose with `limbs: noodle`) with that hand; `armX.long` stretches it and
  `armX.thumb` grows a thumb on the hand. The reach stays near the authored one, so every action
  stays in frame.
- **Face.** The form's eye, brow and mouth models sit on the lid, pushed down when big eyes or
  brows need room. There are no mouth channels: the mouth smiles with `eyes.happy` and opens
  when `eyes.scale` goes up. Marks: sweat by the top right corner, blush lines on the cheeks,
  speed lines under the body.
