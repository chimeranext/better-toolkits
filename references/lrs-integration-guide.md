# LRS Integration Guide

Cómo conectar un curso del toolkit a un Learning Record Store (LRS) para tracking
xAPI + cmi5. v1 del toolkit ingiere datos via CSV export; v2 con adapters API.

---

## 1. ¿Qué es un LRS y cuándo lo necesitás?

Un Learning Record Store guarda xAPI statements emitidos por los AUs durante el uso.
Permite:

- Medir **L2 Learning** (pass rates de quizzes, score distributions, time-on-task).
- Alimentar dashboards de progreso.
- Generar certificates condicionados a satisfaction del curso.
- Historical tracking (un alumno que completó el curso hace 2 años puede recuperar
  su estado).

**Lo necesitás cuando**: tu curso va a vivir más de una cohorte o requerís accountability
de completion contra stakeholders (empleadores, entes regulatorios, sponsors).

**NO lo necesitás cuando**: estás iterando el syllabus en design mode, pre-pilot. En
ese caso alcanza con `/course-visualize` + dogfooding manual.

---

## 2. Opciones de LRS

### Ralph LRS (target principal para chimera Pathways)

- Self-hosted, stack Python/Django + Postgres.
- Open source (MIT), desarrollado por France Université Numérique.
- URL: <https://ralph.io>.
- Referencia interna: [legacy-ticket](https://linear.app/chimera-coding/issue/legacy-ticket) — spike
  Custom LRS xAPI en Supabase evaluando Ralph como base.
- **Ventaja**: ownership completo de los datos, no vendor lock-in.
- **Costo**: infra + mantenimiento (Supabase free tier puede servir para dev;
  Cloud Run + Cloud SQL para prod).

### SCORM Cloud (Rustici)

- SaaS, tier gratis con límite de registrations/mes (~100 free).
- URL: <https://scorm.com/scorm-solved/scorm-cloud-features/>.
- Acepta cmi5, SCORM 1.2, SCORM 2004.
- **Uso principal en el toolkit**: sandbox para validar paquetes cmi5 antes de release.
- **Ventaja**: zero setup.
- **Costo**: $0-$300/mes según volume.

### Learning Locker (HT2 Labs)

- Self-hosted UK, stack MongoDB + Node.
- Open source (GPL v3).
- URL: <https://www.ht2labs.com/learning-locker-community>.
- **Ventaja**: community edition gratuita, analytics dashboard built-in.

### Moodle xAPI subsystem

- Desde Moodle 4.2+ hay API nativa para xAPI statements (`core_xapi`).
- NO es un LRS completo — almacena statements como eventos internos, sin query rich
  como Ralph/Learning Locker.
- URL docs: <https://moodledev.io/docs/4.4/apis/subsystems/xapi>.
- **Uso**: fine si tu único LMS es Moodle y el tracking es básico.

---

## 3. Moodle `mod_cmi5` plugin

Para hospedar paquetes cmi5 en Moodle:

- Plugin tercero, no built-in (contraste: `mod_scorm` sí es built-in).
- URL: <https://moodle.org/plugins/mod_cmi5>.
- Requiere Moodle 3.9+.
- Integra con un LRS externo (Ralph, SCORM Cloud, Learning Locker).

**Setup típico en Freedom Academy** (referencia
[CIV-564](https://linear.app/chimera-coding/issue/CIV-564)):

1. Instalar `mod_cmi5` via admin UI.
2. Configurar LRS endpoint + credentials en plugin settings.
3. Upload del paquete cmi5 .zip como actividad en el curso.
4. Los statements van al LRS configurado (no al Moodle interno).

---

## 4. Moodle `mod_scorm` (legacy reference)

- Built-in en Moodle core.
- Soporta SCORM 1.2 y SCORM 2004.
- **NO soporta cmi5** nativamente — necesita `mod_cmi5`.
- Uso actual en Freedom Academy: Articulate Rise exporta SCORM 2004 4th Edition, se
  sube via el admin panel, `mod_scorm` lo sirve.
- Limitación: tracking limitado al `cmi.*` datamodel de SCORM, sin xAPI rich
  statements.

---

## 5. Testing flow recomendado

```
Local dev (design-time)
   └── /course-visualize para validar Bloom's + ships
       │
       ▼
Pre-release validation
   └── SCORM Cloud sandbox
       - Upload paquete cmi5 (v2 /course-package)
       - Correr 1 full session
       - Verificar que 9 verbs se emiten correctamente
       │
       ▼
Staging / pilot cohort
   └── Ralph staging (self-hosted dev)
       - Enrolar 3-10 alumnos
       - Recolectar xAPI + feedback Tally
       - /course-retro con los datos
       │
       ▼
Production
   └── Ralph prod | Moodle mod_cmi5 | Cornerstone | ...
```

---

## 6. CSV export format para `/course-retro` v1

Todos los LRSs ofrecen export en CSV (diferentes columnas). El toolkit v1 usa un
formato canónico (ver `adapters/xapi/csv.md`):

```csv
learner_id,au_id,verb,timestamp,score,success,completion,duration
juan@chimeranext.io,au:riverpod-001,passed,2026-04-01T10:00:00Z,0.85,true,true,PT45M
maria@...,au:riverpod-001,failed,2026-04-01T11:00:00Z,0.65,false,false,PT30M
```

Transformación de cada LRS al canónico:
- **Ralph**: SQL query + export CSV via `ralph` CLI.
- **SCORM Cloud**: Reports → Download CSV.
- **Learning Locker**: Reports → Export.
- **Moodle xAPI**: query `mdl_xapi_states` table + transform.

v2 del toolkit agrega adapters API-based que hacen la transformación automática
(ver `adapters/xapi/{ralph,scorm-cloud,learning-locker}.md`).
