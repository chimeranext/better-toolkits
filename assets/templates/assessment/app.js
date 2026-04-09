/**
 * Main application module.
 *
 * Orchestrates rendering and event binding for each wizard step.
 * Each step has a render function (returns HTML string) and a bind
 * function (attaches event listeners after render).
 */

import {
  state, STEPS, THREATS, RELATIONS, OWNERSHIP_OPTIONS,
  INDUSTRIES, INDUSTRY_SENSITIVE_DATA, TECHNICAL_TYPES, CLOUD_PROVIDERS,
  VENTURE_STAGES, TRL_LEVELS, TEAM_SIZES
} from './state.js';
import { calculateRisk } from './risk-engine.js';
import { downloadDocument, printDocument, downloadAll } from './documents.js';
import { escapeHtml, buildOptions, setContent } from './utils.js';


// ── DOM references ─────────────────────────────────────────────────

const sidebarList    = document.getElementById('sl');
const sidebarName    = document.getElementById('spn');
const sidebarType    = document.getElementById('spt');
const riskBadge      = document.getElementById('rbd');
const riskBadgeValue = document.getElementById('rbv');
const mainContent    = document.getElementById('mc');


// ── Navigation ─────────────────────────────────────────────────────

function goToStep(stepIndex) {
  if (stepIndex > state.currentStep) return; // can't skip ahead
  state.currentStep = stepIndex;
  render();
}

function nextStep() {
  state.currentStep++;
  render();
  window.scrollTo(0, 0);
}

function previousStep() {
  if (state.currentStep > 0) state.currentStep--;
  render();
}


// ── Save form data from Step 0 ────────────────────────────────────

function saveContextForm() {
  const get = id => document.getElementById(id);
  state.context.name              = get('fieldName').value.trim();
  state.context.legalName         = get('fieldLegalName').value.trim();
  state.context.description       = get('fieldDesc').value.trim();
  state.context.url               = get('fieldUrl').value.trim();
  state.context.industry          = get('fieldIndustry').value;
  state.context.technicalType     = get('fieldTechType').value;
  state.context.cloudProvider     = get('fieldCloud').value;
  state.context.stage             = get('fieldStage').value;
  state.context.trl               = get('fieldTrl').value;
  state.context.teamSize          = get('fieldTeamSize').value;
  state.hasUsers                  = get('fieldUsers').value;
  state.hasContract               = get('fieldContract').value;
  state.documentation             = get('fieldDocs').value;
  state.context.hasSensitiveData  = get('fieldSensitive').value === 'yes';
}


// ── Sidebar renderer ───────────────────────────────────────────────

function renderSidebar() {
  // Step list
  const stepsHtml = STEPS.map((step, index) => {
    const isDone   = index < state.currentStep;
    const isActive = index === state.currentStep;
    const canClick = index <= state.currentStep;

    const itemClass = `si${isActive ? ' active' : ''}${canClick ? '' : ' dis'}`;
    const iconClass = isDone ? 'sic done' : isActive ? 'sic act' : 'sic';
    const iconText  = isDone ? '\u2713' : String(index + 1);

    return `<li class="${itemClass}" data-step="${index}">` +
           `<span class="${iconClass}">${iconText}</span>` +
           `<span class="sl">${step.label}</span></li>`;
  }).join('');

  setContent(sidebarList, stepsHtml);

  // Click handlers for completed steps
  sidebarList.querySelectorAll('.si:not(.dis)').forEach(item => {
    item.addEventListener('click', () => goToStep(parseInt(item.dataset.step)));
  });

  // Project name + industry in sidebar
  sidebarName.textContent = state.context.name || '-';
  const industryMatch = INDUSTRIES.find(i => i.value === state.context.industry);
  sidebarType.textContent = state.context.name
    ? (industryMatch ? industryMatch.label : '')
    : '';

  // Risk badge
  if (state.riskLevel) {
    riskBadgeValue.textContent = state.riskLevel;
    const colorMap = {
      ALTO:  ['var(--accent-red)',    'var(--accent-red-bg)',    'var(--accent-red-border)'],
      MEDIO: ['var(--accent-orange)', 'var(--accent-orange-bg)', 'var(--accent-orange-border)'],
      BAJO:  ['var(--accent-green)',  'var(--accent-green-bg)',  'var(--accent-green-border)']
    };
    const [textColor, bgColor, borderColor] = colorMap[state.riskLevel];
    riskBadgeValue.style.color  = textColor;
    riskBadge.style.background  = bgColor;
    riskBadge.style.borderColor = borderColor;
  } else {
    riskBadgeValue.textContent    = '-';
    riskBadgeValue.style.color    = 'var(--text-muted)';
    riskBadge.style.background    = 'transparent';
    riskBadge.style.borderColor   = 'var(--border)';
  }
}


// ── Step renderers ─────────────────────────────────────────────────

function renderContextStep() {
  const ctx = state.context;

  const industryOptions = INDUSTRIES.map(ind =>
    `<option value="${ind.value}"${ctx.industry === ind.value ? ' selected' : ''}>` +
    `${ind.label}${ind.description ? ': ' + ind.description : ''}</option>`
  ).join('');

  const techOptions = buildOptions(ctx.technicalType,
    TECHNICAL_TYPES.map(t => [t.value, t.label]));

  // Cloud providers grouped by tier
  const cloudGroups = {};
  CLOUD_PROVIDERS.forEach(cp => {
    if (!cloudGroups[cp.group]) cloudGroups[cp.group] = [];
    cloudGroups[cp.group].push(cp);
  });
  const cloudOptions = Object.entries(cloudGroups).map(([group, providers]) =>
    `<optgroup label="${group}">` +
    providers.map(cp =>
      `<option value="${cp.value}"${ctx.cloudProvider === cp.value ? ' selected' : ''}>${cp.label}</option>`
    ).join('') +
    `</optgroup>`
  ).join('');

  const stageOptions = buildOptions(ctx.stage,
    VENTURE_STAGES.map(s => [s.value, `${s.label} — ${s.description}`]));

  const trlOptions = buildOptions(ctx.trl,
    TRL_LEVELS.map(t => [t.value, `${t.label}: ${t.description}`]));

  const teamOptions = buildOptions(ctx.teamSize,
    TEAM_SIZES.map(t => [t.value, t.label]));

  const sensitiveHint = ctx.hasSensitiveData && ctx.sensitiveDataType
    ? `\u26A0 Auto-detectado: ${escapeHtml(ctx.sensitiveDataType)}`
    : 'Selecciona industria para auto-detectar';

  return `
    <div class="sh">Contexto del proyecto</div>
    <div class="ss">Informacion basica del proyecto que vas a asumir.</div>

    <!-- Identity -->
    <div class="fr">
      <div class="fg">
        <label class="fl">Nombre del proyecto</label>
        <input class="fi" id="fieldName" placeholder="Marca comercial"
               value="${escapeHtml(ctx.name)}">
      </div>
      <div class="fg">
        <label class="fl">Razon social</label>
        <input class="fi" id="fieldLegalName" placeholder="Entidad juridica (para docs legales)"
               value="${escapeHtml(ctx.legalName)}">
      </div>
    </div>

    <div class="fg">
      <label class="fl">Descripcion breve</label>
      <input class="fi" id="fieldDesc"
             placeholder="One-sentence pitch del proyecto"
             value="${escapeHtml(ctx.description)}">
    </div>

    <div class="fg">
      <label class="fl">URL del proyecto</label>
      <input class="fi" id="fieldUrl" placeholder="https://..."
             value="${escapeHtml(ctx.url)}">
    </div>

    <!-- Industry + Technical -->
    <div class="fg">
      <label class="fl">Industria / Vertical</label>
      <select class="fs" id="fieldIndustry">
        <option value="">Seleccionar vertical...</option>
        ${industryOptions}
      </select>
    </div>

    <div class="fr">
      <div class="fg">
        <label class="fl">Tipo tecnico</label>
        <select class="fs" id="fieldTechType">
          <option value="">Seleccionar...</option>
          ${techOptions}
        </select>
      </div>
      <div class="fg">
        <label class="fl">Cloud provider</label>
        <select class="fs" id="fieldCloud">
          <option value="">Seleccionar...</option>
          ${cloudOptions}
        </select>
      </div>
    </div>

    <!-- Stage + Maturity -->
    <div class="fr">
      <div class="fg">
        <label class="fl">Etapa del emprendimiento</label>
        <select class="fs" id="fieldStage">
          <option value="">Seleccionar...</option>
          ${stageOptions}
        </select>
      </div>
      <div class="fg">
        <label class="fl">Technology Readiness Level</label>
        <select class="fs" id="fieldTrl">
          <option value="">Seleccionar...</option>
          ${trlOptions}
        </select>
      </div>
    </div>

    <div class="fr">
      <div class="fg">
        <label class="fl">Tamaño del equipo</label>
        <select class="fs" id="fieldTeamSize">
          <option value="">Seleccionar...</option>
          ${teamOptions}
        </select>
      </div>
      <div class="fg">
        <label class="fl">Usuarios activos</label>
        <select class="fs" id="fieldUsers">
          <option value="">Seleccionar...</option>
          ${buildOptions(state.hasUsers, [['yes','Si'],['no','No'],['unknown','No se']])}
        </select>
      </div>
    </div>

    <!-- Legal + Docs -->
    <div class="fr">
      <div class="fg">
        <label class="fl">Contrato de cesion de IP</label>
        <select class="fs" id="fieldContract">
          <option value="">Seleccionar...</option>
          ${buildOptions(state.hasContract, [
            ['yes','Si'],['ambiguous','Ambiguo'],['no','No'],['unknown','No se']
          ])}
        </select>
      </div>
      <div class="fg">
        <label class="fl">Documentacion existente</label>
        <select class="fs" id="fieldDocs">
          <option value="">Seleccionar...</option>
          ${buildOptions(state.documentation, [
            ['complete','Completa'],['partial','Incompleta'],['none','Nada'],['unknown','No se']
          ])}
        </select>
      </div>
    </div>

    <!-- Sensitive data -->
    <div class="fr">
      <div class="fg">
        <label class="fl">Datos sensibles</label>
        <select class="fs" id="fieldSensitive">
          <option value="no"${!ctx.hasSensitiveData ? ' selected' : ''}>No</option>
          <option value="yes"${ctx.hasSensitiveData ? ' selected' : ''}>Si</option>
        </select>
      </div>
      <div class="fg">
        <label class="fl">&nbsp;</label>
        <div style="padding:10px 0;font-size:12px;color:var(--text-muted)">
          ${sensitiveHint}
        </div>
      </div>
    </div>

    <div class="nb">
      <div></div>
      <button class="btn bp bl" id="btnNext">Siguiente \u2192</button>
    </div>`;
}

function renderRelationStep() {
  const relationCards = RELATIONS.map(rel => `
    <div class="rc${state.relation === rel.value ? ' sel' : ''}" data-value="${rel.value}">
      <div class="rd"></div>
      <div>
        <div class="rt">${rel.label}</div>
        <div class="rdd">${rel.description}</div>
      </div>
    </div>`).join('');

  const ownershipCards = OWNERSHIP_OPTIONS.map(opt => `
    <div class="rc${state.ownership === opt.value ? ' sel' : ''}" data-value="${opt.value}">
      <div class="rd"></div>
      <div>
        <div class="rt">${opt.label}</div>
        <div class="rdd">${opt.description}</div>
      </div>
    </div>`).join('');

  return `
    <div class="sh">Relacion con el desarrollador</div>
    <div class="ss">Determina el nivel de urgencia y la estrategia de comunicacion.</div>

    <div class="sec">
      <div class="st">Relacion con el dev anterior</div>
      <div class="rg" id="relationGroup">${relationCards}</div>
    </div>

    <div class="sec">
      <div class="st">Ownership del codigo</div>
      <div class="rg" id="ownershipGroup">${ownershipCards}</div>
    </div>

    <div class="nb">
      <button class="btn bo bl" id="btnPrev">\u2190 Anterior</button>
      <button class="btn bp bl" id="btnNext">Siguiente \u2192</button>
    </div>`;
}

function renderThreatsStep() {
  const isHostile = state.relation === 'contentious' || state.relation === 'nocontact';
  const relationLabel = state.relation === 'nocontact' ? 'sin contacto'
    : state.relation === 'contentious' ? 'contenciosa'
    : state.relation === 'cooperative' ? 'cooperativa' : 'neutral';

  const subtitle = isHostile
    ? `Relacion <strong>${relationLabel}</strong> \u2014 evalua cada amenaza.`
    : `Relacion <strong>${relationLabel}</strong> \u2014 marca solo amenazas que consideres reales.`;

  const threatCards = THREATS.map(threat => {
    const saved = state.threats[threat.id] || { active: false, probability: 'media' };
    const checkedClass = saved.active ? ' chk' : '';
    const checkIcon = saved.active ? '\u2713' : '';

    return `
      <div class="tc${checkedClass}" data-id="${threat.id}">
        <div class="cb">${checkIcon}</div>
        <div>
          <div class="tn">${threat.name}</div>
          <div class="td">${threat.description}</div>
        </div>
        <select class="ps" data-id="${threat.id}">
          <option value="baja"${saved.probability === 'baja' ? ' selected' : ''}>Baja</option>
          <option value="media"${saved.probability === 'media' ? ' selected' : ''}>Media</option>
          <option value="alta"${saved.probability === 'alta' ? ' selected' : ''}>Alta</option>
        </select>
      </div>`;
  }).join('');

  return `
    <div class="sh">Matriz de amenazas</div>
    <div class="ss">${subtitle}</div>
    <div class="tcl">${threatCards}</div>
    <div class="nb">
      <button class="btn bo bl" id="btnPrev">\u2190 Anterior</button>
      <button class="btn bp bl" id="btnNext">Calcular riesgo \u2192</button>
    </div>`;
}

function renderRiskStep() {
  const { level, color, factors } = calculateRisk();

  const colorMap = {
    red:    ['var(--accent-red)',    'var(--accent-red-bg)',    'var(--accent-red-border)'],
    orange: ['var(--accent-orange)', 'var(--accent-orange-bg)', 'var(--accent-orange-border)'],
    green:  ['var(--accent-green)',  'var(--accent-green-bg)',  'var(--accent-green-border)']
  };
  const [textColor, bgColor, borderColor] = colorMap[color];

  const explanations = {
    ALTO:  'Requiere accion inmediata. Legal y Seguridad PRIMERO. Timeline en dias.',
    MEDIO: 'Riesgo moderado. Plazos firmes. Timeline de 1-2 semanas.',
    BAJO:  'Handover estandar. Dev cooperativo. Timeline de 2-3 semanas.'
  };

  const factorsHtml = factors.map(f =>
    `<div class="rf"><div class="fi2">${f.icon}</div><div>${f.text}</div></div>`
  ).join('');

  // Active threat badges
  const activeThreats = Object.entries(state.threats).filter(([, t]) => t.active);
  const threatBadges = activeThreats.length > 0
    ? activeThreats.map(([id, t]) => {
        const def = THREATS.find(x => x.id === id);
        const probClass = t.probability === 'alta' ? 'pa' : t.probability === 'media' ? 'pm' : 'pba';
        return `<span class="pb ${probClass}" style="margin:2px">${def.name}</span>`;
      }).join(' ')
    : '<span style="color:var(--text-muted)">Ninguna marcada</span>';

  // Summary cards
  const relLabel = RELATIONS.find(r => r.value === state.relation)?.label || '-';
  const ownLabel = OWNERSHIP_OPTIONS.find(o => o.value === state.ownership)?.label || '-';
  const labelMap = { yes: 'Si', no: 'No', ambiguous: 'Ambiguo', unknown: 'Desconocido' };

  return `
    <div class="rdp">
      <div class="rcir" style="border-color:${borderColor};background:${bgColor}">
        <div class="rtx" style="color:${textColor}">${level}</div>
      </div>
      <div class="rex">${explanations[level]}</div>
      <div class="rfs">${factorsHtml}</div>
    </div>

    <div class="sec" style="margin-top:32px">
      <div class="st">Resumen</div>
      <div class="cg">
        <div class="cc"><div class="la">Proyecto</div><div class="va vi">${escapeHtml(state.context.name)}</div></div>
        <div class="cc"><div class="la">Relacion</div><div class="va ${state.relation === 'cooperative' ? 'vo' : 'vd'}">${relLabel}</div></div>
        <div class="cc"><div class="la">Ownership</div><div class="va ${state.ownership === 'client' ? 'vo' : 'vd'}">${ownLabel}</div></div>
        <div class="cc"><div class="la">Contrato IP</div><div class="va ${state.hasContract === 'yes' ? 'vo' : state.hasContract === 'no' ? 'vd' : 'vw'}">${labelMap[state.hasContract] || '-'}</div></div>
        <div class="cc"><div class="la">Usuarios</div><div class="va ${state.hasUsers === 'yes' ? 'vw' : 'vm'}">${labelMap[state.hasUsers] || '-'}</div></div>
        <div class="cc"><div class="la">Datos sensibles</div><div class="va ${state.context.hasSensitiveData ? 'vd' : 'vm'}">${state.context.hasSensitiveData ? (state.context.sensitiveDataType || 'Si') : 'No'}</div></div>
      </div>
    </div>

    <div class="sec">
      <div class="st">Amenazas activas</div>
      <div>${threatBadges}</div>
    </div>

    <div class="nb">
      <button class="btn bo bl" id="btnPrev">\u2190 Anterior</button>
      <button class="btn bp bl" id="btnNext">Generar documentos \u2192</button>
    </div>`;
}

function renderDocumentsStep() {
  const name = escapeHtml(state.context.name);
  const level = state.riskLevel;

  // Active threats table
  const activeThreats = Object.entries(state.threats).filter(([, t]) => t.active);
  let threatTableHtml = '';
  if (activeThreats.length > 0) {
    const rows = activeThreats.map(([id, t]) => {
      const def = THREATS.find(x => x.id === id);
      const probClass = t.probability === 'alta' ? 'pa' : t.probability === 'media' ? 'pm' : 'pba';
      const mits = def.mitigations.map(m => `<span class="mt">${m}</span>`).join(' ');
      return `<tr>
        <td><strong>${def.name}</strong><br><span style="font-size:12px;color:var(--text-muted)">${def.description}</span></td>
        <td><span class="pb ${probClass}">${t.probability[0].toUpperCase() + t.probability.slice(1)}</span></td>
        <td>${mits}</td>
      </tr>`;
    }).join('');

    threatTableHtml = `
      <div class="sec">
        <div class="st">Amenazas activas</div>
        <table class="tht">
          <thead><tr><th>Amenaza</th><th>Prob.</th><th>Mitigacion</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  }

  // Timeline
  const timelineData = {
    ALTO: [
      { day: 'D1',  label: 'Legal + Fork de seguridad',    detail: 'Abogado: cesion de IP. CTO: git clone --mirror',           ref: 'Sec 2+8.1', cls: 'tc2' },
      { day: 'D2',  label: 'Reunion + Firma de solicitud',  detail: 'Presentar solicitud al dev. Firma de aceptado.',           ref: 'Solicitud',  cls: 'tc2' },
      { day: 'D2',  label: 'Rotacion de secrets',           detail: 'Cambiar API keys, passwords, tokens. Remover dev.',       ref: 'Sec 8.2',    cls: 'ti2' },
      { day: 'D3-4',label: 'Inventario de servicios',       detail: 'Mapear cuentas, servicios, DB.',                           ref: 'Sec 5-7',    cls: 'tn2' },
      { day: 'D5',  label: 'Auditoria + verificacion',      detail: 'Code audit, verificar build + deploy.',                    ref: 'Sec 8.3+9',  cls: 'tn2' }
    ],
    MEDIO: [
      { day: 'S1', label: 'Legal + transferencia',    detail: 'Cesion de IP + transferencia repo y cuentas.', ref: 'Sec 2+3', cls: 'ti2' },
      { day: 'S1', label: 'Inventario completo',      detail: 'Servicios, infra, DB.',                        ref: 'Sec 4-7', cls: 'tn2' },
      { day: 'S2', label: 'Seguridad + verificacion', detail: 'Rotacion secrets, deploy test.',                ref: 'Sec 8+9', cls: 'tn2' }
    ],
    BAJO: [
      { day: 'S1-2', label: 'Handover guiado',          detail: 'Recorrer secciones con el dev.', ref: 'Sec 3-10', cls: 'tn2' },
      { day: 'S2',   label: 'Verificacion + seguridad', detail: 'Deploy test, rotacion secrets.', ref: 'Sec 8+9',  cls: 'tn2' }
    ]
  };

  const timeline = (timelineData[level] || timelineData.MEDIO).map(row => `
    <div class="tlr ${row.cls}">
      <div class="tld">${row.day}</div>
      <div class="tlc">
        <div class="tll">${row.label}</div>
        <div class="tlt">${row.detail}</div>
      </div>
      <div class="tls"><span class="sr">${row.ref}</span></div>
    </div>`).join('');

  // Legal clause preview
  const clausePreviewHtml = {
    ALTO: `Las partes reconocen que <strong>${name}</strong> y todo su codigo fuente son propiedad del contratante.<br><br>
      <strong>1. Retencion indebida de PI</strong><br><br>
      <strong>2. Delito informatico</strong> \u2014 <span class="lr">Codigo Penal, arts. 196 bis, 217 bis, 229 bis, Ley 9048</span>.<br><br>
      <strong>3. Denuncia ante</strong> <span class="lr">Unidad de Delitos Informaticos del OIJ</span>.`,
    MEDIO: `Incumplimiento = <strong>retencion indebida de PI</strong>. Acciones legales incluyendo <strong>danos y perjuicios</strong>.`,
    BAJO: `Incumplimiento podra derivar en <strong>acciones legales</strong> pertinentes.`
  };

  const clauseColorMap = {
    ALTO:  ['var(--accent-red)',    'Penal completa'],
    MEDIO: ['var(--accent-orange)', 'IP + danos'],
    BAJO:  ['var(--accent-green)',  'Generica']
  };
  const [clauseColor, clauseLabel] = clauseColorMap[level];

  const generatedDate = new Date().toLocaleDateString('es-CR', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  return `
    <div class="sh">Documentos generados</div>
    <div class="ss">4 documentos para ${name}, calibrados a riesgo ${level}.</div>

    ${threatTableHtml}

    <div class="sec">
      <div class="st">Secuencia de ejecucion \u2014 Riesgo ${level}</div>
      <div class="tl">${timeline}</div>
    </div>

    <div class="sec">
      <div class="st">Documentos</div>
      <div class="dg">
        <div class="dc">
          <div class="dch"><div class="dn">01</div><span class="da ac">CTO</span></div>
          <div class="dti">SOP Operativo</div>
          <div class="dde">Checklist tecnico con matriz de amenazas y secuencia de ejecucion.</div>
          <div class="das">
            <button class="btn bp" data-download="sop">Descargar MD</button>
            <button class="btn bo" data-print="sop">PDF</button>
          </div>
        </div>

        <div class="dc">
          <div class="dch"><div class="dn">02</div><span class="da al">Lead</span></div>
          <div class="dti">Guia para el Cliente</div>
          <div class="dde">Proceso en lenguaje no-tecnico para tu lead.</div>
          <div class="das">
            <button class="btn bp" data-download="guia">Descargar MD</button>
            <button class="btn bo" data-print="guia">PDF</button>
          </div>
        </div>

        <div class="dc">
          <div class="dch"><div class="dn">03</div><span class="da ad">Dev anterior</span></div>
          <div class="dti">Solicitud de Entrega</div>
          <div class="dde">Plazos firmes, clausula legal integrada, bloque de firmas.</div>
          <div class="das">
            <button class="btn bd" data-download="solicitud">Descargar MD</button>
            <button class="btn bo" data-print="solicitud">PDF</button>
          </div>
        </div>

        <div class="dc">
          <div class="dch"><div class="dn">04</div><span class="da ae">Abogado</span></div>
          <div class="dti">Template de Ultimatum</div>
          <div class="dde">Borrador para el abogado si el dev incumple.</div>
          <div class="das">
            <button class="btn bo" data-download="ultimatum">Descargar MD</button>
            <button class="btn bo" data-print="ultimatum">PDF</button>
          </div>
        </div>
      </div>
    </div>

    <div class="sec">
      <div class="st">Preview \u2014 Clausula legal</div>
      <div class="cl">
        <div class="cld" style="background:${clauseColor};box-shadow:0 0 8px ${clauseColor}44"></div>
        <div class="cll" style="color:${clauseColor}">Severidad: ${clauseLabel}</div>
      </div>
      <div class="lp">${clausePreviewHtml[level]}</div>
    </div>

    <div class="ft">
      <div class="ftx">Generado el ${generatedDate} \u00B7 fractional-cto-toolkit v1.0.0</div>
      <div class="fta"><button class="btn bo" id="btnDownloadAll">Exportar todo</button></div>
    </div>

    <div class="nb">
      <button class="btn bo bl" id="btnPrev">\u2190 Editar assessment</button>
      <div></div>
    </div>`;
}


// ── Event binding per step ─────────────────────────────────────────

function bindContextStep() {
  // Next button
  mainContent.querySelector('#btnNext').addEventListener('click', () => {
    saveContextForm();
    if (state.context.name) nextStep();
  });

  // Industry auto-detection of sensitive data
  const industrySelect = mainContent.querySelector('#fieldIndustry');
  if (industrySelect) {
    industrySelect.addEventListener('change', (event) => {
      saveContextForm(); // preserve other fields before re-render
      const industry = event.target.value;
      const autoSensitive = INDUSTRY_SENSITIVE_DATA[industry];
      if (autoSensitive) {
        state.context.hasSensitiveData = true;
        state.context.sensitiveDataType = autoSensitive.type;
      } else if (!state.context.hasSensitiveData) {
        state.context.hasSensitiveData = false;
        state.context.sensitiveDataType = '';
      }
      state.context.industry = industry;
      render();
    });
  }
}

function bindRelationStep() {
  // Relation radio cards
  mainContent.querySelectorAll('#relationGroup .rc').forEach(card => {
    card.addEventListener('click', () => {
      state.relation = card.dataset.value;
      render();
    });
  });

  // Ownership radio cards
  mainContent.querySelectorAll('#ownershipGroup .rc').forEach(card => {
    card.addEventListener('click', () => {
      state.ownership = card.dataset.value;
      render();
    });
  });

  mainContent.querySelector('#btnNext').addEventListener('click', () => {
    if (state.relation && state.ownership) nextStep();
  });
  mainContent.querySelector('#btnPrev').addEventListener('click', previousStep);
}

function bindThreatsStep() {
  // Threat toggle checkboxes
  mainContent.querySelectorAll('.tc').forEach(card => {
    card.addEventListener('click', (event) => {
      if (event.target.tagName === 'SELECT') return;
      const id = card.dataset.id;
      if (!state.threats[id]) state.threats[id] = { active: false, probability: 'media' };
      state.threats[id].active = !state.threats[id].active;
      render();
    });
  });

  // Probability selectors
  mainContent.querySelectorAll('.ps').forEach(select => {
    select.addEventListener('change', (event) => {
      const id = event.target.dataset.id;
      if (!state.threats[id]) state.threats[id] = { active: true, probability: 'media' };
      state.threats[id].probability = event.target.value;
      if (!state.threats[id].active) {
        state.threats[id].active = true;
        render();
      }
    });
    select.addEventListener('click', e => e.stopPropagation());
  });

  mainContent.querySelector('#btnNext').addEventListener('click', nextStep);
  mainContent.querySelector('#btnPrev').addEventListener('click', previousStep);
}

function bindRiskStep() {
  mainContent.querySelector('#btnNext').addEventListener('click', nextStep);
  mainContent.querySelector('#btnPrev').addEventListener('click', previousStep);
}

function bindDocumentsStep() {
  mainContent.querySelector('#btnPrev').addEventListener('click', previousStep);

  // Download buttons
  mainContent.querySelectorAll('[data-download]').forEach(btn => {
    btn.addEventListener('click', () => downloadDocument(btn.dataset.download));
  });

  // Print/PDF buttons
  mainContent.querySelectorAll('[data-print]').forEach(btn => {
    btn.addEventListener('click', () => printDocument(btn.dataset.print));
  });

  // Export all
  const exportBtn = mainContent.querySelector('#btnDownloadAll');
  if (exportBtn) exportBtn.addEventListener('click', downloadAll);
}


// ── Render orchestrator ────────────────────────────────────────────

const STEP_RENDERERS = [
  renderContextStep,
  renderRelationStep,
  renderThreatsStep,
  renderRiskStep,
  renderDocumentsStep
];

const STEP_BINDERS = [
  bindContextStep,
  bindRelationStep,
  bindThreatsStep,
  bindRiskStep,
  bindDocumentsStep
];

function render() {
  // Calculate risk if we're past the threats step
  if (state.currentStep >= 3) calculateRisk();

  // Sidebar
  renderSidebar();

  // Main content
  const html = STEP_RENDERERS[state.currentStep]();
  const wrapper = document.createElement('div');
  wrapper.className = 'step-view visible';
  wrapper.insertAdjacentHTML('beforeend', html);
  mainContent.textContent = '';
  mainContent.appendChild(wrapper);

  // Bind events
  STEP_BINDERS[state.currentStep]();
}


// ── Init ───────────────────────────────────────────────────────────

render();
