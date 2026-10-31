---
description: "Better mode — switch OpenCode to the 'Better' agent profile (BDD · Jidoka · No-Workarounds · dogfood). Installs/verifies .opencode/agents/better.md and tells you to cycle with shift+tab. Enables MCP wiring (better-toolkits ViteMCP ↔ external MCP servers). Startup-agnostic."
argument-hint: ""
priority: 90
---
# /better-mode

Enable the **Better** agent profile for OpenCode — a disciplined, verification-first
profile inspired by poteto-mode, tuned for better-toolkits.

## What it does

1. Ensures `.opencode/agents/better.md` exists (the agent profile). If missing, write
   it (see the source in this repo) and tell the user to re-open the session.
2. Instructs the user to cycle to the Better agent with the OpenCode keybinding:
   - **shift+tab** cycles the active agent (models-and-agents keybind). Tab-cycles
     again to come back.
3. Declares MCP so the harness can talk to external servers:
   - better-toolkits **ViteMCP** servers = consumer side (`shared/hooks/dogfood/`,
     `shared/mcp/*`).
   - external **MCP** servers = providers (any project's own MCP server, e.g. a
     Rust `rmcp` server or any third-party server).
   - The agent prefers the harness client (`shared/hooks/dogfood/dogfood-run.sh`) to
     drive verification.

## The profile's discipline

- **BDD over TDD** — describe behavior in natural language; assert with readable matchers.
- **Jidoka** — stop on any anomaly; never "see if the rest works".
- **No-Workarounds** — a suppressed signal is a failure; fix the source.
- **Prove it works** — verify against the real artifact with real config; use `/dogfood`
  as the proof gate and render a Pele statechart (blueprint) as evidence.
- **Sources**: `/dogfood`'s gates come from `assurance-toolkit/references/testing/e2e-protocol.md`
  and its assertion translation comes from `conventions/matcher-contract.md`. You do not need
  to remember those paths — `/dogfood` owns them.

## Full sequence (through /ready-to-review-mergeable)

Generalized for any startup; the tracker is an opinionated best-option (Linear is the
recommended default, but ClickUp, Jira, or GitHub Issues are acceptable substitutes —
swap the tracker names in the steps below). `/dogfood` is the single verification gate;
apprentices run only `/dogfood` (not the e2e builder/runner chain).

```mermaid
flowchart LR
    A[Issue / OpenSpec change] --> B[/opsx:propose]
    B --> C[proposal + design + tasks]
    C --> D[/opsx:apply]
    D --> D2[/make-no-mistakes:implement/]
    D2 --> E[código + tests]
    E --> F[/dogfood/]
    F -- pass --> K[/ready-to-review-mergeable/]
    F -- Jidoka / No-Workarounds fail --> H[fix + re-run]
    H --> F
    K --> L[review humano]
    L --> M{approve?}
    M -- no --> H
    M -- yes --> N[merge]
    N --> O[archive / specs sync]
```

Steps: propose → apply (plan) → implement (disciplina) → dogfood (gate único) →
ready-to-review-mergeable → human review → merge → archive. `/opsx:apply` reads the
change artifacts and generates tasks; `/make-no-mistakes:implement` executes them with
discipline (worktree, verification, CI) and produces the code + tests. `/dogfood`
internally covers BDD assertions (via `matcher-contract.md`) and the Jidoka/No-Workarounds
gates (via `e2e-protocol.md`) — no separate e2e builder/runner step is required. The
tracker (Linear or substitute) is updated at each handoff; every mutating gate is HITL.

## Verify

Run `/dogfood` with a real command, real config, and `--check` for the Then-assertion.
Confirm Jidoka and No-Workarounds pass, and that `diagram.svg` (Pele, blueprint) is produced.

## Notes

- The profile lives at `.opencode/agents/better.md` (project-scoped).
- The keybinding is a UI action (shift+tab); if it's not bound in your setup, bind
  "cycle agent" in OpenCode keybinds.
- The agent uses the configured model; it does not change the selected model.
