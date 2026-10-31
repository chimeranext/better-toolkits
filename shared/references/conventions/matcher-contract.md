# Matcher contract — multi-language BDD assertions (transversal)

Convención transversal para **afirmaciones BDD multi-lenguaje**. Define un contrato
declarativo (mini-lenguaje) que cada record de lenguaje traduce al matcher nativo.
Sirve para que una misma afirmación de comportamiento (Given/When/Then) se exprese una
vez y se verifique en cualquier lenguaje, sin duplicar la narrativa.

## Principio

- La **narrativa BDD** (Given/When/Then) es única y agnóstica del lenguaje.
- Cada afirmación declara un **matcher declarativo** (criterio legible) en un
  mini-lenguaje.
- El runner traduce el matcher al **matcher nativo** del lenguaje (Chai/Jest/pytest/Dart,
  etc.) usando el record de convención de ese lenguaje.
- La verificación real es el assert nativo; la afirmación BDD es el lenguaje que le da
  significado.

## Mini-lenguaje de matchers

| Declaración | Significado |
|---|---|
| `field equals X` | `campo == X` (igualdad) |
| `field contains Y` | el valor contiene `Y` (substring / elemento) |
| `field matches /re/` | el valor hace match con regex |
| `len(field) op N` | longitud del campo cumple `op` (`>=`, `==`, `<`, …) rel `N` |
| `field is truthy` / `is falsy` | valor booleano/verdad |
| `field is null` / `is not null` | nulidad |
| `array contains Z` | el array incluye `Z` |

## Traducción a matchers nativos

| Lenguaje | Record de convención | Traducción del matcher |
|---|---|---|
| TypeScript | [`language/typescript/README.md`](./language/typescript/README.md) | **Chai** `expect(expr).to.equal(x)` / `.to.contain(y)` / `.to.match(re)` / `.to.have.length(n)`; o Jest `expect(expr).toEqual(x)` |
| Dart | [`language/dart/README.md`](./language/dart/README.md) | `expect(expr, equals(x))` / `contains(y)` / `matches(re)` / `hasLength(n)` |
| Python | (añadir `language/python/` cuando exista) | `assert expr == x` / `x in expr` / `re.search(re, expr)` / `len(expr) >= n` |
| Rust | [`language/rust/README.md`](./language/rust/README.md) | `behave` `expect!(expr).to_equal(x)` / `to_contain(y)` / `to_match(re)` / `to_have_length(n)` |
| PHP | [`language/php/README.md`](./language/php/README.md) | Pest `expect($expr)->toBe($x)` / `->toContain($y)` / `->toMatch($re)` / `->toHaveCount($n)` |
| Elixir | [`language/elixir/README.md`](./language/elixir/README.md) | ExUnit `assert expr == x` / `x in expr` / `Regex.match?(re, expr)` / `length(expr) >= n` |

## Reglas

- **R-M1 [contrato]**: la afirmación BDD se declara en el mini-lenguaje; nunca se
  escribe el assert nativo en la narrativa.
- **R-M2 [traducción]**: el runner traduce el matcher al nativo del lenguaje usando el
  record de convención; si el lenguaje no tiene record, se declara explícitamente.
- **R-M3 [behavior]**: afirmar comportamiento observable, no implementación. El matcher
  se aplica al resultado observable (respuesta, estado visible), no a internals.
- **R-M4 [gates]**: los gates Jidoka / No-Workarounds aplican a todo matcher: ante una
  anomalía se detiene; ninguna señal puede silenciarse para que el matcher pase.

## Relación con otros archivos

- Los records de lenguaje (`language/*/README.md`) referencian este contrato para la
  sección de aserción/BDD.
- `assurance-toolkit` consumen este contrato para el runner e2e (traducir `Then` a
  matcher nativo).
- Este contrato es transversal (`language (transversal)`), igual que
  `prescriptive-error-messages.md`.
