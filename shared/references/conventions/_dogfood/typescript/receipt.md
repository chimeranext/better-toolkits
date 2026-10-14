# Receipt — dogfood typescript@0.1.0

- candidate: `shared/references/conventions/_dogfood/typescript/` pinned in `SHA256SUMS`
- risk tier: 1 (sample nuevo + fixture negativo)
- lenses: tsc strict (gates T1/T2 del record)
- gates: `tsc -p tsconfig.json` exit 0 (tsc 5.9.3) · fixture negativo
  `fixture-broken.ts` → `error TS1160: Unterminated template literal`
  (exit 2, esperado: prueba que el gate detecta la clase backtick-Heimdall)
- verdict: APPROVE
- tree-check: `sha256sum -c SHA256SUMS` debe pasar al commitear.
