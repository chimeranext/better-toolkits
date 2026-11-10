# SPMP template catalog

Single writer: `fractional-cto-toolkit`. Consumers (including
`business-brain-template/_templates/`) receive **exports** — do not author
templates there.

Load this catalog before authoring or auditing. Ask which `id` applies when
ambiguous; defaults are marked.

## Project management plan templates

| id | When to use | Normative base | Path |
| --- | --- | --- | --- |
| `iso-16326-spmp` | **Default** for systems/software project management plans | ISO/IEC/IEEE 16326:2019 §7 | `templates/iso-16326-spmp.md` |
| `pmbok8-core-set` | Engagement wants separate charter/scope/WBS/schedule/risks artifacts instead of one SPMP body | PMBOK 8 teaching structure (summary crosswalk; not PMBOK 5 PDF) | `templates/pmbok8-core-set/` |

## Risk companion templates (choose with the SPMP)

| id | When to use | Normative base | Path |
| --- | --- | --- | --- |
| `iso-16085-risk-management-plan` | **Default** risk companion for a 16326 SPMP. A plan following 16085 §8.1.2 should satisfy 16326 Clause 7 risk-management plan content | ISO/IEC/IEEE 16085:2021 §8.1 | `templates/iso-16085-risk-management-plan.md` |
| `iso-16085-risk-treatment-plan` | When a risk is unacceptable and needs a treatment plan (16085 §8.2) | ISO/IEC/IEEE 16085:2021 §8.2 | `templates/iso-16085-risk-treatment-plan.md` |
| `pmbok-risk-note` | Atomic per-risk note in a business brain | PMBOK 8 Risk domain (lightweight) | Brain `_templates/riesgo.md` — **not overwritten by export** |
| `iso-31000-risk-analysis` | Org-wide GRC risk/opportunity register (ISO 9001 thinking + 31000 process) | ISO 31000:2018 + ISO 9001:2015 | `../grc/iso31000/templates/analisis-riesgos-iso31000.md` |

## Overlays (optional audit/authoring lenses)

| id | When to use | Path |
| --- | --- | --- |
| `pmbok8-domain-overlay` | Score or fill coverage across Governance, Scope, Schedule, Finance, Stakeholders, Resources, Risk | `pmbok8-crosswalk.md` |

## Selection rules

1. Software/systems project → start with `iso-16326-spmp` + `iso-16085-risk-management-plan`.
2. Do **not** substitute `iso-31000-risk-analysis` for 16085 on an SPMP; 31000 is organizational GRC (16085 §5.2.3 bridge).
3. Keep `pmbok-risk-note` for atomic vault notes; link them from the risk profile, do not replace the RM plan.
4. Empty required sections use: `This section is not applicable to this plan` (or Spanish equivalent) **plus reason** — same convention as 16326/16085/EVP.
