# object-limbs

An object with puzzle-tab arms, a face on a lid that opens, and an optional secret inside that
rises out of its mouth.
Any `mascot.json` with `"anatomy": "object-limbs"` uses it.

## Limbs and the body

No arms. The tabs are part of the pocket's outline (one closed path with the side edges), so there is no joint and nothing of them can show behind the body; they never turn or slide. Raising an arm channel (`armX.rot` below 0, `lift = -armX.rot / 95`) flattens that tab into the side edge (from `lift` 0.3, at most a whole tab per 120 ms) and curls that side's top corner up into a thin paper hook (`curlR`, `curlL`) that grows from where the tab was, at most a whole hook per 140 ms so a fast raise does not pop. Past `lift` 1 the extra rocks the hook outwards from its root (where the tab was), up to 8° (wave's swing). Below `lift` 0.3 (`heart`) and above 0 (`shy`, `sleepy`) nothing changes. The hook is the lifted corner of paper: opaque, drawn in front of the pocket and the lid, which are masked by its silhouette (`curlFR`, `curlFL`) so nothing of the letter shows under it, even in a translucent style. Its ball curls over the corner, its tip hangs down in front of the lid and folds back to the side edge; with an outline it is a single line as thick as the visible edge, as in the original drawing.

## Body parameters (`body`)

| Parameter | Type | Default | What it does |
|---|---|---|---|
| `width`, `height` | number | 148, 96 | Size of the object |
| `notch` | number | 17 | Radius of the puzzle notch at the bottom; 0 = none |
| `crossLines` | boolean | true | The envelope's lower cross lines |
| `inner` | boolean | true | A secret that rises out of the mouth when the lid opens |
| `innerScale` | number | 1 | Size of the secret; above 1.2 it also gets cheeks and eye shines |
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
| `armR.long`, `armL.long` | 0 | Kept so older actions stay valid; no effect (a tab never stretches) |
| `armR.thumb`, `armL.thumb` | 0 | 0..1: a thumb grows from the tab |
| `look.x`, `look.y`, `look.w` | 0 | Where to look (-1..1) and how much that overrides the pointer (0..1) |
| `eyes.open` | 1 | 0 = shut (blinks write here) |
| `eyes.happy` | 0 | 0..1: happy arcs |
| `eyes.scale` | 1 | Wide eyes |
| `lid` | 1 | 1 closed → -1 open |
| `inner`, `inner.look` | 0 | The secret rising (0 hidden under the mouth, 1 fully out above the top edge) and looking around (-1..1) |
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
- **Arms.** Always the authored puzzle tabs, in every form: `hands`, `limbs`, `limbLength`,
  `limbThickness` and `taper` are ignored. The tabs only shrink with a smaller envelope; a raised
  `armX.rot` flattens them and curls the corner instead (see above), and `armX.thumb` grows a
  thumb from the knob.
- **Secret.** It is clipped at the V of the mouth, so it never shows through the bottom notch or
  under the pocket; its travel follows the envelope, so it comes out whole in every form.
- **Face.** The form's eye, brow and mouth models sit on the lid, pushed down when big eyes or
  brows need room. There are no mouth channels: the mouth smiles with `eyes.happy` and opens
  when `eyes.scale` goes up. Marks: sweat by the top right corner, blush lines on the cheeks,
  speed lines under the body.
