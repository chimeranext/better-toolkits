# launchpad-toolkit

> **Methodology prototype laboratory** para el pillar **chimeranext Launchpad** — AI intake, cap table, co-founder matching, investor matching, demo day prep, stage tracker.

Plugin de Claude Code complementario a [`business-model-toolkit`](https://github.com/chimeranext/business-model-toolkit) (single-venture lifecycle), [`ux-research-toolkit`](https://github.com/chimeranext/ux-research-toolkit) (user research) y [`venture-studio-toolkit`](https://github.com/chimeranext/venture-studio-toolkit) (MACRO portfolio management).

**Posición en el ecosistema**:

| Plugin | Scope | Owner chimeranext alineado |
|---|---|---|
| `business-model-toolkit` | Single venture lifecycle (21 fases) | — |
| `ux-research-toolkit` | User research maps + personas | — |
| `venture-studio-toolkit` | MACRO — portfolio, studio, legal structures | Daniel Garbanzo |
| **`launchpad-toolkit`** | **MICRO — single venture launchpad journey** | **William Ugalde** |

## Propósito dual

Este plugin sirve **dos audiencias al mismo tiempo**, y esto es **por diseño** — no es overlap accidental:

### 1. External — founders sin chimeranext

Founders individuales que necesitan:
- Intake interview estructurado → startup profile artifact
- Cap table builder + vesting calculator para primer grant
- Founder documents (agreements, SAFE, term sheet) basados en templates
- Investor matching para early fundraising
- Demo day application prep
- Stage tracker por milestones (Ideation → Formation → MVP → Traction → Funded → Scaling)

### 2. Internal — laboratorio metodológico para chimeranext Launchpad

**William Ugalde** es el owner del pillar Launchpad en chimeranext. Este plugin replica las features del Launchpad product de chimeranext como **prototipos metodológicos** que:

- Validan UX/flows antes de comprometer código en chimeranext
- Reducen productization risk (ya sabés qué funciona antes de implementar)
- Alimentan SPIKE issues en Linear para William via el skill `feature-to-spike`

**Duplicar funcionalidad chimeranext acá NO es error — es el diseño**. El loop metodología → dog-food → SPIKE → feature chimeranext está explicado en [`references/productization-workflow.md`](./references/productization-workflow.md).

## Estado actual

**v0.5.0 — chimeranext-api-consumer agent shipped. All v0.x scope items delivered.**

Sub-issue de ejecución bootstrap: [legacy-ticket](https://linear.app/chimera-coding/issue/legacy-ticket) ✓ Done (parent SPIKE: [legacy-ticket](https://linear.app/chimera-coding/issue/legacy-ticket)).

### v0.x release summary

| Version | Shipped | Scope |
|---|---|---|
| v0.1.0 | ✓ | Initial scaffold + `startup-intake` + `feature-to-spike` skills |
| v0.2.0 | ✓ | `cap-table-builder` + `founder-documents` skills |
| v0.3.0 | ✓ | `cofounder-matching` + `investor-matching` + `demo-day-prep` + `stage-tracker` skills |
| v0.4.0 | ✓ | `/propose-spike` command |
| **v0.5.0** | ✓ | **`chimeranext-api-consumer` agent** — final v0.x scope item |

### Skills (8 — full v0.x scope)

**Core (v0.1)**:
- **`startup-intake`** — AI intake interview que produce un `startup-profile.md` compatible schema-wise con chimeranext Startup Profile
- **`feature-to-spike`** — **Differentiator del plugin**. Transforma learnings del dog-food en Linear SPIKE issues formateados para William

**Founder setup (v0.2)**:
- **`cap-table-builder`** — cap table inicial para single venture: founders + option pool + advisor pool + SAFEs + convertible notes + vesting + SAFE conversion modeling
- **`founder-documents`** — stack legal founder: FSPA, IP Assignment, Vesting Exhibit, Advisor (FAST), SAFE (YC post-money), Term Sheet (NVCA)

**Matching + fundraising + tracking (v0.3)**:
- **`cofounder-matching`** — rubric 6-axis (domain / skill / values / equity / time / track record) con weighted scoring ajustado por stage. Kill-switches override score.
- **`investor-matching`** — 5-axis scoring (stage / check / thesis / geography / value-add) con priority configurable. Pipeline tracker incluido.
- **`demo-day-prep`** — 4 artefactos: application, 10-slide deck outline, 3-min script, 50+ Q&A bank. Rehearsal best practices 5-5-5.
- **`stage-tracker`** — 6 stages (Ideation → Scaling) con exit criteria + chimera Score (5-axis, 0-100). Evidence-over-claim principle.

### Commands (v0.4)

- **`/launchpad-toolkit:propose-spike`** — wrapper command over `feature-to-spike` skill con auto-assignee William + auto-parent legacy-ticket + auto-labels + optional direct file via Linear MCP. Acepta `$ARGUMENTS` como seed del concrete pattern.

### Agents (v0.5)

- **`chimeranext-api-consumer`** — spec-driven enrichment agent que consume la OpenAPI spec de chimeranext (`https://docs.chimeranext.io/openapi.yaml`, shipped via legacy-ticket). Lee el spec una vez por sesión, resuelve operaciones solicitadas por skills (ej. `list_candidate_pool`, `get_investor_database`, `sync_stage`), ejecuta llamadas HTTP autenticadas con Bearer JWT, y retorna YAML estructurado con status codes (`LIVE_DATA` / `NOT_IMPLEMENTED` / `SPEC_GAP` / `AUTH_REQUIRED` / `RATE_LIMITED` / `ERROR`). **Nunca fabrica respuestas**. Cuando un endpoint no existe en el spec, retorna `SPEC_GAP` con un `SPIKE_SUGGESTION` listo para alimentar el skill `feature-to-spike`. Los skills `cofounder-matching`, `investor-matching`, y `stage-tracker` ya mencionan al agente como path opcional de enrichment.

### Reference docs (1)

- **`productization-workflow.md`** — Cómo fluye methodology → SPIKE → chimeranext feature

### Qué endpoints del API están live hoy

El spec expone 12 endpoints (Agent, Courses, Projects, Billing, Users, Admin, Media, Email). El agente les da acceso via semantic aliases (`get_user_courses`, `switch_role`, `submit_b2b_lead`, `create_checkout_session`, etc.).

Los endpoints **launchpad-specific** (cofounder pool, investor DB, demo-day queue, stage sync, chimera Score, document templates, cap-table platform link) NO están en el spec todavía — el agente los retorna como `SPEC_GAP` y auto-sugiere SPIKES para William. Expected trajectory: conforme William + Daniel shipping endpoints, los `SPEC_GAP` convierten a `LIVE_DATA` sin cambios en el agente (es spec-driven, no endpoint-hardcoded).

### Bearer token — cómo autenticar

El agente espera un Supabase JWT en la variable de entorno `chimeranext_BEARER_TOKEN`. Cómo obtenerlo:

1. Sign in en https://dev.chimeranext.io (staging) o https://chimeranext.io (prod)
2. DevTools → Application → Local Storage → key `sb-<project-ref>-auth-token`
3. Copiar `access_token` del JSON value
4. `export chimeranext_BEARER_TOKEN="<paste-here>"`

Default base URL es staging (`pphagffyuibcfulgrpjb.supabase.co`). Para producción, explicit opt-in: `export chimeranext_API_BASE_URL="https://<prod-ref>.supabase.co/functions/v1"`.

## Instalación

```bash
claude plugin add chimeranext/launchpad-toolkit
```

⚠️ **Stability disclaimer**: v0.x marca **early prototype** — scope mínimo viable para evaluación por William antes de expandir al scope completo de 8 skills. Breaking changes esperables en v0.x. Strict semver compliance arranca en v1.0.0.

## Fuentes metodológicas

- **chimeranext Launchpad current spec**: `chimera-documentation/content/docs/product/launchpad/startup-flows.md`
- **chimeranext OpenAPI spec**: `https://docs.chimeranext.io/openapi.yaml` (shipped via [legacy-ticket](https://linear.app/chimera-coding/issue/legacy-ticket))
- **Pillar ownership** (Slack 2026-04-10 `#C0AKTN24C91`): @juan + @daniel asignaron Launchpad a @william
- **Plan file**: `~/.claude/plans/cheeky-tinkering-rain.md` (Phase 2)

## Plugins complementarios del ecosistema chimeranext Labs

- [`business-model-toolkit`](https://github.com/chimeranext/business-model-toolkit) — single venture lifecycle
- [`ux-research-toolkit`](https://github.com/chimeranext/ux-research-toolkit) — user research maps
- [`venture-studio-toolkit`](https://github.com/chimeranext/venture-studio-toolkit) — MACRO portfolio + legal structures

## Licencia

Business Source License 1.1 (BSL-1.1). Ver [LICENSE](./LICENSE) para detalles.