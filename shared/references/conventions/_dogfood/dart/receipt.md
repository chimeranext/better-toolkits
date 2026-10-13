# Receipt — dogfood dart@0.1.0

- candidate: `shared/references/conventions/_dogfood/dart/` pinned in `SHA256SUMS`
- risk tier: 1 (sample nuevo)
- lenses: analyze + test (gates D1/D2 del record)
- gates: `dart analyze` No issues found · `dart test` All tests passed
  (Dart SDK 3.13.4, `dart pub get` 49 deps)
- verdict: APPROVE
- tree-check: `sha256sum -c SHA256SUMS` debe pasar al commitear.
