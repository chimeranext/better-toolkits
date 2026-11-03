# convention: lua
id: lua · version: 0.1.0 · status: draft · level: language
extracted_at: 2026-11-03 · ttl_expires: 2027-02-03
parent: none

## GOAL

Lua que pasa luacheck y declara deps vía luarocks (rockspec).

## SOURCES

| # | kind | ref | weight | para qué |
|---|------|-----|--------|----------|
| S1 | repo | `mpeterv/luacheck` | load-bearing | lint |
| S2 | docs | luarocks rockspec | load-bearing | deps |
| S3 | docs | `lua` globalos | context | mejores prácticas |

## RULES

- R1 [lint] `luacheck .` sin hallazgos → S1.
- R2 [deps] rockspec con versiones fijas → S2.
- R3 [globals] sin variables globales no declaradas (usa `local`) → S3.
- R4 [install] `luarocks make` con rockspec → S2.

## COUNTEREXAMPLES

```lua
-- ❌ wrong: global implícito (R3)
x = 10

-- ✅ right:
local x = 10
```

## GATES

- local: `luacheck .`
- CI: mismos + `luarocks make` (rockspec).
