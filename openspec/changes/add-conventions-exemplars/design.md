# Design — add-conventions-exemplars

## Context

Ver `proposal.md` (Why) y `specs/`. Precondición: `add-conventions-layer` aplicada (plantilla + método + caso Elixir). Todas las fuentes ya verificadas en sesión (ver proposal).

## Goals / Non-Goals

- Goals: 3 ramas que prueban el molde en perfiles disímiles (seguridad/embedded, móvil con skills oficiales, typecheck-sin-build).
- Non-goals: tocar el molde (enmienda previa si hace falta); ramas `platform/`/`dataset/`; framework Ash.

## Decisions

1. **Orden Rust → Flutter → TypeScript.** Rust 2.º por urgencia edge + incidente bus-sharing como test del peso de fuentes; Flutter 3.º por stack móvil HabitaNexus con fuentes oficiales listas; TS 4.º como dogfood interno (el engine es TS y aporta lección seed propia).
2. **Hijo `embedded-hal` en Rust, no rama aparte.** Es framework-sobre-lenguaje igual que Phoenix: prueba que el nivel `frameworks/` no es Elixir-específico.
3. **Sin hijo en TypeScript.** Ningún framework pedido; reservar niveles vacíos añade ruido.
4. **Ferrocene y jev-router fuera del árbol.** Ferrocene: referencia comercial (ancla TTL), nunca dependencia. jev-router: lane de Heimdall, change propia ya creada.

## Risks / Trade-offs

- [Miri lento en CI] → lane CI con subconjunto (nightly programado, no por PR).
- [Skills Dart/Flutter cambian sin versionar] → pin por commit + TTL corto (30 días).
- [tsgo/novedades TS7] → el record TS declara toolchain exacta; rotación alta = TTL corto.

## Migration Plan

Aditivo sobre `add-conventions-layer` aplicada: 3 ramas nuevas. Rollback = borrarlas. Requiere el molde; si el molde cambia, esta change se revalida.

## Open Questions

- Ninguna que cambie specs: versiones exactas de toolchains se fijan en apply.
