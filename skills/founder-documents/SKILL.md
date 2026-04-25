---
name: founder-documents
version: 0.2.0
description: >
  Generates the standard founder document stack for a new venture —
  Founder Stock Purchase Agreement (or Operating Agreement for LLCs), IP
  Assignment, Vesting Schedule Exhibit, Advisor Agreement (FAST framework),
  SAFE (post-money YC standard), Term Sheet (Series Seed NVCA standard).
  Each output is a preparation draft, NOT legal advice. Use when the user
  asks "founder documents", "founder agreement", "IP assignment", "advisor
  agreement", "SAFE", "term sheet", "FAST agreement", "/founder-documents".
  STRONG LEGAL DISCLAIMER applies.
---

# Founder Documents

Genera el **stack de documentos founder** para un venture nuevo. Cada output es un **preparation draft** — un starting point estructurado para validación por corporate lawyer, NO un documento ejecutable directamente.

## ⚠️ DISCLAIMER LEGAL CRÍTICO

Estos documentos tienen efectos legales + fiscales que duran décadas. Usar templates sin lawyer review es alta-probabilidad de:

- **Founder fights irreversibles** (equity disputes, IP claims, departure terms)
- **VC rejection en diligence** (non-standard clauses, missing reps & warranties)
- **Tax nightmares** (missed 83(b) deadlines, incorrect entity elections, QSBS disqualification)
- **Regulatory violations** (securities law for SAFEs, CA/NY labor law for advisors, etc.)

**Esta skill genera drafts educativos y estructurados, NO reemplaza**:

- **Corporate lawyer** — OBLIGATORIO antes de firmar cualquiera de estos docs
- **Securities lawyer** — para SAFEs, Term Sheets, priced rounds
- **Tax lawyer / CPA** — 83(b) elections, QSBS qualification, entity choice
- **Employment lawyer** — employee agreements, contractor vs employee classification

**No firmar estos documentos sin validación legal.** Costo de lawyer: $500-2000 para review de documentos standard, $5-20k para custom drafting. Infinitamente menor que el costo de litigar equity disputes o perder deals por cap table errors.

## Regla de idioma

Español para interacción. **Legal documents en inglés** (convención industria US para ventures con intent de levantar VC internacional). Jurisdicciones LATAM-only pueden generarse en español pero con flag upfront de que no aplican templates US.

## Directorio de salida

```
./launchpad/{startup-slug}/founder-documents/
├── 01-founder-stock-purchase-agreement.md   # (C-Corp) o operating-agreement.md (LLC)
├── 02-ip-assignment-agreement.md
├── 03-vesting-schedule-exhibit.md
├── 04-advisor-agreement-FAST.md              # Per advisor — see advisors/ subfolder
├── 05-safe-post-money.md                     # Per SAFE — see safes/ subfolder
├── 06-term-sheet-series-seed.md              # Solo si priced round in progress
└── document-checklist.md                     # Summary + delivery order + lawyer review notes
```

---

## Los 6 documentos core

### 1. Founder Stock Purchase Agreement (C-Corp) / Operating Agreement (LLC)

**Qué es**: contrato entre founder y company que establece **terms del equity grant** — vesting, cliff, acceleration, clawback, rights of first refusal.

**Diferencia C-Corp vs LLC**:

- **C-Corp**: **Founder Stock Purchase Agreement** — founder "compra" shares al par value ($0.00001 típico) con vesting conditions. Requiere 83(b) filing dentro de 30 días.
- **LLC**: **Operating Agreement** amendment — founder receives membership interest (profits interest o capital interest). 83(b) tratamiento diferenciado (ver `venture-studio-toolkit:sweat-equity-agreement`).

**Clauses críticas**:

- Vesting schedule (default 4 años, 1-year cliff)
- Acceleration (default double trigger)
- Clawback on voluntary departure o termination for cause (unvested revert to company)
- ROFR (Right of First Refusal) on third-party transfers
- Drag-along / tag-along
- Confidentiality obligations
- IP pre-assignment (any IP created during engagement assigned to company)

### 2. IP Assignment Agreement

**Qué es**: contrato separado (o clause en stock purchase agreement) que asigna al company **todo IP pre-existente relevante** + IP creado durante engagement.

**Por qué es crítico**:

- VCs en diligence requieren que cada founder (y cada contractor/employee) haya firmado IP assignment al company
- Sin esto, un founder que se va puede reclamar ownership de código/designs/etc.
- Pre-existing IP (projects previos que founder trae al company) debe ser explicitly listed + assigned o carved out

**Clauses críticas**:

- Definition de "Company Inventions" (lo que se asigna)
- Definition de "Prior Inventions" (lo que el founder retiene de proyectos previos)
- Assignment language (present assignment, not future promise)
- Moral rights waiver (si aplica)
- Obligación de disclosure de inventions
- Execute further documents clause (founder agrees to sign patent filings etc.)

### 3. Vesting Schedule Exhibit

**Qué es**: documento que acompaña al Stock Purchase Agreement (o Operating Agreement) con el **vesting schedule detallado** de cada founder.

Tabla mensual con shares vested cumulative + remaining unvested.

**Acceleration scenarios** documentados:

- Sale of company (change of control)
- Termination without cause
- Termination with cause (no acceleration, unvested reverts)
- Voluntary departure (no acceleration, unvested reverts)
- Death/disability (acceleration varies — typically partial or full)

### 4. Advisor Agreement (FAST framework)

**FAST** = Founder/Advisor Standard Template, del [Founder Institute](https://fi.co/fast) — templates free + industry-standard para advisor equity grants.

**Qué cubre FAST**:

- **Level**: Standard / Strategic / Expert
- **Engagement**: Ideation / Start-up / Growth
- **Equity %**: matriz (0.1% - 1.0%) según combinación level × engagement
- **Vesting**: 2 años monthly, no cliff (aleatorio vs. stock grants porque advisor commitment es menor)
- **Term**: 2 años renewable o terminable anytime
- **Deliverables**: 1-2 hours/month meeting, occasional ad-hoc availability
- **NDA + IP assignment**: included
- **No compensation beyond equity** (unless otherwise documented)

**Cuándo usar FAST vs. custom**:

- FAST: early stage advisors, equity-only, 0.1-1% grants
- Custom: advisors with cash component, larger equity grants (>1%), specific deliverables/milestones

### 5. SAFE (Simple Agreement for Future Equity)

**Qué es**: instrumento de Y Combinator para pre-priced-round investment. Converts a equity en next qualifying financing.

**Post-money SAFE** (default desde 2018) vs. pre-money SAFE:

- **Post-money**: dilution del new investor is predictable (se calcula antes de pool refresh). Founder se diluye más, investor menos. **Standard actual.**
- **Pre-money**: legacy desde SAFE v1 (2013). Dilution del investor depende del pool refresh + otros SAFEs. Founder-friendly pero investors prefieren post-money.

**Terms clave a decidir**:

- **Valuation cap**: máximo valuation at which investor converts (ej. $5M post-money cap = investor gets shares as if company valued at $5M, incluso si Series A closes at $10M)
- **Discount**: % de descuento sobre next round price (ej. 20% discount = investor paga 80% del priced-round share price)
- **MFN (Most Favored Nation)**: cláusula que dice "if you issue a SAFE with better terms later, mine automatically updates to match". Investors la piden; founders deben cap a un número de SAFEs antes de priced round.

**Y Combinator templates** (free, industry-standard): https://www.ycombinator.com/documents

Available variants:
- Cap, no discount
- Discount, no cap
- Cap + discount
- MFN only (no cap, no discount — "I want your best terms")

### 6. Term Sheet (Series Seed NVCA standard)

**Qué es**: non-binding document que summarize los **terms of a priced equity round** (Series Seed / Series A). Precursor al definitive docs (Stock Purchase Agreement, Investor Rights Agreement, Voting Agreement, Right of First Refusal/Co-Sale Agreement).

**NVCA model** (National Venture Capital Association): https://nvca.org/model-legal-documents/

**Sections standard de un term sheet**:

- **Structure**: Series Seed Preferred Stock (o similar)
- **Amount raised**: $X
- **Pre-money valuation**: $Y (implies post-money = Y + X)
- **Price per share**: calculated
- **Liquidation preference**: 1x non-participating (standard) o 2x+ participating (aggressive — pushback)
- **Dividends**: 8% non-cumulative (standard) o cumulative (aggressive)
- **Voting rights**: 1 vote per share
- **Board composition**: X common / Y preferred / Z independent
- **Protective provisions**: list de actions que require preferred approval
- **Drag-along**: forced sale approval threshold
- **Right of first refusal + co-sale**: investors get first right on any founder stock transfer
- **Pro-rata rights**: investors can maintain % in future rounds
- **Information rights**: monthly/quarterly reporting
- **Founder vesting refresh**: if founders haven't vested yet, may get refresh
- **Employee pool**: size + when created (pre- vs post-money, critical for dilution)
- **Confidentiality + no-shop**: founder can't shop the deal for X days (typical 30-45)

---

## Flujo del skill

### Paso 1 — Load context

**FD-1**: "¿Ya tenés `startup-profile.md` o `cap-table.md` generados? Puedo leer esos para autodetectar:
- Entity type (C-Corp / LLC / etc.)
- Founders (nombres, roles, % equity)
- Existing SAFEs (si hay)
- Advisors (si hay)
- Round status (raising / not raising)

Si no, arrancamos desde cero."

### Paso 2 — Seleccionar documentos a generar

**FD-2**: "¿Qué documentos necesitás? (checkbox múltiple)

Core (recomendado para toda venture nueva):
- [ ] Founder Stock Purchase Agreement (o Operating Agreement si LLC)
- [ ] IP Assignment Agreement
- [ ] Vesting Schedule Exhibit

Condicional:
- [ ] Advisor Agreement (FAST) — per advisor
- [ ] SAFE (post-money YC standard) — per SAFE round
- [ ] Term Sheet (Series Seed) — solo si priced round in progress

Checklist para el lawyer (siempre):
- [ ] document-checklist.md con review notes + delivery order"

### Paso 3 — Per document, collect specifics

**FD-3**: Para cada documento seleccionado, preguntar specifics:

**Founder Stock Purchase Agreement**:
- Founder name + role
- Shares granted (ideally from `cap-table.md`)
- Purchase price per share (default $0.00001 par for Delaware C-Corp)
- Grant date
- Vesting terms (default 4yr / 1yr cliff / monthly)
- Acceleration (default double trigger)
- 83(b) filing commitment

**IP Assignment Agreement**:
- Signer name + role
- Effective date
- List of Prior Inventions to exclude (with brief descriptions)
- Engagement type (employee / contractor / advisor / founder)

**Advisor Agreement**:
- Advisor name + domain expertise
- FAST level (Standard / Strategic / Expert) × engagement (Ideation / Start-up / Growth)
- Derived equity % (FAST matrix)
- Vesting (default 2yr monthly, no cliff)
- Term (default 2yr renewable)

**SAFE**:
- Investor name
- Amount ($)
- Type: post-money valuation cap only / discount only / cap + discount / MFN only
- Terms (cap amount, discount %, MFN yes/no)
- Close date
- Choose YC template variant

**Term Sheet**:
- Round size + pre-money valuation
- Lead investor (si conocido)
- Expected close timeline
- Custom terms (non-standard requests from investor side)

### Paso 4 — Generate drafts

**FD-4**: Generate each selected document en `./launchpad/{startup-slug}/founder-documents/`.

Cada doc incluye:
- Clear markers `[TO BE FILLED BY LAWYER]` para custom legal language
- Cross-references a `cap-table.md` (si ya existe)
- Notes de lawyer review topics (ej: "jurisdiction-specific language here", "check state-specific IP assignment rules")

### Paso 5 — document-checklist.md summary

**FD-5**: Generate `document-checklist.md` con:

- All documents generated + purpose of each
- Signing order (typical: Operating Agreement/FSPA first → IP Assignment → Vesting Exhibit → then SAFEs/Advisor Agreements → Term Sheet last when raising)
- Recommended lawyer review topics per doc
- 83(b) deadline tracker (if US C-Corp or LLC capital interest — 30 days!)
- Cap table integration: which docs correspond to which cap table entries
- Red flags checklist for founder self-review antes de lawyer handoff

---

## Output template preview — Founder Stock Purchase Agreement

```markdown
# FOUNDER STOCK PURCHASE AGREEMENT

**THIS IS A PREPARATION DRAFT — NOT LEGAL ADVICE — REQUIRES LAWYER REVIEW**

**Company**: [Legal Name], a Delaware corporation (the "Company")
**Purchaser**: [Founder Name] (the "Purchaser")
**Date**: [YYYY-MM-DD]

---

## 1. PURCHASE AND SALE OF COMMON STOCK

1.1 **Purchase**. Subject to the terms of this Agreement, Purchaser hereby agrees to purchase from the Company, and the Company hereby agrees to sell to Purchaser, [X] shares of Common Stock, $0.00001 par value per share (the "Shares"), at a purchase price of $0.00001 per share, for aggregate consideration of $[X × 0.00001] (the "Purchase Price").

1.2 **Payment**. Purchaser shall pay the Purchase Price by [cash / check / cancellation of existing IP contribution agreement / other].

1.3 **Delivery**. Upon receipt of the Purchase Price, the Company shall issue a stock certificate (or book-entry notation) representing the Shares in Purchaser's name.

---

## 2. VESTING

2.1 **Vesting Schedule**. The Shares shall vest as follows:
- 25% of the Shares shall vest on the one-year anniversary of the Vesting Commencement Date (the "Cliff")
- Thereafter, 1/48th of the Shares shall vest on each monthly anniversary of the Vesting Commencement Date, until the Shares are fully vested on the four-year anniversary of the Vesting Commencement Date

2.2 **Vesting Commencement Date**: [YYYY-MM-DD] (typically founder's employment start date or the date of incorporation, whichever is earlier)

2.3 **Acceleration upon Change of Control + Termination Without Cause (Double Trigger)**: If, within twelve (12) months following a Change of Control (as defined below), Purchaser's employment is terminated without Cause or Purchaser terminates with Good Reason, then 100% of the unvested Shares shall immediately become fully vested.

2.4 **Forfeiture upon Termination**: Unvested Shares shall be forfeited back to the Company upon Purchaser's termination of employment for any reason (subject to Section 2.3 acceleration).

---

## 3. 83(b) ELECTION

3.1 **Purchaser Acknowledgment**: Purchaser understands that under Section 83 of the Internal Revenue Code, Purchaser may elect, within thirty (30) days of the Grant Date, to be taxed currently on the fair market value of the Shares notwithstanding the vesting restrictions.

3.2 **Filing Obligation**: Purchaser shall promptly notify the Company if Purchaser files an 83(b) election and shall deliver a copy of the election to the Company's counsel.

3.3 **Risk of Non-Filing**: Purchaser acknowledges that failing to file an 83(b) election within 30 days is IRREVERSIBLE and may result in substantial additional tax liability as Shares vest at higher valuations.

---

## 4. REPRESENTATIONS AND WARRANTIES

[Standard investment reps + warranties — **LAWYER TO DRAFT**]

---

## 5. RIGHTS OF FIRST REFUSAL AND CO-SALE

[ROFR + co-sale provisions — **LAWYER TO DRAFT**]

---

## 6. DRAG-ALONG

[Drag-along provisions — **LAWYER TO DRAFT**]

---

## 7. CONFIDENTIALITY

[Confidentiality obligations — see separate IP Assignment Agreement — **LAWYER TO DRAFT**]

---

## 8. MISCELLANEOUS

[Governing law (Delaware), arbitration, severability, entire agreement — **LAWYER TO DRAFT**]

---

**SIGNATURES**:

Company: _________________________  Date: _________
By: [Name], [Title]

Purchaser: _______________________  Date: _________
[Founder Name]

---

**⚠️ LAWYER REVIEW CHECKLIST**:

- [ ] Delaware corporate law compliance verified
- [ ] Section 83(b) deadlines communicated to Purchaser in writing (not just email)
- [ ] IP Assignment Agreement executed concurrently
- [ ] Cap table updated to reflect this grant
- [ ] Stock certificate issued or book entry made
- [ ] QSBS (Section 1202) eligibility tracking started (5-year hold period)
- [ ] Compliance with Rule 701 (securities exemption for compensatory issuances)
- [ ] Verify founder not terminating prior employment with enforceable non-compete
```

---

## Integración con otras skills

- **`startup-intake`** y **`cap-table-builder`**: source of truth para founders, entity, equity grants
- **`venture-studio-toolkit:sweat-equity-agreement`**: referencia crítica para 83(b) tratamiento diferenciado por entity type
- **`venture-studio-toolkit:structure-decision`**: si el user no tiene entity decidida, redirige a ese skill primero
- **`feature-to-spike`**: si durante uso se descubre template gap o pattern valioso, generar SPIKE para chimeranext Launchpad productization

## Principios clave

- **Legal drafts, no legal advice** — disclaimer en cada output, no excepciones
- **Sign nothing sin lawyer review** — hasta el template más standard tiene edge cases jurisdictional
- **83(b) 30-day deadline es sagrado** — trackear + recordar agresivamente
- **IP Assignment concurrent con Founder Agreement** — no separar, firmar same day
- **Cap table coherence**: si hay mismatch entre `cap-table.md` y un agreement generado, flag it

## Anti-patterns

- Firmar templates descargados de internet sin lawyer review → VC walks, deals die
- Olvidar IP Assignment → pre-existing IP de founder puede ser disputed later
- Missing 83(b) filing → ordinary income tax at each vesting tranche (huge tax hit at Series A+)
- Advisors sin FAST o similar → undocumented equity promises = future disputes
- SAFEs con MFN provisions que cascadean → one new SAFE con terms mejores triggers amendments across all outstanding
- Term Sheet sin "no-shop" period → lead investor walks

## Recursos (canonical templates)

- **[Y Combinator SAFE templates](https://www.ycombinator.com/documents)** — post-money SAFE v2018+, 4 variants
- **[NVCA Model Legal Documents](https://nvca.org/model-legal-documents/)** — Term Sheet + Stock Purchase Agreement + IRA + ROFR + Voting Agreement
- **[Founder Institute FAST framework](https://fi.co/fast)** — advisor agreement standard
- **[Cooley Go — Formation Package](https://www.cooleygo.com/documents/)** — Founder Stock Purchase Agreement + IP Assignment templates
- **[Clerky](https://www.clerky.com/)** — automated legal document platform (good middle ground between pure DIY y full-service lawyer)
- **[Carta Founder Documents Library](https://carta.com/learn/)** — educational + example docs
- **Venture Deals** (Brad Feld / Jason Mendelson) — must-read book para understanding term sheets
