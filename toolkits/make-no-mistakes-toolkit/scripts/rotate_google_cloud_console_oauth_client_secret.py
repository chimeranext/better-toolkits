#!/usr/bin/env python3
"""Rotate the Google Cloud Console OAuth client secret and persist it locally.

Reads the staged secret via env var GOOGLE_CLIENT_SECRET (staged with
toolkits/make-no-mistakes-toolkit/scripts/secret-store.sh via /secret-input,
consumed with /secret-use) and writes it into the local Google Workspace
credential files used by the google-for-rclone MCP + gdrive.sh wrapper:

  - ~/.config/google-workspace/google-oauth-client.json  -> installed.client_secret
  - ~/.config/google-workspace/client_secret              -> plain secret

This is the credential-rotation half of the google-workspace-apps flow: when
the OAuth client secret expires/rotates (client_id stays the same), the operator
re-stages the new secret and runs this script, then re-authenticates the rclone
token (rclone reuses the refresh token when the client_id is unchanged).

The secret value is never printed; only status output goes to stdout.
"""

import json
import os
import pathlib

ENV_VAR = "GOOGLE_CLIENT_SECRET"
BASE = pathlib.Path.home() / ".config" / "google-workspace"


def main() -> int:
    sec = os.environ.get(ENV_VAR, "")
    if not sec:
        print("EMPTY_SECRET")
        return 1
    jpath = BASE / "google-oauth-client.json"
    data = json.loads(jpath.read_text())
    inst = data.get("installed", data)
    inst["client_secret"] = sec
    jpath.write_text(json.dumps(data, indent=4))
    (BASE / "client_secret").write_text(sec)
    print("CREDS_ROTATED_OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
