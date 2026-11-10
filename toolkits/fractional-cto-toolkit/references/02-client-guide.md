<!--
  Fill SSOT: client takeover guide (Diátaxis ×4 in one file).
  English ASD-STE100. Engagement emit may be Spanish for Costa Rica.
  Placeholders: {{DOUBLE_CURLY}}. Not Obsidian wikilinks.
-->

# Client guide — {{PROJECT_NAME}}

> **Artifact type:** client guide for `/project-takeover`.
> One file for the lead. Four Diátaxis sections in this page
> (Explanation → Tutorial → How-to → Reference).
> On a docs site each section would be its own page. Here they travel together
> because the lead gets one document, not a handbook.
>
> Read this before you contact the prior developer. Non-technical language.

| Diátaxis section | Lead need | What you find |
|---|---|---|
| **Explanation** | Why | Risk of an informal handover |
| **Tutorial** | First orientation | Phase tour |
| **How-to** | Tasks | Lead vs CTO actions |
| **Reference** | Look-up | Timeline, FAQ, pack files |

---

## 1. Explanation — Why a formal process

When software changes hands without order, costly failures appear:

- **Access loss:** if only the prior developer knows the passwords, losing their
  help can mean losing access to your own product.
- **Legal risk:** without a signed record that the code is yours, the developer
  may claim ownership — even if you paid for the work.
- **Downtime:** if nobody knows where each piece lives, rebuild work that should
  take days can take weeks.

This process protects your investment and cuts those risks. It does not replace
the commercial contract or the governance plans (SPMP / risk) that start later
with the PSA.

### Project risk level

{{RISK_BLOCK}}

<!-- Skill fills HIGH / MEDIUM / LOW in business terms: timeline, counsel, urgency. -->

---

## 2. Tutorial — Transition tour (first read)

Read this section end to end the first time. It is not a task list (see How-to).
It is the map of what will happen.

### Phase 1 — Protect what you already have

We make sure code, data, and accounts sit under **your** control. Until then you
depend on the prior developer's goodwill.

### Phase 2 — Full inventory

We list every piece of the product: code, servers, databases, external services,
designs. Like buying a restaurant without knowing the gas contract ends in two
weeks. Software also hides costs and accounts.

### Phase 3 — Security

We change the "keys" of the project. Even when the relationship is friendly, this
is good practice — like changing locks when you buy a house.

### Phase 4 — Verification

We confirm everything works after the handoff. Keys alone are not enough. You
must open each door.

At the end you should explain two things to another person in two minutes. Why
there is a signed delivery meeting. Why the CTO backs up **before** talking to
the prior developer.

---

## 3. How-to — What to do (tasks)

Goal: finish what the lead must decide or deliver. Concrete steps.
If you have not read Explanation + Tutorial, go back first.

### What I need from you NOW

1. **Decide the legal topic** — Do you have a contract that says the code is
   yours? If not, you need counsel before you move (especially HIGH / MEDIUM).
2. **Grant access** to systems you already control (email, cloud accounts you
   know).
3. **Review the delivery request** — the list we will ask the prior developer
   to complete at the meeting.

### By phase — you vs the CTO

| Phase | You (lead / client) | CTO (takeover lead) |
|---|---|---|
| 1 Protect | Counsel if IP assignment is missing. List accounts you know. | Backup / fork **before** the meeting. Confirm deliverables. |
| 2 Inventory | Invoices, receipts, service emails. Corporate email access. | Service map, who pays, what fails if it drops. Recurring costs. |
| 3 Security | Nothing operational (except approve windows if the product is live). | Rotate access, remove prior developer, 2FA on critical accounts. |
| 4 Verification | Test the product as a user. Report odd behavior. | Build/deploy from scratch, backups, docs so one person is not a single point. |

### Delivery meeting

1. Confirm a date with the prior developer.
2. Present `legal-template-delivery-request-{{SLUG}}.md`.
3. Sign acceptance (both parties).
4. If they miss signed deadlines → take the signed request + breach notice to
   counsel. The CTO does **not** send the breach notice without counsel.

---

## 4. Reference — Timeline, FAQ, documents

### Estimated timeline

{{TIMELINE_BLOCK}}

<!-- Replace by risk. HIGH: Phase 1 days 1-2. Phase 2 days 3-4. Phase 3 day 2.
Phase 4 days 5-7. MEDIUM: Phase 1 week 1. Phase 2 weeks 1-2. Phase 3 week 2.
Phase 4 weeks 2-3. LOW: Phases 1-4 in 2-3 weeks at normal pace. -->

### Pack documents (quick look-up)

| File | Who uses it | When |
|---|---|---|
| This guide | Lead / client | Before and during the transition |
| `playbook-{{SLUG}}.md` | CTO | Choose high / medium / low branch (internal) |
| `legal-template-delivery-request-{{SLUG}}.md` | Lead + prior developer | Meeting — signed |
| `legal-template-breach-notice-{{SLUG}}.md` | Lead counsel | Only on breach |

### FAQ

**What if the developer refuses to deliver?**
It depends on the contract. With IP assignment you have legal backing. Without a
contract, IP counsel advises. Meanwhile the CTO assesses what is recoverable
without cooperation.

**Can I keep using the product during the transition?**
Yes. The transition does not shut the service down. Security changes (Phase 3)
keep the product running.

**What does this cost?**
The transition is part of the CTO service. Typical extra costs: counsel (if
needed) and cloud services that must move to your account.

**What if the code is poor quality?**
Possible. After inventory, the CTO delivers an honest report: what works, what
to improve, options. That analysis closes Phase 4.

**Does this replace SPMP / risk plans?**
No. After the pack, the next commercial/governance step is `/contract-psa`
(Milestone 1 Discovery).

---

> **Next step:** review "{{PROJECT_NAME}} — Formal Delivery Request" and confirm
> you agree to send it to the prior developer.
