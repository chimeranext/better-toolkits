---
title: "{{title}}"
aliases: []
date: "{{date}}"
tags: [project, plan, spmp]
status: draft
standard: ISO/IEC/IEEE 16326:2019
risk_companion: ISO/IEC/IEEE 16085:2021
template_id: iso-16326-spmp
---

# Software Project Management Plan · {{project_name}}

> [!warning] Draft
> Complete identification, signatures, and open issues before approval.

## Cover

| Field | Value |
| --- | --- |
| Identifier | {{spmp_id}} |
| Version | {{version}} |
| Issue date | {{date}} |
| Status | Draft |
| Project | {{project_name}} |
| Issuer | {{issuer}} |
| Customer | {{customer}} |
| Customer representative | {{customer_rep}} |
| Standard | ISO/IEC/IEEE 16326:2019 |
| Risk companion | ISO/IEC/IEEE 16085:2021 |

This plan follows the ISO/IEC/IEEE 16326:2019 project management plan content.
If a required section has no plan, write `N/A` and the reason.

## Change history

| Version | Date | Change | Reason |
| --- | --- | --- | --- |
| 0.1 | {{date}} | First draft | Plan start |

## Approval record

| Role | Name | Signature | Date |
| --- | --- | --- | --- |
| Plan author | | | |
| Customer representative | | | |

## 1. Project overview

### 1.1 Summary

{{summary}}

### 1.2 Purpose, scope, and objectives

{{purpose_scope_objectives}}

## 2. References

| Ref | Document |
| --- | --- |
| R1 | ISO/IEC/IEEE 16326:2019 |
| R2 | ISO/IEC/IEEE 16085:2021 (project risk management) |
| R3 | {{prd_or_spec_link}} |

## 3. Definitions

| Term | Definition |
| --- | --- |
| SPMP | Software / Systems Project Management Plan |
| Baseline | Approved scope for this plan version |

## 4. Project context

### 4.1 Process model

{{process_model}}

### 4.2 Constraints

{{constraints}}

### 4.3 Assumptions

{{assumptions}}

### 4.4 Methods, tools, and techniques

{{methods_tools}}

### 4.5 Product acceptance

{{acceptance}}

### 4.6 Organization and interfaces

{{org_interfaces}}

> Do not copy the customer org chart as vault folder law. Put interfaces here as
> data. Choose brain topology in `/business-brain-setup` (Reverse Conway).

## 5. Project planning

### 5.1 Estimates

{{estimates}}

### 5.2 Staffing

{{staffing}}

### 5.3 Activities (WBS)

{{wbs}}

### 5.4 Schedule and milestones

{{schedule}}

### 5.5 Budget and resources

{{budget_resources}}

## 6. Evaluation and control

### 6.1 Monitoring

{{monitoring}}

### 6.2 Control thresholds

{{control_thresholds}}

### 6.3 Reporting

{{reporting}}

### 6.4 Corrective action / change orders

{{corrective_action}}

## 7. Product delivery

{{product_delivery}}

## 8. Supporting processes

### 8.1 Quality assurance

{{qa}}

### 8.2 Verification and test

{{vv_test}}

### 8.3 Risk management

Default companion: **ISO/IEC/IEEE 16085:2021** — see
`iso-16085-risk-management-plan.md` (inline or linked document). Emit with
`/software-risks-authoring-16085`.

{{risk_management_summary_or_link}}

Risk profile summary:

| Id | Category | Risk | Likelihood | Consequence | Treatment |
| --- | --- | --- | --- | --- | --- |
| R-01 | | | | | |

### 8.4 Configuration management

{{configuration_management}}

### 8.5 Information management

{{information_management}}

### 8.6 Communication

{{communication}}

## 9. Additional plans

This section is not applicable to this plan — {{additional_plans_na_reason}}

## Annex A. Open issues

| Id | Issue | Owner | State |
| --- | --- | --- | --- |
| A-01 | | | open |
