# Design — eval-jev-router-lane

## Context

Ver `proposal.md` (Why). Lanes actuales: `nim-kimi` (default, NIM) y `openrouter-*` (incl. FREE ROUTER solo dev y `kimi-k2.7-code`). Caveat documentado: OpenRouter rutea upstream opacly. Key existente `OPENROUTER_API_KEY` con env propio (`--openrouter-env`).

## Goals / Non-Goals

- Goals: veredicto fundado con métricas + alta mínima si pasa.
- Non-goals: benchmark exhaustivo (n=1 por celda basta para decidir, precedente gentle-ai); tocar el default; evaluar `:free`.

## Decisions

1. **Eval sobre el loop real, no sintética.** Alternativa: suite aislada de tool-calling. Rechazada: lo que importa es el review completo (400k tokens, múltiples turnos); una suite sintética no mide rate-limit real.
2. **Comparativa ciega vs `nim-kimi`.** Mismo diff, ambos lanes, revisión ciega del veredicto (precedente gentle-ai bench).
3. **Techo de costo explícito en tasks.** Sin techo, un router con retry storms quema crédito; el harness aborta al techo.

## Risks / Trade-offs

- [Router cambia upstream entre requests] → registrar upstream observado (`response.provider`) por corrida; si varía, el veredicto lo descuenta.
- [Modelo detrás del router desconocido] → preguntar a la API (`GET /models` + pricing) en la primera tarea; si no hay transparencia, REJECT.
- [Rate-limit free/low-tier] → la celda grande puede salir INCONCLUSIVE; eso también es un dato.

## Migration Plan

Sin migración: si REJECT, solo queda el receipt. Si APPROVE, entrada registry + docs (aditivo, default intacto).

## Open Questions

- Ninguna que cambie specs: pricing y modelo-detrás se responden en la tarea 1.1.
