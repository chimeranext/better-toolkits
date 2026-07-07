# Bilingual Output Guide

Guía de configuración bilingüe (es/en) para el `venture-studio-toolkit`. Explica el
YAML config, cómo cada skill debería interpretarlo, y el estado actual de
implementación per skill.

## Estado de implementación (v1.2.0)

**Framework documentado pero no implementado en todos los skills todavía**. Esta es una
**capability en transición** — v1.2 establece el schema oficial, v1.3+ roll outs a cada
skill gradualmente basado en dog-food.

---

## YAML config schema

El plugin lee configuración desde `.venture-studio-toolkit.local.md` en el project root
(convención plugin-settings del ecosistema chimera). Frontmatter YAML:

```yaml
---
language:
  templates: es              # idioma de los templates del plugin (es | en)
  outputs: [es, en]          # lista de idiomas en que generar outputs (array)
  fallback: es               # idioma default si no especifica
jurisdiction:
  residence: CR              # país residencia fiscal del founder
  incorporation: US-TX       # jurisdicción incorporación studio/ventures
  target_investors:          # mercados target de LPs/VCs
    - LATAM
    - US
mode: studio                 # studio | founder (afecta qué skills aplican)
---
```

## Cómo cada skill debería interpretarlo

### Skills con outputs de doble idioma obligatorio

Algunos skills generan outputs que **siempre** deben ser bilingües porque se comparten
con audiences internacionales:

- **`studio-thesis`**: tesis de 37 palabras debe generarse en ES + EN (LPs internacionales
  leen en EN)
- **`secret-sauce`**: statement bilingüe por misma razón
- **`studio-focus`**: one-liner bilingüe
- **`attached-fund-structure`**: LPA terms + PACT templates bilingües

Para estos, el skill genera **ambos outputs siempre**, ignorando el config `outputs: [...]`.

### Skills con outputs opcionalmente bilingües

La mayoría de skills generan outputs internal/operational que NO necesariamente requieren
traducción:

- **`structure-decision`**: output interno, decision-making. ES primary, EN solo si config.
- **`services-hub-setup`**: MSAs son legal docs — idioma depende de jurisdicción de cada
  Venture LLC. MSAs con CR SRL → ES. MSAs con DE LLC → EN.
- **`jurisdiction-matrix`**: reference interno, ES primary.
- **`three-horizons`, `explore-exploit`, `innovation-scorecard`**: reporting interno.
  ES primary.

Para estos, respetar `config.language.outputs: [es, en]` (generar ambos) o `[es]` (solo ES).

### Skills con output naturalmente monolingüe

Algunos skills producen output en UN idioma específico sin redundancia:

- **`accelerator-launchpad`**: aceleradoras internacionales operan en EN — applications
  en EN primarily, aunque el documento de planificación interno puede ser ES.
- **`liability-contagion-analysis`**: análisis interno, idioma del founder.

---

## Implementación técnica (v1.3+)

Cuando cada skill se actualize para bilingual:

### Paso 1: Read config

En el inicio del skill execution, cargar config desde `.venture-studio-toolkit.local.md`:

```typescript
// Pseudocode
const config = parseYAMLFrontmatter('.venture-studio-toolkit.local.md');
const outputs = config.language?.outputs ?? ['es'];  // default: solo ES
```

### Paso 2: Template en source language

Templates internos del plugin están en ES (per convención Spanish-first). Cada skill
mantiene el template principal en ES.

### Paso 3: Generate outputs

Si `outputs` incluye `en`, generar variante EN:

1. Hacer el output ES primero (template filled con user data en español)
2. Invocar translation sub-task: "Traducir output ES a EN manteniendo estructura idéntica,
   preservando terminología técnica (LLC, S.A.P.I., Cayman Sandwich, etc.) sin traducir"
3. Guardar ambos archivos: `output.md` (ES) + `output.en.md` (EN)

### Paso 4: Path convention

```
./portfolio/{name}/
├── structure-decision.md       # default idioma (per config.language.fallback)
├── structure-decision.en.md    # English variant (solo si en `outputs`)
├── structure-decision.es.md    # Spanish variant (solo si en `outputs` y es ≠ fallback)
```

---

## Translation preservation rules

Al traducir ES → EN, **NO traducir**:

- **Nombres legales de jurisdicciones**: "Sociedad Anónima (S.A.)", "Sociedad de Responsabilidad
  Limitada (S.R.L.)", "Sociedad por Acciones Simplificada (S.A.S.)", "Sociedade Limitada (Ltda.)",
  "Sociedade Anônima (S.A.)" — estos son términos legales específicos
- **Nombres de estructuras**: "Delaware Tostada", "Cayman Sandwich", "Skip-CR Pattern" (son
  términos de la industria LATAM, no traducciones literales)
- **Nombres propios**: "chimeranext Labs", "chimeranext", "Pathways", "Altrupets", etc.
- **Acrónimos financieros**: MRR, LTV, CAC, NPS, CSAT, AARRR — internacionalmente usados
- **Frameworks**: "Three Horizons", "Pirate Metrics", "Cost of Delay", "Improvement Kata"
- **Referencias a libros/autores**: "Lean Enterprise", "Humble/Molesky/O'Reilly", "Toyota Kata"
- **URLs + links**: mantener exactos

**SÍ traducir**:

- Texto explicativo / narrative
- Headers / section titles
- Cuestionamientos al usuario
- Recomendaciones / rationale

---

## Workflow del usuario

### Primera vez (setup)

1. Crear `.venture-studio-toolkit.local.md` en root del proyecto con frontmatter YAML
2. Invocar cualquier skill — skill lee config automáticamente
3. Output generado respetando `language.outputs`

### Cambio de idioma mid-project

1. Editar `.venture-studio-toolkit.local.md` frontmatter
2. Invocar skill de nuevo — genera outputs en new config
3. Outputs anteriores persisten (no se borran) — user decide cleanup

### Skip config (default behavior)

Si `.venture-studio-toolkit.local.md` no existe:
- Templates: ES
- Outputs: solo ES
- Fallback: ES

Es el behavior current del plugin (pre-v1.3).

---

## Roadmap de implementación bilingüe per skill

| Skill | Prioridad | Estado actual | Target version |
|---|---|---|---|
| `studio-thesis` | Alta (LP-facing) | ES only | v1.3 |
| `secret-sauce` | Alta | ES only | v1.3 |
| `studio-focus` | Media | ES only | v1.3 |
| `attached-fund-structure` | Alta (regulatory) | ES only | v1.3 |
| `structure-decision` | Media | ES only | v1.4 |
| `services-hub-setup` (MSA templates) | Alta | ES only | v1.3 — MSAs deben ser bilingual según jurisdicción |
| `accelerator-launchpad` | Alta (applications in EN) | ES only | v1.3 |
| Reference docs (`jurisdiction-matrix`, etc.) | Baja | ES only | v1.5+ |
| Skills operativos (cost-of-delay, improvement-kata, etc.) | Baja | ES only | v1.5+ |

---

## Contribuciones

Si implementás bilingual support en un skill, seguir este pattern:

1. Leer config YAML
2. Mantener template ES como fuente de verdad
3. Implementar translation preservation rules (ver arriba)
4. Generar ambos archivos output (.md + .en.md si aplica)
5. Test con user config `outputs: [es, en]` y verificar ambos outputs son coherentes

---

## FAQ

**¿Por qué ES como source y EN como target (vs. EN como universal)?**

El plugin se diseñó con enfoque LATAM-first. El autor es CR-based, el target audience
primary es founders LATAM. Templates en ES son more natural para el flow. EN es
downstream para audiences internacionales (LPs US, VCs globales).

**¿Puedo agregar otros idiomas (PT, FR)?**

Framework es extensible. Agregar `pt` o `fr` a `outputs` → skill debería honrar. Actual
implementation prioriza EN por volumen de uso, pero el schema soporta cualquier idioma.

**¿Cómo se coordina con plugins externos (BMT, UX toolkit)?**

BMT y UX toolkit son Spanish-first native. venture-studio-toolkit mantiene misma convention
por consistency. EN outputs son additives, no reemplazan ES primary.
