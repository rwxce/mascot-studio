# Contributing

Thanks for helping. mascot-studio is a small kit for bringing SVG mascots to life (`kit/`), a set of
anatomies and styles, and the mascots built with them. The most useful contributions show the
problem they fix: a seam at a joint, a pose that stops dead, a frame that drops.

## Proposing a change

- **Small fixes** (a bug in the kit, a broken pose, a typo): open a pull request to `dev`.
- **Big changes** (a new anatomy, a new style, a change to the rig or the clock): open an issue
  first with the problem and a reference (a sketch, a video, a frame), and agree on the approach
  before writing the code.
- Pull requests always target **`dev`**, never `main` (see [BRANCHING.md](BRANCHING.md)).
- Keep one topic per pull request, and fill in the pull request template.

## Commit messages

[Conventional Commits](https://www.conventionalcommits.org/) in English: `type(scope): summary`,
for example `feat(nodi): star morph` or `fix(rig): seam at the shoulder`. Types:
`feat`, `fix`, `docs`, `chore`, `test`. Explain the why in the body when it is not obvious.

## Running the checks

```bash
pnpm install
pnpm typecheck
pnpm test                 # kit tests (vitest)
pnpm test:scripts         # release script tests (node:test)
pnpm dev                  # playground, to look at the mascots
```

Visual changes need evidence in the pull request: a still or a contact sheet of the affected
poses, and the playground at 375 and 1440 px. Check joints at 4× zoom: no seams, no jagged edges.

## Craft rules

- One clock per mascot; every part turns on its real pivot.
- Idle life never stops; actions blend over it instead of replacing it.
- Follow-through with springs (`kit/spring.ts`), not with extra keyframes.
- Shapes that change pose are drawn with the same commands so they can morph (`kit/morph.ts`).
- No runtime dependencies, no network calls, no framework re-renders per frame.
- Reduced motion holds frame 0, so frame 0 must be a good drawing.

## Attribution

- Never remove an attribution comment or a license header.
- If you adapt code, art or text from someone else, check its license first, credit it inline and
  add a row to [THIRD_PARTY.md](THIRD_PARTY.md). Do not add material whose license does not allow
  redistribution under MIT-compatible terms.
- Mascots must be original characters. Do not recreate existing characters or brands.

## License of contributions

The project is under the [MIT License](LICENSE). By opening a pull request you agree that your
contribution is licensed under the same terms. No CLA, no DCO sign-off.

## Conduct and security

Participation follows the [Code of Conduct](CODE_OF_CONDUCT.md). Report vulnerabilities privately
as described in [SECURITY.md](SECURITY.md), never in a public issue.
