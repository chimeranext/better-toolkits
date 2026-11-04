# convention: typescript

id: typescript · version: 0.1.0 · status: draft · level: language
extracted_at: 2026-10-13 · ttl_expires: 2026-11-12
parent: none

## GOAL

TypeScript (and JS with `// @ts-check`) that `tsc --noEmit` accepts without errors,
with eslint+prettier style. No child framework in this change.

## SOURCES

| # | kind | ref | weight | why |
|---|------|-----|--------|----------|
| S1 | docs | handbook `type-checking-javascript-files` | load-bearing | checkJs |
| S2 | repo | `Mearman/typecheck-files` | load-bearing | typecheck without build |
| S3 | docs | MegaLinter typescript (eslint/prettier) | context | style in CI |
| S4 | repo | `RefactoringGuru/design-patterns-typescript` | load-bearing | idiomatic error handling (throw vs Result) |

## RULES

- T1 [check] `tsc --noEmit` clean. In `.js` set header `// @ts-check` → S1/S2.
- T2 [strict] `strict: true` in the program being gated → S1.
- T3 [templates] No ambiguous backticks in template literals: the standard
  backtick-Heimdall (LESSON L1) T1 catches it as a parse error → S1/L1.
- T4 [style] eslint + prettier of the pinned flavor → S3.
- T5 [errors] Error messages **prescriptive** (suggest an alternative), except `[SECRECY]`
  in the JSDoc (security by secrecy). Do not use `throw` for expected control flow →
  S4 + `conventions/prescriptive-error-messages.md`.
- T6 [BDD] Check observable behavior, not implementation. The BDD assertion is
  declared in the mini-language of `conventions/matcher-contract.md` and translated to the
  native matcher (**Chai** `expect().to.equal/contain/match` or **Jest** `expect().toEqual`).
  Jidoka + No-Workarounds gates per `assurance-toolkit/references/testing/e2e-protocol.md`.

The native matcher follows **TAS** (`../../../../references/engineering-standards/test-assertion-standards.md`): assert contracts, not snapshots.

## COUNTEREXAMPLES

```ts
// ❌ wrong: backtick that closes the template early (T3, LESSON L1)
export const HELP = `usa el comando ` + "`flag`" + ` real`;
//         (a lone backtick here turns the rest into a syntax error)

// ✅ right: no literal backticks inside the template
export const HELP = "usa el comando `flag` real";
```

```ts
// ❌ wrong: prohibitive error message without an alternative (T5)
throw new Error("Configuración inválida");

// ✅ right: prescriptive — says what to do
throw new Error("Configuración inválida; revisa ./config.json");

// ❌ wrong: generic message WITHOUT a secrecy marker (T5)
throw new Error("Credenciales inválidas");

// ✅ right: generic BUT marked [SECRECY] in the JSDoc
/**
 * Authenticates the user.
 * [SECRECY] do not reveal which field failed (security by secrecy).
 */
function login(u: string, p: string): AuthResult {
  throw new Error("Credenciales inválidas.");
}
```

## GATES

- local: `tsc --noEmit` (tsc 5.9.3 measured in dogfood).
- CI: local + pinned eslint + prettier.
- T5 (prescriptive): **warn no-block** — `conventions-warn-recorder.sh typescript/T5 <file> @<author>`. It does not block and records in `internal-audits`.

## LESSONS

- L1 (Heimdall incident, current session) Unescaped backtick in the HELP of
  `review.ts` left the suite at 0 tests → T3: pre-push typecheck mandatory.
- L2 (current session) Prohibitive message without an alternative confuses the agent. The cure is
  prescriptive or `[SECRECY]` in JSDoc → T5 (ref: `conventions/prescriptive-error-messages.md`).

## RECEIPT

`candidate_sha` + verdict + tree-check (see `_exemplars/typescript/`).
