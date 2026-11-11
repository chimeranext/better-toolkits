---
title: "Risk management plan · {{project_name}}"
date: "{{date}}"
tags: [project, risk, iso-16085]
status: draft
standard: ISO/IEC/IEEE 16085:2021
satisfies: ISO/IEC/IEEE 16326:2019 Clause 7 risk-management plan content
template_id: iso-16085-risk-management-plan
---

# Risk management plan · {{project_name}}

Outline aligned to ISO/IEC/IEEE 16085:2021 §8.1.2 (original prose. Clause citations
only). Empty sections use: `This section is not applicable to this plan` plus a
reason.

> [!note] Customer-facing voice
> Filled body: descriptive / executive prose
> (`shared/references/engineering-standards/customer-facing-management-docs.md`). No bare STE imperatives. Profile / treatment
> wording: “Mitigation: …”, “Ongoing monitoring …”, “Risk accepted …” — not
> “Mitigate.” / “Monitor.” / “Accept.” Table cells: no `[[path|alias]]`.

Process activities behind this plan (§6.4): plan risk management → manage the
risk profile → analyze risks → treat risks → monitor risks → evaluate the risk
management process.

## 1. Introduction

### 1.1 Purpose and scope

{{purpose_scope}}

### 1.2 Assumptions and constraints

{{assumptions_constraints}}

### 1.3 Risk management policies

{{policies}}

### 1.4 Related documents and standards

| Ref | Document |
| --- | --- |
| SPMP | {{spmp_link}} (ISO/IEC/IEEE 16326) |
| 16085 | ISO/IEC/IEEE 16085:2021 |
| 31000 | ISO 31000:2018 (org principles. GRC. Does not replace this plan) |

### 1.5 Glossary

| Term | Meaning |
| --- | --- |
| Risk profile | Current and historical view of project risks and treatments |
| Risk threshold | Exposure level that triggers accept / monitor / treat |

## 2. Risk management overview

### 2.1 Risk management strategy

Document at least:

- Scope of risk management
- Sources of risk
- Risk criteria
- How the team organizes, categorizes, compares, and consolidates risks
- Parameters for action (likelihood, consequence, thresholds)
- Risk measures / rating scales
- Treatment techniques
- How the organization evaluates and improves the risk process

{{strategy}}

### 2.2 Risk management context

Stakeholders, categories (for example technical, security, schedule, budget,
supply chain), and objectives or assumptions that affect risk work.

{{context}}

## 3. Roles and responsibilities

| Role | Risk management responsibilities |
| --- | --- |
| {{role}} | {{responsibility}} |

## 4. Risk management process

### 4.1 Risk identification

{{identification}}

### 4.2 Risk analysis and evaluation

{{analysis_evaluation}}

### 4.3 Risk prioritization

{{prioritization}}

### 4.4 Risk treatment

{{treatment_approach}}

Risks that need treatment get a **risk treatment plan**
(`iso-16085-risk-treatment-plan`). Gate with Eisenhower: critical (urgent and
important) requires a treatment plan in PSA Milestone 1. Only-urgent or
only-important: offer a treatment plan in the same milestone. Neither: document
as acceptable.

### 4.5 Risk monitoring and reporting

{{monitoring_reporting}}

### 4.6 Risk profile

Where the profile lives, which fields it captures, and which thresholds apply.

Profile fields (minimum): description. Likely causes or events. Possible
consequences. Severity. Likelihood. Likelihood of detection. Thresholds.
Current state. Current treatment or contingency. History.

| Id | Description | Category | Likelihood | Consequence | Detection | Threshold | State | Treatment |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| R-01 | | | | | | | | |

Profile location: {{risk_profile_path}}

### 4.7 Risk communication

Who receives what, escalation path, and coordination with interested parties.

{{communication}}

## 5. Resources schedule

Milestones, effort, and cost for risk management activities.

{{resources_schedule}}
