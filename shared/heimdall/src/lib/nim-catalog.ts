/**
 * NIM catalog verification — queries build.nvidia.com (nim_type_preview) and
 * checks that the adversarial-chain lanes resolve to real, currently-available
 * free endpoints. This runs on every review (not one-off), so a dead slug
 * (e.g. kimi-k2.6 after it left the free catalog) is caught at runtime with a
 * warning instead of failing mid-review with an opaque HTTP 404.
 */
import { REVIEWER_ADVERSARIAL_CHAIN_ENV } from "./reviewer-providers.js"

export const NIM_CATALOG_PREVIEW_URL =
  "https://build.nvidia.com/models?filters=nimType%3Anim_type_preview"

/**
 * Fecha congelada del último re-priorizado MANUAL del catálogo NIM preview.
 * La cadena adversarial se alineó con los endpoints free verificados en esta
 * fecha. Esta constante NO se auto-actualiza y NO debe llevar la fecha de
 * "hoy": solo cambia cuando un humano re-consulta build.nvidia.com y
 * re-prioriza la cadena (en ese momento, se actualiza a la fecha de ese
 * re-priorizado).
 *
 * `isCatalogStale()` lo compara contra el reloj: si pasaron más de
 * `NIM_CATALOG_STALE_AFTER_DAYS` días desde este ancla, conviene WARN de que
 * los endpoints free rotaron y hay que volver a priorizar. Determinístico y
 * comparable.
 */
export const NIM_CATALOG_ANCHOR_DATE = "2026-10-28"

/** Días (TTL) tras los cuales se sugiere re-priorizar los modelos. */
export const NIM_CATALOG_STALE_AFTER_DAYS = 30

/** Convierte "YYYY-MM-DD" a timestamp UTC (medianoche). */
export function anchorTimestamp(date = NIM_CATALOG_ANCHOR_DATE): number {
  return Date.parse(`${date}T00:00:00Z`)
}

/**
 * Devuelve `true` si han pasado más de `NIM_CATALOG_STALE_AFTER_DAYS` días desde
 * el ancla congelado (o si el ancla es inválido). Determinístico y puro.
 */
export function isCatalogStale(now = Date.now()): boolean {
  const a = anchorTimestamp()
  if (Number.isNaN(a)) return true // ancla inválida → conservador: stale
  const elapsedMs = now - a
  return elapsedMs > NIM_CATALOG_STALE_AFTER_DAYS * 24 * 60 * 60 * 1000
}

/**
 * Parse the catalog page (HTML) into the set of model slugs currently exposed
 * as `nim_type_preview`. Each model card is an `<a href="/<org>/<slug>">`
 * (e.g. `/z-ai/glm-5-3-flash`, `/nvidia/nemotron-3.5-lightning-30b-a3b`).
 * We extract the last path segment (the slug) from those links, skipping
 * non-model links (`/models/...`, `/explore/...`, `/ipd/...`).
 */
export function parseNimCatalogSlugs(html: string): Set<string> {
  const slugs = new Set<string>()
  // org = [a-z0-9._-]+ ; slug = [a-zA-Z0-9._-]+
  const re = /href="\/([a-z0-9._-]+)\/([a-zA-Z0-9._-]+)"/g
  const NON_MODEL_ORGS = new Set(["models", "explore", "ipd"])
  let m: RegExpExecArray | null
  while ((m = re.exec(html)) !== null) {
    const org = m[1]
    const slug = m[2]
    if (NON_MODEL_ORGS.has(org)) continue
    slugs.add(slug)
  }
  return slugs
}

/** Map a registered NIM lane id → its model slug (for catalog cross-check). */
export const LANE_MODEL_SLUG: Record<string, string> = {
  "nim-kimi": "kimi-k2.6",
  "nim-glm": "glm-5.1",
  "nim-glm-5-3-flash": "glm-5-3-flash",
  "nim-deepseek": "deepseek-v4-pro",
  "nim-deepseek-v4.1-flash": "deepseek-v4.1-flash",
  "nim-qwen": "qwen3-coder-480b-a35b-instruct",
  "nim-minimax-m27": "minimax-m2.7",
  "nim-nemotron-nano-30b": "nemotron-3-nano-30b-a3b",
  "nim-nemotron-3.5-lightning": "nemotron-3.5-lightning-30b-a3b",
  "nim-nemotron-super-120b": "nemotron-3-super-120b-a12b",
  "nim-nemotron-3-ultra": "nemotron-3-ultra-550b-a55b",
  "nim-gpt-oss-20b": "gpt-oss-20b",
  "nim-llama-4-maverick": "llama-4-maverick-17b-128e-instruct",
  "nim-llama-33-70b": "llama-3.3-70b-instruct",
}

const NORMALIZE = (s: string) => s.toLowerCase().replace(/[._-]/g, "")

/**
 * Resolve the chain to check: the explicit env chain if set, else the default.
 * (Mirrors `resolveAdversarialProviderChain`'s candidate source but only for the
 * NIM `nim-*` lanes.)
 */
export function nimChainLanes(env: NodeJS.ProcessEnv = process.env): string[] {
  const raw = (env[REVIEWER_ADVERSARIAL_CHAIN_ENV] ?? "").trim()
  const chain = raw.length > 0 ? raw : DEFAULT_CHAIN_FOR_CHECK
  return chain
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.startsWith("nim-"))
}

// Local default duplicate to avoid a circular import; keep in sync with
// `DEFAULT_ADVERSARIAL_CHAIN` in reviewer-providers.ts.
const DEFAULT_CHAIN_FOR_CHECK =
  "nim-nemotron-3.5-lightning,nim-nemotron-3-ultra,nim-deepseek-v4.1-flash,nim-glm-5-3-flash"

/**
 * Cross-check the NIM lanes in the chain against the live free catalog.
 * Returns a list of `{ lane, slug }` that are missing from `catalogSlugs`.
 */
export function missingCatalogLanes(
  catalogSlugs: Set<string>,
  lanes: string[] = nimChainLanes(),
): { lane: string; slug: string }[] {
  const normCatalog = new Set([...catalogSlugs].map(NORMALIZE))
  const missing: { lane: string; slug: string }[] = []
  for (const lane of lanes) {
    const slug = LANE_MODEL_SLUG[lane]
    if (!slug) continue // unknown lane id → not our concern here
    if (!normCatalog.has(NORMALIZE(slug))) {
      missing.push({ lane, slug })
    }
  }
  return missing
}

/**
 * Fetch the live NIM preview catalog and return `{ slugs, error }`.
 * Never throws — on network failure, returns `{ slugs: <empty>, error }`.
 */
export async function fetchNimPreviewCatalog(): Promise<{
  slugs: Set<string>
  error?: string
}> {
  try {
    const res = await fetch(NIM_CATALOG_PREVIEW_URL, {
      method: "GET",
      headers: { accept: "text/html" },
    })
    if (!res.ok) {
      return { slugs: new Set(), error: `HTTP ${res.status}` }
    }
    const html = await res.text()
    return { slugs: parseNimCatalogSlugs(html) }
  } catch (e) {
    return { slugs: new Set(), error: e instanceof Error ? e.message : String(e) }
  }
}
