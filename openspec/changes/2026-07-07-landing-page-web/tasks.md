# Tasks — landing-page-web

Change: `2026-07-07-landing-page-web` · Domain: `area:web` · Spec: `design.md` · Copy: `business/04-landing-pages/b2b-better-toolkits-landing-copy.md`

## Implementation checklist

- [x] Scaffold `apps/web` — Next.js static export + Tailwind + shadcn, theme tokens copied from `better-microservices/apps/web` (globals.css `:root` HSL vars, tailwind.config brand block, Sora/Inter/JetBrains Mono via `next/font`)
- [x] Layout: header mínimo (logo + toggle EN/ES + GitHub CTA), footer (S12)
- [x] i18n: EN default + ES toggle (copy dual desde `-copy.md`; estado en localStorage; evento `lang_toggle`)
- [x] S1 barra persistente (gradiente brand)
- [x] S2 hero: H1 + source line + sub + terminal copiable (`copy_command` event, feedback "Copied ✓" #34D399) + GitHub CTA + trust line
- [x] S3/S6 mantras (franjas #EC4899 / dark)
- [x] S4 problemas/soluciones (4 pares, links a toolkits)
- [x] S5 tabla "at a glance" 1-10 (datos desde `.claude-plugin/marketplace.json` en build time vía `scripts/gen-toolkits.mjs` — single source of truth) + botones de salto + colapso a cards en mobile
- [x] S7 proceso 3 comandos + slot terminal animada (placeholder — asciinema/GIF real pendiente)
- [x] S8 pricing 2 columnas (Stack $0 / Studio) — CTAs WhatsApp (wa.me placeholder) + Cal.com (placeholder)
- [x] S9 prueba social: stats grid + dogfooding callout + franja ventures + **grid de metodologías 50+** (6 grupos por disciplina)
- [x] S10 FAQ acordeón (6, evento `faq_expand` vía `<details onToggle>`)
- [x] S11 CTA final + garantía
- [x] OG tags + favicon (`app/icon.svg`) + metadata bilingüe
- [x] Eventos instrumentables como data-attributes + `track()` stub a `window.dataLayer` (instrumentación real GA4/PostHog/Pixel vía `/landing-instrument` — cambio aparte)
- [x] Build verde (`next build` static export → `out/`, 5 páginas, / = 104 kB First Load JS). Lighthouse ≥90: pendiente (requiere navegador/deploy)
- [ ] Deploy a Vercel (preview) — dominio `toolkits.chimeranext.dev` al comprar chimeranext.dev — PENDIENTE

## Pendientes tras esta implementación (placeholders / follow-ups)

- Terminal animada real (asciinema/GIF) en S7 — hoy hay un slot placeholder.
- `wa.me/00000000000` (WhatsApp) y `cal.com/chimeranext/30min` (Cal.com) — números/links reales pendientes (marcados con TODO en `src/lib/copy.ts`).
- Lighthouse ≥90 performance/a11y — verificar tras deploy.
- Instrumentación real GA4/PostHog/Meta Pixel/UTM — change aparte vía `/landing-instrument`.
- Deploy Vercel + dominio — checklist de lanzamiento (task #12).
- `next@14.2.15` tiene un security advisory (2025-12-11); heredado de better-microservices — considerar bump conjunto.

## Fuera de este change

- Instrumentación GA4/PostHog/Pixel/UTM (`/landing-instrument`) — change futuro
- Flip del repo a PUBLIC + compra de dominio — checklist de lanzamiento (task #12 de sesión)
- docs/site MkDocs — change futuro
