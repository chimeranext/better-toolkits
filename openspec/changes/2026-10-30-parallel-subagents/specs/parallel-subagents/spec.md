# parallel-subagents — Delta spec

Change: `2026-10-30-parallel-subagents`

## ADDED Requirements

### Requirement: Harness detection and routing

`/parallel-subagents` SHALL detect the active harness and route to the matching
per-harness subagent skill.

#### Scenario: OpenCode harness

- **WHEN** the harness is OpenCode
- **THEN** the skill MUST route to `subagents-opencode`
- **AND** MUST use herdr for isolated worker contexts
- **AND** MUST dispatch each task with background execution

#### Scenario: Claude harness

- **WHEN** the harness is Claude Code
- **THEN** the skill MUST route to `subagents-claude`
- **AND** MUST use Claude primitives (`.claude/agents`, `ListAgents`/`SendMessage`, `--worktree`)

#### Scenario: Explicit override

- **WHEN** the operator provides an explicit harness argument
- **THEN** the skill MUST honor it over heuristic detection

### Requirement: Dependency graph and waves

The skill SHALL build a dependency graph and only parallelize independent tasks.

#### Scenario: Independent tasks run concurrently

- **WHEN** two tasks touch different files and share no state
- **THEN** they MUST be dispatched in the same parallel wave
- **AND** each MUST have its own isolated context

#### Scenario: Shared-file tasks are sequenced

- **WHEN** two tasks touch the same file or shared state
- **THEN** they MUST be scheduled in sequential waves
- **AND** a commit gate MUST run between waves so the next wave reads latest state

### Requirement: Worktree isolation

The skill SHALL isolate each task in its own worktree and branch.

#### Scenario: Per-task worktree

- **WHEN** a task is dispatched
- **THEN** it MUST run in a dedicated worktree (`.agents/worktrees/<slug>`) on its own branch
- **AND** broad staging (`git add -A`) MUST be blocked
- **AND** the baseline MUST be committed before dispatch

### Requirement: Background execution

Dispatches SHALL use background execution so the coordinator does not block.

#### Scenario: Coordinator not blocked

- **WHEN** a task is dispatched
- **THEN** dispatch MUST be background (the coordinator does not wait on it)
- **AND** completion MUST be delivered via notification
- **AND** the coordinator MUST continue coordinating other work meanwhile

### Requirement: Wave test gate

Between waves, tests SHALL be green before the next wave starts.

#### Scenario: Gate blocks on red

- **WHEN** a wave's tests fail
- **THEN** the next wave MUST NOT start until the failures are fixed and tests are green

### Requirement: Review gate per implementation

Each implementation SHALL be reviewed before the task is marked complete.

#### Scenario: Reviewer after implementer

- **WHEN** an implementer completes a task
- **THEN** a reviewer MUST check the implementation against the spec and diff
- **AND** if gaps are found, a fresh fix agent SHALL be dispatched with the gap report
- **AND** the task SHALL only be marked complete after review passes

### Requirement: Human integration decision

Finishing SHALL present a human integration decision via `/resolve-open-questions`; the skill SHALL never auto-merge.

#### Scenario: No auto-merge

- **WHEN** all tasks are verified
- **THEN** the skill MUST present the integration decision via `/resolve-open-questions` (structured ask batch with options — merge locally / push + PR / keep as-is — plus a recommendation)
- **AND** MUST NOT merge automatically
- **AND** MUST wait for the human's decision before integrating

### Requirement: /subagents-claude skill exists

`subagents-claude` SHALL exist as a peer of `subagents-opencode` for the Claude Code harness.

#### Scenario: Claude protocol present

- **WHEN** the Claude harness is used
- **THEN** `subagents-claude` MUST provide the controller+implementer+reviewer+ledger pattern using Claude primitives
- **AND** MUST document `.claude/agents/*.md`, cross-session messaging, and worktree isolation
