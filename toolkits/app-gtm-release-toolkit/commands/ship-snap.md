---
description: "Guided Snap Store shipping for Linux desktop apps — author snapcraft.yaml, build via LXD/Multipass, register name on snapcraft.io, publish through edge/beta/candidate/stable channels, set visibility (public/unlisted/private). Persistent checkpoints across the lifecycle."
argument-hint: "[--what-if | --gate N | --resume | --channel edge|beta|candidate|stable]"
---

# /ship-snap — Ship to the Snap Store

You are the **app-gtm-release** orchestrator for the Snap Store target.

Your job is to guide the user through publishing a Linux desktop app to the Snap Store (snapcraft.io). Snap Store is Canonical's distribution channel; snaps are sandboxed, auto-updating Linux app packages.

This is a 2-4 hour active process for first releases (most time is in `snapcraft.yaml` authoring + first build). Automated review takes minutes for strict confinement, 1-2 weeks for classic. State persists to `./go-to-market/snap/`.

## Mode Detection

Check `$ARGUMENTS`:
- `--what-if` → Plan-only mode
- `--gate N` → Jump to gate
- `--resume` → Read `./go-to-market/snap/ship-plan.md`
- `--channel edge|beta|candidate|stable` → Default release channel for Gate 4

## Output Directory

```
./go-to-market/snap/
├── ship-plan.md
├── checkpoints.md
├── snapcraft.yaml             # Generated/edited config (also lives at project root)
├── build/
│   └── myapp_x.y.z_amd64.snap # Last built snap
├── store/
│   ├── registration.md        # Name + Ubuntu One account
│   ├── channel-state.md       # Which version is in which channel
│   └── visibility.md          # Public / unlisted / private decision log
└── notes/
    ├── gate-0-assessment.md
    ├── gate-1-yaml.md
    ├── gate-2-build.md
    ├── gate-3-register.md
    └── gate-4-publish.md
```

---

## GATE 0: ASSESSMENT

Ask **one question at a time**.

### Questions

1. **Project source path?** (must contain a buildable Linux desktop app)

2. **App framework?**
   - Flutter desktop (Linux build)
   - Electron
   - Tauri
   - Python (Tk / Qt / GTK)
   - Native C/C++ (GTK / Qt)
   - Go (Fyne, Wails, etc.)
   - Rust (egui, iced, etc.)
   - Java (JavaFX, Swing)
   - Other (describe)

3. **Snap name** (lowercase, alphanumeric + hyphens, ≤ 40 chars)?
   - Validates with regex; checks Snap Store availability
   - First-come-first-served; reservation lasts 30 days

4. **Confinement mode?**
   - **strict** (recommended): full sandbox, automatic review
   - **classic**: full system access, manual review (1-2 weeks)
   - **devmode**: dev testing only, can't release to stable
   - If user picks classic, ask for justification (Canonical requires it)

5. **Capabilities your app needs?** (multi-select, maps to plugs)
   - Read/write home directory (`home`)
   - Network outbound (`network`)
   - Listen on network ports (`network-bind`)
   - Display (`wayland`, `x11`, `desktop`)
   - Audio playback (`audio-playback`)
   - Audio recording (`audio-record`)
   - Camera (`camera`)
   - OpenGL (`opengl`)
   - Removable media (`removable-media`)
   - System files (specific paths) (`system-files`)
   - Other (describe)

6. **Base system?**
   - core24 (Ubuntu 24.04 LTS, recommended for new snaps)
   - core22 (Ubuntu 22.04 LTS)
   - core20 (Ubuntu 20.04 LTS, legacy)

7. **Visibility?**
   - **Public**: search-discoverable, installable by anyone (default)
   - **Unlisted**: not in search, but installable with exact name (good for soft launch)
   - **Private**: only allowed Ubuntu One accounts can install (good for internal/paid)

8. **Snap Store account status?**
   - Have Ubuntu One account → can register name
   - No account → create at https://snapcraft.io/account
   - Already have a registered snap on this account?

9. **Initial release channel?**
   - edge (default for first uploads)
   - beta
   - candidate
   - stable (only if you've tested heavily; cannot demote without removing first)

10. **CI/CD pipeline?**
    - Yes (GitHub Actions / GitLab CI / Codemagic)
    - No — manual `snapcraft upload` only
    - Defer to `app-gtm-release:cicd-setup` skill

### Save plan

Write `./go-to-market/snap/ship-plan.md`:

```markdown
# Snap Store Ship Plan — {date}

## Project
- Source: {path}
- Framework: {framework}

## Snap config
- Name: {value}
- Base: {core24|core22|core20}
- Confinement: {strict|classic|devmode}
- Plugs: {list}

## Visibility: {public|unlisted|private}

## Account
- Ubuntu One: {ready|need to create}
- Name registered: {yes|no}

## Initial channel: {edge|beta|candidate|stable}

## CI/CD: {yes|no|deferred}

## Timeline
- snapcraft.yaml authoring + first build: 1-2 hours
- Name registration: 5 minutes
- First publish: 30 minutes
- Automated review (strict): minutes; (classic): 1-2 weeks
```

### --what-if exit

Save plan, exit.

### Save checkpoint

```markdown
## Gate 0 — PASSED — {timestamp}
Name: {value} (registered: {yes|no})
Confinement: {value}
Next: Gate 1 — Author snapcraft.yaml
```

---

## GATE 1: AUTHOR `snapcraft.yaml`

Dispatch the `app-gtm-release:snap-build` skill for detailed templates.

### Steps

1. **Check existing config**:
   - Search for `snap/snapcraft.yaml` or `./snapcraft.yaml`
   - If exists: read and validate; skip generation
   - If missing: generate from template based on Gate 0 framework answer

2. **Generate snapcraft.yaml** using the framework-specific template from the `snap-build` skill:

   **Flutter desktop template:**
   ```yaml
   name: {snap-name}
   base: {core24|core22}
   version: '{x.y.z}'
   summary: {tagline ≤ 80 chars}
   description: |
     {multi-line description from user}

   grade: stable
   confinement: {strict|classic}

   apps:
     {snap-name}:
       command: {snap-name}
       extensions:
         - gnome
       plugs:
         {plugs from Gate 0}

   parts:
     {snap-name}:
       plugin: flutter
       source: .
       flutter-target: lib/main.dart
   ```

   **Electron template:**
   ```yaml
   parts:
     {snap-name}:
       plugin: nil
       source: .
       override-build: |
         cd $CRAFT_PART_SRC
         npm install
         npm run build:linux
         cp -r dist/linux-unpacked/* $CRAFT_PART_INSTALL/
       build-packages:
         - nodejs
         - npm
   ```

   **Tauri template:**
   ```yaml
   parts:
     {snap-name}:
       plugin: rust
       source: ./src-tauri
       build-packages:
         - libwebkit2gtk-4.1-dev
         - libssl-dev
   ```

   See the `snap-build` skill SKILL.md for templates for Python, Go, Rust, C/C++ (GTK/Qt), Java.

3. **Save to project**: `./snapcraft.yaml` (or `./snap/snapcraft.yaml` for cleaner project layout)

4. **Validate**:
   ```bash
   snapcraft validate
   ```
   Catches schema errors before build.

### Output

Write `./go-to-market/snap/notes/gate-1-yaml.md`:

```markdown
# snapcraft.yaml Authoring — {date}

## Generated from template: {framework}

## File location
- Path: {./snapcraft.yaml | ./snap/snapcraft.yaml}

## Key fields
- Name: {value}
- Base: {value}
- Confinement: {value}
- Plugs: {list}
- Plugin: {flutter|electron|nil|...}

## Validation
- snapcraft validate: {pass|fail}
- Issues: {list}
```

### Gate condition

**PASS** if `snapcraft validate` succeeds and all required fields are populated.
**FAIL** if validation reports schema errors. Print errors, link to `snap-build` skill troubleshooting.

### Save checkpoint

```markdown
## Gate 1 — {PASSED|FAILED} — {timestamp}
File: {path}
Next: Gate 2 — Local build
```

---

## GATE 2: LOCAL BUILD

### Prerequisites check

Verify host has snapcraft + LXD (Ubuntu) or Multipass (other Linux/macOS):

```bash
snap list | grep snapcraft || sudo snap install snapcraft --classic
snap list | grep lxd || sudo snap install lxd && sudo lxd init --auto
```

If user is on macOS/Windows: install Multipass instead. Note: Snap building on non-Ubuntu hosts is slower (VM overhead).

### Build

```bash
cd {project root}
snapcraft
```

Build can take 5-30 minutes for first build (LXD container provisioning + dependency install). Subsequent builds are faster (cached).

### Output

Built snap appears in project root: `{snap-name}_{version}_{arch}.snap` (typically amd64).

Move to managed location:
```bash
mv ./{snap-name}_*.snap ./go-to-market/snap/build/
```

### Local install + smoke test

```bash
sudo snap install --dangerous ./go-to-market/snap/build/{snap-name}_*.snap
# --dangerous required because snap is unsigned at this stage

# Run app
{snap-name}

# Inspect connected interfaces
snap connections {snap-name}

# Connect any auto-deny plugs the user needs
sudo snap connect {snap-name}:{plug-name}

# Uninstall after test
sudo snap remove {snap-name}
```

### Output

Write `./go-to-market/snap/notes/gate-2-build.md`:

```markdown
# Local Build — {date}

## Build command
```bash
snapcraft
```

## Output
- File: ./go-to-market/snap/build/{filename}.snap
- Size: {MB}
- Architecture: {amd64|arm64|i386|all}

## Local test
- Install: {pass|fail}
- Launch: {pass|fail}
- Smoke test: {pass|fail}
- Plug connections: {list connected vs needed}
- Uninstall clean: {pass|fail}

## Issues
- ...
```

### Gate condition

**PASS** if build succeeds, install succeeds, app launches, smoke test passes.
**FAIL** otherwise. Most common: missing dependencies (add to `parts.{snap-name}.build-packages` and `stage-packages`).

### Save checkpoint

```markdown
## Gate 2 — {PASSED|FAILED} — {timestamp}
Built: {filename}
Smoke test: {pass|fail}
Next: Gate 3 — Snap Store registration
```

---

## GATE 3: SNAP STORE REGISTRATION

### Steps

1. **Login to snapcraft**:
   ```bash
   snapcraft login
   ```
   Opens browser for Ubuntu One auth. After login, credentials saved locally.

2. **Register the name**:
   ```bash
   snapcraft register {snap-name}
   ```
   - First-come-first-served
   - 30-day reservation; must publish a snap within that window
   - If already registered: skip this step

3. **Capture metadata**:
   - Owner account: `snapcraft whoami`
   - Listing URL: `https://snapcraft.io/{snap-name}`

4. **Configure store metadata** (via Snap Store dashboard at `https://snapcraft.io/{snap-name}/listing`):
   - Title (often matches name with prettier capitalization)
   - Categories: 1-3 (Development, Productivity, Utilities, Games, etc.)
   - License (SPDX identifier or custom)
   - Contact (email or website)
   - Donation links (optional)
   - Issue tracker URL
   - Source code URL
   - Description (Markdown supported, ≤ 4096 chars)
   - Screenshots: at least 1, max 5. PNG/JPEG, recommended 1920×1080
   - Banner icon: 480×480 PNG (high res for store listing)
   - Smaller icon: 256×256 PNG

   Save metadata copies to `./go-to-market/snap/store/registration.md`.

5. **Set visibility** (per Gate 0 answer):
   - Public: default
   - Unlisted: dashboard → Settings → "Public/Private" → toggle to Unlisted
   - Private: dashboard → Settings → toggle to Private + add allowed accounts under "Members"

### Output

Write `./go-to-market/snap/notes/gate-3-register.md`:

```markdown
# Snap Store Registration — {date}

## Account
- Ubuntu One: {username}
- Logged in via snapcraft CLI: yes

## Name registration
- Registered: {date}
- Expires (if not published): {date+30}
- URL: https://snapcraft.io/{snap-name}

## Metadata
- Title: {value}
- Categories: {list}
- License: {SPDX or custom}
- Source URL: {url}
- Issues URL: {url}
- Description: {first line}
- Screenshots: {N}
- Icons: 480x480 + 256x256

## Visibility: {public|unlisted|private}
{If private: allowed accounts: {list}}
```

### Gate condition

**PASS** if name registered, metadata fields populated, visibility set.
**FAIL** if name unavailable (suggest variants), Ubuntu One account missing.

### Save checkpoint

```markdown
## Gate 3 — {PASSED|FAILED} — {timestamp}
Name: {value}
Visibility: {value}
Next: Gate 4 — Publish to channel
```

---

## GATE 4: PUBLISH TO CHANNEL

### Steps

1. **Determine channel** (per Gate 0 + `--channel` flag if passed):
   - First release: usually edge (test) or beta (limited rollout)
   - Subsequent releases: walk through channels as quality matures

2. **Upload + release**:
   ```bash
   cd {project root}
   snapcraft upload --release={channel} ./go-to-market/snap/build/{snap-name}_*.snap
   ```

3. **Wait for review**:
   - Strict confinement: automated review (1-30 minutes)
   - Classic confinement: manual review by Canonical (1-2 weeks)
   - Status visible at https://snapcraft.io/{snap-name}/releases

4. **Verify install** (after review passes):
   ```bash
   sudo snap install {snap-name} --channel={channel}
   ```
   On a clean Linux machine. Confirm app installs, runs, basic features work.

5. **Promote later** (after validation):
   ```bash
   # Move version 1.0.0 from edge to beta
   snapcraft promote {snap-name} --from-channel=edge/stable --to-channel=beta/stable

   # Or release a new version directly to a channel
   snapcraft upload --release=beta {snap-name}_1.0.1_amd64.snap
   ```

### CI/CD setup (optional, recommended for ongoing maintenance)

Generate a Snap Store auth token:
```bash
snapcraft export-login --snaps {snap-name} --channels edge,beta,candidate,stable -
```
Save the base64 blob as `SNAPCRAFT_TOKEN` secret in GitHub/GitLab/Codemagic.

GitHub Actions example:
```yaml
- uses: snapcore/action-build@v1
  id: build
- uses: snapcore/action-publish@v1
  with:
    store_login: ${{ secrets.SNAPCRAFT_TOKEN }}
    snap: ${{ steps.build.outputs.snap }}
    release: edge
```

### Output

Append to `./go-to-market/snap/store/channel-state.md`:

```markdown
## Release #{n} — {date}

### Channel: {edge|beta|candidate|stable}

### Version: {x.y.z}

### Status
- Uploaded: {timestamp}
- Review: {automated pass|manual pending|pass|reject reason}
- Released: {timestamp|TBD}
- Snap Store URL: https://snapcraft.io/{snap-name}

### Install command
```bash
sudo snap install {snap-name} --channel={channel}
```

### Notes
{anything notable}
```

### Gate condition

**PASS** when uploaded successfully and review either passes (strict) or is queued (classic).
**FAIL** if review rejects (capture reason; often capability mismatch — fix snapcraft.yaml + rebuild + re-upload).

### Save checkpoint

```markdown
## Gate 4 — {PASSED|TRACKING} — {timestamp}
Channel: {value}
Version: {value}
Review: {pass|pending|reject}
Next: monitor + plan next release
```

---

## Post-Publish

After Gate 4:

1. **Monitor adoption**: Snap Store dashboard → Insights → Usage. Track installs, refresh rates, country breakdown.
2. **Track issues**: connect to your issue tracker; Snap Store doesn't have built-in reviews/ratings (yet).
3. **Plan next release**: increment version, build, upload, optionally promote.
4. **Watch for new base releases**: when a new core base ships (e.g., core26 in 2026), plan migration. Old bases are supported for years but security updates eventually stop.

Print final summary:

```markdown
Snap Store publish complete.

- Snap name: {value}
- Channel: {value}
- Version: {value}
- Visibility: {value}
- Snap Store URL: https://snapcraft.io/{snap-name}

State saved to: ./go-to-market/snap/

Install command for users: sudo snap install {snap-name} {--channel=X if not stable}
```

---

## Edge cases

- **Classic confinement rejected**: Canonical's review is strict. Justification must explain why strict + plugs cannot work. Common acceptances: IDEs, language compilers, system administration tools. Common rejections: "I want full access for convenience" (use plugs).
- **Snap is too large** (> 200MB and bloating dependencies): use the `prime` step to exclude unneeded files. Review `stage-packages` — many transitive dependencies sneak in.
- **Snap won't connect to D-Bus / desktop services**: missing the `desktop` or `desktop-legacy` plug, or the `gnome` extension under `extensions:`. The extension auto-handles common GUI requirements.
- **Multi-architecture** (amd64 + arm64 + i386): build separately on each host, or use `snapcraft remote-build` to build on Launchpad's infrastructure (free). Each architecture uploads as a separate snap revision; users get the right one for their platform.
- **Branch tracks** (parallel release lines for major versions): use `2.x/stable` and `3.x/stable` channel names. Useful when supporting LTS users alongside latest.
