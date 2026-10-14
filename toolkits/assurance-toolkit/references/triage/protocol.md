# /assurance:triage — protocol SSOT (hub)

Harness-agnostic router. Thin entry: `commands/triage.md`.

assurance writes **evidence**; dev workflows consume it in **gates**. `/assurance:triage`
classifies PR-stage evidence **per pillar** and returns a single verdict before
code-review bots run.

---

## Invocation

```text
/assurance:triage [pr|testing|security|liveness|governance] [--pr N] [--issue TEAM-N] [$ARGUMENTS...]
```

| Mode | When | Runs |
| --- | --- | --- |
| **`pr`** (default) | Ready-to-review / PR gate | Every pillar marked `required` or `optional` for stage `pr` in config; skips `skip`. |
| **`<pillar>`** | Deep dive on one pillar | That pillar's sub-protocol only. |

**Liveness on PR:** default is **`skip`** in the toolkit example — not “forgotten”.
Consumer repos may set `readyToReview.assurance.pillars.liveness` to **`required`**
when observability must gate every PR; otherwise liveness runs on schedule/daemon.

Resolve PR number from `--pr N`, else `gh pr view` for the current branch.

---

## Sub-protocols (SSOT)

| Pillar | Sub-protocol | Typical PR stage |
| --- | --- | --- |
| testing | [`references/testing/triage-protocol.md`](../testing/triage-protocol.md) | `required` |
| security | [`references/security/triage.md`](../security/triage.md) | `required` |
| liveness | [`references/liveness/triage.md`](../liveness/triage.md) | `skip` (default) |
| governance | [`references/governance/triage.md`](../governance/triage.md) | `required` |

Run sub-protocols **in order**: testing → security → governance → liveness (only if
not `skip`). Stop on first `BLOCKED` unless config sets `continueOnOptionalFailure`.

### OpenSpec PR gate (assurance-governance)

Normative requirement:
`openspec/changes/add-assurance-toolkit/specs/toolkit/assurance-governance/spec.md`
→ **Gates por etapa, rápidos primero** (PR row).

| PR gate criterion (spec) | Pillar / sub-protocol |
| --- | --- |
| tests 100% | testing → [`references/testing/triage-protocol.md`](../testing/triage-protocol.md) |
| security críticas 0 | security → [`references/security/triage.md`](../security/triage.md) |
| `coverage_delta` ≥ 0 (+ PR receipt when configured) | governance → [`references/governance/triage.md`](../governance/triage.md) |

Mode **`pr`** runs the rows above (per config). Mode **`testing`** (or any single pillar)
runs **one row only** — it does **not** satisfy the full PR gate alone.

```mermaid
flowchart TD
    I["assurance triage hub"]
    I --> M{"mode?"}
    M -->|pr| T["testing pillar"]
    M -->|single pillar| P["one sub-protocol only"]
    T --> VT{"PASS?"}
    VT -->|no| B["BLOCKED pillar reason links"]
    VT -->|yes| S["security pillar"]
    S --> VS{"PASS?"}
    VS -->|no| B
    VS -->|yes| G["governance pillar plus PR receipt"]
    G --> VG{"PASS?"}
    VG -->|no| B
    VG -->|yes| L{"liveness required?"}
    L -->|no| V["aggregate PASS"]
    L -->|yes| LV["liveness pillar"]
    LV --> V
    P --> V
```

Per-pillar **gate steps** (CI checks, scanners, `coverage_delta`, receipt) are in each
sub-protocol flowchart linked in the table above — the hub diagram is orchestration only.

## Sequence (RTR §2b — before remote bots)

```mermaid
sequenceDiagram
  participant RTR as ready-to-review-mergeable
  participant Hub as assurance-triage-pr
  participant T as testing-triage
  participant S as security-triage
  participant G as governance-triage
  participant L as liveness-triage
  participant Bots as Greptile CodeRabbit

  RTR->>Hub: RTR section 2b pr N issue tracker
  Hub->>T: required pillar
  T-->>Hub: PASS or BLOCKED
  Hub->>S: required pillar
  S-->>Hub: PASS or BLOCKED
  Hub->>G: required pillar plus receipt
  G-->>Hub: PASS or BLOCKED
  Hub->>L: liveness when not skip
  L-->>Hub: PASS or BLOCKED or SKIP
  alt aggregate PASS
    Hub-->>RTR: PASS then tag bots section 3b
    RTR->>Bots: remote review after section 3a preconditions
  else aggregate BLOCKED
    Hub-->>RTR: BLOCKED no bot tag
  end
```

---

## Verdict contract

Each sub-protocol returns:

```text
PASS | BLOCKED | SKIP
```

Hub aggregate:

- **PASS** — all non-skipped pillars PASS.
- **BLOCKED** — at least one required pillar BLOCKED; include pillar id + reason +
  links (CI run, scanner, receipt path).
- **SKIP** — entire hub skipped (e.g. assurance plugin absent and config allows).

Write a PR-stage receipt when `governance` sub-protocol requires it (see
`references/governance/triage.md`).

---

## Configuration

Consumer repo optional keys:

- `make-no-mistakes.config.json` → `readyToReview.assurance`
- or `assurance.config.json` at repo root (same shape)

See `toolkits/make-no-mistakes-toolkit/commands/make-no-mistakes.config.example.json`.

---

## LESSONS (hub)

- L1 (assurance `protocol.md` GitHub Mermaid render failure) Flowcharts on github.com
  break when edge labels use `:` (e.g. `|no: BLOCKED|`), node text embeds `/` or
  `§`, or accents in unquoted nodes; sequence diagrams break when `opt` nests
  inside `alt` without closing. Dogfood profile:
  `platform/diagrams/mermaid-github` (change `add-conventions-platform-docs-diagrams`).

---

## Relationship to other commands

- **`/assurance:triage security`** — same hub, mode `security`. Findings
  (queue → owner → SLA → receipt) are [`references/security/findings-protocol.md`](../security/findings-protocol.md).
  Arguments: `list`, `dry-run`, a scanner id, `phase2`, `phase7`, `manual`,
  `pentest-report`, plus `--pr`, `--run`, `--repo`. No separate findings command.
- **`/make-no-mistakes:ready-to-review-mergeable`** — calls this hub at **§2b**. On PASS it
  runs **§2c** `/assurance:e2e-test-builder` with the testing pillar output,
  then **§3b** remote review (§3c gate green before §5 handoff).
  `/assurance:e2e-test-runner` is the stage QA assignee step, not this hub.
