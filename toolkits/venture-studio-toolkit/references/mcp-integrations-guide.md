# MCP Integrations Guide

Guía de **Model Context Protocol (MCP)** integrations que enriquecen skills del
`venture-studio-toolkit`. Las MCP integrations son **opcionales** — cada skill funciona
standalone, pero MCPs específicos desbloquean features adicionales.

## ⚠️ Estado de implementación (v1.2.0)

**Documentación de integration points, NO implementación directa en skills todavía.**
Cada MCP integration requiere:

1. User connects MCP en su Claude Code setup (usualmente vía `.mcp.json` del plugin
   o claude.ai connectors)
2. Skill detects MCP availability y usa si disponible
3. Skill falls back a manual flow si MCP no disponible

v1.3+ rolls out implementation per MCP según demand del dog-food.

---

## MCPs relevantes

### Linear MCP (highest impact)

**Provider**: Oficial Linear MCP via <https://linear.app> account

**Setup**: user connects Linear MCP en claude.ai/settings/connectors O en local `.mcp.json`
del plugin

**Skills que se benefician**:

| Skill | Enhancement con Linear MCP |
|---|---|
| `accelerator-launchpad` | Generar SPIKE issues automáticamente para accelerator applications con assignee correcto. Status: recommendation, no implementation yet. |
| `three-horizons` | Import ventures desde Linear teams/projects en lugar de asking user. Quarterly review comments post-processing. |
| `innovation-scorecard` | Sync metrics con Linear issue status (feature completion, cycle time). |
| `cost-of-delay-cd3` | Import feature backlog desde Linear issues. Rank CD3 results. Update priorities. |
| `improvement-kata` | Create obstacle issues + daily PDCA sub-tasks en Linear. |
| `vertical-charter` | Map studio verticals a Linear teams. Sync charter a team description. |
| `sweat-equity-agreement` | Track vesting milestones en Linear issues. |

**Funciones MCP típicas usadas**:
- `linear.save_issue` — crear/update issues con correct assignee
- `linear.list_projects` — discover active projects per team
- `linear.list_teams` — map studio verticals
- `linear.save_comment` — post progress updates

**Nota sobre seguridad**: user control sobre auth — skills NUNCA access Linear sin
explicit user consent.

---

### Context7 MCP

**Provider**: Context7 (<https://context7.com>)

**Setup**: connect Context7 MCP en Claude Code

**Skills que se benefician**:

| Skill | Enhancement con Context7 |
|---|---|
| `structure-decision` | Current docs de Stripe Atlas, Firstbase, Clerky para incorporation workflows. Avoid stale snapshots en el skill. |
| `services-hub-setup` | Latest MSA templates de Cooley Go, Carta. Avoid hardcoded snippets que se vuelven stale. |
| `cap-table-per-venture` | Current Carta, Pulley API docs si integration futura. |
| `attached-fund-structure` | Latest Cornerstone LPA v3.X de govclab. Latest SEC Reg D guidance. |
| `accelerator-launchpad` | Current YC, Techstars, 500 Global application requirements (cambian per cohort). |

**Funciones MCP típicas**:
- `context7.query-docs` — get latest docs de service X
- `context7.resolve-library-id` — find correct library identifier

**Razón**: mucha de la info en los skills tiene expiration date (accelerator cohort
deadlines, Stripe Atlas pricing, legal template versions). Context7 keeps it fresh.

---

### GitHub MCP (plugin-chrome-devtools-mcp de Anthropic)

**Skills que se benefician**:

| Skill | Enhancement |
|---|---|
| `venture-spin-out-playbook` | Fork/create new repos para new LLC automáticamente post-spin-out. |
| `shared-services-ledger` | Track intercompany commits (IP transfer docs en git repos). |

**Funciones**:
- `gh` CLI vía Bash tool (siempre disponible, no requiere MCP separado)

---

### Slack MCP (optional)

**Provider**: claude.ai Slack connector

**Skills que se benefician**:

| Skill | Enhancement | ⚠️ Importante |
|---|---|---|
| `shared-services-ledger` | Notify venture owners monthly invoice posted | User puede opt-out explicit |
| `innovation-scorecard` | Notify scorecard updated quarterly | Same |
| `improvement-kata` | Daily check-in reminders a coach + learner | Same |

**Nota importante**: algunos users (per feedback memory) **explícitamente NO quieren
Slack notifications del plugin**. Skills que usan Slack MCP deben:

1. Verificar si user tiene Slack opt-in explícito (vía config `notifications.slack: true`)
2. Default OFF
3. Nunca send sin consent

---

### Figma MCP

**Skills que se benefician**:

| Skill | Enhancement |
|---|---|
| `venture-spin-out-playbook` | Transferir design assets (logo, brand) a new entity's Figma workspace |
| Cross-plugin con BMT Fase 12 (Branding) | Create design systems per venture |

---

### Playwright / Chrome DevTools MCP

**Skills que se benefician**:

| Skill | Enhancement |
|---|---|
| `accelerator-launchpad` | Screenshot + analyze accelerator websites para validar application requirements current |
| `jurisdiction-matrix` (reference) | Validate annual costs by scraping government portals (Delaware Div of Corps, CR Registro Mercantil, etc.) — annual update automation |

---

## MCPs NO recomendados / fuera de scope

- **Banking MCPs (Mercury, Stripe)**: sensitive financial data. Skills no should auto-access
  accounts. User manages banking manually.
- **DocuSign / Adobe Sign**: legal signatures. User responsibility, no automation.
- **Email MCPs (Gmail)**: LP communications. Too sensitive for automation, user drafts
  manually.

---

## Patrón de integration recomendado

Cuando un skill usa MCP, seguir este patrón en 4 pasos:

**1. Check MCP availability** (try detect via tool search o config)

- Available → use MCP capabilities
- Not available → fall back a manual flow (pedir user input directly)

**2. ALWAYS provide manual fallback** (no hard requirement on MCP)

**3. Document expected MCP en skill frontmatter**:

```yaml
mcp_recommended:
  - linear       # Enhances venture/team discovery
  - context7     # Current legal template versions
mcp_required: [] # Ningún MCP es hard requirement
```

**4. User can proceed sin MCPs** — skill works solo, outputs manualmente.

---

## Roadmap implementation per MCP

| MCP | Priority | Value | Target version |
|---|---|---|---|
| Linear | Alta | Critical for venture discovery + tracking | v1.3 |
| Context7 | Media | Keep legal/accelerator data fresh | v1.4 |
| GitHub (vía `gh`) | Ya disponible | Native support via Bash | v1.0 (existing) |
| Slack | Baja (opt-in) | Notifications | v1.5 |
| Figma | Baja | Design asset management | v1.6+ |
| Playwright | Baja | Annual jurisdiction data refresh | v1.6+ |

---

## Setup del usuario (cuando esté disponible)

Cuando un skill con MCP integration se invoque, el plugin:

1. Lee `.mcp.json` del plugin root (si existe) para MCPs pre-configured
2. Detecta user's claude.ai connectors (si running con claude.ai session)
3. Si MCP target está disponible → usa
4. Si no → pregunta user si quiere setup OR procede manualmente

User puede gestionar MCPs en:
- Claude Code local: `.mcp.json` files per project
- Claude.ai: <https://claude.ai/settings/connectors>

---

## Contribuciones

Para implementar MCP integration en un skill:

1. Document en skill frontmatter: `mcp_recommended: [linear]`
2. Add try/catch para MCP detection al inicio del skill
3. Implement MCP-enhanced path (happy case)
4. Implement manual fallback path (graceful degradation)
5. Test ambos paths
6. Update este guide con integration concreta

---

## FAQ

**¿Necesito configurar MCPs para usar el plugin?**

No. Todos los skills funcionan standalone sin MCPs. Las integrations son **enhancements**,
no requirements.

**¿Qué MCPs debería configurar primero?**

Para users LATAM serial entrepreneur:
1. **Linear MCP** (highest impact si ya usas Linear para tracking)
2. **Context7** (para docs legales current)

**¿El plugin guarda MCP credentials?**

No. Credentials viven en `.mcp.json` del user (local) o en claude.ai connectors. Plugin
solo invoca MCP funcionalidad — nunca stores auth.

**¿Puedo escribir mi propio MCP para integrar con mi sistema custom?**

Sí. MCP spec es open — cualquiera puede crear servidor MCP propio. Ver
<https://modelcontextprotocol.io> para documentation. Si tu MCP integra con workflow del
venture-studio-toolkit, considerar contribuir integration patterns a este guide.
