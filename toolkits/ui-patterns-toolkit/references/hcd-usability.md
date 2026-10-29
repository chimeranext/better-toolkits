# hcd-usability — principios transversales de diseño (HCD + usabilidad)

Criterio base para **todos** los patrones del toolkit `ui-patterns`. Sintetizado de
IxDF (HCD), Don Norman, Nielsen Norman Group y UX Collective.

## Principios HCD (resumen)

1. **Human-centric focus** — diseñar para *todas* las personas involucradas (no solo el
   usuario final); ver el producto como parte de un sistema.
2. **Encontrar el problema correcto** — no resolver síntomas; atacar la causa raíz.
3. **Pensar en sistemas** — optimizar la pieza local no garantiza el resultado global;
   el resultado final (la meta del usuario) es lo que importa.
4. **Iterar con usuarios reales** — el diseño correcto solo se logra testeando e
   iterando (inspiration → ideation → implementation).

## Usabilidad (NN/g)

- **Elementos de un test**: facilitador, tareas realistas, participante real.
- **Métodos**: cualitativo (descubrir problemas) y cuantitativo (métricas: éxito/tarea, tiempo).
- **5 usuarios** bastan para descubrir la mayoría de problemas comunes (cualitativo).
- **Think-aloud**: que el usuario narre mientras ejecuta tareas.
- **Cognitive walkthrough**: inspección de *learnability* sin usuarios reales, ideal para
  flujos nuevos/complejos (bajo costo).

## Checklist de critique (aplicar a cada patrón)

- [ ] ¿Apunta a la meta real del usuario (no a la herramienta)?
- [ ] ¿El usuario entiende qué puede hacer (affordance) y cómo (mapping/constraint)?
- [ ] ¿Hay feedback claro en cada acción (visibilidad de estado)?
- [ ] ¿La complejidad está oculta? (recordatorio: Nielsen — la tecnología sigue siendo
      demasiado complicada para ~95% de la población).
- [ ] ¿Se favorece *reconocimiento* sobre *recuerdo* (p.ej. paleta/comando vs memorizar)?
- [ ] ¿Es testeable con 5 usuarios y un cognitive walkthrough para flujos nuevos?

## Aplicación al toolkit

Cada `protocol.md` de patrón debe incluir una sección **"Criterio de calidad"** que
referencie este archivo. P.ej.:

- `ribbon-ui` → evaluar learnability con cognitive walkthrough (flujos nuevos).
- `command-palette` → reconocimiento sobre recuerdo.
- `modal-dialog` / `drawer` → feedback y visibilidad de estado.

## Fuentes

- IxDF — Human-Centered Design (2026)
- Don Norman — Principles of Human-Centered Design
- NN/g — Usability (User) Testing 101; HCI; Recognition vs Recall; ELIZA; Cognitive Walkthroughs
- UX Collective — 5 errores de usability testing
