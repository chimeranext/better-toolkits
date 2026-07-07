# Landing Page — better-toolkits

**Dominio:** toolkits.chimeranext.dev (dominio chimeranext.dev pendiente de compra)
**Fecha:** 2026-07-07
**Issue:** — (diseñado vía `/landing-page` del propio toolkit — dogfooding)

---

## 1. Objetivo

Que founders/CTOs con Claude Code instalen el marketplace con un comando, y que un subconjunto abra conversación con el estudio ChimeraNext.

**Meta de negocio:** pipeline para el estudio (fractional CTO / venture building) + adopción del stack
**Métrica proxy:** eventos `copy_command` (proxy #1 de instalación), `cta_whatsapp` + `cta_calendar` (pipeline), clicks a GitHub, scroll depth

## 2. Audiencia

**Persona principal:** Founder técnico / CTO de startup early-stage que ya usa Claude Code (público general — el monorepo pasa a PUBLIC al lanzar).

**Pain point central:** opera sin sistema — releases artesanales, decisiones de producto por corazonada, deuda estructural sin auditar, growth sin instrumentación — mientras quema runway reinventando procesos que ya están resueltos.

**Contexto crítico:**
- Supabase Startups Survey 2026 (2,000+ founders): Claude Code herramienta #1 (31%); 62% de startups con >50% del código escrito por IA
- El ecosistema de plugins de Claude Code se está estandarizando ahora (superpowers, claude-code-templates y wshobson/agents escalaron a 20k-250k stars en meses)
- La brecha: el founder cree que su caos es normal; los que ganan operan con estructura de venture studio

## 3. Embudo de Conversión

```
[Ver repo en GitHub — bajo compromiso, auditar antes de instalar]
         |
         v
[Copiar comando e instalar — conversión principal]
         |
         v
[Hablar con el estudio — WhatsApp / agenda 30 min — pipeline]
```

- **CTA principal:** botón copy del terminal con `claude plugin marketplace add chimeranext/better-toolkits` — la conversión ES correr el comando
- **CTA secundario:** "View on GitHub →" — mitiga objeción de seguridad (patrón Bun: "Audit before you install")
- **CTA terciario (pipeline):** WhatsApp click-to-chat + Cal.com 30 min — sección pricing col. 2 y cierre

## 4. Secuencia Emocional

1. **Miedo técnico** (runway quemado sin sistema, dato 62% verificable) — Secciones 1-2
2. **Vergüenza** (el caos que estás normalizando vs startups que ya operan con disciplina) — Secciones 3-6
3. **Aspiración** (opera como un venture studio desde el día 1) — Secciones 7-11

## 5. Stack Técnico

| Componente | Tecnología |
|---|---|
| Framework | Next.js (static export) — mismo stack que better-microservices/apps/web |
| Styling | Tailwind + shadcn, tema heredado de better-microservices |
| Hosting | Vercel (dominio toolkits.chimeranext.dev al comprar chimeranext.dev) |
| Tracking | GA4 + PostHog + Meta Pixel + UTM vía `/landing-instrument` (fase posterior) |
| Eventos | `copy_command`, `cta_whatsapp`, `cta_calendar`, `cta_github`, `scroll_depth`, `faq_expand`, `lang_toggle` |
| Idiomas | Bilingüe: EN default + toggle ES (copy dual en `-copy.md`) |
| Formulario | Ninguno — WhatsApp wa.me + Cal.com como contacto |

## 6. Paleta de Colores (heredada de better-microservices)

| Token | Hex | Uso |
|---|---|---|
| CTA principal | #7C5CFF (primary violet) | Botón copy, botones de conversión |
| Fondo hero | #08060F | Hero, video/terminal, CTA final |
| Barra superior | gradiente #7C5CFF→#3B82F6→#22D3EE | Barra persistente |
| Acento | #EC4899 (magenta) | Mantra 1, links, highlights |
| Éxito | #34D399 | Checkmarks, confirmación de copy |
| Card | #1C1830 | Tarjetas, terminal |
| Fuentes | Sora (headings) / Inter (body) / JetBrains Mono (code) | — |

## 7. Estructura de Secciones

### Sección 1: Barra persistente
- **Fondo:** gradiente brand
- **Copy:** "10 battle-tested toolkits · One command · Source-available"

### Sección 2: Hero
- **Título (H1):** "62% of startups now ship AI-written code. The ones winning operate with a system." + fuente en sub-línea (Supabase Startups Survey 2026, 2,000+ founders)
- **Subtítulo:** "Every week without an operating system is runway spent reinventing one. Install yours in 60 seconds ↓"
- **Terminal copiable (CTA principal):** `claude plugin marketplace add chimeranext/better-toolkits`
- **CTA secundario:** "View on GitHub →" + línea "Audit before you install"
- **Línea de confianza:** "Source-available · BSL-1.1 · 75 commands · 96 skills · 22 agents · 0 lock-in"

### Sección 3: Mantra 1 (franja #EC4899)
- **Copy:** "You wouldn't build your product without a framework. Why build your company without one?"

### Sección 4: Problemas / Soluciones (fondo claro)
- **Título:** "The chaos you're normalizing"
- Releases artesanales a medianoche → `app-gtm-release`: lifecycle con gates a todas las stores
- Decisiones por corazonada → `ux-research` + `business-model`: research y validación con framework
- Deuda estructural sin auditar → `make-no-mistakes`: audit engine + disciplina de PRs
- Growth sin instrumentar → `aaarrr-flywheel`: funnel completo con Pixel/GA4/PostHog

### Sección 5: El stack (formato "at a glance")
- **Título:** "What lands in your terminal"
- Tabla enumerada 1-10 en orden de prioridad: # · nombre (mono, link) · qué hace (1 línea) · licencia · estado — jerarquía idéntica a la tabla del README original
- Botones de salto a Proceso y Pricing

### Sección 6: Mantra 2 (fondo oscuro)
- **Copy:** "This is the stack ChimeraNext uses to run its own ventures. Now it's yours."

### Sección 7: Proceso (fondo blanco)
- **Título:** "From zero to operating system in three commands"
- Paso 1: **Add the marketplace** — `claude plugin marketplace add chimeranext/better-toolkits`
- Paso 2: **Install what you need** — `claude plugin install make-no-mistakes@better-toolkits`
- Paso 3: **Run your first audit** — `/make-no-mistakes:audit`
- Slot de demo: terminal animada (asciinema/GIF) del flujo real — sustituye al video

### Sección 8: Pricing (2 columnas)
- **Col 1 — "The stack":** $0, todo incluido, source-available BSL-1.1, sin seats/tiers/telemetría; footnote conversión a OSS a los 5 años
- **Col 2 — "The studio behind it":** fractional CTO · venture building · GTM execution; CTAs WhatsApp + agenda

### Sección 9: Prueba social — "Standing on the shoulders of giants" (gris claro)
- **Stats grid:** 10 toolkits · 75 commands · 96 skills · 22 agents · 131 templates · 65k líneas
- **Dogfooding callout:** "This landing was designed by the toolkit's own /landing-page command" + better-microservices como hermano
- **Franja de ventures:** AltruPets _(animal welfare)_ · Vertivo _(agri-tech)_ · HabitaNexus _(proptech)_ · Keiko _(ed-tech)_ · AduaNext _(customs SaaS)_ · LicitaNext _(govtech)_
- **GRID DE METODOLOGÍAS (50+, agrupadas por disciplina — inventario completo en scratchpad/methodology-inventory.md):**
  - *Architecture & Code Health:* Strangler Fig (Fowler) · DDD (Evans) · Explicit Architecture (Graça) · Hexagonal (Cockburn) · Onion (Palermo) · Clean (Martin) · CQRS (Young) · Conway's Law · 1NF (Codd) · Premortem (Klein, HBR)
  - *Design & UX:* Atomic Design (Frost) · NN/g Zone Model · Service Blueprint (Shostack) · User Story Mapping (Patton) · JTBD · 16+ design systems (Material 3, HIG, Carbon, Polaris…)
  - *Strategy & Business:* Lean Canvas (Maurya) · Business Model Canvas (Osterwalder) · Lean Startup (Ries) · 4 Customer Forces (Moesta & Spiek) · Beyond Budgeting (Bogsnes) · MoSCoW · RICE (Intercom)
  - *Go-to-Market & Growth:* SLIP + Minimum Viable Segment (Gardner, Underscore VC @ Harvard Innovation Labs) · AAARRR / Pirate Metrics (McClure, 500 Startups) · Flywheel (Collins) · Organic Presence System (de León) · Flutter in Production (Bizzotto)
  - *Learning & Enablement:* SAM (Allen Interactions) · Bloom's Taxonomy (Anderson & Krathwohl) · Backward Design (Wiggins & McTighe) · Kirkpatrick L1-L4 · cmi5/xAPI (ADL) · Atomic Habits (Clear)
  - *Venture & Studio Ops:* Three Horizons (McKinsey) · Explore/Exploit (March) · Cost of Delay / CD3 (Reinertsen) · Improvement Kata (Rother) · VC Lab studio thesis + Mensarius Oath · SAFE (YC) · Skip-CR / Delaware Tostada / Cayman Sandwich (LATAM venture structuring)
- **Tagline del grid:** "50+ named methodologies encoded into commands — from McKinsey's Three Horizons to Fowler's Strangler Fig to LATAM's Cayman Sandwich."

### Sección 10: FAQ (fondo blanco)
1. "Is it really free?" — BSL-1.1: usa/audita/modifica libre; única restricción: revenderlo como SaaS competidor. Convierte a OSS pleno a los 5 años por versión.
2. "Is this like what HashiCorp did?" — No: nace BSL día 1, sin rug-pull; los términos solo se relajan (fecha fija en el texto legal).
3. "Do I need all 10?" — Instala solo lo que necesites; cada toolkit es un plugin independiente.
4. "How is this different from awesome-lists?" — Sistema integrado: los toolkits comparten convenciones y se pasan el trabajo (audit → implement → release → growth).
5. "Does it work with my stack?" — Releases: Flutter/KMP/MAUI/Swift/PWA; estrategia/proceso: agnóstico. Requisito duro: Claude Code.
6. "Can the studio work hands-on with us?" — Sí — el botón de WhatsApp (refraseo del pipeline).

### Sección 11: CTA final (fondo oscuro)
- **Título:** "Operate like a venture studio from day one."
- **Subtítulo:** "One command. Ten toolkits. Zero excuses."
- **CTA:** terminal repetida con copy + CTA estudio
- **Garantía:** "If it doesn't fit, uninstall with one command — nothing lingers."

### Sección 12: Footer
- Logo ChimeraNext · GitHub · better-microservices · licencia · support@chimeranext.dev · WhatsApp · © 2026

## 8. Directrices de UX

1. CTA de copy en color primario #7C5CFF con feedback de éxito #34D399 ("Copied ✓"); repetido en hero, proceso y cierre (mínimo 3 veces)
2. Sora solo para headings; body en Inter ≥16px; nunca gris claro para párrafos largos; código siempre JetBrains Mono
3. Navegación mínima: logo + toggle EN/ES + CTA GitHub en header; botones de salto en Sección 5
4. El mensaje "one command / operating system" se repite en barra, hero, mantras, proceso y CTA final
5. Responsive: terminal con scroll horizontal propio en mobile; tabla del stack colapsa a cards
6. Sin contadores falsos ni urgencia artificial — solo datos citables (Supabase 2026)

## 9. Tracking

- GA4: `copy_command`, `cta_whatsapp`, `cta_calendar`, `cta_github`, `scroll_depth`, `faq_expand`, `lang_toggle`
- Pixeles: Meta Pixel (+ Conversions API en fase instrumentación)
- PostHog: session replay + funnels
- OG tags: título/descripción/imagen para X, LinkedIn, WhatsApp
- Implementación vía `/landing-instrument` (aaarrr v0.2.0) — fase posterior al deploy

## 10. Fuera de Alcance

- Configurador/builder interactivo (decisión explícita: NO es un builder)
- Testimonios de terceros y contadores de stars (repo nace público sin historial)
- Video producido (se usa terminal animada)
- Blog/docs site (Fase 2+ del monorepo)
- Pricing tiers del estudio (solo 2 columnas Stack/Studio)
