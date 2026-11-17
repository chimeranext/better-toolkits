# Eval fixture notes — EVP SPMP (read-only)

**Fixture path (do not modify):** engagement brain
`plans/2026-11-05-plan-proyecto-evp.md` on the brain default branch (read-only eval).

**Templates scored:** `iso-16326-spmp` + risk companion `iso-16085-risk-management-plan`.
**Date of dry-run:** 2026-11-10.

## 16326 body (summary)

| Area | Score | Evidence |
| --- | --- | --- |
| Cover / id / standard | Presente | Portada cites ISO/IEC/IEEE 16326:2019 |
| Change history + approval | Parcial | Historial present; firmas vacías (borrador) |
| §1 Overview / scope | Presente | §1.1–1.2 + baseline stages |
| §2 References | Presente | Includes 16326; no 16085 cite yet |
| §3 Definitions | Parcial / light | Minimal glossary practice |
| §4 Context | Presente | Process, tools, acceptance, interfaces |
| §5 Planning | Presente | WBS/activities, milestones (open dates in annex) |
| §6 Evaluation/control | Presente | Weekly report, change orders |
| §7 Delivery | Presente / Parcial | Delivery path described; some opens in annex |
| §8 Supporting (non-risk) | Presente | QA, config, info, communication |
| §8.3 Risk | Parcial | Register + scales + owner; strategy/profile depth thin vs 16085 |
| §9 Additional plans | N-A justificado pattern | Uses annex opens rather than empty silent sections |

## 16085 §8.1.2 risk companion

| Heading | Score | Notes |
| --- | --- | --- |
| 1.x Introduction (purpose, policies, related standards) | Ausente / Parcial | Risk lives as SPMP §8.3 subsection; no standalone RM plan intro; 16085 not cited |
| 2.1 Strategy (criteria, thresholds, measures, improvement) | Parcial | Scales for probability/impact exist; thresholds/appetite/improvement process thin |
| 2.2 Context | Parcial | Categories (Técnico/Externo/Organizacional/Gestión) present |
| 3 Roles | Parcial | Isaac maintains register; RACI for risk process incomplete |
| 4.1–4.3 Identification / analysis / prioritization | Parcial | Identification yes; many Probabilidad/Impacto/Respuesta = Pendiente |
| 4.4 Treatment | Parcial | Column present; no §8.2 treatment plans for unacceptable risks |
| 4.5 Monitoring/reporting | Parcial | Weekly report mentions risks; continuous monitoring design light |
| 4.6 Risk profile fields | Parcial | Register table; missing detection likelihood, history, formal thresholds |
| 4.7 Communication/escalation | Parcial | Covered partly by §8.6 communication |
| 5 Resources schedule | Ausente | No dedicated risk-activity schedule/cost |

## Severity snapshot

- **Warning:** pending probability/impact/response on listed risks while plan is still
  borrador (per rubric: Warning in draft; Blocker after approval-for-execution).
- **Warning:** no 16085 strategy document / resources schedule.
- **Info:** optional PMBOK 8 Finance domain thin if overlay applied; Governance via
  approval record still unsigned.

## Remediation order (suggested — do not edit the fixture here)

1. Add linked `…-gestion-riesgos-16085.md` from §8.3 (or expand §8.3 to 16085 headings).
2. Fill strategy thresholds + residual treatment plans for high-impact risks.
3. Cite ISO/IEC/IEEE 16085 in SPMP references when the companion is adopted.
4. Keep atomic `type: riesgo` notes optional; they do not replace the RM plan.
