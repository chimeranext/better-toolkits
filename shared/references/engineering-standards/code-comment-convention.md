# CCC — Code Comment Convention (Meaningful Non-Obvious)

> Policy/doctrine SSOT para comentarios de código. Distingue dos roles:
> **generador** (quién escribe/refactoriza código) y **auditor** (quién revisa
> PRs/código). Ambos aplican el mismo principio: los comentarios deben ser
> **significativos y no obvios** — nunca redundantes.

## Principio

Un comentario debe explicar el **por qué** (contexto, trade-off, restricción), no
el **cómo** (la sintaxis ya lo muestra). Antes de escribir un comentario de
"cómo", el código debe reescribirse con variables descriptivas y funciones
modulares (auto-explicación).

## Directriz de generación (agent que escribe código)

1. **Prioridad de auto-explicación:** ante la necesidad de explicar un "cómo",
   reescribir el código con nombres y estructura que lo hagan obvio, en vez de
   comentarlo.
2. **Prohibición de redundancia:** no generar comentarios que dupliquen la
   semántica de la sintaxis (ej. `// Incrementa x en 1` junto a `x++`).
3. **Contexto obligatorio ("por qué")** — comentarios de bloque solo cuando:
   - Hay un workaround por un bug conocido de una dependencia (indicando el motivo).
   - Se implementa una regla de negocio abstracta no evidente en los datos.
   - Se optimiza rendimiento sacrificando legibilidad (explicando el trade-off).

### Formato estandarizado

Cuando un comentario es estrictamente necesario:

```text
/**
 * CONTEXTO: [Explicación del problema de negocio o limitación técnica]
 * MOTIVACIÓN: [Por qué se eligió esta solución no obvia sobre la estándar]
 */
```

## Criterio de auditoría (agent que revisa código)

### Errores críticos (marcar para corrección)

- **Comentarios espejo:** describen lo que hace la línea inmediatamente inferior
  (ej. `// Guarda en base de datos` + `db.save(user)`).
- **Código muerto:** bloques comentados con `//` o `/* */` — exigir eliminación.
- **Historiales de git:** firmas, fechas o autores (ej. `// Modificado por Juan
  el 12/05`).

### Aprobación correcta (ignorar o validar)

- Restricciones físicas/de infraestructura/APIs de terceros (ej. límites de
  rate-limit de una API externa).
- Justificación de algoritmos complejos con referencia teórica o enlace.

### Formato de feedback del auditor

- **Línea:** [número de línea]
- **Tipo:** [Redundante / Falta Contexto / Código Muerto]
- **Razón:** por qué viola la regla "non-obvious" o por qué requiere el "por qué".
- **Sugerencia de Refactor:** [código limpio sin comentario OR código con el
  comentario corregido]

## Aplicación

- **Generador:** perfil Better / DeveloperAgent — aplicar al escribir/refactorizar.
- **Auditor:** CodeReviewerAgent / revisión de PRs — aplicar como criterio de
  auditoría (issue si hay errores críticos).
- **CI:** puede integrarse como auditoría en el pipeline de review.

## Referencias

- Relacionado: **CLG** (Commit Logic Groups) — comentarios no sustituyen commits
  semánticos.
- Formato de PR: **PRDS**.
