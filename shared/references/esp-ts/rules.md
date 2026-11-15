# Reglas nucleares de ESTE — v0.1

Severidad:

- `error` — corregir en modo Strict; casi siempre también en ESTE-flavored
- `warning` — corregir en Strict; orientativo en ESTE-flavored
- `advisory` — preferible; no forzar si perjudica una prosa natural útil

Cada regla tiene un ID. Mantén los ID estables entre versiones.

---

## Terminología

### ESTE-001 — Un concepto, un término

- **Severidad:** error
- **Origen:** STE, ISO24495, ESTE
- **Regla:** Usa la misma palabra para el mismo concepto en todo el documento. No diversifiques con sinónimos.
- **Mal:** `usuario` / `cliente` / `cuenta` para el mismo actor
- **Bien:** elige `usuario` y mantenlo

### ESTE-013 — Define los términos de dominio una vez

- **Severidad:** warning
- **Origen:** STE, ISO24495
- **Regla:** Si un término técnico es necesario, defínelo en el primer uso (o en un glosario) y luego reutilízalo exactamente.
- **Mal:** jerga sin explicar, usada una sola vez
- **Bien:** `Token de acceso (token): clave temporal...` y después siempre `token de acceso`

### ESTE-014 — Prefiere español claro y compartido

- **Severidad:** warning
- **Origen:** ES, ISO24495
- **Regla:** Prefiere un término español claro ya compartido por la audiencia frente a un anglicismo innecesario. Conserva el inglés solo si es el término estable del dominio.
- **Mal:** `hacer un deploy del release` si el equipo dice `desplegar la versión`
- **Bien:** `Despliega la versión.` (o mantén `deploy` si el glosario del proyecto lo fija — y usa solo esa forma)

### ESTE-016 — Evita falsos amigos

- **Severidad:** error
- **Origen:** ES
- **Regla:** No uses palabras españolas en el sentido del falso amigo inglés cuando crean ambigüedad.
- **Vigilancia:** `actual` (≠ current), `realizar` (prefiere verbo concreto), `soportar` (prefiere `admitir` / `ser compatible con` / `resistir`), `eventualmente` (≠ eventually), `aplicar` (aclara el objeto)
- **Mal:** `el usuario actual` cuando quieres decir `este usuario` / `el usuario en sesión`
- **Bien:** `este usuario` o `el usuario en sesión`

---

## Voz y actores

### ESTE-002 — Voz activa; nombra el actor

- **Severidad:** error
- **Origen:** STE, ISO24495
- **Regla:** Prefiere la voz activa. Nombra el actor si se conoce y es relevante.
- **Mal:** `El archivo es eliminado.`
- **Bien:** `El agente elimina el archivo.`

### ESTE-009 — Evita el _se_ impersonal ambiguo

- **Severidad:** error
- **Origen:** ES, ESTE
- **Regla:** No uses _se_ impersonal o pasivo cuando el actor importa para la instrucción.
- **Mal:** `Se procede a reiniciar el servicio.`
- **Bien:** `El operador reinicia el servicio.`
- **Permitido:** impersonal verdadero cuando el actor es desconocido e irrelevante (`Se produjo un error de red.` → mejor: `Ocurrió un error de red.`, aún nombrando el evento)

### ESTE-017 — Trata al lector de forma consistente

- **Severidad:** warning
- **Origen:** ISO24495, ESTE
- **Regla:** Elige una forma de trato en las instrucciones (`tú`, `usted` o imperativo impersonal al sistema) y mantenla.
- **Mal:** mezclar `pulsa` / `pulse` / `se debe pulsar`
- **Bien:** `Pulsa Guardar.` (o `Pulse Guardar.` en todas partes)

---

## Estructura de la oración

### ESTE-003 — Una idea por oración

- **Severidad:** error
- **Origen:** STE, ISO24495
- **Regla:** Una instrucción o una afirmación por oración. Separa las compuestas.
- **Mal:** `Abre el archivo y lee la línea 3 y comprueba el valor.`
- **Bien:** `Abre el archivo. Lee la línea 3. Comprueba el valor.`

### ESTE-006 — Longitud de la oración

- **Severidad:** error
- **Origen:** STE
- **Regla:** ≤20 palabras en procedimientos/instrucciones; ≤25 en descripciones.
- **Nota:** Cuenta tokens en español. Prefiere separar antes que comprimir si eso elimina matices de duda.

### ESTE-007 — Sin punto y coma como unión de oraciones

- **Severidad:** warning
- **Origen:** STE, ESTE
- **Regla:** Prefiere dos oraciones a un punto y coma que una cláusulas.
- **Mal:** `El job falló; revisa los logs.`
- **Bien:** `El job falló. Revisa los logs.`

### ESTE-008 — Mantén los constituyentes explícitos

- **Severidad:** error
- **Origen:** STE, ES
- **Regla:** No omitas sujeto, verbo u objeto si la omisión crea dos lecturas.
- **Mal:** `Archivos no respaldados se perderán.`
- **Bien:** `El sistema eliminará los archivos que no tengan copia de seguridad.`

### ESTE-012 — Listas para secuencias

- **Severidad:** warning
- **Origen:** STE, ISO24495
- **Regla:** Usa lista numerada o con viñetas para 3 o más pasos o condiciones.
- **Mal:** párrafo en prosa con cinco pasos
- **Bien:** lista numerada

### ESTE-015 — Un tema por párrafo

- **Severidad:** advisory
- **Origen:** STE, ISO24495
- **Regla:** Un tema por párrafo; preferible ≤6 oraciones.

### ESTE-018 — Pon lo principal primero

- **Severidad:** warning
- **Origen:** ISO24495
- **Regla:** Empieza por la acción o el resultado; pon las condiciones después cuando sea posible.
- **Mal:** `En el caso de que el token haya caducado, el sistema deniega el acceso.`
- **Bien:** `El sistema deniega el acceso si el token ha caducado.`

---

## Verbos y tiempo

### ESTE-004 — Prefiere verbo a nombre

- **Severidad:** error
- **Origen:** STE, ISO24495
- **Regla:** Prefiere un verbo finito a una acción nominalizada.
- **Mal:** `Realiza la verificación del estado.`
- **Bien:** `Verifica el estado.`

### ESTE-010 — Sin gerundio de consecuencia

- **Severidad:** error
- **Origen:** ES
- **Regla:** No uses gerundio para expresar resultado o consecuencia. Usa una oración nueva o `y` + verbo finito.
- **Mal:** `El servicio falla generando un timeout.`
- **Bien:** `El servicio falla y genera un timeout.` / `El servicio falla. Entonces genera un timeout.`

### ESTE-011 — Prefiere formas verbales simples

- **Severidad:** warning
- **Origen:** STE, ES
- **Regla:** Prefiere presente, imperativo y pretérito. Conserva tiempos compuestos solo si aportan significado (relevancia actual, matiz de duda).
- **Mal:** `Hemos procedido a la actualización` (como instrucción)
- **Bien:** `Actualizamos el servicio.` / `Actualiza el servicio.`
- **Mantén:** `El job puede haber fallado.` (duda + relevancia)

### ESTE-005 — Conserva los matices de duda

- **Severidad:** error
- **Origen:** STE, ESTE
- **Regla:** No conviertas incertidumbre en hecho. `puede`, `podría`, `a veces`, `es probable` son contenido.
- **Mal:** reescribir `puede haber fallado` → `falló`
- **Bien:** conservar la fuerza del matiz

### ESTE-019 — Un verbo para una acción

- **Severidad:** error
- **Origen:** STE, ESTE
- **Regla:** Elige un verbo para una acción repetida y reutilízalo.
- **Mal:** mezclar `comprobar` / `verificar` / `revisar` / `validar` para la misma comprobación
- **Bien:** siempre `verificar` (o siempre `comprobar`) para esa acción

---

## Léxico y estilo

### ESTE-020 — Sin adjetivos de marketing

- **Severidad:** warning
- **Origen:** STE, ESTE
- **Regla:** Elimina afirmaciones vacías de calidad, o sustitúyelas por hechos medibles.
- **Mal:** `solución robusta y seamless`
- **Bien:** `reintentos automáticos hasta 3 veces`

### ESTE-021 — Sin apilar rodeos

- **Severidad:** error
- **Origen:** STE, ISO24495
- **Regla:** Elimina preámbulos vacíos y suavizadores apilados.
- **Mal:** `Es importante señalar que esto podría eventualmente ayudar a mejorar...`
- **Bien:** afirma el hecho, o elimínalo

### ESTE-022 — Grupos nominales ≤3

- **Severidad:** warning
- **Origen:** STE
- **Regla:** Evita pilas largas de nombres. Prefiere una relativa o separa.
- **Mal:** `gestor de cola de prioridad de tareas del agente`
- **Bien:** `gestor que fija la prioridad de la cola de tareas`

### ESTE-023 — Números y unidades explícitos

- **Severidad:** warning
- **Origen:** ISO24495, ESTE
- **Regla:** Escribe números y unidades con claridad; no dejes la magnitud implícita.
- **Mal:** `espera un rato`
- **Bien:** `espera 30 segundos`

### ESTE-024 — Condiciones antes de las ramas

- **Severidad:** warning
- **Origen:** STE, ESTE
- **Regla:** Enuncia la condición con claridad; luego cada rama. Prefiere `si` / `si no` a incisos anidados.
- **Mal:** una oración con excepciones anidadas
- **Bien:** `Si A, haz B. Si no, haz C.`

### ESTE-025 — No inventes sustancia

- **Severidad:** error
- **Origen:** ESTE
- **Regla:** Nunca añadas causas, frecuencias, actores o mecanismos que no estén en el original.
- **Mal:** inventar `porque el cliente está desactualizado` cuando el origen solo hablaba de formato incorrecto
- **Bien:** reescribir solo la forma

---

## Notas de aplicación

1. En modo **Strict**, trata `error` y `warning` como deben corregirse; `advisory` como conviene corregir.
2. En modo **ESTE-flavored**, trata las reglas estructurales `error` como obligatorias; las léxicas/de consistencia como orientativas si aplanarían una prosa útil.
3. Si dos reglas chocan, conserva el significado (ESTE-005, ESTE-025) antes que la longitud (ESTE-006).
