# Acuerdo de Confidencialidad / Non-Disclosure Agreement (NDA)

> **PLANTILLA -- Requiere revision de un abogado antes de usar**
> **TEMPLATE -- Requires legal review before use**
>
> Este documento es una plantilla generica y no constituye asesoramiento legal.
> Los placeholders en {LLAVES} deben completarse antes de firmar.

---

## 1. Partes (Parties)

**El Profesional (The Professional):**

| Campo | Valor |
|-------|-------|
| Nombre completo (Full name) | {CTO_NOMBRE} |
| Cedula de identidad (ID) | {CTO_CEDULA} |
| Correo electronico (Email) | {CTO_EMAIL} |
| Domicilio (Address) | {CTO_DOMICILIO} |

En adelante referido como **"El Profesional"** o **"Parte Receptora/Divulgadora"** segun corresponda.

**El Cliente (The Client):**

| Campo | Valor |
|-------|-------|
| Razon social o nombre (Company or full name) | {CLIENTE_NOMBRE} |
| Cedula juridica o de identidad (Tax ID or personal ID) | {CLIENTE_CEDULA} |
| Representante legal (Legal representative) | {CLIENTE_REPRESENTANTE} |
| Correo electronico (Email) | {CLIENTE_EMAIL} |
| Domicilio (Address) | {CLIENTE_DOMICILIO} |

En adelante referido como **"El Cliente"** o **"Parte Receptora/Divulgadora"** segun corresponda.

Conjuntamente denominadas **"Las Partes"**.

---

## 2. Definiciones (Definitions)

**2.1 Informacion Confidencial (Confidential Information):** Toda informacion, en cualquier formato (escrito, oral, electronico, visual), que una Parte divulgue a la otra en el contexto de la relacion profesional, incluyendo pero no limitada a:

- (a) **Codigo fuente y arquitectura (Source code & architecture):** repositorios, diagramas de sistema, pipelines de CI/CD, infraestructura como codigo (IaC).
- (b) **Credenciales y accesos (Credentials & access):** API keys, tokens, contrasenas, certificados, secretos de infraestructura.
- (c) **Datos de negocio (Business data):** planes estrategicos, modelos financieros, listas de clientes, precios, propuestas comerciales.
- (d) **Datos de usuarios (User data):** informacion personal identificable (PII), datos de comportamiento, bases de datos de usuarios.
- (e) **Informacion financiera (Financial information):** estados financieros, proyecciones, contratos con terceros, condiciones comerciales.
- (f) **Secretos comerciales (Trade secrets):** procesos propietarios, algoritmos, metodologias no publicadas, know-how tecnico.
- (g) **Metodologias del Profesional (Professional's methodologies):** frameworks, herramientas internas, plantillas y procesos de trabajo propios del Profesional que sean compartidos con El Cliente.

**2.2 Engagement:** Se refiere a la relacion de servicios profesionales entre Las Partes, ya sea bajo un contrato de servicios (PSA), orden de trabajo, o cualquier otro acuerdo vigente.

---

## 3. Obligaciones (Obligations)

**3.1 Obligaciones mutuas (Mutual obligations).** Ambas Partes se comprometen a:

- (a) Utilizar la Informacion Confidencial unicamente para los fines del Engagement.
- (b) No divulgar Informacion Confidencial a terceros sin autorizacion previa y por escrito de la Parte Divulgadora.
- (c) Proteger la Informacion Confidencial con al menos el mismo grado de cuidado que aplican a su propia informacion confidencial, y en ningun caso con un estandar inferior al razonable.
- (d) Limitar el acceso a la Informacion Confidencial exclusivamente a personas que necesiten conocerla para cumplir los fines del Engagement, y que esten sujetas a obligaciones de confidencialidad equivalentes.
- (e) Notificar a la otra Parte de forma inmediata ante cualquier uso no autorizado, divulgacion o brecha de seguridad (security breach) que involucre Informacion Confidencial.

**3.2 Obligaciones del Profesional (Professional's obligations).** Adicionalmente, El Profesional se compromete a:

- (a) No almacenar Informacion Confidencial del Cliente en dispositivos o servicios personales no autorizados.
- (b) Utilizar practicas razonables de seguridad informatica (cifrado, autenticacion multifactor, gestion segura de credenciales).
- (c) No utilizar datos, codigo fuente ni propiedad intelectual de un cliente en el trabajo para otro cliente.

**3.3 Obligaciones del Cliente (Client's obligations).** El Cliente se compromete a:

- (a) No divulgar ni utilizar las metodologias, herramientas o frameworks propietarios del Profesional fuera del alcance del Engagement sin autorizacion escrita.
- (b) No compartir las tarifas, propuestas ni condiciones comerciales del Profesional con terceros.

---

## 4. Excepciones (Exceptions)

Las obligaciones de confidencialidad **no aplican** a informacion que:

- (a) Sea o se convierta en **informacion publica** (public domain) sin que medie incumplimiento de este Acuerdo.
- (b) Fuera **conocida previamente** (prior knowledge) por la Parte Receptora antes de la divulgacion, segun pueda demostrarse documentalmente.
- (c) Sea **desarrollada independientemente** (independently developed) por la Parte Receptora sin uso de la Informacion Confidencial.
- (d) Sea **recibida legitimamente de un tercero** (received from a third party) sin obligacion de confidencialidad.
- (e) Deba ser **divulgada por mandato legal** (required by law), orden judicial o requerimiento de autoridad competente, siempre que la Parte Receptora notifique a la Parte Divulgadora con la mayor antelacion posible y coopere para limitar el alcance de dicha divulgacion.

---

## 5. Duracion (Duration)

**5.1** Este Acuerdo entra en vigor en la fecha de firma y permanecera vigente durante toda la duracion del Engagement.

**5.2** Las obligaciones de confidencialidad **sobreviviran** por un periodo de **{NDA_DURACION_ANOS} ({NDA_DURACION_ANOS_TEXTO})** anos despues de la terminacion del Engagement, independientemente de la causa de terminacion.

> **Nota:** El valor por defecto sugerido es 2 (dos) anos. Las Partes pueden acordar un periodo diferente.

---

## 6. Devolucion y destruccion (Return & Destruction)

**6.1** Al terminar el Engagement, cada Parte debera, a solicitud de la otra y dentro de un plazo de **{PLAZO_DEVOLUCION_DIAS}** dias habiles:

- (a) Devolver toda la Informacion Confidencial en su poder, incluyendo copias fisicas y digitales; o
- (b) Destruir de forma segura toda la Informacion Confidencial y confirmar por escrito su destruccion.

**6.2** El Profesional no retendra copias de datos personales del Cliente o sus usuarios, en cumplimiento de la Ley 8968 de Proteccion de la Persona frente al Tratamiento de sus Datos Personales.

**6.3** Se exceptuan de la obligacion de destruccion las copias que deban conservarse por mandato legal o regulatorio, las cuales seguiran sujetas a las obligaciones de confidencialidad de este Acuerdo.

---

## 7. Propiedad intelectual (Intellectual Property Note)

**7.1** Este Acuerdo **no transfiere** derechos de propiedad intelectual entre Las Partes. La divulgacion de Informacion Confidencial no otorga a la Parte Receptora ninguna licencia, derecho de autor, patente ni otro derecho de propiedad intelectual sobre dicha informacion.

**7.2** La asignacion de propiedad intelectual creada durante el Engagement se regira por el contrato de servicios profesionales correspondiente (PSA / Engagement Agreement).

---

## 8. Ley aplicable y resolucion de disputas (Governing Law & Dispute Resolution)

**8.1 Ley aplicable (Governing law).** Este Acuerdo se rige por las leyes de la Republica de Costa Rica.

**8.2 Resolucion de disputas (Dispute resolution).** Cualquier controversia derivada de este Acuerdo se resolvera de la siguiente manera:

- (a) **Negociacion directa (Direct negotiation):** Las Partes intentaran resolver la controversia de buena fe dentro de un plazo de treinta (30) dias naturales a partir de la notificacion escrita del conflicto.
- (b) **Arbitraje vinculante (Binding arbitration):** Si la negociacion no prospera, la controversia sera sometida a arbitraje de derecho administrado por el Centro de Conciliacion y Arbitraje de la Camara de Comercio de Costa Rica, de conformidad con su reglamento vigente. El laudo arbitral sera definitivo y vinculante.

---

## 9. Proteccion de datos personales (Data Protection)

**9.1** Las Partes se comprometen a cumplir con la **Ley 8968** -- Proteccion de la Persona frente al Tratamiento de sus Datos Personales de Costa Rica, y su reglamento.

**9.2** Cualquier tratamiento de datos personales que se realice en el contexto del Engagement debera contar con la base legal correspondiente (consentimiento, relacion contractual u otra prevista en la Ley 8968).

**9.3** En caso de que El Profesional acceda a datos personales del Cliente o sus usuarios, actuara como **encargado del tratamiento (data processor)** y seguira las instrucciones documentadas del Cliente como responsable del tratamiento (data controller).

---

## 10. Disposiciones generales (General Provisions)

**10.1 Acuerdo completo (Entire agreement).** Este Acuerdo constituye el entendimiento completo entre Las Partes en materia de confidencialidad y reemplaza cualquier acuerdo previo, oral o escrito, sobre el mismo tema.

**10.2 Modificaciones (Amendments).** Cualquier modificacion a este Acuerdo debera constar por escrito y ser firmada por ambas Partes.

**10.3 Separabilidad (Severability).** Si alguna clausula de este Acuerdo resulta invalida o inaplicable, las demas clausulas mantendran su plena vigencia.

**10.4 No renuncia (No waiver).** La falta de ejercicio de un derecho bajo este Acuerdo no constituye renuncia al mismo.

---

## 11. Firmas (Signatures)

En fe de lo cual, Las Partes firman este Acuerdo en la fecha indicada.

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
