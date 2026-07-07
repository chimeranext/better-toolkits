---
name: contract-psa
description: >
  Genera un Acuerdo de Proyecto (PSA) bilingue con modelo de riesgo compartido.
  Usa este skill cuando el usuario mencione "contrato de proyecto", "PSA",
  "project contract", "service agreement", "scope of work", "alcance del trabajo",
  "formalizar proyecto", "contrato por hitos", "milestone contract",
  "empezar proyecto", "start project work", o cualquier situacion donde se
  necesite formalizar un engagement project-based con deliverables y milestones.
---

# PSA — Project-Specific Agreement Generator

Genera un Acuerdo Especifico de Proyecto completo y personalizado a partir del template
de 638 lineas. El skill simplifica la entrevista para que el usuario no tenga que
rellenar 50+ placeholders manualmente. Cubre 3 modelos de compensacion (tarifa fija,
bono por exito, equity split), entregables, milestones, SLA, IP, proteccion de datos
(Ley 8968) y arbitraje ante la Camara de Comercio de Costa Rica.

## Regla de idioma

Todo el contenido generado debe estar en **espanol**. Los terminos tecnicos y legales
bilingues se mantienen en ingles entre parentesis cuando aparecen asi en el template
(ej. "Entregables (Deliverables)", "Aceptacion (Acceptance)").

## Directorio de salida

Todos los archivos van en `./fractional-cto/contracts/` dentro del directorio de trabajo actual.

## Flujo del skill

### Paso 1 — Datos de las partes

Recopilar la informacion de ambas partes. Si existe un NDA o assessment previo en
`./fractional-cto/` (ej. `./fractional-cto/contracts/*-nda.md` o
`./fractional-cto/assessment/`), **cargar los datos de ahi** y confirmar con el usuario
en lugar de volver a preguntar.

Si no hay datos previos, preguntar UNA A LA VEZ:

**Pregunta 1: Nombre del proyecto**
> ¿Como se llama el proyecto? (nombre corto para identificar el PSA)

**Pregunta 2: Datos del cliente**
> Necesito los datos del cliente para el contrato:
> - Razon social (Legal Name)
> - Cedula juridica (Tax ID)
> - Representante legal y su cargo
> - Cedula de identidad del representante
> - Domicilio
> - Correo de contacto
> - Telefono

**Pregunta 3: Datos del consultor**
> Necesito tus datos como consultor (persona fisica):
> - Nombre completo
> - Cedula de identidad
> - Domicilio
> - Correo de contacto
> - Telefono

Si el usuario ya proporciono informacion en la conversacion previa, no repetir —
extraer de lo que ya dijo.

### Paso 2 — Modelo de compensacion (Seccion 0 del contrato)

Presentar las 3 opciones con explicacion clara:

> ¿Como sera la compensacion de este proyecto?
>
> **A) Tarifa Fija (Fixed Fee)** — El cliente paga el 100% del valor. Sin riesgo para vos.
>   Ideal para: empresas con revenue, scope claro.
>
> **B) Tarifa Reducida + Bono por Exito** — Cobras menos upfront pero ganas un bono si se cumple un milestone.
>   Ideal para: startups con algo de funding, MVP en progreso.
>
> **C) 50/50 Split (Tarifa + Equity)** — Mitad cash, mitad equity con vesting.
>   Ideal para: pre-seed con algo de cash, donde sos tech core.

Segun la seleccion, hacer las preguntas de seguimiento correspondientes:

**Si elige A (Tarifa Fija):**
- Monto total del proyecto y moneda (USD, CRC, EUR)
- Estructura de pago: porcentaje al firmar vs porcentaje al aceptar entregables
  (ej. 50/50, 40/30/30, etc.)

**Si elige B (Tarifa Reducida + Bono):**
- Monto de la tarifa reducida y moneda
- Porcentaje que representa de la tarifa de mercado (ej. 60%)
- Monto del bono por exito
- Descripcion del milestone que activa el bono
- Estructura de pago de la tarifa (porcentaje al firmar vs entrega)
- Dias habiles para pago del bono despues de cumplir el milestone (default: 15)

**Si elige C (50/50 Split):**
- Monto de la tarifa (50% de tarifa de mercado) y moneda
- Porcentaje de equity (fully diluted)
- Anos de vesting (default: 4)
- Anos de cliff (default: 1)
- Milestone de aceleracion (acceleration) y porcentaje adicional que desbloquea
- Dias para firmar el addendum de equity despues del PSA (default: 30)

### Paso 3 — Scope of Work (Alcance del trabajo)

Recopilar en una sola interaccion:

> Describime el alcance del proyecto:
>
> 1. **Descripcion general** — ¿Que se va a hacer? (en 2-3 oraciones)
> 2. **Entregables** — Lista de lo que entregas (el template usa una tabla con #, nombre, descripcion, incluido/tarifa)
> 3. **Exclusiones** — ¿Que NO esta incluido? (importante para poner limites)
> 4. **Supuestos y dependencias** — ¿Que asumis que el cliente va a proveer o que condiciones deben cumplirse?

Si el usuario da una descripcion general sin detallar, ayudarle a desglosar en
entregables concretos basandose en el tipo de proyecto (takeover, migracion, feature
development, security remediation, etc.).

### Paso 4 — Timeline y Milestones

> Ahora el cronograma:
>
> 1. **Fecha de inicio** (o "al firmar")
> 2. **Milestones** — Lista con: nombre del milestone, entregables asociados, fecha objetivo, pago asociado
> 3. **Duracion total estimada** (semanas o meses)
> 4. **Proceso de aceptacion** — ¿Cuantos dias de revision para el cliente? (default: 5-10 dias habiles)

Si el usuario proporciona solo una fecha de inicio y duracion total, ayudarle a
distribuir los milestones de forma logica segun los entregables del Paso 3.

Valores por defecto si el usuario no especifica:
- Dias de aviso por atraso del consultor: 5
- Dias maximo de atraso antes de penalidad: 15
- Dias de bloqueo del cliente antes de renegociacion: 10
- Rondas de correccion incluidas: 2
- Dias para correcciones: 5
- Frecuencia de reuniones de seguimiento: semanal

### Paso 5 — Generar PSA

1. Leer el template base: `${CLAUDE_PLUGIN_ROOT}/references/contracts/03-psa-project.md`
2. Rellenar todos los placeholders con la informacion recopilada en los Pasos 1-4.
3. En la Seccion 0 (Modelo de Compensacion):
   - Marcar con `[x]` el modelo seleccionado.
   - Dejar los modelos no seleccionados con `[ ]` pero **mantenerlos visibles**
     (no eliminarlos — el template bilingue los necesita como referencia).
   - Rellenar SOLO los campos del modelo seleccionado con datos reales.
   - Los campos de los modelos no seleccionados quedan con los placeholders originales.
4. Rellenar la tabla de pagos de la Seccion 5 alineada al modelo seleccionado.
5. Rellenar valores por defecto razonables para campos que el usuario no especifico:
   - `{DIAS_ELIMINACION_DATOS}`: 15
   - `{DIAS_FACTURACION}`: 5
   - `{DIAS_PAGO}`: 10
   - `{TASA_MORA}`: 2
   - `{DIAS_SUSPENSION}`: 30
   - `{DIAS_SOPORTE}`: 60
   - `{HORAS_RESPUESTA_P1}`: 4
   - `{HORAS_RESOLUCION_P1}`: 24
   - `{HORAS_RESPUESTA_P2}`: 8
   - `{HORAS_RESOLUCION_P2}`: 48
   - `{HORAS_RESPUESTA_P3}`: 24
   - `{HORAS_RESOLUCION_P3}`: 5 (dias)
   - `{CANTIDAD_SESIONES_KT}`: 2
   - `{DURACION_SESION_KT}`: 60
   - `{NUMERO_ARBITROS}`: 1
   - `{SEDE_ARBITRAJE}`: San Jose
   - `{CANTIDAD_COPIAS}`: 2
   - `{HORAS_NOTIFICACION_BRECHA}`: 48
   - `{CANAL_SOPORTE}`: correo electronico
   - `{VERSION}`: 1.0
6. Generar un slug a partir del nombre del proyecto (minusculas, guiones, sin tildes).
7. Escribir en `./fractional-cto/contracts/{slug}-psa.md`

### Paso 6 — Confirmacion

Presentar al usuario un resumen claro:

1. **Modelo de compensacion seleccionado** y sus terminos clave:
   - Modelo A: monto total, estructura de pago
   - Modelo B: tarifa reducida, bono, milestone trigger
   - Modelo C: tarifa, equity %, vesting, cliff, aceleracion
2. **Cantidad de entregables** y **milestones** definidos
3. **Duracion estimada** del proyecto
4. **Ruta del archivo generado**: `./fractional-cto/contracts/{slug}-psa.md`
5. **Disclaimer obligatorio:**
   > "Requiere revision de un abogado. Ambas partes deben tener revision legal independiente antes de firmar."
6. **Siguiente paso sugerido:**
   > "Despues de completar el proyecto, considera /contract-retainer para formalizar una gestion ongoing como Fractional CTO."

Si existe un assessment previo en `./fractional-cto/assessment/`, mencionar que el
contexto de riesgo del assessment se tuvo en cuenta al definir el scope.

## Notas para el modelo

- El PSA template tiene 638 lineas y 50+ placeholders. La razon de ser de este skill es
  SIMPLIFICAR la entrevista — agrupar preguntas relacionadas y usar defaults razonables
  para que el usuario solo decida lo que importa.
- Si hay un assessment existente en `./fractional-cto/assessment/`, cargar el nombre del
  proyecto y contexto de riesgo para pre-llenar campos relevantes.
- Si hay un NDA existente en `./fractional-cto/contracts/*-nda.md`, cargar datos de las
  partes para no repetir preguntas.
- El consultor opera como **persona fisica** (contratista independiente). Nunca usar
  razon social para el consultor ni mencionar "chimeranext" ni ningun otro nombre comercial.
- El template incluye clausulas criticas que no se deben omitir ni simplificar:
  - IP: propiedad del cliente desde el Dia 1 (Seccion 4)
  - SLA y soporte post-entrega (Seccion 11)
  - Knowledge transfer obligatorio (Seccion 10)
  - Proteccion de datos — Ley 8968 (Seccion 18.3)
  - Ley aplicable — Costa Rica (Seccion 17)
  - Arbitraje — Camara de Comercio de Costa Rica (Seccion 17.3)
- La Seccion 6 (Intercambio de Valor) es opcional. Si el usuario no menciona
  contraprestaciones no monetarias, marcar "No aplica" y eliminar la tabla.
- El AI Disclosure (Seccion 13.3) se mantiene siempre — es una proteccion necesaria
  para el consultor que usa herramientas de IA.
- Si el usuario no proporciona datos bancarios, dejar los placeholders de la Seccion 5.2
  con un comentario: `<!-- Completar antes de firmar -->`.
