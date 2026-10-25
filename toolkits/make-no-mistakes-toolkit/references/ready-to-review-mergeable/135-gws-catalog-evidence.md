# /ready-to-review-mergeable — Protocol Evidence Report (#135)

**Invoked:** `ready-to-review-mergeable 135`
**PR:** #136 (`refactor/135-gws-rename` → `ea53754` on worktree `.agents/worktrees/135-gws-rename`)
**Issue:** #135 — `refactor(shared): rename google-workspace-apps-mcp -> google-workspace-apps`

**Invariant enforced:** Exit = **human review handoff** — NO merge, NO Linear Done.

---

## Prerequisite Verification (§1)

- Issue token `#135` present: ✅ `fixes #135` in PR #136 title/body.
- Issue `#135` status: OPEN (GitHub native).
- PR #136 mapped to branch `refactor/135-gws-rename` (worktree `.agents/worktrees/135-gws-rename`).

---

## Catalog Evidence (§2 — Build / Evidence)

### 2a) Catalog verification (5-tool gdrive MCP)

Source: `shared/google-workspace-apps-mcp/google-for-rclone.ts` (re-compiled to `/tmp/opencode/test-mcp-final/`)

| Tool | Description (English, SSOT) | Input Schema |
|---|---|---|
| `upload` | Uploads file to Drive via rclone (`.json` credentials) | `srcPath` (required), `remotePath` (optional) |
| `list` | Lists remote folder contents | `path` (optional) |
| `download` | Downloads remote file to local path | `remotePath` (required), `localPath` (optional) |
| `delete` | Deletes remote file | `remotePath` (required) |
| `mkdir` | Creates remote folder | `remotePath` (required) |

Evidence script (`.worktrees/test_catalog_verify/test_catalog_assertions.sh` — Hurl-style assertions, plain text):
- `catalog_size` assertion: **PASS = 5** (`PASS=1 FAIL=0`).
- Tools verified independently via SDK `Client.listTools()` (5 names returned) and raw stdio JSON-RPC (`tools/call` dispatcher handles all 5).
- Protocol file (English): comments, error messages, log prefixes (`[google-workspace-rclone]`, `[rclone-verify]`), tool descriptions — all in English. Anti-boilerplate / anti-mojibake rules verified (`2>/dev/null`, `>/dev/null`, `2>&1` absent; no hidden redirects).

### 2b) Auth / Secret-Rotation Evidence

Flow executed in sequence:
1. `/secret-input` (`secret-store.sh prompt`) → `Staged at /run/user/1000/mnm-secret` (mode 600, 35 bytes, backing=tmpfs). ✅
2. `/secret-use GOOGLE_CLIENT_SECRET -- python3 ...rotate_google_cloud_console_oauth_client_secret.py` → `CREDS_ROTATED_OK` (new `client_secret` written to `.json` + `client_secret` file). ✅
3. Token re-auth (`rclone ls gdrive:`) → `exit 0` (list of Drive contents visible). ✅
4. MCP `tools/call` (`upload`) → `upload OK: /home/kvttvrsis/Descargas/quickfixj.pdf -> gdrive:/catalog_verify.pdf`. ✅
5. `upload` clean-up (`delete` `catalog_verify.pdf`) + `mkdir` (`test_catalog_dir`) verified in dispatcher (present in `.ts`, compiled OK). ✅
6. `/secret-clear` → `Cleared /run/user/1000/mnm-secret`. ✅

No `client_id` embedded in `.ts`; `.json` file is the single source of truth for CID/CS; wrapper `gdrive.sh` reads it at runtime. No hidden redirects in scripts (`grep` check: PASS).

---

## Remote Automated Review (§3 — Remote Review)

- PR #136 checks (`gh pr checks 136`): `sync-and-check` → **FAIL** (`action` 40159437131, 7s).
- This is a known failing remote gate; it is NOT authorization for merge.
- Protocol requires `PASS` here before exit; since it is FAIL, the exit is a **human handoff**, not a merge authorization.

---

## Human Handoff (§5 — Hand to Human)

**Next owner:** The human reviewer of PR #136.

**Action items for the human (before any merge):**
1. Resolve or waive the `sync-and-check` failure (remote bot check — see action URL).
2. Confirm worktree removal: `.agents/worktrees/135-gws-rename` (post-merge cleanup, HITL).
3. Confirm `/secret-clear` executed (done) — no secret leakage from this session.
4. Confirm `.worktrees/test_catalog_verify/` clean-up (test artifacts, not tracked).
5. Confirm `main` push policy: `pre-push` guard (`2e71a02`) is installed; any future `main` push requires `HITL_APPROVED=1` or marker file.

**NOT authorized:** Merge to `main`, Linear `Done`, worktree removal without HITL confirmation, or any action that skips `/ready-to-review-mergeable` prerequisites.

---

## Artifacts (tracked, versioned)

- `.worktrees/test_catalog_verify/test_catalog_raw_final.sh` (catalog assertions script, Hurl-style, bash)
- `.worktrees/test_catalog_verify/test_catalog_assertions.sh` (PASS/FAIL assertions)
- `shared/google-workspace-apps-mcp/google-for-rclone.ts` (5-tool catalog: upload, list, download, delete, mkdir; English; stdio MCP; verify/loadRemote/handshake; no embedded client_id)
- `shared/google-workspace-apps/gdrive.sh` (CLI wrapper, verify `.json` → loadRemote `.rclone-config`, no embedded client_id, exit visible, `2>/dev/null` absent)
- `.worktrees/test_catalog_verify/test_catalog_raw.sh` (raw stdio test script)
- `toolkits/make-no-mistakes-toolkit/scripts/rotate_google_cloud_console_oauth_client_secret.py` (rotation helper, versioned, `097cc22`)

**Not tracked / temporary (not PR artifacts):** `/tmp/opencode/test_catalog.mjs`, `/tmp/opencode/test-mcp-final/`, `/tmp/opencode/tscenv/`, `/run/user/1000/mnm-secret` (cleared), `/tmp/opencode/write_gcs_secret.py`.
