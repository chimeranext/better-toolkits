/**
 * Risk calculation engine.
 *
 * Takes the current state and returns a risk level (ALTO/MEDIO/BAJO)
 * along with a list of contributing factors. The score is a weighted
 * sum of conditions — each condition adds to the base score, and
 * thresholds determine the final level.
 */

import { state } from './state.js';

/**
 * @returns {{ level: string, color: string, factors: Array<{icon: string, text: string}> }}
 */
export function calculateRisk() {
  let score = 0;
  const factors = [];

  // ── Relation with previous developer ──
  const isHostile = state.relation === 'contentious' || state.relation === 'nocontact';

  if (isHostile) {
    score = state.ownership === 'client' ? 3 : 4;
    const label = state.relation === 'nocontact'
      ? 'Dev sin contacto — el peor escenario de cooperacion'
      : 'Relacion contenciosa — riesgo de no-cooperacion activa';
    factors.push({ icon: '\u26A0', text: label });
  } else if (state.relation === 'neutral') {
    score = (state.ownership === 'dev' || state.ownership === 'unknown') ? 2 : 1;
    factors.push({ icon: '\u25C6', text: 'Relacion neutral — cooperacion no garantizada' });
  } else {
    score = (state.ownership === 'dev' || state.ownership === 'unknown') ? 1.5 : 1;
    factors.push({ icon: '\u2713', text: 'Dev cooperativo — buen punto de partida' });
  }

  // ── Code ownership ──
  if (state.ownership === 'dev') {
    score += 0.5;
    factors.push({ icon: '\u26A0', text: 'Codigo en cuenta personal del dev' });
  } else if (state.ownership === 'unknown') {
    score += 1;
    factors.push({ icon: '\u26A0', text: 'Ubicacion del codigo desconocida' });
  }

  // ── IP contract ──
  if (state.hasContract === 'no') {
    score += 0.5;
    factors.push({ icon: '\u26A0', text: 'Sin contrato de cesion de IP' });
  }

  // ── Active users in production ──
  if (state.hasUsers === 'yes') {
    score += 0.5;
    factors.push({ icon: '\u25C6', text: 'Usuarios activos en produccion' });
  }

  // ── Sensitive data ──
  if (state.context.hasSensitiveData) {
    score += 0.5;
    const dataType = state.context.sensitiveDataType || 'PII';
    factors.push({ icon: '\u26A0', text: `Datos sensibles: ${dataType}` });
  }

  // ── High-probability threats ──
  const highProbThreats = Object.entries(state.threats)
    .filter(([, threat]) => threat.active && threat.probability === 'alta');

  if (highProbThreats.length >= 2) {
    score += 0.5;
    factors.push({ icon: '\u26A0', text: `${highProbThreats.length} amenazas con probabilidad alta` });
  }

  // ── Determine level from score ──
  let level, color;
  if (score >= 3.5) {
    level = 'ALTO';
    color = 'red';
  } else if (score >= 2) {
    level = 'MEDIO';
    color = 'orange';
  } else {
    level = 'BAJO';
    color = 'green';
  }

  // Persist to state
  state.riskLevel = level;
  state.riskFactors = factors;

  return { level, color, factors };
}
