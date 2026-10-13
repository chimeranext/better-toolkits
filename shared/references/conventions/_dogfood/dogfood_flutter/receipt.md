# Receipt — dogfood flutter@0.1.0

- candidate: `_dogfood/dogfood_flutter/` (scaffold `flutter create
  --template=package`; superficie gateada pineada en `SHA256SUMS`)
- risk tier: 1 (sample scaffold)
- lenses: analyze + test (gates F2/F3 del record, vía flutter)
- gates: `flutter analyze` No issues found · `flutter test` All tests passed
- verdict: APPROVE
- tree-check: `sha256sum -c SHA256SUMS` debe pasar al commitear.
