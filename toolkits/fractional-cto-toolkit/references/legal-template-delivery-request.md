<!--
  Fill SSOT: formal delivery request (handover legal pack).
  English ASD-STE100. Engagement emit may be Spanish for Costa Rica.
  Placeholders {{DOUBLE_CURLY}}. Counsel must review before use.
-->

# Formal Delivery Request — {{PROJECT_NAME}}

**Date:** {{DATE}}  
**From:** {{LEAD_NAME}} (owner / legal representative of {{PROJECT_NAME}})  
**To:** {{PRIOR_DEVELOPER_NAME}} (prior developer)

---

## Context

As part of a restructuring of technical management for {{PROJECT_NAME}}, the
parties formalize full project transfer. This document lists deliverables,
deadlines, and consequences of non-compliance.

By signing, the parties agree this document is a formal delivery commitment
within the deadlines stated here.

---

## 1. Source code and repository

**Deadline:** {{DEADLINE_CODE}}

- [ ] Transfer the repository to the owner org or account named by the owner
- [ ] Confirm the repository holds ALL project source (no truncated history,
      deleted branches, or reverted commits that hide work)
- [ ] Include any extra repositories (microservices, deploy scripts, tools)
- [ ] Full access to commit history and branches

---

## 2. Third-party accounts and services

**Deadline:** {{DEADLINE_SERVICES}}

Transfer ownership or admin credentials for each external service:

- [ ] **Hosting / production server** — provider: __________ | transfer ownership
- [ ] **Database** — provider and type: __________ | transfer admin access
- [ ] **Domain(s)** — registrar: __________ | transfer domain
- [ ] **Authentication** — service: __________ | transfer tenant ownership
- [ ] **Transactional email** — service: __________ | transfer account
- [ ] **Payments** — service: __________ | transfer account
- [ ] **Analytics** — service: __________ | transfer access
- [ ] **Error monitoring** — service: __________ | transfer access
- [ ] **File storage** — service: __________ | transfer access
- [ ] **CDN / SSL** — service: __________ | transfer access
- [ ] **Other services:** __________

For each service provide: name, dashboard URL, account email, and ownership
transfer to the account we name.

---

## 3. Infrastructure and environments

**Deadline:** {{DEADLINE_INFRA}}

- [ ] List of environments (dev, staging, production) with URLs
- [ ] Environment variables — full list per environment with a short description
- [ ] CI/CD — access to pipeline config and secrets
- [ ] Infrastructure as code (Terraform, Docker, deploy scripts) — confirm it is
      in the repository

---

## 4. Database

**Deadline:** {{DEADLINE_DB}}

- [ ] Admin access to the production database
- [ ] Current schema (schema dump if migrations are not in the repo)
- [ ] Backup procedure — where backups live and how to restore them
- [ ] Seed data / test data scripts (if any)

---

## 5. Documentation and knowledge

**Deadline:** {{DEADLINE_DOCS}}

- [ ] All existing docs: specs, diagrams, technical notes, architecture decisions,
      user flows
- [ ] Documented credentials (password manager, shared docs)
- [ ] Backlog / roadmap / known bugs
- [ ] 15–30 min walkthrough video of main features and deploy (or live session)

---

## 6. Design and assets

**Deadline:** {{DEADLINE_DESIGN}}

- [ ] Design files (Figma, Sketch, etc.) — transfer ownership
- [ ] Graphic assets: logo, icons, illustrations — note licenses
- [ ] Brand guide (if any)

---

{{ADDITIONAL_ITEMS_BLOCK}}

<!-- Skill adds items by project type:
- Mobile: Apple Developer, Google Play, signing keys, keystore, iOS certs,
  TestFlight, bundle IDs
- SaaS: billing accounts, webhooks, third-party integrations
-->

---

## Deadlines table

| Delivery | Deadline |
|---|---|
| Section 1 Source code | {{DEADLINE_CODE}} |
| Section 2 Accounts and services | {{DEADLINE_SERVICES}} |
| Section 3 Infrastructure | {{DEADLINE_INFRA}} |
| Section 4 Database | {{DEADLINE_DB}} |
| Section 5 Documentation | {{DEADLINE_DOCS}} |
| Section 6 Design and assets | {{DEADLINE_DESIGN}} |

Deadlines count from the signature date of this document.

---

## Consequences clause

{{LEGAL_CLAUSE_BLOCK}}

<!-- Skill fills by risk:

### LOW:
Failure to meet these deadlines may lead to legal actions the owner finds
appropriate to protect their rights.

### MEDIUM:
Failure to meet these deadlines is undue retention of intellectual property.
The owner may start legal actions under applicable IP law, including damages
from service interruption and any loss of data or function.

### HIGH:
The parties recognize that {{PROJECT_NAME}} and all its source code, database,
configuration, and digital assets are property of {{LEAD_NAME}}, built under a
services contract.

Unauthorized retention, destruction, or manipulation of these assets after
signature of this document may constitute:

1. **Undue retention of intellectual property** — civil claim for damages,
   including lost profits from interruption of service to live users.

2. **Computer crime** — destruction, alteration, or disablement of third-party
   data or systems under applicable criminal law.
   [Costa Rica note: Criminal Code arts. 196 bis, 217 bis, 229 bis, Law 9048.]

3. **Complaint to competent authority** — if data is destroyed or sabotaged,
   the owner will file with the cybercrime investigation unit.
   [Costa Rica note: OIJ Unidad de Delitos Informaticos.]

Payment evidence for project development will support the owner's property claim.

The owner may seek precautionary measures to preserve digital assets while any
dispute is resolved.
-->

---

## Coordination contact

- **Name:** {{CTO_NAME}}
- **Email:** {{CTO_EMAIL}}
- **Role:** Designated technical lead for {{LEAD_NAME}}

Route all delivery coordination to this contact.

---

## Signatures

By signing, both parties agree to the terms, deadlines, and conditions here.

&nbsp;

**{{LEAD_NAME}}** — Owner / legal representative

Full name: _________________________________

ID: _________________________________

Signature: _________________________________

Date: _________________________________

&nbsp;

**{{PRIOR_DEVELOPER_NAME}}** — Prior developer

Full name: _________________________________

ID: _________________________________

Signature: _________________________________

Date: _________________________________

---

*This document is a formal agreement between the parties. Each party receives a
signed copy.*

<!-- NOTE FOR CTO: Auto-generated draft. Counsel must review before use,
especially the consequences clause. Legal cites are orientation only. Confirm
them against the applicable jurisdiction. -->
