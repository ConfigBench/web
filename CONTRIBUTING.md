# Contributing to ConfigBench

Thanks for your interest in contributing! ConfigBench runs entirely in the browser — no backend, no tracking, no build-time secrets. This document covers setup, code standards, and how to get your changes merged.

By submitting a contribution, you agree to license your work under the project's [AGPL-3.0](LICENSE) license.

## Getting Started

### Prerequisites

- **Node.js** 20+ (LTS recommended)
- **npm** 10+

### Setup

```bash
git clone https://github.com/ConfigBench/web.git
cd web
npm install
npm run dev
```

Open http://localhost:5173 — the app runs fully in the browser; no environment variables or services are needed.

### Useful scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server (HMR) |
| `npm run build` | Type-check with `tsc` and build for production |
| `npm test` | Run the Vitest suite |
| `npm run lint` | ESLint over the repo |

All four must pass before a PR can be merged.

## How to Contribute

### Reporting bugs

Open a [GitHub issue](https://github.com/ConfigBench/web/issues) and include:

1. What you did (the config text / input that triggered it)
2. What you expected vs what happened
3. Browser + OS versions
4. Screenshots or the generated output snippet if relevant

For the Config tool, paste the offending YAML — most parser issues are reproducible from the raw text alone.

### Suggesting features

Feature suggestions are welcome as issues. Please open one **before** writing code — pull requests that add new features without any prior discussion are most likely to be rejected. A short proposal first lets us agree on whether it fits the tool and how it should behave, which saves everyone a rewrite.

### Pull requests

1. Fork the repo and create a branch from `main` (`feat/short-name` or `fix/short-name`).
2. Keep PRs focused — one feature or fix per PR. If you find unrelated issues, open separate PRs.
3. Run `npm run lint && npm test && npm run build` locally; CI must be green.
4. If your change affects parsing, rendering, or output generation, **add or update tests** in the matching `__tests__/` folder.
5. Write a clear PR description: what changed, why, and how to verify it.

## Code Standards

- **TypeScript strict mode.** No `any`, no loose types. `verbatimModuleSyntax` is on — use `import type` for type-only imports. No `enum`/`namespace`; use const objects and string unions.
- **No obvious comments.** Comments are for non-obvious workarounds, algorithmic reasoning, or browser quirks — not narration (`// set state` will be asked to be removed).
- **Guard clauses and early returns** over nested conditionals.
- **Clean up what you create:** event listeners, timers, animation frames, observers.
- **Styling:** Tailwind CSS v4 utility classes in the established dark palette. Squared chrome, 1px borders, fast 150–200ms transitions.

## Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(rgb): add OKLCh gradient easing toggle
fix(config): dedupe cascading YAML parse errors
docs: update scene asset placement rules
```

## License

ConfigBench is [AGPL-3.0](LICENSE) licensed. By contributing, you confirm that your contributions are your own work and you license them under AGPL-3.0. ConfigBench is a [SoftGrid](https://softgrid.dev) product; MiniMessage is by Adventure (Kyori) and its trademark/name belongs to its owners.
