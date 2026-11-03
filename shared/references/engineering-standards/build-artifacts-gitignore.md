# BGI — Build-Artifact Gitignore (doctrina)

## Purpose

Standardize the **`.gitignore` hygiene** that every repository must carry so
build artifacts, dependency caches, and local-only files never leak into the
tracked tree. Every repo vendors the ignore patterns from the canonical catalog
`vendored-gitignore.toml`.

## Doctrine

1. **Every repository SHALL vendor the canonical ignore patterns** from
   `vendored-gitignore.toml` (venv, node_modules, target, build, caches). The
   catalog is the single source of truth; repos do not hand-author divergent
   ignore lists.
2. **The symlink build-artifact policy.** Build artifacts (dist, target, build,
   out) are either gitignored or symlinked out of the tracked tree. They are
   never committed as first-class content.
3. **Local/per-project files are not committed.** `.env`, `.env.*`, slack
   config, and local-only design-history directories (`.private/`) are ignore
   patterns; every contributor keeps their own copy.
4. **Agent / git worktrees are transient.** `.agents/worktrees/`,
   `.worktrees/`, `.wt-*` are never committed.
5. **CI and reviewers enforce the catalog.** A PR that adds a tracked build
   artifact or a missing ignore pattern is flagged.

## The catalog (`vendored-gitignore.toml`)

The canonical catalog is a TOML file; every repo derives its `.gitignore` from
it. The core patterns (from the observed toolkits):

```toml
# Language/build runtimes
node_modules/
dist/
target/
build/
out/
*.log

# Environments & secrets (local-only)
.env
.env.*
.DS_Store
slack-config.json

# Agent / worktrees
.agents/worktrees/
.worktrees/
.wt-*/
```

## Application (generic)

- Vendor: `assurance-repo-setup` writes the repo's `.gitignore` by rendering the
  catalog (`vendored-gitignore.toml`).
- Symlink policy: build-artifact directories are symlinked to a gitignored
  location rather than committed.
- Audit: a repo-health check (RDP family or CI) verifies no tracked build
  artifact exists and the `.gitignore` covers the catalog.

## References

- The catalog `vendored-gitignore.toml` (referenced by the standards index).
- Related: `worktree-discipline.md` (worktrees transient), `checksum-hygiene.md`
  (release artifacts verified, not committed).
- Learner summary: internal-handbook `docs/how-to/engineering-standards/BGI.md`.

## Recurrence guard: worktree symlink gate

The symlink doctrine needs an enforcement point. When a git worktree is created,
its checkout has no `node_modules`/`dist`. Without a gate, the first build in
the fresh worktree fails with `ERR_MODULE_NOT_FOUND` (a Jidoka stop we paid).

- **Gate:** `scripts/git-hooks/worktree-symlink-build-artifacts.sh` symlinks a
  worktree's `node_modules` to a shared, gitignored cache
  (`~/.cache/better-toolkits/node_modules-<hash>`). Invoke it from a
  `post-checkout` / `post-worktree` hook.
- **Relation to WTD:** `worktree-discipline.md` declares worktrees transient and
  rebuildable; this gate makes rebuild cheap by sharing `node_modules` across
  worktrees of the same repo. WTD is the *why*; BGI + this gate are the *how*.
- **Idempotent:** real dir → moved into cache and replaced by symlink; absent →
  linked; already a symlink → no-op.
