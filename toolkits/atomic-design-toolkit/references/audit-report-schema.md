# Audit Report Schema

Contract between `/atomic-design-toolkit:audit :report` (producer) and `/atomic-design-toolkit:migrate` (consumer). Every audit report follows this schema so tooling can round-trip it without re-running the audit.

## File Location & Naming

- Directory: `.atomic-design-toolkit/reports/` at the repo root
- Filename: `audit-{YYYYMMDD-HHMM}-{stack}.md`
  - `stack` = `flutter` or `vite`
  - Example: `audit-20260418-1530-vite.md`
- The folder is created if missing. Add `.atomic-design-toolkit/` to `.gitignore` unless the team wants reports committed as evidence (recommended for compliance-heavy projects).

## Required Structure

Every report has four top-level regions, in this order:

1. **YAML frontmatter** — machine-readable metadata
2. **TL;DR** — 2-3 sentence executive summary
3. **Findings** — blockers, warnings, info, and passing checks (structured)
4. **Appendices** — component inventory, design system gap analysis (if run), suggested phases

Any region may be empty but must be present (empty sections render as "(none)").

## Frontmatter Fields

```yaml
---
generated: 2026-04-18T15:30:00-06:00        # ISO-8601 with timezone — report timestamp
toolkit-version: 1.1.0                       # value from atomic-design-toolkit plugin.json
project-name: example-platform                        # from package.json "name" or pubspec.yaml "name"
project-version: 1.4.5                       # from package.json "version" or pubspec.yaml "version"

stack: vite                                  # "flutter" | "vite"
framework: react                             # "flutter" | "react" | "vue" | "svelte" | "solid" | "vanilla"
package-manager: bun                         # "npm" | "pnpm" | "yarn" | "bun" | "flutter"
design-system: chimera-ds                       # label; "custom" if no standard DS detected
design-system-base: shadcn                   # closest standard DS the custom system is based on (optional)

summary:
  blockers: 0                                # count of findings at blocker severity
  warnings: 2
  info: 0
  pass: 7                                    # count of 9 bundle-health checks that passed (Vite only)
  new-findings: 1                            # count of findings that did not map to any known signal

components:
  atoms: 12                                  # counts from Component Inventory section
  molecules: 8
  organisms: 15
  templates: 3
  pages: 24
  unclassified: 71                           # loose components not under atomic folders

design-system-gap:                           # present only if :design-system flag was combined
  system: tailwind-shadcn
  present: 38
  missing: 5
  partial: 2
---
```

### Required vs Optional Frontmatter

| Field | Required |
|-------|----------|
| `generated` | yes |
| `toolkit-version` | yes |
| `project-name` | yes |
| `stack` | yes |
| `framework` | yes |
| `summary.blockers`, `summary.warnings`, `summary.info` | yes |
| `summary.pass`, `summary.new-findings` | yes for Vite; optional for Flutter |
| `components.*` | yes |
| everything else | optional |

## Findings Structure

Each finding is a level-3 heading with a stable ID the migrate command can reference.

```markdown
### W1 — Outdated Stripe SDKs (3 majors behind)

- **Severity:** warning
- **Effort:** M
- **Risk:** breaking changes in payment flow at next forced upgrade
- **Phase fit:** 2 (dependency consolidation)
- **Signal:** #6 (abandoned / outdated deps)
- **Evidence:**
  ```
  bun outdated
  @stripe/react-stripe-js  3.10.0 → 6.2.0
  @stripe/stripe-js        7.9.0  → 9.2.0
  ```
- **Remediation:** Upgrade both SDKs on the next milestone; run the checkout E2E suite before merging.
- **Blocks:** (none)
- **Blocked by:** (none)
```

### Finding ID Convention

- `B{n}` = blocker (e.g. `B1`, `B2`)
- `W{n}` = warning (`W1`, `W2`)
- `I{n}` = info (`I1`, `I2`)
- `E{n}` = atomic-design enforcement finding from Step V7 (`E1`, `E2`, ...). Distinct namespace because E-findings track *future-drift exposure* (missing hooks / ownership / agent rules / CI guards), not current code defects. See the dedicated "Atomic-Design Enforcement" section below.
- `N{n}` = novel finding that did not match any known signal (candidate for promotion into `vite-audit-checklist.md`).

Numbering is within-tier and stable across report regenerations for the same project (the migrate command relies on this stability to track remediation state).

### Required Finding Fields

| Field | Required | Values |
|-------|----------|--------|
| `Severity` | yes | `blocker` / `warning` / `info` |
| `Effort` | yes | `S` (≤2h) / `M` (≤1 day) / `L` (>1 day) / `XL` (>1 week) |
| `Risk` | yes | free-form one-liner |
| `Phase fit` | yes | integer 0-5 matching the 6-phase migration model (below) |
| `Signal` | yes for known signals | `#1`-`#9` for bundle health, or `new` for novel findings |
| `Evidence` | yes | verbatim command output or file:line citations |
| `Remediation` | yes | actionable steps |
| `Blocks` / `Blocked by` | yes | space-separated finding IDs or `(none)` |

## Phase Model

The 6-phase model is derived from the Seacrets.Online modernization. `/migrate` uses it to order remediation work.

| Phase | Name | Purpose | Typical findings |
|-------|------|---------|------------------|
| 0 | Baseline | Cleanup with no user-visible change: delete unused deps, consolidate lockfiles | Dual lockfiles, dead dependencies |
| 1 | Infrastructure | Bring the build pipeline under control: `vite.config` hardening, HMR, source-map policy | HMR disabled, missing plugin-react, `public/` misuse |
| 2 | Dependency consolidation | Dedupe, fix duplicates, move vendored libs to npm, drop mixed majors | Signals #1, #3, #4, #6 |
| 3 | Feature modules | Migrate feature-by-feature to ESM / modern patterns | Legacy jQuery modules, per-feature bundle audits |
| 4 | Legacy asset removal | Delete `public/` files now unreferenced; unify CSS | Signal #2 |
| 5 | Hardening | Add CI audit, visual regression, CDN headers, atomic-design enforcement hooks | Signals #5, #7, #9, E1-E7 |

## Atomic-Design Enforcement (E-findings)

E-findings come from Step V7 of the audit (hook-presence audit). They track whether the project will *drift again* after current defects are remediated, not whether defects exist today.

### Section heading

E-findings render under their own level-3 heading inside the Findings region, between `### Info` and `### New findings`:

```markdown
### Atomic-Design Enforcement
```

The section may be empty (`(none)`) when all four cures are present — in that case the four V7 checks instead appear as one-liners under the `### Passing checks` section.

### Per-finding schema

```markdown
#### E1 — Repo PreToolUse hook for component placement (missing)

- **Cure Layer:** Repo PreToolUse hook
- **Severity:** warning
- **Effort:** S
- **Risk:** future writes to non-canonical paths land without resistance — drift recurs
- **Phase fit:** 5 (Hardening) — or 1 (Infrastructure) when the compounded-risk override fires
- **Signal:** V7 / E1
- **Evidence:** `ls .claude/hooks/` returned no matches for `pre-write*component*`; `.claude/settings.json` `hooks.PreToolUse` is absent.
- **Remediation:** Install `pre-write-component-location.sh` from `make-no-mistakes-toolkit@>=1.14`. Wire into `.claude/settings.json`. See `references/atomic-design-hooks-setup.md` §"Install the hooks".
- **Blocks:** (none) — or B/W IDs whose recurrence this hook would have prevented
- **Blocked by:** E4 (rules file must exist before hooks can enforce anything)
```

### Required fields for E-findings

| Field | Required | Values |
|-------|----------|--------|
| `Cure Layer` | yes | one of: `Repo PreToolUse hook` / `Repo PostToolUse hook` / `Toolkit hooks` / `.atomic-design-rules.json` / `Agent rule (CLAUDE.md/AGENTS.md)` / `CI workflow` / `Pre-commit hook` |
| `Severity` | yes | `blocker` / `warning` / `info` — per the severity matrix in V7 |
| `Effort` | yes | `S` / `M` / `L` / `XL` — installing a hook is typically `S` |
| `Risk` | yes | one-liner naming the failure mode the missing cure enables |
| `Phase fit` | yes | `5` by default; `1` when compounded-risk override fires |
| `Signal` | yes | `V7 / E{n}` |
| `Evidence` | yes | exact command output of the probe that came back negative |
| `Remediation` | yes | install instructions + link to `references/atomic-design-hooks-setup.md` |
| `Blocks` / `Blocked by` | yes | space-separated finding IDs or `(none)` — E4 typically blocks E1/E2/E3 |

### Compounded-risk override

If V1-V5 detected component-layer drift (monoliths, phantom hierarchies, dead duplicates, etc.) AND zero of the four cures are present, the **top E-finding is escalated to `blocker`** regardless of its individual severity. The remediation line must include the phrase "compounded risk override per premortem §5.2" so the migrate command can identify and route it to Phase 1.

This override is intentional: a repo with active drift AND no enforcement is the exact failure mode the $324K forward extrapolation describes. Do not soften.

### Frontmatter summary block

Add an `enforcement` subkey to the `summary` block when V7 ran:

```yaml
summary:
  blockers: 0
  warnings: 2
  info: 0
  pass: 7
  new-findings: 1
  enforcement:
    cures-present: 1      # 0-4
    cures-missing: 3      # 0-4
    drift-detected: true  # whether V1-V5 surfaced any component-layer drift
    compounded-override: false  # true when the top E-finding was escalated to blocker
---
```

## TL;DR Format

Three sentences, in this order:

1. Stack + severity summary — "This is a Vite + React project with 0 blockers, 2 warnings, and 1 new finding."
2. Top risk in plain English — "The largest exposure is Stripe SDKs being three majors behind, which can break payment flows on the next forced upgrade."
3. Recommended next action — "Run `/atomic-design-toolkit:migrate .atomic-design-toolkit/reports/audit-20260418-1530-vite.md` to generate a phased remediation plan."

## Appendices

Each appendix is optional but, if present, must use a fixed heading so the migrate command can skip or consume it.

| Heading | Content |
|---------|---------|
| `## Component Inventory` | Table of components by atomic level |
| `## Design System Gap` | Present / missing / partial / extra components |
| `## Suggested Phases` | Pre-sequenced plan that `/migrate` will refine |
| `## Re-audit Checklist` | Commands the user can run after remediation to confirm a signal flipped to PASS |

## Example (minimal)

```markdown
---
generated: 2026-04-18T15:30:00-06:00
toolkit-version: 1.1.0
project-name: example-platform
project-version: 1.4.5
stack: vite
framework: react
package-manager: bun
design-system: chimera-ds
design-system-base: shadcn
summary:
  blockers: 0
  warnings: 2
  info: 0
  pass: 7
  new-findings: 1
  enforcement:
    cures-present: 1
    cures-missing: 3
    drift-detected: false
    compounded-override: false
components:
  atoms: 12
  molecules: 8
  organisms: 15
  templates: 3
  pages: 24
  unclassified: 71
---

# Audit Report — example-platform

## TL;DR

Vite + React project with 0 blockers, 2 warnings, and 1 new finding. The largest exposure is Stripe SDKs three majors behind, which can break payment flows on the next forced upgrade. Run `/atomic-design-toolkit:migrate .atomic-design-toolkit/reports/audit-20260418-1530-vite.md` to generate a phased remediation plan.

## Findings

### Blockers

(none)

### Warnings

#### W1 — Outdated Stripe SDKs (3 majors behind)

- **Severity:** warning
- **Effort:** M
- **Risk:** breaking changes in payment flow at next forced upgrade
- **Phase fit:** 2
- **Signal:** #6
- **Evidence:** `bun outdated` → `@stripe/react-stripe-js 3.10.0 → 6.2.0`, `@stripe/stripe-js 7.9.0 → 9.2.0`
- **Remediation:** Upgrade both SDKs; run the checkout E2E suite before merging.
- **Blocks:** (none)
- **Blocked by:** (none)

#### W2 — No `bun audit` in CI

- **Severity:** warning
- **Effort:** S
- **Risk:** vulnerable dependencies only caught manually
- **Phase fit:** 5
- **Signal:** #7
- **Evidence:** 19 workflows under `.github/workflows/`, none run `bun audit`, `npm audit`, or equivalent.
- **Remediation:** Add `bun audit --prod --severity high` to `lint.yml` or dedicated workflow.
- **Blocks:** (none)
- **Blocked by:** (none)

### Info

(none)

### Atomic-Design Enforcement

#### E1 — Repo PreToolUse hook for component placement (missing)

- **Cure Layer:** Repo PreToolUse hook
- **Severity:** warning
- **Effort:** S
- **Risk:** future writes to non-canonical paths land without resistance — drift recurs
- **Phase fit:** 5
- **Signal:** V7 / E1
- **Evidence:** `ls .claude/hooks/` returned only `pre-write-decision-record-location.sh`; no `pre-write*component*` script; `.claude/settings.json` has no `hooks.PreToolUse` entry for component placement.
- **Remediation:** Install `pre-write-component-location.sh` from `make-no-mistakes-toolkit@>=1.14`. Wire into `.claude/settings.json`. See `references/atomic-design-hooks-setup.md` §"Install the hooks".
- **Blocks:** (none)
- **Blocked by:** E4

#### E4 — `.atomic-design-rules.json` missing at repo root

- **Cure Layer:** `.atomic-design-rules.json`
- **Severity:** warning
- **Effort:** S
- **Risk:** hooks have no contract to enforce; pillar list lives only in CLAUDE.md (drifts silently)
- **Phase fit:** 5
- **Signal:** V7 / E4
- **Evidence:** `test -f .atomic-design-rules.json` → file not found.
- **Remediation:** Create per the schema in `references/atomic-design-hooks-setup.md` §"Declare the consumer's atomic-design rules". Mirror the pillar list and atomic taxonomy from CLAUDE.md.
- **Blocks:** E1 E2 E3
- **Blocked by:** (none)

#### E6 — CI workflow has no atomic-design lint

- **Cure Layer:** CI workflow
- **Severity:** warning
- **Effort:** M
- **Risk:** drift that bypasses the local hook (e.g. force-push) reaches main without resistance
- **Phase fit:** 5
- **Signal:** V7 / E6
- **Evidence:** `rg -l 'components-guard|atomic-design-guard|structural-guard' .github/workflows/` returned no matches across 19 workflow files.
- **Remediation:** Add a `structural-guard` step to `lint.yml` (analog of `primitives-guard.ts` in legacy-ticket). Fail builds on violations.
- **Blocks:** (none)
- **Blocked by:** E4

### New findings

#### N1 — Dual lockfiles (bun.lock + package-lock.json)

- **Severity:** warning
- **Effort:** S
- **Risk:** lockfile drift; CI may resolve dependencies from the wrong tool
- **Phase fit:** 0
- **Signal:** new
- **Evidence:** `bun.lock` (3491 lines) and `package-lock.json` (18314 lines) both exist; `package.json` declares `packageManager: bun@1.3.10`.
- **Remediation:** Delete `package-lock.json`, add to `.gitignore`, document bun as the single package manager in CLAUDE.md / README.
- **Blocks:** (none)
- **Blocked by:** (none)

### Passing checks

- Signal #1 (duplicate dependencies) — react / react-dom resolve once
- Signal #2 (legacy public/ JS/CSS) — only images, manifest, icons under public/
- Signal #3 (mixed major versions) — none detected
- Signal #4 (vendorized libs) — no vendor/ outside node_modules
- Signal #5 (hashless HTML assets) — `<script type="module" src="/src/main.tsx">` is the Vite dev entry, gets hashed in prod
- Signal #8 (HMR) — default-enabled, `@vitejs/plugin-react-swc` provides Fast Refresh
- Signal #9 (visual regression) — Chromatic + Playwright with `--update-snapshots`
- V7 / E5 (CLAUDE.md atomic-design rule) — section present naming the 10-pillar taxonomy

## Component Inventory

| Level | Count | Location |
|-------|-------|----------|
| Atoms | 12 | `src/components/ui/` |
| Molecules | 8 | `src/components/ui/` |
| Organisms | 15 | `src/components/ui/` + `src/features/*` |
| Templates | 3 | `src/layouts/` |
| Pages | 24 | `src/pages/` |
| Unclassified | 71 | mixed under `src/components/{domain}/` |

## Suggested Phases

- Phase 0 — N1 (delete package-lock.json)
- Phase 2 — W1 (upgrade Stripe SDKs)
- Phase 5 — W2 (add bun audit to CI), E4 (create .atomic-design-rules.json), E1 (install repo PreToolUse hook), E6 (add structural-guard step to CI)

## Re-audit Checklist

- [ ] Rerun `/atomic-design-toolkit:audit :vite :report` after Phase 0
- [ ] Rerun `bun outdated` and confirm Stripe SDKs at 6.x / 9.x after Phase 2
- [ ] Confirm workflow `lint.yml` calls `bun audit --prod --severity high` after Phase 5
- [ ] Confirm `.atomic-design-rules.json` parses and lists all 10 pillars (`jq '.pillars | length' .atomic-design-rules.json`)
- [ ] Confirm `.claude/hooks/pre-write-component-location.sh` exists, is executable, and is registered in `.claude/settings.json`
- [ ] Confirm CI run on the next PR fails with a structural-guard violation when a component is placed under a non-pillar folder
```

## Stability Guarantees

- **Schema version** is implied by `toolkit-version`. Breaking schema changes bump the toolkit minor version.
- **Finding IDs** remain stable across re-audits of the same project. If a finding disappears (remediated), its ID is retired, not reused.
- **New findings** get IDs after existing ones (`W3`, `W4`, ...) — never reshuffled.
- **`Blocks` / `Blocked by`** references must exist within the same report — never external.
