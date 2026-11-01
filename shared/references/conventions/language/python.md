# Python language conventions

## Generated artifacts (never commit)

- `venv/` and `.venv/` — Python virtual environments (regenerable via
  `python -m venv` + install). Ignore and, across worktrees, treat as
  regenerable build artifacts (see `implement/branch-and-worktree.md`).
- `__pycache__/`, `*.pyc`, `*.pyo` — bytecode caches.
- `.pytest_cache/`, `.mypy_cache/`, `.ruff_cache/`, `.tox/`, `htmlcov/` —
  tool caches.

## Version control

- Track only source and lockfiles (`pyproject.toml`, `requirements*.txt`,
  `poetry.lock`, `Pipfile.lock`).
- Prefer `venv/`/`.venv/` in `.gitignore`; never force-add them.
- Across worktrees, symlink the virtualenv as a regenerable artifact (never
  source, never tracked files) per `implement/branch-and-worktree.md`.

## Reference

- Generic symlink build-artifact policy:
  `toolkits/make-no-mistakes-toolkit/references/implement/branch-and-worktree.md`.
