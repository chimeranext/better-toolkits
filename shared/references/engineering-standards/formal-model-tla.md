# TFM — Formal Model TLA+ (doctrina)

## Purpose

Standardize how formal models (TLA+/TLC) are written and validated in this repo.

## Relation types

- `ORDER` (prerrequisito): restringe posiciones relativas (valida Prop).
- `COMPLEMENT` (ortogonalidad): sin restricción de orden; se documenta pero no se evalúa en `Prop`. Ejemplo: PRDS↔BrS, PRDS↔QT4L.

## Conventions

1. Module file name SHALL equal the module name exactly (`AdoptionOrder.tla` ↔ `MODULE AdoptionOrder`).
2. Models SHALL be self-contained: definitions inline; avoid complex constant
   literals in the `.cfg` (parser is fragile).
3. Function literals with string keys are NOT accepted by the parser. Use a
   `SEQUENCE` of names + `Pos(s) == CHOOSE i \in DOMAIN ORD : ORD[i] = s`.
4. Constant-level assertions: use `ASSUME Prop` (INVARIANT gives only a warning
   and checks 0 states).
5. Run recipe:
   `java -cp <tla2tools.jar> tlc2.TLC -config <cfg> <Module.tla>`
6. Only report PASS when TLC prints "Model checking completed. No error has been found".

## Known pitfalls (observed)

- `[... |-> ...]` with quoted keys → parse error.
- Opaque multi-value `CONSTANT` literals in `.cfg` → parse errors; prefer inline definitions.
- File/module name mismatch → fatal parse error.
- `INIT Init`/`NEXT Next` names must match module operators (`INIT == TRUE`).

## Example

`scripts/tla/adoption-order/` validates the Engineering-standards adoption order
(dependency edges) — TLC PASS. `scripts/tla/branch-default/` proves that a
`develop` default branch makes feature-PR base selection deterministic (TLC
PASS for default=`develop`. Default=`main` yields a Safety counterexample).

## References

- `scripts/tla/adoption-order/AdoptionOrder.tla`
