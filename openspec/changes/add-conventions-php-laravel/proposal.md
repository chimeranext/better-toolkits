# Proposal — add-conventions-php-laravel

Change ID: `add-conventions-php-laravel`

## Why

El epic #77 necesita un ejemplar web PHP/Laravel alineado con el molde (Pint, Pest,
arch tests, mocking/fakes) sin mezclarlo con Rust/Dart/Starknet en el mismo PR.
Precondición: `add-conventions-layer` (+ opcionalmente `add-conventions-exemplars`
para ritmo del árbol).

## What Changes

- `language/php/README.md` (level language): strict types, PSR-4, gates `php -l`.
- `language/php/frameworks/laravel.md` (parent `php@0.1.0`): SOURCES Laravel
  testing/mocking/pint + Pest configure/arch; GATES `vendor/bin/pint --test` +
  `php artisan test` / Pest + suite Architecture.
- `_dogfood/php/`: slice Composer (Pint + Pest + arch plugin), sin `vendor/` en git.

## Capabilities

### New Capabilities

- `shared/conventions-php-laravel`: records `language/php` + `frameworks/laravel`.

### Modified Capabilities

- (vacío)

## Impact

- Solo `shared/references/conventions/` + OpenSpec delta; sin cambios en toolkits.
