# Tasks — add-conventions-php-laravel

## 1. Records

- [x] 1.1 `language/php/README.md` con SOURCES y RULES P1–P4
- [x] 1.2 `language/php/frameworks/laravel.md` con Pint/Pest/arch/mocking y GATES
- [x] 1.3 Actualizar `shared/references/conventions/README.md` con filas PHP/Laravel
- [x] 1.4 `references.md` con SSOT consumer docs + upstream Pest arch

## 2. Dogfood

- [x] 2.1 `_dogfood/php/` (composer.json, pint.json, Pest Unit + Architecture)
- [ ] 2.2 `composer install` en CI y verificar `vendor/bin/pint --test` + `pest`
- [x] 2.3 `receipt.md` + `SHA256SUMS`
- [x] 2.4 `tests/Unit/Domain/` + regla arch de capa `Dogfood\Domain`

## 3. OpenSpec

- [x] 3.1 `openspec validate --change add-conventions-php-laravel`
- [ ] 3.2 `openspec archive -y add-conventions-php-laravel` → living spec

## QA traceability (four layers)

SSOT: consumer `reference/process/qa-traceability-four-layers.md` (pattern only; not vendored).

| Layer | Artifact |
| --- | --- |
| 1 — Normative AC | `specs/shared/conventions-php-laravel/spec.md` (this change) |
| 2 — Manual stage QA | N/A (record + dogfood; no product UI) |
| 3 — Automated | `_dogfood/php/tests/` (table below) |
| 4 — HITL round | N/A for better-toolkits conventions slice |

### Scenario → verification mapping

| OpenSpec scenario | Pest (automated) | Manual | HITL case ID | Storybook |
| --- | --- | --- | --- | --- |
| API pública tipada | `PercentTest` + `src/Percent.php` strict_types | review `language/php/README.md` P1 | — | — |
| Fake antes que mock profundo | (documented in `laravel.md` L4; no HTTP in dogfood) | review counterexample | — | — |
| Espejo DSMS en tests | `tests/Unit/Domain/Pricing/LineTotalTest.php` | review folder layout | — | — |
| Análisis estático declarado | (RULE L9; dogfood omite PHPStan) | review `laravel.md` L9 | — | — |
| CI smoke vs suite completa | (RULE L10; CI job in owning repo) | review `laravel.md` L10 | — | — |
| Tree-check del dogfood | `sha256sum -c SHA256SUMS` in `_dogfood/php/` | `receipt.md` | — | — |

Rules:

- Architecture: `tests/Architecture/ArchTest.php` guards `Dogfood\Domain` layer (preset-friendly slice).
- Run gates: `cd _dogfood/php && composer install && vendor/bin/pint --test && ./vendor/bin/pest`.
