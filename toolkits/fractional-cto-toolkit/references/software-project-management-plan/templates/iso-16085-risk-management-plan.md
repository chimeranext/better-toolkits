---
title: "Plan de gestión de riesgos · {{project_name}}"
date: "{{date}}"
tags: [project, risk, iso-16085]
status: borrador
standard: ISO/IEC/IEEE 16085:2021
satisfies: ISO/IEC/IEEE 16326:2019 Clause 7 risk-management plan content
template_id: iso-16085-risk-management-plan
ssot: fractional-cto-toolkit/references/software-project-management-plan
---

# Plan de gestión de riesgos · {{project_name}}

Outline aligned to ISO/IEC/IEEE 16085:2021 §8.1.2 (original prose; clause citations
only). Empty sections use: `This section is not applicable to this plan` + reason
(or Spanish equivalent).

Process activities behind this plan: §6.4 — plan risk management → manage the
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
| 31000 | ISO 31000:2018 (org principles; GRC — does not replace this plan) |

### 1.5 Glossary

| Term | Meaning |
| --- | --- |
| Risk profile | Current + historical view of project risks and treatments |
| Risk threshold | Exposure level that triggers accept / monitor / treat |

## 2. Risk management overview

### 2.1 Risk management strategy

Document at least:

- Scope of risk management
- Sources of risk
- Risk criteria
- How risks are organized, categorized, compared, consolidated
- Parameters for action (likelihood, consequence, thresholds)
- Risk measures / rating scales
- Treatment techniques
- How the organization evaluates and improves the risk process

{{strategy}}

### 2.2 Risk management context

Stakeholders, categories (e.g. technical, security, schedule, budget, supply
chain), objectives/assumptions/constraints that affect risk work.

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

Unacceptable risks get a **risk treatment plan** (`iso-16085-risk-treatment-plan`).

### 4.5 Risk monitoring and reporting

{{monitoring_reporting}}

### 4.6 Risk profile

Where the profile lives, what fields it captures, and thresholds/conditions.

Profile fields (minimum): description; likely causes/events; possible
consequences; severity; likelihood; likelihood of detection; thresholds;
current state; current treatment/contingency; history.

| Id | Description | Category | Likelihood | Consequence | Threshold | State | Treatment |
| --- | --- | --- | --- | --- | --- | --- | --- |
| R-01 | | | | | | | |

Profile location: {{risk_profile_path}}

### 4.7 Risk communication

Who receives what, escalation path, coordination with interested parties.

{{communication}}

## 5. Resources schedule

Milestones, effort, and cost for risk management activities.

{{resources_schedule}}
