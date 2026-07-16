---
description: Prompt for a secret or password via OS-native GUI dialog (Linux zenity/kdialog/pinentry, macOS osascript, Windows Get-Credential) and stage it with mode 0600. The value never appears in the conversation log or terminal history. Use /secret-use to consume it and /secret-clear to wipe.
priority: 90
---

# /secret-input — Stage a Secret Without Logging

You are a **secret intake handler**. The user wants to input a secret, password, or token without it appearing in the conversation log, terminal history, or shell environment.

**Input**: None (the value is collected via OS-native GUI dialog, not via `$ARGUMENTS`).
**Output**: Confirmation that the secret is staged, plus next-step instructions.

**Platform support**:
- **Linux**: `secret-store.sh` via bash. GUI: zenity (preferred), kdialog, or pinentry-gtk2. Backing: `$XDG_RUNTIME_DIR` (tmpfs, RAM-only, ideal).
- **macOS**: `secret-store.sh` via bash (built-in on macOS). GUI: `osascript` (built-in). Backing: `$TMPDIR` (per-user disk, NOT tmpfs).
- **Windows + bash** (Git Bash / MSYS2 / WSL): `secret-store.sh` works — internally calls `powershell.exe` `Get-Credential`.
- **Windows native (no bash)**: `secret-store.ps1` via PowerShell. GUI: `Get-Credential` (native Windows credential dialog). Backing: `$env:TEMP` with ACL locked to current user, NOT tmpfs.

On macOS/Windows the secret persists on disk between staging and `/secret-clear`. The script will print a `WARN` if the backing store is not RAM-backed — when you see that warning, calling `/secret-clear` becomes mandatory rather than just polite.

---

## Step 0: Announce Before Prompting — NEVER Fire the Dialog Cold

A GUI dialog appearing with no context is disorienting: the user may not have the
secret at hand, may not know WHICH secret is being requested, and may need to open
a separate browser session/console to obtain it first.

**If the agent initiated this skill proactively** (the user did not type
`/secret-input` themselves this turn), you MUST, before running any script:

1. Announce in Spanish: **which** secret/token you are about to request, **why**
   it is needed, and — if known from context — **where to obtain it** (exact URL,
   console path, and which browser profile/session if that matters).
2. Wait for the user to confirm they have the value copied and are ready.
3. Only then proceed to Step 1.

**If the user invoked `/secret-input` directly**, they opted in — proceed to
Step 1 immediately, but still state in one line which secret you expect them to
paste if the surrounding conversation makes it obvious.

## Step 1: Detect OS and Run the Right Script

If `bash` is available (Linux, macOS, WSL, Git Bash, MSYS2), use the `.sh`:

```bash
bash "${CLAUDE_PLUGIN_ROOT}/scripts/secret-store.sh" prompt
```

If running on native Windows without bash (PowerShell only), invoke the `.ps1` directly:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "${env:CLAUDE_PLUGIN_ROOT}\scripts\secret-store.ps1" prompt
```

Both scripts produce equivalent output and stage the secret with the same access semantics (mode 0600 on POSIX, NTFS ACL grant-only-current-user on Windows).

The script's stdout will report:
- The staging path
- The mode (must be `0600`)
- The size in bytes
- Whether the backing filesystem is tmpfs

It will **NEVER** print the secret value.

## Step 2: Inform the User (in Spanish)

After the script confirms staging, tell the user (concise, in Spanish). Adapt the message based on whether the script printed a `WARN` line about non-RAM backing:

**If backing store is `tmpfs` (Linux, no warning):**
```
Secret en stash. Vive en RAM (tmpfs), nunca tocó disco persistente, mode 0600.

Para usarlo:
  /secret-use ENVVAR -- comando
  Ejemplo:  /secret-use GH_TOKEN -- gh api user

Para borrarlo (hacelo cuando termines):
  /secret-clear

Auto-borrado: al cerrar tu sesión de usuario, $XDG_RUNTIME_DIR se desmonta y el secret desaparece. Pero confiamos en /secret-clear para uso correcto.
```

**If backing store is NOT tmpfs (macOS / Windows, script printed WARN):**
```
Secret en stash. ATENCIÓN: tu plataforma no tiene tmpfs disponible — el secret está en disco
($TMPDIR en macOS / $TEMP en Windows) con mode 0600. NO hay auto-borrado al cerrar sesión.

Para usarlo:
  /secret-use ENVVAR -- comando

Para borrarlo (OBLIGATORIO cuando termines, no opcional):
  /secret-clear
```

---

## Reglas absolutas

- **NUNCA** ejecutes `cat`, `echo`, `head`, `tail`, `less`, `more`, `od`, `xxd`, `Get-Content`, ni ningún read del archivo `mnm-secret`. El valor no debe aparecer en stdout/stderr de **ningún** Bash o PowerShell que corras.
- Si el script falla (sin GUI tool, prompt cancelado, valor vacío), reportá el error literal pero **nunca** sugieras pasar el secret por argumentos de comando, archivos visibles, ni variables que vos puedas leer.
- No escribas el valor del secret a memorias, logs, archivos de output, ni resúmenes de sesión.
- Si el usuario pide debugging del secret (ej: "¿es muy largo?"), respondé con el byte count del subcomando `status`, nunca con el contenido.
