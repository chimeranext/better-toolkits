---
description: >
  Interactive guide for the founder to create their OWN GitHub App (org settings)
  and use it as the author of Heimdall's reviews (CodeRabbit/Greptile style).
  Does not depend on the ChimeraNext App. Guide + manifest + key-chain + verification.
priority: 40
---
# /assurance:github-app-setup

Read and follow [`references/github-app-setup/protocol.md`](../references/github-app-setup/protocol.md) (protocol SSOT).

## What it produces

1. **Create the GitHub App** in the org settings:
   `https://github.com/organizations/{organization-id}/settings/apps/new`
   - Permissions: `pull_requests: write` + `issues: write` (to comment on the PR thread) + `contents: read` + `metadata: read`.
   - Omit the user OAuth options (device flow, user authorization, expire tokens).
2. **Save the private key** in `~/.agents/heimdall-review.pem` (mode 0600).
3. **Register** in `~/.agents/.heimdall.env`:
   ```
   HEIMDALL_GITHUB_APP_ID=<app_id>
   HEIMDALL_GITHUB_APP_KEY=~/.agents/heimdall-review.pem
   ```
4. **Install** the App in the org and select the repos.
5. **Verify** with dry-run then `--post --github-app`.

To audit multiple orgs, use the standalone verification script
(`chimeranext/internal-org-gate` → `scripts/check-heimdall-app-installs.mjs`):

```bash
GH_TOKEN=... node scripts/check-heimdall-app-installs.mjs
```

## Manifest template

`references/github-app-setup/github-app-manifest.json` — reusable.

## How it looks when working

```bash
heimdall-review pr <n> --post --github-app
```
The review appears on the PR signed by `<app-name>[bot]`.

> This command ONLY guides and verifies. It does not create the App for you (requires GitHub UI
> and the private key). It resolves doubts (what to check/omit, permissions, troubleshooting) step by step.
