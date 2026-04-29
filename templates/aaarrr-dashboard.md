# AAARRR Dashboard — {{producto}}

**Window**: {{window}}
**Updated**: {{timestamp}}
**Source**: Meta Graph API + .aaarrr/metrics/

---

## 🔻 Funnel — Acquisition lineal

| Stage | Metric | FB | IG | Blended | Target | Status |
|---|---|---|---|---|---|---|
| Awareness | CPM | ${{fb.cpm}} | ${{ig.cpm}} | ${{blended.cpm}} | <$15 | {{status.cpm}} |
| Awareness | Reach | {{fb.reach}} | {{ig.reach}} | {{blended.reach}} | — | — |
| Awareness | Frequency | {{fb.freq}} | {{ig.freq}} | {{blended.freq}} | <3 | {{status.freq}} |
| Acquisition | CTR | {{fb.ctr}}% | {{ig.ctr}}% | {{blended.ctr}}% | >1% | {{status.ctr}} |
| Acquisition | CPC | ${{fb.cpc}} | ${{ig.cpc}} | ${{blended.cpc}} | — | — |
| Acquisition | CPL | ${{fb.cpl}} | ${{ig.cpl}} | ${{blended.cpl}} | — | — |
| Acquisition | **CPA** | **${{fb.cpa}}** | **${{ig.cpa}}** | **${{blended.cpa}}** | **<${{target.cpa}}** | {{status.cpa}} |
| Activation | Click → LV | {{fb.lv_rate}}% | {{ig.lv_rate}}% | {{blended.lv_rate}}% | >85% | {{status.lv}} |
| Activation | LV → Lead | {{fb.lead_rate}}% | {{ig.lead_rate}}% | {{blended.lead_rate}}% | >25% | {{status.lead}} |
| Activation | Lead → Activation | {{fb.act_rate}}% | {{ig.act_rate}}% | {{blended.act_rate}}% | >35% | {{status.act}} |
| Activation | Time-to-Activation | {{fb.tta}}h | {{ig.tta}}h | {{blended.tta}}h | <24h | {{status.tta}} |
| Revenue | Avg Order Value | ${{fb.aov}} | ${{ig.aov}} | ${{blended.aov}} | — | — |
| Revenue | 30d Revenue/Customer | ${{fb.30d_rev}} | ${{ig.30d_rev}} | ${{blended.30d_rev}} | — | — |
| Revenue | Estimated 12mo LTV | ${{fb.ltv}} | ${{ig.ltv}} | ${{blended.ltv}} | >${{target.ltv}} | {{status.ltv}} |
| Revenue | **LTV:CAC** | **{{fb.ltv_cac}}** | **{{ig.ltv_cac}}** | **{{blended.ltv_cac}}** | **>3** | {{status.ltv_cac}} |
| Revenue | Payback (days) | {{fb.payback}} | {{ig.payback}} | {{blended.payback}} | <45 | {{status.payback}} |

---

## 🔁 Flywheel — Retention/Referral feedback loop

| Stage | Metric | FB | IG | Blended | Target | Status |
|---|---|---|---|---|---|---|
| Retention | D7 cross-sell rate | {{fb.d7_xs}}% | {{ig.d7_xs}}% | {{blended.d7_xs}}% | >8% | {{status.d7}} |
| Retention | D30 repurchase rate | {{fb.d30_rp}}% | {{ig.d30_rp}}% | {{blended.d30_rp}}% | >15% | {{status.d30}} |
| Retention | D90 reactivation rate | {{fb.d90_react}}% | {{ig.d90_react}}% | {{blended.d90_react}}% | >5% | {{status.d90}} |
| Retention | Churn 60d | {{fb.churn60}}% | {{ig.churn60}}% | {{blended.churn60}}% | <30% | {{status.churn}} |
| Referral | Buyers que invitan | {{fb.invite_rate}}% | {{ig.invite_rate}}% | {{blended.invite_rate}}% | >15% | {{status.invite}} |
| Referral | Click-through invitación | {{fb.invite_ctr}}% | {{ig.invite_ctr}}% | {{blended.invite_ctr}}% | >50% | {{status.invite_ctr}} |
| Referral | Convert referido | {{fb.ref_conv}}% | {{ig.ref_conv}}% | {{blended.ref_conv}}% | >10% | {{status.ref_conv}} |
| Referral | **K-factor (30d)** | **{{fb.k}}** | **{{ig.k}}** | **{{blended.k}}** | **>0.20** | {{status.k}} |
| Referral | Implied CAC vía referral | ${{fb.ref_cac}} | ${{ig.ref_cac}} | ${{blended.ref_cac}} | <CAC paid * 0.3 | {{status.ref_cac}} |

---

## Verdict

{{verdict}}

## Risks

{{risks}}

## Next Step

1. {{next_step_1}}
2. {{next_step_2}}
3. {{next_step_3}}

---

## Status legend
- 🟢 Healthy — dentro o mejor que target
- 🟡 Watch — entre 0.7x y 1.0x target
- 🔴 Action — peor que 0.7x target o trigger violado
