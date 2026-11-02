# Skill `nist-ai-rmf` — protocol SSOT

## Purpose

Manage the risks of AI systems using the NIST AI Risk Management Framework
(AI RMF 1.0). The framework is voluntary but is the de facto reference for
trustworthy AI characteristics (valid & reliable, safe, secure & resilient,
accountable & transparent, explainable & interpretable, privacy-enhanced, and
fair — with harmful bias managed).

Grounded in the CTO-role references (Splunk, Devox; Sushegaad GRC as benchmark
only), complementing `iso42001` and `eu-ai-act`.

## When to use

- A client builds, buys, or operates AI systems and needs a risk process.
- A client must demonstrate AI risk management to customers or regulators.
- A client wants to move from ad-hoc AI concerns to a repeatable framework.

## Method

1. **Govern**: set AI risk management policy, roles, and accountability;
   inventory the AI systems and their intended uses.
2. **Map**: for each AI system, identify the context (use case, users,
   deployment environment) and the risks along the AI lifecycle —
   data, model, application, and societal/impact risks.
3. **Measure**: define metrics and test procedures for the identified risks —
   e.g., evaluation datasets, bias tests, adversarial robustness, drift
   monitoring.
4. **Manage**: choose risk responses (mitigate, transfer, avoid, accept),
   assign owners, implement controls, and monitor continuously.
5. **Document**: keep the AI risk register and evidence current; integrate with
   incident and change processes.
6. **Communicate**: report AI risk in business terms to leadership.

## Artifact

An AI risk dossier: AI inventory, AI risk register with mapped lifecycle risks,
measurement plan, and management actions with owners.

## Contract

- Every in-scope AI system has an entry in the AI inventory and risk register.
- Risk ratings are evidence-based (metrics, tests, logs), not asserted.
- Vendor-neutral and client-neutral.
- Handover: on engagement end, transfer to the Chief Compliance Officer (CCO)
  — AI risk register, open items, and evidence locations.
- Align with `iso42001` management-system work where both apply; avoid duplicating
  controls.
