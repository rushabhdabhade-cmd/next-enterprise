# Setup and Run Guide

This document explains how to set up and run the `next-enterprise` project locally, what I attempted in this environment, and provides commit/PR text you can use for the docs changes (with emojis).

## Purpose

Quick, copy-paste steps to get the project running on a macOS or Linux dev machine.

## Prerequisites

- Node 20+ (check with `node -v`).
- pnpm v10 (recommended). Node 20 includes Corepack which can activate pnpm.

Recommended: use Corepack to enable pnpm (works on Node >= 16.10, and Node 20 ships with Corepack):

```
corepack enable
corepack prepare pnpm@10.0.0 --activate
```

Alternatively install pnpm:

```
curl -fsSL https://get.pnpm.io/install.sh | sh
```

## Install dependencies

From the repository root:

```
pnpm install
```

Notes:
- The project uses a `postinstall` hook with `patch-package`, so the `pnpm install` step runs the postinstall scripts.
- If network or registry access is restricted, consider configuring the `npm`/`pnpm` registry or using an offline mirror.

## Run the app (development)

Start the Next.js dev server:

```
pnpm dev
# open http://localhost:3000
```

## Build and run production locally

```
pnpm build
pnpm start
```

## Other useful commands

- Storybook: `pnpm storybook`
- Tests: `pnpm test` (or `pnpm test:watch`, `pnpm test:coverage`)
- Playwright E2E: `pnpm e2e:headless` or `pnpm e2e:ui`

## Environment files

The repository contains `env.mjs` — review it for environment expectations. If you need environment variables, create a local `.env` or set them in your shell before running.

## What I ran here (automation attempt)

- I attempted to run `pnpm install` in this environment to set up the project.
- Result: `zsh: command not found: pnpm` — `pnpm` is not available in the current execution environment, so I could not complete the install or start the dev server here.

If you hit the same error locally, run the Corepack commands above or install `pnpm` and re-run `pnpm install`.

## Troubleshooting

- If `node -v` is less than 20, install Node 20 using `nvm`, `fnm`, or your preferred manager.
- If `pnpm install` fails with registry errors, try `pnpm install --registry=https://registry.npmjs.org/`.
- If `patch-package` modifies files unexpectedly, check `patches/` in repo root.

## Suggested Git commit & PR texts (use these as-is or modify)

Commit (title + description):

- Title: `docs: add setup/run guide and improve DOCS.md ✍️🛠️`
- Description:

  Clarify and expand documentation to make local setup and running the app easier for contributors.

  - Add `SETUP_AND_RUN.md` with step-by-step install and run instructions for macOS/Linux.
  - Document troubleshooting steps for Node/pnpm and common errors.
  - Provide quick commands for dev, build, storybook, and tests.

  Docs-only change; no runtime code modified. ✅

Pull Request (title + summary):

- Title: `Docs: add setup & run guide for faster onboarding ✨🚀`
- Summary:

  - **Files changed**: `SETUP_AND_RUN.md`, `DOCS.md`
  - **What**: Adds a dedicated setup and run guide, expands setup notes in `DOCS.md`, and includes troubleshooting tips and commands for dev and CI workflows.
  - **Why**: Reduce onboarding time for new contributors and make local setup reproducible.
  - **Impact**: Documentation-only; safe to merge.

  Please review the guide for clarity and suggest any missing steps or platform-specific notes. Thanks! 🙏

## Example git commands

```
git checkout -b docs/setup-guide
git add SETUP_AND_RUN.md DOCS.md
git commit -m "docs: add setup/run guide and improve DOCS.md ✍️🛠️"
git push -u origin docs/setup-guide
```

---

If you'd like, I can also:

- open a branch and create the commit for you here, or
- try installing `pnpm` in this environment (if allowed), or
- run additional checks (storybook, tests) once dependencies are installed.

Tell me which of those you'd like next.
