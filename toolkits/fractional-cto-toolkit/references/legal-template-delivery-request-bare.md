<!--
  Bare outline: formal delivery request (handover legal pack).
  Apprentice reference for expected shape. Fill SSOT:
  legal-template-delivery-request.md. Placeholders use {{DOUBLE_CURLY}}.
  Not Obsidian wikilinks. Counsel must review before use.
-->

# Formal Delivery Request — {{PROJECT_NAME}}

**Date:** {{DATE}}  
**From:** {{LEAD_NAME}} (owner / legal representative of {{PROJECT_NAME}})  
**To:** {{PRIOR_DEVELOPER_NAME}} (prior developer)

---

## Context

<!-- Fill: transfer scope, binding effect of signature. -->

---

## 1. Source code and repository

**Deadline:** {{DEADLINE_CODE}}

- [ ] <!-- Transfer repo to owner org -->
- [ ] <!-- Full history / branches -->
- [ ] <!-- Related repos -->

---

## 2. Third-party accounts and services

**Deadline:** {{DEADLINE_SERVICES}}

- [ ] <!-- Hosting, DB, DNS, auth, email, payments, analytics, … -->

---

## 3. Infrastructure and environments

**Deadline:** {{DEADLINE_INFRA}}

---

## 4. Database

**Deadline:** {{DEADLINE_DB}}

---

## 5. Documentation and knowledge

**Deadline:** {{DEADLINE_DOCS}}

---

## 6. Design and assets

**Deadline:** {{DEADLINE_DESIGN}}

---

{{ADDITIONAL_ITEMS_BLOCK}}

---

## Deadlines table

| Delivery | Deadline |
|---|---|
| Section 1 Code | {{DEADLINE_CODE}} |
| Section 2 Services | {{DEADLINE_SERVICES}} |
| Section 3 Infra | {{DEADLINE_INFRA}} |
| Section 4 Database | {{DEADLINE_DB}} |
| Section 5 Docs | {{DEADLINE_DOCS}} |
| Section 6 Design | {{DEADLINE_DESIGN}} |

---

## Consequences clause

{{LEGAL_CLAUSE_BLOCK}}

<!-- Fill by risk: LOW / MEDIUM / HIGH. Jurisdiction notes for counsel. -->

---

## Coordination contact

- **Name:** {{CTO_NAME}}
- **Email:** {{CTO_EMAIL}}
- **Role:** Designated technical lead for {{LEAD_NAME}}

---

## Signatures

**{{LEAD_NAME}}** — Owner / legal representative

Name: _________________________________  
ID: _________________________________  
Signature: _________________________________  
Date: _________________________________

**{{PRIOR_DEVELOPER_NAME}}** — Prior developer

Name: _________________________________  
ID: _________________________________  
Signature: _________________________________  
Date: _________________________________
