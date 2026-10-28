---
description: "Optimiza Activation: paso click → primer valor. Diagnostica leak y propone intervención."
argument-hint: "[--diagnose | --fix-cvr <target%> | --ab-test] [--platform fb|ig|both]"
---

# /activate — Optimizar Activation

Comando dedicado a la tercera A: Activation. No es Acquisition (eso es traer tráfico) ni Revenue (eso es monetización). Es el paso del primer "wow" — la diferencia entre un usuario que sale y uno que se queda.

## Parsing

- `--diagnose`: default. Levanta tabla de funnel de activación con drop-offs.
- `--fix-cvr <target%>`: si pasas "1.5%", busca pasos con CVR menor y propone fix.
- `--ab-test`: si hay volumen suficiente, genera spec de A/B test.
- `--platform fb|ig|both`: filtra el análisis a una plataforma.
- `--first-7-days`: ventana de activación. Default 7. Otros válidos: 1, 14, 30.
- `--optimize-for purchase|signup|onboarding-complete`: el evento de activation. Default lee de config.

## Workflow

### Modo `--diagnose` (default)

Handoff a `activation-optimizer`:

```
Diagnóstica el funnel de activation para {producto} en window last_30d.
Ventana de activación: --first-7-days
Activation event: {flag o config.product.activation_event}
Genera tabla click → LV → Lead → Activation → Revenue por plataforma.
Identifica leak #1 (mayor drop-off absoluto).
Propone 3 intervenciones priorizadas por (impacto × 1/esfuerzo).
Guarda en .aaarrr/diagnoses/activation-{date}.md.
```

Output al usuario: la tabla, el leak, las 3 intervenciones con expected lift.

### Modo `--fix-cvr <target>`

Si el usuario indica "fix cvr<1.5%", el agente:
1. Identifica pasos por debajo del target
2. Para cada uno, genera 1-3 cambios concretos:
   - Si es landing page: copy diff propuesto + screenshots de inspiración
   - Si es form: redux de campos
   - Si es onboarding: cambio de empty state
3. Si tiene acceso al codebase del producto (mismo workspace), genera diff aplicable
4. Si no, genera spec detallada para handoff a dev

### Modo `--ab-test`

1. `activation-optimizer` valida volumen mínimo: 2,000 visitors/semana en la página objetivo
2. Si NO califica, output: "Volumen insuficiente para A/B test estadísticamente válido. Recomiendo aplicar best practice del leak detectado en /activate --diagnose y medir delta vs baseline después de 2 semanas."
3. Si SÍ califica, genera spec en `.aaarrr/experiments/{exp-id}.md`:
   - Hipótesis (1 variable, no multivariable)
   - Variants A (control) / B (test)
   - Success metric + secondary
   - Sample size needed para 95% confidence
   - Duration estimada
   - Stop conditions

## Output Format

Tabla de funnel siempre con esta estructura:

```markdown
| Stage | Count | CVR | Target | Status |
|---|---|---|---|---|
| Click | 4,521 | — | — | — |
| Landing View | 3,840 | 85% | >90% | 🟡 |
| Lead | 692 | 18% | >25% | 🔴 ← TOP LEAK |
| Activation | 228 | 33% | >40% | 🟡 |
| Revenue | 57 | 25% | >30% | 🟡 |
```

## Reglas Inviolables

1. Nunca propones más de 3 cambios por intervención (pierdes atribución)
2. Nunca propones A/B test sin volumen mínimo
3. Si el problema raíz parece ser PMF (todos los stages caen >50%), lo dices: "esto no es Activation, es PMF. Detente y revalida problema antes de optimizar."
