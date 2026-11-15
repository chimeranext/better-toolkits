# EARS pattern reference

Easy Approach to Requirements Syntax — one behavior per statement, explicit
system subject, testable response.

## English templates (`shall`)

| Pattern | Template |
| --- | --- |
| Ubiquitous | `The <system> shall <response>.` |
| State-driven | `While <precondition>, the <system> shall <response>.` |
| Event-driven | `When <trigger>, the <system> shall <response>.` |
| Optional-feature | `Where <feature is included>, the <system> shall <response>.` |
| Unwanted-behavior | `If <undesired trigger>, then the <system> shall <response>.` |
| Complex | `While <precondition>, when <trigger>, the <system> shall <response>.` |
| Continue (preserve) | `When <condition>, the <system> shall continue to <existing behavior>.` |

## Spanish templates (`debe`)

| Pattern | Template |
| --- | --- |
| Ubiquitous | `El <sistema> debe <respuesta>.` |
| State-driven | `Mientras <precondición>, el <sistema> debe <respuesta>.` |
| Event-driven | `Cuando <disparador>, el <sistema> debe <respuesta>.` |
| Optional-feature | `Donde <feature incluido>, el <sistema> debe <respuesta>.` |
| Unwanted-behavior | `Si <disparador no deseado>, entonces el <sistema> debe <respuesta>.` |
| Complex | `Mientras <precondición>, cuando <disparador>, el <sistema> debe <respuesta>.` |
| Continue (preserve) | `Cuando <condición>, el <sistema> debe seguir <comportamiento vigente>.` |

## Selection heuristic

- **Ubiquitous** — always true.
- **State-driven** — only while a continuous condition holds.
- **Event-driven** — discrete trigger.
- **Optional-feature** — only if a feature exists.
- **Unwanted-behavior** — mitigation / recovery.
- **Complex** — state + event both required.
- **Continue** — preserve existing behavior (bugfix / regression guard).

## Anti-patterns

- Multiple independent behaviors joined by "and" / "y".
- Missing system subject.
- Missing trigger for event-driven behavior.
- Weak wording: quickly, user-friendly, normally, as appropriate, etc. /
  rápidamente, amigable, normalmente, si es posible, etc.
- Clause order violations (`When` before `While`, `Cuando` before `Mientras`).

## Mechanical gate

```bash
python3 shared/references/ears/scripts/ears-lint.py --requirement "When mute is selected, the laptop shall suppress all audio output."
python3 shared/references/ears/scripts/ears-lint.py --file requirements.txt
python3 shared/references/ears/scripts/ears-lint.py --markdown srs.md
python3 shared/references/ears/scripts/ears-lint.py --selftest
```

Pipeline order for generated requirements: **EARS first**, then language-routed
controlled prose (ASD-STE100 / ESP-TS) on the full customer-facing file.
