Invocation, `linear-setup.json` overrides, and input resolution.

## How to use

```bash
claude /make-no-mistakes:implement ALT-13                          # Single issue
claude /make-no-mistakes:implement ALT-13 ALT-14 ALT-15           # Sequential chain
claude /make-no-mistakes:implement https://linear.app/.../ALT-13   # URL format
```

The `$ARGUMENTS` variable contains one or more Linear issue identifiers or URLs.

## Configuration

This command reads project-specific settings from `linear-setup.json` at the repo root. If the file exists, it overrides defaults for:
- `team.key` — Issue prefix (e.g., `APP`, `BACK`, `MYTEAM` — anything matching your Linear team)
- `git.baseBranch` — Base branch for PRs and rebasing (e.g., `main` instead of `develop`)
- `git.branchPattern` — Branch naming pattern
- `defaults.greptileReview` — Whether to tag Greptile
- `defaults.greptileMinConfidence` — Minimum Greptile confidence score
- `defaults.squashMerge` — Merge strategy
- `defaults.slackNotify` — Whether to send Slack notification on completion
- `openspec.changesPath` — Path to OpenSpec changes directory

If `linear-setup.json` doesn't exist, the command uses sensible defaults (`main` branch, squash merge, Greptile review enabled).

## Input Resolution

1. Parse `$ARGUMENTS` to extract issue ID(s) (e.g., `ALT-1234` or full URL)
2. Fetch each issue from Linear MCP: title, description, status, assignee, labels, comments, sub-issues
3. If multiple issues, determine execution order:
   - Respect explicit dependency links (`blockedBy`, `blocks`)
   - Otherwise, process in the order given
4. If `$ARGUMENTS` is empty, ask the user which issue(s) to work on

