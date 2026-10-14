# convention: markdown-docs
id: markdown-docs · version: 0.1.0 · status: draft · level: platform
extracted_at: 2026-10-13 · ttl_expires: 2027-01-11
parent: none

## GOAL

Markdown en repos de toolkits y OpenSpec: legible en PR diff, render estable en
GitHub, enlaces relativos entre records sin acoplar producto consumidor.

## SOURCES

| # | kind | ref | weight | para qué |
|---|------|-----|--------|----------|
| S1 | docs | GitHub Flavored Markdown spec (tablas, fences) | load-bearing | tablas y fences |
| S2 | docs | github.com docs — relative links in markdown | context | enlaces entre archivos |

## RULES

- M1 [structure] Un `#` título por archivo; secciones `##` en orden lógico (invocación → contrato → config) → S1.
- M2 [links] Preferir rutas relativas (`../testing/triage.md`) sobre URLs absolutas a repos consumidores → S2.
- M3 [diagrams] Bloques Mermaid siguen el hijo `platform/diagrams/mermaid-github` (no inventar perfil por archivo) → hijo.
- M4 [ssot] Un hub por comando (`protocol.md`); entradas finas en `commands/*.md` → convención assurance.

## COUNTEREXAMPLES

```markdown
<!-- ❌ wrong: URL hardcoded a repo producto (M2) -->
See https://github.com/example/org-docs/pull/455

<!-- ✅ right -->
See consumer docs playbook (pattern only) in the owning repo.
```

## GATES

- local: `markdownlint` cuando el repo lo declare para paths tocados.
- CI: revisión humana en PR para protocolos SSOT.

## LESSONS

- (vacía — ver hijo `mermaid-github` L1 desde assurance hub)

## RECEIPT

N/A hasta dogfood de diagramas en `_dogfood/docs-diagrams/`.
