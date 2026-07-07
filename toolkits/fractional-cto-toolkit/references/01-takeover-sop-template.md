# SOP: Project Takeover / Handover

> Standard Operating Procedure para la transferencia de ownership tecnico de un
> proyecto de software. Diseñado para fractional CTOs que asumen proyectos de
> desarrolladores anteriores.

---

## Tabla de Contenidos

1. [Contexto y Evaluacion de Riesgo](#1-contexto-y-evaluacion-de-riesgo)
2. [Legal y Propiedad Intelectual](#2-legal-y-propiedad-intelectual)
3. [Repositorio y Codigo Fuente](#3-repositorio-y-codigo-fuente)
4. [Documentacion Tecnica](#4-documentacion-tecnica)
5. [Cuentas y Servicios de Terceros](#5-cuentas-y-servicios-de-terceros)
6. [Infraestructura Cloud y DevOps](#6-infraestructura-cloud-y-devops)
7. [Base de Datos](#7-base-de-datos)
8. [Seguridad — Acciones Inmediatas](#8-seguridad--acciones-inmediatas)
9. [Estado Actual del Producto](#9-estado-actual-del-producto)
10. [Diseño y UX](#10-diseño-y-ux)
11. [Secuencia de Ejecucion](#11-secuencia-de-ejecucion)
12. [Criterios de Aceptacion](#12-criterios-de-aceptacion)

---

## 1. Contexto y Evaluacion de Riesgo

Antes de iniciar el handover, documentar el contexto y evaluar amenazas para
calibrar urgencia, orden de operaciones, y mitigaciones.

### 1.1 Contexto general

| Factor | Pregunta | Respuesta |
|--------|----------|-----------|
| Relacion con dev anterior | ¿Cooperativa, neutral, contenciosa, o sin contacto? | |
| Ownership del codigo | ¿En org del cliente, cuenta personal del dev, o desconocido? | |
| Contrato de IP | ¿Existe cesion de IP firmada? | |
| Usuarios en produccion | ¿Hay usuarios activos? ¿Cuantos? | |
| Datos sensibles | ¿El sistema maneja datos legales, financieros, medicos, o PII? | |
| Tipo de proyecto | Web / Mobile / API / Monorepo / Otro | |
| Cloud provider | AWS / GCP / Azure / Otro / Ninguno / Desconocido | |
| Estado del producto | Pre-launch / MVP / Produccion estable | |

### 1.2 Matriz de amenazas

Evaluar CADA amenaza. Marcar si aplica y la probabilidad (alta/media/baja).
Las mitigaciones de cada amenaza se detallan en las secciones correspondientes.

| Amenaza | ¿Aplica? | Probabilidad | Mitigacion principal |
|---------|----------|-------------|---------------------|
| **Destruccion** — El dev borra el repo, dropea la DB, o wipes los servidores | | | Fork/backup ANTES de cualquier comunicacion (Sec 3, 8) |
| **Retencion** — El dev se niega a entregar el codigo o pide pago adicional | | | Clausula legal en solicitud + evidencia de pagos (Sec 2) |
| **Exfiltracion** — El dev clona el codebase para venderlo, reutilizarlo, o subastar a terceros | | | NDA + accion legal por violacion de confidencialidad + monitoreo de repos publicos (Sec 2) |
| **Sabotaje silencioso** — El dev introduce backdoors, time bombs, o codigo malicioso antes de entregar | | | Auditoria de seguridad post-transfer: revisar commits recientes, cron jobs, webhooks (Sec 8) |
| **Secuestro de datos** — El dev accede, extrae, o vende datos de usuarios (especialmente sensibles) | | | Rotacion inmediata de credenciales de DB + revision de logs de acceso (Sec 7, 8) |
| **Interrupcion de servicio** — El dev apaga servidores, cambia DNS, o revoca certificados SSL | | | Migrar DNS a cuenta del cliente ASAP + backup de config de infra (Sec 6) |
| **Extorsion** — El dev condiciona la entrega a pagos no acordados o renegociacion de terminos | | | Documentar comunicaciones + proceder por via legal (Sec 2) |

### 1.3 Nivel de riesgo

El nivel de riesgo se determina por la PEOR combinacion de contexto + amenazas:

- **ALTO** — Cualquiera de estas condiciones:
  - Dev contencioso o sin contacto
  - Sin contrato de cesion de IP
  - Codigo en cuenta del dev + usuarios activos en produccion
  - Datos sensibles (legales, financieros, medicos) expuestos
  - 2+ amenazas marcadas como probabilidad alta
  - → Ejecutar Seccion 2 (Legal) y 8 (Seguridad) PRIMERO. Timeline en dias.

- **MEDIO** — Cualquiera de estas condiciones:
  - Dev neutral + codigo en su cuenta
  - Contrato existe pero es ambiguo en IP
  - Usuarios en produccion sin backups verificados
  - 1 amenaza marcada como probabilidad alta
  - → Negociar transferencia con plazo firme. Timeline en 1-2 semanas.

- **BAJO** — Todas estas condiciones:
  - Dev cooperativo
  - Codigo en cuentas del cliente (o transferencia confirmada)
  - Contrato de IP claro
  - Ninguna amenaza con probabilidad alta
  - → Handover estandar. Timeline en 2-3 semanas.

---

## 2. Legal y Propiedad Intelectual

> **Prioridad:** Ejecutar ANTES de cualquier transferencia tecnica si riesgo es ALTO.

### Checklist

- [ ] **Contrato con dev anterior** — obtener copia, revisar clausulas de IP, codigo fuente, propiedad
- [ ] **Cesion de IP (IP Assignment Agreement)** — si no existe, redactar y firmar antes de transferir
- [ ] **NDA vigente** — confirmar que el dev anterior tiene NDA firmado
- [ ] **Licencias de dependencias** — verificar que no hay codigo propietario de terceros sin licencia
- [ ] **Contratos con usuarios/clientes** — si hay clientes activos, revisar SLAs
- [ ] **Terminos de servicio / Privacy Policy** — ¿existen y estan actualizados?

### Accion recomendada

Si no hay cesion de IP firmada, **detener el handover tecnico** hasta que un abogado
redacte el documento. Sin este papel, el dev anterior puede argumentar que el codigo
es suyo.

---

## 3. Repositorio y Codigo Fuente

### Checklist

- [ ] **Ubicacion del repo** — URL, plataforma (GitHub, GitLab, Bitbucket)
- [ ] **Propiedad** — ¿bajo organizacion del cliente o cuenta personal del dev?
- [ ] **Transferencia de ownership** — si esta en cuenta del dev, transferir a org del cliente
- [ ] **Fork o mirror de seguridad** — hacer copia verificable ANTES de revocar accesos (con hash del ultimo commit)
- [ ] **Accesos actuales** — listar TODOS los colaboradores y sus permisos
- [ ] **Branch protection rules** — ¿estan configuradas en main/master?
- [ ] **Historial de commits** — verificar que el historial esta completo (no squashed o rebased destructivamente)
- [ ] **Git LFS** — ¿se usa? ¿los archivos grandes estan trackeados?
- [ ] **.gitignore** — verificar que no se commitean secrets, builds, o node_modules

---

## 4. Documentacion Tecnica

### Checklist

- [ ] **Arquitectura general** — diagrama de componentes, servicios, flujo de datos
- [ ] **Stack tecnologico** — lenguajes, frameworks, versiones
- [ ] **Diagramas** — ERD, flujo de datos, infraestructura, secuencia
- [ ] **PRD / Especificacion de requisitos** — documento original de requerimientos
- [ ] **API documentation** — endpoints, auth, request/response schemas
- [ ] **README del repo** — ¿existe? ¿esta actualizado? ¿explica como correr el proyecto?
- [ ] **ADRs (Architecture Decision Records)** — decisiones tecnicas documentadas
- [ ] **Changelog** — historial de cambios significativos

### Si no hay documentacion

Esto es comun. Documentar como parte del takeover:
1. Leer el codigo y generar diagrama de arquitectura
2. Ejecutar `git log --oneline --since="6 months ago"` para entender la actividad reciente
3. Mapear dependencias desde package.json / requirements.txt / pubspec.yaml / go.mod

---

## 5. Cuentas y Servicios de Terceros

> Critico: cada cuenta debe estar bajo email/tarjeta del CLIENTE, no del dev anterior.

### Checklist

- [ ] **Inventario completo** de servicios SaaS/APIs utilizados
- [ ] **Por cada servicio:**

| Servicio | URL/Dashboard | Owner actual | Email de cuenta | Metodo de pago | Accion requerida |
|----------|--------------|-------------|----------------|---------------|-----------------|
| Stripe / Pagos | | | | | |
| Auth provider (Auth0, Firebase Auth, Supabase) | | | | | |
| Email transaccional (SendGrid, Resend, SES) | | | | | |
| Push notifications (OneSignal, FCM) | | | | | |
| Analytics (GA, Mixpanel, Amplitude) | | | | | |
| Error tracking (Sentry, Bugsnag) | | | | | |
| Storage (S3, Cloudinary, Supabase Storage) | | | | | |
| CDN (CloudFront, Cloudflare) | | | | | |
| Otros: | | | | | |

- [ ] **Domain names** — registrar, ¿bajo que cuenta? DNS apuntando a donde?
- [ ] **SSL certificates** — automaticos (Let's Encrypt) o manuales?
- [ ] **Apple Developer Account** — si hay app iOS, ¿bajo que cuenta esta publicada?
- [ ] **Google Play Console** — si hay app Android, ¿bajo que cuenta?
- [ ] **App signing keys** — ¿quien tiene los upload keys y signing keys?

---

## 6. Infraestructura Cloud y DevOps

### Checklist

- [ ] **Cloud provider(s)** — AWS / GCP / Azure / DigitalOcean / Vercel / Railway / Fly.io / otro
- [ ] **Cuenta root / admin** — ¿quien es el owner? ¿bajo que email?
- [ ] **IAM / Service accounts** — listar todos los usuarios y roles
- [ ] **CI/CD pipelines** — GitHub Actions / CircleCI / CodeMagic / otro
  - [ ] Configuracion (archivos YAML)
  - [ ] Secrets configurados en el pipeline
- [ ] **Inventario de environment variables** — lista por ambiente (dev, staging, prod)
  - No los valores (todavia), solo los NOMBRES y para que sirve cada uno
- [ ] **Ambientes** — ¿cuantos hay? (dev, staging, prod) ¿URLs de cada uno?
- [ ] **Monitoring y alertas** — Sentry, Datadog, CloudWatch, UptimeRobot, etc.
- [ ] **Logging** — ¿centralizado? ¿donde?
- [ ] **Backups** — ¿que se respalda? ¿frecuencia? ¿donde se almacena? ¿probado alguna vez?
- [ ] **IaC (Infrastructure as Code)** — Terraform, Pulumi, CDK, CloudFormation? ¿O todo fue manual?

---

## 7. Base de Datos

### Checklist

- [ ] **Motor(es)** — PostgreSQL, MySQL, MongoDB, Firestore, Supabase, etc.
- [ ] **Hosting** — managed (RDS, Cloud SQL, Supabase) o self-hosted?
- [ ] **Esquemas y migraciones** — ¿versionadas en el repo o aplicadas manualmente?
- [ ] **Seed data / datos de prueba** — ¿existen scripts para poblar datos de test?
- [ ] **Acceso a DB de produccion** — ¿quien tiene acceso directo? ¿por IP whitelist, VPN, bastion?
- [ ] **Tamaño de datos** — ¿cuantos registros/GB en las tablas principales?
- [ ] **Backup y restore** — ¿automatizado? ¿probado alguna vez?
- [ ] **Datos sensibles** — ¿hay PII? ¿encriptado at rest y in transit?

---

## 8. Seguridad — Acciones Inmediatas

> **Ejecutar INMEDIATAMENTE despues de la transferencia de ownership.**

### 8.1 Pre-transferencia (ANTES de comunicar al dev)

Estas acciones se ejecutan ANTES de enviar la solicitud de entrega o tener cualquier
reunion con el dev. El objetivo es tener un respaldo en caso de destruccion.

- [ ] **Fork/mirror del repo** — si el repo es accesible, hacer `git clone --mirror`
  y almacenarlo en una cuenta controlada por el cliente. Guardar el hash del ultimo
  commit como evidencia del estado previo.
- [ ] **Snapshot de produccion** — si se tiene acceso al cloud provider, tomar snapshot
  de servidores/containers y backup de la DB ANTES de cualquier comunicacion.
- [ ] **Captura de DNS** — documentar todos los registros DNS actuales (screenshot +
  export si es posible). Si el dev controla el DNS, una sola edicion puede
  tumbar todo.
- [ ] **Evidencia del estado actual** — screenshots del producto funcionando, con
  fecha y hora. Si hay datos de usuarios, esto prueba que el sistema estaba
  operativo antes de la transferencia.

### 8.2 Post-transferencia (INMEDIATAMENTE despues de recibir accesos)

1. **Rotacion de TODOS los secrets/API keys** — asumir que el dev anterior los tiene memorizados
2. **Revocar tokens de acceso** del dev anterior en todos los servicios
3. **Cambiar passwords** de cuentas compartidas (si las hay — no deberia haberlas)
4. **Auditar accesos** — eliminar al dev anterior de:
   - [ ] GitHub/GitLab (repo + org)
   - [ ] Cloud provider (IAM users, service accounts)
   - [ ] Base de datos (usuarios directos)
   - [ ] CI/CD (secrets, deploy keys)
   - [ ] Servicios SaaS (cada uno de la Seccion 5)
   - [ ] Dominios / DNS
5. **Habilitar 2FA** en todas las cuentas criticas bajo el cliente
6. **Revisar deploy keys y SSH keys** en el repo
7. **Verificar webhooks** — asegurarse de que no hay webhooks enviando datos a URLs desconocidas
8. **Revisar cron jobs / scheduled tasks** — ¿hay tareas programadas que apunten a servicios del dev?

### 8.3 Auditoria anti-sabotaje (si amenaza de sabotaje silencioso aplica)

Revisar si el dev introdujo codigo malicioso antes o durante la entrega:

- [ ] **Commits recientes sospechosos** — `git log --since="30 days"` — buscar commits
  grandes, mensajes vagos ("cleanup", "refactor", "minor fix"), o commits fuera de
  horario habitual
- [ ] **Codigo ofuscado o minificado** — archivos nuevos que no son legibles o que no
  corresponden al stack del proyecto
- [ ] **Time bombs** — buscar en el codigo: `Date.now()`, `new Date()`, `setTimeout`,
  `setInterval`, `cron`, comparaciones de fechas que no corresponden a logica de negocio
- [ ] **Backdoors de acceso** — buscar endpoints no documentados, rutas `/admin`, `/debug`,
  `/backdoor`, credenciales hardcodeadas, usuarios admin ocultos en la DB
- [ ] **Exfiltracion de datos** — buscar llamadas HTTP a URLs externas desconocidas,
  webhooks a dominios que no son del proyecto, envio de emails a direcciones externas
- [ ] **Kill switches** — buscar logica condicional que desactive funcionalidad basada
  en flags externos, APIs externas, o dominios del dev
- [ ] **Dependencias comprometidas** — verificar que los `package-lock.json` /
  `pubspec.lock` no fueron alterados para apuntar a forks maliciosos de librerias

### 8.4 Monitoreo anti-exfiltracion (si amenaza de exfiltracion aplica)

Si existe riesgo de que el dev copie el codebase para venderlo o reutilizarlo:

- [ ] **GitHub code search** — buscar fragmentos unicos del codigo en GitHub public repos
  periodicamente (funciones con nombres especificos del proyecto, strings unicos)
- [ ] **Google alerts** — configurar alertas con el nombre del proyecto + "source code",
  "github", "for sale"
- [ ] **Registrar evidencia de propiedad** — fecha del primer commit, historial completo
  de git, evidencia de pagos — todo esto sirve para demostrar autoria original
- [ ] **NDA enforcement** — si hay NDA firmado, documentar cualquier violacion para
  accion legal

---

## 9. Estado Actual del Producto

### Checklist

- [ ] **Que hay desplegado en produccion** — ¿coincide con lo que hay en el repo? (verificar commit hash)
- [ ] **Bugs conocidos** — lista honesta del dev anterior
- [ ] **Deuda tecnica** — areas del codigo que el dev sabe que son fragiles
- [ ] **Backlog / roadmap** — ¿que estaba planificado? ¿donde se trackea? (Linear, Jira, Notion, etc.)
- [ ] **Usuarios activos** — ¿cuantos? ¿que features usan? ¿hay metricas?
- [ ] **Feature flags** — ¿se usan? ¿donde se configuran?
- [ ] **Tests** — ¿hay tests? ¿que cobertura? ¿corren en CI?
- [ ] **Performance baseline** — tiempos de carga, latencia de API, metricas clave

### Demo en video

Idealmente el dev anterior graba un video de:
- [ ] Cada feature principal del producto
- [ ] Cada customer journey critico
- [ ] El proceso de deploy
- [ ] Troubleshooting comun

---

## 10. Diseño y UX

### Checklist

- [ ] **Wireframes / mockups** — Figma, Sketch, Adobe XD, otro
  - [ ] ¿Bajo que cuenta estan los archivos?
  - [ ] ¿Tienen permisos de edicion o solo visualizacion?
- [ ] **Design system / component library** — ¿documentado? ¿en Storybook?
- [ ] **Branding / libro de marca** — colores, tipografia, logo, tono de voz
- [ ] **Assets graficos** — iconos, ilustraciones, fotos — ¿donde estan? ¿licencias?
- [ ] **Responsive breakpoints** — ¿definidos? ¿consistentes?
- [ ] **Accesibilidad** — ¿se considero? ¿hay auditorias previas?

---

## 11. Secuencia de Ejecucion

El orden importa. Seguir esta secuencia segun el nivel de riesgo:

### Riesgo ALTO (dev contencioso + acceso a prod)

```
Dia 1: Legal (Seccion 2) — cesion de IP, NDA
Dia 1: Fork/mirror del repo (Seccion 3) — copia de seguridad
Dia 2: Transferencia de ownership (Seccion 3) — repo, cloud, dominios
Dia 2: Rotacion de secrets + revocar accesos (Seccion 8)
Dia 3: Inventario de servicios (Seccion 5) + infra (Seccion 6)
Dia 4: Documentacion tecnica (Seccion 4) + DB (Seccion 7)
Dia 5: Estado del producto (Seccion 9) + diseño (Seccion 10)
```

### Riesgo MEDIO (dev neutral)

```
Semana 1: Legal (Seccion 2) + transferencia de ownership (Seccion 3)
Semana 1: Inventario completo (Secciones 4-7)
Semana 2: Seguridad (Seccion 8) + estado del producto (Seccion 9)
Semana 2: Diseño (Seccion 10) + configuracion local
```

### Riesgo BAJO (dev cooperativo)

```
Semana 1-2: Handover guiado con el dev (Secciones 3-10 en orden)
Semana 2: Verificacion independiente + seguridad (Seccion 8)
```

---

## 12. Criterios de Aceptacion

El takeover se considera **completo** cuando:

- [ ] Todo el codigo fuente esta bajo cuentas del cliente
- [ ] Todas las cuentas de servicios estan bajo email/pago del cliente
- [ ] Todos los secrets han sido rotados
- [ ] El dev anterior no tiene acceso a ningun sistema
- [ ] Se puede hacer un deploy completo desde cero (build + deploy + verificar)
- [ ] Hay al menos un diagrama de arquitectura actualizado
- [ ] El ambiente de desarrollo local funciona en tu maquina
- [ ] Los backups estan verificados (restore probado)
- [ ] El cliente tiene documentado donde esta cada cosa (este documento, completado)

---

## Notas

- Este SOP es una plantilla. Adaptar a cada proyecto eliminando secciones que no aplican.
- Guardar el SOP completado como evidencia del estado del handover.
- Revisar este documento a las 2 semanas y al mes post-takeover para detectar items faltantes.
