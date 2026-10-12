# assurance

**Version: 0.1.0** · [CHANGELOG](./CHANGELOG.md) · [Marketplace](https://github.com/chimeranext/better-toolkits)

Release-assurance evidence — 2 pillars (testing, liveness) + security transversal with its own runner, plus governance (metrics, gates, receipts). One plugin to prove you can ship.

A Claude Code plugin by [Luis Andres Pena Castillo](https://github.com/lapc506).

## Install

```bash
# Add the marketplace (one-time)
claude plugin marketplace add chimeranext/better-toolkits

# Install the plugin
claude plugin install assurance
```

Or clone and install locally:

```bash
git clone https://github.com/chimeranext/better-toolkits.git
claude plugin marketplace add ./better-toolkits
claude plugin install assurance
```

## Install (OpenCode)

Use monorepo bootstrap:

```bash
npx @chimeranext/better-toolkits setup
```

Or install `better-toolkits-bootstrap@better-toolkits` and run `/toolkits-initial-setup`.

## Start here: `/assurance:triage-security-findings`

**If you only run one command from this plugin, understand this split first.**

assurance writes **evidence**; the dev workflow consumes it in gates. The two
pillars answer different questions, and security runs on its own cadence:

| Pillar | Question | Commands | Cadence |
|--------|----------|----------|---------|
| testing | Does it do what it says? | [`/e2e-test-builder`](#commands-7), [`/e2e-test-runner`](#commands-7), [`/e2e-test-preview`](#commands-7) | Per PR |
| liveness | Is it still alive? | [`/observability-audit`](#commands-7) | Always (schedule/daemon) |
| security (transversal) | Is it safe? | [`/pentest-runner`](#commands-7), [`/pentest-playbook-setup`](#commands-7), [`/triage-security-findings`](#commands-7) | Per release / finding SLA |
| governance (no runners) | How do we measure, block, prove? | DORA/DER metrics, stage gates, receipts | Per release |

Security reports are never mixed with test reports — each release demands
separate verdicts. Full teaching sections in `references/*/protocol.md`.

## What's Inside

### Commands (7)

Migrated from `make-no-mistakes-toolkit` with shims (behavior unchanged).
Deliberate actions you invoke explicitly.

| Command | Description |
|---------|-------------|
| [`/assurance:e2e-test-builder <source>`](commands/e2e-test-builder.md) | Generate a TestSprite-compatible `test-suite.json` from docs or PRDs (pilar testing) |
| [`/assurance:e2e-test-runner [filter]`](commands/e2e-test-runner.md) | Execute E2E tests from `test-suite.json` with runner selection and reporting (pilar testing) |
| [`/assurance:e2e-test-preview [path]`](commands/e2e-test-preview.md) | Qt-based visual previewer for `test-suite.json` — interactive table, filtering, CSV export (pilar testing) |
| [`/assurance:observability-audit <target>`](commands/observability-audit.md) | Audit whether observability actually WORKS (telemetry received, live destinations, demonstrated alerts) — runtime audit, not a static scan (pilar liveness) |
| [`/assurance:pentest-runner <phase>`](commands/pentest-runner.md) | Automated pentesting following Cyber Kill Chain + OWASP methodology, plus OWASP ASI01–ASI10 agentic red-team (transversal security) |
| [`/assurance:pentest-playbook-setup [audit\|sync\|workflows\|gaps]`](commands/pentest-playbook-setup.md) | Audit/sync pentest playbook ↔ CI ↔ tenant triage config (transversal security) |
| [`/assurance:triage-security-findings <scanner\|phase2\|pentest-report>`](commands/triage-security-findings.md) | Triage CI + pentest findings into owned backlog issues — cola → dueño → SLA → receipt (transversal security) |

Not migrated (stay in `make-no-mistakes`): `ready-to-review-mergeable`, `premortem`, audits, coordination, rituals. `gemini-code-review` merges into `local-pr-review --provider gemini`.

### Skills (22)

Auto-activate by context — you don't need to remember the command name.

| Skill | Triggers when you... |
|-------|---------------------|
| [`assurance`](skills/assurance/SKILL.md) | Ask about quality evidence, release readiness, or quality gates |
| [`flutter-testing-strategy`](skills/flutter-testing-strategy/SKILL.md) | Need unit/widget/integration test strategy or TDD for Flutter |
| [`flutter-mobile-testing`](skills/flutter-mobile-testing/SKILL.md) | Test on devices/simulators via Dart/Flutter MCP, inspect the widget tree |
| [`flutter-accessibility`](skills/flutter-accessibility/SKILL.md) | Ask about Semantics, TalkBack/VoiceOver, WCAG, focus, contrast |
| [`flutter-performance`](skills/flutter-performance/SKILL.md) | Ask about rebuilds, lists, memory, lazy loading, profiling |
| [`flutter-error-tracking`](skills/flutter-error-tracking/SKILL.md) | Ask about Sentry/Crashlytics, breadcrumbs, crash reporting |
| [`flutter-security`](skills/flutter-security/SKILL.md) | Ask about pinning, secure storage, obfuscation, biometrics, root detection |
| [`sre-load-testing-performance`](skills/sre-load-testing-performance/SKILL.md) | Ask about k6/JMeter, stress testing, capacity planning |
| [`sre-observability-stack`](skills/sre-observability-stack/SKILL.md) | Ask about Prometheus/Grafana/Jaeger/OTel, heartbeat, absence detection |
| [`sre-alerting-incident-management`](skills/sre-alerting-incident-management/SKILL.md) | Ask about PagerDuty/Opsgenie, on-call, alert SLAs |
| [`sre-logging-log-aggregation`](skills/sre-logging-log-aggregation/SKILL.md) | Ask about Loki/ES/Fluentd, structured logs as evidence |
| [`sre-chaos-engineering`](skills/sre-chaos-engineering/SKILL.md) | Ask about Litmus/Chaos Mesh, failure injection, game days |
| [`sre-database-reliability`](skills/sre-database-reliability/SKILL.md) | Ask about replication, backup drills, failover readiness |
| [`sre-disaster-recovery-business-continuity`](skills/sre-disaster-recovery-business-continuity/SKILL.md) | Ask about DR drills, RPO/RTO as SLOs |
| [`sre-security-compliance-automation`](skills/sre-security-compliance-automation/SKILL.md) | Ask about OPA policy-as-code, CIS benchmarks, vuln scanning |
| [`sre-container-security`](skills/sre-container-security/SKILL.md) | Ask about image scanning/signing, Falco, CVE |
| [`sre-network-policies-security`](skills/sre-network-policies-security/SKILL.md) | Ask about Calico/Cilium, egress/ingress policies |
| [`static-analysis`](skills/static-analysis/SKILL.md) | Ask about multi-language lint (dart-analyze, ruff, golangci-lint, eslint, shellcheck, clippy) |
| [`sre-slo-sli-sla`](skills/sre-slo-sli-sla/SKILL.md) | Ask about SLOs, error budgets, MTTD/MTTR |
| [`cicd-argocd`](skills/cicd-argocd/SKILL.md) | Ask about GitOps sync as gate (waves, hooks, health) |
| [`cicd-github-actions`](skills/cicd-github-actions/SKILL.md) | Ask about wiring stage gates into CI workflows |
| [`versioning-management`](skills/versioning-management/SKILL.md) | Ask about SemVer + conventional commits (every repo, not just Flutter) |

## References (protocol SSOT)

| Protocol | Covers |
|----------|--------|
| [`references/testing/protocol.md`](references/testing/protocol.md) | Polyglot runners (Flutter, Laravel/Pest, Elixir, TS7, Playwright, MobileWright), stories/scenarios, mutation, contracts, perf, a11y, visual, PBT, eval-driven + risk-driven |
| [`references/liveness/protocol.md`](references/liveness/protocol.md) | Observability escalera, chaos + resilience score, baselines, K8s pre-flight signals, playbook/runbook taxonomy |
| [`references/security/protocol.md`](references/security/protocol.md) | Pentest trilogy, MASVS→MASWE→MASTG, SAST/DAST/SCA, signed supply-chain, mobile REA, agentic red-team, K8s runtime + policy engines |
| [`references/governance/protocol.md`](references/governance/protocol.md) | DORA/DER metrics, stage gates, GitOps pipeline, K8s layered pre-flight, receipts, SemVer universal |

## Architecture

```
assurance-toolkit/
├── .claude-plugin/     # Claude Code plugin metadata
│   └── plugin.json
├── commands/           # 7 explicit commands (thin entries → references/)
├── skills/             # 22 auto-activating skills
│   └── */SKILL.md
├── references/         # Protocol SSOT per pillar
│   ├── testing/protocol.md
│   ├── liveness/protocol.md
│   ├── security/protocol.md
│   └── governance/protocol.md
├── CHANGELOG.md
└── README.md
```

**Design principle:** assurance writes evidence (runs, clusters, links, receipts); the dev workflow consumes it in gates. Commands for deliberate actions. Skills for analysis that may *propose* shared-state mutations — **HITL is doctrine**. Protocols for the normative rules each command/skill follows.

## Verify Installation

**Claude Code:**

```bash
claude plugin list
# should show "assurance"
```

Or run `/plugin` inside Claude Code to see it in the plugin manager.

## Requirements

- **Claude Code** — the CLI or IDE extension
- **GitHub CLI** (`gh`) — authenticated (`gh auth login`)

## License

[Business Source License 1.1](../../LICENSE) — you may use, modify, and redistribute for non-competitive purposes. Converts to Non-Profit OSL 3.0 after 5 years.
