# /assurance:github-app-setup — protocol SSOT

Step-by-step guide for a startup founder to create their **own GitHub App** and
use it as the author of Heimdall's reviews (CodeRabbit / Greptile style). It does
not depend on the ChimeraNext App: each repo/org can have its own.

## Purpose

The `--post` of `/local-pr-review` posts reviews with `GITHUB_TOKEN` (signed as
`github-actions[bot]` or the user). With your own GitHub App, the review is
signed by **your App** (`<app-name>[bot]`), with its name and icon — just like
CodeRabbit or Greptile.

No private key is shared: each founder creates their own and stores it on their
machine (`~/.agents/.heimdall.env`).

## Prerequisites

- A GitHub org (for the org settings, recommended) or a personal account.
- The `heimdall-review` CLI installed (`shared/heimdall/`).
- Admin permissions in the org to create Apps (or on the account).

## Step 1 — Create the GitHub App in the ORG settings (not the personal one)

The correct settings are the **organization** ones (not the account's "Settings → Developer
settings"):

```
https://github.com/organizations/{organization-id}/settings/apps/new
```

If you don't have an org, the personal equivalent is:

```
https://github.com/settings/apps/new
```

Form fields:

| Field | What to put |
|---|---|
| **GitHub App name** | unique, e.g. `startup-review-bot` |
| **Homepage URL** | your startup's (or the repo) |
| **Webhook URL** | **empty for now** (only if you want automatic triggers) |
| **Webhook secret** | empty (same as above) |
| **Permissions** | `Pull requests: Read & write` (essential) + `Issues: Write` (to comment on the PR thread, which is an issue) + `Contents: Read-only` + `Metadata: Read-only` |
| **Where can this App be installed?** | *Any account* (to use it across all your repos) or *Only on this account* |

### What NOT to check

These options are for **user** OAuth and are **not** needed for Heimdall:

- ❌ **Expire user authorization tokens** — it is for user tokens + refresh; Heimdall uses installation tokens (machine-to-machine).
- ❌ **Request user authorization (OAuth) during installation** — makes installation ask for the user's identity; unnecessary.
- ❌ **Enable Device Flow** — OAuth flow for devices without a browser; irrelevant.

## Step 2 — Save the private key

1. After creating the App, GitHub gives you a **Private key** (the *Generate a private key* button).
   Download the `*.pem`.
2. Move it to `~/.agents/` and set owner-only permissions:

   ```bash
   mkdir -p ~/.agents
   mv ~/Downloads/startup-review-bot*.pem ~/.agents/heimdall-review.pem
   chmod 600 ~/.agents/heimdall-review.pem
   ```

## Step 3 — Register the App in the key-chain

Add to the `~/.agents/.heimdall.env` file (same file as the NIM key):

```
HEIMDALL_GITHUB_APP_ID=<your_app_id>
HEIMDALL_GITHUB_APP_KEY=~/.agents/heimdall-review.pem
```

- `<your_app_id>`: it is on the App's page (Settings → General → **App ID**).
- `HEIMDALL_GITHUB_APP_INSTALLATION_ID` is **optional**: if missing, Heimdall
  auto-detects it by `owner/repo`.

Precedence (same as the NIM key): `~/.agents` → repo `.heimdall.env` → env.

## Step 4 — Install the App on your repos

1. On the App's page, **Install App** → choose the org/account.
2. Select **All repositories** or an explicit list.
3. Confirm the installation.

### Verify the installation across multiple orgs

To audit which orgs already have the App installed (and which are missing), there
is a standalone script (example in `internal-org-gate`, but applies to any repo):

```bash
node scripts/check-heimdall-app-installs.mjs
# (optional) to compare against your orgs:
GH_TOKEN=... node scripts/check-heimdall-app-installs.mjs
```

The script reads the same key-chain credentials, lists the installations
(`GET /app/installations`) and, with `GH_TOKEN`, flags the missing orgs with the
direct link `https://github.com/apps/<app-name>`.

> Note: GitHub does **not** allow a GitHub App to install another automatically.
> Installation requires the admin UI flow (one click per org). This script only
> tells you **where** that click is missing.

## Step 5 — Verify

Dry-run first (prints, does not post):

```bash
heimdall-review pr <n> --github-app
```

If the App is well configured, the actual `--post` posts as the App:

```bash
heimdall-review pr <n> --post --github-app
```

The review will appear on the PR signed by `<app-name>[bot]`.

## Troubleshooting

| Symptom | Probable cause | Fix |
|---|---|---|
| `could not resolve NVIDIA_API_KEY` | The NIM key is missing (unrelated to the App) | `heimdall-review key:init` |
| `GitHub App not configured` | `HEIMDALL_GITHUB_APP_ID`/`KEY` missing from the key-chain | Step 3 |
| `403` when posting | The App is not installed on that repo, or `pull_requests: write` permission is missing | Step 4 + review Permissions |
| `404` on `/installation` | The App is not installed on `owner/repo` | Step 4 |
| `401` when generating the JWT | Incorrect private key or wrong App ID | Check the `.pem` and the App ID |
| The App does not appear as author | `--post` was used without `--github-app` (used `GITHUB_TOKEN`) | Add `--github-app` |

## Security

- The private key (`*.pem`) is **never** committed, printed, or shared. It lives only in `~/.agents/`.
- `~/.agents/.heimdall.env` must have mode `0600`.
- The App is created with the least privilege possible (`pull_requests: write` + `issues: write`, minimum to post the review and comment on the thread).
