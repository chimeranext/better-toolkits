# Skill `nist-csf` — protocol SSOT

## Purpose

Use the NIST Cybersecurity Framework 2.0 to organize, communicate, and
prioritize cybersecurity risk across the organization. The CSF is a common
language — its value is the profile and gap analysis, not a control checklist.
This protocol covers the six CSF 2.0 functions, the mapping to NIST SP 800-53,
and the D3FEND complement for the actionable defensive side.

Grounded in the CTO-role references (Splunk, Devox; Sushegaad GRC as benchmark
only).

## When to use

- A client needs to communicate cyber risk to executives, customers, or
  insurers.
- A client needs a prioritized cyber improvement roadmap.
- A client needs to organize existing controls under a recognized framework.
- A client wants to map CSF outcomes to NIST SP 800-53 controls and to
  concrete defensive countermeasures (D3FEND).

## Model: CSF 2.0

CSF 2.0 (2024) is organized around six functions, each with categories and
subcategories:

| Function | Purpose | Example categories |
| --- | --- | --- |
| **Govern (GV)** | Establish and monitor cybersecurity governance, roles, policies | GV.OC organizational context, GV.RM risk management strategy, GV.PO policy, GV.RR roles/responsibilities, GV.OV oversight |
| **Identify (ID)** | Know assets, risks, and the environment | ID.AM asset management, ID.RA risk assessment, ID.IM improvement, ID.SC supply chain |
| **Protect (PR)** | Safeguard assets and capability | PR.AA identity management/access control, PR.AT awareness/training, PR.DS data security, PR.PS platform security, PR.IR technology infrastructure resilience |
| **Detect (DE)** | Find cybersecurity events | DE.CM continuous monitoring, DE.AE adverse event analysis |
| **Respond (RS)** | Act on detected events | RS.MA incident management, RS.CO communication, RS.AN analysis, RS.MI mitigation, RS.IM improvement |
| **Recover (RC)** | Restore capabilities | RC.RP recovery plan execution, RC.CO communication, RC.IM improvement |

Use **profiles** (Current vs. Target) and **tiers** (Partial, Risk Informed,
Repeatable, Adaptive) to record posture and ambition. The core value is the
gap analysis between Current and Target profiles.

## Mappings

- **CSF → NIST SP 800-53**: CSF subcategories carry informative references to
  SP 800-53 Rev 5 controls. For each subcategory, the relevant 800-53 control
  set (AC, AU, CA, CM, CP, IA, IR, RA, SA, SC, SI, etc.) provides the
  concrete control-level implementation. Use this mapping to satisfy both
  frameworks with one evidence set.
- **CSF → D3FEND**: D3FEND supplies the actionable defensive countermeasures
  (Detect, Harden, Isolate, Deceive, Evict) for the techniques that threaten
  CSF-protected assets. Use it to move from outcome statements (e.g.,
  DE.CM continuous monitoring) to concrete defense mechanisms (e.g., process
  monitoring, network isolation, decoy objects).
- **CSF → other control sets**: align with ISO 27001, CIS Controls, and the
  rest of the GRC portfolio to avoid duplicate work.

## Method

1. **Frame the context**: objectives, assets, and threat environment for the
   organization.
2. **Build the Current Profile**: assess implementation across the six
   functions using categories and subcategories (e.g., GV.OC, ID.AM, PR.AA,
   DE.CM, RS.MA, RC.RP). Each rating cites evidence.
3. **Define the Target Profile**: decide the desired risk posture with the
   business; choose tiers.
4. **Gap analysis**: compare current vs. target; identify prioritized gaps and
   the organizational roles that own each.
5. **Map to 800-53**: translate each gap into the specific 800-53 controls
   that close it; reuse existing control evidence.
6. **Complement with D3FEND**: for the threat-driven gaps, select D3FEND
   countermeasures as the actionable defensive implementation.
7. **Action plan**: sequence initiatives (quick wins first), tie each to a CSF
   subcategory and to concrete controls/countermeasures, set measures.
8. **Communicate**: produce a management-friendly narrative, heatmap, and
   profile tables.
9. **Refresh**: revisit profiles annually or on significant change.

## Artifact

A CSF engagement pack: current profile, target profile, gap table, 800-53
mapping table, D3FEND countermeasure complement, and a prioritized action plan
with owners and measures.

## Contract

- Profiles are based on evidence, not opinion; each rating cites sources.
- Every action traces to a CSF function and subcategory, and to at least one
  concrete control/countermeasure.
- Vendor-neutral and client-neutral.
- Handover: on engagement end, transfer to the Chief Compliance Officer (CCO)
  — profiles, gaps, open items, mapping tables.
- Align with the rest of the control set (ISO 27001, NIST 800-53) to avoid
  duplicate work.