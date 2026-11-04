# convention: ruby
id: ruby · version: 0.1.0 · status: draft · level: language
extracted_at: 2026-11-03 · ttl_expires: 2027-02-03
parent: none

## GOAL

Ruby que pasa rubocop + brakeman (si Rails) y usa bundler con `Gemfile.lock`
pineado y `--deployment`.

## SOURCES

| # | kind | ref | weight | para qué |
|---|------|-----|--------|----------|
| S1 | docs | bundler `--deployment` | load-bearing | install reproducible |
| S2 | repo | `rubocop/rubocop` | load-bearing | lint |
| S3 | repo | `presidentbeef/brakeman` | load-bearing | seguridad (Rails) |
| S4 | docs | Gemfile.lock conventions | load-bearing | lockfile |

## RULES

- R1 [lock] `Gemfile.lock` commiteado → S4.
- R2 [install] `bundle install --deployment` (o `--frozen`) en CI → S1.
- R3 [lint] `rubocop` sin hallazgos → S2.
- R4 [sec] Rails: `brakeman -q` sin warnings high → S3.
- R5 [test] `bundle exec rspec` con `--frozen` → S1.

## COUNTEREXAMPLES

```ruby
# ❌ wrong: eval de input (R4)
eval(params[:code])

# ✅ right: no usar eval; validar input
```

## GATES

- local: `bundle exec rubocop`
- CI: mismos + `bundle install --deployment` + `brakeman -q` (Rails).
