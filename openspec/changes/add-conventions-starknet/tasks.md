# Tasks — add-conventions-starknet

## 1. Record platform/starknet

- [ ] 1.1 Escribir `platform/starknet/README.md` (SOURCES cairo-coder MIT + Madara Apache-2.0 pineados por commit, resto listed) y verificar que ninguna RULE cita el hosted
- [ ] 1.2 Declarar GATES (hereda rust + clippy.toml/rustfmt.toml de Madara + scarb build/test) con pins y verificar subset local⊂CI
- [ ] 1.3 Fijar RPC soportadas (default v0.10.2, admin 9943 localhost-only) y verificar que exponer admin se flaggea

## 2. Dogfood y cierre

- [ ] 2.1 Dogfood: sample Cairo (`scarb build/test`) + sample Rust contra gates heredados, con receipt y tree-check
- [ ] 2.2 Correr `openspec validate --change add-conventions-starknet` y verificar que pasa
