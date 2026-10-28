---
description: >
  Guía interactiva para que el founder cree su PROPIA GitHub App (settings de org)
  y la use como autora de los reviews de Heimdall (estilo CodeRabbit/Greptile).
  No depende de la App de ChimeraNext. Guía + manifest + key-chain + verificación.
priority: 40
---
# /assurance:github-app-setup

Read and follow [`references/github-app-setup/protocol.md`](../references/github-app-setup/protocol.md) (protocol SSOT).

## Qué produce

1. **Crear la GitHub App** en el settings de org:
   `https://github.com/organizations/{organization-id}/settings/apps/new`
   - Permissions: `pull_requests: write` + `issues: write` (comentar en el hilo del PR) + `contents: read` + `metadata: read`.
   - Omitir las opciones de OAuth de usuarios (device flow, user authorization, expire tokens).
2. **Guardar la private key** en `~/.agents/heimdall-review.pem` (modo 0600).
3. **Registrar** en `~/.agents/.heimdall.env`:
   ```
   HEIMDALL_GITHUB_APP_ID=<app_id>
   HEIMDALL_GITHUB_APP_KEY=~/.agents/heimdall-review.pem
   ```
4. **Instalar** la App en la org y seleccionar los repos.
5. **Verificar** con dry-run y luego `--post --github-app`.

Para auditar varias orgs, usá el script standalone de verificación
(`chimeranext/internal-org-gate` → `scripts/check-heimdall-app-installs.mjs`):

```bash
GH_TOKEN=... node scripts/check-heimdall-app-installs.mjs
```

## Plantilla de manifest

`references/github-app-setup/github-app-manifest.json` — reutilizable.

## Cómo se ve al funcionar

```bash
heimdall-review pr <n> --post --github-app
```
El review aparece en el PR firmado por `<app-name>[bot]`.

> Este comando SOLO guía y verifica. No crea la App por vos (requiere UI de GitHub
> y la private key). Resuelve dudas (qué marcar/omitir, permisos, troubleshooting) paso a paso.
