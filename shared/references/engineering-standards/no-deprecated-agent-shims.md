# No deprecated agent shims (commands / scripts)

## Policy

When renaming a slash command, script, or reference path in **better-toolkits**:

1. **Update** all in-repo references to the new name.
2. **Delete** the old file — do not leave a “MOVED (shim)”, “deprecated alias”, or `exec` wrapper script.
3. **Changelog** may mention the rename; that is not a runtime shim.

This matches clean-cut renames (no parallel legacy paths) used elsewhere in the Chimera/Seacrets agent repos.

## Enforcement

| Layer | Mechanism |
| --- | --- |
| CI | `python3 scripts/lint/check_no_stale_deprecated_shims.py --repo` in `marketplace-versions` workflow |
| Pre-push | Same checker with `--range` on the push range (see `pre-push-marketplace-versions.sh`) |
| Pre-commit | `no-stale-deprecated-shims` on touched `commands/` and `scripts/` under toolkits and bootstrap |
| Cursor | `beforeShellExecution` blocks `git commit` when staged watched files match shim patterns |

Grandfathered debt may be listed in `scripts/lint/baselines/stale_deprecated_shims.txt` (**shrink-only**). **Dogfooding target:** keep that file empty — the linter’s `--repo` pass should stay green with no exceptions.

## What is not flagged

- Skills or references that mention “deprecated” APIs in prose (e.g. legacy `npx @lapc506/...`).
- Assurance “template copy retained as shim” inside skill bodies (content migration, not slash-command aliases).
