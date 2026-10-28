# Unit Economics — la doctrina del flywheel

Referencia canónica de unit economics para el toolkit. La consume el comando `/revenue` y el agente
`revenue-analyst`. Todo cálculo de LTV, CAC y payback en el toolkit **debe** seguir estas
definiciones — si un número no se calcula así, es ruido.

Regla madre del toolkit: **un funnel económicamente roto no se optimiza, se mata**. Estas métricas
son el termómetro que decide acelerar, vigilar o matar.

---

## 1. CAC — blended vs paid (la trampa más común)

Hay dos CAC y confundirlos infla artificialmente cada ratio que los usa.

| Tipo | Fórmula | Para qué sirve |
|---|---|---|
| **CAC paid-only** | `paid_spend / new_customers_from_paid` | Eficiencia de un canal pago aislado |
| **CAC blended** | `(paid_spend + tooling + people + overhead) / total_new_customers` | Verdad económica del negocio completo |

**Por qué importa**: el CAC blended incluye lo que el paid-only esconde — sueldos del equipo de
growth, herramientas (ad manager, CRM, analytics), y los clientes que llegaron orgánicos (que NO
son gratis: alguien produjo ese contenido). El CAC blended verdadero suele ser **1.3–1.5×** el
CAC paid-only.

**Doctrina del toolkit**: para decidir salud del negocio se usa **CAC blended**. El paid-only solo
sirve para comparar canales entre sí. Calcular LTV:CAC contra paid-only siempre miente hacia arriba.

```
CAC blended = (ad_spend + tooling + growth_payroll + attributable_overhead)
              / new_paying_customers_all_channels
```

---

## 2. LTV — siempre sobre gross margin, nunca sobre revenue

**Regla inviolable**: LTV se calcula con **gross margin**, no con revenue. Usar revenue como LTV es
el error que hace quebrar negocios que "en el modelo se veían sanos".

```
LTV = gross_margin% × ARPA × (1 / gross_churn_mensual)
```

donde:
- `gross_margin%` = (revenue − COGS) / revenue. COGS incluye hosting, payment fees, soporte
  variable, fulfillment — lo que cuesta *entregar* el producto a un cliente más.
- `ARPA` = average revenue per account por período (mes).
- `1 / gross_churn_mensual` = vida promedio del cliente en meses (si el churn mensual es 5%,
  la vida promedio es 20 meses).

Alternativa equivalente con lifetime explícito:
```
LTV = gross_margin% × ARPA × avg_lifetime_months
```

**Guardas de honestidad** (heredadas de `revenue-analyst`):
- Nunca proyectar LTV a más de 12 meses de vida sin data de cohorte que lo respalde (overconfidence).
- Si la cohorte tiene < 90 días, declarar el LTV como estimación con intervalo de confianza ±30%.
- Nunca aceptar "el LTV va a subir" como argumento si la data de cohorte no lo muestra.

---

## 3. Payback period — en meses (y por qué)

El payback es **cuánto tarda un cliente en devolver su propio CAC vía gross margin acumulado**. Es
la métrica de eficiencia de capital: mide qué tan rápido reciclás el dinero para adquirir al
siguiente cliente.

```
Payback (meses) = CAC_blended / (gross_margin% × ARPA_mensual)
```

Se expresa **en meses** porque es la unidad en la que un founder toma decisiones de cash: "recupero
el CAC en 8 meses" dice directamente cuánto runway consume cada cliente antes de volverse rentable.
El agente `revenue-analyst` también reporta payback en días para campañas de ciclo corto (DTC), pero
la unidad de referencia del negocio es el mes.

**Trampa**: calcular payback sobre revenue en vez de sobre gross margin. Eso subestima el payback y
esconde negocios que nunca recuperan el CAC.

---

## 4. Benchmarks saludables por modelo de negocio

Los umbrales sanos dependen del modelo. Un LTV:CAC de 3 es excelente en SaaS y apenas aceptable en
un DTC de alto margen. Tabla de referencia (🟢 sano · 🟡 vigilar · 🔴 kill):

| Métrica | SaaS / Subscription | DTC / E-commerce | Marketplace | Regla general |
|---|---|---|---|---|
| **Gross margin** | 70–85% | 35–55% | 60–80% (sobre net revenue) | debajo del rango → COGS mal modelado |
| **LTV:CAC** | 🟢 >3 · 🟡 2–3 · 🔴 <2 | 🟢 >3 · 🟡 2–3 · 🔴 <2 | 🟢 >3 · 🟡 2–3 · 🔴 <2 | <1 = perdés en cada cliente |
| **CAC payback** | 🟢 <12m · 🟡 12–18m · 🔴 >18m | 🟢 <6m · 🟡 6–9m · 🔴 >9m | 🟢 <12m · 🟡 12–18m · 🔴 >18m | > runway restante = insostenible |
| **Gross churn mensual** | 🟢 <3% · 🟡 3–5% · 🔴 >5% | n/a (repurchase-based) | 🟢 <5% · 🟡 5–8% · 🔴 >8% | churn alto mata el LTV |
| **Marginal CAC vs blended** | 🟢 <1.3× · 🟡 1.3–1.5× · 🔴 >1.5× | idem | idem | escalar infla el CAC marginal |

**Notas por modelo**:
- **SaaS**: LTV:CAC 3–5 con payback < 12m es el estándar de un negocio fundable. > 5 con payback
  corto suele significar que estás sub-invirtiendo en acquisition (dejá dinero sobre la mesa).
- **DTC**: márgenes más bajos exigen payback mucho más corto (< 6m) porque no hay recurrencia
  contractual; el LTV depende del repurchase rate real, no de un churn contractual.
- **Marketplace**: calcular todo sobre **net revenue** (GMV × take-rate), nunca sobre GMV bruto.

Estos benchmarks pueden venir custom de `.aaarrr/config.json`; si están definidos, se respetan. Si
no, se usan estos.

---

## 5. Cómo se conecta

- **`/revenue --report`** presenta CAC (blended + por plataforma), LTV (gross-margin-based),
  LTV:CAC y payback contra estos benchmarks, con semáforo por métrica.
- **`revenue-analyst`** es el dueño del cálculo; esta referencia es su libro de definiciones.
- **Consistencia cross-toolkit**: estas definiciones deben coincidir con
  `business-model-toolkit:execution-plan` (Fase 10 Economía Unitaria + capa de KPIs) y con
  `launchpad-toolkit:financial-model` (sanity checks de gross margin y CAC payback). Si un número
  diverge entre toolkits, el `revenue-analyst` lo marca — la data real del flywheel manda sobre el
  supuesto del modelo.
