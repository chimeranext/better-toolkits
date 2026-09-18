---
description: Review de código de la rama actual con Heimdall (Kimi vía NVIDIA NIM). Local salvo la inferencia; no toca GitHub ni CI.
---

Corré el review de Heimdall sobre el `git diff` de la rama actual y
mostrame el resultado tal cual lo imprime.

Pasá `$ARGUMENTS` tal cual a `heimdall-review diff` (por ejemplo
`/local-pr-review --base develop`; default = merge-base con `origin/HEAD`).

El review es **local salvo una llamada de red**: lee el diff de la rama, arma el
prompt y renderiza el resultado en la máquina; la única conexión saliente es la
inferencia vía NVIDIA NIM. El único secreto necesario es
`NVIDIA_API_KEY`.

Preferí el bin local instalado con `bun link` (método estrella, sin descargar
nada por invocación). Si la key ya está en un `.env`/env var local (máximo
offline), corré directo:

```bash
heimdall-review diff
```

Si la key vive solo en Infisical (sin secreto en disco), inyectala en runtime:

```bash
infisical run -- heimdall-review diff
```

Si el bin `heimdall-review` NO está en PATH (no corriste `bun link`), caé a bunx
(requiere red para bajar el package):

```bash
infisical run -- bunx github:chimeranext/heimdall@main review diff
```

Después de correrlo, resumime los hallazgos por severidad (🔴 P1 / 🟡 P2 / 🔵 P3 /
⚪ P4) y señalá si el veredicto fue APPROVE o REQUEST_CHANGES.
