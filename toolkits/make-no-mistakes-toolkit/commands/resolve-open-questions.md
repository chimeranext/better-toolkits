---
description: Barre la sesión por decisiones abiertas y preguntas enterradas en prosa, y las resuelve en batch vía AskUserQuestion (Claude) o AskQuestion (Cursor) con opciones + recomendación. Acepta un scope opcional como $ARGUMENTS.
argument-hint: "[scope opcional, p.ej. 'solo lo de los PRs']"
priority: 70
---

# /resolve-open-questions — decisiones pendientes → ask estructurado

Invocá la skill `resolve-open-questions` del plugin make-no-mistakes.

**Harness:** Claude Code → `AskUserQuestion`. Cursor → **`AskQuestion`** (si el
tool no está disponible, opciones numeradas en el chat + respuesta explícita).
Sub-agentes → `pause`; el orquestador pregunta.

1. **Sweep**: juntá TODAS las decisiones abiertas de la sesión — preguntas del
   último reporte, ofertas de follow-up sin resolver, checkpoints HITL
   pendientes (push/PR/merge/Linear/cleanup), issues sin filar mencionados.
   Si `$ARGUMENTS` trae un scope, restringí el sweep a eso.
2. **Batch**: construí preguntas fixed-choice — opción recomendada PRIMERA con
   "(Recomendado)", trade-off en cada descripción, multi-select cuando no son
   exclusivas. Claude: hasta 4 por `AskUserQuestion`. Cursor: preferí una
   `AskQuestion` por mensaje si el runtime lo limita; segunda ronda si hay más
   de 4 decisiones.
3. **Decision log + ejecución**: tras las respuestas, emití `decisión → acción`
   por ítem y ejecutá inmediatamente sin re-preguntar. Una aprobación = una
   acción.

Anti-triggers: investigación socrática activa (prosa, no menús),
action-handoffs directos, aprobación de plan (eso va por el flujo de plan
approval de la plataforma).
