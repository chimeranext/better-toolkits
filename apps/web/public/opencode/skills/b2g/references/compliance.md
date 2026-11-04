# Compliance for B2G (per country)

Selling to government carries country-specific legal/technical compliance. This is
a reference start; verify against the current platform/regulation.

## Common requirements

- **Fianza / garantía de participación y cumplimiento** (bid + performance bonds).
- **Firma digital / electrónica** — varies by country (e.g. Costa Rica uses
  firma digital under Firma Digital CR; México uses e.firma).
- **Inscripción / registro de proveedor** on the procurement platform.
- **Licencias / permisos** sectoriales (sanitarios, ambientales, etc.).

## In the toolkit

`rfp_analyzer.py` classifies compliance items; the agent verifies current
requirements per country/platform before bidding.
