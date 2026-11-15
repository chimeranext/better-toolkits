# ESP-TS — Español Técnico Simplificado

Controlled Spanish for **customer-facing** documentation when the engagement
language is Spanish. Named **ESP-TS** here to avoid clashing with the Spanish
demonstrative “este”. Source materials:
[`esadrian/este-skill`](https://github.com/esadrian/este-skill).

## Pairing with ASD-STE100

| Audience file language | Linter | Voice |
| --- | --- | --- |
| English customer-facing (CFM) | `asd-ste100-lint.py` (ASD-STE100 structural) | Descriptive / executive — **no** procedure imperatives |
| Spanish customer-facing (CFM) | `esp-ts-lint.py` (this directory) | Descriptive / executive — **no** procedure imperatives |
| Agent runbooks / skill procedures (any language) | STE / ESP-TS as appropriate for that procedure | Imperative STE is allowed |

CFM SSOT: [`../engineering-standards/customer-facing-management-docs.md`](../engineering-standards/customer-facing-management-docs.md).

## Lexical SSOT

[`vocabulary.yml`](vocabulary.yml) — preferred / avoid terms and bad phrases.
The linter loads it at runtime. Do not hand-edit synonym policy in the script.
English STE does the same with
`shared/references/asd-ste100/vocabulary.yml`
(`synonym_groups` for `asd-ste100-lint.py`).

## Mechanical gate

```bash
python3 shared/references/esp-ts/scripts/esp-ts-lint.py FILE.md
python3 shared/references/esp-ts/scripts/esp-ts-lint.py --json FILE.md
python3 shared/references/esp-ts/scripts/esp-ts-lint.py --selftest
```

Exit 1 when hard (`advisory-free`) violations exceed `--baseline` (default 0).
Advisory findings never fail the run.

For English CFM files use the ASD-STE100 linter instead:

```bash
python3 shared/references/asd-ste100/scripts/asd-ste100-lint.py FILE.md
```

## Related

- [`principles.md`](principles.md) — design posture
- [`rules.md`](rules.md) — nuclear rule IDs (ESTE-001 …)
- [`ESP-TS-ATTRIBUTION.txt`](ESP-TS-ATTRIBUTION.txt) — upstream MIT credit
