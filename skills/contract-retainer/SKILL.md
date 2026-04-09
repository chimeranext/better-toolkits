---
name: contract-retainer
description: >
  Genera un contrato de Retainer mensual o Advisory+Equity para engagement
  continuo. Usa este skill cuando el usuario mencione "retainer",
  "contrato mensual", "monthly contract", "engagement continuo",
  "ongoing engagement", "contrato de CTO fraccional", "fractional CTO contract",
  "equity", "sweat equity", "advisory agreement", "acuerdo de asesoria",
  "equity deal", "trabajo continuo", "ongoing work",
  o cualquier situacion donde se necesite formalizar una relacion CTO ongoing
  (ya sea cash-based o equity-based).
---

# Retainer / Advisory+Equity Generator

Genera un contrato de engagement continuo personalizado. Este es un DUAL-TEMPLATE skill
que rutea a uno de dos contratos segun la capacidad de pago del cliente:

- **04-retainer.md** — Retainer mensual cash-based (Modelo A o D)
- **05-advisory-equity.md** — Advisory + Equity para startups pre-seed sin cash (Modelo D o E)

El skill simplifica la entrevista para que el usuario no tenga que rellenar 40+ placeholders
manualmente. La pregunta de routing (Paso 2) es el fork critico que determina el template.

## Regla de idioma

Todo el contenido generado debe estar en **espanol**. Los terminos tecnicos y legales
bilingues se mantienen en ingles entre parentesis cuando aparecen asi en el template
(ej. "Retainer Fijo (Fixed Monthly Retainer)", "Vesting Schedule").

## Directorio de salida

Todos los archivos van en `./fractional-cto/contracts/` dentro del directorio de trabajo actual.

## Contexto del Profesional

El CTO opera como **persona fisica** (independent professional). Nunca mencionar
"chimeranext" ni ninguna razon social — el contrato se firma a titulo personal.

## Flujo del skill

### Paso 1 — Datos basicos

Recopilar los datos de ambas partes. Si existe un NDA, PSA, o assessment previo en
`./fractional-cto/` (ej. `./fractional-cto/contracts/*-nda.md`,
`./fractional-cto/contracts/*-psa.md`, o `./fractional-cto/assessment/`),
**cargar los datos de ahi** y confirmar con el usuario en lugar de volver a preguntar.

Si no hay datos previos, preguntar:

**Pregunta 1: Nombre del proyecto/startup**
> ¿Como se llama el proyecto o startup? (se usa para nombrar el archivo y el contrato)

**Pregunta 2: Datos del cliente**
> Necesito los datos del cliente para el contrato:
> - Razon social (Legal Name)
> - Cedula juridica (Tax ID)
> - Representante legal y su cargo
> - Cedula de identidad del representante
> - Domicilio
> - Correo de contacto
> - Telefono

**Pregunta 3: Datos del CTO (consultor)**
> Necesito tus datos como consultor (persona fisica):
> - Nombre completo
> - Cedula de identidad
> - Domicilio
> - Correo de contacto
> - Telefono

Si el usuario ya proporciono informacion en la conversacion previa o en contexto
anterior, no repetir — extraer de lo que ya dijo.

### Paso 2 — Routing: Cash o Equity

Esta es la pregunta critica que determina cual template usar. No saltarla.

Presentar:

> ¿Como es la capacidad de pago del cliente?
>
> **a) Puede pagar tarifa mensual** --> Contrato de Retainer
>   - Modelo A: Retainer fijo (X horas/mes, tarifa mensual)
>   - Modelo D: Retainer minimo + equity (menor tarifa + vesting)
>
> **b) Pre-seed, sin cash para salario** --> Acuerdo Advisory + Equity
>   - Modelo D: Sweat equity + retainer minimo
>   - Modelo E: Equity puro ($0 cash)

Segun la seleccion (a o b), seguir con el Paso 3a o 3b respectivamente.

> **Atajo:** Si el usuario ya menciono "pre-seed", "sin cash", "no puede pagar",
> "solo equity" o similar antes de llegar a esta pregunta, saltar directamente
> al Paso 3b (Advisory + Equity) confirmando brevemente la eleccion.

### Paso 3a — Si Retainer (template 04-retainer.md)

Preguntar:

**Modelo de compensacion:**
> ¿Cual modelo de retainer?
> - **Modelo A — Retainer Fijo:** Tarifa mensual completa, sin equity.
> - **Modelo D — Retainer Minimo + Equity:** Tarifa reducida + participacion accionaria.

**Terminos del retainer:**
> - Tarifa mensual y moneda (ej. $3,000 USD/mes)
> - Horas incluidas por mes (ej. 40 horas/mes)
> - Tarifa por hora adicional (overage rate)

**Si selecciono Modelo D, agregar:**
> - Porcentaje de equity (% fully diluted)
> - Anos de vesting (default: 4)
> - Anos de cliff (default: 1)
> - Condicion de milestone acceleration (ej. cierre de ronda seed)

**Alcance de servicios:**
> ¿Cuales servicios cubre el retainer? (el template incluye todos — confirma cuales aplican):
> - (a) Estrategia tecnica y arquitectura
> - (b) Revision de codigo y calidad
> - (c) Infraestructura y seguridad
> - (d) Evaluacion de proveedores
> - (e) Soporte en contratacion y entrevistas
> - (f) Planificacion de sprints y backlog
> - (g) Respuesta a incidentes segun SLA
> - (h) Reporte mensual de salud tecnica
>
> Default: **todos los anteriores**.

**Preferencias de SLA:**
> ¿Tiempos de respuesta para incidentes? (o aceptar defaults):
>
> | Prioridad | Default |
> |-----------|---------|
> | P1 — Critico | 4 horas |
> | P2 — Alto | 8 horas habiles |
> | P3 — Normal | 2 dias habiles |

**Plazo inicial:**
> ¿Duracion del plazo inicial? Default: **3 meses**, renovacion automatica mensual.

### Paso 3b — Si Advisory+Equity (template 05-advisory-equity.md)

Preguntar:

**Contexto de la startup:**
> - ¿En que etapa esta la startup? (pre-idea, pre-seed, seed)
> - ¿Por que equity-based? (breve contexto — se usa para la Seccion 0 del contrato)
> - ¿Que producto desarrolla y en que vertical?

**Compromiso de tiempo:**
> ¿Cuantas horas/semana vas a dedicar?

Al recibir la respuesta, presentar la tabla de benchmarks para calibrar:

> **Benchmarks de Equity (datos 2025-2026, Carta / Pear VC / YC):**
>
> | Rol | Etapa | Horas/semana | Rango de Equity |
> |-----|-------|--------------|-----------------|
> | Co-fundador tecnico (Technical co-founder) | Pre-idea | Full-time | 10-20% |
> | Primer hire tecnico, construye MVP (First tech hire) | Pre-seed | Full-time | 3-5% |
> | CTO Fraccional (Fractional CTO, part-time) | Pre-seed | 10-15h/week | 2-3.5% |
> | Asesor tecnico (Technical advisor) | Seed+ | 2-5h/week | 0.25-1% |
>
> Basado en tu compromiso de {X} horas/semana, el rango sugerido es **{RANGO}%**.

**Modelo de compensacion:**
> ¿Cual modelo?
> - **Modelo D — Sweat Equity + Retainer Minimo:** Cash minimo para cubrir costos operativos + equity
> - **Modelo E — Equity Puro:** $0 cash, solo equity

**Terminos de equity:**
> - Porcentaje de equity (% fully diluted)
> - Anos de vesting (default: 4)
> - Anos de cliff (default: 1)

**Eventos de aceleracion:**
> - Milestone de aceleracion (ej. cierre de ronda seed >= $X, alcanzar Y usuarios, Z MRR)
> - Porcentaje adicional que desbloquea el milestone
> - Meses de aceleracion por terminacion sin causa (default: 6)

**IP preexistente:**
> ¿Vas a aportar un repo o codebase existente a la startup?
> - Si --> ¿Nombre del repo? ¿Licencia exclusiva o no exclusiva?
> - No --> Se marca "N/A" en la Seccion 5.3

**Si selecciono Modelo D, agregar:**
> - Monto del retainer minimo mensual y moneda (ej. $500 USD/mes)

**Si selecciono Modelo E, agregar:**
> - Condicion de performance para reverse vesting (ej. minimo 15h/semana)

### Paso 4 — Generar contrato

1. Leer el template seleccionado:
   - Retainer: `${CLAUDE_PLUGIN_ROOT}/references/contracts/04-retainer.md`
   - Advisory+Equity: `${CLAUDE_PLUGIN_ROOT}/references/contracts/05-advisory-equity.md`
2. Reemplazar TODOS los placeholders con los datos recopilados.
3. En la Seccion 0 (Modelo de Compensacion):
   - Marcar con `[x]` el modelo seleccionado.
   - Dejar los modelos no seleccionados con `[ ]` pero **mantenerlos visibles**
     (no eliminarlos — el template bilingue los necesita como referencia).
   - Rellenar SOLO los campos del modelo seleccionado con datos reales.
   - Los campos de los modelos no seleccionados quedan con los placeholders originales.
4. Rellenar valores por defecto razonables para campos que el usuario no especifico:
   - **Para 04-retainer.md:**
     - `{MAX_REUNIONES}`: 4
     - `{ZONA_HORARIA}`: America/Costa_Rica (CST, UTC-6)
     - `{CANAL_NOTIFICACION}`: Slack y correo electronico
     - `{SLA_P1_HORAS}`: 4
     - `{SLA_P2_HORAS}`: 8
     - `{SLA_P3_DIAS}`: 2
     - `{DIAS_PAGO}`: 10
     - `{TASA_MORA}`: 2
     - `{DIAS_SUSPENSION}`: 30
     - `{METODO_PAGO_ALTERNATIVO}`: transferencia SINPE o medio acordado por escrito
     - `{CONFIDENCIALIDAD_ANOS}`: 2
     - `{PLAZO_INICIAL_MESES}`: 3
     - `{DIAS_AVISO_NO_RENOVACION}`: 30
     - `{DIAS_POST_CONTRATO}`: 30
   - **Para 05-advisory-equity.md:**
     - `{DIAS_NOTIFICACION}`: 30
     - `{DIAS_AVISO_EXTRA}`: 5
     - `{DIAS_SUBSANACION}`: 15
     - `{DIAS_ROFR}`: 30
     - `{DIAS_NOTIFICACION_CAPTABLE}`: 15
     - `{ANOS_CONFIDENCIALIDAD}`: 3
     - `{MESES_NO_COMPETE}`: 12
     - `{HORAS_TRANSICION}`: 20
     - `{DIAS_NEGOCIACION}`: 30
     - `{CENTRO_MEDIACION}`: Centro de Conciliacion y Arbitraje de la Camara de Comercio de Costa Rica
     - `{CENTRO_ARBITRAJE}`: Centro de Conciliacion y Arbitraje de la Camara de Comercio de Costa Rica
     - `{MESES_ACELERACION}`: 6
5. Verificar que NO queden placeholders sin reemplazar (ningun `{...}` en el documento
   final), excepto los de modelos no seleccionados.
6. Generar un slug a partir del nombre del proyecto (minusculas, guiones, sin tildes).
7. Escribir en:
   - Retainer: `./fractional-cto/contracts/{slug}-retainer.md`
   - Advisory+Equity: `./fractional-cto/contracts/{slug}-advisory-equity.md`

### Paso 5 — Confirmacion

Presentar al usuario un resumen claro:

1. **Tipo de contrato generado:**
   - Retainer (04) o Advisory+Equity (05)

2. **Resumen de compensacion:**
   - Si Retainer Modelo A: tarifa mensual, horas incluidas, tarifa overage
   - Si Retainer Modelo D: tarifa minima, horas, equity %, vesting, cliff
   - Si Advisory Modelo D: retainer minimo, equity %, vesting, cliff, milestone
   - Si Advisory Modelo E: equity %, vesting, cliff, milestone, condicion de performance

3. **Ruta del archivo generado:**
   - `./fractional-cto/contracts/{slug}-retainer.md` o
   - `./fractional-cto/contracts/{slug}-advisory-equity.md`

4. **Disclaimer obligatorio:**
   > "Requiere revision de un abogado. Para equity, se recomienda un Stock Option
   > Agreement formal adicional."

5. **Si el contrato incluye equity:**
   > "Los benchmarks son orientativos (datos 2025-2026 de Carta, Pear VC). Ajustar
   > segun el contexto especifico."

6. **Siguiente paso sugerido:**
   - Si es retainer nuevo: "Considera documentar el scope detallado con `/contract-psa`
     para los primeros deliverables concretos."
   - Si es advisory+equity: "Formaliza el equity con un Stock Option Agreement o SAFE
     revisado por un abogado. El contrato generado regula la relacion de servicios,
     no sustituye un acuerdo accionario formal."

## Notas para el modelo

- Este es el UNICO skill del toolkit que rutea entre DOS templates distintos.
  La pregunta de routing (Paso 2) es el fork critico — no saltarla nunca.
- Para los modelos con equity, SIEMPRE presentar la tabla de benchmarks para que el
  CTO pueda calibrar su porcentaje. No asumir un porcentaje sin mostrar la tabla.
- Si el usuario menciona "pre-seed", "sin cash", "no puede pagar" o "solo equity"
  temprano en la conversacion, saltar directamente al path de Advisory+Equity
  confirmando brevemente.
- La Seccion 0 del template 05-advisory-equity.md (Reconocimiento de Riesgo Compartido)
  es especialmente importante — declara explicitamente que la startup es de alto riesgo
  y no puede garantizar salario. Asegurarse de que el usuario entienda esta clausula.
- Si hay un NDA existente en `./fractional-cto/contracts/*-nda.md`, cargar datos de las
  partes y referenciar la fecha del NDA en la Seccion 9.1 del retainer.
- Si hay un assessment existente en `./fractional-cto/assessment/`, cargar el nombre del
  proyecto y contexto para pre-llenar campos relevantes.
- El consultor opera como **persona fisica** (contratista independiente). Nunca usar
  razon social para el consultor ni mencionar "chimeranext" ni ningun otro nombre comercial.
- El template 04-retainer.md tiene una nota importante: el componente de equity del
  Modelo D debe formalizarse en un documento separado (Stock Option Agreement, SAFE,
  o equivalente). Este disclaimer se debe reforzar en la confirmacion.
- Ambos templates necesitan revision legal. Para equity, la revision es aun mas critica
  porque involucra participacion accionaria.
- No inventar datos. Si falta un campo obligatorio, preguntar.
- El AI Disclosure (si existe en el template) se mantiene siempre.
