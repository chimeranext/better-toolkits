---
description: "Ingiere xAPI + Tally/Typeform CSV de una cohorte y produce retro report Kirkpatrick L1-L4 con iteration candidates priorizados"
argument-hint: "[course-slug]"
---

# /course-retro

Invocar skill `instructional-design-toolkit:course-retro` con `$ARGUMENTS` = slug.

Skill pide al usuario los paths de:
- xAPI CSV export (de Ralph / SCORM Cloud / Learning Locker / Moodle, formato canónico)
- Tally/Typeform CSV exports (uno por módulo, opcional)

Genera `docs/instructional-design/courses/{slug}/retros/retro-cohort-{N}.md`.
