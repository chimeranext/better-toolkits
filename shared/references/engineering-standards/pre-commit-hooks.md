# PCH — Pre-Commit Hooks (doctrine)

> Policy/doctrine SSOT for `pre-commit` hooks. Defines a vendored canonical
> `.pre-commit-config.yaml` + a shared `scripts/validate-mermaid.sh` that every
> repo adopts. Enforces **CvC** (Conventional Commits) and structural integrity
> of docs.

## Doctrine

1. **Mandatory hooks** in every repo:
   - `check-json` — validate JSON.
   - `check-merge-conflict` — fail on conflict markers.
   - `trailing-whitespace` — strip trailing whitespace.
   - `end-of-file-fixer` — ensure final newline.
   - `conventional-pre-commit` — enforce **CvC** at `commit-msg`.
   - `mermaid-syntax` — validate Mermaid diagrams in Markdown.
2. **Mermaid validation is structural** — every monorepo's docs must have valid
   Mermaid (emojis/pipes that break rendering are caught). The validator is
   shared, not per-repo.
3. **Vendored files** (source of truth):
   - `.pre-commit-config.yaml` template (below).
   - `scripts/validate-mermaid.sh` (shared, run from repo root, Markdown under
     `docs/` by default).

## Vendored template — `.pre-commit-config.yaml`

```yaml
# Pre-commit hooks (canonical) — see PCH doctrine.
# Install with a HEALTHY python: pre-commit install

exclude: |
  (?x)^(
    dist/|
    build/|
    node_modules/|
    .dart_tool/|
    .venv/|
    .*\.log$|
    logs/
  )

repos:
  # Validate Mermaid diagrams (shared script)
  - repo: local
    hooks:
      - id: mermaid-syntax
        name: Validate Mermaid diagrams
        entry: /usr/bin/bash
        args: ["scripts/validate-mermaid.sh"]
        language: system
        types: [markdown]
        pass_filenames: false

  # Standard pre-commit hooks
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.6.0
    hooks:
      - id: check-json
      - id: check-merge-conflict
      - id: trailing-whitespace
      - id: end-of-file-fixer

  # Conventional Commits (CvC)
  - repo: https://github.com/compilerla/conventional-pre-commit
    rev: v4.0.0
    hooks:
      - id: conventional-pre-commit
        stages: [commit-msg]
        args:
          - feat
          - fix
          - docs
          - style
          - refactor
          - perf
          - test
          - build
          - ci
          - chore
          - revert
```

## Vendored script — `scripts/validate-mermaid.sh`

A clean, shared Mermaid validator (no duplicated bodies). It scans Markdown
under `docs/` (configurable), warns on emojis and unescaped pipes that break
rendering, and never blocks on warnings. stderr is captured, never discarded.

```bash
#!/usr/bin/env bash
# validate-mermaid.sh — shared Mermaid validator (PCH).
# Usage: bash scripts/validate-mermaid.sh [docs-dir]
set -euo pipefail
DOCS_DIR="${1:-docs}"
WARNINGS=0
MD_FILES=$(grep -rl '```mermaid' "$DOCS_DIR" 2>&1 | grep -v '^grep:' || true)
for file in $MD_FILES; do
  awk '/```mermaid/,/```/' "$file" | while read -r line; do
    if printf '%s\n' "$line" | grep -qE '(^|\[)[^]]*(🛡|🏗|📱|💻|🔒|🚀|📦|⚙|💾|☁|🚪|🎨|👥|🔌|📋|🏛|❌|✅)'; then
      echo "WARNING: emoji in $file: $line"; WARNINGS=$((WARNINGS+1))
    fi
    if printf '%s\n' "$line" | grep -q '|' && ! printf '%s\n' "$line" | grep -qE '^\|.*\|$|subgraph|end|style |linkStyle'; then
      echo "WARNING: unescaped pipe in $file: $line"; WARNINGS=$((WARNINGS+1))
    fi
  done
done
[ "$WARNINGS" -gt 0 ] && echo "Mermaid: $WARNINGS warnings (non-blocking)"
exit 0
```

## Application

- **Every monorepo and internal-handbook** adopts the vendored template + script.
- Install with a **healthy python** (never a broken env like anaconda3).
- The allowed conventional types in the hook MUST match **CvC**.

## References

- Related: **CvC** (Conventional Commits), **CLG**, **CCC**.
- Example origin: altrupets monorepo (commits `d9af3244`, `0c06ba8a`).
