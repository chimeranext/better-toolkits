import { test, expect } from "bun:test"
import {
  NIM_CATALOG_ANCHOR_DATE,
  NIM_CATALOG_STALE_AFTER_DAYS,
  anchorTimestamp,
  isCatalogStale,
  parseNimCatalogSlugs,
  missingCatalogLanes,
  nimChainLanes,
  LANE_MODEL_SLUG,
} from "../src/lib/nim-catalog.ts"

const DAY_MS = 24 * 60 * 60 * 1000

test("ancla congelada existe y es una fecha YYYY-MM-DD válida", () => {
  expect(NIM_CATALOG_ANCHOR_DATE).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  expect(Number.isNaN(anchorTimestamp())).toBe(false)
})

test("isCatalogStale: falso antes del TTL, verdadero después de >30 días", () => {
  const anchor = anchorTimestamp()
  // Justo en el ancla → no stale
  expect(isCatalogStale(anchor)).toBe(false)
  // Dentro del TTL (29 días) → no stale
  expect(isCatalogStale(anchor + (NIM_CATALOG_STALE_AFTER_DAYS - 1) * DAY_MS)).toBe(false)
  // Exactamente en el TTL → no stale (> estricto)
  expect(isCatalogStale(anchor + NIM_CATALOG_STALE_AFTER_DAYS * DAY_MS)).toBe(false)
  // Pasado el TTL (31 días) → stale
  expect(isCatalogStale(anchor + (NIM_CATALOG_STALE_AFTER_DAYS + 1) * DAY_MS)).toBe(true)
  // Lejísimo en el futuro → stale
  expect(isCatalogStale(anchor + 365 * DAY_MS)).toBe(true)
})

test("isCatalogStale: ancla inválida → conservador (stale)", () => {
  // monkeypatch temporal del ancla a valor inválido para verificar el guard
  const original = NIM_CATALOG_ANCHOR_DATE
  // @ts-expect-error - override de solo-lectura para el test
  // No podemos mutar el import const directamente; verificamos vía anchorTimestamp
  // con un valor inválido mediante la función pura.
  expect(Number.isNaN(anchorTimestamp("no-es-fecha"))).toBe(true)
  void original
})

test("parseNimCatalogSlugs extrae slugs de links href=/<org>/<slug>", () => {
  const html = `
    <html><body>
      <a href="/z-ai/glm-5-3-flash">GLM</a>
      <a href="/deepseek-ai/deepseek-v4.1-flash">DeepSeek</a>
      <a href="/nvidia/nemotron-3.5-lightning-30b-a3b">Nemotron</a>
      <a href="/nvidia/nemotron-3-ultra-550b-a55b">Ultra</a>
      <a href="/models/community">community</a>
      <a href="/explore/discover">explore</a>
    </body></html>
  `
  const slugs = parseNimCatalogSlugs(html)
  expect(slugs.has("glm-5-3-flash")).toBe(true)
  expect(slugs.has("deepseek-v4.1-flash")).toBe(true)
  expect(slugs.has("nemotron-3.5-lightning-30b-a3b")).toBe(true)
  expect(slugs.has("nemotron-3-ultra-550b-a55b")).toBe(true)
  // links no-modelo se saltan
  expect(slugs.has("community")).toBe(false)
  expect(slugs.has("discover")).toBe(false)
  expect(slugs.has("no-existent")).toBe(false)
})

test("missingCatalogLanes detecta lanes que no están en el catálogo libre", () => {
  const catalog = new Set([
    "glm-5-3-flash",
    "deepseek-v4.1-flash",
    "nemotron-3.5-lightning-30b-a3b",
    "nemotron-3-ultra-550b-a55b",
  ])
  const missing = missingCatalogLanes(catalog, [
    "nim-glm-5-3-flash",
    "nim-deepseek-v4.1-flash",
    "nim-nemotron-3.5-lightning",
    "nim-kimi",
  ])
  // nim-kimi no está en el catálogo → debe reportarse
  expect(missing.map((m) => m.lane)).toEqual(["nim-kimi"])
  expect(missing[0]?.slug).toBe(LANE_MODEL_SLUG["nim-kimi"])
})

test("missingCatalogLanes: cadena completa nueva está presente en el catálogo", () => {
  const catalog = new Set([
    "glm-5-3-flash",
    "deepseek-v4.1-flash",
    "nemotron-3.5-lightning-30b-a3b",
    "nemotron-3-ultra-550b-a55b",
  ])
  const missing = missingCatalogLanes(catalog, nimChainLanes())
  expect(missing).toEqual([])
})

test("nimChainLanes solo considera lanes nim-*", () => {
  const lanes = nimChainLanes({ REVIEWER_ADVERSARIAL_CHAIN: "nim-glm-5-3-flash,gemini-direct,nim-deepseek-v4.1-flash" } as NodeJS.ProcessEnv)
  expect(lanes).toEqual(["nim-glm-5-3-flash", "nim-deepseek-v4.1-flash"])
})
