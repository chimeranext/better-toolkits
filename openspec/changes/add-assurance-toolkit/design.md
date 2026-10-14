# Design — add-assurance-toolkit

## Context

See `proposal.md` (Why). Current state: the 7 commands live in `make-no-mistakes-toolkit/commands/` plus protocols in `references/`; the monorepo requires a markdown protocol under `toolkits/<name>/references/` plus thin entries under `commands/` plus Cursor skills, a single OpenSpec store at the root, and shims as the migration pattern (precedent `disk-cleanup`).

## Goals / Non-Goals

**Goals:**

- New `toolkits/assurance-toolkit/` that passes `openspec validate` and follows the multi-harness layout.
- Migration without breakage: delegating shims with a warning.
- Clear boundary: assurance writes evidence, the dev workflow consumes it.

**Non-Goals:**

- Do not implement the Qualflare→Linear webhook broker or the providers (protocol only).
- Do not delete the pentest or observability shims. Do not touch `premortem`.
- Do not define `receipts/` (reserved empty slot).

## Decisions

- **Mirror layout plus shims, not a pure move.** Why: avoids breaking sessions/scripts that invoke the old commands; the alternative (move and break) was rejected because of migration cost on HabitaNexus.
- **2 pillars plus a transversal with its own runner** (testing, liveness; security transversal). Why: decision locked in the HabitaNexus session (seq 1519-1532); the 3-pillar alternative (correctness/liveness/safety as equal pillars) was rejected because security has a different cadence/owner/gate and, as an equal third pillar, pressures mixing verdicts.
- **Shared triage as a pattern, not as a single command.** Same shape (queue → owner → SLA → receipt), two owners (testing vs security). Avoids duplicating code and avoids mixing reports. Security findings are mode `/assurance:triage security`, not a separate command.
- **`gemini-code-review` → `--provider gemini` on `local-pr-review`.** Merge by provider (Heimdall/Kimi via NIM precedent); shim with a warning, deletion in the next minor.
- **Three OpenSpec capabilities** (`assurance-testing`, `assurance-liveness`, `assurance-security`) instead of one catch-all. Each evolves with its own requirements without coupling cadences.
- **Fourth capability is governance, not execution.** `assurance-governance` does not run tests: it defines how to measure (DORA/DER/MTTD), what blocks (gates), and what remains as evidence (receipts). Without it, the three pillars emit reports nobody can turn into a release decision.
- **Polyglot testing with one evidence protocol, runners per stack.** Same shape (run → collect → link to Linear → cluster) for Flutter, Laravel/Pest, Elixir/ExUnit, and TS7; each stack brings its native runner (`php artisan test`, `mix test`, `tsgo`) instead of a generic runner that understands no ecosystem. The skill `pest-testing-laraveldaily` (via `npx skills add …nativephp-larapackagehunt --skill pest-testing-laraveldaily`) is a documented authoring dependency, not toolkit code.
- **Flutter pyramid maps to existing commands.** Unit/widget go to `/assurance:e2e-test-builder` and `/assurance:e2e-test-runner` (code level), integration + Maestro to `/assurance:e2e-test-runner` and `/assurance:e2e-test-preview` (device level); `flutter_driver` gets no new protocol, only a migration shim. `Semantics.identifier` is an AC of the design system, not a runner detail.
- **Adapter first, framework later.** The landscape (Maestro/Cypress/Playwright/Selenium/Appium, Vitest/Jest) changes every year; what stays stable is the protocol run → collect → link → cluster. That is why the toolkit blesses initial adapters (the 4 stacks) and sends the rest to backlog with a mandatory PoC — adopting without a PoC repeats the mistake of coupling the gate to a tool.
- **Reinterpret skills, do not vendor them.** External skills are read and rewritten as our own protocol with progressive disclosure (light index plus on-demand guides), same as the Agent Skills pattern: the repo does not load 79 guides in every session. Licenses respected (MIT / Apache-2.0) with attribution in the protocol.
- **Stories: write once, run everywhere.** Web component testing does not create a new suite: the story is the fixture and each runner (Vitest, a11y, visual, E2E) consumes it. Rejected alternative: separate suites per level (they duplicate authoring and diverge within a week).
- **Web ↔ Flutter symmetry.** Storybook (CSF stories) and Widgetbook (frozen scenarios) are the same pattern in two ecosystems: exploratory authoring plus frozen fixtures plus an environment matrix plus diffs (visual and semantic). The protocol treats them as one component-testing adapter with two drivers.
- **Agents are also the system under test.** The agentic red team (ASI01–10) applies the same evidence protocol to our own agents: versioned scenario maps, agent graph as the audit trail, SoD between whoever codes the agent and whoever defines policies. Gateway plus code layer, never only one.
- **Prevent is a gate, diagnose is playbook plus runbook.** Known K8s failures are stopped in pre-flight; what still escapes is decided by the playbook (diagnose/recover/escalate) and executed by runbooks with pattern-IDs that feed the receipts. Same information, two moments in the cycle.
- **Layers with one owner, never raw tools in parallel.** Every K8s comparison ends the same way: two raw tools on the same check = noise that gets ignored. The protocol requires a single owner per finding type plus one severity schema plus audit-first before enforce.

## Risks / Trade-offs

- [Shim drift] Shims can diverge from the new protocol → Mitigation: one-line thin shims that only delegate, plus a test that the warning exists.
- [Store YAML `specs` rule] The root `.openspec.yaml` has a malformed item (CLI warning) → Mitigation: do not touch it in this change; report it separately.
- [Providers without a contract] Kiwi/Qase/Qualflare change their API → Mitigation: the protocol versions integrations and pins `qualflare-maestro`; broker with cluster dedupe so changes are not amplified.
- [Name] `assurance-toolkit` vs `quality-engineering` / `release-assurance` → Mitigation: name already confirmed in session; alternatives recorded in the proposal.
- [TS7 compiler API missing until 7.1] Scripts that import `typescript` as a library break with `tsgo` → Mitigation: checklist requires classic in parallel or `oxc-parser`; dual CI during the transition.

## Migration Plan

1. Scaffold `toolkits/assurance-toolkit/` (plugin manifest, README, `references/` with the 3 protocols, thin `commands/`, skills).
2. Copy protocols of the 7 commands into the new toolkit; replace originals with delegating shims plus a warning. Findings triage is the exception: it is mode `/assurance:triage security`, with no shim.
3. Add `--provider gemini` to `local-pr-review` plus a shim for `gemini-code-review`.
4. Update `marketplace.json` plus versions; `openspec validate`; PR with HITL before push.
5. Rollback: revert the commit (shims keep the old state resolving).

## Open Questions

- None that block specs/design/tasks. Versions to pin for `qualflare-maestro` and the exact shape of `qualflare.link` are fixed at apply with the Starter account. The `tsgo` version and the compatible `vite-tsconfig-paths` version are also pinned at apply.
