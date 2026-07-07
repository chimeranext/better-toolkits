# Tasks — landing-page-web

Change: `2026-07-07-landing-page-web` · Domain: `area:web` · Spec: `design.md` · Copy: `business/04-landing-pages/b2b-better-toolkits-landing-copy.md`

## Implementation checklist

- [ ] Scaffold `apps/web` — Next.js static export + Tailwind + shadcn, theme tokens copied from `better-microservices/apps/web` (globals.css `:root` HSL vars, tailwind.config brand block, Sora/Inter/JetBrains Mono via `next/font`)
- [ ] Layout: header mínimo (logo + toggle EN/ES + GitHub CTA), footer (S12)
- [ ] i18n: EN default + ES toggle (copy dual desde `-copy.md`; estado en URL o localStorage; evento `lang_toggle`)
- [ ] S1 barra persistente (gradiente brand)
- [ ] S2 hero: H1 + source line + sub + terminal copiable (`copy_command` event, feedback "Copied ✓" #34D399) + GitHub CTA + trust line
- [ ] S3/S6 mantras (franjas #EC4899 / dark)
- [ ] S4 problemas/soluciones (4 pares, links a toolkits)
- [ ] S5 tabla "at a glance" 1-10 (datos desde `.claude-plugin/marketplace.json` en build time — single source of truth) + botones de salto
- [ ] S7 proceso 3 comandos + slot terminal animada (asciinema/GIF placeholder)
- [ ] S8 pricing 2 columnas (Stack $0 / Studio) — CTAs WhatsApp (wa.me placeholder) + Cal.com (placeholder)
- [ ] S9 prueba social: stats grid + dogfooding callout + franja ventures + **grid de metodologías 50+** (6 grupos por disciplina, desde `design.md` §7-S9)
- [ ] S10 FAQ acordeón (6, evento `faq_expand`)
- [ ] S11 CTA final + garantía
- [ ] OG tags + favicon + metadata bilingüe
- [ ] Eventos instrumentables como data-attributes (la instrumentación real GA4/PostHog/Pixel llega vía `/landing-instrument` — cambio aparte)
- [ ] Build verde (`next build` static export) + lighthouse ≥90 performance/a11y
- [ ] Deploy a Vercel (preview) — dominio `toolkits.chimeranext.dev` al comprar chimeranext.dev

## Fuera de este change

- Instrumentación GA4/PostHog/Pixel/UTM (`/landing-instrument`) — change futuro
- Flip del repo a PUBLIC + compra de dominio — checklist de lanzamiento (task #12 de sesión)
- docs/site MkDocs — change futuro
