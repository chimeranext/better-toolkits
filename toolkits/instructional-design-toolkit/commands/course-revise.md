---
description: "Aplica cambio al syllabus + bumpea versión semver + genera CHANGELOG entry + flagea impacto si MAJOR"
argument-hint: "[course-slug]"
---

# /course-revise

Invocar skill `instructional-design-toolkit:course-revise` con `$ARGUMENTS` = slug
del curso a revisar.

Side effects:
- Modifica `course.json` (bump version + append version_timeline + apply changes)
- Crea/append `CHANGELOG.md`
- Si MAJOR: warna sobre learner impact y pide grandfather clause vs breaking
