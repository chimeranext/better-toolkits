# make-no-mistakes

**Version: 1.33.0** · [CHANGELOG](./CHANGELOG.md) · [Marketplace](https://github.com/chimeranext/make-no-mistakes-toolkit)

The disciplined dev lifecycle — implement issues, review PRs, sync releases, test E2E, and manage sessions. One plugin to make no mistakes.

A Claude Code plugin by [Luis Andres Pena Castillo](https://github.com/lapc506).

## Install

```bash
# Add the marketplace (one-time)
claude plugin marketplace add ChimeraNext/make-no-mistakes-toolkit

# Install the plugin
claude plugin install make-no-mistakes
```

Or clone and install locally:

```bash
git clone https://github.com/chimeranext/make-no-mistakes-toolkit.git
claude plugin marketplace add ./make-no-mistakes-toolkit
claude plugin install make-no-mistakes
```

## Install (OpenCode)

```bash
npx @lapc506/make-no-mistakes install
```

### CLI Commands

| Command | Description |
|---------|-------------|
| `make-no-mistakes install` | Install to ~/.config/opencode/ |
| `make-no-mistakes update` | Refresh managed assets |
| `make-no-mistakes uninstall` | Remove managed files only |
| `make-no-mistakes doctor` | Health check |
| `make-no-mistakes install --dry-run` | Preview changes |
| `make-no-mistakes install --force` | Overwrite unmanaged conflicts |

## Start here: `/make-no-mistakes:domain-driven-advisor`

**If you only run one command from this plugin, run this one.**

```
/make-no-mistakes:domain-driven-advisor
```

The advisor is the **canonical entry point** for repo-health work. From its [SKILL.md](skills/domain-driven-advisor/SKILL.md):

> Guided entry point for repo health when you don't know which audit you need.
> Use when the user asks "which audit", "where do I start", wants to check
> "repo health", or mentions "domain driven" design. Inspects the repo, asks a
> few plain-language questions, recommends which audit(s) to run (or the full
> ordered sweep), runs them via the audit-engine, and finishes with a premortem
> on the remediation plan. **Best first command for a new repo.**

It routes you across the **six audit families** (all live as of 1.29.0):

| Family | Command | Detects |
|--------|---------|---------|
| `SCH` | [`/audit-schema-drift`](commands/audit-schema-drift.md) | 1NF violations + same column duplicated across tables |
| `CDC` | [`/audit-contract-drift`](commands/audit-contract-drift.md) | Producer↔consumer validation schemas that silently diverged |
| `DDD` | [`/audit-ddd`](commands/audit-ddd.md) | Cross-context imports, domain purity, ubiquitous-language drift |
| `ARC` | [`/audit-explicit-architecture`](commands/audit-explicit-architecture.md) | Hexagonal/Onion/Clean dependency-rule violations, CQRS separation |
| `STR` | [`/audit-strangler`](commands/audit-strangler.md) | Strangler-Fig migration health (façade, cutover, legacy retirement) |
| `ENF` | [`/audit-enforcement-hooks`](commands/audit-enforcement-hooks.md) | Cure-4 PreToolUse/PostToolUse coverage gaps that allow the other audits' drift |

After the audit(s), it runs a **premortem** on the aggregated remediation plan, so the plan you ship has already survived "it's 6 months later and this failed — why?". Full teaching section [below](#guided-repo-health-domain-driven-advisor).

## What's Inside

### Commands (30)

Deliberate actions you invoke explicitly.

| Command | Description |
|---------|-------------|
| [`/make-no-mistakes:implement <ISSUE-ID>`](commands/implement.md) | Disciplined execution of Linear issues — worktree isolation, all-reviewer loops, CI verification, clean merges |
| [`/make-no-mistakes:prioritize <pillar-slug>`](commands/prioritize.md) | MoSCoW + RICE-adapted applied to a pillar's Linear issues, traceable to its PIBER+IDCF sub-spike and the latest vision audit. Outputs priority report + description-footer per issue + snapshot comment on the sub-spike. Chain: `product-vision-audit → prioritize → spike-recommend → implement` |
| [`/make-no-mistakes:rebase <repo>`](commands/rebase.md) | Team release sync — rebase all branches, auto-merge ready PRs, health report |
| [`/make-no-mistakes:linear-projects-setup`](commands/linear-projects-setup.md) | Bootstrap Linear workspace with full label taxonomy, projects, and integrations |
| [`/make-no-mistakes:e2e-test-builder <source>`](commands/e2e-test-builder.md) | Generate a TestSprite-compatible `test-suite.json` from docs or PRDs |
| [`/make-no-mistakes:e2e-test-runner [filter]`](commands/e2e-test-runner.md) | Execute E2E tests from `test-suite.json` with runner selection and reporting |
| [`/make-no-mistakes:pentest-runner <phase>`](commands/pentest-runner.md) | Automated pentesting following Cyber Kill Chain + OWASP methodology |
| [`/make-no-mistakes:goodmorning`](commands/goodmorning.md) | Bootstrap your session from previous day's handoff files |
| [`/make-no-mistakes:goodnight [label]`](commands/goodnight.md) | Save full session context as a handoff file for tomorrow |
| [`/make-no-mistakes:pending-left`](commands/pending-left.md) | Track what's left unfinished across git, Linear, and session context |
| [`/make-no-mistakes:summarize`](commands/summarize.md) | Structured recap of everything done in the current session |
| [`/make-no-mistakes:daily-standup-add-completed [text]`](commands/daily-standup-add-completed.md) | Append completed work items to today's standup file (auto-detects from PRs/issues) |
| [`/make-no-mistakes:daily-standup-post-slack [draft]`](commands/daily-standup-post-slack.md) | Compose and post today's standup to the configured Slack channel |
| [`/make-no-mistakes:handover <@person> [#channel] [draft]`](commands/handover.md) | Hand a body of work (PRs, issues, an incident + root cause, a Draft someone must finish) to a specific teammate for review/decision — house Slack style, verify-don't-remember |
| [`/make-no-mistakes:remind <topic>`](commands/remind.md) | Recall past decisions, instructions, or feedback from memory and project context |
| [`/make-no-mistakes:takeover-pr <repo> [pr#]`](commands/takeover-pr.md) | Pick a random open PR from a teammate, check it out, review it, and take over the work |
| [`/make-no-mistakes:ready-to-review-mergeable <ISSUE-123 ...> [--confidence 4.0]`](commands/ready-to-review-mergeable.md) | Drive tracker issues to **bot-approved, mergeable** PRs via `/implement` + a confidence-gated reviewer loop (Stop-hook enforced), or with no issue IDs leave the current branch PR-ready — Diátaxis `status: review`, fix CI, push; **never merge** |
| [`/make-no-mistakes:hygiene-hooks-setup [audit|install|verify]`](commands/hygiene-hooks-setup.md) | Audit, install, and verify tracker/PR hygiene hooks — detects orphaned hook configs (scripts on disk, empty `hooks` field), enables the opt-in Linear create-hygiene gate (full triage or exit 2), and proves each hook with a synthetic-payload suite |
| [`/make-no-mistakes:secret-input`](commands/secret-input.md) | Stage a secret/password via OS-native GUI dialog (Linux zenity/kdialog/pinentry, macOS osascript, Windows Get-Credential). The value never appears in the conversation log or terminal history. Cross-platform via `.sh` (Linux/macOS/WSL/Git Bash) + `.ps1` (native Windows) |
| [`/make-no-mistakes:secret-use ENVVAR -- <cmd>`](commands/secret-use.md) | Run one command with the staged secret loaded as an environment variable. Env var lives only inside the consuming process and is unset on completion |
| [`/make-no-mistakes:secret-clear`](commands/secret-clear.md) | Wipe the staged secret (shred/rm-P/random-overwrite per OS). Idempotent — safe to call when no secret is staged. Always run when done with credentials |
| [`/make-no-mistakes:audit [path]`](commands/audit.md) | **Meta-dispatcher** — runs the full repo-health sweep (all six families `SCH→CDC→DDD→ARC→STR→ENF` via `audit-engine`) and delegates the component layer to `atomic-design-toolkit` when installed; aggregates one report + emits cure-scaffold proposals per `schemas/repo-health-rules.schema.json` |
| [`/make-no-mistakes:domain-driven-advisor`](commands/domain-driven-advisor.md) | **Guided entry point** — inspects the repo, recommends which audit(s) to run (or the full sequence), runs them, and finishes with a premortem. Start here for repo health. |
| [`/make-no-mistakes:audit-schema-drift`](commands/audit-schema-drift.md) | Audit for schema drift — 1NF violations + the same logical column duplicated across tables without a single source of truth |
| [`/make-no-mistakes:audit-contract-drift`](commands/audit-contract-drift.md) | Audit consumer-driven contract drift — producer↔consumer validation schemas that have silently diverged |
| [`/make-no-mistakes:audit-ddd`](commands/audit-ddd.md) | Audit DDD bounded-context boundaries — cross-context imports, domain purity, ubiquitous-language drift |
| [`/make-no-mistakes:audit-explicit-architecture`](commands/audit-explicit-architecture.md) | Audit Explicit Architecture (Graça) — Hexagonal/Onion/Clean dependency rule, ports & adapters, CQRS separation |
| [`/make-no-mistakes:audit-strangler`](commands/audit-strangler.md) | Audit Strangler-Fig migration health — façade, incremental cutover vs big-bang, coexistence, legacy retirement |
| [`/make-no-mistakes:audit-enforcement-hooks`](commands/audit-enforcement-hooks.md) | Audit Cure-4 enforcement-hook coverage — are the PreToolUse/PostToolUse hooks that prevent the other audits' drift actually installed? |
| [`/make-no-mistakes:premortem <plan>`](commands/premortem.md) | Stress-test a plan/launch/decision by imagining it already failed 6 months out, then work backward to expose blind spots; outputs an HTML report + Markdown transcript |
| [`/make-no-mistakes:atomic-rules-init`](commands/atomic-rules-init.md) | Scaffold a `.atomic-design-rules.json` at the repo root so the atomic-design hooks (PreToolUse ownership enforcement + PostToolUse drift telemetry) start enforcing. No-op if the file already exists |
| [`/make-no-mistakes:e2e-test-preview [path]`](commands/e2e-test-preview.md) | Launch a Qt-based visual previewer for `test-suite.json` — interactive table with filtering, detail pane, and CSV export (auto-installs PySide6) |
| [`/make-no-mistakes:gemini-code-review [target]`](commands/gemini-code-review.md) | Cheap first-pass code review (one-shot via liteLLM) on a parametrizable model — Gemini 3.5 Flash by default; supports `--model` and `--adversarial`, curated against the repo's CLAUDE.md |

### Skills (10)

Auto-activate by context — you don't need to remember the command name.

| Skill | Triggers when you... |
|-------|---------------------|
| [`implement-advisor`](skills/implement-advisor/SKILL.md) | Want to work on a Linear issue, implement a feature, or fix a bug (suggests `/make-no-mistakes:implement`) |
| [`spec-recommend`](skills/spec-recommend/SKILL.md) | Discuss specs, SRDs, implementation briefs, or say "what should I build" |
| [`spike-recommend`](skills/spike-recommend/SKILL.md) | Paste a Linear issue URL or ask to analyze an issue |
| [`review-open-prs`](skills/review-open-prs/SKILL.md) | Ask about open PRs, merge readiness, or Greptile scores |
| [`review-active-issues`](skills/review-active-issues/SKILL.md) | Ask about your Linear issues, backlog, or issue status |
| [`rebase-advisor`](skills/rebase-advisor/SKILL.md) | Mention needing to sync branches after a release (suggests `/make-no-mistakes:rebase`) |
| [`audit-engine`](skills/audit-engine/SKILL.md) | Run any of the six repo-health audits (schema-drift, contract-drift, ddd, explicit-architecture, strangler, enforcement-hooks). Hybrid LLM-first detection + deterministic verification + cure-mapping |
| [`domain-driven-advisor`](skills/domain-driven-advisor/SKILL.md) | Ask "which audit do I need?" / "where do I start with repo health?" — routes you to the right audit(s) and runs a premortem |
| [`premortem`](skills/premortem/SKILL.md) | Say "premortem this", "what could kill this", "stress test this plan", "what am I missing", or "find the blind spots" on a plan/launch/decision |
| [`prioritize`](skills/prioritize/SKILL.md) | Ask to "prioritize issues", "rank the backlog", "apply MoSCoW", or "RICE scoring" for a product pillar (suggests `/make-no-mistakes:prioritize`) |

Skills can also be invoked explicitly: `/make-no-mistakes:spec-recommend T0-4`

### Agents (2)

Specialized subagents dispatched by commands/skills for heavy work.

| Agent | Model | Dispatched by |
|-------|-------|---------------|
| `execution-lead` | Opus | `/make-no-mistakes:implement` — runs the full protocol in its own context |
| `pr-reviewer` | Sonnet | `review-open-prs` skill — cross-references PRs with Linear and Greptile |

## Guided repo health: `/domain-driven-advisor`

New to the audit family, or not sure where to start? Run **one** command and let
it guide you. The advisor is the front door to the whole audit-engine family.

### When to use it

- You inherited a repo and want to know what's structurally wrong.
- You suspect drift (duplicated columns, FE/BE validation mismatches, tangled
  modules, a stalled monolith migration) but don't know which audit applies.
- You want a remediation plan that's already been stress-tested.

### What it does (4 steps)

1. **Inspects the repo** — detects signals (a shared database, FE+backend
   validation, a monolith mid-migration, layered architecture, cross-module
   imports).
2. **Asks a few plain-language questions** — no jargon required. Each answer
   maps to one of the audits.
3. **Recommends and runs the audit(s)** — just the ones you need, or the full
   ordered sweep `schema → contract → DDD → architecture → strangler →
   enforcement` if you're unsure.
4. **Runs a premortem** — on the aggregated remediation plan, so you ship a plan
   that already survived "it's 6 months later and this failed — why?".

### Quick start

```
/make-no-mistakes:domain-driven-advisor
```

Point it at a subdirectory if you only want part of the repo:

```
/make-no-mistakes:domain-driven-advisor src/payments
```

### Example session

```
You:  /make-no-mistakes:domain-driven-advisor
Tool: Scanning… found supabase/migrations and FE+edge validation.
      Q1: ¿Varios equipos escriben en la misma base de datos? > yes
      Q2: ¿El frontend y el backend validan los mismos datos por separado? > yes
      → Recommended: /audit-schema-drift + /audit-contract-drift, then enforcement.
      Tip: enable agent teams for parallel audits — add
           "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1" to ~/.claude/settings.json
      Run them now? > yes
      … findings written to docs/repo-health/… + premortem report on ~/Escritorio.
```

### What it produces

For each audit it runs: a findings doc in `docs/repo-health/`, an OpenSpec
remediation change, Bilingual-Layer Linear issues, and 4-cure scaffold
proposals — plus a single premortem report (HTML + transcript) over the combined
plan.

### Faster with agent teams

The audits fan out one verifier per finding, so they're much faster with a
parallel agent team. The advisor will recommend enabling
`"CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"` in `~/.claude/settings.json`
(it shows the exact one-line change; it never edits your settings without
consent). If you decline, it falls back to subagent-driven-development on the
latest Opus rather than a slow sequential crawl.

### Run a single audit directly

If you already know what you need, skip the advisor:

```
/make-no-mistakes:audit-schema-drift
```

## Configuration

The plugin reads `linear-setup.json` at your repo root for project-specific settings:

```json
{
  "team": {
    "key": "ALT",
    "url": "https://linear.app/your-team"
  },
  "git": {
    "baseBranch": "main",
    "branchPattern": "{type}/{issueId}-{description}"
  },
  "github": {
    "org": "your-org"
  },
  "defaults": {
    "greptileReview": true,
    "squashMerge": true,
    "slackNotify": true
  },
  "slack": {
    "statusChannel": "C09BD6W95GC"
  }
}
```

If no `linear-setup.json` exists, the plugin auto-detects settings from your environment (GitHub org from current repo, Linear team from MCP, etc.).

## Verify Installation

**Claude Code:**

```bash
claude plugin list
# should show "make-no-mistakes"
```

Or run `/plugin` inside Claude Code to see it in the plugin manager. Then invoke any command to confirm: `/make-no-mistakes:summarize`

**OpenCode:**

```bash
make-no-mistakes doctor
```

## Requirements

- **Claude Code** — the CLI or IDE extension
- **GitHub CLI** (`gh`) — authenticated (`gh auth login`)
- **Linear MCP** — configured in Claude Code for issue tracking (add via Claude Code settings > MCP servers)
- **Slack MCP** — optional, for standup posting and Slack reporting. See `slack-config.example.json` at the repo root for channel configuration

## Product Owner Extension (SPOPC)

make-no-mistakes is expanding from a **developer lifecycle toolkit** into a **full product ownership layer**, grounded in the [Scrum Product Owner Professional Certificate (SPOPC)](https://certiprof.com/pages/scrum-product-owner-professional-certificate-spopc) methodology by CertiProf.

The author holds three CertiProf certifications that inform this extension:

- **Scrum Product Owner Professional (SPOPC)** — backlog management, stakeholder communication, value maximization
- **User Stories Foundation (USFC)** — story writing, acceptance criteria, splitting strategies
- **Scrum Foundation Professional (SFPC)** — Scrum framework, ceremonies, roles, artifacts

### Why not a separate plugin?

[gstack](https://github.com/garrytan/gstack) proved that a single toolkit can serve multiple roles — CEO, designer, engineer, QA — all through slash commands. Product ownership is part of the development lifecycle, not separate from it. make-no-mistakes already has the plumbing: Linear issue tracking, Slack messaging, daily standups, spike recommendations, and session management. The PO skills are natural extensions.

### Planned PO Skills and Commands

| Component | Type | Description |
|-----------|------|-------------|
| `backlog-groom` | Skill | Read SOPs + Linear project state, suggest prioritization, flag stale issues |
| `sprint-review` | Command | Generate sprint metrics report — velocity, completion %, carryover items |
| `vertical-health` | Command | Cross-reference product analytics + Linear velocity + GitHub activity for a product area |
| `po-standup` | Command | PO-perspective standup: blockers, decisions needed, stakeholder updates |
| `vertical-report` | Command | Weekly summary posted to the product area's Slack channel for stakeholders |
| `product-discovery` | Command | GTM Discovery Roadmapping — ingest Linear issues, cluster into opportunities, prioritize with GTM Score matrix, output a Now/Next/Later roadmap. Uses [Double Diamond](https://www.productboard.com/glossary/double-diamond/) framework (Discover, Define, Develop, Deliver) and a composite GTM Score (Market Fit 30% + Business Impact 25% + GTM Readiness 20% + Effort 15% + Risk 10%). Integrates with Linear MCP for issue ingestion and optionally with [Productboard MCP](https://github.com/Enreign/productboard-mcp) for opportunity/feature export |

### Two-Layer Architecture

SOPs (Standard Operating Procedures) define the **what** and **why** per product area — these live in your own documentation repo, not here. make-no-mistakes reads them at runtime to apply context-specific policies.

```
your-docs-repo/sops/{product-area}/
├── README.md              # Vision, KPIs, success metrics
├── backlog-policy.md      # Prioritization criteria, Definition of Done
├── release-checklist.md   # Pre-release gates specific to this area
└── escalation-flow.md     # When and how to escalate to stakeholders
```

The plugin consumes these SOPs to give context-aware recommendations. Each Product Owner creates SOPs for their area using a shared template.

### SPOPC-to-Tooling Mapping

| SPOPC Concept | make-no-mistakes Implementation |
|---------------|--------------------------------|
| Product Backlog management | `backlog-groom` — reads Linear + SOP prioritization rules |
| Sprint Review | `sprint-review` — auto-generated metrics from Linear + GitHub |
| Stakeholder communication | `vertical-report` — weekly Slack summary to stakeholders |
| Definition of Done | SOP at `sops/{product-area}/backlog-policy.md` |
| ROI / Value maximization | `vertical-health` — PostHog analytics + Linear velocity |
| User Stories | `spike-recommend` + `spec-recommend` (existing, USFC-informed) |
| Sprint Planning | `review-active-issues` (existing) + `backlog-groom` (planned) |
| Product Discovery | `product-discovery` — Double Diamond + GTM Score matrix via Linear + Productboard MCP |

> **Status:** The PO extension is in design phase. The existing developer lifecycle commands are stable and production-ready. PO skills will be added incrementally without breaking existing functionality.

## The Name

"Make no mistakes" started as an inside joke — a mantra for disciplined execution. Like the Ralph loop, it's a reminder that process isn't optional when shipping matters.

## Architecture

```
make-no-mistakes-toolkit/
├── .claude-plugin/     # Claude Code plugin metadata
│   ├── plugin.json
│   └── marketplace.json
├── src/                # OpenCode npm distribution (TypeScript CLI)
│   ├── cli.ts
│   ├── index.ts
│   └── lib/
├── commands/           # 34 explicit commands
├── agents/             # 2 specialized subagents
├── skills/             # 10 auto-activating skills
│   └── */SKILL.md
├── hooks/              # Manifest-driven PreToolUse + PostToolUse hooks (v1.5.0+)
│   ├── hooks.json      # Claude Code wiring (thin)
│   ├── pre-bash.sh     # Bash dispatcher
│   ├── pre-edit.sh     # Edit/Write/MultiEdit dispatcher
│   ├── post-slack.sh   # Slack message dispatcher (warn-only)
│   ├── test-hooks.sh   # Parametrized test runner
│   ├── lib/            # Generic helpers (parse-input, eval-rule)
│   └── rules/
│       ├── rules.yaml  # Rules SSoT — humans edit
│       ├── rules.json  # Build artifact — runtime reads
│       └── README.md   # Contributor guide
├── scripts/            # Shared bash + node utilities
│   └── build-rules.mjs # rules.yaml -> rules.json compiler
├── package.json
└── README.md
```

**Design principle:** Commands for destructive/token-intensive actions (you decide when). Skills for read-only analysis (context-aware, auto-activate). Agents for heavy orchestration (own context window). Hooks for deterministic guardrails on every tool call (no human in the loop).

## Hooks (v1.5.0+)

When this plugin is enabled, every tool call you make in any repo runs through
the manifest-driven hooks in `hooks/rules/rules.yaml`. The Tier 1 ruleset
ships 10 rules:

**PreToolUse on `Bash` (block by default):**
- `ssh-db-mutation` — blocks `gcloud compute ssh ... --command="...php -r/mysql/set_config..."` (Moodle-flavoured SSH payloads)
- `inline-db-mutation-mysql` / `-psql` / `-sqlite` / `-mongo` / `-redis` / `-gcloud-sql` — blocks inline DB mutations across any CLI (`mysql -e "UPDATE..."`, `psql -c "INSERT..."`, `sqlite3 path "DROP..."`, `mongo --eval "db.x.update(...)"`, `redis-cli SET/DEL/FLUSHALL`, `gcloud sql import/export`). Forces use of a versioned script under `scripts/` or `bin/`. SELECT-only reads are never blocked. Per-rule bypass via `# hook-bypass: db-mutation-rule`; per-repo opt-out via `touch .no-make-no-mistakes-db-mutation` at the root (memory: `feedback_scripts_not_db.md`).
- `prod-ops-no-approval` — blocks `--project=*-prod` operations without explicit acknowledgement
- `destructive-db-ops` — blocks `supabase db reset|push|repair` and inline `DROP/TRUNCATE/DELETE FROM`
- `manual-edge-fn-deploy` — blocks `supabase functions deploy` (forces CI-only deploys)
- `gcloud-missing-project` — warns when a `gcloud` subcommand is missing `--project=`

**PreToolUse on `Edit | Write | MultiEdit` (block):**
- `minified-build-output` — blocks writing minified content to `amd/build/*.min.js` or `dist/*.min.{js,css}`
- `secrets-hardcoded` — blocks hardcoded `password|secret|token|api_key|...` patterns in source files (env.example/test/spec/README/fixtures/mocks paths exempted)

**PostToolUse on Slack messages (warn-only):**
- `slack-unicode-bullets` — warns when `•◦▪▫` bullets are used (use `-` instead)
- `slack-tables-no-codeblock` — warns when markdown tables ship outside ` ``` ` fences (Slack mrkdwn doesn't render bare tables)
- `slack-spanish-tildes` — warns on common Spanish words missing tildes (`migracion` → `migración`, etc.)

### Bypassing a rule

Each blocking rule has a `bypass_marker`. Add the literal string
`// hook-bypass: <marker>` (or `# hook-bypass: <marker>`) anywhere in the
command or content to acknowledge the rule and proceed:

```bash
# Bypass markers shipped in Tier 1:
# // hook-bypass: ssh-db-rule
# // hook-bypass: prod-ops
# // hook-bypass: db-destructive
# // hook-bypass: edge-fn-manual
# // hook-bypass: minified-build
# // hook-bypass: secret-leak

# Bypass marker shipped in v1.17.0 inline-db-mutation family:
# // hook-bypass: db-mutation-rule
```

Some rules (e.g., the v1.17.0 inline-DB-mutation family) also support a
per-repo escape hatch: drop a sentinel file at the repo root and the rule
becomes a no-op in that repo. The current sentinel filenames are:

- `.no-make-no-mistakes-db-mutation` — disables all six
  `inline-db-mutation-*` rules in the repo

Bypasses are explicit acknowledgements — they sit inside the command/content
itself, not as silent flags.

### Adding your own rules

Edit `hooks/rules/rules.yaml`, run `npm run build-rules`, run
`npm run test-hooks` to verify, and commit. See `hooks/rules/README.md` for
the schema and Tier 2 decomposition techniques.

### Disabling all hooks

Remove the plugin from `~/.claude/settings.json` `enabledPlugins`, or set
`CLAUDE_DISABLE_PLUGIN_HOOKS=1` in your shell.

## Bilingual Format

Implementation briefs produced by `spec-recommend` and `spike-recommend` follow the **Bilingual Format** — a two-layer structure:

- **Human Layer** — User story, background, analogy, pitfalls (readable by non-engineers)
- **Agent Layer** — Objective, context files, acceptance criteria, verification commands (executable by AI)

See `skills/spec-recommend/references/bilingual-format.md` for the full template.

## License

[Business Source License 1.1](./LICENSE) — you may use, modify, and redistribute for non-competitive purposes. Converts to Non-Profit OSL 3.0 after 5 years.