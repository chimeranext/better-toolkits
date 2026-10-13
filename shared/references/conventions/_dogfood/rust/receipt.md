# Receipt — dogfood rust@0.1.0

- candidate: `shared/references/conventions/_dogfood/rust/` pinned in `SHA256SUMS`
- risk tier: 1 (sample nuevo, un solo mecanismo)
- lenses: fmt + clippy + test (gates R2/R3 del record)
- gates: `cargo fmt --check` OK · `cargo clippy --all-targets -- -D warnings` OK ·
  `cargo test` 2 passed (toolchain 1.99.0 vía `rust-toolchain.toml`)
- verdict: APPROVE
- tree-check: `sha256sum -c SHA256SUMS` debe pasar al commitear; si un byte
  difiere, este receipt queda inválido hasta re-correr los gates.
