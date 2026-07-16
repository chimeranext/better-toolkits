---
description: "Audit, install, and verify tracker/PR hygiene hooks in a repo — detects orphaned hook configs, enables the opt-in Linear create-hygiene gate, and proves each hook with synthetic payloads."
argument-hint: "[audit | install | verify] (default: full audit → install → verify flow)"
priority: 70
---

# /hygiene-hooks-setup: $ARGUMENTS

Set up the **hygiene hooks** layer in the current repo: the enforcement gates
that keep tracker issues fully triaged and PR pipelines honest. Born from a
real incident chain: issues created orphaned mid-session ("con el memory no
basta — hay que hacer los hooks"), then a month later the hooks themselves were
found **orphaned** — scripts present on disk but never loaded, because the
repo's `settings.json` carried an empty `hooks: {}` while the definitions sat
in a `hooks/hooks.json` nothing referenced. This command exists so both
failure modes are detected and fixed mechanically.

`$ARGUMENTS` selects a phase (`audit` / `install` / `verify`); empty runs all
three in order.

---

## The hygiene-hook catalog

| Hook | Event / matcher | What it gates | Distribution |
|---|---|---|---|
| `pre-linear-save-issue-hygiene.sh` | `PreToolUse` on `mcp__.*linear.*__save_issue` | CREATE without full triage (project, assignee, priority≠0, ≥1 label, milestone, explicit non-Backlog state) → **exit 2** with the missing-field list. Updates (`id` present) pass. Fail-open without `jq`. | Plugin-level (`hooks/hygiene/`, **opt-in per repo** via config) or repo-level copy |
| `stop-prs-green.sh` | `Stop` | Blocks session end while `.claude/.implement-prs` lists any PR that is draft / unreviewed / not APPROVED / below the confidence threshold (the `/ready-to-review-mergeable` exit condition) | Repo-level (companion of `/implement`) |

Related but procedural (agent contract, NOT executable hooks — documented in
`/ready-to-review-mergeable`): backfill project/assignee/priority on start,
flip In Progress → In Review (never Done), and **verify-don't-assume** on
tracker MCP writes (some relays silently no-op `state`/`assignee`).

---

## Phase 1 — Audit

1. **Hook-loading sanity (the orphaned-hooks check).** Read the repo's
   `.claude/settings.json` and `.claude/settings.local.json`:
   - `hooks` field **absent or `{}`** while `.claude/hooks/*.sh` scripts exist
     → **ORPHANED**: the scripts never run. Flag loudly.
   - A legacy `.claude/hooks/hooks.json` that nothing loads → same flag
     (Claude Code loads hooks from the `hooks` field of settings files and
     from plugins — never from a loose `hooks/hooks.json` in the repo).
   - CRITICAL: seeing git pre-commit hooks (lefthook/husky) run proves
     NOTHING about the Claude Code hook layer — different mechanisms.
2. **Per-hook registration.** For each catalog hook: does a matcher cover it?
   Does the regex actually match the live tool name (e.g.
   `mcp__plugin_linear_linear__save_issue`)? Is the script executable and does
   `jq` exist on PATH (fail-open otherwise — report it)?
3. **Plugin-level state.** If this plugin is enabled, the Linear hygiene hook
   is already wired at `PreToolUse` but **no-ops** until the repo opts in via
   `.claude/config/hygiene-hooks.json`. Report opt-in state.
4. Output a table: hook → present / registered / enabled / verified.

## Phase 2 — Install

**HITL gate: `.claude/settings.json` and `.claude/config/` are shared team
config — get the repo lead's OK before writing them.**

- **Plugin route** (repos where this plugin is enabled — preferred): write
  `.claude/config/hygiene-hooks.json`:

  ```json
  { "linear_create_hygiene": true }
  ```

  Nothing else to register — the plugin's `hooks/hooks.json` already carries
  the matcher; the config flips it on for this repo only.

- **Repo-level route** (teams not on the plugin): copy
  `hooks/hygiene/pre-linear-save-issue-hygiene.sh` from the plugin into the
  repo's `.claude/hooks/`, make it executable, and **merge** (never clobber)
  into `.claude/settings.json`:

  ```json
  {
    "hooks": {
      "PreToolUse": [
        {
          "matcher": "mcp__.*linear.*__save_issue",
          "hooks": [{ "type": "command",
            "command": "${CLAUDE_PROJECT_DIR}/.claude/hooks/pre-linear-save-issue-hygiene.sh" }]
        }
      ]
    }
  }
  ```

  When copying repo-level, strip the plugin's opt-in config gate (the repo
  registering it IS the opt-in) or ship the config file alongside.

- If the audit found an orphaned `hooks/hooks.json`, migrate its entries into
  the settings `hooks` field as part of the same change.

## Phase 3 — Verify (prove it, don't assume it)

Run the synthetic-payload suite against the installed script — every case must
match, otherwise report the failure and do not claim the hook works:

| # | Payload (`tool_input`) | Expected |
|---|---|---|
| 1 | `{team,title}` only | **exit 2**, stderr lists all 6 missing fields |
| 2 | full triage (project, assignee, priority 3, 1+ labels, milestone, state Todo) | exit 0 |
| 3 | `{id, state}` (update) | exit 0 (pass-through) |
| 4 | full triage but `state: "Backlog"` | **exit 2**, stderr mentions Backlog |
| 5 | full triage but `priority: 0` | **exit 2** |
| 6 | malformed input (not JSON) | exit 0 (fail-open) |
| 7 | full triage but `labels: []` | **exit 2** |

```bash
printf '%s' '{"tool_input":{"team":"X","title":"t"}}' \
  | bash .claude/hooks/pre-linear-save-issue-hygiene.sh; echo "exit=$?"
```

For the plugin route, also verify the opt-in gate: with the config file
absent, case 1 must exit **0** (no-op); with `linear_create_hygiene: true`,
case 1 must exit **2**.

Then verify **live registration** (a script passing in bash proves logic, not
loading): create a throwaway tracker issue WITHOUT triage from the session and
confirm the call is blocked before reaching the MCP; then create it properly
and clean up — or, if the team forbids test issues, at minimum confirm the
matcher regex against the exact live tool name.

## Report

- Audit table (hook → present/registered/enabled/verified).
- What was installed/changed, with the lead approval noted.
- Verify suite results (7/7 or the failing cases verbatim).
- Reminder of the procedural layer: hooks gate *creation* hygiene; state
  flips and verify-don't-assume remain the agent's contract per
  `/ready-to-review-mergeable`.

## Anti-patterns

- Concluding "hooks work" because a git pre-commit hook fired.
- Registering a hook without running the payload suite (silent regressions).
- Clobbering an existing `hooks` field instead of merging matchers.
- Enabling the Linear gate globally at plugin level without the per-repo
  opt-in (surprising every other repo the plugin is installed in).
- Editing shared `.claude/settings.json` without the repo lead's OK.
