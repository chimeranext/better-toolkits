# Acuerdo Especifico de Proyecto / Project-Specific Agreement (PSA)

> **AVISO LEGAL / LEGAL DISCLAIMER**
>
> Este documento es una plantilla de referencia y NO constituye asesoramiento legal.
> Fue disenado como punto de partida para negociaciones entre partes. Antes de firmar,
> ambas partes deben consultar con un abogado calificado en la jurisdiccion aplicable.
> El autor de esta plantilla no asume responsabilidad alguna por su uso.
>
> This document is a reference template and does NOT constitute legal advice.
> It was designed as a starting point for negotiations between parties. Before signing,
> both parties should consult with a qualified attorney in the applicable jurisdiction.
> The author of this template assumes no liability for its use.

---

**Numero de Proyecto / Project Number:** {PROJECT_ID}
**Fecha de Emision / Issue Date:** {FECHA}
**Version:** {VERSION}

---

## 0. Modelo de Compensacion y Riesgo Compartido (Compensation & Risk-Sharing Model)

> Marque una unica opcion. El modelo seleccionado define los terminos financieros
> de las Secciones 5 y 6.

- [ ] **Modelo A — Tarifa Fija (Fixed Fee)**

  Inversion total: **{MONTO_A}** {MONEDA}
  Estructura de pago: **{X_A_FIRMA}%** al firmar, **{Y_A_ENTREGA}%** al aceptar entregables.

- [ ] **Modelo B — Tarifa Reducida + Bono por Exito (Reduced Fee + Success Bonus)**

  Tarifa reducida: **{MONTO_REDUCIDO_B}** {MONEDA} ({X_B_PORCENTAJE}% de tarifa de mercado)
  Bono por exito (Success Bonus): **{MONTO_BONO_B}** {MONEDA} al cumplirse: _{MILESTONE_DESCRIPTION_B}_
  Estructura de pago tarifa: **{X_B_FIRMA}%** al firmar, **{Y_B_ENTREGA}%** al aceptar entregables.
  Pago del bono: dentro de **{DIAS_BONO_B}** dias habiles posteriores al cumplimiento verificable del milestone.

- [ ] **Modelo C — 50/50 Split (Tarifa + Equity)**

  Tarifa: **{MONTO_C}** {MONEDA} (50% de tarifa de mercado)
  Equity: **{X_C_EQUITY}%** fully diluted, vesting **{ANOS_VESTING_C}** anos, cliff **{ANOS_CLIFF_C}** ano.
  Milestone acceleration: _{CONDICION_ACELERACION_C}_ → +**{X_C_ADICIONAL}%** adicional.

> **Nota:** Si se selecciona Modelo C, las partes firmaran un addendum de equity
> (Stock Option Agreement o Participation Agreement) dentro de los **{DIAS_ADDENDUM}**
> dias habiles posteriores a la firma de este PSA.

---

## 1. Partes (Parties)

**EL CLIENTE (The Client):**

| Campo | Detalle |
|---|---|
| Razon Social / Legal Name | {CLIENTE_RAZON_SOCIAL} |
| Cedula Juridica / Tax ID | {CLIENTE_CEDULA_JURIDICA} |
| Representante Legal | {CLIENTE_REPRESENTANTE} |
| Cedula de Identidad | {CLIENTE_CEDULA_REPRESENTANTE} |
| Cargo / Title | {CLIENTE_CARGO} |
| Domicilio / Address | {CLIENTE_DOMICILIO} |
| Correo de Contacto | {CLIENTE_EMAIL} |
| Telefono | {CLIENTE_TELEFONO} |

En adelante denominado **"El Cliente"**.

**EL CONSULTOR (The Consultant):**

| Campo | Detalle |
|---|---|
| Nombre Completo / Full Name | {CONSULTOR_NOMBRE} |
| Cedula de Identidad / ID | {CONSULTOR_CEDULA} |
| Domicilio / Address | {CONSULTOR_DOMICILIO} |
| Correo de Contacto | {CONSULTOR_EMAIL} |
| Telefono | {CONSULTOR_TELEFONO} |

Persona fisica que opera como consultor independiente de tecnologia (Fractional CTO).
En adelante denominado **"El Consultor"**.

Individualmente una **"Parte"** y conjuntamente las **"Partes"**.

---

## 2. Contexto y Relacion (Background & Partnership Context)

2.1. El Cliente es {DESCRIPCION_CLIENTE}, con necesidad de {NECESIDAD_GENERAL}.

2.2. El Consultor cuenta con experiencia en {AREAS_EXPERIENCIA_CONSULTOR} y ha sido
seleccionado para ejecutar el proyecto descrito en este PSA.

2.3. Este PSA se ejecuta {SELECCIONAR_UNO: como acuerdo independiente / bajo el
Marco de Servicios (MSA) firmado el {FECHA_MSA}, referencia {REF_MSA}}.

2.4. Las Partes reconocen que esta relacion es de naturaleza colaborativa (partnership
mindset) y que el exito del proyecto depende de la participacion activa de ambas partes
segun lo descrito en este documento.

---

## 3. Alcance de Trabajo — Entregables (Scope of Work — Deliverables)

### 3.1. Descripcion General del Proyecto (Project Description)

{DESCRIPCION_DETALLADA_PROYECTO}

### 3.2. Entregables (Deliverables)

| # | Entregable (Deliverable) | Descripcion | Incluido / Tarifa (Included / Rate) |
|---|---|---|---|
| E-01 | {ENTREGABLE_01} | {DESCRIPCION_E01} | {INCLUIDO_O_TARIFA_E01} |
| E-02 | {ENTREGABLE_02} | {DESCRIPCION_E02} | {INCLUIDO_O_TARIFA_E02} |
| E-03 | {ENTREGABLE_03} | {DESCRIPCION_E03} | {INCLUIDO_O_TARIFA_E03} |
| E-04 | {ENTREGABLE_04} | {DESCRIPCION_E04} | {INCLUIDO_O_TARIFA_E04} |
| E-05 | {ENTREGABLE_05} | {DESCRIPCION_E05} | {INCLUIDO_O_TARIFA_E05} |

> Agregar o eliminar filas segun corresponda.

### 3.3. Exclusiones Explicitas (Out of Scope)

Lo siguiente queda **explicitamente fuera del alcance** de este PSA:

- {EXCLUSION_01}
- {EXCLUSION_02}
- {EXCLUSION_03}

Cualquier trabajo fuera de este alcance requerira un addendum escrito firmado por ambas
Partes o un nuevo PSA.

### 3.4. Supuestos y Dependencias (Assumptions & Dependencies)

El Consultor basa sus estimaciones en los siguientes supuestos. Si alguno resulta
incorrecto, las Partes renegociaran cronograma y/o inversion de buena fe:

- {SUPUESTO_01}
- {SUPUESTO_02}
- {DEPENDENCIA_01_DEL_CLIENTE}

---

## 4. Propiedad Intelectual, IP e Infraestructura (Ownership, IP & Infrastructure Control)

### 4.1. Codigo e IP (Code & IP)

Todo codigo fuente, documentacion, diagramas, configuraciones y demas material creado
por el Consultor **en el marco de este PSA** (los "Entregables") sera propiedad exclusiva
del Cliente una vez completado el pago correspondiente al entregable. El Consultor cede
(assigns) todos los derechos patrimoniales de autor y propiedad intelectual al Cliente
de forma irrevocable.

El Consultor retiene el derecho de utilizar conocimientos generales, tecnicas,
metodologias y know-how (collectively, "Conocimiento General") adquiridos durante la
ejecucion, siempre que no revelen informacion confidencial del Cliente.

### 4.2. Infraestructura (Infrastructure)

Todas las cuentas de infraestructura (cloud, repositorios, dominios, servicios de
terceros) seran creadas **a nombre del Cliente desde el Dia 1**, utilizando credenciales
y metodos de pago del Cliente. El Consultor tendra acceso como administrador delegado
durante la ejecucion y dicho acceso sera revocado al completar la Transferencia de
Conocimiento (Seccion 10).

### 4.3. Datos (Data)

Todos los datos generados, recopilados o procesados en el marco de este proyecto son
propiedad exclusiva del Cliente. El Consultor no retendra copias de datos del Cliente
mas alla de lo necesario para la ejecucion del proyecto, y eliminara de forma segura
cualquier copia remanente dentro de los **{DIAS_ELIMINACION_DATOS}** dias habiles
posteriores a la finalizacion o terminacion del proyecto.

### 4.4. Principio de No Dependencia (No Vendor Lock-in)

El Consultor se compromete a:

- No introducir dependencias propietarias del Consultor en el codigo.
- Utilizar tecnologias de codigo abierto o licencias comerciales estandar del mercado.
- Generar codigo portable que no requiera la participacion del Consultor para su
  operacion, modificacion o extension.
- Documentar todas las decisiones arquitectonicas en un Architecture Decision Record
  (ADR) o formato equivalente.

---

## 5. Inversion y Terminos de Pago (Investment & Payment Terms)

### 5.1. Monto y Estructura

Segun el Modelo seleccionado en la **Seccion 0**:

| Concepto | Monto | Condicion de Pago |
|---|---|---|
| {CONCEPTO_PAGO_01} | {MONTO_PAGO_01} {MONEDA} | {CONDICION_PAGO_01} |
| {CONCEPTO_PAGO_02} | {MONTO_PAGO_02} {MONEDA} | {CONDICION_PAGO_02} |
| {CONCEPTO_PAGO_03} | {MONTO_PAGO_03} {MONEDA} | {CONDICION_PAGO_03} |
| **Total** | **{MONTO_TOTAL} {MONEDA}** | |

### 5.2. Metodo de Pago (Payment Method)

Transferencia bancaria a:

| Detalle | Valor |
|---|---|
| Banco | {BANCO_CONSULTOR} |
| Titular | {TITULAR_CUENTA} |
| IBAN / Cuenta | {IBAN_CONSULTOR} |
| Moneda | {MONEDA_CUENTA} |

O mediante {METODO_ALTERNATIVO} segun acuerdo de las Partes.

### 5.3. Facturacion (Invoicing)

El Consultor emitira factura electronica conforme a la normativa del Ministerio de
Hacienda de Costa Rica dentro de los **{DIAS_FACTURACION}** dias habiles posteriores
a cada evento de pago. El Cliente realizara el pago dentro de los **{DIAS_PAGO}** dias
habiles posteriores a la recepcion de la factura.

### 5.4. Mora (Late Payment)

Pagos atrasados generaran un interes moratorio de **{TASA_MORA}%** mensual. Si el
atraso supera los **{DIAS_SUSPENSION}** dias habiles, el Consultor podra suspender la
ejecucion del proyecto mediante notificacion escrita, sin que esto constituya
incumplimiento de su parte.

---

## 6. Intercambio de Valor (Partnership Value Exchange)

> Esta seccion es **opcional** y aplica cuando las Partes acuerdan contraprestaciones
> no monetarias adicionales.

| Tipo de Valor | Descripcion | Condicion |
|---|---|---|
| Creditos para servicios futuros (Service credits) | {DESCRIPCION_CREDITOS} | {CONDICION_CREDITOS} |
| Visibilidad y referencia (Visibility & reference) | {DESCRIPCION_VISIBILIDAD} | {CONDICION_VISIBILIDAD} |
| Desbloqueo de fases (Phase unlock) | {DESCRIPCION_FASES} | {CONDICION_FASES} |
| {OTRO_VALOR} | {DESCRIPCION_OTRO} | {CONDICION_OTRO} |

> Si esta seccion no aplica, indicar "No aplica" y eliminar la tabla.

---

## 7. Cronograma y Milestones (Timeline & Milestones)

### 7.1. Duracion Estimada del Proyecto (Estimated Duration)

Fecha de inicio: **{FECHA_INICIO}**
Fecha estimada de finalizacion: **{FECHA_FIN}**
Duracion total estimada: **{DURACION}** semanas / meses.

### 7.2. Milestones

| # | Milestone | Entregables Asociados | Fecha Objetivo (Target Date) | Pago Asociado |
|---|---|---|---|---|
| M-01 | {MILESTONE_01} | E-01, E-02 | {FECHA_M01} | {PAGO_M01} |
| M-02 | {MILESTONE_02} | E-03 | {FECHA_M02} | {PAGO_M02} |
| M-03 | {MILESTONE_03} | E-04, E-05 | {FECHA_M03} | {PAGO_M03} |
| M-04 | Transferencia de Conocimiento (Knowledge Transfer) | Documentacion + sesiones | {FECHA_M04} | Incluido |

> Agregar o eliminar filas segun corresponda.

### 7.3. Reuniones de Seguimiento (Status Meetings)

Las Partes realizaran reuniones de seguimiento cada **{FRECUENCIA_REUNIONES}**
mediante {MEDIO_REUNIONES}. El Consultor proporcionara un reporte breve de avance
antes de cada reunion.

---

## 8. Atrasos (Delays)

8.1. **Atrasos del Consultor:** Si el Consultor anticipa un atraso respecto a un
Milestone, debera notificar al Cliente con al menos **{DIAS_AVISO_ATRASO}** dias
habiles de anticipacion, indicando la causa y una nueva fecha estimada. Si el atraso
es atribuible al Consultor y supera los **{DIAS_ATRASO_MAXIMO}** dias habiles,
el Cliente podra {PENALIDAD_O_RESCISION}.

8.2. **Atrasos del Cliente:** Si el Cliente no proporciona accesos, informacion,
aprobaciones u otros insumos necesarios dentro de los plazos acordados, los Milestones
afectados se desplazaran dia por dia de forma automatica. Si el bloqueo del Cliente
supera los **{DIAS_BLOQUEO_CLIENTE}** dias habiles consecutivos, el Consultor podra
solicitar una renegociacion de cronograma e inversion.

8.3. **Fuerza Mayor (Force Majeure):** Ninguna Parte sera responsable por atrasos
causados por eventos fuera de su control razonable, incluyendo pero no limitado a
desastres naturales, pandemias, acciones gubernamentales o interrupciones de servicios
de terceros. La Parte afectada debera notificar a la otra dentro de **5** dias habiles.

---

## 9. Proceso de Aceptacion (Deliverable Acceptance Process)

9.1. Al completar cada Entregable o Milestone, el Consultor notificara al Cliente por
escrito (correo electronico es suficiente) y proporcionara las instrucciones de
verificacion correspondientes.

9.2. El Cliente tendra **{DIAS_REVISION}** dias habiles (minimo 5, maximo 10) para
revisar el Entregable y emitir:

- **(a) Aceptacion (Acceptance):** confirmacion escrita de conformidad; o
- **(b) Observaciones (Feedback):** lista detallada y especifica de no conformidades
  respecto a los criterios definidos en la Seccion 3.

9.3. Si el Cliente no emite respuesta dentro del periodo de revision, el Entregable se
considerara **aceptado tacitamente (deemed accepted)**.

9.4. Si el Cliente emite Observaciones, el Consultor realizara las correcciones dentro
de **{DIAS_CORRECCION}** dias habiles. Habra un maximo de **{RONDAS_CORRECCION}**
rondas de correccion incluidas. Rondas adicionales se cotizaran por separado.

9.5. La aceptacion de un Entregable activa la obligacion de pago correspondiente segun
la Seccion 5.

---

## 10. Transferencia de Conocimiento (Knowledge Transfer & Documentation)

10.1. El Consultor entregara la siguiente documentacion al finalizar el proyecto:

- **README y guias de configuracion** (README & setup guides) para cada repositorio.
- **Documentacion arquitectonica** (Architecture documentation): diagramas C4 o
  equivalente, ADRs.
- **Runbooks operacionales** (Operational runbooks): procedimientos de despliegue,
  monitoreo, respuesta a incidentes.
- **Inventario de accesos** (Access inventory): lista completa de cuentas, servicios,
  credenciales y permisos concedidos.
- {DOCUMENTACION_ADICIONAL}

10.2. El Consultor realizara al menos **{CANTIDAD_SESIONES_KT}** sesiones de
transferencia de conocimiento (cada una de al menos **{DURACION_SESION_KT}** minutos)
con el equipo designado por el Cliente. Estas sesiones seran grabadas con autorizacion
de las Partes.

10.3. Una vez completada la Transferencia de Conocimiento, el Consultor revocara sus
accesos y confirmara por escrito que no retiene copias de codigo, datos o credenciales
del Cliente.

---

## 11. Soporte Post-Entrega (Support & SLA)

### 11.1. Periodo de Soporte (Support Period)

El Consultor proporcionara soporte posterior a la entrega durante **{DIAS_SOPORTE}**
dias calendario (por defecto: 60) contados a partir de la aceptacion del ultimo
Entregable. Este soporte cubre unicamente defectos (bugs) en el trabajo entregado,
no nuevas funcionalidades.

### 11.2. Tiempos de Respuesta (Response Times)

| Prioridad (Priority) | Descripcion | Tiempo de Respuesta (Response Time) | Tiempo de Resolucion Objetivo (Target Resolution) |
|---|---|---|---|
| **P1 — Critico (Critical)** | Sistema caido o datos en riesgo (System down or data at risk) | **{HORAS_RESPUESTA_P1}** horas habiles | **{HORAS_RESOLUCION_P1}** horas habiles |
| **P2 — Alto (High)** | Funcionalidad principal degradada (Core functionality degraded) | **{HORAS_RESPUESTA_P2}** horas habiles | **{HORAS_RESOLUCION_P2}** horas habiles |
| **P3 — Normal** | Defecto menor, workaround disponible (Minor bug, workaround available) | **{HORAS_RESPUESTA_P3}** horas habiles | **{HORAS_RESOLUCION_P3}** dias habiles |

### 11.3. Canal de Soporte (Support Channel)

Las solicitudes de soporte se canalizaran exclusivamente a traves de
**{CANAL_SOPORTE}** (ejemplo: correo electronico, sistema de tickets, canal de Slack).

### 11.4. Soporte Extendido (Extended Support)

Una vez finalizado el Periodo de Soporte, el Cliente podra contratar soporte extendido
bajo un acuerdo separado a la tarifa de **{TARIFA_SOPORTE_EXTENDIDO}** {MONEDA} por
hora.

---

## 12. Confidencialidad (Confidentiality)

12.1. **Informacion Confidencial (Confidential Information):** Se considera
Informacion Confidencial toda informacion tecnica, comercial, financiera, estrategica
o de cualquier otra indole que una Parte (la "Parte Divulgadora") revele a la otra
(la "Parte Receptora") en el marco de este PSA, ya sea de forma oral, escrita,
electronica o visual, y que razonablemente deba entenderse como confidencial por su
naturaleza o contexto.

12.2. **Obligaciones:** La Parte Receptora se compromete a:

- Utilizar la Informacion Confidencial unicamente para los fines de este PSA.
- No divulgar la Informacion Confidencial a terceros sin consentimiento previo escrito.
- Proteger la Informacion Confidencial con al menos el mismo grado de cuidado que
  utiliza para su propia informacion confidencial, y en ningun caso con un grado
  inferior al razonable.

12.3. **Exclusiones:** No se considerara Informacion Confidencial aquella que:

- (a) Sea o se convierta en de dominio publico sin culpa de la Parte Receptora.
- (b) Estuviera en posesion de la Parte Receptora antes de su divulgacion.
- (c) Sea recibida legitimamente de un tercero sin obligacion de confidencialidad.
- (d) Sea desarrollada independientemente sin uso de la Informacion Confidencial.
- (e) Deba ser divulgada por orden judicial o requerimiento legal, previa notificacion
  a la Parte Divulgadora cuando sea legalmente posible.

12.4. **Supervivencia (Survival):** Las obligaciones de esta seccion sobreviviran
la terminacion o expiracion de este PSA por un periodo de **2 (dos) anos**.

---

## 13. Representaciones y Garantias (Representations & Warranties)

13.1. **El Consultor declara y garantiza que:**

- (a) Tiene la capacidad legal y tecnica para ejecutar los servicios descritos.
- (b) Todo el codigo y material entregado sera **trabajo original** o utilizara
  componentes debidamente licenciados (open source o licencias comerciales validas).
- (c) Los Entregables no contendran **malware, virus, puertas traseras (backdoors),
  ni codigo malicioso** de ninguna naturaleza.
- (d) Los Entregables no infringiran derechos de propiedad intelectual de terceros,
  segun su leal saber y entender.
- (e) Cumplira con las leyes y regulaciones aplicables en Costa Rica.

13.2. **El Cliente declara y garantiza que:**

- (a) Tiene la autoridad legal para firmar este PSA y cumplir con sus obligaciones.
- (b) Proporcionara los accesos, informacion y recursos necesarios en tiempo oportuno.
- (c) Cuenta con los derechos necesarios sobre los datos y materiales proporcionados
  al Consultor.

13.3. **Descargo sobre inteligencia artificial (AI Disclosure):** El Consultor podra
utilizar herramientas de inteligencia artificial como asistentes de desarrollo (ej.
copilots, generadores de codigo). En todos los casos, el Consultor revisara, validara
y asumira responsabilidad por todo codigo entregado, independientemente de la
herramienta utilizada para su creacion.

---

## 14. Limitacion de Responsabilidad (Limitation of Liability)

14.1. **Tope de Responsabilidad (Liability Cap):** La responsabilidad total acumulada
del Consultor bajo este PSA, por cualquier causa y teoria legal, no excedera el
**monto total efectivamente pagado** por el Cliente al Consultor bajo este PSA.

14.2. **Exclusion de Danos Indirectos:** En ningun caso sera alguna de las Partes
responsable ante la otra por danos indirectos, incidentales, especiales, consecuentes
o punitivos, incluyendo pero no limitado a perdida de ganancias, perdida de datos o
interrupcion del negocio, incluso si la Parte ha sido advertida de la posibilidad de
dichos danos.

14.3. **Excepciones:** Las limitaciones de esta seccion **no aplican** a:

- (a) Incumplimiento de las obligaciones de confidencialidad (Seccion 12).
- (b) Infracciones de propiedad intelectual (Seccion 4).
- (c) Conducta dolosa o negligencia grave de cualquiera de las Partes.

---

## 15. Terminacion (Term & Termination)

15.1. **Vigencia (Term):** Este PSA entra en vigor en la Fecha de Emision y permanece
vigente hasta la aceptacion del ultimo Entregable y el cumplimiento de las obligaciones
de Soporte Post-Entrega y Transferencia de Conocimiento, o hasta su terminacion
anticipada segun esta seccion.

15.2. **Terminacion por Conveniencia (Termination for Convenience):** Cualquiera de las
Partes podra terminar este PSA sin causa mediante notificacion escrita con al menos
**30 (treinta)** dias calendario de anticipacion. En este caso:

- (a) El Cliente pagara al Consultor por todo el trabajo aceptado hasta la fecha de
  terminacion efectiva, mas los gastos no reembolsados debidamente incurridos.
- (b) El Consultor entregara todo el trabajo en progreso y la documentacion generada
  hasta la fecha.
- (c) Si el Consultor ha recibido pagos por Entregables aun no completados, las Partes
  negociaran de buena fe un ajuste proporcional.

15.3. **Terminacion por Causa (Termination for Cause):** Cualquiera de las Partes podra
terminar este PSA por incumplimiento material de la otra Parte, siempre que:

- (a) La Parte afectada notifique por escrito el incumplimiento especifico.
- (b) La Parte incumplidora tenga **10 (diez)** dias habiles para subsanar (cure
  period) desde la recepcion de dicha notificacion.
- (c) Si el incumplimiento no se subsana dentro del periodo de cura, la terminacion
  sera efectiva al dia habil siguiente.

15.4. **Efectos de la Terminacion (Effects):** Las siguientes secciones sobreviviran
la terminacion de este PSA: Seccion 4 (IP), Seccion 12 (Confidencialidad), Seccion 13
(Garantias), Seccion 14 (Limitacion de Responsabilidad) y Seccion 17 (Ley Aplicable).

---

## 16. Contratista Independiente (Independent Contractor)

16.1. El Consultor actua como **contratista independiente** (persona fisica) y no como
empleado, socio, agente o representante legal del Cliente.

16.2. Nada en este PSA crea una relacion laboral, asociacion, joint venture o relacion
de agencia entre las Partes. El Consultor no tendra derecho a beneficios laborales,
seguros, vacaciones ni prestaciones de ley correspondientes a empleados.

16.3. El Consultor es responsable de sus propias obligaciones tributarias ante la
Direccion General de Tributacion y de sus obligaciones ante la Caja Costarricense de
Seguro Social (CCSS) como trabajador independiente.

16.4. El Consultor podra subcontratar parte del trabajo previa **autorizacion escrita**
del Cliente. En caso de subcontratacion, el Consultor permanece como unico responsable
ante el Cliente por la calidad, plazos y confidencialidad del trabajo.

16.5. El Consultor retiene el derecho de prestar servicios a otros clientes durante la
vigencia de este PSA, siempre que no exista conflicto de intereses directo ni se
incumplan las obligaciones de confidencialidad.

---

## 17. Ley Aplicable y Resolucion de Disputas (Governing Law & Dispute Resolution)

17.1. **Ley Aplicable (Governing Law):** Este PSA se regira e interpretara conforme a
las leyes de la **Republica de Costa Rica**.

17.2. **Negociacion (Negotiation):** Las Partes se comprometen a intentar resolver
cualquier controversia derivada de este PSA de buena fe mediante negociacion directa
durante un periodo de **15 (quince)** dias habiles.

17.3. **Arbitraje (Arbitration):** Si la controversia no se resuelve mediante
negociacion, sera sometida a arbitraje administrado por el **Centro de Conciliacion y
Arbitraje de la Camara de Comercio de Costa Rica**, de conformidad con su Reglamento
vigente. El arbitraje sera conducido por **{NUMERO_ARBITROS}** arbitro(s) en
**{SEDE_ARBITRAJE}**, Costa Rica, en idioma espanol.

17.4. **Costas (Costs):** Los costos del arbitraje seran asumidos por la Parte que
resulte vencida, salvo que el tribunal arbitral disponga lo contrario.

---

## 18. Miscelaneos (Miscellaneous)

### 18.1. Modificaciones (Amendments)

Este PSA solo podra ser modificado mediante addendum escrito firmado por ambas Partes.
Comunicaciones verbales o por correo electronico no constituyen modificaciones
vinculantes, salvo que se formalicen posteriormente por escrito.

### 18.2. Acuerdo Completo (Entire Agreement)

Este PSA, junto con sus anexos y el MSA (si aplica), constituye el acuerdo completo
entre las Partes respecto al objeto del mismo y reemplaza todos los acuerdos,
negociaciones y comunicaciones previas, ya sean orales o escritas, relacionadas con
dicho objeto.

### 18.3. Proteccion de Datos Personales (Data Protection — Ley 8968)

Las Partes se comprometen a cumplir con la **Ley 8968 — Ley de Proteccion de la
Persona Frente al Tratamiento de sus Datos Personales** de Costa Rica y su reglamento.
En particular:

- (a) El Cliente, como responsable del tratamiento, garantiza que cuenta con las
  autorizaciones necesarias para compartir datos personales con el Consultor.
- (b) El Consultor, como encargado del tratamiento cuando aplique, procesara datos
  personales unicamente conforme a las instrucciones del Cliente y para los fines
  de este PSA.
- (c) Ambas Partes implementaran medidas tecnicas y organizativas razonables para
  proteger los datos personales contra acceso no autorizado, perdida o destruccion.
- (d) En caso de una brecha de seguridad (data breach) que involucre datos personales,
  la Parte que detecte la brecha notificara a la otra dentro de **{HORAS_NOTIFICACION_BRECHA}**
  horas y cooperara para cumplir con los requisitos de notificacion de la PRODHAB
  (Agencia de Proteccion de Datos de los Habitantes).

### 18.4. No Discriminacion (Non-Discrimination)

Las Partes se comprometen a ejecutar este PSA sin discriminacion alguna por razon de
genero, orientacion sexual, identidad de genero, origen etnico, nacionalidad, religion,
discapacidad, edad, estado civil o cualquier otra condicion protegida por la legislacion
costarricense.

### 18.5. Notificaciones (Notices)

Todas las notificaciones formales bajo este PSA deberan realizarse por escrito a las
direcciones de correo electronico indicadas en la Seccion 1, con copia a:

- Cliente: {EMAIL_NOTIFICACIONES_CLIENTE}
- Consultor: {EMAIL_NOTIFICACIONES_CONSULTOR}

Las notificaciones se consideraran recibidas al dia habil siguiente de su envio.

### 18.6. Cesion (Assignment)

Ninguna de las Partes podra ceder sus derechos u obligaciones bajo este PSA sin el
consentimiento previo escrito de la otra Parte, salvo en caso de fusion, adquisicion o
reestructuracion corporativa del Cliente, en cuyo caso el Cliente debera notificar al
Consultor dentro de los **15** dias habiles siguientes.

### 18.7. Divisibilidad (Severability)

Si alguna disposicion de este PSA resulta invalida o inaplicable, las demas
disposiciones permaneceran en pleno vigor y efecto. Las Partes negociaran de buena fe
una disposicion sustitutiva que refleje la intencion original.

### 18.8. Renuncia (Waiver)

La falta de ejercicio de cualquier derecho bajo este PSA no constituye renuncia al
mismo. Cualquier renuncia debera constar por escrito.

---

## 19. Firmas (Signatures)

En fe de lo cual, las Partes firman este Acuerdo Especifico de Proyecto en
**{CANTIDAD_COPIAS}** ejemplares del mismo tenor, en **{LUGAR_FIRMA}**, Costa Rica,
a los **{DIA_FIRMA}** dias del mes de **{MES_FIRMA}** de **{ANO_FIRMA}**.

&nbsp;

---

**POR EL CLIENTE / FOR THE CLIENT:**

Nombre / Name: ___________________________________________

Cargo / Title: ___________________________________________

Firma / Signature: ___________________________________________

Fecha / Date: ___________________________________________

&nbsp;

---

**EL CONSULTOR / THE CONSULTANT:**

Nombre / Name: ___________________________________________

Cedula / ID: ___________________________________________

Firma / Signature: ___________________________________________

Fecha / Date: ___________________________________________

&nbsp;

---

### Anexos (Attachments)

- [ ] Anexo A: Detalle Tecnico de Entregables (Technical Deliverable Specifications)
- [ ] Anexo B: Addendum de Equity (si Modelo C aplica)
- [ ] Anexo C: Inventario de Accesos e Infraestructura (Access & Infrastructure Inventory)
- [ ] Anexo D: {ANEXO_ADICIONAL}
