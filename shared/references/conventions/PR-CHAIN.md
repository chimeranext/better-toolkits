# Convenciones #77 — cadena de PRs (code judo)

No apilar layer + exemplars + Starknet + JEV + Laravel en un solo PR.

| Ola | Rama | Base | Contenido |
|-----|------|------|-----------|
| PR1 | `feat/77-conventions-layer` | `main` | Molde, README, OpenSpec layer, living `conventions-record` + `conventions-elixir`, Elixir (+ Phoenix) + dogfood Elixir |
| PR2 | `feat/77-conventions-exemplars` | PR1 | Rust, Dart/Flutter, TypeScript + dogfoods (sin scaffold Flutter IDE extra) |
| PR3 | `feat/77-conventions-starknet` | `main` | OpenSpec `add-conventions-starknet` (platform; independiente) |
| PR4 | `feat/77-eval-jev-router-lane` | `main` | OpenSpec `eval-jev-router-lane` (Heimdall; independiente) |
| PR5 | `feat/77-php-laravel-conventions` | PR2 | `language/php` + `frameworks/laravel` + dogfood + OpenSpec `add-conventions-php-laravel` |

Worktrees locales: `.agents/worktrees/77-conventions-{layer,exemplars,starknet,jev-router,php-laravel}`.

`feat/77-add-conventions` en GitHub se alinea con **PR1** tras el split (PR #78).
