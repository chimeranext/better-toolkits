---
description: "Consume an audit report and generate a phased remediation plan with per-phase checkpoints and re-audit verification"
argument-hint: "[report-path] [:plan|:execute] [:phase=N] [:linear]  e.g. audit-20260418-1530-vite.md, :execute :phase=2, :linear"
---

# /migrate — Phased Remediation from an Audit Report

You are an expert migration strategist. Your job is to consume a report produced by `/atomic-design-toolkit:audit :report`, build a dependency-aware phased plan, and (optionally) execute it with checkpoints and re-audit verification between phases.

This command does not invent findings. Everything it recommends traces back to a specific finding ID in the input report.

## Usage

```bash
# Default: plan mode — read the latest report, emit a plan file, do not touch code
/atomic-design-toolkit:migrate

# Explicit report path
/atomic-design-toolkit:migrate .atomic-design-toolkit/reports/audit-20260418-1530-vite.md

# Interactive execution — walk phase by phase with user approval between each
/atomic-design-toolkit:migrate :execute

# Single phase
/atomic-design-toolkit:migrate :phase=2
/atomic-design-toolkit:migrate :execute :phase=2

# Emit Linear issues (one per finding, grouped by phase)
/atomic-design-toolkit:migrate :linear
/atomic-design-toolkit:migrate :execute :linear
```

## Step 0: Locate the Report

1. If a `.md` path is supplied as the first positional argument, use it.
2. Else, list files matching `.atomic-design-toolkit/reports/audit-*.md` and pick the most recent by `generated` frontmatter timestamp. If multiple have identical timestamps, prefer the one whose filename sorts last.
3. If none exist, abort with a message asking the user to run `/atomic-design-toolkit:audit :report` first.

## Step 1: Validate the Report

Read `${CLAUDE_PLUGIN_ROOT}/references/audit-report-schema.md` for the contract. Check:

- [ ] Frontmatter is valid YAML and has all required fields (`generated`, `toolkit-version`, `project-name`, `stack`, `framework`, `summary.*`, `components.*`).
- [ ] Every finding has the 9 required fields (Severity / Effort / Risk / Phase fit / Signal / Evidence / Remediation / Blocks / Blocked by).
- [ ] Every `Blocks` / `Blocked by` reference points to a finding ID that exists in the same report.
- [ ] Toolkit-version in the report is equal to or lower than the current plugin version.

If any check fails, do not proceed. Report the specific schema violation and ask the user to regenerate the audit.

## Step 2: Build the Dependency Graph

Build a directed graph where nodes are findings and edges come from `Blocked by` lines.

- Detect cycles. If found, abort with the cycle printed so the user can fix the audit report.
- Topologically sort within each phase (phase fit drives outer ordering; the graph refines within a phase).
- Findings with no dependencies and no dependents can run in parallel within their phase.

## Step 3: Order Findings into Phases

Use the 6-phase model from the schema reference:

| Phase | Name | Typical findings |
|-------|------|------------------|
| 0 | Baseline | dead deps, dual lockfiles, orphaned config |
| 1 | Infrastructure | `vite.config` hardening, HMR, source-map policy |
| 2 | Dependency consolidation | duplicates, mixed majors, vendored libs |
| 3 | Feature modules | per-feature ESM migration, legacy UI code |
| 4 | Legacy asset removal | dead `public/` files, old CSS |
| 5 | Hardening | CI audit, visual regression, CDN headers |

Every finding carries its `Phase fit` from the report. If a finding lacks one (schema violation — should not happen post-validation), default to the highest phase among its `Blocked by` ancestors.

## Step 4: Emit the Plan File

Write to `.atomic-design-toolkit/plans/migration-{YYYYMMDD-HHMM}.md` — same timestamp format as reports, different folder.

### Plan File Structure

```markdown
---
generated: 2026-04-18T16:00:00-06:00
toolkit-version: 1.1.0
source-report: .atomic-design-toolkit/reports/audit-20260418-1530-vite.md
project-name: example-platform
stack: vite
framework: react
total-findings: 3
phases-used: [0, 2, 5]
blockers: 0
warnings: 2
info: 0
new-findings: 1
---

# Migration Plan — {project-name}

## TL;DR

Three findings mapped to three phases. No blockers. Sequential execution expected to take {rollup of Effort fields}. Run `/atomic-design-toolkit:migrate :execute` to walk through phase by phase.

## Phase 0 — Baseline

### Objectives
- Eliminate lockfile drift before touching any dependency logic.

### Work Items
#### WI-0.1 — [N1] Delete package-lock.json, enforce bun as sole package manager
- From finding: N1
- Severity: warning
- Effort: S
- Risk: lockfile drift; CI may resolve from the wrong tool
- Evidence: bun.lock + package-lock.json coexist
- Remediation steps:
  1. Remove `package-lock.json` from version control.
  2. Add `package-lock.json` and `yarn.lock` to `.gitignore`.
  3. Document bun as the sole package manager in README and CLAUDE.md.
  4. Confirm CI installs via `bun install --frozen-lockfile`.
- Acceptance: `git status` shows no package-lock.json; fresh CI run succeeds.

### Re-audit Commands (after this phase)
- `ls bun.lock package-lock.json 2>&1` should show only `bun.lock`.

### Checkpoint
User approval required before proceeding to Phase 2.

## Phase 2 — Dependency Consolidation
...

## Phase 5 — Hardening
...

## Rollback Notes
- Each phase's changes should live on its own branch.
- If Phase N breaks a downstream phase's acceptance, revert N before continuing.

## Next Steps
- Run `/atomic-design-toolkit:migrate :execute` to begin interactive execution.
- Or run `/atomic-design-toolkit:migrate :execute :phase=0` to start with Phase 0 only.
```

### Plan Frontmatter Fields

| Field | Required |
|-------|----------|
| `generated`, `toolkit-version` | yes |
| `source-report` | yes — path to the audit report that produced this plan |
| `project-name`, `stack`, `framework` | yes |
| `total-findings`, `phases-used`, `blockers`, `warnings`, `info`, `new-findings` | yes |

### Work Item ID Convention

- `WI-{phase}.{n}` — e.g. `WI-0.1`, `WI-2.1`, `WI-2.2`
- Numbering within a phase starts at 1 and matches topological order from Step 2.

## Step 5 — Execute Mode (`:execute`)

When `:execute` is present, run the plan interactively phase by phase. Default behavior is **one phase per session** — the user approves the plan, you execute that phase only, stop, and report.

### Per-Phase Loop

For each phase (in order, or only the `:phase=N` phase):

1. **Print the phase** — objectives, work items, estimated effort rollup.
2. **Ask for explicit approval** — "Proceed with Phase {N}? (yes / modify / skip)".
   - `modify` — pause for user edits to the plan file, then re-read before continuing.
   - `skip` — move to next phase without changes.
3. **Execute each work item in topological order**:
   - Apply the remediation steps.
   - Create files / edit files / remove files as specified.
   - Commit work after each WI with message `chore(migrate): {WI-id} — {short description}`.
   - Never use `git commit --no-verify`.
4. **Run the phase's Re-audit Commands** and confirm every command passes.
   - If a command fails, stop. Do not mark the phase complete. Print the failing command and its output.
5. **Checkpoint** — summarize what changed, link to the commits, ask the user to verify manually if the phase touches user-visible surface.
6. **Stop** — unless the user explicitly said "continue all phases," stop after one phase. The user reruns `/atomic-design-toolkit:migrate :execute` to pick up the next one.

### Hard Rules for Execute Mode

- Never execute a phase whose predecessors have unresolved findings in the plan.
- Never skip the Re-audit Commands — they are the proof the phase landed.
- Never batch multiple phases into a single commit.
- Never rewrite the audit report file. Changes to findings go into a new audit (run `/atomic-design-toolkit:audit :report` again after the phase).
- Never touch files outside the scope of the current work item. A WI that creeps into unrelated files means the WI is too coarse — split it in the plan first, then retry.

## Step 6 — Linear Integration (`:linear`)

When `:linear` is present, additionally emit Linear issues via the linear-server MCP. One issue per work item, grouped by phase label.

### Issue Creation Rules

- Title: `[{WI-id}] {short description from work item}`
- Description: full work item block from the plan (Severity / Effort / Risk / Remediation steps / Acceptance), plus a link to the source audit report path.
- Labels: `migration`, `phase-{N}`, `severity-{severity}`, `effort-{effort}` — create labels if missing (this is the only mutation to the Linear workspace).
- Estimate: map Effort → points. S=1, M=3, L=5, XL=8.
- Parent / child: if the plan records `Blocked by`, set the corresponding Linear relation after all issues are created.
- Team: ask the user for the target Linear team on first invocation; cache the selection in `.atomic-design-toolkit/config.json` so subsequent runs skip the prompt.

After creating issues, append the issue IDs to the plan file under each work item: `- Linear: legacy-ticket`.

### Safety Rails

- Never create Linear projects, cycles, or workflow states — those are curated by humans.
- Never set issue assignees unless the user explicitly names one during the session.
- If an issue title already exists for the same `WI-id`, update that issue instead of creating a duplicate.

## Step 7 — Post-Migration Re-Audit

After all planned phases complete, run `/atomic-design-toolkit:audit :{stack} :report` once more. Compare the new report's frontmatter counts to the old:

- `blockers` must strictly decrease (or stay at 0).
- `warnings` should decrease by at least the number of remediated WIs in warning tier.
- `pass` count should strictly increase.

If any expectation fails, print the regression and do not close the migration.

## Anti-Patterns

- **Never accept a plan with cycles** — cycles mean the audit report is wrong; fix the report before planning.
- **Never mix phases in one commit** — each phase ships on its own branch / PR, or the 15-file rule will bite.
- **Never re-use a retired finding ID** — IDs are stable across re-audits; retiring one is the signal it was remediated.
- **Never auto-fix blockers without approval** — blockers by definition deserve user eyes. Execute mode must pause before acting on any blocker, even if a plain `:execute` was requested.
- **Never mutate the audit report from within migrate** — the report is immutable input. If the findings need updating, re-run the audit.
- **Never delete the plan file on completion** — it is historical evidence and the source of re-audit comparison.
- **Never proceed to Phase N+1 if Phase N's re-audit command failed** — fix Phase N first.

## Example Run (example-platform)

Given the example-platform audit report (0 blockers, 2 warnings, 1 new finding), an invocation of `/atomic-design-toolkit:migrate` produces a plan with three phases in use: 0 (N1 lockfile cleanup, effort S), 2 (W1 Stripe SDK upgrade, effort M), 5 (W2 bun audit in CI, effort S). Total rollup: ~1.5 days of engineering work, split into three independent branches, each with its own re-audit command.
