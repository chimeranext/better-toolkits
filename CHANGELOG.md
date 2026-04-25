# Changelog

All notable changes to `launchpad-toolkit` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). During the v0.x prototype phase the plugin does **not** follow strict semver — breaking changes may occur in minor releases as methodology iterates. Strict semver compliance begins in v1.0.0.

## [Unreleased]

_No unreleased changes. v0.5 shipped the final v0.x scope item (`chimeranext-api-consumer` agent). Next milestone is v1.0 stability pass._

## [0.5.0] — 2026-04-15

### Added

- Agent `chimeranext-api-consumer` — spec-driven enrichment layer that consumes the chimeranext OpenAPI spec (shipped via legacy-ticket at `https://docs.chimeranext.io/openapi.yaml` / local mirror in `chimera-documentation/public/openapi.yaml`). Reads the spec once per session, caches it, resolves skill-facing semantic aliases (e.g. `list_candidate_pool`, `get_investor_database`, `sync_stage`) to OpenAPI `operationId`s, and executes `curl`-based HTTP calls with Bearer JWT auth. Returns a structured YAML contract with status codes:
  - `LIVE_DATA` — endpoint reachable + returned data
  - `NOT_IMPLEMENTED` — endpoint in spec but 404/501/timeout
  - `SPEC_GAP` — operation not in spec at all (seeds a `feature-to-spike` proposal)
  - `AUTH_REQUIRED` — token missing/expired
  - `RATE_LIMITED` — 429 with `Retry-After`
  - `ERROR` — network/parse/unknown 5xx
- Agent never fabricates API responses — graceful degradation is the default behavior, so every calling skill continues to work standalone when the requested endpoint is missing.
- Agent defaults to staging (`pphagffyuibcfulgrpjb.supabase.co/functions/v1`) — never hits production without explicit opt-in via `chimeranext_API_BASE_URL`.
- Security posture: bearer token never logged, never persisted, redacted from all output; non-chimeranext redirects treated as errors.

### Changed

- `plugin.json` 0.4.0 → 0.5.0
- Skills `cofounder-matching`, `investor-matching`, `stage-tracker` — "Integración con chimeranext (future)" sections updated to reference the now-available `chimeranext-api-consumer` agent (1-2 sentences each, no methodology changes).
- `README.md` — adds v0.5 section, lists the agent alongside the 8 skills + 1 command, clarifies that all 4 v0.x releases have shipped.
- Keyword `chimeranext-api-consumer` added to `plugin.json`.

### Rationale

v0.5 was originally scoped as "blocked on @garbanzo's API implementation". Re-evaluation revealed two flawed assumptions:

1. The OpenAPI spec **already exists** (legacy-ticket closed 2026-04-14) — the agent can be implemented against contract, not infrastructure.
2. The agent does not require every endpoint to be live — it handles `SPEC_GAP` (no endpoint) and `NOT_IMPLEMENTED` (endpoint stubbed) as first-class outcomes, so it ships useful on day one and becomes progressively more useful as @william + @garbanzo expose Launchpad-specific endpoints.

Today the agent unlocks `LIVE_DATA` for the 12 general-purpose endpoints already in the spec (Agent chat, course progress, certificates, B2B leads, billing, role switch, admin analytics, media tokens, email). Launchpad-specific operations (cofounder pool, investor DB, demo-day queue, stage sync, chimera Score) return `SPEC_GAP` today — by design — and each SPEC_GAP auto-seeds a SPIKE proposal for William via the `feature-to-spike` loop.

## [0.4.0] — 2026-04-16

### Added

- Command `/launchpad-toolkit:propose-spike` — thin wrapper sobre el skill `feature-to-spike` con defaults pre-configurados para William Ugalde (chimeranext Launchpad pillar owner):
  - Auto-assignee: William (Linear ID `8f14370d-3602-49e3-81f2-eeb05b965687`)
  - Auto-parent: legacy-ticket (launchpad-toolkit tracking SPIKE)
  - Auto-labels: `Spike`, `Explore`, `methodology-prototype`
  - Auto-team: chimeranext; Auto-project: Launchpad; Auto-state: Triage
  - Accepts optional `$ARGUMENTS` como seed del "concrete pattern" en FTS-1
  - Direct file via Linear MCP (`mcp__linear-server__save_issue`) o fallback markdown copy-paste
- Documentation of when NOT to use the command (feature requests, bugs, plugin internals — estos van por otras vías)

### Changed

- `plugin.json` 0.3.0 → 0.4.0
- CHANGELOG v0.5 roadmap simplificado: solo `chimeranext-api-consumer` agent. Descubrimiento: la OpenAPI spec YA existe en chimera-documentation/public/openapi.yaml (shipped via legacy-ticket). El agente puede implementarse contra el spec SIN depender de @garbanzo para nueva infraestructura — lo que bloquea es solo endpoint availability por-endpoint.

## [0.3.0] — 2026-04-16

### Added

- Skill `cofounder-matching` — rubric-based co-founder matching methodology con 6-axis framework (domain fit, skill complementarity, values alignment, equity expectations, time commitment, track record). Weighted scoring ajustado por stage. Genera scorecard + gap analysis + interview questions + ranked shortlist. Kill-switches override score. Standalone; sync con chimeranext API cuando el agente `chimeranext-api-consumer` esté disponible.
- Skill `investor-matching` — investor fit scoring con 5-axis framework (stage fit, check size, thesis alignment, geography/vertical, value-add depth). Weighted scoring configurable por priority (fundraising-first / value-add-first / stealth-strategic). Genera fit-scorecard + intelligence notes + customized outreach + target list ranked + pipeline tracker.
- Skill `demo-day-prep` — preparation workflow para Demo Day events (YC, Techstars, etc.). 4 artefactos: application write-up, 10-slide deck outline con speaker notes, 3-min pitch script con timing markers, 50+ Q&A bank categorizado. Incluye rehearsal best practices (5-5-5 rule) y anti-patterns. Standalone; schema-compat con chimeranext Demo Day queue futuro.
- Skill `stage-tracker` — milestone tracking across the 6 chimeranext Launchpad stages (Ideation → Formation → MVP → Traction → Funded → Scaling). Exit criteria per stage + chimera-Score-compatible 5-axis scoring (Team, Product, Traction, Market, Business Model; 0-100 total). Genera current-stage + milestones + blockers + chimera-score + history. Evidence-over-claim principle.

### Changed

- `plugin.json` version bump 0.2.0 → 0.3.0
- README updated to reflect 8 skills total (up from 4)
- Roadmap simplified: v0.4 = `chimeranext-api-consumer` agent + `/propose-spike` command (v0.3 is the last "skills-only" release)

### Rationale

Previously v0.3 skills were blocked on chimeranext API via @garbanzo. Re-evaluation revealed that skills themselves are **methodology** (rubrics, scoring, workflows) — they do NOT require live API data. Only the `chimeranext-api-consumer` **agent** (which fetches live data to enrich skills) is API-blocked. Skills ship as standalone; agent is v0.4 pending API.

## [0.2.0] — 2026-04-16

## [0.2.0] — 2026-04-16

### Added

- Skill `cap-table-builder` — constructor de cap table inicial para single venture. Soporta founders + option pool + advisor pool + SAFEs + convertible notes. Genera `cap-table.md` + `vesting-schedule.md` + `safe-conversion-modeling.md` con modeling de 3 scenarios (conservative/expected/optimistic) de next priced round. Cross-reference a `venture-studio-toolkit:sweat-equity-agreement` para 83(b) tratamiento diferenciado por entity type (C-Corp restricted stock / LLC profits interest / LLC capital interest).
- Skill `founder-documents` — generador de stack legal founder. 6 documentos: Founder Stock Purchase Agreement (o Operating Agreement LLC), IP Assignment, Vesting Schedule Exhibit, Advisor Agreement (FAST framework), SAFE (post-money YC standard), Term Sheet (NVCA Series Seed). Cada output incluye `[TO BE FILLED BY LAWYER]` markers y lawyer review checklist. STRONG legal disclaimer en todos los outputs.

### Changed

- `plugin.json` version bump 0.1.0 → 0.2.0
- README references updated to reflect 4 skills total (up from 2)

## [0.1.0] — 2026-04-16

### Added

- Initial scaffold ([legacy-ticket](https://linear.app/chimera-coding/issue/legacy-ticket), parent SPIKE [legacy-ticket](https://linear.app/chimera-coding/issue/legacy-ticket))
- `plugin.json` + `README.md` + BSL-1.1 `LICENSE`
- Skill `startup-intake` — AI intake interview producing `startup-profile.md` artifact, schema-compatible with chimeranext Launchpad Startup Profile
- Skill `feature-to-spike` — **differentiator** — transforms dog-food methodology learnings into Linear SPIKE issues for William Ugalde (Launchpad pillar owner)
- Reference `references/productization-workflow.md` — 5-step loop documenting methodology → SPIKE → chimeranext feature flow

### Known limitations (v0.1)

- Only 2 of 8 planned skills implemented; remaining 6 deferred to v0.2/v0.3
- `chimeranext-api-consumer` agent not implemented (blocked on chimeranext API by Daniel Garbanzo)
- Bilingual output framework documented but implementation per-skill is roadmap

[Unreleased]: https://github.com/chimeranext/launchpad-toolkit/compare/v0.5.0...HEAD
[0.5.0]: https://github.com/chimeranext/launchpad-toolkit/releases/tag/v0.5.0
[0.4.0]: https://github.com/chimeranext/launchpad-toolkit/releases/tag/v0.4.0
[0.3.0]: https://github.com/chimeranext/launchpad-toolkit/releases/tag/v0.3.0
[0.2.0]: https://github.com/chimeranext/launchpad-toolkit/releases/tag/v0.2.0
[0.1.0]: https://github.com/chimeranext/launchpad-toolkit/releases/tag/v0.1.0