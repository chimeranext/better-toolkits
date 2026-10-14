# Spec Delta — shared/conventions-php-laravel

## Purpose

Ejemplar PHP/Laravel: record de lenguaje + hijo framework con Pint, Pest y arch
tests, alineado con documentación oficial Laravel y Pest.

## ADDED Requirements

### Requirement: Record language/php con tipado estricto

El sistema SHALL proveer `language/php/README.md` con SOURCES php.net strict types
(load-bearing) y GATES `php -l` (+ analizador estático cuando el repo lo declare).

#### Scenario: API pública tipada

- **WHEN** se añade una función pública bajo `app/` o `src/`
- **THEN** lleva `declare(strict_types=1);` y tipos en parámetros/retorno

### Requirement: Hijo frameworks/laravel con Pint y Pest

El sistema SHALL proveer `frameworks/laravel.md` heredando `php@0.1.0` con
SOURCES Laravel testing, mocking, pint y Pest configure/arch (load-bearing); GATES
`vendor/bin/pint --test` y suite Pest (`php artisan test` en apps completas).

#### Scenario: Fake antes que mock profundo

- **WHEN** un test toca HTTP saliente
- **THEN** el record exige `Http::fake` u otro fake de primera parte antes que
  mock de implementación (RULE L4)

#### Scenario: Espejo DSMS en tests

- **WHEN** el repo usa `app/Domain/{Feature}/`
- **THEN** los tests unitarios de dominio viven bajo `tests/Unit/Domain/{Feature}/`
  y los Feature bajo `tests/Feature/` (RULE L8 / test pyramid)

#### Scenario: Análisis estático declarado

- **WHEN** el record del repo fija PHPStan/Larastan en `phpstan.neon`
- **THEN** CI ejecuta ese nivel y no se amplía el baseline en archivos tocados
  (RULE L9)

#### Scenario: CI smoke vs suite completa

- **WHEN** el pipeline de integración corre en push de rama
- **THEN** puede usar un subset smoke documentado; la suite Pest completa corre en
  release o job full-suite acordado (RULE L10)

### Requirement: Dogfood php slice

El sistema SHALL incluir `_dogfood/php/` con comandos pineados y receipt sin
`vendor/` commiteado.

#### Scenario: Tree-check del dogfood

- **WHEN** se commitea el dogfood
- **THEN** `SHA256SUMS` verifica los archivos del slice
