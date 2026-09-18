# Observability hooks

`pre-write-observability-guard.sh` keeps analytics / error-tracking / web-vitals
imports behind allowlisted chokepoint files.

**No contract file → no-op (fail open).**

Copy [`examples/observability-guardrail.example.json`](examples/observability-guardrail.example.json)
to `observability-guardrail.json` at the consumer repo root (or
`.claude/config/observability-guardrail.json`, or set
`OBSERVABILITY_GUARDRAIL_JSON`).

Fill the allowlists with *your* wrapper paths (`usePostHog.ts`, `sentry.ts`, …).

## OpenCode V2 adapter

[`adapters/opencode-observability.ts`](adapters/opencode-observability.ts)
(`local.mnm-observability`): `execute.before` throws on direct
`window.fbq` / second `Sentry.init` / direct `web-vitals` imports for
`edit` / `write` tools; `execute.after` appends the direct `posthog-js`
import warning to the result output. Same contract files, same glob
allowlists, same comment-line stripping. Opt-out: remove the plugin
from `plugins`, `MNM_DISABLE_OBSERVABILITY_HOOK=1`, or
`CLAUDE_DISABLE_PLUGIN_HOOKS=1`. Keep in sync with
`pre-write-observability-guard.sh`.
