---
description: "Better mode — switch OpenCode to the 'Better' agent profile (BDD · Jidoka · No-Workarounds · dogfood). Installs/verifies shared/bootstrap/agents/better.md and tells you to cycle with shift+tab. Enables MCP wiring (better-toolkits ViteMCP ↔ external MCP servers). Startup-agnostic."
argument-hint: ""
priority: 90
---
# /better-mode

Enable the **Better** agent profile for OpenCode — a disciplined, verification-first
profile inspired by poteto-mode, tuned for better-toolkits.

## What it does

1. Ensures the canonical profile exists at `shared/bootstrap/agents/better.md` in this repo
   (the single source of truth).
2. Syncs that canonical file to `~/.config/opencode/agents/better.md` (the runtime
   copy OpenCode loads), overwriting it.
3. Instructs the user to cycle to the Better agent with the OpenCode keybinding:
   - **shift+tab** cycles the active agent (models-and-agents keybind). Tab-cycles
     again to come back.
4. Declares MCP so the harness can talk to external servers:
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
- **Verification chain** — *ishikawa analiza, verify-evidence prueba, evidence-explicit-attribution formatea.* When a root cause or countermeasure depends on a falsifiable claim, route: `/ishikawa` analyzes, `/verify-evidence` runs the real tool (Graphify / Open Ontologies / Specula) and returns a verdict, `/evidence-explicit-attribution` formats the evidence chain (Genchi Genbutsu: observed vs inferred). Never assert an unverified claim as fact.

## Full sequence (through /ready-to-review-mergeable)

Generalized for any startup; the tracker is an opinionated best-option (Linear is the
recommended default, but ClickUp, Jira, or GitHub Issues are acceptable substitutes —
swap the tracker names in the steps below).

```mermaid
flowchart LR
    A[Issue / OpenSpec change] --> B[/opsx:propose]
    B --> C[proposal + design + tasks]
    C --> D[/opsx:apply]
    D --> D2[/make-no-mistakes:implement/]
    D2 --> E[código + tests]
    E --> F[/dogfood]
    F --> G{gate-dependent}
    G -- Jidoka / No-Workarounds fail --> H[fix + re-run]
    H --> F
    G -- pass --> I[/e2e-test-builder/runner/]
    I --> J[suite ejecutada + evidencia]
    J --> K[/ready-to-review-mergeable/]
    K --> L[review humano]
    L --> M{approve?}
    M -- no --> H
    M -- yes --> N[merge]
    N --> O[archive / specs sync]
```

Steps: propose → apply (plan) → implement (disciplina) → dogfood (gate) → e2e
evidence → ready-to-review-mergeable → human review → merge → archive. `/opsx:apply`
reads the change artifacts and generates tasks; `/make-no-mistakes:implement` executes
them with discipline (worktree, verification, CI) and produces the code + tests. The
tracker (Linear or substitute) is updated at each handoff; every mutating gate is HITL.

## Verify

Run `/dogfood` with a real command, real config, and `--check` for the Then-assertion.
Confirm Jidoka and No-Workarounds pass, and that `diagram.svg` (Pele, blueprint) is produced.

## Notes

- The canonical profile lives at `shared/bootstrap/agents/better.md` (repo SSOT); it is
  synced to `~/.config/opencode/agents/better.md` (runtime copy).
- On Windows, sync the runtime copy with
  `pwsh -File scripts/ci/sync-better-profile.ps1`
  (`-check` / `-quiet` mirror the bash `--check` / `--quiet` flags).
- The keybinding is a UI action (shift+tab); if it's not bound in your setup, bind
  "cycle agent" in OpenCode keybinds.
- The agent uses the configured model; it does not change the selected model.
