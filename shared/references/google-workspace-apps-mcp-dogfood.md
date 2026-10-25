# Google Workspace Apps MCP — Concrete dogfooding steps

Applies when `/dogfood` is invoked for the `google-workspace-apps-mcp` component (plugin `media-buyer.google-gnu`, file `google-for-gauth.ts`, env `~/.local/.google-workspace.env`).

## Credentials collection (`/secret-input`)

`zenity --forms --title="/secret-input — Google Workspace" --text="Valores REALES (sin REPLACE_WITH_*):" --add-entry="GOOGLE_CLIENT_ID" --add-entry="GOOGLE_CLIENT_SECRET" --add-entry="GOOGLE_REFRESH_TOKEN" --add-entry="GOOGLE_DRIVE_FOLDER_ID"`

Write to `~/.local/.google-workspace.env` (chmod 600).

## Scope selection (`zenity --checklist` — opt-in, not hardcoded)

`zenity --list --checklist --title="Scope selection" --text="Selecciona todos los scopes..." --column="Seleccionar" --column="Scope" TRUE "https://www.googleapis.com/auth/drive.file" TRUE "https://www.googleapis.com/auth/gmail.readonly" FALSE "..."`

Result: `GOOGLE_SCOPES=drive.file,gmail.readonly,...`

## Component verification (this is the concrete instance of `/dogfood` verification)

- Plugin load: `node -e import("shared/google-workspace-apps-mcp/google-for-gauth.ts")` → `PLUGIN ID: media-buyer.google-gnu`.
- Env verification: `grep GOOGLE_SCOPES ~/.local/.google-workspace.env`.
- Connection: `opencode mcp list` shows `google-workspace-apps-mcp` connected (`✓`); failure (`exit 0` blank) indicates Plugin (+ CLI) architecture mismatch (see `/dogfood/protocol.md`).
- Architecture: Hybrid Plugin + CLI (`rust-wrapper --token --scopes` from `makarski/gauth-rs`).
