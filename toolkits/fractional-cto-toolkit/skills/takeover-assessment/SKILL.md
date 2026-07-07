---
name: takeover-assessment
description: >
  Evaluacion de riesgo para takeover de proyectos de software. Usa este skill
  cuando el usuario mencione "evaluacion de riesgo", "assessment", "evaluar proyecto",
  "risk assessment", "matriz de amenazas", "threat matrix", "que tan riesgoso es",
  "analisis de riesgo", "evaluacion tecnica", "evaluate project", "project evaluation",
  "assessment wizard", o cualquier situacion donde un CTO necesita evaluar el riesgo
  de asumir un proyecto existente antes de comprometerse.
---

# Takeover Assessment — Evaluacion de riesgo

Evalua el riesgo de asumir un proyecto de software existente mediante una entrevista
estructurada, calcula el nivel de riesgo, genera un wizard interactivo (SPA) para
documentar hallazgos, y produce el contrato de assessment listo para firmar.

## Regla de idioma

Todo el contenido generado debe estar en **español**. Los terminos tecnicos se mantienen
en ingles cuando son de uso comun (deploy, commit, CI/CD, backdoor, etc.).

## Directorio de salida

Todos los archivos van en `./fractional-cto/assessment/{slug}/` dentro del directorio
de trabajo actual, donde `{slug}` es el nombre del proyecto en kebab-case.

## Flujo del skill

### Paso 1 — Recopilar contexto (entrevista)

Hacer las siguientes preguntas UNA A LA VEZ. Formato preferido: opcion multiple.
Si el usuario ya proporciono informacion en la conversacion previa, no repetir —
extraer de lo que ya dijo.

**Pregunta 1: Identidad del proyecto**
> ¿Como se llama el proyecto, que hace (en una oracion), y cual es la razon social
> del cliente? (necesito la razon social para los documentos legales)

**Pregunta 2: Industria / vertical**
> ¿En que industria opera el proyecto?
> - a) Fintech
> - b) Legaltech
> - c) Healthtech
> - d) Edtech
> - e) Proptech / Real Estate
> - f) Insurtech
> - g) Agritech
> - h) Govtech
> - i) Logistica / Supply Chain
> - j) Retail / E-commerce
> - k) Foodtech / Restaurantes
> - l) HRtech / Recruiting
> - m) Martech / Adtech
> - n) Traveltech / Turismo
> - o) Cleantech / Energia
> - p) Mobility / Transporte
> - q) Social Impact / ONG
> - r) Entertainment / Media
> - s) Cybersecurity
> - t) SaaS B2B (otro vertical)
> - u) Consumer / B2C (otro vertical)
> - v) Otro (describir)

**Pregunta 3: Tipo tecnico**
> ¿Que tipo de proyecto es y donde esta desplegado?
> - Tipo: Web app / Mobile app / API-Backend only / Monorepo-Multi servicio / Otro
> - Cloud provider: AWS / GCP / Azure / DigitalOcean / Vercel-Netlify / On-premise / No se

**Pregunta 4: Etapa del emprendimiento**
> ¿En que etapa esta el proyecto?
> - a) Ideacion (solo concepto)
> - b) Validacion (prototipos, entrevistas)
> - c) MVP (producto minimo funcionando)
> - d) Traccion (usuarios reales, metricas)
> - e) Crecimiento (revenue, equipo)
> - f) Escala (expansion, Series A+)
>
> ¿Nivel de madurez tecnologica (TRL)?
> - 1-3: Concepto / prueba de concepto
> - 4-6: Validacion en entorno real
> - 7-9: Produccion / optimizacion

**Pregunta 5: Relacion con el desarrollador anterior**
> ¿Como es la relacion con el dev anterior?
> - a) Cooperativa — dispuesto a ayudar en la transicion
> - b) Neutral — responde pero no proactivo
> - c) Contenciosa — no coopera, posible riesgo de sabotaje
> - d) Sin contacto — el dev desaparecio
>
> ¿Donde esta el codigo ahora?
> - a) En una org/cuenta del cliente (el cliente es owner)
> - b) En cuenta personal del dev anterior
> - c) No se / no tengo acceso todavia

**Pregunta 6: Estado legal y operativo**
> Responde lo que sepas:
> - ¿Existe un contrato de propiedad intelectual (IP) entre el cliente y el dev anterior?
>   - Si / Ambiguo / No / No se
> - ¿Hay usuarios activos en produccion?
>   - Si / No / No se
> - ¿Existe documentacion? (README, diagramas, specs)
>   - Bastante completa / Algo pero incompleta / Nada o casi nada / No se
> - ¿El proyecto maneja datos sensibles?
>   - Si / No / No se
>
> *Nota: si la industria es Fintech, Healthtech, Legaltech, Insurtech, o Govtech,
> asumir datos sensibles = Si a menos que el usuario diga lo contrario.*

**Pregunta 7: Amenazas especificas** *(solo si la relacion es contenciosa o sin contacto)*
> ¿Te preocupa alguno de estos escenarios? (puede ser mas de uno)
> - a) Que borre el codigo o los datos
> - b) Que se niegue a entregar y pida mas plata
> - c) Que copie el codigo para venderlo o usarlo en otro proyecto
> - d) Que haya dejado trampas en el codigo (backdoors, time bombs)
> - e) Que acceda a datos de usuarios despues de la transferencia
> - f) Ninguno en particular

### Paso 2 — Calcular nivel de riesgo

Basandose en las respuestas, determinar el nivel de riesgo usando la siguiente matriz.
El nivel se determina por la **PEOR combinacion** entre relacion y ownership:

| Condicion | Riesgo base |
|-----------|-------------|
| Relacion contenciosa O sin contacto + codigo en cuenta del dev | **ALTO** |
| Relacion contenciosa O sin contacto + codigo en cuenta del cliente | **MEDIO-ALTO** |
| Relacion neutral + codigo en cuenta del dev | **MEDIO** |
| Relacion cooperativa + codigo en cuenta del dev | **MEDIO-BAJO** |
| Relacion cooperativa + codigo en cuenta del cliente | **BAJO** |

**Modificadores que suben el riesgo un nivel:**
- Usuarios activos en produccion (la urgencia de continuidad lo justifica)
- Datos sensibles (legales, financieros, medicos) — auto-detectado por industria si aplica
- 2 o mas amenazas de la Pregunta 7 con probabilidad alta

Comunicar el nivel de riesgo al usuario con una explicacion breve de por que se asigno
ese nivel. Incluir los factores que lo subieron si hubo modificadores activos.

### Paso 3 — Generar SPA de assessment

1. Copiar los 7 archivos del SPA desde `${CLAUDE_PLUGIN_ROOT}/assets/templates/assessment/`
   al directorio de salida `./fractional-cto/assessment/{slug}/`:
   - `assessment.html`
   - `app.js`
   - `state.js`
   - `risk-engine.js`
   - `documents.js`
   - `utils.js`
   - `styles.css`

2. En el `assessment.html` copiado, inyectar un bloque `<script>` **antes** de la linea
   `<script type="module" src="app.js">` que pre-pueble el estado con los datos
   recopilados en Paso 1. El bloque debe:
   - Crear un objeto `window.__ASSESSMENT_SEED__` con todas las respuestas de la entrevista
   - Incluir el nivel de riesgo calculado en Paso 2
   - Incluir el nombre del proyecto, razon social, industria, tipo tecnico, etapa y TRL
   - Incluir la relacion con el dev anterior, ownership, amenazas seleccionadas
   - Ejemplo de estructura:
     ```html
     <script>
     window.__ASSESSMENT_SEED__ = {
       projectName: "Nombre del proyecto",
       legalName: "Razon Social S.A.",
       industry: "fintech",
       projectType: "webapp",
       cloudProvider: "aws",
       stage: "traccion",
       trl: 6,
       devRelationship: "contenciosa",
       codeOwnership: "dev",
       ipContract: "ambiguo",
       activeUsers: true,
       documentation: "incompleta",
       sensitiveData: true,
       threats: ["borrar-codigo", "backdoors"],
       riskLevel: "ALTO",
       riskJustification: "Relacion contenciosa + codigo en cuenta del dev + usuarios activos"
     };
     </script>
     ```

3. Informar al usuario: "Abre este archivo en Chrome para el wizard interactivo:
   `{ruta completa al assessment.html}`"

### Paso 4 — Generar contrato de assessment

1. Leer el template de contrato: `${CLAUDE_PLUGIN_ROOT}/references/contracts/02-takeover-assessment.md`

2. Rellenar los placeholders con los datos recopilados:
   - `{NOMBRE_PROYECTO}` — nombre del proyecto
   - `{CLIENTE_NOMBRE}` — razon social del cliente (de Pregunta 1)
   - Otros datos del cliente: dejar como placeholder para que el CTO complete
   - Ajustar el alcance (Seccion 3) segun el tipo de proyecto y nivel de riesgo
   - **Tarifa sugerida** segun nivel de riesgo:
     - **ALTO:** $1500 - $2000 USD
     - **MEDIO-ALTO:** $1200 - $1500 USD
     - **MEDIO:** $800 - $1200 USD
     - **MEDIO-BAJO:** $500 - $800 USD
     - **BAJO:** $500 - $800 USD
   - **Timeline sugerido** segun nivel de riesgo:
     - **ALTO:** 1-2 dias habiles
     - **MEDIO-ALTO:** 2-3 dias habiles
     - **MEDIO:** 2-3 dias habiles
     - **MEDIO-BAJO:** 3-5 dias habiles
     - **BAJO:** 3-5 dias habiles
   - El CTO opera como **persona fisica** (contratista independiente). Nunca usar nombre
     de empresa en el campo del Profesional.

3. Escribir en `./fractional-cto/contracts/{slug}-assessment-contract.md`

### Paso 5 — Confirmacion

Presentar al usuario un resumen con:

1. **Nivel de riesgo** + justificacion (los factores que determinaron el nivel)
2. **Ruta al SPA:** "Abre este archivo en Chrome: `{ruta}`"
3. **Ruta al contrato:** "Firma este contrato antes de empezar el assessment: `{ruta}`"
4. **Siguiente paso recomendado:** "Una vez que el cliente firme el contrato y pague,
   usa `/project-takeover` para generar los SOPs del takeover completo."

## Notas para el modelo

- Este skill **NO genera SOPs** — eso es `project-takeover`.
- Este skill **NO genera contratos PSA ni retainer** — esos son skills separados
  (`contract-psa`, `contract-retainer`).
- Si el usuario ya proporciono informacion en la conversacion, no volver a preguntar.
  Extraer los datos y confirmar: "Ya mencionaste que X — ¿correcto?"
- El SPA es una aplicacion HTML autocontenida (7 archivos estaticos), no requiere servidor.
- La tarifa y el timeline son sugerencias basadas en el riesgo. El CTO tiene la ultima
  palabra — si quiere ajustar, respetar su criterio.
- El contrato se genera con los placeholders del CTO sin rellenar (cedula, email, telefono).
  Solo se rellenan los datos del proyecto y del cliente que se obtuvieron en la entrevista.
