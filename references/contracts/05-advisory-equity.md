# Acuerdo de Asesoria Tecnologica y Compensacion en Equity (Advisory + Equity Agreement)

> **AVISO LEGAL / LEGAL DISCLAIMER**
>
> Este documento es una plantilla de referencia y NO constituye asesoramiento legal.
> Ambas partes deben consultar con un abogado antes de firmar. Las leyes de Costa Rica
> sobre propiedad intelectual, contratos mercantiles y participacion accionaria pueden
> requerir clausulas adicionales segun la estructura juridica del emprendimiento
> (S.A., S.R.L., sociedad de hecho, etc.).
>
> This template is for reference only and does NOT constitute legal advice.

---

## Tabla de Referencia: Benchmarks de Equity (2025-2026)

| Rol (Role) | Etapa (Stage) | Horas/semana | Rango de Equity |
|---|---|---|---|
| Co-fundador tecnico (Technical co-founder) | Pre-idea | Full-time | 10-20% |
| Primer hire tecnico, construye MVP (First tech hire) | Pre-seed | Full-time | 3-5% |
| CTO Fraccional (Fractional CTO, part-time) | Pre-seed | 10-15h | 2-3.5% |
| Asesor tecnico (Technical advisor) | Seed+ | 2-5h | 0.25-1% |

> Rangos consistentes con Y Combinator, Carta y Holloway Guide (2025-2026).
> El porcentaje final depende del involucramiento, experiencia y traccion.

---

## 0. Reconocimiento de Riesgo Compartido / Shared Risk Acknowledgment

Ambas partes reconocen y aceptan que:

1. **{STARTUP_NAME}** es un emprendimiento de base tecnologica y **DE ALTO RIESGO**
   que no esta en capacidad financiera de pagar una tarifa de mercado por
   servicios de CTO.

2. El CTO acepta ofrecer sus servicios bajo este modelo de riesgo compartido,
   entendiendo que la compensacion esta vinculada al exito del emprendimiento.

3. Este acuerdo **NO** constituye relacion laboral, sociedad, ni joint venture.
   El CTO opera como contratista independiente (persona fisica).

4. El CTO puede prestar servicios a otros clientes y emprendimientos
   simultaneamente.

5. Cualquiera de las partes puede terminar este acuerdo en cualquier momento
   con **{DIAS_NOTIFICACION}** dias de notificacion escrita.

### Modelo Seleccionado (Selected Model)

- [ ] **Modelo D — Sweat Equity + Retainer Minimo**
  - Retainer: **{MONTO} {MONEDA}/mes** (minimo para cubrir costos operativos)
  - Equity: **{EQUITY_PORCENTAJE}%** fully diluted
  - Vesting: **{VESTING_ANOS}** anos, cliff **{CLIFF_ANOS}** ano(s)
  - Milestone acceleration: **{CONDICION_MILESTONE}** --> +**{ACELERACION_PORCENTAJE}%**

- [ ] **Modelo E — Equity Puro (Pure Equity)**
  - $0 cash
  - Equity: **{EQUITY_PORCENTAJE}%** fully diluted
  - Vesting: **{VESTING_ANOS}** anos, cliff **{CLIFF_ANOS}** ano(s)
  - Milestone acceleration: **{CONDICION_MILESTONE}** --> +**{ACELERACION_PORCENTAJE}%**
  - Reverse vesting: si el CTO no cumple **{CONDICION_PERFORMANCE}**, el equity
    no consolidado (unvested) se devuelve al pool de la empresa.

---

## 1. Partes / Parties

**El Emprendimiento (The Startup):**
- Nombre legal: {STARTUP_RAZON_SOCIAL} | Cedula juridica: {STARTUP_CEDULA_JURIDICA}
- Representante legal: {STARTUP_REPRESENTANTE_LEGAL} | Cedula: {STARTUP_CEDULA_REPRESENTANTE}
- Direccion: {STARTUP_DIRECCION} | Email: {STARTUP_EMAIL}

**El CTO Fraccional (The Fractional CTO):**
- Nombre: {CTO_NOMBRE_COMPLETO} | Cedula: {CTO_CEDULA}
- Direccion: {CTO_DIRECCION} | Email: {CTO_EMAIL}

El CTO opera como persona fisica (contratista independiente), no como empleado.

---

## 2. Contexto / Background

2.1. El Emprendimiento desarrolla **{DESCRIPCION_PRODUCTO}**, en la vertical
de **{VERTICAL_INDUSTRIA}**, en etapa **{ETAPA}** (pre-seed / seed).

2.2. No cuenta con recursos para contratar un CTO a tiempo completo ni pagar
tarifas de mercado por consultoria tecnologica.

2.3. El CTO posee experiencia en **{AREAS_EXPERIENCIA_CTO}** y acepta aportar
sus conocimientos bajo compensacion basada en equity, asumiendo el riesgo
inherente de un emprendimiento en etapa temprana.

---

## 3. Servicios del CTO / CTO Services

**3.1 Arquitectura y estrategia tecnica (Technical Architecture & Strategy)**
- Definicion de arquitectura, technology stack y roadmap tecnico
- Documentacion de decisiones tecnicas (ADRs)

**3.2 Guia o construccion del MVP (MVP Development)**
- {SELECCIONAR}: Guia y supervision / Desarrollo directo (hands-on)
- Alcance tecnico del MVP, criterios de aceptacion, code reviews

**3.3 Seleccion del Technology Stack**
- Evaluacion por costo, escalabilidad, talento disponible y mantenibilidad

**3.4 Criterios de contratacion tecnica (Team Hiring Criteria)**
- Perfiles tecnicos, participacion en entrevistas, guias de onboarding

**3.5 Compromiso de tiempo (Time Commitment)**
- Minimo **{HORAS_MES}** horas/mes, distribucion flexible coordinada semanalmente
- Horas adicionales con **{DIAS_AVISO_EXTRA}** dias de anticipacion por escrito

---

## 4. Terminos de Equity / Equity Terms

### 4.1 Porcentaje (Percentage)
**{EQUITY_PORCENTAJE}%** del capital fully diluted (todas las acciones emitidas,
opciones, warrants e instrumentos convertibles), sujeto al vesting.

### 4.2 Calendario de Vesting (Vesting Schedule)
- Periodo total: **{VESTING_ANOS}** anos | Inicio: **{FECHA_INICIO_VESTING}**
- Vesting mensual en partes iguales despues del cliff

### 4.3 Cliff
- **{CLIFF_ANOS}** ano(s) — si el CTO sale antes del cliff, recibe $0 en equity
- Al completar el cliff, se consolida el equity del periodo transcurrido

### 4.4 Eventos de Aceleracion (Acceleration Events)

**a) Single Trigger (Acquisition):** adquisicion o cambio de control -->
50% del equity unvested se acelera.

**b) Milestone:** al cumplirse **{CONDICION_MILESTONE}** --> +**{ACELERACION_PORCENTAJE}%**
fully diluted. Ejemplos: cierre de ronda >= {MONTO_RONDA}, alcanzar
{NUMERO_USUARIOS} usuarios activos, generar {MONTO_REVENUE} MRR.

**c) Terminacion sin causa:** **{MESES_ACELERACION}** meses adicionales de vesting.

### 4.5 Reverse Vesting
Equity unvested regresa al pool ante: terminacion, renuncia, o incumplimiento
de condiciones de performance (Modelo E). **Equity vested permanece siempre con el CTO.**

### 4.6 Proteccion Anti-dilucion (Anti-dilution)
Proteccion proporcional estandar: el CTO puede participar proporcionalmente
en futuras rondas para mantener su porcentaje (opcion, no obligacion).

### 4.7 Derecho de Preferencia (ROFR)
Si el CTO desea vender shares vested, el Emprendimiento tiene **{DIAS_ROFR}**
dias habiles de derecho de primera oferta en los mismos terminos.

---

## 5. Propiedad Intelectual / Intellectual Property (IP)

**5.1 Work Product:** Todo codigo, documentacion, disenos y arquitecturas
creados como parte de los servicios (Seccion 3) --> propiedad exclusiva del
Emprendimiento. El CTO cede (assigns) todos los derechos de PI.

**5.2 IP preexistente (Pre-existing CTO IP):** IP desarrollada antes de este
acuerdo permanece como propiedad del CTO. Se otorga licencia
**{TIPO_LICENCIA_PREEXISTENTE}** (exclusiva / no exclusiva) al Emprendimiento.

**5.3 Repositorios existentes (Existing Repos/Codebases):**
Si el CTO aporta un repo o codebase existente:
- Repo: **{NOMBRE_REPO_EXISTENTE}** | Licencia: **{TIPO_LICENCIA_REPO}**
  - [ ] Exclusiva | [ ] No exclusiva
- Alcance: **{ALCANCE_LICENCIA}** | Duracion: **{DURACION_LICENCIA}**

> Si no se aporta IP preexistente, indicar "N/A". Documentar desde el inicio.

**5.4 Herramientas genericas:** El CTO retiene el derecho de usar herramientas,
scripts y metodologias genericas que no contengan informacion confidencial
ni codigo especifico del producto.

---

## 6. Confidencialidad / Confidentiality

Ambas partes mantendran en estricta confidencialidad toda informacion tecnica,
comercial, financiera y estrategica, incluyendo: codigo fuente, datos de
usuarios, planes de negocio, terminos de este acuerdo y rondas de inversion.

**Excepciones:** Informacion de dominio publico, conocida previamente, requerida
por ley, o revelada con consentimiento escrito.

**Duracion:** Las obligaciones sobreviven **{ANOS_CONFIDENCIALIDAD}** anos
post-terminacion.

---

## 7. No-Competencia / Non-Compete

**7.1 Alcance limitado (Narrow Scope):**
El CTO no desarrollara, co-fundara ni asesorara un producto directamente
competidor en **{VERTICAL_INDUSTRIA}** durante la vigencia y por
**{MESES_NO_COMPETE}** meses post-terminacion.

**7.2 Lo que NO restringe:**
- Consultoria en cualquier otra vertical o industria
- CTO fraccional para emprendimientos no competidores
- Proyectos personales, open source o comerciales no relacionados
- Empleo en organizaciones que no compitan directamente

> **Espiritu:** Proteger al Emprendimiento de conflicto de interes directo,
> no limitar la actividad profesional del CTO.

---

## 8. Representaciones / Representations

**8.1 El Emprendimiento** declara que: (a) tiene autoridad para celebrar este
acuerdo y otorgar el equity; (b) las acciones seran validamente emitidas
(validly issued), fully paid y non-assessable; (c) el cap table (Anexo A) es
preciso y completo; (d) no existen restricciones que impidan la emision;
(e) notificara cambios materiales al cap table en **{DIAS_NOTIFICACION_CAPTABLE}** dias.

**8.2 El CTO** declara que: (a) el trabajo sera original y no infringira
derechos de terceros; (b) no existen restricciones que impidan prestar los
servicios ni ceder la PI; (c) la IP preexistente aportada esta debidamente
identificada; (d) no tiene acuerdos de no-competencia vigentes en conflicto.

---

## 9. Terminacion / Termination

**9.1 Por cualquiera de las partes:** **{DIAS_NOTIFICACION}** dias de
notificacion escrita al correo registrado.

**9.2 Con causa justificada (For Cause):** incumplimiento material no subsanado
en **{DIAS_SUBSANACION}** dias, fraude, conducta ilegal, o violacion de
confidencialidad/PI.

**9.3 Efecto:**
- Equity vested --> permanece con el CTO, no se revoca
- Equity unvested --> regresa al pool de la empresa
- Terminacion sin causa --> aplica aceleracion (Seccion 4.4c)

**9.4 Obligaciones que sobreviven:** (a) Transferencia de conocimiento: hasta
**{HORAS_TRANSICION}** horas durante el periodo de notificacion;
(b) Confidencialidad; (c) No-Competencia; (d) PI; (e) Representaciones.

---

## 10. Ley Aplicable / Governing Law

**10.1** Este acuerdo se rige por las leyes de la Republica de Costa Rica.

**10.2 Resolucion de disputas:** (a) Negociacion directa por **{DIAS_NEGOCIACION}**
dias; (b) Mediacion ante **{CENTRO_MEDIACION}**; (c) Arbitraje vinculante
bajo reglas de **{CENTRO_ARBITRAJE}**.

**10.3** En caso de discrepancia, prevalece la version en **espanol**.

---

## 11. Firmas / Signatures

Firmado en **{CIUDAD}**, Costa Rica, el **{DIA}** de **{MES}** de **{ANO}**.

**Por el Emprendimiento:**

Firma: ________________________________________ Fecha: ___/___/______

Nombre: {STARTUP_REPRESENTANTE_LEGAL} | Cedula: {STARTUP_CEDULA_REPRESENTANTE}

Cargo: {CARGO_REPRESENTANTE}

**El CTO:**

Firma: ________________________________________ Fecha: ___/___/______

Nombre: {CTO_NOMBRE_COMPLETO} | Cedula: {CTO_CEDULA}

---

## Anexos / Attachments

- **Anexo A:** Cap Table a la fecha de firma
- **Anexo B:** IP preexistente del CTO (si aplica)
- **Anexo C:** Milestones para aceleracion de equity
- **Anexo D:** Calendario de vesting detallado

---

## Indice de Placeholders / Placeholder Index

| Placeholder | Descripcion | Ejemplo |
|---|---|---|
| `{STARTUP_NAME}` | Nombre comercial | MiStartup |
| `{STARTUP_RAZON_SOCIAL}` | Razon social | MiStartup S.R.L. |
| `{STARTUP_CEDULA_JURIDICA}` | Cedula juridica | 3-102-XXXXXX |
| `{STARTUP_REPRESENTANTE_LEGAL}` | Representante legal | Juan Perez |
| `{STARTUP_CEDULA_REPRESENTANTE}` | Cedula representante | 1-XXXX-XXXX |
| `{STARTUP_DIRECCION}` | Direccion | San Jose, Costa Rica |
| `{STARTUP_EMAIL}` | Email | ceo@mistartup.com |
| `{CTO_NOMBRE_COMPLETO}` | Nombre del CTO | Maria Rodriguez |
| `{CTO_CEDULA}` | Cedula del CTO | 1-XXXX-XXXX |
| `{CTO_DIRECCION}` | Direccion del CTO | Heredia, Costa Rica |
| `{CTO_EMAIL}` | Email del CTO | cto@email.com |
| `{DESCRIPCION_PRODUCTO}` | Producto | Plataforma de gestion X |
| `{VERTICAL_INDUSTRIA}` | Vertical | Fintech, Healthtech |
| `{ETAPA}` | Etapa | Pre-seed |
| `{AREAS_EXPERIENCIA_CTO}` | Expertise del CTO | Cloud, mobile, AI |
| `{EQUITY_PORCENTAJE}` | % equity | 2.5 |
| `{VESTING_ANOS}` / `{VESTING_MESES}` | Periodo de vesting | 4 anos / 48 meses |
| `{CLIFF_ANOS}` / `{CLIFF_MESES}` | Periodo de cliff | 1 ano / 12 meses |
| `{FECHA_INICIO_VESTING}` | Inicio del vesting | 2026-01-01 |
| `{CONDICION_MILESTONE}` | Milestone de aceleracion | Cierre de ronda seed |
| `{ACELERACION_PORCENTAJE}` | % adicional | 0.5 |
| `{MESES_ACELERACION}` | Meses aceleracion sin causa | 6 |
| `{MONTO}` / `{MONEDA}` | Retainer (Modelo D) | 500 / USD |
| `{CONDICION_PERFORMANCE}` | Performance (Modelo E) | 15h/semana minimo |
| `{HORAS_MES}` | Horas mensuales | 60 |
| `{DIAS_AVISO_EXTRA}` | Aviso horas extra | 5 |
| `{DIAS_NOTIFICACION}` | Aviso terminacion | 30 |
| `{DIAS_SUBSANACION}` | Plazo subsanacion | 15 |
| `{DIAS_ROFR}` | Plazo ROFR | 30 |
| `{DIAS_NOTIFICACION_CAPTABLE}` | Aviso cambios cap table | 15 |
| `{ANOS_CONFIDENCIALIDAD}` | Confidencialidad post | 3 |
| `{MESES_NO_COMPETE}` | No-compete post | 12 |
| `{HORAS_TRANSICION}` | Knowledge transfer | 20 |
| `{DIAS_NEGOCIACION}` | Negociacion directa | 30 |
| `{CENTRO_MEDIACION}` / `{CENTRO_ARBITRAJE}` | Centro de resolucion | Camara de Comercio CR |
| `{TIPO_LICENCIA_PREEXISTENTE}` | Licencia IP preexistente | No exclusiva |
| `{NOMBRE_REPO_EXISTENTE}` | Repo aportado | N/A |
| `{TIPO_LICENCIA_REPO}` / `{ALCANCE_LICENCIA}` / `{DURACION_LICENCIA}` | Licencia repo | N/A / N/A / Perpetua |
| `{SELECCIONAR}` | Guia vs hands-on | Desarrollo directo |
| `{CIUDAD}` / `{DIA}` / `{MES}` / `{ANO}` | Firma | San Jose / 15 / enero / 2026 |
| `{CARGO_REPRESENTANTE}` | Cargo representante | CEO |
| `{MONTO_RONDA}` / `{NUMERO_USUARIOS}` / `{MONTO_REVENUE}` | Milestones | $500K / 10K / $5K MRR |
