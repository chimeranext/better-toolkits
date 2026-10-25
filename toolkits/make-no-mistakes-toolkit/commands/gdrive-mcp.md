---
description: List GDrive root folders via rclone using local .json (client_id/secret) + .rclone-config.json (gdrive); verify() first (read .json with --drive-client-id/secret), loadRemote() second (read .rclone-config.json); no embedded client_id; deprecated rclone config avoided.
argument-hint: "[optional: folder filter or remote name]"
priority: 70
---

# /gdrive-mcp — GDrive list (future-proof, no embedded client_id)

Mechanism (`gdrive-mcp.sh` wrapper + `.ts` `stdio`):
- `verify()` → `.config/google-workspace/google-oauth-client.json` (522 B, private `client_id` / `client_secret`); runs `rclone --drive-client-id ... --drive-client-secret ... ls gdrive:`.
- `loadRemote()` → `.config/google-workspace/.rclone-config.json` (`{"remote":"gdrive"}`); exclusive; never deprecated `rclone config`.
- `gdrive-mcp.sh` executes the mechanism with no hidden `2>/dev/null`; error visible.

Evidence:
- `.json` preserved (`~/.config/google-workspace/google-oauth-client.json`), `client_id` not in repo.
- `.rclone-config.json` (`gdrive`) confirmed (`line 28` `.ts`).
- `rclone ls gdrive:` `exit 0`; root folders visible (`Currículo/`, `Videos/`, `Editados/`, etc.).
- `opencode.list_mcp_resources [google-workspace-apps-mcp]` = `[]` — server operates independently.
