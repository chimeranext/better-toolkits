---
name: structure-evolution-roadmap
version: 1.0.0
description: >
  Generates a migration roadmap for evolving from the current corporate structure
  to the next-appropriate one, with specific triggers (ARR thresholds, term sheet,
  geography changes, regulatory events). Use when the user asks "when to migrate",
  "structure evolution", "cuándo migrar estructura", "Skip-CR to Tostada",
  "Tostada to Cayman Sandwich", "flip to Delaware C-Corp",
  "/structure-evolution-roadmap", or has already chosen their current structure
  via structure-decision and needs to plan the future transitions.
---

# Structure Evolution Roadmap

Extiende `structure-decision` con un **roadmap específico** de cuándo y cómo migrar
de una estructura a la siguiente. Las estructuras corporativas no son terminals —
evolucionan con la startup.

## Regla de idioma

Español. Términos legales en formato "español (English)" primera vez.

## Directorio de salida

```
./portfolio/{name}/
└── structure-evolution-roadmap.md
```

## Aviso legal

**Esta skill NO es asesoría legal**. Los triggers son guidelines, no reglas rígidas.
Cada migración tiene costos fiscales y legales que requieren abogado especializado.

---

## Las 6 rutas de evolución más comunes

### Ruta 1: Skip-CR → Delaware Tostada

**Estructura inicial**: US LLC (Delaware/Wyoming/Texas) + freelancers LATAM
**Estructura siguiente**: US LLC → LATAM OpCo (formal subsidiary)

**Triggers** (cualquiera activa la migración):

- Primer cliente LATAM que requiere **factura local formal** con IVA
- Primer empleado formal local (con CCSS/IMSS/etc. en CR/MX/etc.)
- Presencia física requerida (oficina, permiso de funcionamiento)
- Regulación sectorial que exige entidad local (fintech, salud)

**Costo de migración**: ~$1,500-$4,000 USD (incorporación OpCo + asesoría transfer pricing)

**Tiempo**: 4-8 semanas

**Pasos**:
1. Crear OpCo local (ej. SRL en CR, S.A.P.I. en MX)
2. Intercompany services agreement entre US LLC (parent) y OpCo (sub) — define transfer pricing
3. Migrar contratos de freelancers a contratos laborales en OpCo
4. Abrir banco local + registrar ante autoridad fiscal
5. Mantener pass-through US (US LLC sigue siendo entidad principal para VCs)

### Ruta 2: Delaware Tostada → Cayman Sandwich

**Estructura inicial**: DE LLC → LATAM OpCo
**Estructura siguiente**: Cayman HoldCo → DE LLC → LATAM OpCo

**Trigger principal**: **term sheet de VC para priced round Series A+**

**Triggers secundarios**:

- Round de $2M+ con inversores internacionales
- Plan de expansión multi-país (necesita HoldCo flexible para crear OpCos adicionales)
- Exit value esperado >$50M (el tax ahorro del Cayman empieza a justificar el setup)

**Costo de migración**: ~$10,000-$30,000 USD (setup Cayman + legal + contabilidad transfer pricing)

**Tiempo**: 6-12 semanas — **idealmente ANTES del closing del round**

**Pasos**:
1. Incorporar Cayman Exempted Company (HoldCo)
2. Share swap: accionistas de DE LLC intercambian por shares de Cayman HoldCo
3. Cayman HoldCo pasa a ser owner de DE LLC (que conserva LATAM OpCo)
4. Update legal agreements (SAFE, convertible notes) para reflejar nueva HoldCo
5. Banking: abrir cuenta Cayman (Butterfield o similar)
6. **Crítico**: evitar que DGI/SAT/etc. vea esto como "exit oculto" — consultar abogado fiscal en país de OpCo

**⚠️ Timing crítico**: hacer el share swap ANTES del priced round cierre. Después cuesta exponencialmente más (tax on deemed distribution).

### Ruta 3: Delaware Tostada → Delaware C-Corp

**Estructura inicial**: DE LLC → LATAM OpCo
**Estructura siguiente**: DE C-Corp → LATAM OpCo (LLC flipped to Corp)

**Trigger principal**: **plan de exit US-focused** (acquisition por US acquirer) y QSBS elegibilidad

**Triggers secundarios**:

- VC US insiste en C-Corp (algunos VCs US no invierten en LLCs)
- R&D tax credits relevantes (C-Corp elegible, LLC no tan directo)
- IPO en NASDAQ/NYSE en horizonte de 3-5 años

**Costo de migración**: ~$5,000-$15,000 USD (conversion + new stock issuance + 83(b) filings)

**Tiempo**: 2-4 semanas

**Pasos**:
1. LLC-to-Corp conversion statutory (simple en Delaware, 1 filing)
2. Redactar Certificate of Incorporation + bylaws C-Corp
3. Emitir (issue) stock a los founders/empleados (equivalente a membership interests previos)
4. **83(b) elections dentro de 30 días** de cada issuance — CRÍTICO para QSBS
5. Update cap table

**⚠️ Caution**: conversion es taxable event si hay value significant. Consultar con CPA.

### Ruta 4: Single-LLC multi-brand → Multi-LLC

**Estructura inicial**: 1 LLC con múltiples DBAs/brands
**Estructura siguiente**: N LLCs, una por venture

**Triggers**:

- Una venture alcanza $10k MRR (signal de "esta va en serio, aislémosla")
- Una venture recibe **intro a VC** o term sheet
- Liability event: una venture enfrenta demanda o incidente (contaminación inminente)
- Una venture va a contratar empleados o firmar contratos grandes (exposure ↑)

**Costo de migración**: ~$500-$2,000 USD por nueva LLC (Delaware/WY/TX via Stripe Atlas)

**Tiempo**: 1-2 semanas por LLC

**Pasos**:
1. Crear nueva LLC dedicated a la venture que se separa
2. Assign intellectual property de la venture a la nueva LLC (asignación legal formal)
3. Transferir cuentas bancarias, contratos, customers a la nueva LLC
4. Mantener LLC original para las ventures restantes (puede que eventualmente se disuelva si todas se separan)

**⚠️ Trampa común**: olvidar asignar IP explícitamente. Sin assignment agreement, el IP sigue siendo de la LLC original.

### Ruta 5: Multi-LLC → Multi-LLC + Holding

**Estructura inicial**: N LLCs independientes
**Estructura siguiente**: HoldCo → N LLCs subsidiarias

**Triggers**:

- 3+ ventures con revenue simultáneo ($10k+ MRR cada una)
- Primer term sheet de VC en alguna venture — VC prefiere estructura organizada
- Planes de fund atado al studio (necesita Management Co)
- Optimización fiscal: consolidar profits/losses via HoldCo

**Costo de migración**: ~$15,000-$40,000 USD (HoldCo + share swaps + legal)

**Tiempo**: 2-3 meses

**Pasos**:
1. Elegir jurisdicción de HoldCo: Cayman (si VCs internacionales), Delaware C-Corp (si US-focused), Uruguay (si LATAM regional)
2. Incorporar HoldCo
3. Share swap: dueños de cada LLC intercambian shares por shares de HoldCo
4. HoldCo pasa a ser dueño de todas las LLCs
5. Intercompany agreements (management services, IP licensing, capital injections)
6. Cap table consolidation a nivel HoldCo

### Ruta 6: Cualquier estructura → EU via Portugal Startup Visa

**Estructura inicial**: cualquiera
**Estructura adicional**: Portuguese Lda. + residency visa

**Triggers**:

- Founder quiere mudarse a EU por razones fiscales o personales
- IFICI (20% flat IRS 10 años) es atractivo vs. tax rate actual
- Expansión a mercado EU
- Schengen visa access para viajes

**Costo**: €3,000-€10,000 (visa application + Lda. setup + residency process)

**Tiempo**: 4-12 meses (visa process + physical relocation)

**Nota**: este NO reemplaza la estructura US/Cayman/etc. — es una estructura **adicional** para residency personal del founder. La startup entity sigue donde esté.

---

## Flujo del skill

### Paso 1 — Contexto actual

**EV-1**: "¿Cuál es tu estructura actual? (si ya corriste `structure-decision`, leer `./portfolio/{name}/structure-decision.md`)
- Skip-CR Pattern (US LLC solo)
- Delaware Tostada (US LLC → LATAM OpCo)
- Cayman Sandwich (Cayman → US LLC → LATAM OpCo)
- Delaware C-Corp (→ LATAM OpCo)
- Single-LLC multi-brand
- Multi-LLC sin holding
- Multi-LLC + Holding
- Otra"

**EV-2**: "¿Desde hace cuánto está corriendo esta estructura? (meses/años)"

**EV-3**: "¿Qué eventos se avecinan en los próximos 12 meses?
- [ ] Primer cliente LATAM con factura formal
- [ ] Primer empleado formal local
- [ ] Round de VC planeado (pre-seed/seed con SAFE)
- [ ] Round priced Series A+
- [ ] Expansión a nuevo país
- [ ] Exit conversation iniciado (acquisition)
- [ ] Regulación sectorial nueva (fintech, salud, etc.)
- [ ] Founder planea mudarse físicamente
- [ ] Ninguno previsto"

### Paso 2 — Identificar ruta(s) aplicable(s)

Basado en estructura actual + eventos previstos, identificar qué rutas activar:

- Skip-CR + primer cliente LATAM formal → Ruta 1 (Tostada)
- Tostada + term sheet Series A → Ruta 2 (Cayman Sandwich)
- Tostada + exit US imminent → Ruta 3 (C-Corp)
- Single-LLC + venture $10k MRR → Ruta 4 (Multi-LLC)
- Multi-LLC + primer term sheet → Ruta 5 (Multi-LLC + Holding)
- Cualquiera + founder quiere EU → Ruta 6 (Portugal)

### Paso 3 — Roadmap document

Generar `./portfolio/{name}/structure-evolution-roadmap.md` con:

```markdown
# Structure Evolution Roadmap

## Estado actual (YYYY-MM-DD)

- Estructura: [current]
- Tiempo operando: [X meses/años]
- Próximo milestone esperado: [event]

## Migraciones potenciales ordenadas por probabilidad

### 1. [Migration] — Probabilidad: Alta / Media / Baja

- **Trigger que activaría**: [específico]
- **Timing estimado**: [rango temporal]
- **Costo estimado**: $X
- **Tiempo de ejecución**: [semanas]
- **Prep que debería hacerse YA para no sorprenderse cuando el trigger dispare**:
  1. [Prep step]
  2. [Prep step]

### 2. [Migration] — Probabilidad: Media

[...]

## Things to NOT do

- [Anti-pattern específico del caso, ej. "no hacer share swap a Cayman DESPUÉS del term sheet — cuesta 3x más"]
- [...]

## Abogados y proveedores a identificar antes de tiempo

Para estar listo cuando el trigger dispare:

- [ ] Abogado corporativo US (Delaware incorporation + 83(b)) — candidatos: Stripe Atlas legal, Clerky, Firstbase
- [ ] Abogado Cayman (si Ruta 2) — candidatos: Carey Olsen, Walkers, Maples
- [ ] Abogado local país OpCo (si Ruta 1) — candidatos: [jurisdiction-specific]
- [ ] CPA con transfer pricing expertise — candidatos: [jurisdiction-specific]

## Revisión trimestral

Este roadmap debe revisarse cada 3 meses. Los triggers pueden cambiar con la startup.

Próxima revisión: [fecha]
```

---

## Principios clave

- **La estructura actual NO es terminal** — todas las startups exitosas cambian de estructura 2-5 veces
- **Prep > react**: tener abogados, CPA y bank accounts pre-identificados ahorra semanas cuando el trigger dispara
- **Tax before legal**: cada migración tiene consecuencia fiscal — consultar CPA ANTES del abogado
- **Document IP assignments rigorously**: el error más común en Ruta 4 (Multi-LLC) es no asignar IP formally
- **Timing de Cayman es crítico**: Ruta 2 ANTES del term sheet, no después

## Integración con otras skills

- **`structure-decision`**: prerequisite — identifica la estructura actual y la siguiente recomendada
- **`jurisdiction-matrix`** (reference doc): provee datos de cada jurisdicción destino
- **`cap-table-per-venture`** (futuro skill): se invoca cuando Ruta 4 o 5 activan (cap tables nuevos)
- **`attached-fund-structure`** (futuro skill): para Ruta 5 avanzada (agregar fund a holding)

## Recursos

- Ver `references/jurisdiction-matrix.md` para costos y timing por jurisdicción
- [Latitud Formation](https://latitud.com) — servicio de setup para LATAM→US migrations
- [Carta](https://carta.com) — cap table management durante migrations
- [Stripe Atlas](https://stripe.com/atlas) — Delaware C-Corp conversion path más simple
