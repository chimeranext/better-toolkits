# ASD-STE100 — structural English controlled language

Mechanical gate and lexical SSOT for **English** controlled prose (customer-facing
and agent procedures). Lives in `shared` next to
[`../esp-ts/`](../esp-ts/) (Spanish ESP-TS).

## Pairing with ESP-TS

| Audience file language | Linter | Lexical SSOT |
| --- | --- | --- |
| English | `scripts/asd-ste100-lint.py` | [`vocabulary.yml`](vocabulary.yml) (`synonym_groups`) |
| Spanish | [`../esp-ts/scripts/esp-ts-lint.py`](../esp-ts/scripts/esp-ts-lint.py) | [`../esp-ts/vocabulary.yml`](../esp-ts/vocabulary.yml) |

CFM voice (descriptive / executive, no bare imperatives):
[`../engineering-standards/customer-facing-management-docs.md`](../engineering-standards/customer-facing-management-docs.md).

`vocabulary.yml` is **not** the ASD-STE100 ~900-word dictionary (not redistributed).
It only holds synonym-rotation groups the linter can check mechanically.

## Mechanical gate

```bash
python3 shared/references/asd-ste100/scripts/asd-ste100-lint.py FILE.md
python3 shared/references/asd-ste100/scripts/asd-ste100-lint.py --json FILE.md
python3 shared/references/asd-ste100/scripts/asd-ste100-lint.py --selftest
```

### CvC / PRDS prose gate

Commit subjects/bodies and PR description prose stay **English** and use the
same linter via a thin wrapper (strips `type(scope):` for commits):

```bash
python3 shared/references/asd-ste100/scripts/prose_gate.py commit-msg .git/COMMIT_EDITMSG
python3 shared/references/asd-ste100/scripts/prose_gate.py markdown pr-body.md
python3 shared/references/asd-ste100/scripts/prose_gate.py --selftest
```

Wired into: pre-commit `asd-ste100-commit-prose` (CvC) and
`shared/hooks/prds/detect.py` (PRDS).

## Related

- Explain skill writing summary (still under make-no-mistakes):
  `toolkits/make-no-mistakes-toolkit/references/explain/references/writing-rules.md`
- [`ASD-STE100-ATTRIBUTION.txt`](ASD-STE100-ATTRIBUTION.txt)
