# Security policy

## Reporting a vulnerability

Please report vulnerabilities **privately**, not in a public issue:

1. Open <https://github.com/rwxce/mascot-studio/security/advisories/new> (GitHub private vulnerability reporting).
2. Describe the problem, the affected file, how to reproduce it and the impact you expect.

Only the maintainers can see the report. We discuss the fix with you in the advisory and credit you
when it is published, unless you prefer to stay anonymous.

## Scope

In scope:

- The runtime kit (`kit/`) and the mascots, anatomies and styles that ship with it — for example
  markup injection through a mascot's text or options.
- The tools (`tools/`, `scripts/`) and the GitHub workflows, including anything that could expose
  a token.

Out of scope:

- Vulnerabilities in third-party tools (Vite, Vitest, Playwright, GitHub Actions). Report those upstream.
- Problems in a project after its owner changed the shipped files.

## What to expect

This is a small project maintained in spare time. We read every report and aim to acknowledge it
and share an assessment as soon as we can, but there is no response or fix time (no SLA). Fixes
land on `dev` and reach `main` with the next release. Only the latest release is supported.
