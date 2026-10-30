# /assurance-local-setup — protocol SSOT

Configures the **local side** of the `/assurance` gate: everything that lives on
the developer's machine. It does **not** touch GitHub settings or committed gate
files (that is `/assurance-repo-setup`). It is **idempotent**.

## Scope

| In scope | Out of scope |
|----------|--------------|
| Local git hooks (pre-push / pre-commit) | Ruleset / branch protection |
| Hook adapters (stderr/prds/no-squash) locally | `.mega-linter.yml` and CI workflows |
| Local typecheck dependencies (`npm ci --include=dev`) | `internal-audits` (remote repo) |
| Verification that checks run locally | Enabling remote gates |

## What it does

1. **`ensure-local-hooks.sh`** — enables the local git hooks:
   - if `pre-commit` is configured, `pre-commit install`;
   - fallback: `git config core.hooksPath` pointing to `shared/hooks/git`.
2. **`prepare-typecheck-deps.sh`** — `npm ci --include=dev` in `shared/hooks`
   (`--include=dev` is mandatory: `NODE_ENV=production` would omit devDeps →
   `TS2688`). Leaves `npm run typecheck` ready locally.

## Lessons incorporated

- Local typecheck shares the same reason as CI (`--include=dev`).
- Never forces remote permissions; if there is no `shared/hooks` nor `pre-commit`,
  it reports WARN and exits 0.

## Verification

- `git config core.hooksPath` or `pre-commit` active.
- `cd shared/hooks && npm run typecheck` passes.

## Related

- `references/assurance-repo-setup/protocol.md` (repo side)
- `scripts/assurance-local-setup/` (helpers)
