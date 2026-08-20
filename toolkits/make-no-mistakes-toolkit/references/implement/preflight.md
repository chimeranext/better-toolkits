Verify clean tree, sync, and CI before any implementation work.

## Pre-Flight Checks

Before touching any code, verify:

```bash
# 0. Read configuration
cat linear-setup.json  # Extract baseBranch, team.key, defaults

# 1. Clean working tree
git status  # Must be clean — no uncommitted changes

# 2. Sync with remote
git fetch origin
git checkout {baseBranch} && git pull origin {baseBranch}

# 3. No orphaned worktrees from previous work
git worktree list  # Should only show main working tree

# 4. Verify CI is green on {baseBranch}
gh run list --branch {baseBranch} --limit 3
```

If any check fails, STOP and resolve before proceeding.
