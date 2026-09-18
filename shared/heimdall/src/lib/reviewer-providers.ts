/**
 * Reviewer Provider Registry — multi-provider abstraction for the PR reviewer.
 *
 * The reviewer originally ran a single, hard-coded direct-to-Gemini loop
 * (`runGeminiReviewLoop`). This registry generalizes that to a set of
 * named providers, each routed at request time by the `REVIEWER_PROVIDER`
 * env var. The provider object carries everything the dispatcher needs
 * to call its native LLM API: kind (which wire format to speak), model
 * slug, API key, and an optional base URL (for OpenAI-compatible
 * endpoints like NVIDIA NIM).
 *
 * Provider selection happens via env so kill-switches can flip in
 * Cloud Run WITHOUT a redeploy — the same pattern as
 * `DAILY_REPORTS_ENABLED` / `STALE_ALERTS_ENABLED` (see CLAUDE.md
 * §"Feature-flag env vars"). Unset OR `gemini-direct` preserves the
 * pre-change behavior byte-for-byte (default safe).
 *
 * MVP scope: single-model-at-a-time. Ensemble-merging (running multiple
 * lanes in parallel and merging findings) is intentionally out of scope
 * for this PR — tracked as a follow-up.
 *
 * ─── Why the registry bypasses the OpenClaw Gateway entirely ─────────────────
 *
 * The conversational agent (chat / Slack / WhatsApp) routes its LLM calls
 * THROUGH the OpenClaw Gateway (pinned to v2026.5.7). The reviewer
 * does NOT — it is a headless backend flow that POSTs directly to provider
 * APIs (`generativelanguage.googleapis.com` for Gemini, `integrate.api.nvidia.com`
 * for NIM, `openrouter.ai` for OpenRouter). Two reasons make the bypass
 * structural rather than a convenience:
 *
 *   1. **Gateway fork can't drive Gemini-3 thinking**: the catalog
 *      schema in `node_modules/openclaw/dist/config-CF5WgkYh.js` registers
 *      `gemini-3.5-flash` without `reasoning: true` and conflates
 *      `thinkingBudget` (Gemini-2.x) with `thinkingLevel` (Gemini-3.x). The
 *      gateway downgrades thinking to "off" and the model exits with
 *      "produced no reply before idle watchdog". Bypassing the gateway is
 *      the structural fix; upgrading the gateway is a separate, slow epic
 *      (GitFlow disciplines version-bump risk).
 *
 *   2. **Reviewer needs no gateway machinery**. The conversational gateway
 *      provides persona routing, channel adapters, rate limits per user, and
 *      session memory — none of which the reviewer uses. Pushing reviewer
 *      traffic through that machinery would inherit its fragility
 *      without gaining anything functional.
 *
 * ─── Per-lane limitations & quirks (NOT model capabilities) ──────────────────
 *
 *   • `gemini-direct` (Gemini 3.5 Flash):
 *     - Uses `thinkingLevel` ('low' | 'medium' | 'high'), NOT `thinkingBudget`.
 *       Mixing those names breaks the model silently.
 *     - Cache write fee is per-hour ($1/M-token-hour), not per-token-once.
 *       The provider record has no `cost` field for this reason — see
 *       `gemini-agent-loop.ts` for the fork-schema rationale.
 *     - `thoughtSignature` parts MUST be preserved across function-call turns
 *       by pushing the full assistant `content` back to `contents` verbatim;
 *       dropping them degrades thinking to incoherent (see gemini-agent-loop).
 *
 *   • `nim-*` lanes (NVIDIA NIM, OpenAI-compatible endpoint at
 *     `https://integrate.api.nvidia.com/v1`):
 *     - One bearer (`NVIDIA_API_KEY`) authenticates 117 models. Adding more
 *       lanes from this catalog is REGISTRY entries only, no new secret.
 *     - Models are MoE (Kimi K2.6 ~32B active of 1T total; Qwen3-coder 480B
 *       has 35B active) — latency is dominated by the routing layer, not the
 *       full param count. Heavy lanes (Nemotron Super 120B, Qwen3.5 397B)
 *       may exceed the ~60s wall-clock review SLO; smoke-test
 *       before promoting any heavy lane to default.
 *     - NIM enforces strict role/content/tool_calls coherence in the OpenAI
 *       wire format (see `openai-agent-loop.ts` for the verbatim
 *       message-replay rationale).
 *
 *   • `openrouter-*` lanes (OpenAI-compatible at `openrouter.ai/api/v1`):
 *     - One bearer (`OPENROUTER_API_KEY`) is forward-compatible with every
 *       future OpenRouter-hosted model (Anthropic, Mistral, etc.) — single
 *       secret, multiple lanes.
 *     - OpenRouter routes upstream OPAQUELY (Together / Fireworks / Replicate
 *       / etc. picked dynamically). The same model slug + same key may hit
 *       different upstreams across requests with subtly different
 *       tool-calling behavior. `openai-agent-loop.ts` logs the
 *       `response.provider` field for post-mortem reproducibility.
 *     - Granite 4.1 (8B) has BFCL v3 = 68.27 — lower than Qwen3-coder /
 *       DeepSeek-V4. Granite earns its slot through architectural and
 *       training-data DIVERSITY (uncorrelated errors in the future ensemble),
 *       not raw tool-calling quality.
 *     - Granite 4.0 h-micro (3B hybrid Mamba2/Transformer) has BFCL v3 ≈
 *       60.80 — borderline for loops with >3 tool calls. Ensemble fast-lane
 *       only; do NOT promote to primary alternative.
 *     - `openrouter-kimi-k2.7-code` (Kimi K2.7-code) is a coding-specialized
 *       lane, newer than the `kimi-k2.6` we run via NIM. A coder-tuned model
 *       fits the adversarial pass (reading a diff to find bugs is a coding task).
 *     - `openrouter-free` (the FREE ROUTER) and the `:free` variants trade cost
 *       for a LOW rate-limit + VARIABLE latency. The reviewer is token-hungry
 *       (~400k/review) so free lanes SATURATE on large PRs — use them for small
 *       diffs / dev only, never as the primary lane on a busy repo. See the ADR
 *       (`decisions/openrouter-routing.md`) for the 3 caveats (tool-calling,
 *       rate-limit, Fusion ~4-5× cost) behind the phase-2 deferral of Fusion.
 *
 * ─── What this registry intentionally OMITS (schema gaps, not bugs) ──────────
 *
 *   • No `cost` field on `ProviderDescriptor`. Spend-tracking is a separate
 *     concern (Cloud Run cost discipline; reviewer-level
 *     attribution is a future epic). Adding a `cost` field here would imply
 *     a unit shape we don't yet have (per-token? per-cache-hour? per-tool-call?).
 *
 *   • No `confidence` override pass-through. The reviewer's tool schema
 *     (`bifrost_github_review_post`) has no per-PR `confidence` field
 *     — the LLM cannot author a Greptile-style "Confidence: 4/5" override.
 *     The formatter in `review-body-formatter.ts` derives the score
 *     DETERMINISTICALLY from per-finding severity counts as a stable contract
 *     across PRs. LLM-authored override is a future schema-change
 *     follow-up.
 *
 *   • `ProviderKind` is `"gemini-direct" | "openai-compatible"` only — no
 *     Anthropic-native or AWS-Bedrock-native shapes today. Adding one means
 *     a new agent-loop module + a new union member; consumers in `chat.ts`
 *     and `github-webhook.ts` route via `runReviewLoop` and don't branch on
 *     kind, so the surface stays small.
 *
 */

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * The wire format the dispatcher should use when talking to this provider.
 *
 * - `gemini-direct` → POST to Google AI `generateContent` with the Gemini
 *   function-calling shape (`functionDeclarations`, `functionCall`,
 *   `functionResponse`). This is the pre-change path, unchanged.
 * - `openai-compatible` → POST to `${baseURL}/chat/completions` with the
 *   OpenAI tool-calling shape (`tools[].function`, `tool_calls`, `role:tool`).
 *   Used for NVIDIA NIM (verified 117 models including Kimi K2.6, GLM-5.1,
 *   DeepSeek-V4, Qwen3) and any other OpenAI-compatible endpoint.
 */
export type ProviderKind = "gemini-direct" | "openai-compatible"

/**
 * A resolved reviewer provider: everything the dispatcher needs to fire one
 * request, with the API key already pulled from env. Carried by value so
 * tests can synthesize providers without touching `process.env`.
 */
export interface ReviewerProvider {
  /** Internal identifier (the value of `REVIEWER_PROVIDER`). */
  id: string
  /** Wire format kind (see `ProviderKind`). */
  kind: ProviderKind
  /** Model slug as the provider expects it. */
  model: string
  /** API key (already resolved from env at selection time). */
  apiKey: string
  /**
   * Base URL for `openai-compatible` providers. Omitted for `gemini-direct`
   * (which has a fixed base URL hard-coded in the loop).
   */
  baseURL?: string
  /** Human-readable label for log lines (`provider=...`). */
  label: string
  /**
   * Extra top-level `/chat/completions` body fields for this lane (Fusion
   * `plugins`, routing params). Carried through from the descriptor; see
   * {@link ProviderDescriptor.extraBody}. Undefined for every lane today —
   * the loop ignores it until phase 2 wires it.
   */
  extraBody?: Readonly<Record<string, unknown>>
}

// ─── Constants ────────────────────────────────────────────────────────────────

/**
 * NIM (NVIDIA Inference Microservice) OpenAI-compatible base URL. Same
 * endpoint for every model — the model slug differentiates them.
 *
 * Verified 2026-05-27: enumerating the catalog with a valid NIM key returns
 * 117 model entries, including the four locked in below. Presence is the
 * only check the registry performs; the first 401 from NIM will surface to
 * the loop's error path.
 */
const NIM_BASE_URL = "https://integrate.api.nvidia.com/v1"

/**
 * Default Gemini model slug — matches the pre-change hard-coded value in
 * `chat.ts` / `github-webhook.ts`, kept here so the dispatcher receives a
 * fully-resolved provider with no implicit defaults downstream.
 */
const GEMINI_DEFAULT_MODEL = "gemini-3.5-flash"

/**
 * NIM model slugs locked in for the MVP lanes. Confirmed live against the
 * NIM `/v1/models` catalog on 2026-05-27 — DO NOT change these without
 * re-verifying (slugs can shift minor versions; for example
 * `kimi-k2-instruct` is a stale alias from earlier docs).
 *
 * Tool-calling capability is required for the reviewer to drive the
 * function-calling loop end-to-end; each model here was selected for
 * explicit tool-calling support per the NIM model card.
 */
const NIM_MODEL_SLUGS = {
  kimi: "moonshotai/kimi-k2.6",
  glm: "z-ai/glm-5.1",
  deepseek: "deepseek-ai/deepseek-v4-pro",
  qwen: "qwen/qwen3-coder-480b-a35b-instruct",
  // ─── NIM catalog expansion (2026-05-27) ──────────────────────────────────
  // Sourced from the live NIM catalog. Each model verified to support
  // tool-calling per its NIM model card; slugs match the build.nvidia.com URL
  // path. Two NIM URLs from the user's expansion list (kimi-k2.6 and glm-5.1)
  // were already present as `nim-kimi`/`nim-glm` and are NOT re-added.
  minimax: "minimaxai/minimax-m2.7",
  nemotronNano: "nvidia/nemotron-3-nano-30b-a3b",
  nemotronSuper: "nvidia/nemotron-3-super-120b-a12b",
  // ─── Nemotron 3 Ultra (2026-06-09) ───────────────────────────────────────
  // Nemotron 3 Ultra (550B-A55B MoE) — NIM day-0, confirmed live in the
  // `/v1/models` catalog on 2026-06-09 (120 models enumerated). The heaviest
  // NIM lane in the registry; ~55B active params route per token. Added as the
  // PREFERRED head of the adversarial fallback chain for maximum
  // failure-mode diversity vs the gemini-direct pass-1 lane. Heavy-weight —
  // may exceed the ~60s review SLO; the chain degrades to a lighter lane if it
  // fails to resolve. NOTE: `minimax-m3` was requested for the chain but is NOT
  // in the NIM catalog (only `minimaxai/minimax-m2.7`, already `nim-minimax-m27`)
  // as of the 2026-06-09 probe, so no `nim-minimax-m3` lane exists and the
  // chain skips that id gracefully (unknown-id → next lane).
  nemotronUltra: "nvidia/nemotron-3-ultra-550b-a55b",
  qwen122: "qwen/qwen3.5-122b-a10b",
  qwen397: "qwen/qwen3.5-397b-a17b",
  gptOss: "openai/gpt-oss-20b",
  llamaMaverick: "meta/llama-4-maverick-17b-128e-instruct",
  llama70: "meta/llama-3.3-70b-instruct",
} as const

/**
 * OpenRouter OpenAI-compatible base URL. Single endpoint for every model the
 * provider exposes — the model slug differentiates them. Same wire-format
 * pattern as NIM, so the existing `openai-compatible` loop carries OpenRouter
 * traffic with zero new code in `openai-agent-loop.ts`.
 *
 * Verified 2026-05-27 via OpenRouter's IBM Granite catalog: Granite 4.1 8B
 * and Granite 4.0 h-micro both expose tool-calling per IBM's published API
 * spec (OpenAI function-definition schema). One `OPENROUTER_API_KEY` is
 * forward-compatible with future OpenRouter-hosted models (Anthropic,
 * Mistral, etc.) — adding more lanes from this provider only needs new
 * registry entries, not new secrets.
 */
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"

/**
 * OpenRouter model slugs for the Granite lanes. Locked in 2026-05-27 against
 * OpenRouter's IBM Granite catalog. Both Apache 2.0; both tool-call-capable.
 *
 * - `granite8b` (Granite 4.1 8B): dense Transformer, 131K context, HumanEval
 *   85.37, BFCL v3 68.27 — the primary alt-reviewer lane introducing
 *   architectural + training-data diversity vs the NIM lanes.
 * - `graniteMicro` (Granite 4.0 h-micro): hybrid Mamba2/Transformer 3B, 131K
 *   context. Cheap fast-lane for the ensemble follow-up. BFCL v3
 *   ~60.80 is borderline for loops with >3 tool calls — DO NOT promote this
 *   to a default primary alternative; ensemble fast-lane only.
 */
const OPENROUTER_MODEL_SLUGS = {
  granite8b: "ibm-granite/granite-4.1-8b",
  graniteMicro: "ibm-granite/granite-4.0-h-micro",
  // ─── OpenRouter routing + coding lanes (PR-C, #286) ──────────────────────
  // Slugs sourced from the OpenRouter docs (no live-catalog probe — we don't
  // hold the key in this repo). Treat each as PLAUSIBLE and verify against the
  // live `/api/v1/models` catalog before promoting any to a default.
  //
  // - `kimiK27Code` (Kimi K2.7-code): Moonshot's coding-specialized model,
  //   newer than the `moonshotai/kimi-k2.6` we run via NIM. Tool-calling per
  //   Moonshot's model card; the adversarial pass READS diffs to find bugs (a
  //   coding task) so a coder-tuned lane is the natural fit.
  // - `free` (`openrouter/free`): the FREE ROUTER — picks a random free model
  //   filtered by capability (tool-calling / vision / structured outputs).
  //   Rate-limit is low and latency varies; suit for small diffs / dev only
  //   (see the ADR caveat on free-model saturation under ~400k-token reviews).
  // - The `:free`-suffixed variants below select a SPECIFIC free model rather
  //   than letting the router pick. Both are documented as tool-call-capable,
  //   but the `:free` tier can rotate availability — a lane that 404s is
  //   skipped by `tryResolveLane`'s sibling probe path at call time.
  kimiK27Code: "moonshotai/kimi-k2.7-code",
  free: "openrouter/free",
  deepseekR1Free: "deepseek/deepseek-r1:free",
  qwen3CoderFree: "qwen/qwen3-coder:free",
} as const

/**
 * Default provider id when `REVIEWER_PROVIDER` is unset. Picked to preserve
 * pre-change behavior byte-for-byte — the gemini-direct lane is the only
 * one that was running before this change, and any new value must be
 * explicit opt-in. Treat changing this default as a behavior change.
 */
export const DEFAULT_PROVIDER_ID = "gemini-direct"

/**
 * Env var the operator flips on Cloud Run to switch lanes. Documented in
 * CLAUDE.md §"Feature-flag env vars" alongside the other `*_ENABLED` knobs.
 * Set to `"gemini-direct"` (or leave unset) for the original behavior;
 * set to `"nim-kimi"` / `"nim-glm"` / `"nim-deepseek"` / `"nim-qwen"` to
 * dogfood a NIM lane.
 */
export const REVIEWER_PROVIDER_ENV = "REVIEWER_PROVIDER"

/**
 * Env var carrying the NVIDIA NIM API key. Wired into Cloud Run as a
 * Secret Manager reference in `.github/workflows/deploy.yml`. Required only
 * when a `nim-*` provider is selected — the registry fails fast with a
 * clear message if it's missing.
 */
export const NVIDIA_API_KEY_ENV = "NVIDIA_API_KEY"

/**
 * Env var carrying the OpenRouter API key. Wired into Cloud Run as a Secret
 * Manager reference in `.github/workflows/deploy.yml`. Required only when an
 * `openrouter-*` provider is selected — the registry fails fast with a clear
 * message if it's missing. A single key serves every `openrouter-*` lane.
 */
export const OPENROUTER_API_KEY_ENV = "OPENROUTER_API_KEY"

/**
 * Env var carrying the Google AI key for the gemini-direct lane. Mirrors
 * the pre-change lookup in `chat.ts` / `github-webhook.ts`.
 */
export const GOOGLE_AI_API_KEY_ENV = "GOOGLE_AI_API_KEY"

// ─── Ensemble ─────────────────────────────────────────────────────

/**
 * Top-level gate for the ensemble path. Default OFF — when unset, the
 * single-lane MVP (`selectReviewerProvider` driven by `REVIEWER_PROVIDER`)
 * runs byte-for-byte unchanged. This is the load-bearing back-compat knob;
 * any operator who hasn't opted in stays on the pre-change codepath.
 *
 * Set to `"true"` on Cloud Run to switch the routes to the ensemble
 * dispatcher; flippable with `gcloud run services update --update-env-vars`
 * without a redeploy, same pattern as `DAILY_REPORTS_ENABLED` and
 * `STALE_ALERTS_ENABLED`.
 */
export const REVIEWER_ENSEMBLE_ENABLED_ENV = "REVIEWER_ENSEMBLE_ENABLED"

// ─── Adversarial re-review (PR-2) ───────────────────────────────────

/**
 * Top-level gate for the adversarial re-review (PR-2, Option A).
 * Default ON — a single cooperative pass below the
 * {@link REVIEWER_ADVERSARIAL_THRESHOLD} triggers a skeptical second pass whose
 * findings are CONSOLIDATED into one review. Set EXACTLY `"false"` to disable
 * (the cooperative pass posts as-is). Strict comparison so a typo never
 * silently disables the adversarial guard — the inverse default stance from
 * `isEnsembleEnabled` (default OFF), because adversarial re-review is the
 * desired-on behavior here, not an opt-in experiment.
 */
export const REVIEWER_ADVERSARIAL_ENABLED_ENV = "REVIEWER_ADVERSARIAL_ENABLED"

/**
 * Score (1.0–5.0) at or above which the cooperative pass is trusted and the
 * adversarial pass is SKIPPED. Default 5.0 — only a clean PR (no P2/P3/P1)
 * skips the second opinion; any finding profile that dents the hybrid score
 * gets adversarially re-reviewed. Override via env to widen/narrow the gate.
 */
export const REVIEWER_ADVERSARIAL_THRESHOLD_ENV = "REVIEWER_ADVERSARIAL_THRESHOLD"

/** Fallback threshold when {@link REVIEWER_ADVERSARIAL_THRESHOLD_ENV} is unset/invalid. */
export const DEFAULT_ADVERSARIAL_THRESHOLD = 5.0

/**
 * Optional provider id to run the adversarial (pass 2) loop through, for real
 * model diversity (e.g. `nim-kimi`). When UNSET the adversarial pass runs on
 * the same lane `REVIEWER_PROVIDER` selects (default `gemini-direct`). NIM
 * lanes are opt-in: set this (or `REVIEWER_ADVERSARIAL_CHAIN` / the per-lane
 * `REVIEWER_NIM_*_ENABLED` flags) to a NIM lane to use them. The NIM key
 * (`NVIDIA_API_KEY_INTERNAL_STAGING`) works for chat-completions; the
 * gemini-direct default is a deliberate opt-in choice, not a key breakage.
 * Resolved via `selectReviewerProvider` with this id injected, so the same
 * validation/throw behavior applies.
 */
export const REVIEWER_ADVERSARIAL_PROVIDER_ENV = "REVIEWER_ADVERSARIAL_PROVIDER"

/**
 * Env var carrying an ORDERED, comma-separated fallback chain of provider ids
 * for the adversarial (pass 2) loop. When set, it SUPERSEDES the
 * single-id {@link REVIEWER_ADVERSARIAL_PROVIDER_ENV}:
 * {@link resolveAdversarialProviderChain} walks the list left-to-right and
 * returns the first lane that RESOLVES (known id + populated api key), so a NIM
 * lane that is unknown / unconfigured is SKIPPED rather than throwing. The chain
 * always ends with a guaranteed fallback to `gemini-direct` so the adversarial
 * pass never silently no-ops.
 *
 * Example: `"nim-kimi,nim-glm,nim-nemotron-3-ultra,nim-minimax-m3"` —
 * `nim-minimax-m3` is unknown (no such NIM slug as of 2026-06-09) and is
 * skipped without failing the chain.
 */
export const REVIEWER_ADVERSARIAL_CHAIN_ENV = "REVIEWER_ADVERSARIAL_CHAIN"

/**
 * Default adversarial fallback chain (Andrés 2026-06-09; reordered
 * follow-up): kimi-k2.6 → glm-5.1 → nemotron-3-ultra → minimax-m3.
 *
 * Ordering rationale — the adversarial pass READS a diff to find bugs, which is
 * a CODING task, so the chain leads with the strongest coder:
 *   1. `nim-kimi` (Kimi K2.6) — best coder: SWE-Verified 80.2%,
 *      Terminal-Bench 2.0 66.7%, LiveCodeBench 89.6.
 *   2. `nim-glm` (GLM 5.1) — strong coder: SWE-Pro 58.4%.
 *   3. `nim-nemotron-3-ultra` — a REASONING model with weak coding
 *      (SciCode 39.9%, Terminal-Bench Hard 36.4%), so demoted to a fallback.
 *   4. `nim-minimax-m3` — last; still NOT a registered lane.
 *
 * `nim-minimax-m3` is intentionally listed even though it is NOT a registered
 * lane (the NIM catalog has no `minimax-m3` slug — only `minimaxai/minimax-m2.7`,
 * already `nim-minimax-m27`). It documents the operator's PREFERENCE order; the
 * resolver skips unknown ids gracefully and falls through to the next lane.
 * When/if NIM publishes a `minimax-m3` slug, registering a `nim-minimax-m3`
 * lane makes this entry live with no chain change.
 */
export const DEFAULT_ADVERSARIAL_CHAIN = "nim-kimi,nim-glm,nim-nemotron-3-ultra,nim-minimax-m3"

/**
 * Returns `true` when the adversarial re-review path should run. Strict
 * comparison against `"false"` — ANY other value (unset, empty, `"FALSE"`,
 * `"0"`) keeps it ENABLED (default-on safety guard). Mirrors the strict
 * `isAutoRereviewEnabled` kill-switch semantics, not the opt-in ensemble gate.
 */
export function isAdversarialEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return (env[REVIEWER_ADVERSARIAL_ENABLED_ENV] ?? "true").trim() !== "false"
}

/**
 * Resolve the adversarial score gate. Parses the env override; falls back to
 * {@link DEFAULT_ADVERSARIAL_THRESHOLD} on unset / empty / non-finite values
 * (default-safe — a typo'd threshold must not disable the gate by NaN
 * comparison). Clamped to the valid score window `[1, 5]`.
 */
export function resolveAdversarialThreshold(env: NodeJS.ProcessEnv = process.env): number {
  const raw = (env[REVIEWER_ADVERSARIAL_THRESHOLD_ENV] ?? "").trim()
  if (raw.length === 0) return DEFAULT_ADVERSARIAL_THRESHOLD
  const parsed = Number(raw)
  if (!Number.isFinite(parsed)) return DEFAULT_ADVERSARIAL_THRESHOLD
  return Math.min(5, Math.max(1, parsed))
}

/**
 * Resolve the optional adversarial-pass provider. Returns `undefined` when
 * `REVIEWER_ADVERSARIAL_PROVIDER` is unset/empty — the caller then runs pass 2
 * on the default lane. When set, the id is resolved through
 * {@link selectReviewerProvider} with the env's `REVIEWER_PROVIDER` overridden,
 * inheriting its validation (throws on unknown id / missing api key).
 */
export function resolveAdversarialProvider(
  env: NodeJS.ProcessEnv = process.env,
): ReviewerProvider | undefined {
  const id = (env[REVIEWER_ADVERSARIAL_PROVIDER_ENV] ?? "").trim()
  if (id.length === 0) return undefined
  return selectReviewerProvider({ ...env, [REVIEWER_PROVIDER_ENV]: id })
}

/**
 * Non-throwing single-lane resolution used by the fallback chain. Returns a
 * fully-resolved {@link ReviewerProvider} when `id` is a known registry lane
 * whose api-key env var is populated; returns `undefined` (with an optional
 * debug log) for an unknown id OR a missing/empty api key — the conditions the
 * chain treats as "lane unavailable, try the next one". This is the
 * resolution-time analog of the issue's "unknown id / probe 404 / first-call
 * 401-404 → skip" — a lane we can't even construct is skipped before it can
 * burn a request.
 *
 * Pure with respect to `env`. Never throws (contrast {@link selectReviewerProvider},
 * which throws so the single-lane misconfig surfaces loudly).
 */
function tryResolveLane(
  id: string,
  env: NodeJS.ProcessEnv,
  logger?: { debug?(msg: string): void },
): ReviewerProvider | undefined {
  const descriptor = REGISTRY[id]
  if (!descriptor) {
    logger?.debug?.(`reviewer-providers: adversarial chain skips unknown lane id="${id}"`)
    return undefined
  }
  const apiKey = (env[descriptor.apiKeyEnv] ?? "").trim()
  if (apiKey.length === 0) {
    logger?.debug?.(
      `reviewer-providers: adversarial chain skips lane="${id}" — ${descriptor.apiKeyEnv} unset/empty`,
    )
    return undefined
  }
  return {
    id,
    kind: descriptor.kind,
    model: descriptor.model,
    apiKey,
    baseURL: descriptor.baseURL,
    label: descriptor.label,
    extraBody: descriptor.extraBody,
  }
}

/**
 * Parse a CSV provider-id chain into a trimmed, non-empty, de-duplicated list,
 * preserving order. Shared by {@link resolveAdversarialProviderChain} and its
 * tests. Empty / whitespace-only entries are dropped; a wholly empty input
 * yields `[]` (the resolver then uses {@link DEFAULT_ADVERSARIAL_CHAIN}).
 */
export function parseProviderChain(raw: string): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const part of raw.split(",")) {
    const id = part.trim()
    if (id.length === 0 || seen.has(id)) continue
    seen.add(id)
    out.push(id)
  }
  return out
}

/**
 * Resolve the adversarial (pass 2) provider from an ORDERED FALLBACK CHAIN
 *. Walks the chain left-to-right and returns the FIRST lane that
 * resolves cleanly (known registry id + populated api key); any lane that is
 * unknown (e.g. `nim-minimax-m3`, which has no NIM slug) or whose key is unset
 * is SKIPPED. The default-safe contract: the adversarial pass NEVER silently
 * no-ops, so `gemini-direct` is ALWAYS appended as the terminal fallback (it is
 * the only lane that was running pre-change and uses the same
 * `GOOGLE_AI_API_KEY` the cooperative pass already requires).
 *
 * Resolution precedence:
 *   1. {@link REVIEWER_ADVERSARIAL_PROVIDER_ENV} (single id) — when set, it is
 *      treated as a one-element chain head (back-compat with PR-2),
 *      still followed by the default chain + gemini-direct terminal fallback.
 *   2. {@link REVIEWER_ADVERSARIAL_CHAIN_ENV} (CSV) — when set, used verbatim.
 *   3. {@link DEFAULT_ADVERSARIAL_CHAIN} otherwise.
 *
 * Returns the resolved provider, or `undefined` ONLY when even the terminal
 * `gemini-direct` cannot resolve (no `GOOGLE_AI_API_KEY`) — in which case the
 * caller's `runReviewLoop` falls back to env selection and surfaces the missing
 * key loudly, exactly as today. Never throws.
 *
 * Pure with respect to `env`.
 */
export function resolveAdversarialProviderChain(
  env: NodeJS.ProcessEnv = process.env,
  logger?: { debug?(msg: string): void },
): ReviewerProvider | undefined {
  const singleId = (env[REVIEWER_ADVERSARIAL_PROVIDER_ENV] ?? "").trim()
  const chainRaw = (env[REVIEWER_ADVERSARIAL_CHAIN_ENV] ?? "").trim()

  // Build the ordered candidate list. The single-id env (PR-2) takes
  // the head for back-compat, then the explicit chain (or the default), and
  // ALWAYS gemini-direct as the terminal guarantee. `parseProviderChain`
  // de-dupes so a repeated id (e.g. single-id == chain head) is tried once.
  const body = chainRaw.length > 0 ? chainRaw : DEFAULT_ADVERSARIAL_CHAIN
  const candidates = parseProviderChain(
    [singleId, body, DEFAULT_PROVIDER_ID].filter((s) => s.length > 0).join(","),
  )

  for (const id of candidates) {
    const resolved = tryResolveLane(id, env, logger)
    if (resolved) {
      logger?.debug?.(`reviewer-providers: adversarial chain resolved to lane="${id}"`)
      return resolved
    }
  }

  // Even gemini-direct couldn't resolve (no GOOGLE_AI_API_KEY). Return undefined
  // so the caller's runReviewLoop falls back to env selection — which throws the
  // canonical missing-key error rather than silently no-opping.
  logger?.debug?.(
    "reviewer-providers: adversarial chain exhausted (no lane resolved, incl. gemini-direct)",
  )
  return undefined
}

/**
 * Per-lane kill-switch env-var names. Each maps to a registry id; the
 * ensemble dispatcher reads these to decide which lanes participate.
 *
 * Default safe stance (locked by `selectEnabledLanes`'s defaults):
 *   - `REVIEWER_GEMINI_ENABLED` defaults to ON (gemini-direct, the
 *     pre-change lane, is the proven default).
 *   - Every NIM lane defaults to OFF — opt-in only, mirroring the *     "single-lane default" stance.
 *
 * Adding a new lane (e.g. when OpenRouter lanes drop) is two lines:
 * a new registry entry above + a new row here. The dispatcher picks them up
 * automatically.
 *
 * The env-var naming follows the existing `*_ENABLED` convention so a
 * future ops dashboard can list all kill-switches with one regex match.
 */
export const LANE_FLAG_ENV: Readonly<Record<string, string>> = Object.freeze({
  "gemini-direct": "REVIEWER_GEMINI_ENABLED",
  "nim-kimi": "REVIEWER_NIM_KIMI_ENABLED",
  "nim-glm": "REVIEWER_NIM_GLM_ENABLED",
  "nim-deepseek": "REVIEWER_NIM_DEEPSEEK_ENABLED",
  "nim-qwen": "REVIEWER_NIM_QWEN_ENABLED",
  // ─── NIM expansion lanes (PR-A, #284) ───────────────────────────
  // Each new lane gets a per-lane kill-switch so the ensemble dispatcher
  // can enable/disable them individually. All default OFF — see
  // LANE_DEFAULT_ENABLED below — preserving "opt-in expansion lanes" from
  // and keeping the single-lane path (REVIEWER_PROVIDER=...) as the
  // immediate use case PR-A ships.
  "nim-minimax-m27": "REVIEWER_NIM_MINIMAX_M27_ENABLED",
  "nim-nemotron-nano-30b": "REVIEWER_NIM_NEMOTRON_NANO_30B_ENABLED",
  "nim-nemotron-super-120b": "REVIEWER_NIM_NEMOTRON_SUPER_120B_ENABLED",
  // Nemotron 3 Ultra 550B (adversarial chain head; heavy lane).
  "nim-nemotron-3-ultra": "REVIEWER_NIM_NEMOTRON_3_ULTRA_ENABLED",
  "nim-qwen-122b": "REVIEWER_NIM_QWEN_122B_ENABLED",
  "nim-qwen-397b": "REVIEWER_NIM_QWEN_397B_ENABLED",
  "nim-gpt-oss-20b": "REVIEWER_NIM_GPT_OSS_20B_ENABLED",
  "nim-llama-4-maverick": "REVIEWER_NIM_LLAMA_4_MAVERICK_ENABLED",
  "nim-llama-33-70b": "REVIEWER_NIM_LLAMA_33_70B_ENABLED",
  // ─── OpenRouter Granite lanes (PR-B, #285) ──────────────────────
  // Fresh provider family. Each lane gets a per-lane kill-switch so the
  // ensemble dispatcher can toggle them individually. Both default
  // OFF — see LANE_DEFAULT_ENABLED below.
  "openrouter-granite-8b": "REVIEWER_OPENROUTER_GRANITE_8B_ENABLED",
  "openrouter-granite-micro": "REVIEWER_OPENROUTER_GRANITE_MICRO_ENABLED",
  // ─── OpenRouter routing + coding lanes (PR-C, #286) ─────────────
  // One kill-switch per lane; all default OFF (opt-in, see LANE_DEFAULT_ENABLED).
  "openrouter-kimi-k2.7-code": "REVIEWER_OPENROUTER_KIMI_K27_CODE_ENABLED",
  "openrouter-free": "REVIEWER_OPENROUTER_FREE_ENABLED",
  "openrouter-deepseek-r1-free": "REVIEWER_OPENROUTER_DEEPSEEK_R1_FREE_ENABLED",
  "openrouter-qwen3-coder-free": "REVIEWER_OPENROUTER_QWEN3_CODER_FREE_ENABLED",
})

/**
 * Default state per lane when its `*_ENABLED` env var is unset.
 *
 * Keep `gemini-direct` ON so a misconfigured ensemble (no per-lane flags
 * set explicitly) still produces a review — it just falls back to a
 * single-lane gemini run, which is identical to today's behavior.
 * Everything else defaults OFF to honor "opt-in NIM lanes" from .
 */
const LANE_DEFAULT_ENABLED: Readonly<Record<string, boolean>> = Object.freeze({
  "gemini-direct": true,
  "nim-kimi": false,
  "nim-glm": false,
  "nim-deepseek": false,
  "nim-qwen": false,
  // NIM expansion lanes (PR-A) — all default OFF (opt-in only).
  "nim-minimax-m27": false,
  "nim-nemotron-nano-30b": false,
  "nim-nemotron-super-120b": false,
  // Nemotron 3 Ultra defaults OFF like every other NIM lane.
  "nim-nemotron-3-ultra": false,
  "nim-qwen-122b": false,
  "nim-qwen-397b": false,
  "nim-gpt-oss-20b": false,
  "nim-llama-4-maverick": false,
  "nim-llama-33-70b": false,
  // OpenRouter Granite lanes (PR-B) — both default OFF (opt-in only).
  "openrouter-granite-8b": false,
  "openrouter-granite-micro": false,
  // OpenRouter routing + coding lanes (PR-C) — all default OFF (opt-in only).
  "openrouter-kimi-k2.7-code": false,
  "openrouter-free": false,
  "openrouter-deepseek-r1-free": false,
  "openrouter-qwen3-coder-free": false,
})

// ─── Registry ─────────────────────────────────────────────────────────────────

/**
 * Static descriptor for every selectable provider id. Mirrors what the env
 * var operator can type — kept readonly so a typo'd id can't accidentally
 * mutate the registry. Resolution to a fully-populated `ReviewerProvider`
 * (which needs the API key from env) happens in `selectReviewerProvider`.
 */
interface ProviderDescriptor {
  kind: ProviderKind
  model: string
  baseURL?: string
  /** Env var holding the API key for this provider. */
  apiKeyEnv: string
  label: string
  /**
   * Extra top-level body fields merged into the `/chat/completions` payload for
   * this lane — the terrain for the OpenRouter Fusion router (`plugins: [...]`)
   * and routing params (`provider.sort`, `route`, `models[]`). Declared here so
   * the descriptor shape is ready, but DELIBERATELY NOT WIRED into
   * `openai-agent-loop.ts` yet — Fusion/Pareto are phase 2 (see
   * `docs/site/content/decisions/openrouter-routing.md`). No lane sets it today;
   * `selectReviewerProvider` passes it through verbatim so the loop can opt in
   * later without a registry change.
   */
  extraBody?: Readonly<Record<string, unknown>>
}

const REGISTRY: Readonly<Record<string, ProviderDescriptor>> = Object.freeze({
  "gemini-direct": {
    kind: "gemini-direct",
    model: GEMINI_DEFAULT_MODEL,
    apiKeyEnv: GOOGLE_AI_API_KEY_ENV,
    label: "gemini-direct (gemini-3.5-flash)",
  },
  "nim-kimi": {
    kind: "openai-compatible",
    model: NIM_MODEL_SLUGS.kimi,
    baseURL: NIM_BASE_URL,
    apiKeyEnv: NVIDIA_API_KEY_ENV,
    label: `nim-kimi (${NIM_MODEL_SLUGS.kimi})`,
  },
  "nim-glm": {
    kind: "openai-compatible",
    model: NIM_MODEL_SLUGS.glm,
    baseURL: NIM_BASE_URL,
    apiKeyEnv: NVIDIA_API_KEY_ENV,
    label: `nim-glm (${NIM_MODEL_SLUGS.glm})`,
  },
  "nim-deepseek": {
    kind: "openai-compatible",
    model: NIM_MODEL_SLUGS.deepseek,
    baseURL: NIM_BASE_URL,
    apiKeyEnv: NVIDIA_API_KEY_ENV,
    label: `nim-deepseek (${NIM_MODEL_SLUGS.deepseek})`,
  },
  "nim-qwen": {
    kind: "openai-compatible",
    model: NIM_MODEL_SLUGS.qwen,
    baseURL: NIM_BASE_URL,
    apiKeyEnv: NVIDIA_API_KEY_ENV,
    label: `nim-qwen (${NIM_MODEL_SLUGS.qwen})`,
  },
  // ─── NIM expansion lanes ────────────────────────────────────────
  // 8 new NIM lanes (Kimi 2.6 / GLM 5.1 from the user's expansion list were
  // already covered by nim-kimi / nim-glm above). All reuse openai-compatible
  // loop + NVIDIA_API_KEY — flippable per service with no redeploy.
  "nim-minimax-m27": {
    kind: "openai-compatible",
    model: NIM_MODEL_SLUGS.minimax,
    baseURL: NIM_BASE_URL,
    apiKeyEnv: NVIDIA_API_KEY_ENV,
    label: `nim-minimax-m27 (${NIM_MODEL_SLUGS.minimax})`,
  },
  "nim-nemotron-nano-30b": {
    kind: "openai-compatible",
    model: NIM_MODEL_SLUGS.nemotronNano,
    baseURL: NIM_BASE_URL,
    apiKeyEnv: NVIDIA_API_KEY_ENV,
    label: `nim-nemotron-nano-30b (${NIM_MODEL_SLUGS.nemotronNano})`,
  },
  // Heavy-weights — latency may exceed the ~60s wall-clock review SLO.
  // Smoke-test before any default promotion. Kept in the registry because the
  // ensemble follow-up benefits from large-model recall even when
  // they are unfit as primary alternatives.
  "nim-nemotron-super-120b": {
    kind: "openai-compatible",
    model: NIM_MODEL_SLUGS.nemotronSuper,
    baseURL: NIM_BASE_URL,
    apiKeyEnv: NVIDIA_API_KEY_ENV,
    label: `nim-nemotron-super-120b (${NIM_MODEL_SLUGS.nemotronSuper})`,
  },
  // Nemotron 3 Ultra 550B (preferred adversarial-chain head).
  // Heaviest lane; latency may exceed the ~60s SLO — the adversarial fallback
  // chain (resolveAdversarialProviderChain) degrades to a lighter lane if this
  // one can't resolve. Slug confirmed in the NIM `/v1/models` catalog 2026-06-09.
  "nim-nemotron-3-ultra": {
    kind: "openai-compatible",
    model: NIM_MODEL_SLUGS.nemotronUltra,
    baseURL: NIM_BASE_URL,
    apiKeyEnv: NVIDIA_API_KEY_ENV,
    label: `nim-nemotron-3-ultra (${NIM_MODEL_SLUGS.nemotronUltra})`,
  },
  "nim-qwen-122b": {
    kind: "openai-compatible",
    model: NIM_MODEL_SLUGS.qwen122,
    baseURL: NIM_BASE_URL,
    apiKeyEnv: NVIDIA_API_KEY_ENV,
    label: `nim-qwen-122b (${NIM_MODEL_SLUGS.qwen122})`,
  },
  "nim-qwen-397b": {
    kind: "openai-compatible",
    model: NIM_MODEL_SLUGS.qwen397,
    baseURL: NIM_BASE_URL,
    apiKeyEnv: NVIDIA_API_KEY_ENV,
    label: `nim-qwen-397b (${NIM_MODEL_SLUGS.qwen397})`,
  },
  "nim-gpt-oss-20b": {
    kind: "openai-compatible",
    model: NIM_MODEL_SLUGS.gptOss,
    baseURL: NIM_BASE_URL,
    apiKeyEnv: NVIDIA_API_KEY_ENV,
    label: `nim-gpt-oss-20b (${NIM_MODEL_SLUGS.gptOss})`,
  },
  "nim-llama-4-maverick": {
    kind: "openai-compatible",
    model: NIM_MODEL_SLUGS.llamaMaverick,
    baseURL: NIM_BASE_URL,
    apiKeyEnv: NVIDIA_API_KEY_ENV,
    label: `nim-llama-4-maverick (${NIM_MODEL_SLUGS.llamaMaverick})`,
  },
  "nim-llama-33-70b": {
    kind: "openai-compatible",
    model: NIM_MODEL_SLUGS.llama70,
    baseURL: NIM_BASE_URL,
    apiKeyEnv: NVIDIA_API_KEY_ENV,
    label: `nim-llama-33-70b (${NIM_MODEL_SLUGS.llama70})`,
  },
  // ─── OpenRouter Granite lanes (PR-B, #285) ──────────────────────
  // Fresh provider family. One API key (OPENROUTER_API_KEY) serves every
  // openrouter-* lane (future Anthropic, Mistral, etc. would only need new
  // registry entries). The 8b is the recommended alt-reviewer; micro is an
  // ensemble fast-lane only.
  "openrouter-granite-8b": {
    kind: "openai-compatible",
    model: OPENROUTER_MODEL_SLUGS.granite8b,
    baseURL: OPENROUTER_BASE_URL,
    apiKeyEnv: OPENROUTER_API_KEY_ENV,
    label: `openrouter-granite-8b (${OPENROUTER_MODEL_SLUGS.granite8b})`,
  },
  "openrouter-granite-micro": {
    kind: "openai-compatible",
    model: OPENROUTER_MODEL_SLUGS.graniteMicro,
    baseURL: OPENROUTER_BASE_URL,
    apiKeyEnv: OPENROUTER_API_KEY_ENV,
    label: `openrouter-granite-micro (${OPENROUTER_MODEL_SLUGS.graniteMicro})`,
  },
  // ─── OpenRouter routing + coding lanes (PR-C, #286) ─────────────
  // Same provider family / single OPENROUTER_API_KEY / openai-compatible loop
  // as the Granite lanes above — no new secret, no new wire format. These add
  // a coding-specialized lane (kimi-k2.7-code) and the FREE-tier lanes (the
  // free router + two `:free` variants). Fusion (`openrouter/fusion`) and the
  // Pareto router are PHASE 2 — they need the `extraBody`/`plugins` wiring in
  // `openai-agent-loop.ts` and are documented in the ADR, NOT shipped here.
  "openrouter-kimi-k2.7-code": {
    kind: "openai-compatible",
    model: OPENROUTER_MODEL_SLUGS.kimiK27Code,
    baseURL: OPENROUTER_BASE_URL,
    apiKeyEnv: OPENROUTER_API_KEY_ENV,
    label: `openrouter-kimi-k2.7-code (${OPENROUTER_MODEL_SLUGS.kimiK27Code})`,
  },
  // The FREE ROUTER — picks a random free model filtered by capability. Low
  // rate-limit + variable latency; small-diff / dev lane only (token-hungry
  // reviews saturate the free tier — see the ADR caveat).
  "openrouter-free": {
    kind: "openai-compatible",
    model: OPENROUTER_MODEL_SLUGS.free,
    baseURL: OPENROUTER_BASE_URL,
    apiKeyEnv: OPENROUTER_API_KEY_ENV,
    label: `openrouter-free (${OPENROUTER_MODEL_SLUGS.free})`,
  },
  // Specific `:free` variants (verify against the live OpenRouter catalog
  // before promoting — `:free` availability rotates). Both documented as
  // tool-call-capable, required for the function-calling loop.
  "openrouter-deepseek-r1-free": {
    kind: "openai-compatible",
    model: OPENROUTER_MODEL_SLUGS.deepseekR1Free,
    baseURL: OPENROUTER_BASE_URL,
    apiKeyEnv: OPENROUTER_API_KEY_ENV,
    label: `openrouter-deepseek-r1-free (${OPENROUTER_MODEL_SLUGS.deepseekR1Free})`,
  },
  "openrouter-qwen3-coder-free": {
    kind: "openai-compatible",
    model: OPENROUTER_MODEL_SLUGS.qwen3CoderFree,
    baseURL: OPENROUTER_BASE_URL,
    apiKeyEnv: OPENROUTER_API_KEY_ENV,
    label: `openrouter-qwen3-coder-free (${OPENROUTER_MODEL_SLUGS.qwen3CoderFree})`,
  },
})

/** Provider ids the registry knows about — used for the invalid-id error. */
const VALID_PROVIDER_IDS = Object.keys(REGISTRY)

// ─── Selection ────────────────────────────────────────────────────────────────

/**
 * Read `process.env` (or the injected map) and return a fully-resolved
 * `ReviewerProvider`. Pure with respect to its `env` parameter — tests pass
 * a synthetic map; the production caller passes `process.env`.
 *
 * Selection rules (locked by tests):
 * - `REVIEWER_PROVIDER` unset OR `""` → `gemini-direct` (no regression).
 * - `REVIEWER_PROVIDER` is a known id → use that descriptor.
 * - `REVIEWER_PROVIDER` is unknown → throw with the list of valid ids.
 * - Required api-key env var unset / empty → throw with a clear message
 *   identifying which env var is missing AND which provider needed it.
 *
 * @throws Error if the id is unknown or the required api key is missing.
 */
export function selectReviewerProvider(env: NodeJS.ProcessEnv = process.env): ReviewerProvider {
  const rawId = (env[REVIEWER_PROVIDER_ENV] ?? "").trim()
  const id = rawId.length === 0 ? DEFAULT_PROVIDER_ID : rawId

  const descriptor = REGISTRY[id]
  if (!descriptor) {
    throw new Error(
      `Invalid ${REVIEWER_PROVIDER_ENV}="${rawId}". ` +
        `Valid values: ${VALID_PROVIDER_IDS.join(", ")}.`,
    )
  }

  const apiKey = (env[descriptor.apiKeyEnv] ?? "").trim()
  if (apiKey.length === 0) {
    // Match the literal message in CLAUDE.md / PR description so an
    // operator grepping logs lands on the right env var fast.
    throw new Error(
      `Server misconfigured: ${REVIEWER_PROVIDER_ENV}=${id} requires ` +
        `${descriptor.apiKeyEnv}, but it is unset or empty.`,
    )
  }

  return {
    id,
    kind: descriptor.kind,
    model: descriptor.model,
    apiKey,
    baseURL: descriptor.baseURL,
    label: descriptor.label,
    extraBody: descriptor.extraBody,
  }
}

/**
 * Exported for tests + the deploy.yml comment — keeps the canonical list of
 * provider ids in one place.
 */
export function listProviderIds(): readonly string[] {
  return VALID_PROVIDER_IDS
}

// ─── Ensemble selection ───────────────────────────────────────────

/**
 * Returns `true` when the ensemble dispatcher should run. Strict string
 * comparison — only the literal `"true"` opts in, matching the
 * `DAILY_REPORTS_ENABLED` / `STALE_ALERTS_ENABLED` convention. Any other
 * value (including `"1"`, `"yes"`, whitespace) keeps the single-lane path.
 *
 * The asymmetry vs `isLaneEnabled` (which accepts `true|1|yes|on`) is
 * intentional: this is the load-bearing back-compat switch. A typo like
 * `"yes"` or `"1"` MUST NOT silently enable ensemble mode — the single-lane
 * path is the default-safe; opting in requires the explicit literal.
 * Per-lane flags are looser because operators flip them from the Cloud Run
 * console where ergonomics matter more than typo-resistance.
 */
export function isEnsembleEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return (env[REVIEWER_ENSEMBLE_ENABLED_ENV] ?? "").trim() === "true"
}

/**
 * Truthy-string check for per-lane `*_ENABLED` flags. Looser than the
 * ensemble gate (accepts `"true"` / `"1"`) because per-lane flags are
 * commonly flipped from the Cloud Run console, where ops might type `"1"`.
 * Unset → fall back to `LANE_DEFAULT_ENABLED[id]`.
 */
function isLaneEnabled(env: NodeJS.ProcessEnv, laneId: string): boolean {
  const flagName = LANE_FLAG_ENV[laneId]
  if (!flagName) return LANE_DEFAULT_ENABLED[laneId] ?? false

  const raw = env[flagName]
  if (raw === undefined) return LANE_DEFAULT_ENABLED[laneId] ?? false

  const v = raw.trim().toLowerCase()
  if (v === "") return LANE_DEFAULT_ENABLED[laneId] ?? false
  if (v === "true" || v === "1" || v === "yes" || v === "on") return true
  if (v === "false" || v === "0" || v === "no" || v === "off") return false
  // Unrecognized value → fall back to default (don't crash the review path).
  return LANE_DEFAULT_ENABLED[laneId] ?? false
}

/**
 * Returns the list of `ReviewerProvider` records for every lane the operator
 * has enabled via `REVIEWER_<LANE>_ENABLED` env vars.
 *
 * Selection rules:
 *  - Each registry id is consulted; if its `*_ENABLED` flag is on (or
 *    defaults to ON in `LANE_DEFAULT_ENABLED`), AND its api key env var is
 *    populated, it joins the returned list.
 *  - A lane whose flag is ON but whose api key is missing is SKIPPED with a
 *    warning emitted via the optional logger. Default-safe behavior: we
 *    don't sink the whole ensemble for a single misconfigured lane.
 *  - Empty result is allowed (caller decides what to do — typically: post
 *    nothing, log a clear warning).
 *
 * This is the load-bearing fail-safe for the ensemble path: if all lanes
 * end up disabled or unconfigured, the dispatcher exits without crashing.
 *
 * Pure with respect to its `env` parameter — tests pass a synthetic map.
 */
export function selectEnabledLanes(
  env: NodeJS.ProcessEnv = process.env,
  logger?: { warn(msg: string): void },
): ReviewerProvider[] {
  const lanes: ReviewerProvider[] = []

  for (const id of VALID_PROVIDER_IDS) {
    if (!isLaneEnabled(env, id)) continue

    const descriptor = REGISTRY[id]
    const apiKey = (env[descriptor.apiKeyEnv] ?? "").trim()
    if (apiKey.length === 0) {
      logger?.warn(
        `reviewer-providers: lane=${id} is enabled but ${descriptor.apiKeyEnv} ` +
          "is unset/empty — skipping lane (ensemble continues with the rest).",
      )
      continue
    }

    lanes.push({
      id,
      kind: descriptor.kind,
      model: descriptor.model,
      apiKey,
      baseURL: descriptor.baseURL,
      label: descriptor.label,
      extraBody: descriptor.extraBody,
    })
  }

  return lanes
}
