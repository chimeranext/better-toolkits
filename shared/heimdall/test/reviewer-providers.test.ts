/**
 * Tests de resolución de lanes del registry — foco en los lanes OpenRouter
 * agregados en PR-C (kimi-k2.7-code, free router, `:free` variants).
 *
 * `selectReviewerProvider` es pura respecto a su `env`, así que cada caso pasa
 * un mapa sintético — NO se toca `process.env` ni se hace red. Cubre:
 *   - resolución correcta (baseURL OpenRouter + OPENROUTER_API_KEY + model slug),
 *   - error claro cuando falta OPENROUTER_API_KEY para un lane openrouter-*,
 *   - el campo `extraBody` sigue `undefined` (terreno de fase 2, no cableado),
 *   - back-compat: env vacío → gemini-direct.
 */

import { test, expect } from "bun:test"
import {
  selectReviewerProvider,
  selectEnabledLanes,
  listProviderIds,
  OPENROUTER_API_KEY_ENV,
  REVIEWER_PROVIDER_ENV,
  DEFAULT_PROVIDER_ID,
} from "../src/lib/reviewer-providers.ts"

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"

test("openrouter-kimi-k2.7-code resuelve al provider correcto (baseURL + key + model)", () => {
  const provider = selectReviewerProvider({
    [REVIEWER_PROVIDER_ENV]: "openrouter-kimi-k2.7-code",
    [OPENROUTER_API_KEY_ENV]: "sk-or-test",
  })
  expect(provider.id).toBe("openrouter-kimi-k2.7-code")
  expect(provider.kind).toBe("openai-compatible")
  expect(provider.baseURL).toBe(OPENROUTER_BASE_URL)
  expect(provider.apiKey).toBe("sk-or-test")
  expect(provider.model).toBe("moonshotai/kimi-k2.7-code")
  // extraBody NO cableado todavía (fase 2 — Fusion).
  expect(provider.extraBody).toBeUndefined()
})

test("openrouter-free resuelve al free router con la misma key", () => {
  const provider = selectReviewerProvider({
    [REVIEWER_PROVIDER_ENV]: "openrouter-free",
    [OPENROUTER_API_KEY_ENV]: "sk-or-test",
  })
  expect(provider.id).toBe("openrouter-free")
  expect(provider.kind).toBe("openai-compatible")
  expect(provider.baseURL).toBe(OPENROUTER_BASE_URL)
  expect(provider.model).toBe("openrouter/free")
  expect(provider.apiKey).toBe("sk-or-test")
})

test("los `:free` variants resuelven a sus slugs específicos", () => {
  const r1 = selectReviewerProvider({
    [REVIEWER_PROVIDER_ENV]: "openrouter-deepseek-r1-free",
    [OPENROUTER_API_KEY_ENV]: "sk-or-test",
  })
  expect(r1.model).toBe("deepseek/deepseek-r1:free")
  expect(r1.baseURL).toBe(OPENROUTER_BASE_URL)

  const qwen = selectReviewerProvider({
    [REVIEWER_PROVIDER_ENV]: "openrouter-qwen3-coder-free",
    [OPENROUTER_API_KEY_ENV]: "sk-or-test",
  })
  expect(qwen.model).toBe("qwen/qwen3-coder:free")
  expect(qwen.baseURL).toBe(OPENROUTER_BASE_URL)
})

test("falta OPENROUTER_API_KEY para un lane openrouter-* → error claro", () => {
  expect(() =>
    selectReviewerProvider({
      [REVIEWER_PROVIDER_ENV]: "openrouter-kimi-k2.7-code",
      // sin OPENROUTER_API_KEY
    }),
  ).toThrow(/OPENROUTER_API_KEY/)
})

test("el mensaje de error nombra el lane y la env var que falta", () => {
  let message = ""
  try {
    selectReviewerProvider({
      [REVIEWER_PROVIDER_ENV]: "openrouter-free",
    })
  } catch (e) {
    message = (e as Error).message
  }
  expect(message).toContain("openrouter-free")
  expect(message).toContain(OPENROUTER_API_KEY_ENV)
})

test("env vacío → gemini-direct (back-compat sin regresión)", () => {
  const provider = selectReviewerProvider({
    [OPENROUTER_API_KEY_ENV]: "sk-or-test",
    GOOGLE_AI_API_KEY: "g-test",
  })
  expect(provider.id).toBe(DEFAULT_PROVIDER_ID)
  expect(provider.kind).toBe("gemini-direct")
})

test("los 4 lanes OpenRouter nuevos están registrados", () => {
  const ids = listProviderIds()
  expect(ids).toContain("openrouter-kimi-k2.7-code")
  expect(ids).toContain("openrouter-free")
  expect(ids).toContain("openrouter-deepseek-r1-free")
  expect(ids).toContain("openrouter-qwen3-coder-free")
})

test("los lanes OpenRouter nuevos están OFF por defecto en el ensemble", () => {
  // Sólo gemini-direct (ON por defecto) participa cuando no se setea ningún flag.
  const lanes = selectEnabledLanes({
    [OPENROUTER_API_KEY_ENV]: "sk-or-test",
    GOOGLE_AI_API_KEY: "g-test",
  })
  const laneIds = lanes.map((l) => l.id)
  expect(laneIds).not.toContain("openrouter-kimi-k2.7-code")
  expect(laneIds).not.toContain("openrouter-free")
  expect(laneIds).toContain("gemini-direct")
})

test("un lane OpenRouter activado por flag entra al ensemble con su key", () => {
  const lanes = selectEnabledLanes({
    REVIEWER_OPENROUTER_KIMI_K27_CODE_ENABLED: "true",
    [OPENROUTER_API_KEY_ENV]: "sk-or-test",
    // gemini-direct ON por defecto pero sin GOOGLE_AI_API_KEY → se salta.
  })
  const kimi = lanes.find((l) => l.id === "openrouter-kimi-k2.7-code")
  expect(kimi).toBeDefined()
  expect(kimi?.baseURL).toBe(OPENROUTER_BASE_URL)
  expect(kimi?.apiKey).toBe("sk-or-test")
  expect(kimi?.model).toBe("moonshotai/kimi-k2.7-code")
})
