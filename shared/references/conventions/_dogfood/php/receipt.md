# Receipt — dogfood php / laravel@0.1.0 (slice)

- candidate: `shared/references/conventions/_dogfood/php/`
- risk tier: 1 (sample nuevo, sin app Laravel completa)
- lenses: Pint + Pest Unit + Pest arch (gates L1/L2/L5 del hijo `laravel`)
- gates (después de `composer install` en CI o local):
  - `vendor/bin/pint --test`
  - `./vendor/bin/pest`
- verdict: INCONCLUSIVE en entornos sin `composer install` (no se commitea `vendor/`)
- tree-check: `sha256sum -c SHA256SUMS` al commitear.
- nota: apps Laravel completas añaden `php artisan test` + Feature HTTP; ver record
  `language/php/frameworks/laravel.md`.
