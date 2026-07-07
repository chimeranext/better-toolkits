/**
 * Document generation and download.
 *
 * Generates markdown content for each of the 4 takeover documents,
 * and provides download (Blob URL) and print-to-PDF functionality.
 */

import { state, THREATS, RELATIONS, OWNERSHIP_OPTIONS, INDUSTRIES } from './state.js';

// ── Helpers ────────────────────────────────────────────────────────

function slug(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function today() {
  return new Date().toLocaleDateString('es-CR', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
}

function activeThreats() {
  return Object.entries(state.threats)
    .filter(([, t]) => t.active)
    .map(([id, t]) => {
      const definition = THREATS.find(x => x.id === id);
      return { ...definition, probability: t.probability };
    });
}

function lookupLabel(list, value) {
  const match = list.find(item => (item.value || item.v) === value);
  return match ? (match.label || match.l) : value;
}

// ── Legal clauses by risk level ────────────────────────────────────

const LEGAL_CLAUSES = {
  ALTO: (name) => `Las partes reconocen que ${name} y todo su codigo fuente, base de datos, ` +
    `configuraciones y activos digitales son propiedad del contratante.\n\n` +
    `La retencion, destruccion o manipulacion no autorizada podra constituir:\n\n` +
    `1. **Retencion indebida de propiedad intelectual** — reclamacion civil por danos y perjuicios, ` +
    `incluyendo lucro cesante.\n\n` +
    `2. **Delito informatico** — Codigo Penal, arts. 196 bis (violacion datos personales), ` +
    `217 bis (estafa informatica), 229 bis (dano informatico), Ley 9048.\n\n` +
    `3. **Denuncia ante la Unidad de Delitos Informaticos del OIJ** — en caso de destruccion ` +
    `o sabotaje de datos.`,

  MEDIO: (name) => `El incumplimiento de los plazos aqui acordados constituye una ` +
    `**retencion indebida de propiedad intelectual**. El propietario se reserva el derecho ` +
    `de iniciar acciones legales bajo la legislacion de PI vigente, incluyendo reclamacion ` +
    `de **danos y perjuicios**.`,

  BAJO: () => `El incumplimiento de los plazos establecidos podra derivar en las ` +
    `**acciones legales** que el propietario considere pertinentes.`
};

// ── Document generators ────────────────────────────────────────────

function generateSOP() {
  const { name, description, industry, technicalType } = state.context;
  const level = state.riskLevel;
  const threats = activeThreats();

  const threatTable = threats.length > 0
    ? threats.map(t =>
        `| **${t.name}** | ${t.description} | ${t.probability} | ${t.mitigations.join(', ')} |`
      ).join('\n')
    : '| (ninguna marcada) | | | |';

  const industryLabel = lookupLabel(INDUSTRIES, industry);

  return [
    `# SOP: Project Takeover — ${name}`,
    '',
    `> **Nivel de riesgo:** ${level}`,
    `> **Industria:** ${industryLabel}`,
    `> **Tipo tecnico:** ${technicalType}`,
    `> **Generado:** ${today()}`,
    '',
    description ? `**Descripcion:** ${description}` : '',
    '',
    '---',
    '',
    '## Contexto',
    '',
    `- **Relacion con dev:** ${lookupLabel(RELATIONS, state.relation)}`,
    `- **Ownership:** ${lookupLabel(OWNERSHIP_OPTIONS, state.ownership)}`,
    `- **Contrato IP:** ${state.hasContract}`,
    `- **Usuarios activos:** ${state.hasUsers}`,
    `- **Datos sensibles:** ${state.context.hasSensitiveData ? state.context.sensitiveDataType : 'No'}`,
    '',
    '## Factores de riesgo',
    '',
    ...state.riskFactors.map(f => `- ${f.icon} ${f.text}`),
    '',
    '## Matriz de amenazas',
    '',
    '| Amenaza | Descripcion | Prob. | Mitigacion |',
    '|---------|------------|-------|------------|',
    threatTable,
    '',
    '---',
    '',
    `*fractional-cto-toolkit v1.0.0*`
  ].filter(line => line !== undefined).join('\n');
}

function generateGuia() {
  const { name, description } = state.context;
  const level = state.riskLevel;

  return [
    `# Guia de Transicion Tecnologica — ${name}`,
    '',
    '> Este documento explica, en lenguaje no-tecnico, el proceso que',
    '> vamos a seguir para tomar control de tu proyecto de software.',
    '',
    description ? `**Proyecto:** ${description}` : '',
    '',
    `## Nivel de Riesgo: ${level}`,
    '',
    ...state.riskFactors.map(f => `- ${f.text}`),
    '',
    '---',
    '',
    `*Generado el ${today()} — fractional-cto-toolkit v1.0.0*`
  ].filter(line => line !== undefined).join('\n');
}

function generateSolicitud() {
  const { name } = state.context;
  const level = state.riskLevel;
  const clause = LEGAL_CLAUSES[level](name);

  return [
    `# Solicitud Formal de Entrega — ${name}`,
    '',
    `**Fecha:** ${today()}`,
    '',
    '---',
    '',
    '## Clausula de consecuencias',
    '',
    clause,
    '',
    '---',
    '',
    '## Firmas',
    '',
    '**Propietario / Representante legal:**',
    '',
    'Nombre completo: _________________________________',
    '',
    'Cedula / ID: _________________________________',
    '',
    'Firma: _________________________________',
    '',
    'Fecha: _________________________________',
    '',
    '&nbsp;',
    '',
    '**Desarrollador:**',
    '',
    'Nombre completo: _________________________________',
    '',
    'Cedula / ID: _________________________________',
    '',
    'Firma: _________________________________',
    '',
    'Fecha: _________________________________',
    '',
    '---',
    '',
    `*fractional-cto-toolkit v1.0.0*`
  ].join('\n');
}

function generateUltimatum() {
  const { name } = state.context;

  return [
    '# BORRADOR — Requiere revision y aprobacion de un abogado',
    '',
    `# Comunicado de Incumplimiento — ${name}`,
    '',
    `**Fecha:** ____________`,
    '',
    '[ABOGADO: completar datos de las partes]',
    '',
    '## Antecedentes',
    '',
    '[ABOGADO: describir incumplimiento especifico]',
    '',
    '## Consecuencias',
    '',
    '[ABOGADO: adaptar segun los hechos concretos del caso]',
    '',
    '---',
    '',
    `*Template generado el ${today()} — fractional-cto-toolkit v1.0.0*`
  ].join('\n');
}

// ── Public API ─────────────────────────────────────────────────────

const GENERATORS = {
  sop: generateSOP,
  guia: generateGuia,
  solicitud: generateSolicitud,
  ultimatum: generateUltimatum
};

const FILE_SUFFIXES = {
  sop: 'takeover-sop',
  guia: 'guia-cliente',
  solicitud: 'solicitud-entrega',
  ultimatum: 'ultimatum-template'
};

export function downloadDocument(type) {
  const content = GENERATORS[type]();
  const blob = new Blob([content], { type: 'text/markdown' });
  const anchor = document.createElement('a');
  anchor.href = URL.createObjectURL(blob);
  anchor.download = `${slug(state.context.name)}-${FILE_SUFFIXES[type]}.md`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(anchor.href);
}

export function printDocument(type) {
  const content = GENERATORS[type]();
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  if (!printWindow) return;

  const doc = printWindow.document;
  doc.open();
  doc.close();

  const style = doc.createElement('style');
  style.textContent = [
    'body { font-family: Georgia, serif; max-width: 700px; margin: 40px auto; line-height: 1.7; color: #1a1a1a; }',
    'h1 { font-size: 22px; }',
    'h2 { font-size: 17px; margin-top: 28px; }',
    'hr { border: none; border-top: 1px solid #ccc; margin: 20px 0; }',
    'pre { white-space: pre-wrap; font-family: Georgia, serif; line-height: 1.7; }'
  ].join('\n');
  doc.head.appendChild(style);

  const pre = doc.createElement('pre');
  pre.textContent = content;
  doc.body.appendChild(pre);

  setTimeout(() => printWindow.print(), 400);
}

export function downloadAll() {
  const types = ['sop', 'guia', 'solicitud', 'ultimatum'];
  types.forEach((type, index) => {
    setTimeout(() => downloadDocument(type), index * 300);
  });
}
