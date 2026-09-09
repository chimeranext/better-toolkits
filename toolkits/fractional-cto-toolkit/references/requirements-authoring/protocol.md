# Skill `requirements-authoring` — protocol SSOT

---

# PRD / SRS Authoring Protocol

Convierte la idea de producto de un cliente en un **PRD / SRS** versionado, redactado
según **ISO/IEEE 830:1998** y **ISO/IEC/IEEE 29148:2018**, que cualquier startup pueda
adoptar desde el día uno. El PRD/SRS es la **fuente de verdad** de los requisitos; todo
lo demás (OpenSpec, issues, ramas, PRs) se **deriva de él**.

## Orden crítico (requisitos-first)

```
1. PRD / SRS       → se escribe PRIMERO (std 830 + 29148), autor = Product Owner
2. OpenSpec        → se genera DERIVADO del PRD (guías de implementación de los issues)
3. Issue Linear    → brief en formato Bilingual Layer  (HUMAN LAYER + AGENT LAYER)
4. /opsx-explore   → pensar, NO implementar
5. /opsx-propose   → planning only (drafts the plan; human reviews)
6. revisión humana → human-in-the-loop (HITL) — DO NOT skip
7. /opsx-apply     → código en satélites (repos de trabajo)
8. PR vinculado    → nuevo PR linkeado al issue Linear
9. /opsx-sync      → opcional; reconcilia specs
10. /opsx-archive  → SOLO con OK humano
```

> **Anti-patrón prohibido:** derivar el PRD desde OpenSpec, o tratar OpenSpec como la
> fuente de verdad de requisitos. OpenSpec describe *cómo* el sistema implementa los
> requisitos que el PRD ya fijó.

## Referencias normativas

| Estándar | Rol |
| --- | --- |
| **ISO/IEC/IEEE 29148:2018** | Estándar vigente/actual — *Systems and software engineering — Life cycle processes — Requirements engineering*. Reemplaza la parte de SRS de la IEEE 830. |
| **ISO/IEEE 830:1998** | Estándar histórico — *IEEE Recommended Practice for Software Requirements Specifications*. Retirado pero aún citado; su estructura de secciones es la base del template. |

En la práctica: escribir con la **estructura del template bare** (heredada de 830) y
cumplir los **criterios de calidad de requisito de 29148** (único, atómico, verificable,
trazable, sin ambigüedad, sin jerga de implementación, expresado con **shall/should/may**
per RFC 2119).

## Estructura del template

Template en blanco: [`srs-bare-template.md`](srs-bare-template.md) — vendido de
[`jam01/SRS-Template`](https://github.com/jam01/SRS-Template) (`srs-template-bare.md`,
licencia CC0 1.0, acreditado en encabezado del archivo).

Secciones (orden canónico):

1. **Introducción** — propósito del doc, scope del producto, glosario, referencias, overview.
2. **Product Overview** — perspectiva, funciones, restricciones, características de usuario,
   asunciones/dependencias, apportioning.
3. **Requirements** — interfaces externas, funcionales, calidad de servicio (perf, security,
   reliability, availability, observability), compliance, diseño/implementación, AI/ML.
4. **Verification** — tabla Requisito × Método de verificación × Evidencia.
5. **Appendixes**.

Cada archivo generado lleva a continuación el **conjunto mínimo de buenas prácticas de
ingeniería** del cliente (los 4 best practices; ver
[`engineering-standards/README.md`](../engineering-standards/README.md)):
DSMS, IFS, CPS y PRDS — adoptables desde el inicio, sin refactor legacy.

## Regla de idioma

Todo el contenido generado debe estar en el idioma del cliente (por defecto **español**,
con términos técnicos en inglés). El encabezado del PRD incluye `Prepared by`, `Version`
(semver) y tabla de revisiones. La primera versión siempre es **0.1**.

## Directorio de salida

Todos los archivos van en `./fractional-cto/requirements/` dentro del directorio de
trabajo actual:

```
fractional-cto/
└── requirements/
    ├── PRD.md                     # PRD/SRS en formato template (fuente de verdad)
    ├── requirements-checklist.md  # criterios 29148 aplicados a cada requisito
    ├── verification.md            # tabla Requisito × Método × Evidencia
    └── openspec/                  # (paso 2) specs derivadas del PRD
```

## Flujo del skill

### Paso 1 — Obtener contexto del producto

Verificar si existe `./fractional-cto/` con contexto previo (assessment, business model
vault, etc.). Si existe, cargar el estado y extraer: propósito del producto, usuarios,
dominio, restricciones, asunciones. Si no existe, preguntar al usuario (Paso 1b).

### Paso 1b — Reunir input (si falta)

Confirmar con el usuario lo mínimo para redactar:

- Nombre del producto y versión
- Propósito y boundaries (qué hace / qué NO hace)
- Usuarios/roles y acceso
- Integraciones externas (APIs, sistemas previos)
- Restricciones de cumplimiento (regulatorio, contabilidad, privacidad)
- Deadline / milestones del MVP

### Paso 2 — Escribir el PRD/SRS

Usar `srs-bare-template.md` al pie de la letra. Rellenar cada sección según 29148:

- Requisitos en formato verificable: `El sistema SHALL <comportamiento observable>` con
  criterio de aceptación por requisito.
- Sin jerga de implementación en §3.2 (funcionales); las decisiones técnicas van a §3.5
  (Design and Implementation) y a OpenSpec/design.md.
- Cada requisito funcional importante lleva ID (ej. `FR-001`) para la tabla de verificación.
- NFRs explícitos: performance, security, reliability, availability, observability.

### Paso 3 — Checklist 29148 + tabla de verificación

Generar `requirements-checklist.md`: por cada requisito marcar unique / atomic /
verifiable / traceable / unambiguous / implementation-free. Llenar `verification.md`
con método (test, test del usuario, revisión, demo) y artefacto por requisito.

### Paso 4 — Derivar OpenSpec desde el PRD (NO al revés)

Una vez aprobado el PRD (revisión humana), derivar:

- `openspec/config.yaml` — contexto de stack.
- `openspec/specs/{dominio}/spec.md` — requisitos **derivados** del PRD en formato
  OpenSpec: cada requisito con `MUST/SHALL/SHOULD` (RFC 2119) + escenarios GIVEN/WHEN/THEN.
- Por cada cambio: `openspec/changes/{slug}/{proposal,design,tasks}.md` — el proposal.md
  cita el PRD como fuente upstream.

Ver [`openspec-quick-guide.md`](openspec-quick-guide.md) para el flujo `/opsx-*` completo.

### Paso 5 — Issues Linear (Bilingual Layer) y workflow

Con el PRD aprobado: crear el issue Linear con **bilingual-issue-brief.md**
(ver `make-no-mistakes-toolkit/templates/bilingual-issue-brief.md`), asignando
Type/Size/Strategy según taxonomía del tracker. Luego:

```
/opsx-explore (opcional, pensar) → /opsx-propose → revisión humana → /opsx-apply
→ nuevo PR vinculado al issue → /opsx-sync (opcional) → /opsx-archive (solo con OK humano)
```

### Paso 6 — Entregar

Resumen ejecutivo (Minto): 1 frase de la decisión + argumentos + evidencia. Ruta de los
archivos. Siguiente acción (paso 5).

## Anti-patrones

1. **OpenSpec como fuente de verdad de requisitos** — el PRD manda; OpenSpec es derivado.
2. **Requisitos vagos o no verificables** ("el sistema debe ser rápido" → viola 29148).
3. **Saltar el checklist** — cada requisito debe pasar unique/atomic/verifiable/traceable.
4. **Escribir PRD ya con implementación** — §3.2 es funcional, no diseño; el "cómo" va a
   §3.5 y a OpenSpec design.md.
5. **Generar el PRD después de los issues** — el orden es PRD → OpenSpec → issues → PRs.

## Checklist final

- [ ] PRD escrito con template bare (estructura 830), versión 0.1
- [ ] Requisitos con ID, SHALL/SHOULD/MAY, criterio de aceptación (29148)
- [ ] Checklist unique/atomic/verifiable/traceable/unambiguous/implementation-free
- [ ] Tabla de verificación Requisito × Método × Evidencia llena
- [ ] Revisión humana del PRD antes de derivar OpenSpec
- [ ] OpenSpec derivado del PRD (proposal cita PRD como fuente upstream)
- [ ] Issue Linear con brief Bilingual Layer + taxonomía (Type/Size/Strategy)
- [ ] Workflow /opsx-propose → revisión → /opsx-apply → PR → /opsx-archive (con OK)
- [ ] Los 4 best practices (DSMS/IFS/CPS + PRDS) referenciados en el PRD/README del cliente

## Relacionados

| Recurso | Tema |
| --- | --- |
| [`srs-bare-template.md`](srs-bare-template.md) | Template en blanco (vendido de jam01, CC0) |
| [`openspec-quick-guide.md`](openspec-quick-guide.md) | Flujo `/opsx-*` + derivación PRD→OpenSpec |
| [`engineering-standards/README.md`](../engineering-standards/README.md) | Los 4 best practices del cliente (DSMS, IFS, CPS, PRDS) |
| `jam01/SRS-Template` | Repo upstream del template (CC0) |
| `Fission-AI/OpenSpec` | Framework OpenSpec (docs/getting-started.md) |