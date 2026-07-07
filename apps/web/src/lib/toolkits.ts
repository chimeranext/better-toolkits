// Toolkit catalog for the S5 "at a glance" table.
// Authoritative fields (plugin name, dir, version) come from the monorepo
// marketplace.json via scripts/gen-toolkits.mjs -> src/data/toolkits.json.
// One-liners are curated copy (EN/ES), keyed by toolkit directory.
import generated from "@/data/toolkits.json";

export const REPO_URL = "https://github.com/chimeranext/better-toolkits";
export const MARKETPLACE = "better-toolkits";

type Generated = { plugin: string; dir: string; version: string; category: string | null };

const ONE_LINERS: Record<string, { en: string; es: string }> = {
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
  "aaarrr-flywheel-toolkit": {
    en: "Growth-engineering funnel + flywheel: pricing → landing → instrumentation → AAARRR.",
    es: "Growth-engineering funnel + flywheel: pricing → landing → instrumentación → AAARRR.",
  },
  "fractional-cto-toolkit": {
    en: "Operational SOPs and workflows for freelance and fractional CTOs.",
    es: "SOPs y flujos operativos para CTOs freelance y fraccionales.",
  },
  "instructional-design-toolkit": {
    en: "Design cmi5-compliant courses and 1-on-1 session plans.",
    es: "Diseña cursos cmi5 y planes de sesión 1-on-1.",
  },
  "launchpad-toolkit": {
    en: "Founder-operations lab — intake, cap table, matching, demo-day, stage tracking.",
    es: "Lab de operaciones para founders — intake, cap table, matching, demo-day, stage tracking.",
  },
  "venture-studio-toolkit": {
    en: "Macro portfolio management for venture studios and serial founders.",
    es: "Gestión macro de portafolio para venture studios y serial founders.",
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
