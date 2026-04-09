# Contrato de Retainer para CTO Fraccional / Fractional CTO Retainer Agreement

> **PLANTILLA -- Requiere revision de un abogado antes de usar**
> **TEMPLATE -- Requires legal review before use**
>
> Este documento es una plantilla generica y no constituye asesoramiento legal.
> Los placeholders en {LLAVES} deben completarse antes de firmar.
> Los modelos de compensacion son mutuamente excluyentes: seleccione uno.

---

## 0. Modelo de Compensacion (Compensation Model)

Las Partes acuerdan el siguiente modelo de compensacion. Marque con **[X]** el modelo aplicable:

```
[ ] Modelo A -- Retainer Fijo (Fixed Monthly Retainer)
    Tarifa mensual (Monthly fee):        {MONTO_MENSUAL} {MONEDA}/mes
    Horas incluidas (Included hours):    {HORAS_INCLUIDAS} horas/mes
    Horas adicionales (Overage rate):    {MONTO_HORA} {MONEDA}/hora

[ ] Modelo D -- Retainer Minimo + Equity (Sweat Equity)
    Retainer minimo (Minimum retainer):  {MONTO_MINIMO} {MONEDA}/mes
    Horas incluidas (Included hours):    {HORAS_INCLUIDAS} horas/mes
    Equity:                              {EQUITY_PORCENTAJE}% fully diluted
    Vesting:                             {VESTING_ANOS} anos, cliff {CLIFF_ANOS} ano
    Milestone acceleration:              {CONDICION_ACELERACION}
```

> **Nota sobre Modelo D:** El componente de equity debe formalizarse en un
> documento separado (Stock Option Agreement, SAFE, o equivalente segun la
> jurisdiccion). Este contrato regula unicamente la relacion de servicios y
> el retainer minimo mensual.

---

## 1. Partes (Parties)

**El Profesional (The Professional):**

| Campo | Valor |
|-------|-------|
| Nombre completo (Full name) | {CTO_NOMBRE} |
| Cedula de identidad (ID) | {CTO_CEDULA} |
| Correo electronico (Email) | {CTO_EMAIL} |
| Domicilio (Address) | {CTO_DOMICILIO} |

En adelante referido como **"El Profesional"** o **"El CTO"**.

**El Cliente (The Client):**

| Campo | Valor |
|-------|-------|
| Razon social o nombre (Company or full name) | {CLIENTE_NOMBRE} |
| Cedula juridica o de identidad (Tax ID or personal ID) | {CLIENTE_CEDULA} |
| Representante legal (Legal representative) | {CLIENTE_REPRESENTANTE} |
| Correo electronico (Email) | {CLIENTE_EMAIL} |
| Domicilio (Address) | {CLIENTE_DOMICILIO} |

En adelante referido como **"El Cliente"**.

Conjuntamente denominadas **"Las Partes"**.

---

## 2. Objeto (Purpose)

El Cliente contrata al Profesional como **CTO Fraccional (Fractional CTO)** para proveer liderazgo tecnico continuo (ongoing technical leadership) para el proyecto **{NOMBRE_PROYECTO}**.

Esta relacion es de naturaleza continua y basada en tiempo, no por proyecto. El Profesional actua como persona fisica (natural person) y contratista independiente, no como sociedad ni como empleado del Cliente.

---

## 3. Servicios Incluidos (Services Included)

El retainer mensual cubre los siguientes servicios dentro de las horas contratadas:

- **(a) Estrategia tecnica y decisiones de arquitectura (Technical strategy and architecture decisions).** Definicion y evolucion de la arquitectura del sistema, seleccion de stack tecnologico, y decisiones tecnicas estrategicas alineadas con los objetivos de negocio.

- **(b) Revision de codigo y supervision de calidad (Code review and quality oversight).** Revision periodica de pull requests criticos, definicion de estandares de codigo, y supervision de practicas de calidad (testing, linting, CI/CD).

- **(c) Gestion de infraestructura y seguridad (Infrastructure and security management).** Supervision de la infraestructura en produccion, practicas de seguridad, gestion de secretos, y cumplimiento de mejores practicas de la industria.

- **(d) Evaluacion de proveedores y servicios (Vendor and service evaluation).** Analisis tecnico de herramientas, plataformas, y servicios terceros; recomendaciones de adopcion o migracion.

- **(e) Soporte en contratacion y entrevistas tecnicas (Team hiring support and technical interviews).** Apoyo en la definicion de perfiles tecnicos, participacion en entrevistas, y evaluacion de candidatos.

- **(f) Planificacion de sprints y priorizacion de backlog (Sprint planning and backlog prioritization).** Participacion activa en la planificacion de sprints, refinamiento de historias de usuario, y priorizacion tecnica del backlog.

- **(g) Respuesta a incidentes segun SLA (Incident response per SLA).** Participacion en la respuesta a incidentes criticos de acuerdo con los niveles de servicio definidos en la Seccion 6 de este contrato.

- **(h) Reporte mensual de salud tecnica (Monthly technical health report).** Entrega de un reporte escrito mensual que incluya: estado general de la plataforma, deuda tecnica identificada, metricas de calidad, riesgos activos, y recomendaciones.

---

## 4. Servicios NO Incluidos (Services NOT Included)

Los siguientes servicios **no estan cubiertos** por el retainer mensual y, de requerirse, se facturaran por separado o se formalizaran mediante un acuerdo de servicios profesionales (PSA) independiente:

- **(a) Desarrollo hands-on (Hands-on development).** Programacion directa, implementacion de features, o correccion de bugs. Se facturara por separado a la tarifa de horas adicionales o mediante un PSA.

- **(b) Guardia 24/7 (24/7 on-call).** Disponibilidad fuera del horario laboral habitual, salvo que se especifique expresamente en el SLA de la Seccion 6.

- **(c) Asesoria legal o financiera (Legal or financial advice).** El Profesional no provee servicios legales, contables, ni de asesoria financiera. El Cliente debe consultar profesionales especializados para estos temas.

---

## 5. Disponibilidad (Availability)

**5.1 Horas garantizadas (Guaranteed hours).** El Profesional dedicara un minimo de **{HORAS_INCLUIDAS}** horas por mes a los servicios del Cliente, distribuidas segun las necesidades del proyecto.

**5.2 Tiempo de respuesta no urgente (Non-urgent response time).** Para consultas y solicitudes que no califiquen como incidentes, el tiempo de respuesta es de **24 horas habiles** (business hours), de lunes a viernes.

**5.3 Emergencias y P1 (Emergency/P1 response).** Los incidentes criticos (P1) se atienden segun la tabla de SLA definida en la Seccion 6.

**5.4 Reuniones programadas (Scheduled meetings).** El retainer incluye hasta **{MAX_REUNIONES}** reuniones programadas por mes (planificacion, revision, one-on-ones, etc.). Reuniones adicionales se coordinaran dentro de las horas disponibles.

**5.5 Horario habitual (Standard hours).** El Profesional opera en zona horaria **{ZONA_HORARIA}**, en horario habitual de lunes a viernes. Disponibilidad fuera de este horario esta sujeta a los terminos del SLA.

---

## 6. SLA / Acuerdo de Nivel de Servicio (Service Level Agreement)

Los siguientes tiempos de respuesta aplican desde que el Profesional recibe la notificacion del incidente a traves de los canales acordados ({CANAL_NOTIFICACION}):

| Prioridad (Priority) | Descripcion (Description) | Tiempo de respuesta (Response time) |
|---|---|---|
| **P1 -- Critico (Critical)** | Sistema en produccion caido, brecha de seguridad activa, perdida de datos en curso | **{SLA_P1_HORAS}** hora(s) |
| **P2 -- Alto (High)** | Funcionalidad critica degradada, incidente de seguridad contenido, riesgo de perdida de datos | **{SLA_P2_HORAS}** horas habiles |
| **P3 -- Normal** | Consultas tecnicas, decisiones de arquitectura, revisiones no urgentes | **{SLA_P3_DIAS}** dias habiles |

> **Nota:** Tiempo de respuesta se refiere al primer acuse de recibo y evaluacion inicial, no a la resolucion completa del incidente. Las horas dedicadas a incidentes P1 y P2 fuera del horario habitual se contabilizan como horas adicionales si exceden el retainer.

---

## 7. Pago (Payment)

**7.1 Facturacion mensual (Monthly invoicing).** El Profesional emitira factura al inicio de cada periodo mensual. El pago debera realizarse dentro de los **{DIAS_PAGO}** dias naturales posteriores a la recepcion de la factura.

**7.2 Las horas no utilizadas NO se acumulan (Unused hours do NOT roll over).** Las horas incluidas en el retainer que no se utilicen en un mes determinado no se transfieren al mes siguiente.

**7.3 Horas adicionales (Additional hours).** Las horas que excedan el retainer mensual se facturaran a la tarifa acordada en la Seccion 0. El Profesional notificara al Cliente cuando las horas consumidas alcancen el **80%** del retainer, y solicitara autorizacion por escrito antes de incurrir en horas adicionales, salvo en situaciones P1.

**7.4 Metodo de pago (Payment method).** Transferencia bancaria a la cuenta indicada en la factura, o mediante **{METODO_PAGO_ALTERNATIVO}**.

**7.5 Moneda y tipo de cambio (Currency and exchange rate).** Los montos se expresan en **{MONEDA}**. Si el pago se realiza en una moneda distinta, se utilizara el tipo de cambio de venta del Banco Central de Costa Rica en la fecha de la factura.

**7.6 Mora (Late payment).** Los pagos atrasados generaran un interes moratorio del **{TASA_MORA}%** mensual. Si el pago se atrasa mas de **{DIAS_SUSPENSION}** dias, el Profesional podra suspender los servicios previa notificacion escrita de cinco (5) dias habiles.

---

## 8. Propiedad Intelectual (Intellectual Property)

**8.1 Trabajo del Cliente (Client work product).** Todo producto del trabajo (work product) creado por el Profesional especificamente para el Cliente en el marco de este contrato pertenece al Cliente. Esto incluye codigo, documentacion tecnica, diagramas de arquitectura, y configuraciones creadas para el proyecto {NOMBRE_PROYECTO}.

**8.2 Conocimiento general (General knowledge).** El Profesional retiene el derecho de utilizar conocimientos generales, habilidades, experiencia, metodologias, frameworks conceptuales, y mejores practicas adquiridas o refinadas durante el Engagement. Esto no incluye informacion confidencial, codigo fuente, ni datos especificos del Cliente.

**8.3 Herramientas preexistentes (Pre-existing tools).** Las herramientas, scripts, templates, y metodologias que el Profesional haya desarrollado antes del Engagement o de forma independiente permanecen como propiedad del Profesional. Si se integran en el proyecto del Cliente, el Cliente recibe una licencia perpetua, no exclusiva, para su uso interno.

---

## 9. Confidencialidad (Confidentiality)

**9.1 NDA vigente (Active NDA).** Si existe un Acuerdo de Confidencialidad (NDA) firmado entre Las Partes, las obligaciones de confidencialidad se rigen por dicho acuerdo, el cual se incorpora por referencia.

> **Referencia:** NDA firmado con fecha {FECHA_NDA}, o el documento `01-nda.md` del toolkit de contratos.

**9.2 Clausula subsidiaria (Fallback clause).** En ausencia de un NDA independiente, ambas Partes se comprometen a:

- (a) No divulgar informacion confidencial de la otra Parte a terceros sin autorizacion escrita previa.
- (b) Utilizar la informacion confidencial unicamente para los fines de este contrato.
- (c) Proteger la informacion confidencial con al menos el mismo grado de cuidado que aplican a su propia informacion, y en ningun caso con un estandar inferior al razonable.
- (d) Estas obligaciones sobreviviran por **{CONFIDENCIALIDAD_ANOS}** anos despues de la terminacion de este contrato.

---

## 10. Duracion y Renovacion (Term & Renewal)

**10.1 Plazo inicial (Initial term).** Este contrato entra en vigor el **{FECHA_INICIO}** y tiene un plazo inicial de **{PLAZO_INICIAL_MESES}** meses.

**10.2 Renovacion automatica (Auto-renewal).** Al finalizar el plazo inicial, el contrato se renueva automaticamente por periodos mensuales, salvo que cualquiera de Las Partes notifique por escrito su intencion de no renovar con al menos **{DIAS_AVISO_NO_RENOVACION}** dias de antelacion.

**10.3 Terminacion (Termination).** Cualquiera de Las Partes puede terminar este contrato en cualquier momento, con al menos **30 (treinta)** dias de preaviso por escrito. La terminacion no libera al Cliente de las obligaciones de pago por servicios ya prestados.

**10.4 Terminacion por incumplimiento (Termination for cause).** Cualquiera de Las Partes puede terminar este contrato de forma inmediata mediante notificacion escrita si la otra Parte incurre en un incumplimiento material que no sea subsanado dentro de los quince (15) dias habiles siguientes a la notificacion del incumplimiento.

---

## 11. Transicion y Offboarding (Offboarding)

Para asegurar una transicion ordenada al terminar este contrato, Las Partes acuerdan lo siguiente:

**11.1 Periodo de transferencia de conocimiento (Knowledge transfer period).** El Profesional proporcionara un periodo de transferencia de conocimiento de **30 (treinta)** dias calendario a partir de la fecha efectiva de terminacion. Durante este periodo, el Profesional:

- (a) Documentara el estado actual de la arquitectura, decisiones tecnicas pendientes, y deuda tecnica conocida.
- (b) Facilitara sesiones de transferencia con el equipo tecnico del Cliente o su sucesor.
- (c) Entregara un documento de estado final (final status document) que incluya: estado de la infraestructura, credenciales y accesos activos, proveedores criticos, y riesgos identificados.

**11.2 Transferencia de credenciales y accesos (Credentials and access transfer).** El Profesional transferira todas las credenciales, documentacion, y accesos relacionados con el proyecto del Cliente. Esto incluye:

- Accesos a repositorios, servidores, y servicios en la nube.
- Documentacion tecnica y diagramas creados durante el Engagement.
- Claves de API, certificados, y secretos gestionados.

**11.3 No retencion de datos del Cliente (No retention of client data).** El Profesional eliminara toda copia de datos del Cliente, codigo fuente, y documentacion confidencial de sus dispositivos y servicios dentro de los quince (15) dias habiles posteriores a la finalizacion de la transferencia. Se aplica la excepcion para copias requeridas por mandato legal.

**11.4 Disponibilidad post-contrato (Post-contract availability).** De comun acuerdo, el Profesional podra ofrecer disponibilidad limitada para consultas puntuales durante los **{DIAS_POST_CONTRATO}** dias posteriores al offboarding, facturada a la tarifa de horas adicionales.

---

## 12. Contratista Independiente (Independent Contractor)

**12.1** El Profesional actua como **contratista independiente (independent contractor)** y persona fisica (natural person). Nada en este contrato crea una relacion laboral, sociedad, agencia, ni joint venture entre Las Partes.

**12.2** El Profesional es responsable de sus propias obligaciones fiscales, seguro social (CCSS), y cualquier otra obligacion derivada de su actividad como trabajador independiente segun las leyes de Costa Rica.

**12.3** El Profesional no tiene autoridad para comprometer al Cliente frente a terceros, firmar contratos en su nombre, ni asumir obligaciones en representacion del Cliente, salvo autorizacion expresa y por escrito.

**12.4** El Cliente no proporcionara al Profesional herramientas de trabajo, espacio de oficina, ni beneficios laborales. El Profesional utiliza sus propios equipos, software, y servicios para la prestacion de los servicios.

---

## 13. Ley Aplicable y Resolucion de Disputas (Governing Law & Dispute Resolution)

**13.1 Ley aplicable (Governing law).** Este contrato se rige por las leyes de la Republica de Costa Rica.

**13.2 Resolucion de disputas (Dispute resolution).** Cualquier controversia derivada de este contrato se resolvera de la siguiente manera:

- (a) **Negociacion directa (Direct negotiation).** Las Partes intentaran resolver la controversia de buena fe dentro de un plazo de treinta (30) dias naturales a partir de la notificacion escrita del conflicto.
- (b) **Arbitraje vinculante (Binding arbitration).** Si la negociacion no prospera, la controversia sera sometida a arbitraje de derecho administrado por el Centro de Conciliacion y Arbitraje de la Camara de Comercio de Costa Rica, de conformidad con su reglamento vigente. El laudo arbitral sera definitivo y vinculante.

---

## 14. Disposiciones Generales (General Provisions)

**14.1 Acuerdo completo (Entire agreement).** Este contrato, junto con los documentos incorporados por referencia (NDA, acuerdo de equity si aplica), constituye el entendimiento completo entre Las Partes y reemplaza cualquier acuerdo previo, oral o escrito, sobre el mismo tema.

**14.2 Modificaciones (Amendments).** Cualquier modificacion a este contrato debera constar por escrito y ser firmada por ambas Partes.

**14.3 Separabilidad (Severability).** Si alguna clausula de este contrato resulta invalida o inaplicable, las demas clausulas mantendran su plena vigencia.

**14.4 No renuncia (No waiver).** La falta de ejercicio de un derecho bajo este contrato no constituye renuncia al mismo.

**14.5 Notificaciones (Notices).** Toda notificacion bajo este contrato debera realizarse por escrito al correo electronico registrado de la otra Parte, y se considerara recibida al momento de su entrega electronica confirmada.

---

## 15. Firmas (Signatures)

En fe de lo cual, Las Partes firman este contrato en la fecha indicada, manifestando que han leido, comprendido, y aceptado todos sus terminos.

**El Profesional (The Professional):**

| | |
|---|---|
| Nombre (Name) | {CTO_NOMBRE} |
| Cedula (ID) | {CTO_CEDULA} |
| Firma (Signature) | _________________________ |
| Fecha (Date) | {FECHA_FIRMA} |

**El Cliente (The Client):**

| | |
|---|---|
| Nombre / Razon social (Name / Company) | {CLIENTE_NOMBRE} |
| Cedula (ID) | {CLIENTE_CEDULA} |
| Representante legal (Legal representative) | {CLIENTE_REPRESENTANTE} |
| Firma (Signature) | _________________________ |
| Fecha (Date) | {FECHA_FIRMA} |

---

*Documento generado como plantilla para uso del Profesional independiente. No constituye asesoramiento legal.*
