# References — add-conventions-php-laravel

Bibliografía para el record `language/php` + `frameworks/laravel` y el dogfood slice.
Estado: `verified` = alineado con convenciones documentadas en producto; `listed` = upstream oficial.

## Upstream (load-bearing)

| URL | Para | Estado |
| --- | --- | --- |
| https://www.php.net/manual/en/language.types.declarations.php | `strict_types`, firmas | listed |
| https://laravel.com/docs/testing | Feature/Unit, RefreshDatabase, `.env.testing` | listed |
| https://laravel.com/docs/mocking | `Http::fake`, `Bus::fake`, `Event::fake`, `Queue::fake`, `Storage::fake` | listed |
| https://laravel.com/docs/pint | `vendor/bin/pint` / `--test` | listed |
| https://pestphp.com/docs/configuring-tests | `tests/Pest.php`, plugins, parallel | listed |
| https://pestphp.com/docs/arch-testing | `tests/Architecture`, `arch()`, presets | listed |

## Enterprise Laravel monorepo patterns (consumer docs — inspiration)

These documents informed RULES L8–L10 and QA traceability in this change. They are **not** vendored into
better-toolkits; product repos link to their own docs SSOT.

| Topic | Consumer doc path (Diátaxis) | Used for |
| --- | --- | --- |
| Testing architecture, Pest primary, fakes, CI smoke vs full | `reference/architecture/testing-technical-specification.md` | L2–L4, L9–L10, test style |
| Developer testing how-to | `how-to/testing/run-the-test-suite.md` | strict_types, RefreshDatabase, fakes |
| Pest `arch()` how-to | `how-to/testing/pest-architecture-tests.md` | L5, L8, DSMS boundaries; complements Feature Pest for onboarding flows |
| Domain coverage (Clover, optional `--min`) | `how-to/testing/domain-coverage-audit.md` | L7, coverage audit |
| DSMS + Inertia adapter composition | `reference/process/code-organization-standards.md` §1b | L8 |
| Runtime ADR (first Inertia DSMS reference) | `reference/decisions/adr-006-agency-home-inertia-dsms-layering.md` | L8, unit tests without Inertia |
| OpenSpec scenario → Pest mapping | `reference/process/qa-traceability-four-layers.md` | `tasks.md` QA section |
| Branch CI gates (Larastan, PHPUnit/Pest) | `reference/process/branching-strategy.md` | L9 static analysis |
| Tactical DDD / hexagonal | `explanation/architecture/tactical-ddd-hexagonal-clean-plan.md` | ports/adapters context |

## Notes

- **Pest vs PHPUnit:** consumer testing SSOT assumes **Pest as primary runner** with PHPUnit as engine; legacy
  PHPUnit-only repos must document an explicit exception in the record frontmatter.
- **Arch tests:** consumer docs describe adoption; the dogfood slice demonstrates minimal `arch()` without a full
  Laravel skeleton.
