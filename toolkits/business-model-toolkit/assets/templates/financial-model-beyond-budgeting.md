# Modelo Financiero con Beyond Budgeting — [Proyecto]

> Basado en *Lean Enterprise* (Humble, Molesky, O'Reilly, 2015), capítulo 13 —
> "Evolving Financial Management".
>
> **Tesis central**: El presupuesto anual tradicional combina en un solo número tres
> propósitos distintos (target ambicioso + forecast realista + resource allocation), creando
> incentivos perversos:
> - Los managers **sandbagean los targets** para asegurar recursos y hacer quedar bien el forecast
> - Los **forecasts se vuelven pactos políticos** en lugar de predicciones honestas
> - La **asignación de recursos queda congelada** 12 meses, incapaz de responder a la evidencia
>
> **La solución**: **separar los tres propósitos en procesos distintos**, con cadencias distintas.

---

## 1. Target — Metas Ambiciosas (aspiracional)

> Qué queremos lograr. Metas ambiciosas que inspiran pero NO se usan para decidir recursos.
> Ambiciosas sin consecuencia de sandbagging.

### Cadencia

- **Annual** (revisión ligera trimestral)
- **Horizonte**: 12-18 meses

### Formato

| Dimensión | Target 12 meses | Target 18 meses | Justificación |
|---|---|---|---|
| Ingresos mensuales recurrentes (MRR) | $`_____` | $`_____` | `[Por qué es ambicioso pero alcanzable]` |
| Usuarios activos / clientes pagos | `_____` | `_____` | |
| Tasa de conversión funnel clave | `____%` | `____%` | |
| Market share / NPS / otra métrica North Star | `_____` | `_____` | |

### Reglas clave

- **No penalizar por no alcanzarlo**. Alcanzar el 70-80% del target es éxito.
- **Pública internamente**. Todo el equipo ve el target. Transparencia alineando incentivos.
- **Bottom-up + top-down blend**. No impuesto, pero ambicioso. Negociado con el equipo.

---

## 2. Forecast — Pronóstico Honesto (realista)

> Qué *realmente esperamos* que va a pasar. Sin sesgo, sin política, sin compromiso
> con un número específico. Herramienta de **planificación**, no de evaluación.

### Cadencia

- **Rolling 18 months** — cada mes/trimestre se actualiza basado en data real
- **Rebaseline trimestral** — forecast se re-hace desde cero cada Q con info actualizada

### Herramienta operacional recomendada: Slidebean Financial Model Template

> Para construir el Forecast, Beyond Budgeting aporta el **framework estratégico** (separar
> propósitos, rolling cadencia, sin sandbagging). **Slidebean** aporta la **estructura
> operacional** (qué tabs/fórmulas armar en un spreadsheet).
>
> Link al template gratuito: <https://slidebean.com/free-startup-financial-model-template>
> Video tutorial: <https://www.youtube.com/watch?v=rwUxqjnksAc>

**Slidebean organiza el modelo financiero en 14 sheets**:

| # | Sheet | Qué va ahí |
|---|---|---|
| 1 | `Intro` | Home / promocional (ignorable) |
| 2 | `Settings` | Configuración general (moneda, fecha de inicio, etc.) |
| 3 | `Team & Salaries` | Headcount por rol con fórmulas de escalamiento (ej. "1 CS rep por cada 1000 customers") |
| 4 | `Projections` | **Proyecciones core** — unit economics, CAC, churn, MRR |
| 5 | `Charts & KPIs` | Dashboard gráfico automático |
| 6 | `Data for Charts` | Data feed para Charts (usualmente no editar directamente) |
| 7 | `FS-Annual` | Financial Statements anual (P&L) |
| 8 | `FS-Month` | Financial Statements mensual |
| 9 | `Revenue` | Bloques de ingresos por stream (1 bloque por modelo, mergeando planes similares) |
| 10 | `COGS` | Cost of Goods Sold — costos directos de entregar el servicio (AWS, Intercom, payment processing 2.9%, etc.) |
| 11 | `SG&A` | Sales, General & Admin — donde va la mayoría del trabajo (salaries, marketing, herramientas) |
| 12 | `WK+CAPEX` | Working Capital + Capital Expenditures (equipos, furniture con depreciación) |
| 13 | `Funding - Convertible Note Calc` | Calculadora de dilución para SAFEs / convertible notes |
| 14 | `Funding - Equity Round Calculat` | Calculadora de dilución para priced rounds |

**Convención de color-coding (Slidebean estándar)**:

- 🟦 **Azul** = inputs manuales (lo que editás — variables controlables)
- ⬛ **Negro** = fórmulas (outputs calculados — no tocar)
- 🟫 **Gris** = data histórica / confirmada

**Reglas de modelado Slidebean**:

1. **Un bloque de revenue por stream distinto**, no por plan. Si tenés 5 planes SaaS,
   usá UN bloque con MRR promedio ponderado, no 5 bloques separados.
2. **Margen SaaS típico**: 80-90% (COGS bajo). E-commerce: 20-30%. Si no lo igualás,
   probablemente estás olvidando un costo.
3. **Net Revenue ≈ MRR × 1.05-1.10** (ajuste por mix de planes anuales vs. mensuales).
4. **Fórmula core SaaS**: `New MRR = Marketing Budget × (1 / CAC)` — es el driver de
   crecimiento. Cuidado con sobreestimar reducción de CAC a escala.
5. **Runway**: basado en **3-month average burn**, no burn del último mes (volatilidad).
   Si sos profitable, runway = infinito.
6. **Capital Requirements**: línea que detecta el mes más negativo en cash balance —
   esa es la cantidad mínima a levantar (+ buffer de 20-30%).

### Formato local del Forecast (extracto para copiar a markdown)

> El documento detallado vive en el spreadsheet Slidebean (Google Sheets o Excel).
> Este archivo captura el **extracto ejecutivo** para reference y discusión con el equipo.

**Rolling forecast mensual** (próximos 18 meses):

| Mes | Revenue | MRR | Active customers | COGS | SG&A | Net burn | Cash balance | Runway | Confianza |
|---|---|---|---|---|---|---|---|---|---|
| M+1 | $`____` | $`____` | `___` | $`____` | $`____` | $`____` | $`____` | `__ meses` | Alta (datos reales) |
| M+2 | $`____` | $`____` | `___` | $`____` | $`____` | $`____` | $`____` | `__ meses` | Alta |
| M+3 | $`____` | $`____` | `___` | $`____` | $`____` | $`____` | $`____` | `__ meses` | Media |
| M+6 | $`____` | $`____` | `___` | $`____` | $`____` | $`____` | $`____` | `__ meses` | Media |
| M+12 | $`____` | $`____` | `___` | $`____` | $`____` | $`____` | $`____` | `__ meses` | Baja (proyección) |
| M+18 | $`____` | $`____` | `___` | $`____` | $`____` | $`____` | $`____` | `__ meses` | Muy baja |

**Supuestos clave del forecast** (los "blue cells" de Slidebean):

1. **Growth rate**: `___% MoM` (MRR growth)
2. **Churn rate**: `___%` (mensual — >5% es red flag en SaaS)
3. **CAC**: $`___` (fully-loaded: marketing + sales + onboarding)
4. **LTV**: $`___` (ARPU × gross margin / churn)
5. **LTV/CAC ratio**: `___` (meta: ≥3×)
6. **CAC payback period**: `___ meses` (meta: ≤12 meses)
7. **CAC trend** (asumido): `[flat / increasing X% por + spend / decreasing]`
8. **Headcount formula**: `[ej. ROUND((Customers-1000)/1000, 0) para hire de CS rep]`
9. **Supuesto macroeconómico**: `[ej. "CR GDP growth +3%, USD/CRC stable"]`

**Capital Requirements** (de Slidebean `Projections` sheet):

- Mes de cash más bajo: M+`___`
- Cash balance en ese mes: $`____` (negativo = gap de funding)
- **Ask mínima a levantar**: $`___` + 25% buffer = $`___`

### Reglas clave

- **NO sandbag**. Si realmente creés que el MRR llegará a $50k, escribilo aunque el target
  sea $70k. Ser honesto con vos mismo/a es el único propósito de este documento.
- **Rebaseline sin culpa**. Si al mes siguiente las condiciones cambiaron, actualizá el
  forecast. No es "fallar" — es planificar mejor.
- **Separado del target**. El forecast puede ser menor que el target y no pasa nada —
  son herramientas distintas.
- **Privado del equipo ejecutivo / board**. No se difunde ampliamente (no deprime ni crea
  expectativas distorsionadas).
- **Spreadsheet es la fuente de verdad**, este documento es extracto para discusión.
  Nunca mantener "dos versiones" — si actualizás una, actualizá la otra.
- **Variantes Slidebean específicas por industria**: Subscription/SaaS, E-commerce,
  Marketplace, Mobile App, Blog/Content — si tu modelo encaja en una, arrancar con esa
  variante en lugar del template general (ahorra horas de fórmulas).

---

## 3. Resource Allocation — Asignación Dinámica (evidence-driven)

> Cómo se asignan los recursos (dinero, personas, tiempo). NO se pre-asigna para 12 meses.
> Se asigna en tramos con **decisión explícita en cada gate**.

### Cadencia

- **Trimestral** (o incluso mensual al inicio) para asignaciones nuevas
- **Por gate de evidencia** para seguir financiando iniciativas existentes

### Formato — Tramo actual de asignación (próximos 3 meses)

| Iniciativa | Tramo asignado | Métrica que desbloquea el siguiente tramo | Gate de decisión |
|---|---|---|---|
| MVP v1 | $`____` | Usuarios activos ≥ N por semana en M+3 | M+3: go/pivot/kill |
| Marketing canal A | $`____` | CAC ≤ $X en M+2 | M+2: escalar o parar |
| Nueva feature X | $`____` | Completar + testear con 10 users en M+2 | M+2: lanzar o descartar |
| Equipo +1 persona | $`____` | Hiring en M+1, productivo en M+3 | M+3: evaluar contribución |

### Preguntas críticas en cada gate de asignación

Antes de aprobar el siguiente tramo:

1. **¿Es esto realmente necesario?** (vs. existen alternativas más baratas)
2. **¿Qué es "suficientemente bueno"?** (evitar over-engineering)
3. **¿Cómo está creando valor esto?** (tangible, medible)
4. **¿Está dentro del framework de ejecución del equipo?** (no scope creep)

### Reglas clave

- **Nunca pre-asignar 12 meses**. Solo el tramo actual (1-3 meses) tiene presupuesto comprometido.
- **Cada tramo tiene gate de evidencia**. No es "renovación automática" — es decisión explícita
  con data en la mano.
- **Kill es válido**. Si una iniciativa no pasa su gate, se para. No es falla personal — es
  aprendizaje del sistema.
- **Reallocate libre**. Los recursos liberados de iniciativas killed van a iniciativas con
  evidencia de tracción.

---

## 4. Matrix de los 3 propósitos

| | **Target** | **Forecast** | **Resource Allocation** |
|---|---|---|---|
| **Pregunta** | ¿Qué queremos lograr? | ¿Qué esperamos que pase? | ¿Cuánto gastamos y dónde? |
| **Cadencia** | Anual (revisión Q) | Rolling 18 meses (mensual) | Trimestral por gate |
| **Sesgo aceptable** | Ambicioso (up-bias OK) | Neutral (zero bias) | Conservador (down-bias OK) |
| **Público** | Todo el equipo | Leadership + board | Líderes de iniciativa + finanzas |
| **Uso primario** | Alinear motivación | Planificar operaciones | Decidir inversión |
| **Consecuencia por incumplimiento** | Ninguna (reset + retry) | Ninguna (rebaseline) | Kill iniciativa + reallocate |

---

## 5. Señales de que el sistema tradicional está fallando

> Usar esta lista de diagnóstico. Si marcaste ≥3 items, Beyond Budgeting vale la pena.

- [ ] El equipo sandbagea targets para "dejar margen" ante recortes de presupuesto
- [ ] Nadie cree los forecasts oficiales — son política, no predicción
- [ ] Iniciativas obviamente fallidas siguen financiadas hasta fin de año porque "ya está asignado"
- [ ] Iniciativas nuevas con tracción real NO pueden empezar porque "no estaba en el budget"
- [ ] Revisiones trimestrales son theater — nadie actúa sobre la info
- [ ] Incentivos personales del CEO/leads están atados al target (se distorsiona comportamiento)

---

## 6. Plan de transición (si venís de budget tradicional)

No hay que hacer todo a la vez. Transición gradual:

### Fase T1 (mes 1-3): Separar Target del Forecast

- Dejar el presupuesto tradicional corriendo
- Empezar un rolling forecast mensual privado (solo leadership)
- Comparar forecast vs. budget: ¿dónde difieren sistemáticamente?

### Fase T2 (mes 4-6): Agregar Resource Allocation trimestral

- Elegir 2-3 iniciativas y ponerlas en tramos trimestrales con gates
- Dejar el resto del budget como estaba
- Evaluar: ¿las iniciativas trimestrales se manejan mejor?

### Fase T3 (mes 7-12): Expandir resource allocation a toda la operación

- Mover progresivamente todo el presupuesto a sistema de tramos
- Mantener Target anual como documento de inspiración
- Mantener Forecast rolling como herramienta de planificación

---

## 7. Preguntas abiertas para el proyecto específico

*(Completar durante Fase 11)*

- ¿Cuál es el Target más importante para este proyecto en los próximos 12 meses?
  `[Respuesta]`
- ¿Cuál es el forecast *honesto* de MRR en M+6? (no target)
  `[Respuesta — con incertidumbre explícita]`
- ¿Qué 3 iniciativas van a recibir tramos de recursos este trimestre?
  1. `[Iniciativa 1]`: $`___`, gate en M+___, métrica `___`
  2. `[Iniciativa 2]`: $`___`, gate en M+___, métrica `___`
  3. `[Iniciativa 3]`: $`___`, gate en M+___, métrica `___`
- ¿Cuál es el runway del proyecto bajo el forecast más probable?
  `[___ meses]`
