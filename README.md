<div align="center">

# mascot-studio

**Original SVG mascots that feel alive** — real rigs, clean lines, 60 fps motion, zero dependencies.

<img src="docs/media/secret-letter.gif" alt="The Secret Letter mascot, an envelope shaped like a puzzle piece, waves, has an idea, opens its flap to reveal a small pink envelope, sends a heart and hops" width="440">

<sub>Secret Letter — an envelope that is also a puzzle piece. Every frame is drawn and animated in code.</sub>

</div>

## What it does

A mascot here is not a video: it is a live SVG that breathes, blinks, looks at your pointer, says hi when you hover it and jumps when you click it. Between those moments it picks what to do next on its own — never the same thing twice in a row.

<img src="docs/media/secret-letter-actions.png" alt="Twelve stills of the Secret Letter mascot: wave, thumbs-up, idea, heart, reveal, look-around, stretch, sleepy, shy, hop, notice and surprise" width="100%">

| | |
|---|---|
| **Idle life that never stops** | breathing, weight shifts, blinks (fast to close, slower to open), glances |
| **Reactions** | hover → it notices you and waves; click → surprise jump |
| **Actions** | wave, thumbs-up, idea, heart, reveal, look-around, stretch, sleepy, shy, hop |
| **Light** | each SVG is a few KB; the whole kit has no runtime dependencies |
| **Polite** | pauses off screen and in hidden tabs; reduced motion holds a still pose |

## How it works

1. **One master drawing** with named parts (body, flap, tabs, eyes) and real pivots.
2. **A seamless rig** — each layer is drawn twice, outlines first and fills on top, so where parts meet there is no seam (`kit/rig.ts`).
3. **One clock** and the motion engine ported from [rossark-motion-skill](https://github.com/rossark0/rossark-motion-skill): smooth paths through key poses, never stopping dead at each one (`kit/motion.ts`).
4. **Springs for follow-through** — tabs, props and the gaze trail the body a beat later (`kit/spring.ts`).
5. **Shape morphs** — a puzzle tab stretches into an arm or grows a thumb, point by point (`kit/morph.ts`).
6. **A director** that blends actions over the idle life and reacts to you (`kit/director.ts`).

## Make your own

A mascot is a `mascot.json`: an anatomy (the skeleton, with idle life and reactions built in),
a palette, proportions, props and its own actions as keyframes on named channels. No engine code.

```jsonc
{
  "name": "my-mascot", "title": "My Mascot", "anatomy": "object-limbs",
  "palette": { "ink": "#141414", "body": "#FFFDF8", "inside": "#2A1F2B", "accent": "#EC4899", "cheek": "#F7A8B8", "prop": "#E5383B", "glow": "#FFE680" },
  "props": { "heart": [98, -86] },
  "actions": [
    { "name": "love", "duration": 2400, "weight": 2, "tracks": [
      { "ch": "prop.heart", "op": "set", "curve": "linear", "keys": [[0, 0], [2400, 1]] },
      { "ch": "eyes.happy", "keys": [[0, 1], [2400, 1]] }
    ] }
  ]
}
```

Then `pnpm check my-mascot` runs every rule in [CRAFT.md](CRAFT.md): the spec against its
[anatomy](anatomies/object-limbs/ANATOMY.md), and every action frame by frame (in frame, no jumps,
a good rest pose, budget). Green means it ships.

## Try it

```bash
pnpm install
pnpm dev                                   # playground: every mascot, a button per action
pnpm check                                 # every rule, every mascot, every frame
node tools/render.mjs secret-letter \
  --reel wave,idea,reveal --ms 12000       # deterministic MP4 + GIF export
node tools/grid.mjs secret-letter wave:1300,idea:1400   # labelled stills
```

## Mascots

| Mascot | Look | Status |
|---|---|---|
| [Secret Letter](mascots/secret-letter/) | heavy black line, white paper, one accent | ✅ |
| Robot (biped, elbows) | modern flat | next |
| Fox (quadruped, tail) | retro cartoon | next |
| Cloud (floater) | hand-drawn | next |

## Branches and releases

- `main` (default) holds one `release: vX.Y.Z` commit per release, made by the **Release** workflow.
- `dev` holds every commit; pull requests always target `dev`. Details in [BRANCHING.md](BRANCHING.md).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md), the [Code of Conduct](CODE_OF_CONDUCT.md) and the [security policy](SECURITY.md).

## License

MIT. The motion engine is derived from rossark-motion-skill (MIT): see `NOTICE` and [THIRD_PARTY.md](THIRD_PARTY.md).
