# Solicitud Formal de Entrega — {NOMBRE_PROYECTO}

**Fecha:** {FECHA}
**De:** {NOMBRE_LEAD} (propietario / representante legal de {NOMBRE_PROYECTO})
**Para:** {NOMBRE_DEV} (desarrollador)

---

## Contexto

Como parte de una reestructuracion en la gestion tecnica de {NOMBRE_PROYECTO}, se
formaliza la transferencia completa del proyecto. Este documento enumera los elementos
que deben ser entregados, los plazos establecidos, y las consecuencias en caso de
incumplimiento.

Las partes acuerdan que la firma de este documento constituye un compromiso formal
de entrega dentro de los plazos aqui indicados.

---

## 1. Codigo fuente y repositorio

**Plazo: {PLAZO_CODIGO}**

- [ ] Transferencia del repositorio a la organizacion/cuenta indicada por el propietario
- [ ] Confirmacion de que el repositorio contiene TODO el codigo fuente del proyecto
  (sin ramas eliminadas, historial truncado, o commits revertidos)
- [ ] Si existen repositorios adicionales (microservicios, scripts, herramientas de deploy),
  incluirlos en la transferencia
- [ ] Acceso completo al historial de commits y branches

---

## 2. Cuentas y servicios de terceros

**Plazo: {PLAZO_SERVICIOS}**

Transferencia de ownership o credenciales de administrador para cada servicio externo:

- [ ] **Hosting / servidor de produccion** — proveedor: __________ | transferir ownership
- [ ] **Base de datos** — proveedor y tipo: __________ | transferir acceso admin
- [ ] **Dominio(s)** — registrar: __________ | transferir dominio
- [ ] **Autenticacion** — servicio: __________ | transferir ownership del tenant
- [ ] **Email transaccional** — servicio: __________ | transferir cuenta
- [ ] **Procesamiento de pagos** — servicio: __________ | transferir cuenta
- [ ] **Analytics** — servicio: __________ | transferir acceso
- [ ] **Monitoreo de errores** — servicio: __________ | transferir acceso
- [ ] **Almacenamiento de archivos** — servicio: __________ | transferir acceso
- [ ] **CDN / SSL** — servicio: __________ | transferir acceso
- [ ] **Otros servicios:** __________

Para cada servicio se requiere: nombre, URL del dashboard, email de la cuenta, y
transferencia de ownership a la cuenta que se indicara.

---

## 3. Infraestructura y ambientes

**Plazo: {PLAZO_INFRA}**

- [ ] Lista de ambientes existentes (desarrollo, staging, produccion) con URLs
- [ ] Variables de entorno — lista completa por ambiente con descripcion de cada una
- [ ] CI/CD — acceso a configuracion y secrets del pipeline
- [ ] Infraestructura como codigo (Terraform, Docker, scripts de deploy) — confirmar
  que esta incluida en el repositorio

---

## 4. Base de datos

**Plazo: {PLAZO_DB}**

- [ ] Acceso de administrador a la base de datos de produccion
- [ ] Esquema actual (dump de esquema si las migraciones no estan en el repo)
- [ ] Procedimiento de backup — donde se almacenan, como restaurarlos
- [ ] Seed data / scripts de datos de prueba (si existen)

---

## 5. Documentacion y conocimiento

**Plazo: {PLAZO_DOCS}**

- [ ] Toda documentacion existente: especificaciones, diagramas, notas tecnicas,
  decisiones de arquitectura, flujos de usuario
- [ ] Credenciales documentadas (password manager, documentos compartidos)
- [ ] Backlog / roadmap / lista de bugs conocidos
- [ ] Video walkthrough de 15-30 min recorriendo funcionalidades principales y
  proceso de deploy (o sesion en vivo equivalente)

---

## 6. Diseño y assets

**Plazo: {PLAZO_DISENO}**

- [ ] Archivos de diseño (Figma, Sketch, etc.) — transferir ownership
- [ ] Assets graficos: logo, iconos, ilustraciones — indicar licencias
- [ ] Guia de marca / branding (si existe)

---

{BLOQUE_ITEMS_ADICIONALES}

<!-- El skill agrega items especificos segun tipo de proyecto:
- Mobile: Apple Developer Account, Google Play Console, app signing keys,
  keystore (.jks), iOS certificates, TestFlight, bundle identifiers
- SaaS: cuentas de facturacion, webhooks, integraciones con terceros
-->

---

## Plazos y calendario

| Entrega | Plazo |
|---------|-------|
| Codigo fuente (Seccion 1) | {PLAZO_CODIGO} |
| Cuentas y servicios (Seccion 2) | {PLAZO_SERVICIOS} |
| Infraestructura (Seccion 3) | {PLAZO_INFRA} |
| Base de datos (Seccion 4) | {PLAZO_DB} |
| Documentacion (Seccion 5) | {PLAZO_DOCS} |
| Diseño y assets (Seccion 6) | {PLAZO_DISENO} |

Los plazos establecidos son contados a partir de la fecha de firma de este documento.

---

## Clausula de consecuencias

{BLOQUE_CLAUSULA_LEGAL}

<!-- El skill reemplaza segun nivel de riesgo:

### BAJO:
El incumplimiento de los plazos establecidos podra derivar en las acciones legales
que el propietario considere pertinentes para la proteccion de sus derechos.

### MEDIO:
El incumplimiento de los plazos aqui acordados constituye una retencion indebida
de propiedad intelectual. El propietario se reserva el derecho de iniciar las
acciones legales correspondientes bajo la legislacion de propiedad intelectual
vigente, incluyendo la reclamacion de daños y perjuicios derivados de la
interrupcion del servicio y cualquier perdida de datos o funcionalidad.

### ALTO:
Las partes reconocen que {NOMBRE_PROYECTO} y todo su codigo fuente, base de datos,
configuraciones, y activos digitales son propiedad de {NOMBRE_LEAD}, habiendo sido
desarrollados bajo relacion contractual de prestacion de servicios.

La retencion, destruccion, o manipulacion no autorizada de estos activos digitales
tras la firma de este documento podra constituir:

1. **Retencion indebida de propiedad intelectual** — sujeta a reclamacion civil
   por daños y perjuicios, incluyendo lucro cesante por interrupcion del servicio
   a usuarios activos.

2. **Delito informatico** — la destruccion, alteracion, o inutilizacion de datos
   o sistemas informaticos ajenos esta tipificada en la legislacion penal vigente.
   [En Costa Rica: Codigo Penal, articulos 196 bis (violacion de datos personales),
   217 bis (estafa informatica), y 229 bis (daño informatico), Ley 9048.]

3. **Denuncia ante autoridad competente** — en caso de destruccion o sabotaje de
   datos, el propietario procedera a interponer la denuncia correspondiente ante
   la autoridad de investigacion de delitos informaticos.
   [En Costa Rica: Unidad de Delitos Informaticos del Organismo de Investigacion
   Judicial (OIJ).]

Adicionalmente, toda evidencia de pagos realizados por el desarrollo del proyecto
sera presentada como prueba del derecho de propiedad del contratante.

El propietario se reserva el derecho de solicitar medidas cautelares para la
preservacion de los activos digitales mientras se resuelve cualquier disputa.
-->

---

## Contacto para coordinacion

- **Nombre:** {NOMBRE_CTO}
- **Email:** {EMAIL_CTO}
- **Rol:** Director Tecnico / CTO designado por {NOMBRE_LEAD}

Toda comunicacion relacionada con esta entrega debe dirigirse al contacto indicado.

---

## Firmas

Al firmar este documento, ambas partes acuerdan los terminos, plazos, y condiciones
aqui establecidos.

&nbsp;

**{NOMBRE_LEAD}** — Propietario / Representante legal

Nombre completo: _________________________________

Cedula / ID: _________________________________

Firma: _________________________________

Fecha: _________________________________

&nbsp;

**{NOMBRE_DEV}** — Desarrollador

Nombre completo: _________________________________

Cedula / ID: _________________________________

Firma: _________________________________

Fecha: _________________________________

---

*Este documento tiene caracter de acuerdo formal entre las partes. Una copia firmada
sera entregada a cada parte.*

<!-- NOTA PARA EL CTO: Este documento fue generado automaticamente y debe ser
revisado por un abogado antes de ser utilizado, especialmente la clausula de
consecuencias. Las referencias legales son orientativas y deben verificarse
segun la jurisdiccion aplicable. -->
