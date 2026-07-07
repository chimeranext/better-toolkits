// Bilingual copy (EN default + ES toggle) — mirrors
// business/04-landing-pages/b2b-better-toolkits-landing-copy.md
import { REPO_URL } from "@/lib/toolkits";

// --- Contact / external links -----------------------------------------------
// PLACEHOLDERS — real values wired at launch (task #12) / instrumentation change.
export const LINKS = {
  github: REPO_URL,
  betterMicroservices: "https://github.com/chimeranext/better-microservices",
  whatsapp: "https://wa.me/00000000000", // TODO: real ChimeraNext WhatsApp number
  calendar: "https://cal.com/chimeranext/30min", // TODO: real Cal.com link
  support: "mailto:support@chimeranext.dev",
};

export type Lang = "en" | "es";

// --- Shared (language-neutral) data -----------------------------------------
export const STATS = [
  { value: "10", label: { en: "toolkits", es: "toolkits" } },
  { value: "75", label: { en: "commands", es: "comandos" } },
  { value: "96", label: { en: "skills", es: "skills" } },
  { value: "22", label: { en: "agents", es: "agentes" } },
  { value: "131", label: { en: "templates", es: "plantillas" } },
  { value: "65,000", label: { en: "lines of methodology", es: "líneas de metodología" } },
];

export const VENTURES = ["AltruPets", "Vertivol Latam", "HabitaNexus", "Keiko", "AduaNext", "LicitaNext"];

export const METHOD_GROUPS: { label: { en: string; es: string }; items: string[] }[] = [
  {
    label: { en: "Architecture & Code Health", es: "Arquitectura y salud de código" },
    items: [
      "Strangler Fig (Fowler)", "DDD (Evans)", "Explicit Architecture (Graça)", "Hexagonal (Cockburn)",
      "Onion (Palermo)", "Clean (Martin)", "CQRS (Young)", "Conway's Law", "1NF (Codd)", "Premortem (Klein, HBR)",
    ],
  },
  {
    label: { en: "Design & UX", es: "Diseño y UX" },
    items: [
      "Atomic Design (Frost)", "NN/g Zone Model", "Service Blueprint (Shostack)", "User Story Mapping (Patton)",
      "Jobs-to-be-Done", "16+ design systems (Material 3, HIG, Carbon, Polaris…)",
    ],
  },
  {
    label: { en: "Strategy & Business", es: "Estrategia y negocio" },
    items: [
      "Lean Canvas (Maurya)", "Business Model Canvas (Osterwalder)", "Lean Startup (Ries)",
      "4 Customer Forces (Moesta & Spiek)", "Beyond Budgeting (Bogsnes)", "MoSCoW", "RICE (Intercom)",
    ],
  },
  {
    label: { en: "Go-to-Market & Growth", es: "Go-to-Market y growth" },
    items: [
      "SLIP + Minimum Viable Segment (Gardner, Underscore VC @ Harvard Innovation Labs)",
      "AAARRR / Pirate Metrics (McClure, 500 Startups)", "Flywheel (Collins)",
      "Organic Presence System (de León)", "Flutter in Production (Bizzotto)",
    ],
  },
  {
    label: { en: "Learning & Enablement", es: "Aprendizaje y capacitación" },
    items: [
      "SAM (Allen Interactions)", "Bloom's Taxonomy (Anderson & Krathwohl)", "Backward Design (Wiggins & McTighe)",
      "Kirkpatrick L1-L4", "cmi5 / xAPI (ADL)", "Atomic Habits (Clear)",
    ],
  },
  {
    label: { en: "Venture & Studio Ops", es: "Venture y operaciones de estudio" },
    items: [
      "Three Horizons (McKinsey)", "Explore/Exploit (March)", "Cost of Delay / CD3 (Reinertsen)",
      "Improvement Kata (Rother)", "VC Lab studio thesis + Mensarius Oath", "SAFE (YC)",
      "Skip-CR / Delaware Tostada / Cayman Sandwich (LATAM venture structuring)",
    ],
  },
];

// --- Per-language section copy ----------------------------------------------
type Content = {
  nav: { install: string; langOther: string };
  s1: string;
  s2: { h1a: string; h1b: string; source: string; sub: string; copy: string; copied: string; github: string; audit: string; trust: string; learnMore: string };
  s3: { a: string; b: string };
  s4: { title: string; fixLead: string; pairs: { problem: string; solution: string; toolkit: string }[] };
  s5: { title: string; jumpProcess: string; jumpPricing: string; cols: { n: string; toolkit: string; what: string; license: string; status: string } };
  s6: { a: string; b: string };
  s7: { title: string; steps: { title: string; cmd: string; note?: string }[]; demo: string };
  s8: { title: string; col1: { name: string; price: string; body: string }; col2: { name: string; body: string; whatsapp: string; calendar: string } };
  s9: { title: string; dogfooding: string; sibling: string; venturesLabel: string; methodTagline: string };
  s10: { title: string; faqs: { q: string; a: string }[] };
  s11: { h2: string; sub: string; copy: string; guarantee: string; studioPrompt: string; whatsapp: string; calendar: string };
  s12: { license: string; rights: string };
};

export const COPY: Record<Lang, Content> = {
  en: {
    nav: { install: "GitHub", langOther: "ES" },
    s1: "10 battle-tested toolkits · One command · Source-available",
    s2: {
      h1a: "62% of startups now ship AI-written code.",
      h1b: "The winning ones operate with a system.",
      source: "Supabase Startups Survey 2026 — 2,000+ founders",
      sub: "Every week without an operating system is runway spent reinventing one. Install yours in 60 seconds ↓",
      copy: "Copy", copied: "Copied ✓",
      github: "View on GitHub →", audit: "Audit before you install", learnMore: "Learn more ↓",
      trust: "Source-available · BSL-1.1 · 75 commands · 96 skills · 22 agents · 0 lock-in",
    },
    s3: { a: "You wouldn't build your product without a framework.", b: "Why build your company without one?" },
    s4: {
      title: "The chaos you're normalizing",
      fixLead: "How do you fix it? With",
      pairs: [
        { problem: "Release night is a ritual sacrifice — every deploy hand-rolled, different, and past midnight", solution: "one guided lifecycle with hard gates to Play, App Store, Microsoft Store and Snap. Boring on purpose.", toolkit: "app-gtm-release" },
        { problem: "You're betting the roadmap on vibes — zero research, zero framework, pure adrenaline", solution: "journey maps, canvases and problem validation before a single sprint gets burned", toolkit: "ux-research + business-model" },
        { problem: "Your repo is quietly compounding debt nobody measures — until it detonates in prod", solution: "a repo-health audit engine that names the rot before it ships", toolkit: "make-no-mistakes" },
        { problem: "Marketing = post and pray. You couldn't name your CAC if it called you at 3am", solution: "the full AAARRR funnel, instrumented over Pixel, GA4 and PostHog from day one", toolkit: "aaarrr-flywheel" },
      ],
    },
    s5: {
      title: "What lands in your terminal",
      jumpProcess: "See how it installs ↓", jumpPricing: "What does it cost? ↓",
      cols: { n: "#", toolkit: "Toolkit", what: "What it does", license: "License", status: "Status" },
    },
    s6: { a: "This is the stack ChimeraNext uses to run its own ventures.", b: "Now it's yours." },
    s7: {
      title: "From zero to operating system in three commands",
      steps: [
        { title: "Add the marketplace", cmd: "claude plugin marketplace add chimeranext/better-toolkits" },
        { title: "Install what you need", cmd: "claude plugin install make-no-mistakes@better-toolkits", note: "or all ten" },
        { title: "Run your first audit", cmd: "/make-no-mistakes:audit", note: "repo-health report in minutes" },
      ],
      demo: "Animated terminal demo coming here",
    },
    s8: {
      title: "Pricing",
      col1: { name: "The stack", price: "$0", body: "Everything included. Source-available under BSL-1.1 — read it, audit it, modify it, use it. No seats. No tiers. No telemetry. Each version converts to full open source five years after publication." },
      col2: { name: "The studio behind it", body: "Fractional CTO · venture building · GTM execution. The muscle that built this stack, applied to your startup.", whatsapp: "WhatsApp us", calendar: "Book 30 min" },
    },
    s9: {
      title: "Standing on the shoulders of giants",
      dogfooding: "This landing was designed by the toolkit's own /landing-page command.",
      sibling: "Sibling project: better-microservices",
      venturesLabel: "Battle-tested across the ChimeraNext portfolio",
      methodTagline: "50+ named methodologies encoded into commands — from McKinsey's Three Horizons to Fowler's Strangler Fig to LATAM's Cayman Sandwich.",
    },
    s10: {
      title: "Questions founders ask",
      faqs: [
        { q: "Is it really free?", a: "Yes. BSL-1.1 lets you read, audit, modify and use everything freely. The only restriction: don't resell it as a competing SaaS. Each version converts to full open source after five years — the date is fixed in the license text." },
        { q: "Is this like what HashiCorp did?", a: "No. better-toolkits was born BSL on day one — there's no license rug-pull, and the terms can only relax over time (a fixed date in the legal text)." },
        { q: "Do I need all 10 toolkits?", a: "No. Each is an independent plugin in the same marketplace. Install one, install all — your call." },
        { q: "How is this different from awesome-lists and plugin collections?", a: "Those are fragments. This is an integrated system: the toolkits share conventions and hand work to each other — audit → implement → release → grow." },
        { q: "Does it work with my stack?", a: "Releases cover Flutter, KMP, .NET MAUI, Swift and PWA. Strategy and process toolkits are framework-agnostic. Built for Claude Code first — and four of the ten (make-no-mistakes, atomic-design, business-model, app-gtm-release) also install into OpenCode via their npm CLIs." },
        { q: "Can the studio work hands-on with us?", a: "That's exactly what the WhatsApp button is for." },
      ],
    },
    s11: {
      h2: "Operate like a venture studio from day one.",
      sub: "One command. Ten toolkits. Zero excuses.",
      copy: "Copy",
      guarantee: "If it doesn't fit, uninstall with one command — nothing lingers.",
      studioPrompt: "Prefer to talk first?",
      whatsapp: "WhatsApp", calendar: "Book 30 min",
    },
    s12: { license: "License BSL-1.1 → Non-Profit OSL 3.0", rights: "© 2026 Luis Andres Pena Castillo" },
  },
  es: {
    nav: { install: "GitHub", langOther: "EN" },
    s1: "10 toolkits probados en batalla · Un comando · Source-available",
    s2: {
      h1a: "El 62% de las startups ya shippea código escrito por IA.",
      h1b: "Las que ganan operan con un sistema.",
      source: "Supabase Startups Survey 2026 — más de 2,000 founders",
      sub: "Cada semana sin un sistema operativo de empresa es runway quemado reinventando uno. Instala el tuyo en 60 segundos ↓",
      copy: "Copiar", copied: "Copiado ✓",
      github: "Ver en GitHub →", audit: "Audita antes de instalar", learnMore: "Conoce más ↓",
      trust: "Source-available · BSL-1.1 · 75 comandos · 96 skills · 22 agentes · 0 lock-in",
    },
    s3: { a: "No construirías tu producto sin un framework.", b: "¿Por qué construyes tu empresa sin uno?" },
    s4: {
      title: "El caos que estás normalizando",
      fixLead: "¿Cómo lo arreglas? Con",
      pairs: [
        { problem: "La noche de release es un ritual de sacrificio — cada deploy artesanal, distinto y de madrugada", solution: "un ciclo guiado con gates duros a Play, App Store, Microsoft Store y Snap. Aburrido a propósito.", toolkit: "app-gtm-release" },
        { problem: "Estás apostando el roadmap a puro feeling — cero research, cero framework, pura adrenalina", solution: "journey maps, canvas y validación del problema antes de quemar un solo sprint", toolkit: "ux-research + business-model" },
        { problem: "Tu repo acumula deuda que nadie mide — hasta que detona en producción", solution: "un motor de auditoría que le pone nombre a la podredumbre antes de que shippee", toolkit: "make-no-mistakes" },
        { problem: "Marketing = publicar y rezar. No sabrías tu CAC ni aunque te llamara a las 3am", solution: "el funnel AAARRR completo, instrumentado sobre Pixel, GA4 y PostHog desde el día uno", toolkit: "aaarrr-flywheel" },
      ],
    },
    s5: {
      title: "Lo que aterriza en tu terminal",
      jumpProcess: "Cómo se instala ↓", jumpPricing: "¿Cuánto cuesta? ↓",
      cols: { n: "#", toolkit: "Toolkit", what: "Qué hace", license: "Licencia", status: "Estado" },
    },
    s6: { a: "Este es el stack con el que ChimeraNext opera sus propios ventures.", b: "Ahora es tuyo." },
    s7: {
      title: "De cero a sistema operativo en tres comandos",
      steps: [
        { title: "Agrega el marketplace", cmd: "claude plugin marketplace add chimeranext/better-toolkits" },
        { title: "Instala lo que necesites", cmd: "claude plugin install make-no-mistakes@better-toolkits", note: "o los diez" },
        { title: "Corre tu primer audit", cmd: "/make-no-mistakes:audit", note: "reporte de salud del repo en minutos" },
      ],
      demo: "Demo de terminal animada aquí",
    },
    s8: {
      title: "Pricing",
      col1: { name: "El stack", price: "$0", body: "Todo incluido. Source-available bajo BSL-1.1 — léelo, audítalo, modifícalo, úsalo. Sin seats. Sin tiers. Sin telemetría. Cada versión convierte a open source pleno a los cinco años." },
      col2: { name: "El estudio detrás", body: "CTO fraccional · venture building · ejecución GTM. El músculo que construyó este stack, aplicado a tu startup.", whatsapp: "Escríbenos por WhatsApp", calendar: "Agenda 30 min" },
    },
    s9: {
      title: "Sobre hombros de gigantes",
      dogfooding: "Este landing se diseñó con el comando /landing-page del propio toolkit.",
      sibling: "Proyecto hermano: better-microservices",
      venturesLabel: "Probado en el portfolio de ChimeraNext",
      methodTagline: "Más de 50 metodologías con nombre y apellido codificadas en comandos — de Three Horizons de McKinsey al Strangler Fig de Fowler y el Cayman Sandwich del venture LATAM.",
    },
    s10: {
      title: "Preguntas que hacen los founders",
      faqs: [
        { q: "¿De verdad es gratis?", a: "Sí. BSL-1.1 te deja leer, auditar, modificar y usar todo libremente. Única restricción: no revenderlo como SaaS competidor. Cada versión convierte a open source pleno a los cinco años — la fecha está fija en el texto legal." },
        { q: "¿Es como lo que hizo HashiCorp?", a: "No. better-toolkits nació BSL desde el día uno — no hay rug-pull de licencia, y los términos solo pueden relajarse con el tiempo (fecha fija en el texto legal)." },
        { q: "¿Necesito los 10 toolkits?", a: "No. Cada uno es un plugin independiente del mismo marketplace. Instala uno o instala todos." },
        { q: "¿En qué se diferencia de las awesome-lists?", a: "Esas son fragmentos. Esto es un sistema integrado: los toolkits comparten convenciones y se pasan el trabajo — audita → implementa → lanza → crece." },
        { q: "¿Funciona con mi stack?", a: "Releases: Flutter, KMP, .NET MAUI, Swift y PWA. Estrategia y proceso: agnósticos. Construido primero para Claude Code — y cuatro de los diez (make-no-mistakes, atomic-design, business-model, app-gtm-release) también se instalan en OpenCode vía sus CLIs de npm." },
        { q: "¿El estudio puede trabajar mano a mano con nosotros?", a: "Para eso exactamente está el botón de WhatsApp." },
      ],
    },
    s11: {
      h2: "Opera como un venture studio desde el día uno.",
      sub: "Un comando. Diez toolkits. Cero excusas.",
      copy: "Copiar",
      guarantee: "Si no encaja, lo desinstalas con un comando — no queda nada.",
      studioPrompt: "¿Prefieres hablar primero?",
      whatsapp: "WhatsApp", calendar: "Agenda 30 min",
    },
    s12: { license: "Licencia BSL-1.1 → Non-Profit OSL 3.0", rights: "© 2026 Luis Andres Pena Castillo" },
  },
};
