# Design — add-conventions-starknet

## Context

Ver `proposal.md` + `specs/`. Precondición: molde aplicado. scarb +
starknet-foundry + devnet presentes en este entorno (asdf) — el dogfood Cairo
puede correr acá; el nodo Madara NO (fuera de scope).

## Goals / Non-Goals

- Goals: record plataforma que impida apuntar al hosted muerto y fije gates.
- Non-goals: correr Madara, auditar Cairo, dashboard.

## Decisions

1. **`platform/` sobre `frameworks/`.** El stack cruza Cairo + Rust + chain;
   `frameworks/` es para app-frameworks de un lenguaje (Phoenix, Flutter).
2. **Self-host como RULE, no nota.** El sunset convierte la URL muerta en
   defecto: cualquier cita al hosted falla el record.
3. **Madara como vecino de `rust`, no duplicado.** Sus lints/toolchain se
   referencian por commit, no se copian.

## Risks / Trade-offs

- [scarb/starknet-foundry rotan rápido] → pin + TTL 30 días.
- [AbdelStark/madara vs madara-alliance] → el canónico es madara-alliance;
  el otro queda listed hasta aclarar fork/upstream.
- [Dashboard/docs cairo-coder.com muertos] → solo repo + docs/ del repo.

## Migration Plan

Aditivo: `platform/starknet/`. Rollback = borrarla.

## Open Questions

- Ninguna que cambie specs: versiones exactas se fijan en apply.
