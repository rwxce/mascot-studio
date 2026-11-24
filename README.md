# mascot-studio

Original SVG mascots that feel alive: real rigs, clean lines, 60 fps motion, zero dependencies.

> Work in progress. The first mascots (Cartas Secretas and three anatomies) are being built.

## How it works

1. **Master SVG** — one drawing with named parts (body, eyes, lids, mouth, limbs).
2. **Rig** — every part moves from its real pivot. Each layer is drawn twice, outlines first and fills on top, so joints have no seams (`kit/rig.ts`).
3. **One clock** — the motion engine ported from [rossark-motion-skill](https://github.com/rossark0/rossark-motion-skill) (`track`, `flow`, `seg`, `wave`) plus closed-form springs for follow-through (`kit/motion.ts`, `kit/spring.ts`).
4. **Shape morphs** — poses drawn with the same commands blend point by point (`kit/morph.ts`).
5. **Outputs** — a live component (no framework re-renders, paused off screen, reduced motion aware) and MP4/GIF exports.

## Develop

```bash
pnpm install
pnpm dev          # playground
pnpm test         # kit tests
pnpm typecheck
```

## Branches and releases

- `main` (default) holds one `release: vX.Y.Z` commit per release, made by the **Release** workflow.
- `dev` holds every commit; pull requests always target `dev`. Details in [BRANCHING.md](BRANCHING.md).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md), the [Code of Conduct](CODE_OF_CONDUCT.md) and the [security policy](SECURITY.md).

## License

MIT. The motion engine is derived from rossark-motion-skill (MIT): see `NOTICE` and [THIRD_PARTY.md](THIRD_PARTY.md).
