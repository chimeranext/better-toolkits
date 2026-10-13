# convention: typescript
id: typescript · version: 0.1.0 · status: draft · level: language
extracted_at: 2026-10-13 · ttl_expires: 2026-11-12
parent: none

## GOAL

TypeScript (y JS con `// @ts-check`) que `tsc --noEmit` acepta sin errores,
con estilo eslint+prettier. Sin framework hijo en esta change.

## SOURCES

| # | kind | ref | weight | para qué |
|---|------|-----|--------|----------|
| S1 | docs | handbook `type-checking-javascript-files` | load-bearing | checkJs |
| S2 | repo | `Mearman/typecheck-files` | load-bearing | typecheck sin build |
| S3 | docs | MegaLinter typescript (eslint/prettier) | context | estilo en CI |

## RULES

- T1 [check] `tsc --noEmit` limpio; en `.js`, cabecera `// @ts-check` → S1/S2.
- T2 [strict] `strict: true` en el programa que se gatea → S1.
- T3 [templates] Nada de backticks ambiguos en template literals: la clase
  backtick-Heimdall (LESSON L1) la frena T1 como error de parseo → S1/L1.
- T4 [style] eslint + prettier del flavor pineado → S3.

## COUNTEREXAMPLES

```ts
// ❌ wrong: backtick que cierra el template antes de tiempo (T3, LESSON L1)
export const HELP = `usa el comando ` + "`flag`" + ` real`;
//         (un backtick suelto acá convierte el resto en syntax error)

// ✅ right: sin backticks literales dentro del template
export const HELP = "usa el comando `flag` real";
```

## GATES

- local: `tsc --noEmit` (tsc 5.9.3 medido en dogfood).
- CI: lo local + eslint + prettier pineados.

## LESSONS

- L1 (incidente Heimdall, sesión actual) Backtick sin escapar en el HELP de
  `review.ts` dejó la suite en 0 tests → T3: typecheck pre-push obligatorio.

## RECEIPT

`candidate_sha` + verdict + tree-check (ver `_dogfood/typescript/`).
