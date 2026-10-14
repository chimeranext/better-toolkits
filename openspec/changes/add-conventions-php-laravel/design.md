# Design — add-conventions-php-laravel

## Context

Assurance-toolkit ya documenta runners Laravel/Pest a nivel pilar testing; este
change es el **record de convenciones** (código bien escrito), no el protocolo de
evidencia QA.

## Decisions

1. **Pest como runner primario** en el record hijo; PHPUnit solo si el repo lo
   declara explícitamente como excepción documentada.
2. **Dogfood mínimo** (Pint + Pest + arch) sin skeleton Laravel completo en git;
   apps reales corren `php artisan test` en CI.
3. **PR propio** (`feat/77-php-laravel-conventions`), base
   `feat/77-conventions-exemplars` (no apilar en #78).

## Migration Plan

Aditivo. Rollback = borrar rama `language/php/` y change OpenSpec.
