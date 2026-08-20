Load or draft OpenSpec before setup when `openspec.changesPath` is configured.

# Phase 0: OpenSpec Context (MANDATORY when configured)

Run this BEFORE Phase 1 (Setup). If `linear-setup.json` has `openspec.changesPath`:

1. **Resolve the configured changes directory** and check for an existing OpenSpec change that references this issue. The grep MUST use the configured path — projects may set `openspec.changesPath` to anything (e.g., `specs/changes/`) and a hardcoded `openspec/changes/` would silently miss every existing spec there:
   ```bash
   CHANGES_PATH=$(jq -r '.openspec.changesPath' linear-setup.json)
   grep -r "{issue-id}" "$CHANGES_PATH"/*/proposal.md 2>/dev/null
   ```
   In all references below, `<changes>` denotes that resolved `$CHANGES_PATH` value, NOT the literal string `openspec/changes/`.

2. **If found**: Read ALL three artifacts as primary implementation context:
   - `<changes>/{change-slug}/proposal.md` — intent, domain, scope
   - `<changes>/{change-slug}/design.md` — architectural decisions, rejected alternatives, pre-launch checklist
   - `<changes>/{change-slug}/tasks.md` — atomic task list with file paths and commit messages

   These three files are the CONTRACT. The Linear issue is the WHAT; OpenSpec is the HOW. Do not deviate from the spec without going back to it first.

3. **If MISSING and the issue is non-trivial** (touches >2 files OR involves architectural decisions OR has reviewer-flagged risk): STOP and prepare the OpenSpec change BEFORE proceeding.
   - Use `/superpowers:brainstorming` if the design needs more thinking
   - Use `/make-no-mistakes:premortem` if the change is load-bearing in production
   - **Compute the change slug deterministically** so every later step (and any restart) targets the same directory. The slug MUST follow the same shape as the implementation branch: `{issue-id-lowercase}-{short-kebab-description}` (e.g., `acme-3946-atomic-primitives-sprint`). Lowercase only, ASCII alphanumerics + hyphens, no leading/trailing hyphens, no other separators.
   - **Draft the three artifacts** in `<changes>/<change-slug>/`: proposal.md (intent + scope + out-of-scope), design.md (decisions + rationale), tasks.md (atomic checklist with commit messages). Leave them uncommitted on disk — the implementation branch does not exist yet.
   - **Defer the commit to Phase 1 step 4a** (below). Phase 1 creates the branch and worktree; the OpenSpec files are then committed as the very first commit on that branch.

4. **If MISSING but the issue is trivial** (typo fix, dependency bump, single-line change): proceed to Phase 1 without OpenSpec. Add a one-line note to the PR description explaining why OpenSpec was skipped.

5. **If `openspec.changesPath` is not configured** in `linear-setup.json`: skip this phase entirely. The project hasn't adopted OpenSpec yet.

**Why mandatory**: per the adoption decision (Slack 2026-03-30, channel C0AE5MKAX7B), OpenSpec is the durable persistence of design decisions. A skill that makes it optional re-introduces the failure mode it was adopted to prevent — implementations diverging from intent because nobody wrote the intent down.
