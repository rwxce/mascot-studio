# Branches and releases

Two long-lived branches:

| Branch | Holds | Who writes to it |
|---|---|---|
| `main` (default) | One commit per release (`release: vX.Y.Z`), each tagged | Only the Release workflow |
| `dev` | Every commit: features, fixes, docs | Pull requests |

- Open pull requests against **`dev`**. Never against `main`.
- `main` is what people clone and install, so it only moves on a release. Its history reads as a
  list of versions; the detail of each one is on `dev` and in `CHANGELOG.md`.

## Cutting a release

Run **Actions → Release → Run workflow** with a bump (`patch`, `minor`, `major`), or let the weekly
run (Mondays) do a patch. The workflow (`.github/workflows/release.yml`, `scripts/release.mjs`):

1. skips the release when nothing changed, or only tooling, tests or top-level docs did;
2. bumps `package.json` on `dev`;
3. creates one commit on `main` whose content is exactly `dev`'s, with the previous release as its
   parent, and tags it `vX.Y.Z`;
4. merges that commit back into `dev`.

Use **dry run** to see the plan without releasing.

**First release.** Until the first tag, `main` only holds the placeholder commit that let `dev` be
created. The first release is an orphan `release: v0.1.0` commit that replaces it (the only time the
workflow force-updates `main`), so from then on `main` contains releases and nothing else.

## Fixing a release

There are no hotfix branches. Fix on `dev` and cut a patch release. Since each release copies
`dev`'s whole content, nothing fixed on `dev` can be lost from `main`.
