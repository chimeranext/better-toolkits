---
name: github-app-setup
description: >
  Teaches the founder to create their own GitHub App (from the organization settings) so that
  the /local-pr-review posts reviews signed as that App (CodeRabbit/Greptile style). Use when the user asks for
  "github app setup", "crear mi GitHub App", "setear github app", "github app para PR review",
  "que el bot postee el review", "/assurance:github-app-setup", or wants the review posted by their own bot.
---

# github-app-setup — create your own GitHub App for Heimdall

Read and follow [`references/github-app-setup/protocol.md`](../../references/github-app-setup/protocol.md) (protocol SSOT).

## What it achieves

When you choose `--post --github-app` in `/local-pr-review`, the review **posts as your GitHub App**
(`<app-name>[bot]`), not as `github-actions[bot]` nor as your user. It is the same
model as CodeRabbit / Greptile, but with your own App and 100% local.

It does not depend on the ChimeraNext App: each founder creates their own.

## Step summary (details in the protocol)

1. **Create the App in the ORG settings**:
   `https://github.com/organizations/{organization-id}/settings/apps/new`

   - Permissions: `Pull requests: Read & write` + `Issues: Write` (to comment on the PR thread) + `Contents: Read-only` + `Metadata: Read-only`.
   - Do **not** check `Expire user authorization tokens`, `Request user authorization (OAuth)`,
     or `Enable Device Flow` (they are user OAuth; Heimdall uses installation tokens).

2. **Generate and save the private key**: `~/.agents/heimdall-review.pem` (mode 0600).

3. **Register in `~/.agents/.heimdall.env`**:
   ```
   HEIMDALL_GITHUB_APP_ID=<app_id>
   HEIMDALL_GITHUB_APP_KEY=~/.agents/heimdall-review.pem
   ```

4. **Install the App** in your org and select the repos.

5. **Verify** (dry-run first):
   ```bash
   heimdall-review pr <n> --github-app
   heimdall-review pr <n> --post --github-app
   ```

## Manifest template

`references/github-app-setup/github-app-manifest.json` — reusable for creating the App.

## Verify installation across multiple orgs

If the App will be installed across multiple organizations, use the standalone verification
script (real example in `chimeranext/internal-org-gate` → `scripts/check-heimdall-app-installs.mjs`):

```bash
GH_TOKEN=... node scripts/check-heimdall-app-installs.mjs
```

Lists the orgs with the App installed vs. the missing ones. GitHub does not allow one
App to install another automatically: this script only tells you where the admin's manual
click is missing.

## Launch the command

Use `/assurance:github-app-setup` to run this guide interactively with the founder.
