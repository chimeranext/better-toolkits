# /subagents-opencode — protocol SSOT

This pattern is **agnostic** subagent-driven development (inspired by
`superpowers/subagent-driven-development`). **herdr** (Linux/WSL) and **herdrm**
(macOS) run subagents as TUI workers in independent processes. This protocol uses
the herdr orchestration capabilities (`herdr-orchestration`), adapted to the real
CLI `herdr` (not `rtk herdr`).

## Pipeline & parity (mandatory)

- **Parity:** one issue equals one OpenSpec change, one worktree, and one PR.
  Keep this invariant for every delegated task.
- **Between intermediate commits:** when the branch carries OpenSpec changes, run
  `/opsx-sync` before each next logical commit (CLG §5).
- **Gate:** the controller accepts a worker result as done only after task review,
  diff review, and `/dogfood`. Ship through `/ready-to-review-mergeable`.
- Workers never push on their own. Pushes are controller plus HITL.

## Pattern (controller)

1. **Dispatch a fresh implementer per task.** Context stays isolated. The worker
   builds only what it needs. It does not inherit the session.
2. After each task, do **task review**: compliance with the spec and code
   quality. Never skip it. The implementer self-review does not replace it.
3. Use a **fix loop** when the review reports findings. Cap the rounds. When the
   task does not converge, apply **Ruling** and move on.
4. Do a **final review** of the whole branch after all tasks finish.
5. Keep a **ledger** (`progress.md`) as a recovery map. It survives compaction.
   Record every `Ruling`.

## Key rules (from the pattern)

- Use one implementer per task. Do not dispatch implementers in parallel
  (conflicts).
- The implementer does not dispatch subagents (no helpers, no reviewer).
- The controller runs all tasks without pausing to ask. It stops only for:
  irreversible or destructive operations, sensitive security actions, or
  external effects (merge, push to a shared branch, publish).
- The controller keeps its context to coordinate. Artifacts pass as files, not
  pasted into the prompt.

---

# herdr orchestration (operational reference)

> Real CLI: **`herdr <sub> …`**. The compozy/kb CLI uses `rtk herdr …`. Here you
> use only `herdr`. All capabilities are verified against `herdr 0.9.5`.

## herdr invariants

- Manage the caller workspace (`HERDR_WORKSPACE_ID`), unless the user names
  another target.
- Resolve context from `HERDR_WORKSPACE_ID`, `HERDR_TAB_ID`, and
  `HERDR_PANE_ID` (injected into each pane) before any fallback.
- Direct workers by ids parsed from JSON: agent name for `agent …`, `w2:t3` /
  `w2:p4` for tab/pane. Never guess by position.
- Use `--no-focus` on every creator verb (`tab create`, `worktree create`). Use
  focus verbs only when the user asks.
- Retire each worker when its assignment ends (see Retire workers).

## Preflight

```bash
herdr status                 # server running + socket
herdr integration status     # the selected runtime must show `current`
herdr pane current --current # ids of caller pane / tab / workspace
herdr agent list             # agents already running
```

Install or update **only** the selected runtime integration:
`herdr integration install <runtime>` (for example `opencode`, `claude`,
`codex`). When a runtime shows `outdated (vN < vM)`, update it before delegating.
Agent-state detection fails when the integration is outdated. Reuse the preflight
in the same workspace while the daemon and integrations stay unchanged.

## Workers are TUIs, not headless

A worker is an interactive TUI (`opencode`, `claude`, `codex`, and so on),
started with `herdr agent start`. It verifies identity and returns only when the
TUI is ready. Headless runners (`claude -p`, `codex exec`, JSON streams in a
pane) do not report status. `agent wait` never fires, and the delegation dies
silently. When a pane fills with JSON lines, interrupt it
(`pane send-keys <id> ctrl+c`) and restart with `agent start`.

## Start workers

One worker uses one named tab. Each worker needs two names:

- **tab label** — `<model>: <slice>`, for example `opus: fix loops`. Free text,
  short.
- **agent name** — the slice as a slug, for example `fix-loops`. It must match
  `[a-z][a-z0-9_-]{0,31}` and be unique among live agents.

```bash
# 1. named tab -> returns .result.tab.tab_id and .result.root_pane.pane_id
herdr tab create --workspace "$HERDR_WORKSPACE_ID" --cwd "$PWD" \
  --label "opus: fix loops" --no-focus

# 2. worker TUI in that tab root pane; native flags after `--`
herdr agent start fix-loops --kind opencode --pane <root_pane_id> -- \
  --dangerously-skip-permissions "<subordinate>"
herdr agent start audit-auth --kind codex --pane <root_pane_id> -- --yolo
```

Record `tab_id`, `pane_id`, and the agent name in the ledger. Retire and reads
need them. `agent start` succeeds only when herdr detects a ready worker. A
non-zero exit means the start failed. Read the root pane
(`pane read <pane_id> --source visible`) before retrying. Verify the label with
`herdr tab list --workspace "$HERDR_WORKSPACE_ID"`. When the label defaults,
run `tab rename <tab_id> "opus: fix loops"`.

> Note: `--kind` supports `opencode`, `claude`, `codex`, and so on. See
> `herdr agent start --help`. The opencode flag for unattended workers comes from
> the integration. For claude/codex use `--dangerously-skip-permissions` /
> `--yolo`.

## Send prompts to running TUIs

Pass the initial subordinate as argv. The session works immediately. For
follow-ups use `agent prompt`. It sends text plus Enter atomically. `--wait`
blocks until the worker settles:

```bash
herdr agent prompt fix-loops "<follow-up prompt>" --wait --timeout 300000
```

A trailing `\n` in `pane send-text` does not send (the TUI renders it as a soft
newline). When `--wait` returns `agent_prompt_stalled`, the worker never changed
state. Read the screen and resend.

## Delegation subordinates

Each worker prompt is a standalone contract, called a **subordinate**. It
includes:

- repo path and exact goal
- worker role and model
- execution mode: direct (default) or plan-first (user-activated)
- files, packages, and surfaces in scope
- files and behaviors explicitly out of scope
- claimed files and work slice (to avoid conflicts)
- dependencies and the current contract or interface it can rely on
- expected evidence: changed files, commands with results, verified inputs,
  artifacts, remaining uncertainty
- verification ownership: the worker verifies and the controller runs integration
  and final verifications
- stopping conditions: unexpected code shape, repeated command failure, auth or
  model block, edits outside scope

Assign coherent outcomes that can proceed independently. When a consumer depends
on an unresolved interface, resolve it first, or keep producer and consumer under
one owner. Tell workers they share the codebase. They must preserve others'
changes and report interface changes before dependent work proceeds. Reuse the
same worker for related integration fixes. Send the changed contract and the
remaining work, not a fresh discovery assignment.

## Isolation with worktrees

When workers edit overlapping files in parallel, give each worker an isolated
worktree. herdr manages it natively as its own workspace:

```bash
herdr worktree create --workspace "$HERDR_WORKSPACE_ID" \
  --branch <slug> --label "<slug>" --no-focus --json
```

Create the worker tab inside that workspace (`tab create --workspace
<worktree_workspace_id>`) so its cwd is the isolated checkout. This monorepo
convention puts worktrees in `.agents/worktrees/<slug>`.

### Subordinate location and naming (mandatory)

Write every **subordinate** (delegation contract) and its resulting evidence
**inside the work tree of the work**, never in the repo root or the main
checkout:

```
.agents/worktrees/<slug>/subordinate-<task>.md
.agents/worktrees/<slug>/evidence-<task>.md
```

Rules:

- The subordinate is a physical file in that worktree. Pass it to the worker as
  start argv or via prompt.
- Naming is fixed: `subordinate-<task>.md` (kebab-case). Do not invent other
  names. An earlier ad-hoc scheme was discarded.
- Never put subordinates or subagent artifacts in `$REPO_ROOT/` (root) or
  outside `.agents/worktrees/`. When the work belongs to a branch or PR, its
  subordinate lives in that worktree.
- The controller ledger `progress.md` stays in the canonical protocol location
  (next to this file). Do not duplicate it in worktrees.

## Worker tracking

Orchestrations are long. A worker is never abandoned because a wait expires.
Block on the native herdr state at **verification intervals of 3–5 min** (by
slice weight), instead of polling screens:

```bash
herdr agent wait fix-loops --until done --timeout 300000     # completeness check-in
herdr agent wait fix-loops --until blocked --timeout 300000  # question or menu
herdr pane wait-output <pane_id> --match "<text>" --timeout 300000
```

Controller reads do not mark a tab as seen. An unfocused worker settles in
`done`, not `idle`. Wait for `done`. `--timeout` is the verification interval,
never a deadline. On expiry, read the screen (`herdr agent read fix-loops --source
recent-unwrapped --lines 120`) and re-enter the wait. Iterate until terminal
state, a question, or a stop condition. When a status looks wrong, debug with
`herdr agent explain <pane_id> --json`.

Keep a compact ledger in task or handoff notes. It records:

- controller identity
- agent name, tab label, role, model
- workspace, tab, and pane ids
- goal and start time
- status (starting, planning, plan-review, plan-accepted, running, blocked,
  reported, verified, retired)
- claimed files
- reported commands and results
- controller verification
- final disposition (accepted, rejected, superseded, blocked)

Rename the label as the slice changes, and announce milestones without stealing
focus:

```bash
herdr tab rename <tab_id> "opus: fix loops (verifying)"
herdr notification show "Workers done" --body "2/2 verified" --sound done
```

## Notification / attention (gaps 1–4)

The wait is the source of truth, but the human needs **alerts** when a worker
blocks or finishes, not only controller polling.

- **opencode notifier (recommended for the opencode harness):**
  `@mohak34/opencode-notifier`. Subscribe to rich events: `permission`,
  `complete`, `subagent_complete`, `question`, `error`, `user_cancelled`,
  `plan_exit`. Set `showSessionTitle: true` so the alert shows the session
  subject (not only the folder name), and `focusOnClick: true` to return to the
  worker on click. Install and configure it as part of `/toolkits-initial-setup`
  (see that protocol).
- **herdr notifier (macOS):** `dot/herdr-terminal-notifier` — a native toast
  with the herdr icon and click-to-jump (`CLICK_COMMAND: agent focus {pane}`).
  Use `{title}` (terminal_title_stripped = subject), `{workspace}`, `{tab_label}`
  templates.
- **Native `subagent_complete` event:** when available, use it as a worker
  completion signal (besides the inferred `agent wait --until done` state).
- **Focus suppression (opt-in):** `suppressWhenFocused` is **opt-in**. By default
  it is off (always notify). When the user enables it, do not alert when the
  worker is already visible or focused (avoids spam).
- **Avoid duplicates:** when opencode-notifier and herdr coexist, one event alerts
  twice. Configure herdr `[ui.toast] delivery = "terminal"` (in-app toast) or
  turn off its system toast, so only one notifier posts to the desktop.

## Multi-session orchestration (gaps 5–6)

By default, `/subagents-opencode` orchestrates **tabs within one workspace** of
herdr (for example `w9`). When the work crosses into another **named herdr
session**:

- **Nested start prohibition:** herdr forbids starting herdr inside herdr. You
  can change sessions only from a raw shell (outside herdr). Use
  `victor-falcon/herdr-sessionizer` (gist) or `herdr session <list|attach|create|stop|delete>`
  from an external shell.
- **Window naming per session:** when attaching or creating a session, set the
  host window title with OSC 2 (`printf '\033]2;herdr:%s\007' "<session>"`).
  Notification clicks then route to the right window.
- **Multi-session ledger:** record the `session_name` (not only workspace/tab/
  pane) in the ledger. Pane ids are scoped to the server/session.

## Verify worker output

Treat worker output as untrusted until verified. Monitor and verify without
changing focus:

- Read worker tabs read-only (`agent read <name> --source recent-unwrapped --lines 200`).
  Ask the worker for a status summary when the output is unclear.
- Reopen cited files locally to verify high-impact findings. For visual output,
  open delivered images and their references side by side. File counts do not
  prove visual fit.
- Inspect command results, exit status, verified inputs, and evidence paths.
  Reuse reliable evidence for verified inputs. Re-run missing, stale, or
  contradictory verifications. The controller runs uncovered integration
  verifications.
- Review the final diff before accepting any worker patch.
- When a worker edits outside its claim, pause the integration and decide: accept,
  ask for approved cleanup, or override with controller edits.

When `--lines` reveals no more complete answer, the TUI shows an alternate screen
and those rows are gone. Ask the worker to write its full report as Markdown in a
temp dir and reply with the path. Then read the file.

## Retire workers

A delegation ends when the worker is retired, with its tab closed. Keep a worker
that reported available while you review or integrate its result, if follow-ups
come. Retire it when you record the disposition and finish that work:

```bash
herdr tab close <tab_id>
```

Closing the tab ends the TUI session and its scrollback. Record first what the
ledger needs (report text, line refs, command output). Files, diffs, and
worktrees survive on disk. A worker stays open while it runs, is blocked, or
waits for planned integration follow-ups. It also stays open when its screen
shows evidence of an unresolved failure, or when the user asks to inspect it.
Record the reason. The orchestration completes only when `herdr agent list` shows
no live workers from this controller.

## Stopping conditions

Stop and report (do not improvise) when:

- herdr rejects a valid workspace/tab/pane ref, or `herdr status` shows no server
  running.
- a worker TUI rejects the model alias, auth state, working directory, or a boot
  flag. Report the exact block and get approval before degrading the model or
  changing the tool.
- auth blocks the TUI.
- a worker status stays `unknown` while output scrolls, and `agent explain` shows
  no matching rule. Detection is broken, or the pane runs a headless process.
- a plan-mode status line or acceptance menu cannot be verified via `agent read`
  or `pane wait-output`, or a worker plan leaves scope after a re-planning round.
- workers need overlapping edits that the controller cannot safely integrate.
- a task needs herdr verbs that change focus, and the user did not approve them.

## Plan-first delegation (opt-in)

Only when the user activates it (explicit "plan first"/"plan mode" ask, or the
`--plan-mode` flag). The default is direct. When active, read
[`plan-mode.md`](subagents-opencode/plan-mode.md) (the start and acceptance
reference for plan-first with claude/codex) before starting a plan-first worker.

## Capabilities per harness

See [`subagents-harness-capabilities.md`](../subagents-harness-capabilities.md),
a harness-agnostic matrix (subagents, cross-session messaging, worktrees
`.agents/worktrees`, workflows, channels). The worktree convention is
`.agents/worktrees`.

## References

- superpowers/subagent-driven-development: https://github.com/obra/superpowers/blob/main/skills/subagent-driven-development/SKILL.md
- herdr-orchestration (compozy/kb): https://github.com/compozy/kb/tree/main/.agents/skills/herdr-orchestration
- herdr agent guide: https://herdr.dev/agent-guide.md
- herdrm: https://github.com/missuo/herdrm
