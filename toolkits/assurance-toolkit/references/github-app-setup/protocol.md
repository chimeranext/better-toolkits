# /assurance:github-app-setup — protocol SSOT

Guía paso-a-paso para que un startup founder cree su **propia GitHub App** y la
use como autor de los reviews de Heimdall (estilo CodeRabbit / Greptile). No
depende de la App de ChimeraNext: cada repo/org puede tener la suya.

## Propósito

El `--post` de `/local-pr-review` postea reviews con `GITHUB_TOKEN` (firma como
`github-actions[bot]` o el usuario). Con una GitHub App propia, el review lo
firma **tu App** (`<app-name>[bot]`), con su nombre e ícono — igual que
CodeRabbit o Greptile.

No se comparte ninguna private key: cada founder crea la suya y la guarda en su
máquina (`~/.agents/.heimdall.env`).

## Prerrequisitos

- Una org de GitHub (para el settings de org, recomendado) o una cuenta personal.
- El CLI `heimdall-review` instalado (`shared/heimdall/`).
- Permisos de administrador en la org para crear Apps (o en la cuenta).

## Paso 1 — Crear la GitHub App en el settings de ORG (no el personal)

El settings correcto es el de **organización** (no "Settings → Developer
settings" de la cuenta):

```
https://github.com/organizations/{organization-id}/settings/apps/new
```

Si no tenés org, el equivalente personal es:

```
https://github.com/settings/apps/new
```

Datos del formulario:

| Campo | Qué poner |
|---|---|
| **GitHub App name** | único, p.ej. `startup-review-bot` |
| **Homepage URL** | la de tu startup (o el repo) |
| **Webhook URL** | **vacío por ahora** (solo si querés trigger automático) |
| **Webhook secret** | vacío (igual que arriba) |
| **Permissions** | `Pull requests: Read & write` (imprescindible) + `Issues: Write` (para comentar en el hilo del PR, que es un issue) + `Contents: Read-only` + `Metadata: Read-only` |
| **Where can this App be installed?** | *Any account* (para usarla en todos tus repos) o *Only on this account* |

### Qué NO marcar

Estas opciones son de OAuth de **usuarios** y **no** se necesitan para Heimdall:

- ❌ **Expire user authorization tokens** — es para tokens de usuario + refresh; Heimdall usa installation tokens (machine-to-machine).
- ❌ **Request user authorization (OAuth) during installation** — hace que la instalación pida identidad del usuario; innecesario.
- ❌ **Enable Device Flow** — flujo OAuth para dispositivos sin navegador; irrelevante.

## Paso 2 — Guardar la private key

1. Tras crear la App, GitHub te da una **Private key** (botón *Generate a private key*).
   Descargá el `*.pem`.
2. Movela a `~/.agents/` y fijá permisos solo-dueno:

   ```bash
   mkdir -p ~/.agents
   mv ~/Downloads/startup-review-bot*.pem ~/.agents/heimdall-review.pem
   chmod 600 ~/.agents/heimdall-review.pem
   ```

## Paso 3 — Registrar la App en la key-chain

Agregá al archivo `~/.agents/.heimdall.env` (mismo archivo que la NIM key):

```
HEIMDALL_GITHUB_APP_ID=<your_app_id>
HEIMDALL_GITHUB_APP_KEY=~/.agents/heimdall-review.pem
```

- `<your_app_id>`: está en la página de la App (Settings → General → **App ID**).
- `HEIMDALL_GITHUB_APP_INSTALLATION_ID` es **opcional**: si falta, Heimdall lo
  autodetecta por `owner/repo`.

Precedencia (igual que la NIM key): `~/.agents` → repo `.heimdall.env` → env.

## Paso 4 — Instalar la App en tus repos

1. En la página de la App, **Install App** → elegí la org/cuenta.
2. Seleccioná **All repositories** o una lista explícita.
3. Confirmá la instalación.

### Verificar la instalación en varias orgs

Para auditar en qué orgs ya está instalada la App (y cuáles faltan), existé un
script standalone (ejemplo en `internal-org-gate`, pero aplica a cualquier repo):

```bash
node scripts/check-heimdall-app-installs.mjs
# (opcional) para comparar contra tus orgs:
GH_TOKEN=... node scripts/check-heimdall-app-installs.mjs
```

El script lee las mismas credenciales de la key-chain, lista las instalaciones
(`GET /app/installations`) y, con `GH_TOKEN`, marca las orgs que faltan con el
link directo `https://github.com/apps/<app-name>`.

> Nota: GitHub **no** permite que una GitHub App instale otra automáticamente.
> La instalación requiere el flujo de UI del admin (un clic por org). Este script
> solo te dice **dónde** falta ese clic.

## Paso 5 — Verificar

Dry-run primero (imprime, no postea):

```bash
heimdall-review pr <n> --github-app
```

Si la App está bien configurada, el `--post` real postea como la App:

```bash
heimdall-review pr <n> --post --github-app
```

El review aparecerá en el PR firmado por `<app-name>[bot]`.

## Solución de problemas

| Síntoma | Causa probable | Fix |
|---|---|---|
| `no pude resolver NVIDIA_API_KEY` | Falta la NIM key (no relacionado con la App) | `heimdall-review key:init` |
| `GitHub App no configurada` | Faltan `HEIMDALL_GITHUB_APP_ID`/`KEY` en la key-chain | Paso 3 |
| `403` al postear | La App no está instalada en ese repo, o falta permiso `pull_requests: write` | Paso 4 + revisar Permissions |
| `404` en `/installation` | La App no está instalada en `owner/repo` | Paso 4 |
| `401` al generar el JWT | Private key incorrecta o App ID mal | Revisar el `.pem` y el App ID |
| La App no aparece como autora | Se usó `--post` sin `--github-app` (usó `GITHUB_TOKEN`) | Agregar `--github-app` |

## Seguridad

- La private key (`*.pem`) **nunca** se commitea, imprime ni comparte. Vive solo en `~/.agents/`.
- `~/.agents/.heimdall.env` debe tener modo `0600`.
- La App se crea con el menor privilegio posible (`pull_requests: write` + `issues: write`, mínimo para postear el review y comentar en el hilo).
