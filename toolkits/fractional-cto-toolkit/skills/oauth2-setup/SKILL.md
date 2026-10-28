---
name: oauth2-setup
description: >
  Setea un identity-aware proxy / gate OAuth (oauth2-proxy + Cloudflare) frente a sitios privados
  y documenta el deploy a Cloudflare Pages vía wrangler (OAuth interactivo MUST, API Token fallback).
  Use when the user asks for "oauth2 setup", "proteger sitio con auth", "cloudflare pages deploy",
  "wrangler login", "gate oauth", "oauth2-proxy", "deploy a cloudflare", "/oauth2-setup",
  or wants to protect a private static site (handbook, academy, docs) with login.
---

# oauth2-setup — gate OAuth / Cloudflare Pages

Read and follow [`references/oauth2-setup/protocol.md`](../../references/oauth2-setup/protocol.md) (protocol SSOT).

## Qué logra

Protege sitios estáticos privados (handbook, academy, storybook, docs) con un gate
server-side que pide login. Incluye el **deploy a Cloudflare Pages** vía
`wrangler` y las dos vías de autenticación de Cloudflare.

## Resumen

1. **Modelo de autorización**: correo verificado en dominio (ej. `@chimeranext.dev`)
   o membresía en teams de la org (ej. `developers`, `founders`).
2. **Deploy a Cloudflare Pages**:

   ```bash
   # Vía 1 (MUST): OAuth interactivo
   npx wrangler login

   # Vía 2 (fallback, no-interactivo): API Token
   export CLOUDFLARE_API_TOKEN=<token>

   # Deploy
   npx wrangler pages deploy . --project-name=<nombre-proyecto>
   ```

3. **Credenciales**: OAuth interactivo guarda en `~/.config/.wrangler/config/default.toml`
   (o `default.enc` + keyring). El API Token es solo para CI/headless.

## Lecciones clave

- Vercel Hobby **no** despliega repos de organizaciones GitHub (requiere Pro);
  Cloudflare Pages sí — y conecta con Cloudflare Access.
- Cloudflare ≠ key-chain de Heimdall (`~/.agents/.heimdall.env`) — scopes separados.

## Lanzar el comando

Usá `/oauth2-setup` para ejecutar esta guía con el founder/cliente.
