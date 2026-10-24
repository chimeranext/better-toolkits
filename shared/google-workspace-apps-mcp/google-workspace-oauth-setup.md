# /google-workspace-oauth-setup
---
description: Flujo guiado para obtener GOOGLE_CLIENT_ID / CLIENT_SECRET / RCLONE_REMOTE + evidencia TOS (no dummy prompt de 4 inputs)
version: 1.0.0
status: active
---

## ¿Para qué sirven estos valores?

Este MCP (`google-for-rclone`) necesita un **remote** configurado (`gdrive`) para que `rclone copy <file> gdrive:<folder>` funcione. El remote requiere un `client_id` y `client_secret` propios (OAuth 2.0 de Google Drive), porque `rclone` actúa como tu aplicación ante Google. Sin ellos, `loadRemote()` lanza `execSync("rclone config")`; con ellos, `rclone` usa tu identidad y no un `client_id` compartido.

## EVIDENCIA LEGAL (PRIMERO — por qué NO un client_id compartido)

- **Google APIs Terms of Service**, "Confidential Matters" / b.1 (`developers.google.com/terms`):
  > "Developer credentials (such as passwords, keys, and **client IDs**) are intended to be used by you and identify your API Client. You will keep your credentials confidential and make reasonable efforts to prevent and discourage **other API Clients from using your credentials**. Developer credentials **may not be embedded in open source projects**."

- **OAuth 2.0 Policies** (`developers.google.com/identity/protocols/oauth2/policies`):
  > "Every app... must have at least one registered OAuth client. You must create a **separate OAuth client for each platform**."

- **rclone docs** (`rclone.org/drive/#making-your-own-client-id`): recomienda "making your own client-id" (no shared).

- **Exposición client_id** (`newscrewdriver.com/2016/12/27/limiting-google-client-id-exposure/`): confirma violación del TOS al incrustar client_id en código abierto.

=> Este archivo NO incrusta `client_id`. Cada usuario debe configurar su propio `client_id` (pasos abajo).

---

## Flujo guiado (pasos)

### Paso 1 — Crear proyecto Google Cloud
- https://console.cloud.google.com/
- Crear proyecto.
- Habilitar **Google Drive API**.

### Paso 2 — Credenciales OAuth 2.0
- **APIs & Services > Credentials**
- **Create Credentials > OAuth client ID**
- Application type: `Desktop app` (CLI / rclone).
- Copiar `Client ID` y `Client Secret`.
- Guardar localmente (NO en este repo):
  - `~/.config/google-workspace/client_id.json`
  - `~/.config/google-workspace/client_secret.json`

### Paso 3 — Configurar rclone con tu propio client
```bash
rclone config
# n) New remote → name: gdrive → Storage: 13 (Google Drive)
# client_id: <tu_client_id>
# client_secret: <tu_client_secret>
# scope: drive.readonly (o drive, según necesidad)
```
Esto guarda en `~/.config/rclone/rclone.conf` (archivo nativo de rclone, NO `.rclone-config.json`).

### Paso 4 — Verificar acceso
```bash
rclone lsf gdrive:
```

### Paso 5 — Configurar variables de entorno (opcional)
```bash
export RCLONE_REMOTE=gdrive
export GOOGLE_DRIVE_FOLDER_ID="<folder_id_de_google_drive>"
```

---

## Resultado esperado
- `loadRemote()` encuentra `gdrive` (desde `.config/rclone/rclone.conf` o `.rclone-config.json`).
- `execSync("rclone copy ...")` funciona con tu propio `client_id`.
- No hay `client_id` expuesto en `google-for-rclone.ts` ni en este repo.
