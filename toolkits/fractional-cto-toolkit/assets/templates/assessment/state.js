/**
 * State management for the Takeover Assessment SPA.
 *
 * Single global state object + render loop.
 * On every change: mutate state -> call render() -> DOM rebuilt from state.
 * No framework, no reactivity — just a plain object and functions.
 */

// ── Application State ──────────────────────────────────────────────
export const state = {
  currentStep: 0,

  // Step 1: Project context
  context: {
    name: '',
    legalName: '',       // Razon social (for legal documents)
    description: '',     // One-sentence pitch
    url: '',             // Project URL (to verify if live)
    industry: '',
    technicalType: '',   // webapp | mobile | api | monorepo | other
    cloudProvider: '',
    stage: '',           // ideation | validation | mvp | traction | growth | scale
    trl: '',             // 1-9 Technology Readiness Level
    teamSize: '',        // solo | 2-5 | 6-15 | 16-50 | 50+
    hasSensitiveData: false,
    sensitiveDataType: ''
  },

  // Step 2: Relationship
  relation: '',    // cooperative | neutral | contentious | nocontact
  ownership: '',   // client | dev | unknown
  hasContract: '', // yes | ambiguous | no | unknown
  hasUsers: '',    // yes | no | unknown
  documentation: '',

  // Step 3: Threats
  threats: {},
  // Each entry: { active: boolean, probability: 'baja' | 'media' | 'alta' }

  // Step 4: Calculated risk
  riskLevel: null,   // ALTO | MEDIO | BAJO
  riskFactors: []    // [{ icon: string, text: string }]
};


// ── Constants ──────────────────────────────────────────────────────

export const STEPS = [
  { id: 'context',   label: 'Contexto general' },
  { id: 'relation',  label: 'Relacion con dev' },
  { id: 'threats',   label: 'Matriz de amenazas' },
  { id: 'risk',      label: 'Calculo de riesgo' },
  { id: 'documents', label: 'Documentos generados' }
];

export const THREATS = [
  {
    id: 'destruction',
    name: 'Destruccion',
    description: 'Borrar repo, dropear DB, wipe servidores',
    mitigations: ['Fork pre-reunion', 'Snapshot prod']
  },
  {
    id: 'retention',
    name: 'Retencion',
    description: 'Negarse a entregar, pedir pago adicional',
    mitigations: ['Clausula legal', 'Evidencia de pagos']
  },
  {
    id: 'exfiltration',
    name: 'Exfiltracion',
    description: 'Clonar codebase para vender o reutilizar',
    mitigations: ['NDA', 'GitHub monitoring', 'Google alerts']
  },
  {
    id: 'sabotage',
    name: 'Sabotaje silencioso',
    description: 'Backdoors, time bombs, kill switches',
    mitigations: ['Code audit', 'Commits recientes']
  },
  {
    id: 'datatheft',
    name: 'Secuestro de datos',
    description: 'Acceder/extraer/vender datos de usuarios',
    mitigations: ['Rotacion DB creds', 'Logs de acceso']
  },
  {
    id: 'disruption',
    name: 'Interrupcion de servicio',
    description: 'Apagar servidores, cambiar DNS, revocar SSL',
    mitigations: ['DNS snapshot', 'Migrar DNS ASAP']
  },
  {
    id: 'extortion',
    name: 'Extorsion',
    description: 'Condicionar entrega a pagos no acordados',
    mitigations: ['Doc. comunicaciones', 'Via legal']
  }
];

export const RELATIONS = [
  { value: 'cooperative', label: 'Cooperativa',  description: 'Dispuesto a ayudar en la transicion' },
  { value: 'neutral',     label: 'Neutral',      description: 'Responde pero no es proactivo' },
  { value: 'contentious', label: 'Contenciosa',  description: 'No coopera, posible riesgo de sabotaje' },
  { value: 'nocontact',   label: 'Sin contacto', description: 'El dev desaparecio' }
];

export const OWNERSHIP_OPTIONS = [
  { value: 'client',  label: 'Cuenta del cliente',      description: 'El lead ya es owner del repo y servicios' },
  { value: 'dev',     label: 'Cuenta personal del dev', description: 'El repo y/o servicios estan bajo el dev' },
  { value: 'unknown', label: 'Desconocido',             description: 'No tengo visibilidad de donde esta el codigo' }
];

export const INDUSTRIES = [
  { value: 'fintech',     label: 'Fintech',          description: 'servicios financieros y bancarios' },
  { value: 'edtech',      label: 'Edtech',           description: 'educacion' },
  { value: 'logitech',    label: 'Logitech',         description: 'logistica, transporte y almacenamiento' },
  { value: 'agritech',    label: 'Agritech',         description: 'agricultura, ganaderia, pesca' },
  { value: 'proptech',    label: 'Proptech',         description: 'bienes raices, construccion' },
  { value: 'foodtech',    label: 'Foodtech',         description: 'industria alimentaria' },
  { value: 'regtech',     label: 'Regtech',          description: 'cumplimiento de normas y regulaciones' },
  { value: 'legaltech',   label: 'Legaltech',        description: 'servicios legales' },
  { value: 'healthtech',  label: 'Healthtech',       description: 'industria medica' },
  { value: 'femtech',     label: 'Femtech',          description: 'productos centrados en la mujer' },
  { value: 'biotech',     label: 'Biotech',          description: 'biotecnologia industrial' },
  { value: 'pharmatech',  label: 'Pharmatech',       description: 'industria farmaceutica' },
  { value: 'madtech',     label: 'Madtech',          description: 'marketing y advertising' },
  { value: 'insurtech',   label: 'Insurtech',        description: 'seguros' },
  { value: 'retailtech',  label: 'Retailtech',       description: 'comercio en locales fisicos' },
  { value: 'cleantech',   label: 'Cleantech',        description: 'cambio climatico y medio ambiente' },
  { value: 'traveltech',  label: 'Traveltech',       description: 'turismo, alojamiento' },
  { value: 'spacetech',   label: 'Spacetech',        description: 'industria aeroespacial' },
  { value: 'civiltech',   label: 'Civiltech',        description: 'participacion ciudadana, servicios publicos' },
  { value: 'ecommerce',   label: 'E-Commerce',       description: 'comercio electronico' },
  { value: 'econaranja',  label: 'Economia Naranja', description: 'videojuegos, entretenimiento' },
  { value: 'other',       label: 'Otro',             description: '' }
];

/**
 * Maps industry -> auto-detected sensitive data type.
 * Industries not listed here default to "no sensitive data".
 */
export const INDUSTRY_SENSITIVE_DATA = {
  fintech:    { hasSensitiveData: true, type: 'financieros' },
  insurtech:  { hasSensitiveData: true, type: 'financieros / seguros' },
  healthtech: { hasSensitiveData: true, type: 'medicos / salud' },
  pharmatech: { hasSensitiveData: true, type: 'medicos / farmaceuticos' },
  biotech:    { hasSensitiveData: true, type: 'medicos / biotecnologia' },
  legaltech:  { hasSensitiveData: true, type: 'legales' },
  regtech:    { hasSensitiveData: true, type: 'legales / regulatorios' },
  edtech:     { hasSensitiveData: true, type: 'educativos / menores de edad' },
  civiltech:  { hasSensitiveData: true, type: 'datos ciudadanos / PII' }
};

export const TECHNICAL_TYPES = [
  { value: 'webapp',   label: 'Web app (frontend + backend)' },
  { value: 'mobile',   label: 'Mobile app (iOS/Android/Flutter)' },
  { value: 'api',      label: 'API / Backend only' },
  { value: 'monorepo', label: 'Monorepo / Multi-servicio' },
  { value: 'other',    label: 'Otro' }
];

export const CLOUD_PROVIDERS = [
  // Tier 1: Hyperscalers
  { value: 'aws',          label: 'AWS',                    group: 'Hyperscalers' },
  { value: 'gcp',          label: 'Google Cloud (GCP)',     group: 'Hyperscalers' },
  { value: 'azure',        label: 'Microsoft Azure',        group: 'Hyperscalers' },
  // Tier 2: Startup-friendly PaaS
  { value: 'vercel',       label: 'Vercel',                 group: 'PaaS' },
  { value: 'railway',      label: 'Railway',                group: 'PaaS' },
  { value: 'flyio',        label: 'Fly.io',                 group: 'PaaS' },
  { value: 'render',       label: 'Render',                 group: 'PaaS' },
  { value: 'heroku',       label: 'Heroku',                 group: 'PaaS' },
  { value: 'digitalocean', label: 'DigitalOcean',           group: 'PaaS' },
  // Tier 3: BaaS / Specialized
  { value: 'supabase',     label: 'Supabase',               group: 'BaaS' },
  { value: 'firebase',     label: 'Firebase',               group: 'BaaS' },
  { value: 'cloudflare',   label: 'Cloudflare',             group: 'BaaS' },
  { value: 'netlify',      label: 'Netlify',                group: 'BaaS' },
  // Tier 4: Enterprise / Regional
  { value: 'oracle',       label: 'Oracle Cloud',           group: 'Enterprise' },
  { value: 'ibm',          label: 'IBM Cloud',              group: 'Enterprise' },
  { value: 'hetzner',      label: 'Hetzner',                group: 'Enterprise' },
  { value: 'linode',       label: 'Linode / Akamai',        group: 'Enterprise' },
  { value: 'alibaba',      label: 'Alibaba Cloud',          group: 'Enterprise' },
  // Other
  { value: 'other',        label: 'Otro',                   group: 'Otro' },
  { value: 'unknown',      label: 'Desconocido',            group: 'Otro' }
];

/** Etapa del emprendimiento — from Startups 506 registry */
export const VENTURE_STAGES = [
  { value: 'ideation',    label: 'Ideacion',    description: 'Concepto, sin producto' },
  { value: 'validation',  label: 'Validacion',  description: 'Definicion del problema y modelo de negocio' },
  { value: 'mvp',         label: 'MVP',         description: 'Producto minimo viable, primeros usuarios' },
  { value: 'traction',    label: 'Traccion',    description: 'Crecimiento de usuarios, revenue inicial' },
  { value: 'growth',      label: 'Crecimiento', description: 'Escalando operaciones y equipo' },
  { value: 'scale',       label: 'Escala',      description: 'Empresa establecida, mercado validado' }
];

/** Technology Readiness Level (TRL) — adapted from NASA/EU scale */
export const TRL_LEVELS = [
  { value: '1', label: 'TRL 1', description: 'Principios basicos observados' },
  { value: '2', label: 'TRL 2', description: 'Concepto tecnologico formulado' },
  { value: '3', label: 'TRL 3', description: 'Prueba de concepto experimental' },
  { value: '4', label: 'TRL 4', description: 'Validacion en laboratorio' },
  { value: '5', label: 'TRL 5', description: 'Validacion en entorno relevante' },
  { value: '6', label: 'TRL 6', description: 'Prototipo en entorno relevante' },
  { value: '7', label: 'TRL 7', description: 'Prototipo en entorno operativo' },
  { value: '8', label: 'TRL 8', description: 'Sistema completo y calificado' },
  { value: '9', label: 'TRL 9', description: 'Sistema probado en produccion' }
];

export const TEAM_SIZES = [
  { value: 'solo',  label: 'Solo (1 dev)' },
  { value: '2-5',   label: '2-5 personas' },
  { value: '6-15',  label: '6-15 personas' },
  { value: '16-50', label: '16-50 personas' },
  { value: '50+',   label: '50+ personas' }
];
