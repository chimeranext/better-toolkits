# Skill `takeover-assessment` — protocol SSOT

English ASD-STE100 SSOT. Run
`make-no-mistakes-toolkit/references/explain/scripts/ste-lint.py` on this file
before merge. Engagement chat for Costa Rica may use Spanish. Keep this protocol
in English.

---

# Takeover assessment — risk evaluation

Assess the risk of taking over an existing software project. Run a structured
interview. Compute the risk level. Emit an interactive SPA wizard. Emit the
assessment contract ready to sign.

## Language rules

- This protocol stays English STE100.
- Generated SPA seed and contract body default to Spanish for Costa Rica
  engagements. Keep common technical terms in English (deploy, commit, CI/CD,
  backdoor).

## Output directory

Write under `./fractional-cto/assessment/{slug}/` in the current working
directory. `{slug}` is the project name in kebab-case.

## Skill flow

### Step 1 — Gather context (interview)

Ask the following questions **one at a time**. Prefer fixed options. If the human
already gave a fact, extract it. Do not ask again.

**Question 1: Project identity**

> What is the project name, what does it do (one sentence), and what is the
> client legal name? (Legal name is required for contract docs.)

**Question 2: Industry / vertical**

> Which industry does the project serve?
> - a) Fintech
> - b) Legaltech
> - c) Healthtech
> - d) Edtech
> - e) Proptech / Real Estate
> - f) Insurtech
> - g) Agritech
> - h) Govtech
> - i) Logistics / Supply Chain
> - j) Retail / E-commerce
> - k) Foodtech / Restaurants
> - l) HRtech / Recruiting
> - m) Martech / Adtech
> - n) Traveltech / Tourism
> - o) Cleantech / Energy
> - p) Mobility / Transport
> - q) Social Impact / NGO
> - r) Entertainment / Media
> - s) Cybersecurity
> - t) SaaS B2B (other)
> - u) Consumer / B2C (other)
> - v) Other (describe)

**Question 3: Technical type**

> What kind of project is it, and where does it run?
> - Type: Web app / Mobile app / API-Backend only / Monorepo-Multi service / Other
> - Cloud: AWS / GCP / Azure / DigitalOcean / Vercel-Netlify / On-premise / Unknown

**Question 4: Venture stage**

> Which stage is the project in?
> - a) Ideation (concept only)
> - b) Validation (prototypes, interviews)
> - c) MVP (minimum product running)
> - d) Traction (real users, metrics)
> - e) Growth (revenue, team)
> - f) Scale (expansion, Series A+)
>
> Technology readiness (TRL)?
> - 1-3: Concept / proof of concept
> - 4-6: Validation in a real environment
> - 7-9: Production / optimization

**Question 5: Relationship with the prior developer**

> How is the relationship with the prior developer?
> - a) Cooperative — willing to help with the transition
> - b) Neutral — answers but is not proactive
> - c) Contentious — does not cooperate. Sabotage risk is open
> - d) No contact — the developer is gone
>
> Where is the code now?
> - a) On a client org/account (client is owner)
> - b) On the prior developer personal account
> - c) Unknown / no access yet

**Question 6: Legal and operational state**

> Answer what you know:
> - Is there an IP assignment contract between client and prior developer?
>   - Yes / Ambiguous / No / Unknown
> - Are there live users in production?
>   - Yes / No / Unknown
> - Is there documentation? (README, diagrams, specs)
>   - Fairly complete / Some but incomplete / Almost none / Unknown
> - Does the project handle sensitive data?
>   - Yes / No / Unknown
>
> *Note: for Fintech, Healthtech, Legaltech, Insurtech, or Govtech, assume
> sensitive data = Yes unless the human says otherwise.*

**Question 7: Specific threats** *(only if relationship is contentious or no contact)*

> Which of these worry you? (multi-select OK)
> - a) They delete the code or data
> - b) They refuse to deliver and demand more money
> - c) They copy the code to sell or reuse elsewhere
> - d) They left traps in the code (backdoors, time bombs)
> - e) They access user data after the transfer
> - f) None in particular

### Step 2 — Compute risk level

Use the **worst** relationship × ownership pair:

| Condition | Base risk |
|---|---|
| Contentious OR no contact + code on developer account | **HIGH** |
| Contentious OR no contact + code on client account | **MEDIUM-HIGH** |
| Neutral + code on developer account | **MEDIUM** |
| Cooperative + code on developer account | **MEDIUM-LOW** |
| Cooperative + code on client account | **LOW** |

**Modifiers that raise risk one level:**

- Live users in production (continuity urgency)
- Sensitive data (legal, financial, medical) — auto from industry when applicable
- Two or more Question 7 threats at high probability

State the level to the human with a short reason. Include active modifiers.

### Step 3 — Emit the assessment SPA

1. Copy the seven SPA files from `${CLAUDE_PLUGIN_ROOT}/assets/templates/assessment/`
   into `./fractional-cto/assessment/{slug}/`:
   - `assessment.html`
   - `app.js`
   - `state.js`
   - `risk-engine.js`
   - `documents.js`
   - `utils.js`
   - `styles.css`

2. In the copied `assessment.html`, inject a `<script>` block **before**
   `<script type="module" src="app.js">` that seeds state from Step 1. The block
   must:
   - Create `window.__ASSESSMENT_SEED__` with all interview answers
   - Include the Step 2 risk level
   - Include project name, legal name, industry, technical type, stage, TRL
   - Include relationship, ownership, selected threats
   - Example shape:
     ```html
     <script>
     window.__ASSESSMENT_SEED__ = {
       projectName: "Project name",
       legalName: "Legal Name Inc.",
       industry: "fintech",
       projectType: "webapp",
       cloudProvider: "aws",
       stage: "traction",
       trl: 6,
       devRelationship: "contentious",
       codeOwnership: "dev",
       ipContract: "ambiguous",
       activeUsers: true,
       documentation: "incomplete",
       sensitiveData: true,
       threats: ["delete-code", "backdoors"],
       riskLevel: "HIGH",
       riskJustification: "Contentious relationship + code on developer account + live users"
     };
     </script>
     ```

3. Tell the human: "Open this file in Chrome for the interactive wizard:
   `{full path to assessment.html}`"

### Step 4 — Emit the assessment contract

1. Read `${CLAUDE_PLUGIN_ROOT}/references/contracts/02-takeover-assessment.md`

2. Fill placeholders with gathered data:
   - `{NOMBRE_PROYECTO}` — project name
   - `{CLIENTE_NOMBRE}` — client legal name (Question 1)
   - Other client fields: leave for the CTO to complete
   - Adjust scope (Section 3) by project type and risk
   - **Suggested fee** by risk:
     - **HIGH:** $1500 - $2000 USD
     - **MEDIUM-HIGH:** $1200 - $1500 USD
     - **MEDIUM:** $800 - $1200 USD
     - **MEDIUM-LOW:** $500 - $800 USD
     - **LOW:** $500 - $800 USD
   - **Suggested timeline** by risk:
     - **HIGH:** 1-2 business days
     - **MEDIUM-HIGH:** 2-3 business days
     - **MEDIUM:** 2-3 business days
     - **MEDIUM-LOW:** 3-5 business days
     - **LOW:** 3-5 business days
   - The CTO operates as a **natural person** (independent contractor). Never put
     a company name in the Professional field.

3. Write `./fractional-cto/contracts/{slug}-assessment-contract.md`

### Step 5 — Confirmation

Present:

1. **Risk level** + justification (factors that set the level)
2. **SPA path:** "Open in Chrome: `{path}`"
3. **Contract path:** "Sign before the assessment starts: `{path}`"
4. **Recommended next step:** "After the client signs and pays, run
   `/project-takeover` for the full handover pack (playbook, client guide, legal
   templates)."

## Notes for the model

- This skill does **not** emit the handover pack. That is `/project-takeover`.
- This skill does **not** emit PSA or retainer contracts. Use `/contract-psa` and
  `/contract-retainer`.
- If the human already stated facts, reuse them. Confirm: "You already said X —
  does this match?"
- The SPA is seven static files. It needs no server.
- Fee and timeline are suggestions. Respect the CTO if they adjust.
- Leave CTO personal fields (ID, email, phone) as placeholders. Fill only project
  and client facts from the interview.
