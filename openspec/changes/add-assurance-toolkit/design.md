# Design — add-assurance-toolkit

## Context

Ver `proposal.md` (Why). Estado actual: los 7 comandos viven en `make-no-mistakes-toolkit/commands/` + protocolos en `references/`; el monorepo exige protocolo markdown en `toolkits/<name>/references/` + entradas thin en `commands/` + Cursor skills, un solo store OpenSpec en raíz, y shims como patrón de migración (precedente `disk-cleanup`).

## Goals / Non-Goals

**Goals:**
- Nuevo `toolkits/assurance-toolkit/` que pase `openspec validate` y siga el layout multi-harness.
- Migración sin ruptura: shims delegantes con warning.
- Frontera clara: assurance escribe evidencia, dev-workflow la consume.

**Non-Goals:**
- No implementar el broker webhook Qualflare→Linear ni providers (solo protocolo).
- No borrar shims ni tocar gates (`ready-to-review-mergeable`, `premortem`).
- No definir `receipts/` (slot reservado vacío).

## Decisions

- **Layout espejo + shims, no move puro.** Por qué: evita romper sesiones/scripts que invocan los comandos viejos; alternativa (mover y romper) descartada por costo de migración en HabitaNexus.
- **2 pilares + transversal con runner propio** (testing, liveness; security transversal). Por qué: decisión consolidada de la sesión HabitaNexus (seq 1519-1532); alternativa 3-pilares (correctness/liveness/safety como pilares iguales) descartada porque seguridad tiene cadencia/owner/gate distintos y como tercer pilar igualitario presiona a mezclar veredictos.
- **Triage compartido como patrón, no como comando único.** Misma forma (cola → dueño → SLA → receipt), dos owners (testing vs seguridad). Evita duplicar código y evita mezclar reportes.
- **`gemini-code-review` → `--provider gemini` en `local-pr-review`.** Fusión por proveedor (precedente Heimdall/Kimi vía NIM); shim con warning, borrado en minor siguiente.
- **Tres capabilities OpenSpec** (`assurance-testing`, `assurance-liveness`, `assurance-security`) en vez de una catch-all. Cada una evoluciona con sus requirements sin acoplar cadencias.
- **Cuarta capability de gobierno, no de ejecución.** `assurance-governance` no corre tests: define cómo se mide (DORA/DER/MTTD), qué bloquea (gates) y qué queda como evidencia (receipts). Sin ella, los tres pilares emiten reportes que nadie puede convertir en decisión de release.
- **Testing polyglot con un protocolo de evidencia, runners por stack.** Misma forma (run → collect → link a Linear → cluster) para Flutter, Laravel/Pest, Elixir/ExUnit y TS7; cada stack aporta su runner nativo (`php artisan test`, `mix test`, `tsgo`) en vez de un runner genérico que no entiende ningún ecosistema. La skill `pest-testing-laraveldaily` (vía `npx skills add …nativephp-larapackagehunt --skill pest-testing-laraveldaily`) es dependencia de autoría documentada, no código del toolkit.
- **Pirámide Flutter mapea a comandos existentes.** Unit/widget van a `e2e-test-builder/runner` (nivel código), integración + Maestro a `e2e-test-runner/preview` (nivel device); `flutter_driver` no recibe protocolo nuevo, solo shim de migración. `Semantics.identifier` es AC del design system, no detalle del runner.
- **Adapter primero, framework después.** El panorama (Maestro/Cypress/Playwright/Selenium/Appium, Vitest/Jest) cambia cada año; lo estable es el protocolo run → collect → link → cluster. Por eso el toolkit bendice adapters iniciales (los 4 stacks) y manda el resto a backlog con PoC obligatoria — adoptar sin PoC repite el error de acoplar el gate a una herramienta.
- **Reinterpretar skills, no vendorarlos.** Los skills externos se leen y se reescriben como protocolo propio con disclosure progresivo (índice liviano + guías on-demand), igual que el patrón Agent Skills: el repo no carga 79 guías en cada sesión. Licencias respetadas (MIT / Apache-2.0) con atribución en el protocolo.
- **Stories: escribir una vez, correr en todos lados.** El component testing web no crea una suite nueva: la story es el fixture y cada runner (Vitest, a11y, visual, E2E) la consume. Alternativa descartada: suites separadas por nivel (duplican autoría y divergen en una semana).
- **Simetría web ↔ Flutter.** Storybook (stories CSF) y Widgetbook (scenarios congelados) son el mismo patrón en dos ecosistemas: authoring exploratorio + fixtures congeladas + matriz de entorno + diffs (visual y semántica). El protocolo los trata como un solo adapter de component testing con dos drivers.
- **Los agentes también son el sistema bajo test.** El red-team agentic (ASI01–10) aplica el mismo protocolo de evidencia a agentes propios: scenario maps versionados, agent graph como audit trail, SoD entre quien codea el agente y quien define policies. Gateway + code layer, nunca uno solo.
- **Prevenir es un gate, diagnosticar es playbook + runbook.** Los fallos K8s conocidos se frenan en pre-flight; lo que igual escapa lo decide el playbook (diagnose/recover/escalate) y lo ejecutan runbooks con pattern-IDs que alimentan los receipts. Misma información, dos momentos del ciclo.

## Risks / Trade-offs

- [Shim drift] Los shims pueden divergir del protocolo nuevo → Mitigación: shims thin de una línea que solo delegan + test de que el warning existe.
- [Regla YAML `specs` del store] El `.openspec.yaml` raíz tiene un item malformado (warning del CLI) → Mitigación: no tocarlo en esta change; reportarlo aparte.
- [Providers sin contrato] Kiwi/Qase/Qualflare cambian API → Mitigación: protocolo versiona integraciones y pinea `qualflare-maestro`; broker con dedupe por cluster para no amplificar cambios.
- [Nombre] `assurance-toolkit` vs `quality-engineering`/`release-assurance` → Mitigación: nombre ya confirmado en sesión; alternativas registradas en proposal.
- [TS7 compiler API ausente hasta 7.1] Scripts que importan `typescript` como librería rompen con `tsgo` → Mitigación: checklist exige clásico en paralelo u `oxc-parser`; CI dual durante la transición.

## Migration Plan

1. Scaffold `toolkits/assurance-toolkit/` (plugin manifest, README, `references/` con los 3 protocolos, `commands/` thin, skills).
2. Copiar protocolos de los 7 comandos al nuevo toolkit; reemplazar originales por shims delegantes + warning.
3. Agregar `--provider gemini` a `local-pr-review` + shim de `gemini-code-review`.
4. Actualizar `marketplace.json` + versiones; `openspec validate`; PR con HITL antes de push.
5. Rollback: revert del commit (shims hacen que el estado viejo siga resolviendo).

## Open Questions

- Ninguna que bloquee specs/diseño/tasks. Versiones a pinear de `qualflare-maestro` y forma exacta del `qualflare.link` se fijan en apply con la cuenta Starter. Versión de `tsgo` y de `vite-tsconfig-paths` compatible también se pinean en apply.
