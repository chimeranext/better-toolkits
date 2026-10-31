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
| S4 | repo | `RefactoringGuru/design-patterns-typescript` | load-bearing | error handling idiomático (throw vs Result) |

## RULES

- T1 [check] `tsc --noEmit` limpio; en `.js`, cabecera `// @ts-check` → S1/S2.
- T2 [strict] `strict: true` en el programa que se gatea → S1.
- T3 [templates] Nada de backticks ambiguos en template literals: la clase
  backtick-Heimdall (LESSON L1) la frena T1 como error de parseo → S1/L1.
- T4 [style] eslint + prettier del flavor pineado → S3.
- T5 [errors] Mensajes de error **prescriptivos** (sugieren alternativa), salvo `[SECRECY]`
  en el JSDoc (seguridad por secrecía). No usar `throw` para flujo de control esperado →
  S4 + `conventions/prescriptive-error-messages.md`.
- T6 [BDD] Verificar comportamiento observable, no implementación. La afirmación BDD se
  declara en el mini-lenguaje del `conventions/matcher-contract.md` y se traduce al
  matcher nativo (**Chai** `expect().to.equal/contain/match` o **Jest** `expect().toEqual`).
  Gates Jidoka + No-Workarounds según `assurance-toolkit/references/testing/e2e-protocol.md`.

## COUNTEREXAMPLES

```ts
// ❌ wrong: backtick que cierra el template antes de tiempo (T3, LESSON L1)
export const HELP = `usa el comando ` + "`flag`" + ` real`;
//         (un backtick suelto acá convierte el resto en syntax error)

// ✅ right: sin backticks literales dentro del template
export const HELP = "usa el comando `flag` real";
```

```ts
// ❌ wrong: mensaje de error prohibitivo sin alternativa (T5)
throw new Error("Configuración inválida");

// ✅ right: prescriptivo — dice qué hacer
throw new Error("Configuración inválida; revisa ./config.json");

// ❌ wrong: mensaje genérico SIN marca de secrecía (T5)
throw new Error("Credenciales inválidas");

// ✅ right: genérico PERO marcado [SECRECY] en el JSDoc
/**
 * Autentica al usuario.
 * [SECRECY] no revelar qué campo falló (seguridad por secrecía).
 */
function login(u: string, p: string): AuthResult {
  throw new Error("Credenciales inválidas.");
}
```

## GATES

- local: `tsc --noEmit` (tsc 5.9.3 medido en dogfood).
- CI: lo local + eslint + prettier pineados.
- T5 (prescriptivo): **warn no-block** — `conventions-warn-recorder.sh typescript/T5 <file> @<author>`; no bloquea, registra en `internal-audits`.

## LESSONS

- L1 (incidente Heimdall, sesión actual) Backtick sin escapar en el HELP de
  `review.ts` dejó la suite en 0 tests → T3: typecheck pre-push obligatorio.
- L2 (sesión actual) Mensaje prohibitivo sin alternativa confunde al agente; la cura es
  prescriptivo o `[SECRECY]` en JSDoc → T5 (ref: `conventions/prescriptive-error-messages.md`).

## RECEIPT

`candidate_sha` + verdict + tree-check (ver `_exemplars/typescript/`).
