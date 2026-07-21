---
description: Triage security scan findings (pentest playbook + CI) into owned backlog items. Accepts scanner, phase, PR, or run as $ARGUMENTS. Backlog SSOT is the tracker issue body — no duplicate brief files.
argument-hint: "[list|dry-run|scanner|phase2|phase7|manual|pentest-report] [--pr N] [--run ID] [--repo org/repo]"
priority: 25
---

# /triage-security-findings — Triage playbook & CI security findings

You are a platform/security engineer **triaging findings** into **owned backlog items** (Linear `SCRT-*` on Seacrets; adapt team key per tenant). This command is step **3** of the pentest trilogy — run [`/pentest-playbook-setup`](pentest-playbook-setup.md) first when config drift is unknown; pair with [`/pentest-runner`](pentest-runner.md) (execute tests).

**Playbook SSOT (Seacrets):** `seacrets.online-docs/how-to/operations/pentest-playbook.md`  
**Tenant config SSOT:** `seacrets.online-docs/linear-setup.json` → `securityFindingTriage`  
**Policy (Isaac, 2026-07):** CI advisory findings (Hadolint first) → **one backlog issue per actionable finding** (dedupe by scanner + location + rule).

**Do not** write `implementation-briefs/*.md` — tracker issue description **is** the bilingual brief.

The user input can be provided directly by the agent or as a command argument — you MUST consider it before proceeding (if not empty).

**Input:** `$ARGUMENTS`

---

## How to use

```text
/triage-security-findings list
/triage-security-findings dry-run hadolint
/triage-security-findings hadolint [--pr N] [--run ID] [--repo org/repo]

# Playbook Phase 2 — automated CI (primary)
/triage-security-findings composer-audit
/triage-security-findings semgrep
/triage-security-findings gitleaks
/triage-security-findings checkov
/triage-security-findings trivy-fs
/triage-security-findings trivy-config
/triage-security-findings trivy-image
/triage-security-findings zap

# Batch
/triage-security-findings phase2 [--pr N]    # All Phase 2 CI scanners for a PR
/triage-security-findings phase7 [--pr N]    # DevSecOps CI gate (subset; see linear-setup phaseBatch)

# Playbook Phase 3–5 — manual / stage-only (no CI log parse)
/triage-security-findings manual burp
/triage-security-findings manual testssl
/triage-security-findings manual kube-bench
/triage-security-findings pentest-report <url-or-path>   # From /pentest-runner §6.2 findings

# Dependabot (GitHub API, not Actions log)
/triage-security-findings dependabot [--repo org/repo]
```

---

## Step 0 — Load SSOT

1. Read tenant `linear-setup.json` → `securityFindingTriage.scanners` (Seacrets: `seacrets.online-docs/linear-setup.json`).
2. Read `pentest-playbook.md` for phase context, severity SLAs (§6.1), finding template (§6.2).
3. Read `owasp-audit-inventory.md` when mapping to OWASP-H* / GAP-* / EXC-*.
4. Linear MCP + `gh` for runs/logs/Dependabot.

---

## Scanner catalog (playbook ↔ Seacrets CI)

Aligned with **pentest-playbook** Phases 2–4, 7–8. Manual-only tools create **Human/Review** issues from template — do not pretend to parse CI logs.

| Scanner key | Playbook | Phase | Repo | Workflow / source | Job | Advisory? |
| --- | --- | --- | --- | --- | --- | --- |
| `composer-audit` | §2.1 SCA | 2 | `seacrets.online-app` | `security-dependencies.yml`, `deployment-pipeline.yml` | composer audit | mixed |
| `semgrep` | §2.2 SAST | 2 | `seacrets.online-app` | `security-static-analysis.yml` | semgrep | advisory |
| `gitleaks` | §2.3 secrets | 2 | `seacrets.online-app` | `security-scan.yml` | MegaLinter (GITLEAKS) | blocking on PR |
| `checkov` | §2.2 IaC | 2 | `seacrets.online-infra` | `security-iac.yml` | Checkov Terraform | advisory |
| `trivy-config` | §2.2 misconfig | 2 | `seacrets.online-gitops` | `security-iac.yml`, `security-scan.yml` | Trivy config | advisory |
| `trivy-fs` | §2.1 / Trivy | 2 | `seacrets.online-app` | `security-containers.yml` | Trivy filesystem | advisory |
| `trivy-image` | §2.1 container | 2 | `seacrets.online-app` | `deployment-pipeline.yml` | Trivy image SARIF | blocking path |
| `hadolint` | container hygiene | 2/7 | `seacrets.online-app` | `security-containers.yml` | Hadolint | advisory |
| `zap` | §3.1 DAST | 3 | `seacrets.online-app` | `security-dast-stage.yml` | ZAP baseline | advisory, stage |
| `dependabot` | §2.1 / OWASP-H6 | 2 | org | GitHub Dependabot API | alerts | varies |
| `phpstan-security` | §2.2 (static) | 2 | `seacrets.online-app` | `deployment-pipeline.yml` | phpstan-ci | blocking |
| `baseline-script` | §2.2 | 2 | `seacrets.online-app` | `scripts/security/run-baseline-scans.sh` | local/CI | manual invoke |
| `burp` | §3.1 | 3 | stage | manual | — | Human issue |
| `testssl` | §4 | 4 | stage | manual | — | Human issue |
| `kube-bench` | §3.3 | 3 | stage cluster | SRE-supervised | — | Human + Infra |
| `kube-hunter` | §3.3 | 3 | stage cluster | SRE-supervised | — | Human + Infra |
| `shannon` | §8 | 8 | stage | DOC-GAP-02 stub | — | Spike only |
| `trufflehog` | §2.3 | 2 | local | not CI SSOT | — | local → manual issue |

**Not in automated triage path:** Phase 1 passive recon (OSINT, dig, Wappalyzer), Phase 5 post-exploit, Phase 6 report archive (`compliance/audit-reports/`), LogQL PII spot-check (manual `pentest-report`), product pentest on PR (use `/pentest-runner` + `pentest-report` here).

---

## Step 1 — Collect findings

### CI scanners (automated parse)

```bash
gh pr checks <PR> --repo <org/repo>
gh run view <RUN_ID> --repo <org/repo> --log-failed
gh run download <RUN_ID> --repo <org/repo> -n megalinter-app-<RUN_ID>
```

**Hadolint local:**

```bash
docker run --rm -i hadolint/hadolint hadolint -f json - < frankenphp.Dockerfile
```

**Composer audit local:**

```bash
composer audit --format=plain --abandoned=ignore
```

**Dependabot:**

```bash
gh api repos/Seacrets-Online/seacrets.online-app/dependabot/alerts --jq '.[] | select(.state=="open")'
```

Parse into normalized records: `{scanner, rule, severity, path, line, message, runUrl}`.

---

## Step 2 — Dedupe

1. Search open tracker issues — scanner + rule code + path.
2. Open issue same **scanner + file + rule (+ line bucket)** → comment with new run URL only.
3. Regressions on Done issues → new Improvement or reopen with evidence.

---

## Step 3 — Create backlog item

Issue description uses **bilingual format** (Human + Agent layers) + **playbook §6.2** when severity ≥ Medium:

```markdown
> **Scanner:** {scanner}
> **Playbook phase:** {N}
> **Repo:** {org/repo}
> **Evidence:** {run url | manual note}

---

## HUMAN LAYER
### User Story / Background / Pitfalls
...

## AGENT LAYER
### Objective / Acceptance Criteria / Verification
...

## Finding (playbook §6.2)
### Severity / CVSS
### Component: app|gitops|infra|edge|identity
### Environment: stage | devel | main (passive)
### Description / Impact / Remediation
### References: OWASP-… / GAP-… / EXC-…
```

Apply labels/projects from `securityFindingTriage.scanners.{key}` in tenant config. Branch: `*/scrt-{N}-*`. PR: `Fixes SCRT-{N}`.

---

## Step 4 — Post-create

1. One summary PR comment if triaging from a PR (bullet list of new issue ids).
2. Slack: repo `#dev-*` top-level per tenant `linear-setup.json` (not legacy channels).
3. Critical secrets in Gitleaks → follow tenant exposed-secrets runbook; **never** paste live secrets in tracker/Slack.
4. **No** files under `implementation-briefs/`.

---

## Relationship to other commands

| Command | Role |
| --- | --- |
| `/pentest-playbook-setup` | Audit/sync playbook ↔ CI ↔ tenant config |
| `/pentest-runner` | **Run** authorized tests (phases 1–8); produce evidence |
| `/triage-security-findings` | **Triage** CI + pentest output into owned backlog |
| `/spec-recommend` | Greenfield specs → OpenSpec + Linear (not for scan triage) |
| `/ready-to-review-mergeable` | Fix PR + CI green (after fix work) |

---

## Safety

- Stage-only active exploitation per playbook; never DAST/fuzz production without approval.
- Group noisy same-rule Hadolint/Checkov nits into one issue when one PR fixes all.
- Default priority: Medium for advisory hardening; High/Urgent only for exploitable paths or live secrets.
