# FFF — Feature Flag Families (Families × internal taxonomy)

## Purpose

Standardize how feature flags are organized and chosen. Instead of a single flat
list of "types", this standard defines **families** (groups with their own
identity) and, **within each family**, an internal taxonomy of concrete subtypes.
The right flag/rollout mechanism is selected per *kind of change* — never by
guessing from one global type.

- A **family** is a coherent intent group (Release, Ops, Permission, ...).
- A **taxonomy** inside a family enumerates the concrete subtypes, their typical
  lifespan, and the implementation patterns that realize them.

## Model

```text
Family (overarching purpose)
└── Internal taxonomy (concrete subtypes)
      ├── subtype A — lifespan — pattern
      ├── subtype B — lifespan — pattern
      └── ...
```

## Families × internal taxonomy (SSOT)

### Family R — Release / Delivery (progressive delivery)

Internal taxonomy:

| Subtype | Lifespan | Pattern |
| --- | --- | --- |
| Closed beta | 2–8 weeks | Selected testers; `stage` environment; readiness gate |
| Canary | 2–8 weeks | Small traffic share (5→25→50→100) with monitoring |
| Phased rollout | 2–8 weeks | Stages by segment/region/environment |
| Percentage ramp | 2–8 weeks | Per-cohort share using stable user hashing |
| Feature bundling / prerequisite | variable | Dependent flags behind a keystone flag (LaunchDarkly hierarchy) |
| Single vs multi-environment | variable | Per-environment values (develop/stage/prod) |

Evidence: GrowthBook (release flags 2–8 weeks; type table); Unleash (gradual
rollout; short-lived; archive); Octopus (release toggles); Plane.so (release
flags, gradual rollouts); Medium/Amr (strangler fig + flags + Alternative Handler).

### Family E — Experimentation

| Subtype | Lifespan | Pattern |
| --- | --- | --- |
| A/B | 2–6 weeks | Stable random assignment via hashing |
| Multivariate | 2–6 weeks | Multiple variants (string/JSON) |
| Holdout | variable | Control group not exposed to the experiment |
| Sequential | variable | Chained tests |
| Guardrail metrics | while running | Auto-rollback if a metric breaches a threshold |

Evidence: GrowthBook (experiment flags; A/B/n; safe rollouts); Unleash (A/B +
multivariate); Octopus (experiment toggles); Plane.so (experiment flags).

### Family O — Ops / Resilience

| Subtype | Lifespan | Pattern |
| --- | --- | --- |
| Kill switch | long-lived | Inverted flag; disables a feature without deploy |
| Circuit breaker | long-lived | Protects degraded dependencies |
| Graceful degradation | long-lived | Reduces resource use under load |
| Runtime config | long-lived | Adjustable parameter without restart |
| Debug/internal flags | short-lived | On-demand tracing/metrics |

Evidence: Unleash (kill switches, internal flags, availability-over-consistency);
Harness (ops toggles, MTTR); Octopus (ops toggles); GrowthBook (ops flags);
Plane.so (operational flags, kill switch).

### Family P — Access / Permission

| Subtype | Lifespan | Pattern |
| --- | --- | --- |
| Tier / plan | permanent | Gating by subscription |
| Role | permanent | RBAC |
| Geography | permanent | Region/compliance |
| Segment | permanent | Cohort by attributes |
| Entitlement | permanent | Evaluated **server-side** (PII) |

Evidence: Unleash (permission flags, server-side PII, RBAC/four-eyes); GrowthBook
(permission; server-side evaluation); Octopus (permission toggles); Plane.so
(permissioning/entitlement).

### Family D — Decommissioning / Migration

| Subtype | Lifespan | Pattern |
| --- | --- | --- |
| Sunset | short-lived→variable | Disable legacy feature |
| Legacy bypass | variable | Exclude clients paying for legacy |
| Migration routing | variable | Strangler fig: route share of traffic to the new system |
| Archiving / audit | permanent | Archive removed flags as evidence |

Evidence: LaunchDarkly (decommissioning; dependent flags); Unleash (archive old
flags); Octopus (flag dependency mapping; cleanup); Plane.so (flag debt, cleanup).

### Family S — Security / Capability vendorization *(specific to better-toolkits)*

| Subtype | Lifespan | Pattern |
| --- | --- | --- |
| Phase opt-in | variable | Enable check per phase (walk 1→10) |
| Gating | variable | CI gate with SARIF; threshold |
| Never re-implement | permanent | Vendorize a mature tool (Trivy/Checkov/Semgrep) |
| Mapper/proxy | permanent | Catalog `ci-checks.yml` ↔ real tool |
| Threat-model evidence | permanent | Threat sources (Sophos/Anthropic) support the check |

Evidence: this doctrine; `security-tooling-gap.md`; Sophos (breachpocalypse:
patching speed → do-not-reinvent); Anthropic (AI/supply-chain threat model).

## Cross-family rules (apply to all families)

- **Unique, human-readable naming** (Unleash #4; Octopus; Harness; Plane.so):
  prevents reuse of stale flag names (Knight Capital).
- **Short-lived + cleanup + archive** (Unleash #2; GrowthBook; Octopus; Plane.so):
  a flag without an expiry is technical debt.
- **Evaluate server-side when PII/entitlement is involved** (Unleash #6;
  GrowthBook; Plane.so): never client-side for security.
- **Availability over consistency** (Unleash #3): local cache; do not depend on
  the flag service to keep working.
- **RBAC + audit + four-eyes** for production flag changes (Unleash #5/#10;
  Octopus; Harness).
- **Do not use flags as static configuration, nor as security control** (Unleash;
  GrowthBook "don't use flags for secrets/core business logic").

## Interaction with other standards (interfaces)

| Standard | Interaction |
| --- | --- |
| **REL** (Release Cut) | FFF is the **post-entry** risk mechanism: REL concentrates the human gate at `develop→main`; FFF enables gradual rollout and instant rollback **after** that gate (kill switch complements `hotfix/*`). The cut ships dormant code; the visible release happens via the flag. |
| **MPH** (Main Protections & HITL) | Families O/P and production flag-state changes require RBAC + audit → links to the fail-closed HITL guard. |
| **SemVer / CHH** | Flags do not bump versions; the release cut does. FFF does not alter version policy. |
| **GGT / BrS** | FFF enables trunk-based development: continuous merge to `develop` with flags off, without long-lived branches (GrowthBook/Harness/Plane.so). |
| **DDD** | A flag is an **integration contract between bounded contexts** (evidence: hyperlabusa ADR design-system-no-host-overrides: "host only composes: data, callbacks, feature flags, routing"). The `ci-checks.yml` catalog uses `verb-type-subject` as ubiquitous language. |

## Sources (read in depth)

- Unleash — 11 best practices: https://docs.getunleash.io/guides/feature-flag-best-practices
- GrowthBook — Feature Flags 101: https://www.growthbook.io/blog/what-are-feature-flags
- Harness — Feature Flags Best Practices: https://www.harness.io/blog/feature-flags-best-practices
- Octopus — 4 types of feature flags: https://octopus.com/devops/feature-flags/
- LaunchDarkly — Flag hierarchy: https://launchdarkly.com/docs/guides/flags/flag-hierarchy
- ConfigCat — Feature Flag Framework: https://configcat.com/feature-flag-framework-explained/
- Plane.so — Feature flag definition & use cases: https://plane.so/blog/what-is-a-feature-flag-definition-best-practices-and-use-cases
- Medium (Amr elshaer) — Minimizing risk with feature flags in vertical slice: https://amrelsher07.medium.com/minimizing-risk-in-code-refactoring-with-feature-flags-in-vertical-slice-84998c3943e6
- Sophos — The breachpocalypse is here: https://www.sophos.com/en-us/blog/the-breachpocalypse-is-here
- Anthropic — Threat Intelligence Report (Sep 2026): https://www.anthropic.com/threat-intelligence-report-september-2026

> Note: the Medium @nraddy1990 reference is **inaccessible** (HTTP 403) — it was
> not incorporated; it is listed here for traceability only, no content is quoted.
