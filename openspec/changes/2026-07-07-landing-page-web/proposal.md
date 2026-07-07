# ADR — Landing better-toolkits (toolkits.chimeranext.dev)

**Fecha:** 2026-07-07 · **Estado:** Aprobado · **Método:** `/landing-page` del propio toolkit (dogfooding)

## Decisiones y justificación

| # | Decisión | Alternativas descartadas | Justificación |
|---|---|---|---|
| 1 | Audiencia: público general; el monorepo pasa a PUBLIC al lanzar | Solo portfolio ChimeraNext; híbrido con tier privado | El comando `marketplace add` debe funcionar para cualquiera; consistente con better-microservices (público) |
| 2 | Objetivo dual: adopción + **pipeline para el estudio** | Solo adopción; solo awareness | El landing es también la puerta comercial de ChimeraNext (fractional CTO / venture building) |
| 3 | CTA pipeline: **WhatsApp + Cal.com** (ambos) | Solo WhatsApp; solo agenda | WhatsApp = pilar 3 de gtm-fit (instantáneo, cero fricción); agenda para quien prefiere estructura |
| 4 | Secuencia emocional: miedo técnico → vergüenza → aspiración | Curiosidad→confianza; dolor→alivio | Fiel a la metodología CRO del toolkit; el miedo se ancla en dato verificable, no en FUD |
| 5 | Hero: dato Supabase 2026 como H1 + costo de runway como sub-heading | Barra de urgencia con el dato; hero de features | Directriz del usuario: el dato fuerte lidera; "10 toolkits one command" pasa a la barra persistente |
| 6 | Evidencia 4 capas: stats de sustancia + dogfooding + ventures + metodologías | Stars/testimonios | Repo nace sin historial; research confirmó que el patrón del espacio es conteo de catálogo, no testimonios |
| 7 | Sección 9 = **grid completo de 50+ metodologías** agrupado por disciplina | Franja de 6 nombres | Directriz del usuario: casi nadie conoce las metodologías de consultoría encapsuladas — es el argumento de autoridad más fuerte |
| 8 | Catálogo (Sección 5) en formato "at a glance" enumerado 1-10 | Cards/grid visual | Directriz del usuario: replicar la jerarquía de la tabla del README (que allá fue sustituida por headings) |
| 9 | Pricing: 2 columnas Stack $0 / Studio | Sin pricing; 3 tiers SaaS | El pricing ES el embudo de pipeline (value ladder: instala gratis → contrata el músculo) |
| 10 | Bilingüe EN default + toggle ES | Solo EN; solo ES | Audiencia dev global + mercado LATAM del estudio |
| 11 | Hosting Vercel + instrumentación completa vía `/landing-instrument` | GitHub Pages; Cloudflare | Metodología B2B del toolkit + dogfooding del stack GA4/PostHog/Pixel/UTM |
| 12 | Sin urgencia artificial | Contadores/ofertas falsas | Metodología CRO explícita + audiencia técnica detecta manipulación |
| 13 | No es builder/configurador | Selector estilo create-better-t-stack | Directriz del usuario: un solo comando instala todo el marketplace; el selector no aporta |
| 14 | "Video" = terminal animada (asciinema) | Video producido; sin demo | No existe video; la demo de terminal es nativa para la audiencia |
| 15 | FAQ liderado por argumentos BSL (born-BSL ≠ HashiCorp rug-pull) | Ocultar la licencia | Research: la objeción #1 de la audiencia dev a source-available es el precedente HashiCorp 2023 |

## Fuentes

- Metodología CRO: `references/cro-methodology.md` (business-model-toolkit v2.1.0)
- Research de mercado: `scratchpad/landing-research.md` (comparables, patrones hero, BSL, urgencia)
- Inventario de metodologías: `scratchpad/methodology-inventory.md`
- Dato hero: Supabase Startups Survey 2026 (2,000+ founders)
