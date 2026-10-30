# CLH — Copyright/License Header (doctrina)

> Policy/doctrine SSOT para headers de copyright/licencia. **La fuente de verdad es
> el `LICENSE.md` de cada repo** (startup-agnostic) — esta doctrina solo provee el
> mecanismo de aplicación y el formato, no inventa una regla global.

## Principio

Cada repo tiene su propia licencia (`LICENSE.md`). La obligatoriedad y ubicación de
los headers se **ley del `LICENSE.md` de ese repo**, no de una convención externa.
Un patrón observado en un repo (p.ej. BSL-1.1 en vertivolatam, donde el LICENSE.md
exige header en archivos **derivados de terceros**) no se extrapola a otros repos.

## Procedimiento (startup-agnostic)

1. **Leer `LICENSE.md` del repo** y extraer qué exige:
   - ¿Requiere header en cada archivo fuente?
   - ¿Solo en archivos derivados de terceros?
   - ¿Solo en artefactos distribuibles/config?
   - ¿Qué texto/expresión de copyright usar?
2. **Aplicar según lo que el LICENSE.md indique.** No asumir; verificar.
3. **Formato estandarizado** (cuando el LICENSE.md exige header):

   ```text
   // SPDX-License-Identifier: <SPDX-ID>
   // Copyright (C) <año> <titular>. All rights reserved.
   ```

## Excepciones (siempre)

- **Generados:** build, `.dart_tool`, `.venv`, `node_modules`, caches — no llevan
  header (se regeneran).
- **Vendored/terceros:** preservan su propia licencia; no se les añade el header
  del repo.

## Aplicación

- **Generador** (perfil Better): antes de añadir headers, leer `LICENSE.md` del
  repo y aplicar exactamente lo que exige.
- **Auditor** (revisión de PRs): verificar que los headers cumplen lo que el
  `LICENSE.md` del repo exige (ni de más ni de menos); los archivos generados/
  vendored no deben tener header del repo.

## Referencias

- Relacionado: **CCC** (Code Comment Convention) — el header de licencia es
  metadato legal, no un comentario de "cómo".
- Ejemplo real: `vertivolatam/monorepo/LICENSE.md` (BSL-1.1) exige header solo en
  archivos derivados de terceros.
