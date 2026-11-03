# Skill `eu-ai-act` — protocol SSOT

## Purpose

Prepare a client for the EU Artificial Intelligence Act (Regulation (EU)
2024/1689). The Act regulates providers, deployers (users), importers, and
distributors of AI systems placed on the EU market or used in the EU, with
staged application (prohibited AI practices from February 2025; general-purpose
AI obligations from August 2025; high-risk obligations from August 2026, with
longer transition for some high-risk systems).

Grounded in the CTO-role references (Splunk, Devox; Sushegaad GRC as benchmark
only), complementing `iso42001` and `nist-ai-rmf`.

## When to use

- A client develops, deploys, or resells AI systems in the EU.
- A client must determine whether its AI is high-risk and plan conformity.
- A client operates a general-purpose AI model (GPAI) in scope.

## Method

1. **Classify the AI system** by risk tier:
   - **Prohibited** (Art. 5): manipulative, exploitative, social-scoring,
     real-time remote biometric identification in public spaces (subject to
     exceptions), predictive policing of individuals, scraping facial images,
     emotion inference in workplace/education (with exceptions) — these are
     banned.
   - **High-risk** (Annex I/III): AI as a safety component of regulated
     products; or AI in listed areas — biometrics, critical infrastructure,
     education, employment, essential services (credit, emergency),
     law enforcement, migration/border, justice/democratic processes — with
     the materiality carve-outs.
   - **Limited risk**: transparency obligations (chatbots, deepfakes).
   - **Minimal risk**: no specific obligations.
2. **For high-risk systems, build conformity**: risk management system (Art.
   9), data governance (Art. 10), technical documentation (Art. 11), logging
   (Art. 12), transparency (Art. 13), human oversight (Art. 14), accuracy/
   robustness/cybersecurity (Art. 15), and the quality management system.
   Register in the EU database (Annex VIII) and affix the CE mark (self-
   assessment for most Annex III systems; notified-body involvement for Annex
   I product components where required).
3. **For GPAI models**: meet transparency duties for providers (Art. 50–52)
   — technical documentation, copyright policy, training-data summary — and,
   for systemic-risk models, perform model evaluations, adversarial testing,
   and incident reporting (with the AI Office).
4. **Deployer duties**: applicable to high-risk deployers (non-providers):
   technical and organizational measures, monitoring, and informing
   providers of incidents.
5. **Governance alignment**: map the Act to the ISO 42001 AIMS (see
   `iso42001`) and the NIST AI RMF to avoid duplicated work.
6. **Monitor the timeline** of the staged application and the implementing
   and delegated acts as they are adopted.

## Artifact

An EU AI Act pack: risk-tier classification per system, high-risk conformity
roadmap, technical-documentation index, GPAI obligations check, and a
timeline.

## Contract

- Classification is documented for every in-scope AI system, with rationale
   for high-risk/prohibited determinations.
- Conformity claims are backed by evidence (risk file, documentation, logs).
- Vendor-neutral and client-neutral.
- Handover: on engagement end, transfer to the Chief Compliance Officer (CCO)
  — classifications, conformity status, open items.
- Verify against the published text and the evolving implementing rules;
  classify conservatively where the definitions are ambiguous.
