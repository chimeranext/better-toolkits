/**
 * TOOL_NAMES — subconjunto mínimo de los nombres de tools que el reviewer usa
 * de extremo a extremo. El reviewer original tenía un bloque de ~70 tools
 * (onboarding, setter, hackathon, Linear, Cloud Run, etc.) que NO se conserva:
 * son del agente conversacional, ajenos a Heimdall.
 *
 * Los identificadores llevan el prefijo de marca `bifrost_github_*`. Son el
 * contrato de wire que el LLM ve en las definiciones de tool, así que tienen
 * que quedar idénticos en todos lados (defs, executor, prompt, el `tool_choice`
 * forzado a `bifrost_github_review_post` en `openai-agent-loop.ts` y la
 * detección de `reviewPosted`). Renombrar uno exige cambiarlo en todos los
 * consumidores a la vez o el tool-calling se rompe.
 */
export const TOOL_NAMES = {
  GITHUB_PR_READ: "bifrost_github_pr_read",
  GITHUB_FILE_READ: "bifrost_github_file_read",
  GITHUB_REVIEW_POST: "bifrost_github_review_post",
  GITHUB_REVIEW_REPLY: "bifrost_github_review_reply",
  GITHUB_REPO_TREE: "bifrost_github_repo_tree",
  GITHUB_CODE_SEARCH: "bifrost_github_code_search",
} as const
