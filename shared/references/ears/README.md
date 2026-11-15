# EARS — Easy Approach to Requirements Syntax

Shared mechanical gate for **requirement statements** (SRS functional lines,
bilingual issue Acceptance Criteria that express system behavior). Lives next
to [`../asd-ste100/`](../asd-ste100/) and [`../esp-ts/`](../esp-ts/).

## Pipeline order

For generated requirements / behavioral AC:

1. **EARS** — `scripts/ears-lint.py` (structure: When/While/If/… + shall/debe)
2. **Controlled prose** — English → ASD-STE100; Spanish → ESP-TS (full file voice)

Do not run STE/ESP-TS *instead of* EARS on requirement lines. Do not cross
languages on EARS templates (EN `shall` patterns vs ES `debe` patterns).

## Who must run it

| Emitter | What to lint |
| --- | --- |
| `requirements-authoring-ieee29148` | FR/NFR lines in the filled SRS (+ checklist/verification if they restate them) |
| Bilingual Issue Brief (Linear / GitHub Issues) | Behavioral bullets under `### Acceptance Criteria` |
| `spike-recommend` / `spec-recommend` / any skill that `save_issue` / `gh issue create\|edit` | Same AC bullets before write |

Informal AC (“unit tests pass”, “docs updated”) are **not** EARS candidates —
the linter only scores lines with `shall`/`debe`/`deberá` or an EARS opener.

## Mechanical gate

```bash
python3 shared/references/ears/scripts/ears-lint.py --selftest
python3 shared/references/ears/scripts/ears-lint.py --requirement "When mute is selected, the laptop shall suppress all audio output."
python3 shared/references/ears/scripts/ears-lint.py --markdown path/to/srs-or-brief.md
```

Patterns: [`patterns.md`](patterns.md). Attribution: [`EARS-ATTRIBUTION.txt`](EARS-ATTRIBUTION.txt).

Spec practice note (WHEN / THEN / continue-to preserve behavior):
[Kiro Specs best practices](https://kiro.dev/docs/specs/best-practices/).
