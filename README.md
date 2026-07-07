# better-toolkits

> Source-available Claude Code toolkits monorepo — **pick the toolkits your startup needs.**

A curated set of [Claude Code](https://docs.claude.com/en/docs/claude-code) plugins —
each independently installable — consolidated into one marketplace. Instead of chasing
ten standalone repositories, you add **one** marketplace and install exactly the toolkits
your startup needs, from problem validation through go-to-market. Inspired by the
"pick-your-stack" experience of [create-better-t-stack](https://www.better-t-stack.dev/)
and a sibling to [better-microservices](https://github.com/chimeranext/better-microservices).

## Install

Add the marketplace once, then install any toolkit by its **plugin name**:

```bash
claude plugin marketplace add chimeranext/better-toolkits
claude plugin install <plugin-name>@better-toolkits
```

The plugin name usually matches the directory, but not always — `app-gtm-release-toolkit`
installs as `app-gtm-release`, and `make-no-mistakes-toolkit` installs as `make-no-mistakes`.
The authoritative list of installable names lives in
[`.claude-plugin/marketplace.json`](.claude-plugin/marketplace.json). A future documentation
and configurator site is planned at **toolkits.chimeranext.dev**.

## Toolkits at a glance

Listed in priority order. Each keeps its **own license** — see the `LICENSE` file inside
its `toolkits/<name>/` and the per-toolkit sections below.

| # | Toolkit | What it does | License | Status |
|---|---|---|---|---|
| 1 | [`make-no-mistakes-toolkit`](toolkits/make-no-mistakes-toolkit) | Disciplined dev lifecycle — repo-health audit engine, issue execution, PR review, releases, E2E, secrets. | BSL-1.1 | Available |
| 2 | [`atomic-design-toolkit`](toolkits/atomic-design-toolkit) | Atomic Design for Flutter and Vite — generate, audit, and migrate component hierarchies. | BSL-1.1 | Available |
| 3 | [`ux-research-toolkit`](toolkits/ux-research-toolkit) | Guided UX-research maps — journeys, blueprints, storyboards, story maps, with HTML visualization. | BSL-1.1 | Available |
| 4 | [`business-model-toolkit`](toolkits/business-model-toolkit) | Interactive business-model brainstorming across the full startup lifecycle. | BSL-1.1 | Available |
| 5 | [`app-gtm-release-toolkit`](toolkits/app-gtm-release-toolkit) | Multi-platform app go-to-market and release across Flutter, KMP, MAUI, Swift, PWA. | BSL-1.1 | Available |
| 6 | [`aaarrr-flywheel-toolkit`](toolkits/aaarrr-flywheel-toolkit) | AAARRR acquisition funnel + Retention/Referral flywheel over the Meta Marketing API. | BSL-1.1 | Available |
| 7 | [`fractional-cto-toolkit`](toolkits/fractional-cto-toolkit) | Operational SOPs and workflows for freelance and fractional CTOs. | BSL-1.1 ⚠️ | Available |
| 8 | [`instructional-design-toolkit`](toolkits/instructional-design-toolkit) | Design cmi5-compliant courses and 1-on-1 session plans. | BSL-1.1 | Available |
| 9 | [`launchpad-toolkit`](toolkits/launchpad-toolkit) | Founder-operations lab — intake, cap table, matching, demo-day, stage tracking. | BSL-1.1 | Available |
| 10 | [`venture-studio-toolkit`](toolkits/venture-studio-toolkit) | Macro portfolio management for venture studios and serial founders. | BSL-1.1 | Available |

> ⚠️ `fractional-cto-toolkit` declares `BSL-1.1` in its `plugin.json`, but the `LICENSE`
> file was never committed in the source repository, so it is **absent** from this monorepo.
> See its section below.

Every declared license is **BSL-1.1** (Business Source License 1.1), which converts to the
**Non-Profit Open Software License 3.0** five years after each version is published.
© 2026 Luis Andres Pena Castillo.

## Toolkits

### 1. make-no-mistakes-toolkit `v1.33.0`

The disciplined dev lifecycle — one plugin to make no mistakes.

#### What you get

- **Repo-health audit engine** — a six-family sweep (schema-drift, contract-drift, DDD boundary leakage, explicit-architecture, strangler-fig migration, enforcement-hooks) fronted by `/domain-driven-advisor`, the plain-language entry point that inspects your repo and routes you.
- **Disciplined execution** — Linear issue implementation with git-worktree isolation, PR review with Greptile gating, team-wide release sync, and session management.
- **Quality & safety** — E2E test generation/execution, a test-suite previewer, security pentesting, MoSCoW + RICE prioritization, and a premortem on the aggregated remediation plan.
- **Secret stash** — cross-platform secret capture via OS-native GUI prompts (zenity / kdialog / osascript / Get-Credential), never touching the conversation log.
- 30 commands, 10 auto-activating skills, 2 specialized agents.

#### Install

```bash
claude plugin install make-no-mistakes@better-toolkits
```

#### License

BSL-1.1 — converts to Non-Profit OSL 3.0 five years after publication. `LICENSE` present.

### 2. atomic-design-toolkit `v1.2.0`

Atomic Design for Flutter and Vite — decompose features into atoms, molecules, organisms, templates, and pages.

#### What you get

- **Generate** production-ready component hierarchies for Flutter and Vite (React / Vue / Svelte / Solid / vanilla) following Atomic Design methodology.
- **Audit** your codebase for decomposable components plus Vite bundle health (10 signals: duplicate deps, legacy `public/` assets, mixed majors, vendorized libs, hashless assets, outdated deps, CI audit coverage, HMR, visual regression, dual lockfiles).
- **Enforcement hooks** — V7 cure-presence checks (hooks, CI guards, ownership docs, agent rules) that measure future-drift exposure.
- **Migrate** — consume audit reports to drive phased remediation, cross-referenced against 16+ design systems (Material 3, Cupertino, Carbon, Bootstrap 5, Tailwind + shadcn, Primer, Polaris, Spectrum, …).
- 3 commands, 2 auto-activating skills. Storybook and Widgetbook setup included.

#### Install

```bash
claude plugin install atomic-design-toolkit@better-toolkits
```

#### License

BSL-1.1 — converts to Non-Profit OSL 3.0 five years after publication. `LICENSE` present.

### 3. ux-research-toolkit `v2.1.0`

Guided UX-research map creation for non-experts, based on NN/g methodology.

#### What you get

- **Five map types** — Experience Map, Customer Journey Map, Service Blueprint, Storyboard, and User Story Map.
- **JSON-first** with modular schemas and composable HTML components; an inline editor via the File System Access API.
- **Persona import** — pulls personas from SRD and business-model-toolkit maps.
- 6 skills (1 guided entry point + 5 map-type shortcuts), 2 agents (HTML renderer + persona builder).

#### Install

```bash
claude plugin install ux-research-toolkit@better-toolkits
```

#### License

BSL-1.1 — converts to Non-Profit OSL 3.0 five years after publication. `LICENSE` present.

### 4. business-model-toolkit `v2.0.0`

Interactive business-model brainstorming — guided dialogue covering the full startup lifecycle from problem validation through execution and investor pitch.

#### What you get

- **21 phases across 3 spaces** — Problem-Hypothesis, Solution-Validation, Execution-Acceleration.
- **Methodology** — combines Running Lean, Lean Canvas, and Founder Institute practice.
- **Background research** — a market-research agent runs while you answer complementary questions.
- 2 commands, 5 auto-activating skills by lifecycle phase, 1 background market-research agent.

#### Install

```bash
claude plugin install business-model-toolkit@better-toolkits
```

#### License

BSL-1.1 — converts to Non-Profit OSL 3.0 five years after publication. `LICENSE` present.

### 5. app-gtm-release-toolkit `v2.3.0`

Multi-platform app go-to-market and release — ship Flutter, Kotlin Multiplatform, .NET MAUI, Swift, and PWAs to Google Play, App Store, Microsoft Store, Snap Store, Flathub, and alternative channels.

#### What you get

- **Three-tier command architecture** — `/ship-advisor` (strategy) → per-framework `/ship-flutter`, `/ship-pwa`, `/ship-msstore`, `/ship-snap`, `/ship-kmp`, `/ship-maui` (execution) → `/ship-everywhere` (mass publish).
- **CI/CD & distribution** — Codemagic and GitHub Actions, RevenueCat monetization, Shorebird code push, plus desktop code signing + notarization for Windows/macOS.
- **GTM layer** — the `gtm-fit` skill (SLIP framework, minimum viable segment, organic-presence system) so shipped apps also sell.
- 10 commands, 17 skills, 2 agents; pre-launch checklist based on Andrea Bizzotto's methodology.

#### Install

```bash
claude plugin install app-gtm-release@better-toolkits
```

> Note: the directory is `app-gtm-release-toolkit`, but the plugin installs as `app-gtm-release`.

#### License

BSL-1.1 — converts to Non-Profit OSL 3.0 five years after publication. `LICENSE` present.

### 6. aaarrr-flywheel-toolkit `v0.1.0`

AAARRR acquisition funnel + Retention/Referral flywheel over the Meta Marketing API.

#### What you get

- **Funnel + flywheel** — Awareness / Acquisition / Activation / Revenue run as a linear funnel; Retention / Referral close the loop as a flywheel that feeds Acquisition back.
- **Stage commands** — `/acquire`, `/activate`, `/revenue`, `/retain`, `/refer`, plus `/aaarrr-launch`, `/aaarrr-analyze`, and `/kill-funnel`.
- **Meta Graph API** skill for execution against Meta's Marketing API.
- Mantra: *fail fast, fail often, fail cheap, fail forward.*

> The pricing + landing-instrumentation expansion (v0.2.0) exists in the source repo but is
> not yet committed, so this monorepo ships the committed **v0.1.0**.

#### Install

```bash
claude plugin install aaarrr-flywheel-toolkit@better-toolkits
```

#### License

BSL-1.1 — converts to Non-Profit OSL 3.0 five years after publication. `LICENSE` present.

### 7. fractional-cto-toolkit `v1.0.0`

Operational toolkit for freelance and fractional CTOs — SOPs, checklists, and guided workflows for project takeovers, technical audits, client onboarding, and vendor evaluation.

#### What you get

- **Project takeovers** — the `project-takeover` and `takeover-assessment` skills for inheriting a codebase safely.
- **Contracts** — ready-to-adapt `contract-nda`, `contract-psa`, and `contract-retainer` skills.
- 5 phase-aligned skills covering the fractional-CTO engagement lifecycle.

#### Install

```bash
claude plugin install fractional-cto-toolkit@better-toolkits
```

#### License

**BSL-1.1 declared, LICENSE file missing.** The `plugin.json` declares `BSL-1.1`, but the
`LICENSE` file was never committed in the source repository, so it is absent here. The
intended terms match the other toolkits (BSL-1.1 → Non-Profit OSL 3.0 after 5 years);
committing the license text is pending.

### 8. instructional-design-toolkit `v1.0.0`

Design cmi5-compliant courses and 1-on-1 session plans.

#### What you get

- **Course design formula** — CONTEXT → CONCEPT → BUILD → SHIP → REFLECT, with Builder's Bloom's progression, Ship-First Design, and Kirkpatrick L1–L4 evaluation.
- **Outputs** — cmi5-ready JSON, a dense Markdown syllabus, interactive HTML visualization (Bloom's + ship milestones), a Marp deck per lesson, and Tally/Typeform feedback embeds.
- **1-on-1 modes** — coaching, mentoring, and tutoring session shortcuts (Irby 2018 distinction).
- **Persona import** — from SRD, business-model-toolkit, and ux-research-toolkit maps.
- 12 skills, 7 agents (context detection, profile, session-type, visualizer, slides, cmi5 validator, changelog).

#### Install

```bash
claude plugin install instructional-design-toolkit@better-toolkits
```

#### License

BSL-1.1 — converts to Non-Profit OSL 3.0 five years after publication. `LICENSE` present.

### 9. launchpad-toolkit `v0.5.0`

Founder-operations lab — a methodology prototype laboratory for the ChimeraNext Launchpad pillar.

#### What you get

- **Founder workflows** — `startup-intake`, `cap-table-builder`, `cofounder-matching`, `investor-matching`, `demo-day-prep`, `stage-tracker`, and `founder-documents`.
- **Live-data agent** — a `chimeranext-api-consumer` agent enriches skills with live API data when endpoints exist and degrades gracefully (`SPEC_GAP`) when they don't.
- **Dual-purpose** — external CLI for founders + internal validation lab that productizes patterns via the `feature-to-spike` loop.

#### Install

```bash
claude plugin install launchpad-toolkit@better-toolkits
```

#### License

BSL-1.1 — converts to Non-Profit OSL 3.0 five years after publication. `LICENSE` present.

### 10. venture-studio-toolkit `v1.2.0`

Macro portfolio management for venture studios and serial founders. Spanish-first; bilingual output framework documented for v1.3+.

#### What you get

- **LATAM corporate structures** — Cayman Sandwich, Delaware Tostada, Skip-CR, with a structure-decision skill and evolution roadmap.
- **Services Hub** — MSA templates, shared-services ledger, and sweat-equity agreements.
- **Studio frameworks** — govclab thesis / focus / secret sauce, accelerator matching, and Three Horizons portfolio allocation with explore-exploit and liability-contagion analysis.
- 20+ skills across structure, funding, and portfolio governance.

#### Install

```bash
claude plugin install venture-studio-toolkit@better-toolkits
```

#### License

BSL-1.1 — converts to Non-Profit OSL 3.0 five years after publication. `LICENSE` present.

## Repository layout

```
.claude-plugin/
  marketplace.json    # the marketplace manifest Claude Code reads (one entry per toolkit)
toolkits/             # the toolkits — one git history per toolkit, preserved via git subtree
apps/web/             # (Phase 2) landing-page selector / configurator
docs/site/            # (Phase 2) documentation site → toolkits.chimeranext.dev
```

## Why one monorepo?

These toolkits started life as ten separate repositories. Consolidating them into a
single marketplace means:

- **One install surface.** `claude plugin marketplace add chimeranext/better-toolkits`
  is the single door — no hunting for ten repo URLs.
- **Preserved history.** Each toolkit is imported with `git subtree`, so its full
  commit history survives (`git log toolkits/<name>/`).
- **Independent licensing and versioning.** Every toolkit keeps its own `LICENSE`
  and its own version; the monorepo just curates them.

## History

This monorepo consolidates ten previously-separate repositories with their **full git
history preserved** via `git subtree add`. All ten toolkits are live in
[`marketplace.json`](.claude-plugin/marketplace.json); `atomic-design-toolkit` and
`make-no-mistakes-toolkit` were the last two imported, after their histories were
reconciled.
