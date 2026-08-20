Claim the issue, create branch+worktree, assess scope, commit OpenSpec first if drafted.

# Phase 1: Setup

1. **Claim the issue in Linear:**
   - Auto-assign to me (`assignee: "me"`)
   - Set status to **In Progress**
   - Comment: "Starting implementation. Branch: `{branch-name}`"

2. **Determine branch type** from Linear issue labels/title (see rule above).

3. **Create NEW branch + worktree** (MANDATORY — never skip):
   ```bash
   # Delete stale branch if it exists from a previous attempt
   git branch -D {type}/{issue-id}-{short-description} 2>/dev/null || true

   # Create fresh worktree with new branch
   git worktree add .claude/worktrees/{issue-id} -b {type}/{issue-id}-{short-description} {baseBranch}
   cd .claude/worktrees/{issue-id}

   # Verify you are in the worktree, NOT the main tree
   git worktree list  # Current dir should be in .claude/worktrees/
   pwd                # Must NOT be the repo root
   ```

4. **Assess scope:**
   - If the issue will touch **>15 files**, STOP. Decompose into 2+ PRs by domain BEFORE starting.
   - Create sub-issues in Linear for each PR if decomposing.
   - Comment the decomposition plan on the parent issue.

4a. **Commit the OpenSpec change as the first commit** (only if Phase 0 step 3 drafted artifacts because none existed):
   - Phase 0 wrote the artifacts to the **main working tree** at `{main-tree}/$CHANGES_PATH/<change-slug>/`. Phase 1 step 3 created a fresh worktree from `{baseBranch}`, which does NOT carry over those uncommitted files. Copy them into the current worktree explicitly. The `CHANGE_SLUG` value MUST match the slug Phase 0 step 3 chose (same `{issue-id-lowercase}-{short-kebab-description}` rule):
     ```bash
     # Inside the new worktree (Phase 1 step 3 cd'd here).
     CHANGES_PATH=$(jq -r '.openspec.changesPath' linear-setup.json)
     # Bind the slug Phase 0 step 3 produced. Replace the placeholder before
     # running — never leave it as a literal "<change-slug>" string.
     CHANGE_SLUG="<change-slug>"   # e.g. acme-3946-atomic-primitives-sprint
     # Resolve the main working tree's filesystem path from git's worktree
     # registry — first row of `git worktree list --porcelain` is always the
     # primary tree, regardless of which worktree we're currently in.
     MAIN_TREE=$(git worktree list --porcelain | awk '/^worktree/ {print $2; exit}')
     # Skip the copy if the worktree already has the directory (e.g. an
     # earlier run already staged it, or the spec was committed previously).
     if [ ! -d "$CHANGES_PATH/$CHANGE_SLUG" ]; then
       mkdir -p "$CHANGES_PATH"
       cp -r "$MAIN_TREE/$CHANGES_PATH/$CHANGE_SLUG" "$CHANGES_PATH/"
     fi
     git add "$CHANGES_PATH/$CHANGE_SLUG/"
     git commit -m "docs(openspec): $CHANGE_SLUG"
     ```
   - The `docs(openspec)` commit MUST be commit #1 on the branch — reviewers and future agents read the spec before the diff.
   - If Phase 0 found an existing change (step 2), skip this entire step — the spec is already on `{baseBranch}` and inherited by the new worktree.
