---
name: contract-nda
description: >
  Genera un Acuerdo de Confidencialidad (NDA) bilingue para firmar antes de
  cualquier engagement. Usa este skill cuando el usuario mencione "NDA",
  "acuerdo de confidencialidad", "non-disclosure", "confidentiality agreement",
  "firmar antes de empezar", "necesito un NDA", "antes de ver el codigo",
  o cualquier situacion donde se necesite proteger informacion antes de
  compartir detalles del proyecto.
---

# NDA Generator

Genera un Acuerdo de Confidencialidad (Non-Disclosure Agreement) mutuo y bilingue,
personalizado con los datos de ambas partes. Este es siempre el PRIMER documento
en cualquier engagement — se firma ANTES de compartir cualquier acceso, codigo,
credenciales o informacion del proyecto.

## Regla de idioma

Todo el contenido generado debe estar en **espanol**. Los terminos legales clave
se mantienen en ingles entre parentesis, tal como aparecen en el template
(ej. "Informacion Confidencial (Confidential Information)").

## Directorio de salida

Todos los archivos van en `./fractional-cto/contracts/` dentro del directorio de trabajo actual.

## Contexto del Profesional

El CTO opera como **persona fisica** (independent professional). Nunca mencionar
"chimeranext" ni ninguna razon social — el NDA se firma a titulo personal.

## Flujo del skill

### Paso 1 — Datos de las partes

Recopilar los datos necesarios para completar el NDA. Si el usuario ya proporciono
informacion en la conversacion previa o en contexto anterior, no repetir — extraer
de lo que ya dijo. Se puede hacer en una sola pregunta si el usuario ya dio contexto.

**Datos del proyecto:**
> ¿Como se llama el proyecto? (se usa para nombrar el archivo)

**Datos del Profesional (El CTO):**

| Campo | Placeholder |
|-------|-------------|
| Nombre completo | `{CTO_NOMBRE}` |
| Cedula de identidad | `{CTO_CEDULA}` |
| Correo electronico | `{CTO_EMAIL}` |
| Domicilio | `{CTO_DOMICILIO}` |

> Si estos datos ya se conocen de un engagement anterior o del contexto de la
> conversacion, confirmar con el usuario en lugar de volver a preguntar.

**Datos del Cliente:**

| Campo | Placeholder |
|-------|-------------|
| Razon social o nombre completo | `{CLIENTE_NOMBRE}` |
| Cedula juridica o de identidad | `{CLIENTE_CEDULA}` |
| Representante legal | `{CLIENTE_REPRESENTANTE}` |
| Correo electronico | `{CLIENTE_EMAIL}` |
| Domicilio | `{CLIENTE_DOMICILIO}` |

> Si el cliente es persona fisica, el representante legal es el mismo nombre.
> Preguntar si es persona fisica o juridica para ajustar.

### Paso 2 — Configuracion del NDA

Preguntar (con defaults claros para que el usuario solo confirme):

**Duracion post-terminacion:**
> ¿Cuantos anos de confidencialidad despues de terminar el engagement?
> Default: **2 anos** (estandar de la industria).

Esto llena `{NDA_DURACION_ANOS}` (numero) y `{NDA_DURACION_ANOS_TEXTO}` (texto).

**Plazo de devolucion:**
> ¿Cuantos dias habiles para devolver/destruir informacion confidencial al terminar?
> Default: **15 dias habiles**.

Esto llena `{PLAZO_DEVOLUCION_DIAS}`.

**Alcance de la informacion:**
> ¿Que tipo de informacion se va a compartir? (puede ser mas de una)
> - a) Codigo fuente y arquitectura
> - b) Credenciales y accesos (API keys, tokens, passwords)
> - c) Datos de negocio (planes, financieros, clientes)
> - d) Datos de usuarios (PII, bases de datos)
> - e) Todo lo anterior

> Default: **e) Todo lo anterior** — el template ya cubre todos los tipos.
> Si el usuario selecciona opciones especificas, NO se eliminan secciones del
> template (el NDA es mas fuerte siendo comprehensivo). Solo se usa esta respuesta
> para validar que el usuario entiende que tipo de info va a compartir.

**Fecha de firma:**
> ¿Fecha de firma? Default: **fecha de hoy** ({FECHA_FIRMA}).

Si el usuario acepta todos los defaults, este paso se resuelve en un solo intercambio.

### Paso 3 — Generar NDA

1. Leer el template base: `${CLAUDE_PLUGIN_ROOT}/references/contracts/01-nda.md`
2. Reemplazar TODOS los placeholders con los datos recopilados:
   - `{CTO_NOMBRE}` → nombre del profesional
   - `{CTO_CEDULA}` → cedula del profesional
   - `{CTO_EMAIL}` → email del profesional
   - `{CTO_DOMICILIO}` → domicilio del profesional
   - `{CLIENTE_NOMBRE}` → nombre o razon social del cliente
   - `{CLIENTE_CEDULA}` → cedula del cliente
   - `{CLIENTE_REPRESENTANTE}` → representante legal del cliente
   - `{CLIENTE_EMAIL}` → email del cliente
   - `{CLIENTE_DOMICILIO}` → domicilio del cliente
   - `{NDA_DURACION_ANOS}` → numero de anos (ej. `2`)
   - `{NDA_DURACION_ANOS_TEXTO}` → texto del numero (ej. `dos`)
   - `{PLAZO_DEVOLUCION_DIAS}` → dias habiles para devolucion (ej. `15`)
   - `{FECHA_FIRMA}` → fecha en formato `DD de mes de YYYY` (ej. `09 de abril de 2026`)
3. Verificar que NO queden placeholders sin reemplazar (ningun `{...}` en el documento final)
4. Escribir el archivo en `./fractional-cto/contracts/{slug}-nda.md`
   - El slug se genera del nombre del proyecto en minusculas, espacios reemplazados por guiones,
     sin caracteres especiales (ej. "Mi Proyecto Cool" → `mi-proyecto-cool-nda.md`)

### Paso 4 — Confirmacion

Presentar al usuario:

1. **Archivo generado:** ruta completa al NDA
   - `./fractional-cto/contracts/{slug}-nda.md`
2. **Disclaimer obligatorio:**
   > "Este documento es una plantilla y requiere revision de un abogado antes de usar.
   > No constituye asesoramiento legal."
3. **Recordatorio de proceso:**
   > "Firmar ANTES de compartir cualquier acceso, codigo, credenciales o informacion del proyecto."
4. **Siguiente paso sugerido:**
   > "Despues de firmar el NDA, usa `/takeover-assessment` para evaluar el riesgo del proyecto
   > antes de comprometerte con un alcance o precio."

## Notas para el modelo

- Este es el skill mas simple del toolkit. No tiene logica compleja, branching
  por riesgo ni documentos multiples. Debe ser rapido: 2-3 intercambios maximo
  si el usuario ya tiene los datos listos.
- El NDA del template es **MUTUO** (ambas partes tienen obligaciones). No modificar
  esta naturaleza — protege tanto al CTO como al cliente.
- Si el usuario dice "usa los mismos datos que la vez pasada" o similar, buscar
  en el contexto de la conversacion. Si no hay contexto previo, pedir los datos.
- No inventar datos. Si falta un campo obligatorio, preguntar.
- El template ya incluye la clausula de Ley 8968 (Proteccion de Datos de Costa Rica)
  y arbitraje via Camara de Comercio. No agregar clausulas adicionales.
- Nunca eliminar secciones del template — el NDA es mas fuerte siendo comprehensivo.
- El disclaimer de "requiere revision de un abogado" SIEMPRE debe aparecer,
  tanto en el documento generado como en la confirmacion al usuario.
