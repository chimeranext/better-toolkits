# /oauth2-setup — protocol SSOT

Guía para integrar una **auth/identity-aware proxy** (caso de uso principal:
`oauth2-proxy` + Cloudflare) frente a un sitio/portales privados, y documentar el
**deploy a Cloudflare Pages** vía `wrangler`. Nace de las lecciones aprendidas
portando `internal-org-gate` (Vercel Edge → Cloudflare Pages) y de la decisión
del internal-handbook (`docs/explanation/auth-options.md`).

## Propósito

Un fundador/CTO fraccional necesita proteger sitios estáticos privados (handbook,
academy, storybook, docs). Este skill:

1. Explica el **modelo de autorización** recomendado (correo verificado en dominio
   o membresía de teams de la org).
2. Da el **setup de Cloudflare Pages** (adaptación del gate) con las dos vías de
   autenticación de `wrangler`.
3. Documenta lecciones aprendidas de la portación Vercel → Cloudflare.

## Credenciales de Cloudflare — dos vías (orden de preferencia)

> **Importante:** estas credenciales son de un **scope distinto** a las de
> Heimdall (`~/.agents/.heimdall.env`). No se mezclan. Cloudflare no usa ese
> archivo.

### Vía 1 (MUST): OAuth interactivo — `wrangler login`

El CLI de Cloudflare (`wrangler`) autentica por defecto con **OAuth interactivo**
que abre el navegador:

```bash
npx wrangler login
# (opcional) cifra las credenciales en el keychain del SO:
npx wrangler login --use-keyring
```

**Dónde guarda las credenciales** (docs oficiales):

| Modo | Archivo |
|---|---|
| Default | `~/.config/.wrangler/config/default.toml` (plaintext TOML) |
| `--use-keyring` | `~/.config/.wrangler/config/default.enc` (AES-256-GCM) + key en el keychain del SO |

Verificar sesión y ubicación:

```bash
npx wrangler whoami
# 👋 You are logged in with an OAuth Token, associated with the email user@example.com.
# 🔐 Credentials are stored in: ~/.config/.wrangler/config/default.toml
```

Esta vía es la **recomendada** (MUST) para uso humano: el token se refresca solo y
no hay que gestionar secretos.

### Vía 2 (fallback): API Token — `CLOUDFLARE_API_TOKEN`

Para entornos **no-interactivos** (CI, agentes) donde `wrangler login` no puede
abrir el navegador, se usa un **API Token** como variable de entorno:

```bash
# Crear el token en dash.cloudflare.com → Mi perfil → Tokens de API
# con permiso "Cloudflare Pages: Edit".
export CLOUDFLARE_API_TOKEN=<token>
npx wrangler whoami
```

> El CLI **no** lee un archivo `.env` de `~/.config/.wrangler/cloudflare.env`.
> Lee la variable de entorno `CLOUDFLARE_API_TOKEN` (o la config de `login`).

**Regla:** OAuth interactivo es la vía primaria; el API Token solo como fallback
si la interactiva falla (CI/headless).

## Deploy a Cloudflare Pages vía CLI

Adaptación del gate (de Vercel Edge a Cloudflare Pages Functions):

```bash
# Requiere auth (login OAuth o CLOUDFLARE_API_TOKEN).
npx wrangler pages deploy . --project-name=<nombre-proyecto>
```

- El proyecto debe tener `wrangler.toml` (compatibility_date + nodejs_compat).
- Las Functions viven en `functions/` (`_middleware.ts` + `api/auth/*`).
- Las variables de entorno del gate (`GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`,
  `JWT_SECRET`, `ALLOWED_EMAIL_DOMAIN`, `ALLOWED_TEAMS`, …) se configuran en el
  dashboard de Cloudflare Pages → Settings → Environment Variables.

## Lecciones aprendidas (2026-10-28)

- **Vercel Hobby no despliega repos de organizaciones GitHub** (públicas o
  privadas): solo cuentas personales. El mensaje "private GitHub organization" es
  engañoso — aplica a *cualquier* repo de una org. Para orgs, Vercel exige
  **Pro** (o migrar a Cloudflare Pages).
- **Cloudflare Pages sí soporta repos de orgs** y conecta con el stack Cloudflare
  (Access) — por eso es la vía elegida para el gate.
- **El archivo de credenciales de wrangler es `default.toml`** (o `default.enc`
  con keyring), no un `.env` de cloudflare.
- **Scopes separados:** Cloudflare ≠ key-chain de Heimdall.
- `wrangler` se ejecuta con `npx wrangler` si no está instalado como dependencia.

## Referencias

- Cloudflare docs: Wrangler install/update · commands/general (credential storage).
- `chimeranext/internal-org-gate` — template del gate (Vercel + Cloudflare Pages).
- internal-handbook → `docs/explanation/auth-options.md` — matriz de opciones.
