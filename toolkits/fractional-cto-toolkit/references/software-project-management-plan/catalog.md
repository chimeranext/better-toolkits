# SPMP template catalog

Single writer: `fractional-cto-toolkit`. Consumers (including
`business-brain-template/_templates/`) receive **exports** — do not author
templates there.

Load this catalog before authoring or auditing. Ask which `id` applies when
ambiguous; defaults are marked.

## Project management plan templates

| id | When to use | Normative base | Path |
| --- | --- | --- | --- |
| `iso-16326-spmp` | **Default** fill template for systems/software project management plans (PSA Hito 1) | ISO/IEC/IEEE 16326:2019 §7 | `templates/iso-16326-spmp.md` |
| `iso-16326-spmp-bare` | **Preventa** empty outline (show methodology; do not fill as unpaid engineering) | ISO/IEC/IEEE 16326:2019 §7 | `templates/iso-16326-spmp-bare.md` |
| `pmbok8-core-set` | Engagement wants separate charter/scope/WBS/schedule/risks artifacts instead of one SPMP body | PMBOK 8 teaching structure (summary crosswalk; not PMBOK 5 PDF) | `templates/pmbok8-core-set/` |

## Risk companion templates (choose with the SPMP)

**Writer skill:** `/software-risks-authoring-16085` consumes the 16085 rows.
`/iso31000` consumes the 31000 row. Do not leave these templates without a skill
that emits the deliverable.

| id | When to use | Normative base | Path | Consumed by |
| --- | --- | --- | --- | --- |
| `iso-16085-risk-management-plan` | **Default** fill template for project risk companion. A plan following 16085 §8.1.2 should satisfy 16326 Clause 7 risk-management plan content | ISO/IEC/IEEE 16085:2021 §8.1 | `templates/iso-16085-risk-management-plan.md` | `software-risks-authoring-16085` |
| `iso-16085-risk-management-plan-bare` | **Preventa** empty RM outline | ISO/IEC/IEEE 16085:2021 §8.1 | `templates/iso-16085-risk-management-plan-bare.md` | preventa copy / Anexo D |
| `iso-16085-risk-treatment-plan` | Fill template when a risk needs §8.2 treatment — gated by Eisenhower in `software-risks-authoring-16085` | ISO/IEC/IEEE 16085:2021 §8.2 | `templates/iso-16085-risk-treatment-plan.md` | `software-risks-authoring-16085` |
| `iso-16085-risk-treatment-plan-bare` | **Preventa** empty treatment outline (fill in Hito 1 when Eisenhower requires or offers) | ISO/IEC/IEEE 16085:2021 §8.2 | `templates/iso-16085-risk-treatment-plan-bare.md` | preventa copy / Anexo D |
| `pmbok-risk-note` | Atomic per-risk note in a business brain | PMBOK 8 Risk domain (lightweight) | Brain `_templates/riesgo.md` — **not overwritten by export** | vault / Holocron (not this export) |
| `iso-31000-risk-analysis` | Org-wide GRC risk/opportunity register (ISO 9001 thinking + 31000 process) | ISO 31000:2018 + ISO 9001:2015 | `../grc/iso31000/templates/analisis-riesgos-iso31000.md` | `/iso31000` |

## Overlays (optional audit/authoring lenses)

| id | When to use | Path |
| --- | --- | --- |
| `pmbok8-domain-overlay` | Score or fill coverage across Governance, Scope, Schedule, Finance, Stakeholders, Resources, Risk | `pmbok8-crosswalk.md` |

## Selection rules

1. Software/systems project → start with `iso-16326-spmp` + `iso-16085-risk-management-plan`.
2. Do **not** substitute `iso-31000-risk-analysis` for 16085 on an SPMP; 31000 is organizational GRC (16085 §5.2.3 bridge).
3. Keep `pmbok-risk-note` for atomic vault notes; link them from the risk profile, do not replace the RM plan.
4. Empty required sections use: `This section is not applicable to this plan` (or Spanish equivalent) **plus reason** — same convention as 16326/16085/EVP.
