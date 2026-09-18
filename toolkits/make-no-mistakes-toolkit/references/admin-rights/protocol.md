# /admin-rights — protocol SSOT

Harness-agnostic body. Thin entry: `commands/admin-rights.md`.

---

# /admin-rights — run one command with admin rights, via the OS-native auth dialog

You are an **elevation operator**. The task needs root/Administrator for one
command, and the human authenticates **in the OS dialog, never on your stdin
and never as an argument you pass**. You detect the platform, warm up the auth
path with a no-op, show the exact elevated command, get confirmation, run it,
and report the exit code plus what changed.

**Input**: the command to elevate, as `$ARGUMENTS` — `/admin-rights apt-get
install -y htop`. `$ARGUMENTS` equal to `--check` means warmup-only: trigger
the dialog with a no-op and stop.

**Output**: platform + mechanism used, the exact elevated command, its exit
code, and its output (logged, never discarded).

## Mechanism per platform

Detect first, announce, then act. `uname -s` → `Linux` / `Darwin`; on Windows
`$OS` is `Windows_NT` (PowerShell: `$IsWindows`).

| Platform | Mechanism (shows on-screen dialog) | Verified / source |
|---|---|---|
| Ubuntu / Linux desktop | `pkexec <cmd> [args]` — polkit auth dialog via the session agent | `pkexec` v124 present at `/usr/bin/pkexec` on Ubuntu 24.04+ |
| macOS | `/usr/bin/osascript -e 'do shell script "<cmd>" with administrator privileges'` — native Authorization Services dialog | Apple `do shell script` + administrator-privileges behavior; real-world TUI usage (osascript preferred over terminal-stdin sudo) |
| Windows 10/11 (UAC) | `Start-Process -Verb RunAs` — UAC consent (admin) / credential (standard user) prompt on the secure desktop | CMD/START/RUNAS cannot elevate; `-Verb RunAs` is the built-in path |

### Linux detail

```bash
pkexec apt-get install -y htop
```

- Needs a polkit authentication agent (GNOME/KDE/Wayland session). Headless or
  plain SSH with no agent fails instead of prompting — fall back to
  `sudo -v` (terminal password) only when the human explicitly accepts it.
- Environment is sanitized (`HOME` becomes `/root`). Resolve usernames and
  paths **before** elevating; pass absolute paths.

### macOS detail

```bash
/usr/bin/osascript -e 'do shell script "chown -R leon:staff /usr/local/share/app" with administrator privileges'
```

- Escape for the AppleScript double-quoted string: backslashes first, then
  double quotes. Prefer single-quoted shell segments inside.
- The command runs as **root**: `whoami` inside returns `root`, so resolve the
  real username (`$USER`, captured pre-elevation) before building the command.
- Authorization is cached for a few minutes; each fresh session may prompt
  again. User-cancel surfaces as error `-128` ("User canceled") — report it as
  a refusal, not a failure.
- Requires a GUI session; fails over plain SSH with no user session.

### Windows detail (UAC)

```powershell
Start-Process powershell -Verb RunAs -WorkingDirectory 'C:\repo' -ArgumentList '-NoProfile','-ExecutionPolicy','Bypass','-Command','<command>'
```

- The UAC prompt appears on the **secure desktop** (screen dims); the human
  clicks Yes (admin, consent) or types admin credentials (standard user,
  credential prompt).
- An elevated process gets a different environment: working directory resets,
  `TEMP` changes, mapped drives disconnect. Always pass absolute paths and an
  explicit `-WorkingDirectory`.
- `runas /user:` is **not** equivalent: console password prompt, no UAC
  dialog. Third-party `gsudo <cmd>` is acceptable when already installed, but
  never install it as a side effect of this command.

## Protocol

1. **Detect and announce.** `uname -s` (or `$OS` / `$IsWindows`). State the
   mechanism you will use. If the mechanism binary is missing (`pkexec`,
   `osascript`, `powershell`), report `UNAVAILABLE` with the fallback — never
   improvise a second mechanism silently.
2. **Warm up.** Trigger the dialog with a no-op *before* the real work, so the
   human authenticates once, up front:
   - Linux: `pkexec true` (or `sudo -v` for the terminal fallback)
   - macOS: `/usr/bin/osascript -e 'do shell script "/usr/bin/true" with administrator privileges'`
   - Windows: elevate a `whoami /groups` probe so the consent result is visible
3. **Show the exact elevated command and get confirmation.** One confirmation
   covers that run. `--check` stops here with the warmup result.
4. **Run it, logging everything.** Capture stdout+stderr to the transcript or
   `tee` a log file. No stream is discarded — a failed elevation and a
   no-op must never look alike (repo stderr doctrine).
5. **Report exit code + effect.** What the command changed, in the user's
   words, plus the raw exit code. Non-zero → quote the failing output, do not
   paraphrase it away.

## What this command does not do

- **It does not take passwords.** No `password` / `-p` parameter exists. If a
  mechanism variant asks for credentials as text, use the dialog variant.
- **It does not persist elevation.** No `sudo -s` shells, no credential
  caching beyond what the OS does itself, no `NOPASSWD` edits, no UAC slider
  changes.
- **It does not chain.** One elevated command per run. A second privileged
  step is a second `/admin-rights` invocation with its own confirmation.
- **It does not install helpers** (`gsudo`, polkit rules, AppleScript apps) as
  a side effect. Missing mechanism → `UNAVAILABLE`, human decides.
- **It does not run headless elevation blind.** No agent / no GUI session →
  say so and stop, unless the human explicitly opts into the terminal
  (`sudo -v`) fallback.

## Requirements

- Linux: `pkexec` + a polkit authentication agent in the session.
- macOS: `/usr/bin/osascript` + a GUI user session.
- Windows: PowerShell 5.1+ / 7+ with UAC enabled (default).

## Related

- [`/disk-cleanup`](../disk-cleanup/protocol.md) — same thin-entry/SSOT shape; some of its stages (docker, system paths) are typical `/admin-rights` payloads
- [`/secret-input`](../../commands/secret-input.md) — when the payload needs a secret, it arrives via secret tooling, never pasted into the elevated command line
