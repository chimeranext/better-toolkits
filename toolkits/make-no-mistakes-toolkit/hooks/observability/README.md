# Observability hooks

`pre-write-observability-guard.sh` keeps analytics / error-tracking / web-vitals
imports behind allowlisted chokepoint files.

**No contract file → no-op (fail open).**

Copy [`examples/observability-guardrail.example.json`](examples/observability-guardrail.example.json)
to `observability-guardrail.json` at the consumer repo root (or
`.claude/config/observability-guardrail.json`, or set
`OBSERVABILITY_GUARDRAIL_JSON`).

Fill the allowlists with *your* wrapper paths (`usePostHog.ts`, `sentry.ts`, …).
