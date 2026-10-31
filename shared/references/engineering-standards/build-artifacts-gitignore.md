# BGI — Build-Artifact Gitignore (doctrine)

## Purpose

Define the canonical set of `.gitignore` patterns every repo should vendor, and
norm how generated build artifacts relate to version control (never tracked;
symlinked across worktrees where applicable).

**Machine-readable source of truth:** `shared/references/conventions/vendored-gitignore.toml`.

## Doctrine

1. **Every repo SHALL vendor the ignore patterns** from
   `vendored-gitignore.toml` for the languages/tools it uses. Never hand-write
   a divergent set; copy from the catalog.
2. **Build artifacts are regenerable and never tracked.** Virtualenvs
   (`venv/`, `.venv/`), `node_modules/`, `target/`, `build/`, `dist/`,
   `__pycache__/`, and tool caches are generated outputs — they belong on disk,
   not in git.
3. **Across worktrees symlink regenerable artifacts** to the main checkout
   (see `implement/branch-and-worktree.md`): symlink only regenerable
   artifacts, never source, never tracked files.
4. **User/runtime-specific files are ignored too** (`.env.local`, local
   credentials) never committed.

## Catalog (summary)

- Python: `venv/`, `.venv/`, `__pycache__/`, `*.pyc`, tool caches.
- Node: `node_modules/`, `dist/`, `build/`, `.next/`, `coverage/`, `*.log`.
- Rust: `target/`.
- Dart/Flutter: `.dart_tool/`, `build/`, `.flutter-plugins*`.
- Elixir: `_build/`, `deps/`, `cover/`.
- Infra: `.terraform/`, `*.tfstate*`, `.env.local`.
- VCS/tooling: `.DS_Store`, `.idea/`, `.vscode/`, `.git/`.

## Enforcement

- Pre-commit/pre-push check: compare the repo's `.gitignore` against the catalog
  groups it claims; fail on missing mandatory patterns (where implemented).
- Generators may consume `vendored-gitignore.toml` directly (machine-readable).

## References

- `shared/references/conventions/vendored-gitignore.toml` — canonical catalog.
- `toolkits/make-no-mistakes-toolkit/references/implement/branch-and-worktree.md`
  — symlink policy for regenerable artifacts.
- `shared/references/conventions/language/*` — per-language conventions.
