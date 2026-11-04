# Reading an RFP / pliego (B2G)

An RFP/pliego is the tender document that defines requirements. Reading it well
determines whether you can bid at all, and whether you can win.

## Requirement categories (used by `rfp_analyzer.py`)

| Category | Examples | Gate type |
| --- | --- | --- |
| Habilitante | elegibilidad, obligatorio, requisitos mínimos | pass/fail |
| Documental | certificados, constancias, escritura, registro | submission |
| Técnico | especificaciones, normas, perfiles | qualification |
| Financiero | fianzas, garantías, estados financieros, capital | bonding |
| Compliance | firma digital, licencias, permisos | legal |

## Workflow

1. Run `rfp_analyzer.py --rfp pliego.md` → categorized requirements.
2. Feed output into `revenue-ops-triage` to build agent-ready work items.
3. Use `pricing-strategist` for the offer/PPA strategy.
