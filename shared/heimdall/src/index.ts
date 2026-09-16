/**
 * @chimeranext/heimdall — punto de entrada público del package.
 *
 * Heimdall es un PR-reviewer LLM standalone. Bypassa el gateway y POSTea
 * directo a proveedores LLM OpenAI-compatibles (NVIDIA NIM por defecto, con Kimi
 * K2.6). Self-contained: no consume agentic-core.
 */

// Orquestador de alto nivel
export { reviewPullRequest, buildReviewUserPrompt } from "./reviewer.ts"
export type { ReviewPullRequestOptions } from "./reviewer.ts"

// Puerto + tipos de dominio
export type {
  GitHubPort,
  PullRequestData,
  PullRequestFile,
  ReviewComment,
  ReviewInput,
  ReviewResult,
  FileContent,
  CodeSearchResult,
} from "./lib/github-port.ts"

// Adaptadores
export { FetchGitHubAdapter } from "./adapters/fetch-github-adapter.ts"
export { MockPostAdapter } from "./adapters/mock-post-adapter.ts"
export { FixtureGitHubAdapter } from "./adapters/fixture-github-adapter.ts"
export { TokenGitHubAdapter } from "./adapters/token-github-adapter.ts"
export type { TokenGitHubAdapterOptions } from "./adapters/token-github-adapter.ts"

// Dispatcher + loop
export { runReviewLoop } from "./lib/review-loop.ts"
export type { ReviewLoopOptions, ReviewLoopResult } from "./lib/review-loop.ts"
export { runOpenAIReviewLoop } from "./lib/openai-agent-loop.ts"
export type { OpenAIReviewLoopOptions, OpenAIReviewLoopResult } from "./lib/openai-agent-loop.ts"

// Registry de proveedores (multi-lane + fallback chain conservados completos)
export {
  selectReviewerProvider,
  selectEnabledLanes,
  listProviderIds,
  DEFAULT_PROVIDER_ID,
} from "./lib/reviewer-providers.ts"
export type { ReviewerProvider, ProviderKind } from "./lib/reviewer-providers.ts"

// Tools
export {
  REVIEWER_TOOL_DEFINITIONS,
  GITHUB_TOOL_DEFINITIONS,
  createGithubToolExecutor,
} from "./tools/github-tool-defs.ts"

// Prompts
export {
  REVIEWER_SYSTEM_INSTRUCTION,
  ADVERSARIAL_REVIEWER_SYSTEM_INSTRUCTION,
} from "./lib/reviewer-prompts.ts"

// Seams (no-op por defecto; aditivos para un adaptador futuro a agentic-core)
export { noopCostSink, noopPiiRedactor } from "./lib/seams.ts"
export type { CostSink, PiiRedactor } from "./lib/seams.ts"

// Host (reemplazo local de openclaw/plugin-sdk)
export { consoleLogger } from "./lib/host.ts"
export type { HostApi, HostLogger } from "./lib/host.ts"

// TOOL_NAMES (subconjunto del reviewer)
export { TOOL_NAMES } from "./lib/tool-names.ts"
