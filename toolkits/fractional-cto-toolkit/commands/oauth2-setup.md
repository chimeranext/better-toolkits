---
description: >
  Setea un identity-aware proxy / gate OAuth frente a sitios privados y documenta el deploy a
  Cloudflare Pages vía wrangler (OAuth interactivo MUST, API Token fallback). Deliverable: la
  guía de setup aplicada al proyecto + pasos de deploy.
priority: 35
---
# /oauth2-setup — gate OAuth / Cloudflare Pages

Read and follow [`references/oauth2-setup/protocol.md`](../references/oauth2-setup/protocol.md) (protocol SSOT).

## Qué produce

Adapta y documenta el gate de autorización del proyecto (p. ej. `internal-org-gate`)
para Cloudflare Pages, y registra los pasos de deploy.

## Flujo

### Paso 1 — Modelo de autorización

Confirma con el usuario el criterio de acceso:

- **Dominio de correo verificado** (default `ALLOWED_EMAIL_DOMAIN=chimeranext.dev`).
- **Teams de la org** (default `ALLOWED_TEAMS=developers,founders`).
- Ambos, u otro.

### Paso 2 — Cloudflare Pages (adaptación)

- Verifica que el proyecto tenga `wrangler.toml` + `functions/` (o créalas).
- Documenta las variables de entorno que requiere el gate (`GITHUB_CLIENT_ID`,
  `GITHUB_CLIENT_SECRET`, `JWT_SECRET`, `ALLOWED_EMAIL_DOMAIN`, `ALLOWED_TEAMS`, …).

### Paso 3 — Deploy (dos vías de credenciales)

```bash
# Vía 1 (MUST): OAuth interactivo — guarda en ~/.config/.wrangler/config/default.toml
npx wrangler login

# Vía 2 (fallback, no-interactivo): API Token
export CLOUDFLARE_API_TOKEN=<token>

# Deploy
npx wrangler pages deploy . --project-name=<nombre-proyecto>
```

> No mezclar con la key-chain de Heimdall (`~/.agents/.heimdall.env`) — scopes separados.

### Paso 4 — Verificar

- [ ] `npx wrangler whoami` muestra sesión (OAuth) o token válido.
- [ ] Variables de entorno configuradas en Cloudflare Pages.
- [ ] Deploy exitoso; ruta protegida redirige a OAuth sin sesión.
- [ ] Página 403 correcta para no autorizados.

## Relación con otros skills

- `/assurance:github-app-setup` — crear GitHub Apps (bots de review), complementario.
- internal-handbook → `docs/explanation/auth-options.md` — matriz de opciones de auth.
