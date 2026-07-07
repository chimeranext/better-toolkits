---
name: project-takeover
description: >
  Genera los 4 documentos SOP para ejecutar un takeover de proyecto.
  Usa este skill cuando el usuario mencione "takeover", "handover",
  "transferencia de proyecto", "project transfer", "code handover",
  "el dev anterior", "me pasaron un proyecto", "asumir un proyecto",
  "recibir un proyecto", "onboarding de proyecto",
  o cuando ya se hizo la evaluacion de riesgo y se necesitan los
  documentos operativos para ejecutar la transferencia.
  NO usar para evaluacion de riesgo (eso es /takeover-assessment)
  ni para contratos (eso es /contract-psa o /contract-retainer).
---

# Project Takeover SOP Generator

Genera los 4 documentos SOP operativos para ejecutar la transferencia de un proyecto
de software existente. Cubre: SOP tecnico, guia ejecutiva, solicitud formal de entrega,
y template de ultimatum — calibrados al nivel de riesgo del caso.

## Regla de idioma

Todo el contenido generado debe estar en **español**. Los terminos tecnicos se mantienen
en ingles cuando son de uso comun (deploy, commit, CI/CD, etc.).

## Directorio de salida

Todos los archivos van en `./fractional-cto/takeover/` dentro del directorio de trabajo actual.

## Flujo del skill

### Paso 1 — Obtener contexto de riesgo

Hay dos caminos para obtener el contexto necesario:

**Path A (preferido): Assessment previo disponible**

Verificar si existe `./fractional-cto/assessment/` con datos de un assessment previo
(generado por `/takeover-assessment`). Si existe, leer el estado y cargar:
- Nombre del proyecto
- Nivel de riesgo
- Amenazas identificadas
- Relacion con el dev
- Ownership del codigo

Confirmar con el usuario:
> "Encontre tu assessment previo. Riesgo: **{NIVEL}**. ¿Correcto?"

Si el usuario confirma, continuar al Paso 2.

**Path B (standalone): Sin assessment previo**

Si no existe assessment previo, hacer una entrevista condensada de 4 preguntas.
Preguntar UNA A LA VEZ. Si el usuario ya proporciono informacion en la conversacion
previa, no repetir — extraer de lo que ya dijo.

**Pregunta 1: Nombre del proyecto**
> ¿Como se llama el proyecto?

**Pregunta 2: Relacion con el dev anterior**
> ¿Como es la relacion con el dev anterior?
> - a) Cooperativa — dispuesto a ayudar
> - b) Neutral — responde pero no proactivo
> - c) Contenciosa — no coopera, posible riesgo
> - d) Sin contacto — el dev desaparecio

**Pregunta 3: Ownership del codigo**
> ¿Donde esta el codigo?
> - a) En cuenta del cliente (el cliente es owner)
> - b) En cuenta personal del dev anterior
> - c) Desconocido / sin acceso

**Pregunta 4: Usuarios activos**
> ¿Hay usuarios reales usando el producto en produccion?
> - a) Si
> - b) No

**Matriz simplificada de riesgo:**

| Relacion | Codigo en cuenta del... | Riesgo base |
|----------|-------------------------|-------------|
| Contenciosa / Sin contacto | Dev / Desconocido | **ALTO** |
| Contenciosa / Sin contacto | Cliente | **MEDIO** |
| Neutral | Dev / Desconocido | **MEDIO** |
| Neutral | Cliente | **BAJO** |
| Cooperativa | Dev / Desconocido | **MEDIO** |
| Cooperativa | Cliente | **BAJO** |

**Modificador:** Si hay usuarios activos en produccion, subir un nivel el riesgo.

Comunicar el nivel de riesgo al usuario con una explicacion breve.

### Paso 2 — Generar SOP tecnico (para el CTO)

1. Leer el template base: `${CLAUDE_PLUGIN_ROOT}/references/01-takeover-sop-template.md`
2. Personalizar el SOP:
   - Rellenar la tabla de riesgo con los datos obtenidos en Paso 1
   - Completar la threat matrix con las amenazas identificadas
   - Ajustar la secuencia de ejecucion segun el nivel de riesgo
   - Eliminar secciones que no aplican (ej. si no hay mobile, eliminar Apple Developer / Google Play)
   - Reemplazar marcadores genericos con el nombre del proyecto y contexto especifico
3. Escribir en `./fractional-cto/takeover/{slug}-takeover-sop.md`

### Paso 3 — Generar guia ejecutiva (para el lead/cliente)

1. Leer el template: `${CLAUDE_PLUGIN_ROOT}/references/02-executive-sop-template.md`
2. Personalizar:
   - Reemplazar `{NOMBRE_PROYECTO}` con el nombre real
   - Reemplazar `{BLOQUE_RIESGO}` con el nivel calculado, explicado en terminos de
     negocio (dinero, tiempo, reputacion), no tecnicos
   - Reemplazar `{BLOQUE_CRONOGRAMA}` con el timeline segun el nivel de riesgo
   - Ajustar tono segun nivel de riesgo:
     - **ALTO** → urgente, sin ser alarmista
     - **MEDIO** → moderado, profesional
     - **BAJO** → calmado, rutinario
   - Eliminar preguntas frecuentes que no apliquen al caso
3. Escribir en `./fractional-cto/takeover/{slug}-guia-cliente.md`

### Paso 4 — Generar solicitud formal de entrega (para firma en reunion)

Este documento se presenta al desarrollador en una reunion presencial o videollamada.
El lead/cliente y el dev lo revisan juntos. El dev firma de aceptado.
El documento firmado se convierte en evidencia vinculante en caso de incumplimiento.

1. Leer el template: `${CLAUDE_PLUGIN_ROOT}/references/03-solicitud-entrega-template.md`
2. Personalizar:
   - Reemplazar todos los placeholders con datos reales del proyecto
   - Ajustar items de entrega segun tipo de proyecto
   - Los plazos deben ser FIRMES — son el compromiso que el dev firma
   - Calibrar la clausula legal segun nivel de riesgo:
     - **BAJO** → clausula ligera: "incumplimiento podra derivar en acciones legales"
     - **MEDIO** → clausula moderada: referencia a legislacion de propiedad intelectual aplicable
     - **ALTO** → clausula completa: referencia a Codigo Penal arts. 196 bis, 217 bis,
       229 bis, Ley 9048, Unidad de Delitos Informaticos del OIJ
   - Incluir bloque de firma: nombre, cedula/ID, fecha, firma de ambas partes
   - NO incluir secciones de seguridad (rotacion de secrets, fork, auditorias)
   - NO revelar la estrategia de mitigacion del CTO
3. Escribir en `./fractional-cto/takeover/{slug}-solicitud-entrega.md`

### Paso 5 — Generar template de ultimatum (para el abogado)

Este documento es un template pre-armado que el abogado del lead personaliza y envia
SOLO si el dev incumple los plazos firmados en el Paso 4. No se envia directamente.

**IMPORTANTE:** Siempre generar este documento, incluso para riesgo BAJO — es un template,
mejor tenerlo y no necesitarlo.

1. Leer el template: `${CLAUDE_PLUGIN_ROOT}/references/04-ultimatum-template.md`
2. Personalizar:
   - Reemplazar placeholders con datos del proyecto
   - Referenciar los plazos especificos firmados en la solicitud de entrega
   - Ajustar las referencias legales segun la jurisdiccion (por defecto: Costa Rica)
   - Mantener intactos los marcadores `[ABOGADO: ...]` — son indicaciones para el abogado
   - Marcar claramente las secciones que el abogado debe revisar/adaptar
3. Escribir en `./fractional-cto/takeover/{slug}-ultimatum-template.md`

Incluir un disclaimer visible al inicio: "BORRADOR — Requiere revision y aprobacion de un
abogado antes de enviar."

### Paso 6 — Confirmacion

Presentar al usuario los 4 documentos con su audiencia y momento de uso:

1. `{slug}-takeover-sop.md` → "Tu SOP operativo (solo para vos)"
2. `{slug}-guia-cliente.md` → "Para tu lead — que entienda el proceso"
3. `{slug}-solicitud-entrega.md` → "Para la reunion con el dev — se firma de aceptado"
4. `{slug}-ultimatum-template.md` → "Para el abogado — solo si el dev incumple"

**Secuencia recomendada:**
1. Lead lee la guia-cliente
2. CTO hace fork/backup del repo ANTES de la reunion
3. Reunion con el dev → presentar solicitud → firma de aceptado
4. Si incumple → lead lleva el firmado al abogado + template de ultimatum

**Siguiente paso sugerido:**
> "Para formalizar el proyecto de remediacion, usa `/contract-psa`"

## Notas para el modelo

- Este skill NO hace evaluacion de riesgo — eso es `/takeover-assessment`.
- Este skill NO genera contratos — eso es `/contract-nda`, `/contract-psa`, o `/contract-retainer`.
- La solicitud-entrega SIEMPRE incluye una clausula legal (por defecto = Enfoque B, integrada).
- El ultimatum SIEMPRE se genera, incluso para riesgo bajo — es un template, mejor tenerlo.
- El SOP template es comprehensivo por diseño. La personalizacion es ELIMINAR lo que no aplica,
  no agregar complejidad innecesaria.
- Si el usuario ya menciono detalles especificos (ej. "el repo esta en GitHub bajo la cuenta
  del dev anterior"), usarlos directamente sin volver a preguntar.
- El tono del SOP es profesional pero directo — es un documento operativo, no academico.
