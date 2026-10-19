# Changelog

All notable changes to this toolkit will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2026-10-19

### Added

- **BOI Report** (Beneficial Ownership Information) — FinCEN requirement, within 90 days
- **Registered Agent** — Mandatory in all US states
- **EIN timeline** — With SSN: immediate. Without SSN: ~45 business days
- **State comparison** — Delaware vs Wyoming vs Nevada vs New Mexico vs Florida
- **Virtual address** — For foreigners, digital nomads, freelancers
- **Operating Agreement + Bylaws** — Essential legal documents
- **Tax obligations for non-residents** — Non-resident tax implications
- **Reporting obligations** — Annual reports, franchise tax, federal/state tax returns
- **Resources** — SBA, IRS, USPTO, SEC, BusinessUSA, SelectUSA, FinCEN
- New reference: `us-entity-requirements`

### Changed

- All content rewritten in English (SSOT compliance)
- `entity-formation` expanded with BOI, registered agent, state selection, virtual address
- `fundraising` expanded with cap table, investor matching, demo prep, financial modeling
- Added `cofounder-matching`, `investor-matching`, `advisor-matching` as separate commands

## [1.0.0] - 2026-10-19

### Added

- Initial release of `startup-lifecycle-toolkit`
- 7 commands: bootstrap-to-offshore, entity-formation, fundraising, vesting, b-corp-certification, cayman-sandwich, subsidiary-conversion
- 7 reference protocols
- Complete journey guide: save → form entity → raise capital → scale
- Focus on LATAM founders with no US ecosystem experience
- Sister Entities Model (ChimeraNext) as example
- YC SAFE CLI integration
