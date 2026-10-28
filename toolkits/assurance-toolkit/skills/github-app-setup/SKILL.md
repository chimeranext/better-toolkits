---
name: github-app-setup
description: >
  Enseña al founder a crear su propia GitHub App (desde el settings de organización) para que
  el /local-pr-review postee reviews firmados como esa App (estilo CodeRabbit/Greptile). Use when the user asks for
  "github app setup", "crear mi GitHub App", "setear github app", "github app para PR review",
  "que el bot postee el review", "/assurance:github-app-setup", or wants the review posted by their own bot.
---

# github-app-setup — crear tu propia GitHub App para Heimdall

Read and follow [`references/github-app-setup/protocol.md`](../../references/github-app-setup/protocol.md) (protocol SSOT).

## Qué logra

Elige `--post --github-app` en `/local-pr-review`, el review **postea como tu GitHub App**
(`<app-name>[bot]`), no como `github-actions[bot]` ni como tu usuario. Es el mismo
modelo que CodeRabbit / Greptile, pero con una App propia y 100% local.

No depende de la App de ChimeraNext: cada founder crea la suya.

## Resumen de pasos (detalle en el protocolo)

1. **Crear la App en el settings de ORG**:
   `https://github.com/organizations/{organization-id}/settings/apps/new`

   - Permissions: `Pull requests: Read & write` + `Issues: Write` (comentar en el hilo del PR) + `Contents: Read-only` + `Metadata: Read-only`.
   - **No** marcar `Expire user authorization tokens`, `Request user authorization (OAuth)`,
     ni `Enable Device Flow` (son OAuth de usuarios; Heimdall usa installation tokens).

2. **Generar y guardar la private key**: `~/.agents/heimdall-review.pem` (modo 0600).

3. **Registrar en `~/.agents/.heimdall.env`**:
   ```
   HEIMDALL_GITHUB_APP_ID=<app_id>
   HEIMDALL_GITHUB_APP_KEY=~/.agents/heimdall-review.pem
   ```

4. **Instalar la App** en tu org y seleccionar los repos.

5. **Verificar** (dry-run primero):
   ```bash
   heimdall-review pr <n> --github-app
   heimdall-review pr <n> --post --github-app
   ```

## Plantilla de manifest

`references/github-app-setup/github-app-manifest.json` — reutilizable para crear la App.

## Verificar instalación en varias orgs

Si la App va instalarse en varias organizaciones, usá el script standalone de
verificación (ejemplo real en `chimeranext/internal-org-gate` → `scripts/check-heimdall-app-installs.mjs`):

```bash
GH_TOKEN=... node scripts/check-heimdall-app-installs.mjs
```

Lista las orgs con la App instalada vs. las faltantes. GitHub no permite que una
App instale otra automáticamente: este script solo te dice dónde falta el clic
manual del admin.

## Lanzar el comando

Usá `/assurance:github-app-setup` para ejecutar esta guía interactivamente con el founder.
