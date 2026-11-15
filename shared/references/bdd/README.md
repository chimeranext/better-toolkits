# BDD assertion lint (Given / When / Then)

Mechanical gate for **natural-language scenarios** used in verification tables,
dogfood reports, and OpenSpec-derived specs. Complements EARS (requirement
syntax) — it does not replace it.

## Order with other gates

1. **EARS** — requirement / behavioral AC lines (`../ears/`)
2. **BDD** — scenario assertions (`scripts/bdd-lint.py`) when the file contains
   Given/When/Then (or Dado/Cuando/Entonces) blocks
3. **Controlled prose** — ASD-STE100 (EN) / ESP-TS (ES) on the full file

## Usage

```bash
python3 shared/references/bdd/scripts/bdd-lint.py --selftest
python3 shared/references/bdd/scripts/bdd-lint.py --markdown verification.md
python3 shared/references/bdd/scripts/bdd-lint.py --scenario $'Given …\nWhen …\nThen …'
```

Recognizes fenced ` ```bdd ` / ` ```gherkin ` blocks and loose Scenario /
Escenario sections.

## Related

- Matcher translation to code asserts: `../conventions/matcher-contract.md`
- Test Assertion Standards (TAS): `../engineering-standards/test-assertion-standards.md`
- Dogfood BDD format: make-no-mistakes `references/dogfood/protocol.md`
