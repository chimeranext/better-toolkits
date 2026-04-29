---
description: "Pausa todo (Acquisition + Retention + Referral) si el sistema económicamente colapsa. Uso de emergencia."
argument-hint: "[<scope: all|acquisition|retention|referral>] [--reason '<motivo>'] [--save-learning]"
---

# /kill-funnel — Emergency stop

Comando de emergencia. Pausa todo el sistema o la parte específica que se le pida. **Nunca borra** assets — solo cambia status a PAUSED en Meta. La decisión es siempre del humano; este comando ejecuta la pausa con confirmación, no la decide.

**Cuándo usar**: cuando `revenue-analyst` recomienda KILL (LTV:CAC < 2, payback > 90d), cuando aparece un problema legal/compliance, cuando el producto está roto y no hay sentido pagar tráfico, cuando cambias estrategia y no quieres seguir gastando.

## Parsing

- `<scope>`: posicional. `all` (default), `acquisition`, `retention`, `referral`. Si pasa "acquisition", solo pausa campañas con prefijo `AAARRR-Acquisition-*`.
- `--reason '<motivo>'`: descripción libre. Se guarda en `.aaarrr/learnings/`. Si falta, el comando lo pide antes de proceder.
- `--save-learning`: default `true`. Genera entry en `.aaarrr/learnings/kill-{date}.md` con el contexto, métricas al momento del kill, y razón.
- `--rollback`: re-activa lo último que se pausó. Solo funciona si `--save-learning` capturó los IDs.
- `--what-if`: simulación. Lista qué se pausaría sin ejecutar.

## Workflow

### Fase 1: Validación

```bash
# Confirma .aaarrr/config.json y META_ACCESS_TOKEN
# Pull lista actual de campaigns con prefijo AAARRR-*
curl -G "https://graph.facebook.com/v21.0/act_{id}/campaigns" \
  -d "fields=id,name,status,daily_budget" \
  -d "filtering=[{'field':'name','operator':'CONTAIN','value':'AAARRR-'}]" \
  -d "access_token=$META_ACCESS_TOKEN"
```

### Fase 2: Filter por scope

```python
if scope == "all":
  targets = all_aaarrr_campaigns
elif scope == "acquisition":
  targets = filter(name.contains("AAARRR-Acquisition-"))
elif scope == "retention":
  targets = filter(name.contains("AAARRR-Retention-"))
elif scope == "referral":
  targets = filter(name.contains("AAARRR-Referral-"))
```

### Fase 3: Resumen pre-kill

Output **antes** de ejecutar nada:

```markdown
## ⚠️ Kill Pre-Flight

**Scope**: {scope}
**Campaigns afectadas**: {N}

| Campaign Name | Current Status | Daily Budget | Spend last 30d |
|---|---|---|---|
| AAARRR-Acquisition-CursoX-2026-04-15 | ACTIVE | $50 | $1,432 |
| AAARRR-Retention-CursoX-2026-04-22 | ACTIVE | $10 | $187 |
| AAARRR-Referral-CursoX-2026-04-29 | PAUSED | $5 | $42 |

**Total daily spend que se detiene**: $65/día = $1,950/mes.
**Revenue last_30d de estas campañas**: $X (según insights).

## Razón del kill
{reason flag o input del usuario}

## ¿Confirmas pausa de las {N} campañas? (y/n)
```

Solo con `y` explícito procedes a Fase 4.

### Fase 4: Execute

Para cada campaign:
```bash
curl -X POST "https://graph.facebook.com/v21.0/{campaign_id}?access_token=$META_ACCESS_TOKEN" \
  -d "status=PAUSED"
```

Captura response. Si alguna falla, **detente** y reporta cuál — no asumas que pausó.

### Fase 5: Save learning (default)

Genera `.aaarrr/learnings/kill-{YYYY-MM-DD}.md`:

```markdown
# Kill Event — YYYY-MM-DD HH:MM

## Scope
{all | acquisition | retention | referral}

## Reason
{reason del usuario}

## Métricas al momento del kill
{copy de la última /aaarrr-analyze}

## Campaigns pausadas
| ID | Name | Status Antes | Status Después | Daily Budget |
|---|---|---|---|---|
| ... | ... | ACTIVE | PAUSED | $50 |

## Lessons learned
{Síntesis del usuario o auto-generada por revenue-analyst}

## Rollback command
```bash
# Si decidís reactivar:
/kill-funnel --rollback
```
```

### Fase 6: Output final

```markdown
✅ Kill ejecutado.
- {N} campañas pausadas
- Daily spend frenado: $X/día
- Learning guardado en .aaarrr/learnings/kill-{date}.md

Próximos pasos sugeridos:
1. Diagnóstico de root cause: /revenue --kill-check + revisar `.aaarrr/learnings/`
2. Si producto roto: pausa indefinida hasta fix
3. Si solo creative fatigue: /aaarrr-launch nuevo con learnings aplicados
4. Si quieres revertir: /kill-funnel --rollback (solo funciona si fue dentro de 7 días)
```

## Modo `--rollback`

1. Lee el último `.aaarrr/learnings/kill-*.md`
2. Si tiene <7 días, ofrece reactivación campaign por campaign:
   ```
   ¿Re-activar AAARRR-Acquisition-CursoX-2026-04-15? (status era ACTIVE) [y/n]
   ```
3. Por cada `y`:
   ```bash
   curl -X POST "https://graph.facebook.com/v21.0/{id}?access_token=$META_ACCESS_TOKEN" \
     -d "status=ACTIVE"
   ```

## Reglas Inviolables

1. Nunca pausas sin confirmación humana
2. Nunca borras campañas (delete), solo PAUSED — preserva historia
3. Siempre guardas learning antes de pausar (default `--save-learning`)
4. Si usuario pide `--reason`, no skip esa info — vivirá en learnings
5. Si una pausa falla en Graph API, detente y reporta — no asumas éxito parcial
