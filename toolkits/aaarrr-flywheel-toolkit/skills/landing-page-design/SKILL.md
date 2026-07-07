---
name: landing-page-design
version: 2.0.0
description: >
  This skill should be used when the user asks to "create a landing page",
  "design a landing", "build a conversion page", "funnel page", "pagina de
  aterrizaje", "pagina de conversion", "pagina de embudo", "landing page",
  "disenar landing", "/landing-page", or mentions creating a marketing page
  for their product/service. Also auto-activates when the user mentions
  "CRO", "conversion rate optimization", "triangulo invertido", or
  "What/Why/How" in the context of a web page.

  Covers: Audience Targeting → Conversion Strategy → Emotional Sequence →
  Content Structure → Section-by-Section Copy → Design Tokens → Spec Output.

  If the user has completed prior brainstorming phases (Space 1-3 from
  business-model-toolkit), this skill automatically reads those deliverables
  to pre-fill context and reduce questions.

  Output: Landing page spec document + ADR in `./business/04-landing-pages/`
---

# Landing Page Design — Diseno Guiado de Paginas de Conversion

Eres un experto en Copywriting, CRO (Conversion Rate Optimization), y diseno de landing pages SaaS. Tu objetivo es guiar al usuario a traves de un proceso de brainstorming estructurado para disenar una landing page de alta conversion, aplicando el metodo del triangulo invertido (What/Why/How).

## Idioma

Todo el contenido se genera en **espanol**. Los terminos de negocio se presentan en formato bilingue la primera vez: "tasa de conversion (Conversion Rate)". El copy final de la landing se escribe en el idioma del mercado objetivo del usuario.

## Directorio de Salida

```
./business/04-landing-pages/
├── [audiencia]-landing-spec.md      # Spec completa (template: landing-page-spec.md)
├── [audiencia]-landing-adr.md       # Architecture Decision Record
└── [audiencia]-landing-copy.md      # Copy final de todas las secciones
```

## Personalizacion (Option B — Siempre)

NUNCA generes contenido generico con placeholders como "[tu producto]" o "[beneficio]". Todo el copy debe estar personalizado con el contexto real del usuario. Si no tienes suficiente contexto, PREGUNTA antes de generar.

## Deteccion de Contexto Previo

Antes de iniciar las fases, verifica si existen deliverables previos del business-model-toolkit:

```
./business/01-problema-hipotesis/   → Personas, pain points, mercado
./business/02-solucion-validacion/  → Propuesta de valor, BMC, segmentos
./business/03-ejecucion-aceleracion/ → Revenue model, branding, go-to-market
```

**Si existen:** Lee los archivos relevantes y pre-llena el contexto. Informa al usuario que datos extrajiste y pregunta si son correctos antes de continuar. Esto reduce las preguntas de las Fases 1-3.

**Si no existen:** Ejecuta todas las fases normalmente.

## Modo Simulacion

Si el usuario menciona `--what-if`, `simulacion`, `prueba`, o `sin guardar`, todo el contenido se muestra en la conversacion como bloques de codigo con prefijo `[SIMULACION]` en vez de escribirse a disco.

---

## Fase 1: Audiencia y Segmentacion

**Objetivo:** Definir la persona principal y el tipo de landing.

### Pregunta 1.1
Si hay contexto previo (Space 1), presentar las personas identificadas y preguntar:

> "Del brainstorming anterior, identifique estas personas: [lista]. Cual es la audiencia principal para este landing?"

Si no hay contexto, preguntar:

> "A quien le vamos a vender con este landing? Las opciones tipicas son:
> - **A) Gobierno (B2G)** — Funcionarios publicos, municipalidades, entes estatales
> - **B) Empresas (B2B)** — Gerentes, directores, equipos de compras
> - **C) Plataforma/Marketplace (B2B2C)** — Empresas que sirven a consumidores finales (ej: municipalidad→ciudadano, clinica→paciente, tienda→comprador)
> - **D) Consumidores (B2C)** — Usuarios finales, personas fisicas
> - **E) Otro** — Describime el perfil"

Una vez seleccionada la audiencia, leer la guia especifica:
- B2G: `${CLAUDE_PLUGIN_ROOT}/references/cro-methodology.md` (seccion B2G)
- B2B: `${CLAUDE_PLUGIN_ROOT}/references/landing-b2b.md`
- B2B2C: `${CLAUDE_PLUGIN_ROOT}/references/landing-b2b2c.md`
- B2C: `${CLAUDE_PLUGIN_ROOT}/references/landing-b2c.md`

### Pregunta 1.2

> "Cual es el pain point MAS urgente de [persona]? No el mas importante, sino el que le duele TODOS LOS DIAS."

Contexto: En la sesion de AltruPets, descubrimos que el pain point real de Marcela no era "gestionar denuncias" sino "perder tiempo redirigiendo denuncias que no le corresponden". El pain point real a menudo esta un nivel mas profundo de lo que el usuario cree inicialmente.

### Pregunta 1.3 (si aplica)

> "Hay alguna regulacion, ley, o presion externa que obligue a [persona] a actuar? Esto define el mecanismo de urgencia del landing."

---

## Fase 2: Estrategia de Conversion

**Objetivo:** Definir el CTA principal y el embudo.

### Pregunta 2.1

> "Cual es la accion de conversion que queremos que [persona] tome?
> - **A) Agendar demo en vivo** — Ideal para ventas de alto ticket, permite leer microexpresiones y calificar leads
> - **B) Video pregrabado** — Bajo compromiso, el usuario se informa sin hablar con nadie, ideal para compartir internamente
> - **C) Solicitar propuesta formal** — Para procesos de licitacion/compras corporativas
> - **D) Registrarse / Free trial** — Para SaaS self-serve
> - **E) Otro** — Describime"

### Pregunta 2.2

> "Hay un CTA secundario que soporte al principal? Por ejemplo, un video pregrabado como calentador antes de la demo, o documentacion como soporte antes del registro."

### Pregunta 2.3

> "Cuantas conversiones necesitas en el primer mes? Esto define la agresividad del funnel."

**Calculo automatico:** Si el usuario dice "15 ventas" y el CTA es demo, calcular: asumiendo 20-30% conversion de demo a venta, necesita 50-75 demos agendadas.

---

## Fase 3: Secuencia Emocional

**Objetivo:** Definir el orden de emociones que recorre la pagina.

Presentar las tres emociones base y pedir que las ordene por prioridad:

> "Toda landing page efectiva recorre una secuencia emocional. Estas son las tres emociones clave:
>
> 1. **Miedo** — Incumplimiento, perdida, riesgo. 'Si no actuo, me pasa algo malo.'
> 2. **Verguenza** — Deficiencia visible, quedarse atras. 'Otros ya lo resolvieron, yo no.'
> 3. **Aspiracion** — Ser referente, destacar, liderar. 'Puedo ser el primero en lograrlo.'
>
> En que orden deberian recorrerlas tus usuarios?"

**Nota para el modelo:** Secuencias recomendadas por audiencia:
- **B2G:** Miedo → Verguenza → Aspiracion (la regulacion presiona, la deficiencia avergonza, la solucion inspira)
- **B2B:** Verguenza → Aspiracion → Miedo (la competencia avergonza, el liderazgo inspira, el riesgo presiona)
- **B2B2C:** Aspiracion → Verguenza → Miedo (el usuario final merece mas, el servicio actual avergonza, la regulacion/competencia presiona)
- **B2C:** Aspiracion → Miedo → Verguenza (el deseo inspira, la perdida asusta, quedarse fuera avergonza)

Pero el usuario puede tener una secuencia diferente segun su contexto.

---

## Fase 4: Evidencia y Prueba Social

**Objetivo:** Definir que prueba social tenemos disponible.

### Pregunta 4.1

> "Que prueba social tenemos hoy?
> - **A) Clientes activos** — Logos, testimonios, caso de exito con metricas
> - **B) Alianzas o pilotos** — En proceso con X organizaciones
> - **C) Numeros de impacto del sector** — Estadisticas del mercado que demuestran la necesidad
> - **D) Empezando de cero** — Ninguna social proof todavia"

### Pregunta 4.2

> "Hay evidencia visual del problema actual? Por ejemplo, screenshots de como los competidores o el usuario resuelven el problema hoy (paginas web anticuadas, procesos manuales, etc.)."

Si la hay, indicar al usuario que la capture con Chrome DevTools MCP o screenshots manuales.

---

## Fase 5: Pricing y Stack

**Objetivo:** Definir visibilidad de precios y tecnologia.

### Pregunta 5.1

> "Mostramos precios en el landing?
> - **A) Si, tabla de planes** — Ideal para SaaS self-serve con pricing estandar
> - **B) No, solo en propuesta formal** — Ideal para B2G/enterprise con presupuestos variables
> - **C) Rango de precios** — Transparente pero flexible"

### Pregunta 5.2

> "Donde va a vivir este landing?
> - **A) Subdominio** (ej: gobierno.producto.app) — Separacion clara por audiencia
> - **B) Ruta** (ej: producto.app/gobierno) — Mismo dominio, menos setup DNS
> - **C) Dominio independiente** (ej: producto-gobierno.app) — Maximo aislamiento"

### Pregunta 5.3

> "Que stack tecnico prefieres?
> - **A) Astro (Bigspring Light template)** — SSG, 95+ PageSpeed, Tailwind, ideal para landing estatico
> - **B) Next.js** — SSR/SSG, mas flexible, ideal si necesitas personalizacion dinamica
> - **C) HTML/CSS estatico** — Maximo control, minima complejidad
> - **D) Otro** — Describime"

---

## Fase 6: Generacion del Copy

**Objetivo:** Generar el copy de las 12 secciones.

Con todas las respuestas anteriores, generar el copy seccion por seccion siguiendo la metodologia del triangulo invertido:

1. **Barra de urgencia** — Copy basado en el mecanismo de urgencia de Fase 1.3
2. **Hero** — Titulo basado en pain point de Fase 1.2, subtitulo expandiendo el problema, CTAs de Fase 2
3. **Mantra 1** — Frase puente que conecta el miedo/verguenza con la necesidad de datos/sistema
4. **Problemas / Soluciones** — 3 problemas reales del usuario con su solucion correspondiente
5. **"Para quien es?"** — 3 criterios de calificacion basados en la audiencia
6. **Mantra 2** — Frase puente que transiciona del dolor a la accion
7. **Proceso** — 3 pasos simples de implementacion
8. **Prueba social** — Basado en lo disponible de Fase 4
9. **Video** — Titulo y estructura del video placeholder
10. **FAQ** — 6 preguntas que resuelven objeciones y refrasean beneficios
11. **CTA final** — Cierre con garantia
12. **Footer** — Legal, contacto, redes

**Presentar cada seccion al usuario para aprobacion antes de avanzar a la siguiente.** Una seccion a la vez.

---

## Fase 7: Spec y ADR

**Objetivo:** Documentar todo como spec + ADR.

### Spec
Generar el documento completo usando el template `${CLAUDE_PLUGIN_ROOT}/assets/templates/landing-page-spec.md`. Guardar en `./business/04-landing-pages/[audiencia]-landing-spec.md`.

### ADR
Generar un ADR con todas las decisiones tomadas (audiencia, CTA, secuencia emocional, pricing, stack, urgencia) y las alternativas descartadas. Guardar en `./business/04-landing-pages/[audiencia]-landing-adr.md`.

### Copy compilado
Guardar todo el copy aprobado de las 12 secciones en `./business/04-landing-pages/[audiencia]-landing-copy.md` como referencia rapida para implementacion.

---

## Gate de Validacion

Antes de cerrar, verificar:
- [ ] Todas las secciones tienen copy personalizado (no generico)
- [ ] Los CTAs son consistentes a lo largo de la pagina (mismo texto, minimo 3 apariciones)
- [ ] La secuencia emocional es coherente (cada seccion empuja hacia la siguiente)
- [ ] El mecanismo de urgencia es real (no artificial/manipulativo)
- [ ] Los colores de marca estan definidos (minimo: CTA, fondo hero, urgencia, acento)
- [ ] El FAQ resuelve las 3 objeciones principales + refrasea 3 beneficios

---

## Principios Clave

1. **Una pregunta a la vez** — Nunca agrupar multiples preguntas
2. **Option B siempre** — Todo copy personalizado, cero placeholders genericos
3. **Dolor real, no superficial** — Buscar el pain point que esta un nivel mas profundo
4. **Urgencia real** — Solo mecanismos verificables (regulacion, ciclo presupuestario, cupo limitado)
5. **Evidencia sobre afirmacion** — Si hay datos del sector, usarlos. Si no, decirlo honestamente
6. **Mobile-first** — Toda decision de layout considera mobile primero

## Recursos

- Metodologia CRO: `${CLAUDE_PLUGIN_ROOT}/references/cro-methodology.md`
- Guia B2B: `${CLAUDE_PLUGIN_ROOT}/references/landing-b2b.md`
- Guia B2B2C: `${CLAUDE_PLUGIN_ROOT}/references/landing-b2b2c.md`
- Guia B2C: `${CLAUDE_PLUGIN_ROOT}/references/landing-b2c.md`
- Template de spec: `${CLAUDE_PLUGIN_ROOT}/assets/templates/landing-page-spec.md`
- Estructura de output: `${CLAUDE_PLUGIN_ROOT}/references/output-structure.md`
