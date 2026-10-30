# CLH — Copyright/License Header (doctrina)

> Policy/doctrine SSOT para headers de copyright/licencia. La fuente de verdad es
> el `LICENSE.md` de cada repo (startup-agnostic). Esta doctrina define el
> mecanismo y la interpretación correcta.

## Principio

Cada repo tiene su propia licencia (`LICENSE.md`). El header de cada archivo refleja
**de quién es la propiedad intelectual (IP) de ese archivo**:

- **IP de la startup** → header de **la licencia del repo** (la startup es la
  titular).
- **IP de terceros** (código ajeno incorporado/adaptado) → header de la
  **licencia original del tercero**.

## Quién lleva el header del repo (IP de la startup)

**Todo** archivo cuya IP es de la startup lleva el header del repo. Esto incluye
**código generado/vendored por la startup** (build, scaffolding, plantillas
propias, artefactos generados): son de la startup y deben llevar su header. NO se
excluyen "por ser generados".

## Quién lleva OTRA licencia (IP de terceros)

Solo el código **realmente ajeno** (librerías/mit, scriptos copiados de
StackOverflow/blogs, código de otros proyectos) conserva su **licencia original**.
Ese header indica la licencia del tercero, no la del repo.

## Procedimiento (startup-agnostic)

1. **Leer `LICENSE.md` del repo** y verificar qué exige (qué texto de header, a
   qué archivos aplica).
2. **Clasificar cada archivo:** IP de la startup (→ header del repo) vs IP de
   terceros (→ licencia original).
3. **Aplicar el header correspondiente.**
4. **Formato estandarizado** (header del repo):

   ```text
   // SPDX-License-Identifier: <SPDX-ID>
   // Copyright (C) <año> <titular>. All rights reserved.
   ```

## Corrección de LICENSE.md (si es ambiguo)

Si un `LICENSE.md` usa frases ambiguas (p.ej. "derivados de terceros" sin
definir quién es tercero), el repo debe **corregir la redacción** del LICENSE.md
para que defina explícitamente:
- qué es IP de la startup (header del repo obligatorio, incluido generados/vendored),
- qué es IP de terceros (licencia original),
- el formato exacto del header.

## Aplicación

- **Generador** (perfil Better): leer `LICENSE.md`; poner header del repo a toda
  IP de la startup (incluido generados/vendored); poner licencia original solo a
  IP de terceros.
- **Auditor** (revisión de PRs): verificar que cada archivo lleva el header
  correcto según su IP; los generados/vendored DEBEN llevar el header del repo;
  solo los de terceros llevan otra licencia.

## Referencias

- Relacionado: **CCC** (Code Comment Convention) — header de licencia = metadato
  legal, no comentario de "cómo".
- Fuente de verdad por repo: cada `LICENSE.md`.
