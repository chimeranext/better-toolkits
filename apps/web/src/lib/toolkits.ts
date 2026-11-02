// Toolkit catalog for the S5 "at a glance" table.
// Authoritative fields (plugin name, dir, version) come from the monorepo
// marketplace.json via scripts/gen-toolkits.mjs -> src/data/toolkits.json.
// One-liners are curated copy (EN/ES), keyed by toolkit directory.
import generated from "@/data/toolkits.json";

export const REPO_URL = "https://github.com/chimeranext/better-toolkits";
export const MARKETPLACE = "better-toolkits";

type Generated = { plugin: string; dir: string; version: string; category: string | null };

const ONE_LINERS: Record<string, { en: string; es: string }> = {
  "./shared/bootstrap": {
    en: "Marketplace bootstrap layer — install first, then wire harnesses and product toolkits with HITL consent.",
    es: "Capa de bootstrap del marketplace — instala primero, luego conecta harnesses y toolkits con consentimiento HITL.",
  },
  "make-no-mistakes-toolkit": {
    en: "Disciplined dev lifecycle — repo-health audit engine, issue execution, PR review, releases, E2E, secrets.",
    es: "Ciclo de desarrollo disciplinado — motor de auditoría de repo, ejecución de issues, review de PRs, releases, E2E, secretos.",
  },
  "atomic-design-toolkit": {
    en: "Atomic Design for Flutter and Vite — generate, audit, and migrate component hierarchies.",
    es: "Atomic Design para Flutter y Vite — genera, audita y migra jerarquías de componentes.",
  },
  "ux-research-toolkit": {
    en: "Guided UX-research maps — journeys, blueprints, storyboards, story maps, with HTML visualization.",
    es: "Mapas de UX research guiados — journeys, blueprints, storyboards, story maps, con visualización HTML.",
  },
  "business-model-toolkit": {
    en: "Interactive business-model brainstorming across the full startup lifecycle.",
    es: "Brainstorming interactivo de modelo de negocio a lo largo de todo el ciclo de la startup.",
  },
  "app-gtm-release-toolkit": {
    en: "Multi-platform app go-to-market and release across Flutter, KMP, MAUI, Swift, PWA.",
    es: "Go-to-market y release multiplataforma: Flutter, KMP, MAUI, Swift, PWA.",
  },
  "fractional-cto-toolkit": {
    en: "Operational SOPs and workflows for freelance and fractional CTOs.",
    es: "SOPs y flujos operativos para CTOs freelance y fraccionales.",
  },
  "instructional-design-toolkit": {
    en: "Design cmi5-compliant courses and 1-on-1 session plans.",
    es: "Diseña cursos cmi5 y planes de sesión 1-on-1.",
  },
  "startup-lifecycle-toolkit": {
    en: "Founder journey guide — savings, entity formation, fundraising, vesting, matching, B Corp, Cayman Sandwich.",
    es: "Guía del viaje del founder — ahorro, formación de entidad, fundraising, vesting, matching, B Corp, Cayman Sandwich.",
  },
  "digital-nomad-toolkit": {
    en: "Freelancer/digital-nomad guide to operating a US Single-Member LLC — tax, banking, billing, visas, study abroad.",
    es: "Guía para freelancers/nómadas digitales con LLC US — impuestos, banca, facturación, visas, estudiar en el exterior.",
  },
  "venture-studio-toolkit": {
    en: "Macro portfolio management for venture studios and serial founders.",
    es: "Gestión macro de portafolio para venture studios y serial founders.",
  },
  "assurance-toolkit": {
    en: "Release-assurance evidence — testing, liveness, security transversal, and governance; prove you can ship.",
    es: "Evidencia de assurance de release — testing, liveness, seguridad transversal y governance; prueba que puedes publicar.",
  },
  "3d-graphics-cad-toolkit": {
    en: "3D graphics and CAD reference skills — animation, BIM, CAE/CAM, VFX, VR/AR, digital twins.",
    es: "Skills de referencia 3D y CAD — animación, BIM, CAE/CAM, VFX, VR/AR, gemelos digitales.",
  },
  "game-theory-mechanics-toolkit": {
    en: "Video-game development skills — design mechanics, player psychology, production, visual storytelling; engine-agnostic.",
    es: "Skills de desarrollo de videojuegos — mecánicas, psicología del jugador, producción, storytelling visual; engine-agnostic.",
  },
  "logistics-toolkit": {
    en: "Supply-chain domain for LATAM imports — procurement, customs, INCOTERMS 2020, trade agreements, inventory.",
    es: "Dominio de cadena de suministro para importaciones LATAM — procurement, aduanas, INCOTERMS 2020, acuerdos, inventario.",
  },
  "schematics-pcb-design-toolkit": {
    en: "Schematic capture and PCB layout for hardware/IoT — KiCad structure, DRC, manufacturing outputs, netlist diff.",
    es: "Captura de esquemáticos y layout de PCB para hardware/IoT — estructura KiCad, DRC, salidas de fabricación, netlist diff.",
  },
  "revenue-growth-toolkit": {
    en: "Growth-engineering funnel + flywheel — pricing → landing → instrumentation → AAARRR paid media execution.",
    es: "Growth-engineering funnel + flywheel — pricing → landing → instrumentación → ejecución AAARRR en paid media.",
  },
  "ui-patterns-toolkit": {
    en: "Reusable desktop UI/UX patterns, framework-agnostic — each pattern ships as skill + reference + command.",
    es: "Patrones UI/UX de escritorio reutilizables, framework-agnostic — cada patrón incluye skill + referencia + command.",
  },
};

export type Toolkit = {
  n: number;
  plugin: string;
  dir: string;
  version: string;
  license: string;
  status: string;
  oneLiner: { en: string; es: string };
  githubUrl: string;
  installCmd: string;
};

export const TOOLKITS: Toolkit[] = (generated as Generated[]).map((g, i) => ({
  n: i + 1,
  plugin: g.plugin,
  dir: g.dir,
  version: g.version,
  license: "BSL-1.1",
  status: "Available",
  oneLiner: ONE_LINERS[g.dir] ?? { en: "", es: "" },
  githubUrl: `${REPO_URL}/tree/main/toolkits/${g.dir}`,
  installCmd: `claude plugin install ${g.plugin}@${MARKETPLACE}`,
}));

export const MARKETPLACE_ADD = `claude plugin marketplace add chimeranext/${MARKETPLACE}`;
