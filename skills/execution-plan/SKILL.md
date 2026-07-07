---
name: execution-plan
version: 2.1.0
description: >
  This skill should be used when the user asks about "revenue model",
  "unit economics", "financial model", "branding", "brand identity",
  "legal foundation", "OKRs", "objectives and key results", "KPI dashboard",
  "reporting cadence", "modelo de ingresos", "economia unitaria",
  "modelo financiero", "marca e identidad", "fundacion legal",
  "costos fijos", "LTV", "CAC", "pricing", "precios",
  "constitucion legal", "equity", "OKR", "objetivos y resultados clave",
  "tablero de KPIs", "cadencia de reporte", "/execution-plan",
  or wants guided help with the financial and operational foundation
  of their startup: revenue streams, unit economics, financial projections,
  brand identity, legal structure, plus OKRs and a KPI reporting cadence.
  Covers Phases 9-13 of the startup lifecycle (Space 3a: Execution Foundation)
  and the operational OKR/KPI layer that operationalizes them.
  Requires Space 2 (Solution Validation) to be completed first.
---

# Plan de Ejecucion (Execution Plan)

Dialogo guiado interactivo para la primera mitad del **Espacio 3: Ejecucion-Aceleracion**
del framework de startup. Cubre el modelo de ingresos, economia unitaria, modelo financiero,
marca e identidad y fundacion legal. Combina Running Lean (Maurya), metodologia del
Founder Institute y Desarrollo de Realidad Sintetica (SRD -- Synthetic Reality Development).

**Prerrequisito**: Los Espacios 1 y 2 deben estar completos. Los archivos en
`./business/01-problema-hipotesis/` y `./business/02-solucion-validacion/` proporcionan
el contexto necesario. Si no existen, sugerir al usuario completar las fases anteriores.

## Regla de idioma

Todo el contenido generado debe estar en **espanol**. Los terminos de negocio se presentan
en formato **"espanol (English)"** la primera vez que aparecen, para que el emprendedor
aprenda la terminologia en ambos idiomas. Despues de la primera mencion, se puede usar
el acronimo solo. Nombres propios de frameworks y libros se mantienen en su idioma original.

## Directorio de salida

Todos los archivos van en `./business/` -- leer `${CLAUDE_PLUGIN_ROOT}/references/output-structure.md`
para el arbol completo de directorios.

## Regla de personalizacion

**Siempre Opcion B** -- reemplazar TODOS los marcadores genericos con contexto del proyecto.
Nunca usar ejemplos genericos.

## Estilo de preguntas

Una pregunta a la vez. Opcion multiple cuando sea posible. Esperar respuesta antes de avanzar.

## Modos de ejecucion

### Modo normal (por defecto)
Escribe todos los entregables en `./business/`.

### Modo simulacion (what-if)
Se activa cuando el usuario dice "simulacion", "prueba", "what-if",
"no guardes nada", o agrega `--what-if` al comando.

En modo simulacion:
- **NO** crear directorios ni escribir archivos
- **NO** usar las herramientas Write, Edit o Bash para creacion de archivos
- **SI** recorrer todas las fases interactivamente (preguntas, puertas de aprobacion)
- **SI** presentar el contenido completo de cada entregable en la conversacion como bloque de codigo
- **SI** prefijar cada entregable con un encabezado mostrando que SE ESCRIBIRIA:

```
[SIMULACION] Se escribiria: ./business/03-ejecucion-aceleracion/01-modelo-de-ingresos.md
```

- **SI** rastrear el progreso como si los archivos se hubieran escrito
- Al final, presentar un resumen de todos los archivos que SE HABRIAN creado
- Ofrecer: "Queres que escriba todos estos archivos ahora? (sale del modo simulacion)"

Si acepta, cambiar a modo normal y escribir todos los entregables acumulados de una vez.

## Puerta obligatoria

NO generar ningun entregable hasta que las preguntas de la fase correspondiente hayan sido
respondidas y el usuario haya aprobado la seccion. Preguntar UNA A LA VEZ. Esperar respuesta.

---

## Vista general de Fases 9-13

```
ESPACIO 3a: EJECUCION (Fases 9-13)
  |-- Fase 9:  Modelo de Ingresos      -> 03-ejecucion-aceleracion/01-modelo-de-ingresos.md
  |-- Fase 10: Economia Unitaria       -> 03-ejecucion-aceleracion/02-economia-unitaria.md
  |-- Fase 11: Modelo Financiero       -> 03-ejecucion-aceleracion/03-modelo-financiero.md
  |-- Fase 12: Marca e Identidad       -> 03-ejecucion-aceleracion/04-marca-e-identidad.md
  |-- Fase 13: Fundacion Legal         -> 03-ejecucion-aceleracion/05-fundacion-legal.md
  |-- Capa operativa: OKRs + KPI Reporting -> 03-ejecucion-aceleracion/06-okrs-y-kpi-reporting.md
  +-- PUERTA 3: Base financiera y legal solida?
```

---

## Fase 9: Modelo de Ingresos (Revenue Model) -- 3-4 preguntas

**MI-1**: "Investiga 3 modelos de ingresos que usen tus competidores. Cuales son y como
los mejorarias?"

**MI-2**: "De esos 3 modelos, cuales 2 queres testear? Para cada uno, defini 2 puntos
de precio (price points): uno competitivo y otro que genere $1M en 18 meses."

**MI-3**: "Describi los Pasos hacia el Ingreso (Steps to Revenue): cuales son todos
los pasos desde que un prospecto te conoce hasta que depositas dinero en tu cuenta?"

Generar `03-ejecucion-aceleracion/01-modelo-de-ingresos.md`. Presentar. Esperar aprobacion.

## Fase 10: Economia Unitaria (Unit Economics) -- 2-3 preguntas

**EU-1**: "Cuanto te cuesta adquirir un cliente -- Costo de Adquisicion (CAC -- Customer
Acquisition Cost)? Inclui todos los costos: marketing, ventas, incorporacion."

**EU-2**: "Cuanto vale un cliente a lo largo de su vida -- Valor de Vida del Cliente
(LTV -- Lifetime Value)? Cual es tu tasa de abandono (Churn Rate) estimada y tu
ticket promedio?"

**EU-3**: "Cuales son tus 3 canales de adquisicion principales?
Cual tiene mejor tasa de conversion (Conversion Rate)?"

Generar `03-ejecucion-aceleracion/02-economia-unitaria.md`. Presentar. Esperar aprobacion.

## Fase 11: Modelo Financiero (Financial Model) -- 4-6 preguntas

Leer plantilla: `${CLAUDE_PLUGIN_ROOT}/assets/templates/financial-model-beyond-budgeting.md`

**Fundamento metodologico**: Basado en *Lean Enterprise* (Humble, Molesky, O'Reilly, 2015)
cap. 13 "Evolving Financial Management". La tesis: **el presupuesto anual tradicional**
combina tres propositos distintos en un solo numero, creando incentivos perversos
(sandbagging, forecasts politicos, asignacion rigida). La solucion: **separar en 3 procesos
distintos con cadencias distintas**: Target (ambicioso) + Forecast (honesto) + Resource
Allocation (dinamico, evidence-driven).

### Preguntas base (costos + runway)

**MF-1**: "Cuales son tus costos fijos y variables mensuales?
(equipo, infraestructura, herramientas, servicios)"

**MF-2**: "Cuanto tiempo podes sobrevivir sin ingresos?
(ahorros, gastos personales, ingresos alternativos)"

**MF-3**: "Necesitas levantar capital? Si si, cuanto y de donde?
  a) Autofinanciamiento (Bootstrapping -- financiar con recursos propios sin inversores externos)
  b) Familia y amigos (Friends & Family Round)
  c) Angeles inversores (Angel Investors)
  d) Capital de riesgo (VC -- Venture Capital)
  e) Subvenciones o premios (Grants)"

### Preguntas Beyond Budgeting (nuevo)

**MF-4 (Target)**: "Definamos el Target -- que queres lograr en los proximos 12-18 meses?
Esto es **aspiracional**, sin penalizacion por no alcanzarlo. Metricas clave:
  - MRR (Monthly Recurring Revenue) target a 12 y 18 meses
  - Usuarios activos / clientes pagos
  - North Star metric del negocio"

**MF-5 (Forecast)**: "Ahora definamos el Forecast -- que *realmente* esperas que pase?
Esto es **honesto y privado**, sin politica. Rolling 18 meses con supuestos claros
(growth rate MoM, churn, CAC payback). **Regla critica**: el forecast puede ser menor
que el target y no pasa nada -- son herramientas distintas.

**Herramienta operacional recomendada**: **Slidebean Financial Model Template**
(gratuito, Google Sheets/Excel) -- provee la estructura de 14 sheets (Settings, Team &
Salaries, Projections, Revenue, COGS, SG&A, WK+CAPEX, etc.) para construir el forecast.
Beyond Budgeting aporta el framework estrategico, Slidebean la estructura operacional.

Link: https://slidebean.com/free-startup-financial-model-template
Video tutorial: https://www.youtube.com/watch?v=rwUxqjnksAc

Variantes por industria disponibles en Slidebean: Subscription/SaaS, E-commerce,
Marketplace, Mobile App, Blog/Content -- si tu negocio encaja en una, arrancar con
esa variante ahorra horas de formulas. Detalles completos en el template
`financial-model-beyond-budgeting.md`."

**MF-6 (Resource Allocation)**: "Que iniciativas vas a financiar este trimestre y con
que gate de evidencia? En lugar de pre-asignar 12 meses de presupuesto, vamos a asignar
tramos trimestrales con metrica clara para desbloquear el siguiente tramo.

Definir 3-5 iniciativas, cada una con:
  - Monto asignado al tramo actual
  - Metrica que debe cumplirse para siguiente tramo
  - Fecha del gate de decision (go / pivot / kill / scale)"

### Reglas de los 3 propositos

| | Target | Forecast | Resource Allocation |
|---|---|---|---|
| Pregunta | Que queremos lograr? | Que esperamos que pase? | Cuanto gastamos y donde? |
| Cadencia | Anual (revision Q) | Rolling 18 meses | Trimestral con gates |
| Sesgo | Ambicioso (up-bias OK) | Neutral (cero sesgo) | Conservador (kill libre) |
| Publico | Todo el equipo | Leadership + board | Lideres + finanzas |

**Output**: Generar `03-ejecucion-aceleracion/03-modelo-financiero.md` con las 3 secciones
(Target / Forecast / Resource Allocation) claramente separadas, siguiendo la estructura
del template `financial-model-beyond-budgeting.md`.

Presentar. Esperar aprobacion.

## Fase 12: Marca e Identidad (Branding) -- 2-3 preguntas

**MI-1**: "Lista 10+ palabras que evoquen tu producto, cliente, problema y emociones deseadas."

**MI-2**: "Ya tenes nombre? Si no, tenes candidatos? Verificaremos dominio y redes."

**MI-3**: "Que elementos de diseno necesitas? (logotipo, tarjetas, pagina de aterrizaje,
plantilla de presentacion)"

Generar `03-ejecucion-aceleracion/04-marca-e-identidad.md`. Presentar. Esperar aprobacion.

## Fase 13: Fundacion Legal (Legal Foundation) -- 2-3 preguntas

**FL-1**: "Ya estas constituido? Que tipo de entidad? En que jurisdiccion?"

**FL-2**: "Tenes cofundadores? Como es la distribucion de participacion accionaria (equity)?"

**FL-3**: "Que acuerdos legales necesitas? (Acuerdo de Confidencialidad (NDA -- Non-Disclosure Agreement), Cesion de
Propiedad Intelectual (IP Assignment), contrato laboral, Acuerdo Estandar de Asesores
del Founder Institute (FAST -- Founder Advisor Standard Template))"

Generar `03-ejecucion-aceleracion/05-fundacion-legal.md`. Presentar. Esperar aprobacion.

### Si tenes multiples ventures (N >= 3) -- cross-plugin reference

BMT cubre legal structure para UN venture individual. Si sos serial entrepreneur
con multiples ventures activas + shared services, considerar usar el plugin complementario
**venture-studio-toolkit** (https://github.com/chimeranext/venture-studio-toolkit).

Skills relevantes del venture-studio-toolkit:

- **`structure-decision`**: elegir estructura macro (Skip-CR / Tostada / Cayman Sandwich /
  Services Hub / Multi-LLC + Holding) -- 7 patrones cubiertos
- **`services-hub-setup`**: si eleges Services Hub (patron #6), setup de MSAs (Master
  Service Agreements) + transfer pricing methodology + IP assignment rider
- **`liability-contagion-analysis`**: validar que las ventures NO se contaminan entre si
  bajo single-LLC (critico si hay ventures high-liability como fintech o health)
- **`when-to-become-studio`**: assessment de 3 modos (serial entrepreneur puro /
  Services Hub operator / formal studio con fund)
- **`cap-table-per-venture`**: gestion de cap tables independent cuando hay multiples LLCs
- **`sweat-equity-agreement`**: vesting + cliff + 83(b) + clawback (extiende el FAST
  agreement cubierto en Fase 17 de BMT)

**BMT Fase 13 sigue siendo relevante por-venture**, pero la arquitectura macro (como
multiples ventures coexisten legal y operacionalmente) la decide el venture-studio-toolkit.

Typical flow combinado:
1. BMT Fase 13 -- define legal structure DE ESTA venture (LLC Delaware, SRL CR, etc.)
2. venture-studio-toolkit `structure-decision` -- define como ESTA venture encaja en el
   portfolio broader (standalone? bajo Services Hub? subsidiary de Holding?)
3. venture-studio-toolkit `services-hub-setup` (opcional) -- si Services Hub elegido,
   setup del framework MSA entre Services LLC y esta venture

---

## Capa operativa: OKRs y Cadencia de KPI Reporting

Fases 9-13 definen QUE construir; esta capa define COMO se mide la ejecucion mes a mes. Es la
bisagra entre el Target (Fase 11, Beyond Budgeting) y la operacion: los OKRs traducen el Target
ambicioso en objetivos trimestrales medibles, y la cadencia de KPI reporting los mantiene vivos.

No es una fase de lifecycle -- es una capa operativa que se instala una vez y corre en loop
trimestral/semanal. Preguntar UNA A LA VEZ.

### Parte 1 -- OKRs (Objectives and Key Results)

Un OKR = un **Objetivo (Objective)** cualitativo e inspirador + 2-5 **Resultados Clave (Key
Results)** cuantitativos que prueban que lo lograste. Regla de oro: **el objetivo es la
direccion, los key results son la evidencia**. Si un KR no tiene numero y fecha, no es un KR.

**OKR-1 (Objetivo)**: "Cual es el UNICO objetivo mas importante del proximo trimestre? Debe ser
cualitativo, memorable, y alineado con el Target de la Fase 11. Maximo 1-2 objetivos por trimestre
para una startup temprana -- mas de eso es no tener foco."

*Ejemplo (solo forma): "Probar que Acme retiene a los usuarios que activa."*

**OKR-2 (Key Results)**: "Para ese objetivo, defini 2-4 resultados clave medibles. Cada uno con:
metrica + baseline + target + fecha. Buenos KR miden **resultado (outcome)**, no actividad
(output): 'D30 retention de 15% -> 30%' es outcome; 'lanzar 3 features' es output (evitar)."

*Ejemplo de KR (forma):*
| Key Result | Baseline | Target | Fecha |
|---|---|---|---|
| D30 retention | 15% | 30% | fin Q |
| NPS | 20 | 40 | fin Q |
| Churn mensual | 8% | 5% | fin Q |

**OKR-3 (Grading)**: "Al cierre del trimestre cada KR se califica 0.0-1.0 (fraccion del target
lograda). El sweet spot es 0.6-0.7 promedio -- si sacas 1.0 en todo, pusiste targets muy bajos;
si sacas < 0.3, muy altos. Los OKRs NO se atan a compensacion (eso incentiva sandbagging), son
herramienta de foco y aprendizaje."

#### Variante weighted (opcional)

Para equipos con multiples objetivos, asignar un **peso (weight)** a cada objetivo/KR (que sumen
100%) y calcular un score global ponderado. Util cuando hay que priorizar entre objetivos que
compiten por recursos. Formato:

```
Objetivo A (peso 60%): score 0.7  -> aporta 0.42
Objetivo B (peso 40%): score 0.5  -> aporta 0.20
Score OKR global ponderado = 0.62
```

Para una startup de 1 objetivo, la variante non-weighted (promedio simple) alcanza. Ofrecer
weighted solo si el usuario tiene >=2 objetivos que compiten.

#### Cadencia trimestral

- **Inicio de Q**: definir/refinar OKRs (esta seccion).
- **Semanal/quincenal**: check-in de confianza por KR (semaforo: on-track / at-risk / off-track).
- **Fin de Q**: grading + retro + definir OKRs del siguiente Q.

### Parte 2 -- Cadencia de KPI Reporting

Los OKRs son trimestrales; los KPIs son el pulso continuo. Definir un **tablero (dashboard)** con
las metricas que importan por etapa, y una cadencia de revision.

**KPI-1 (Metricas por etapa)**: "Que metricas segui segun tu etapa? No todas importan siempre --
medir de mas diluye el foco." Sugerir segun la etapa del usuario:

| Etapa | North Star candidata | KPIs de soporte |
|---|---|---|
| Pre-PMF / Activation | Usuarios activados / semana | Activation rate, time-to-value, D1/D7 retention |
| PMF temprano / Retention | Usuarios retenidos D30 | D30 retention, NPS, churn, DAU/MAU |
| Growth / Revenue | MRR / ARR | MRR growth, CAC, LTV:CAC, payback (ver aaarrr revenue) |
| Scale | Net revenue retention | NRR, Rule of 40, magic number, burn multiple |

Regla: **una North Star metric** (la que mejor predice valor entregado al cliente) + 3-5 KPIs de
soporte. Mas de eso es un tablero que nadie mira.

**KPI-2 (Cadencia de revision)**: "Definamos el ritmo:
  - **Semanal**: pulso operativo -- North Star + 2-3 KPIs accionables esta semana. 15 min, un
    solo grafico por KPI (tendencia, no vanity).
  - **Mensual**: business review -- todos los KPIs + progreso de OKRs + decisiones de resource
    allocation (cross-ref Fase 11, tramos trimestrales con gates).
  - **Quien mira que**: North Star = todo el equipo; KPIs financieros = leadership; OKR grading =
    leadership + board."

**KPI-3 (Formato del tablero)**: cada KPI en el reporte lleva: valor actual, delta vs periodo
anterior, target, y semaforo. Tendencia > snapshot. Evitar vanity metrics (totales acumulados que
solo suben); preferir ratios y tasas.

### Output

Generar `03-ejecucion-aceleracion/06-okrs-y-kpi-reporting.md` con: los OKRs del trimestre actual
(objetivo + KR table + weighted opcional), la cadencia trimestral, la seleccion de North Star +
KPIs por etapa, y la cadencia de reporting (semanal/mensual + quien mira que). Presentar. Esperar
aprobacion.

**Conexion**: los KPIs financieros (CAC, LTV:CAC, payback, MRR) deben ser consistentes con
`aaarrr-flywheel-toolkit` (`/revenue`, unit-economics) y con el modelo cuantitativo de
`launchpad-toolkit:financial-model`. Si el usuario tiene esos, reusar sus definiciones en lugar de
redefinir metricas.

---

## PUERTA 3: Base Financiera y Legal

> "Fases 9-13 completas. Validemos la base financiera y legal:
> - Economia unitaria viable (LTV > 3x CAC)?
> - Modelo financiero con camino a la rentabilidad (Runway)?
> - Marca e identidad definidas (nombre, dominio, visual)?
> - Fundacion legal establecida (entidad, equity, acuerdos)?
> - OKRs del trimestre definidos + North Star y cadencia de KPI reporting instalada?
> Listo para avanzar a Aceleracion del Crecimiento (Growth Acceleration) -- Fases 14-17?"

Si el usuario aprueba, indicar que el siguiente paso es la fase de
Aceleracion del Crecimiento (Growth Acceleration) -- Fases 14-17.

---

## Principios clave

- **Una pregunta a la vez** -- nunca abrumar con multiples preguntas
- **Opcion multiple cuando sea posible** -- mas facil de responder; abierta cuando sea necesario
- **Siempre Opcion B** -- personalizar cada marcador generico con contexto del proyecto
- **Puertas de aprobacion** -- presentar cada entregable, esperar aprobacion antes de avanzar
- **Puertas de validacion** -- verificar antes de avanzar entre espacios
- **Espanol como base** -- con terminos de negocio en formato "espanol (English)" la primera vez
- **Diagramas en Mermaid** -- todo diagrama de flujo, maquina de estados, arquitectura o
  secuencia debe usar sintaxis Mermaid (```mermaid). No usar ASCII art ni diagramas de texto.

## Recursos adicionales

### Archivos de referencia
- **`${CLAUDE_PLUGIN_ROOT}/references/methodology.md`** -- Bancos de preguntas detallados, reglas de personalizacion
- **`${CLAUDE_PLUGIN_ROOT}/references/output-structure.md`** -- Estructura de directorios, detalles de archivos, puertas de validacion
- **`${CLAUDE_PLUGIN_ROOT}/references/readme-guide.md`** -- Patrones de generacion de README

### Archivos de plantilla (leer antes de generar)
- **`${CLAUDE_PLUGIN_ROOT}/assets/templates/financial-model-beyond-budgeting.md`** -- Framework Beyond Budgeting (Target / Forecast / Resource Allocation) basado en Lean Enterprise cap. 13
