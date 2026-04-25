# cmi5 Packaging Guide

Guía técnica para producir cursos cmi5-compliant. v1 del toolkit maneja metadata
cmi5 en el JSON desde origen; v2 agrega `/course-package` para generar `.zip` final.

---

## 1. Qué es cmi5

`cmi5` es un "perfil" de xAPI diseñado para LMS tradicionales. Reemplaza SCORM 1.2/2004
con un modelo más flexible basado en xAPI statements.

**Ventajas sobre SCORM**:
- Statements granulares (cada interacción es trackeable).
- Mejor soporte mobile (no depende de la JavaScript API de LMS).
- Portable entre LMSs.
- Tracking rico de interactions custom.

**Target LRSs de este toolkit**: Ralph (self-hosted, target principal para chimera
Pathways), SCORM Cloud (SaaS sandbox para testing), Learning Locker (UK, self-hosted).

---

## 2. `cmi5.xml` manifest

Cada paquete cmi5 incluye un manifest con estructura course → blocks → AUs:

```xml
<courseStructure xmlns="https://w3id.org/xapi/profiles/cmi5/v1/CourseStructure.xsd">
  <course id="course:flutter-fullstack-2026">
    <title><langstring lang="es">Flutter Full-Stack</langstring></title>
    <description><langstring lang="es">...</langstring></description>
  </course>

  <block id="block:module-01-dart-fundamentals">
    <title><langstring lang="es">Dart Fundamentals</langstring></title>
    <au id="au:dart-fundamentals-001"
        moveOn="CompletedAndPassed"
        masteryScore="0.75"
        launchMethod="AnyWindow">
      <title><langstring lang="es">Dart Fundamentals</langstring></title>
      <url>au-01/index.html</url>
      <activityType>http://adlnet.gov/expapi/activities/lesson</activityType>
    </au>
  </block>
</courseStructure>
```

### AU attributes

| Atributo | Tipo | Default | Descripción |
|---|---|---|---|
| `id` | IRI | — | **Inmutable**. URL-safe (ej. `au:setup-001`). Cambiarlo rompe historial xAPI. |
| `masteryScore` | 0.0-1.0 | 0.75 | Threshold para "Passed". |
| `moveOn` | enum | CompletedAndPassed | Criterio de satisfaction. Ver §3. |
| `launchMethod` | `AnyWindow` \| `OwnWindow` | AnyWindow | AnyWindow permite iframe embed. |
| `activityType` | URI | `lesson` | Ver §5 para tipos comunes. |

---

## 3. moveOn criteria semantics

| Valor | Cuándo usar |
|---|---|
| `Passed` | AU solo requiere approbar (ej. challenge sin completion tracking). |
| `Completed` | AU solo requiere completar (ej. video sin quiz). |
| `CompletedAndPassed` | Ambos requeridos (default para módulos con quiz). |
| `CompletedOrPassed` | Cualquiera basta. |
| `NotApplicable` | AU opcional, no cuenta para satisfaction del course. |

---

## 4. 9 Verbos cmi5 — lifecycle

El AU (HTML launchable) emite statements en orden canónico:

```
1. Launched     — al cargar el AU HTML
2. Initialized  — después de auth con LRS vía launch URL params
3. (contenido del AU: progreso, interactions, quiz responses)
4. Completed    — al terminar contenido (último slide Marp, o botón explícito)
5. Passed       — si masteryScore alcanzado (opcional si AU no tiene scoring)
6. Failed       — si masteryScore NO alcanzado
7. Terminated   — al cerrar/abandonar voluntariamente
8. Satisfied    — LMS emite si moveOn cumplido (NO el AU)
9. Waived       — LMS emite si admin exonera (NO el AU)
```

`Abandoned` se emite en `beforeunload` si la session expira sin `Terminated`.

**v2**: `xapi-wrapper.js` (~80-100 LOC, sin deps) embebido en cada Marp deck emite los
verbs 1-7 automáticamente. Los verbs 8-9 los emite el LMS.

---

## 5. Activity Types comunes

| Tipo de class | URI |
|---|---|
| Lesson | `http://adlnet.gov/expapi/activities/lesson` |
| Assessment (quiz) | `http://adlnet.gov/expapi/activities/assessment` |
| Simulation (challenge) | `http://adlnet.gov/expapi/activities/simulation` |
| Course (root) | `http://adlnet.gov/expapi/activities/course` |
| Module (block) | `http://adlnet.gov/expapi/activities/module` |

---

## 6. Packaging strategy (v2 scope)

`/course-package` genera:

```
dist/
├── cmi5.xml                        ← manifest generado desde course.json
├── au-01/
│   ├── index.html                  ← Marp render + xapi-wrapper.js inline
│   └── (assets del deck)
├── au-02/
│   └── index.html
├── ...
└── course-package.zip              ← todo zipeado, upload-ready
```

`xapi-wrapper.js` responsibilities:
- Parse launch URL params: `endpoint`, `auth`, `actor`, `activityId`, `registration`.
- POST statements al endpoint por cada verb emitido.
- Listener `beforeunload` para `Terminated`/`Abandoned`.
- Listener al último slide de Marp (`slide:last`) para `Completed`.

---

## 7. Testing

| Ambiente | Propósito |
|---|---|
| Local dev | Validar `cmi5.xml` syntax con ADL cmi5 CTS (Course Test Suite). |
| SCORM Cloud sandbox | Free tier, valida paquetes completos contra LRS real. |
| Ralph staging | Target prod Pathways. |
| Moodle mod_cmi5 | Si el curso se va a hospedar en Moodle (ver LRS integration guide). |

Paso obligatorio antes de release v1.x de un curso: correr el paquete contra SCORM Cloud
sandbox + capturar 1 full session (Launched → Terminated) para validar que el wrapper
emite todos los verbs correctamente.
