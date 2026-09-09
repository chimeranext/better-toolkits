# /ship-flatpak — protocol SSOT

Harness-agnostic body. Thin entry: `commands/ship-flatpak.md`.

---

# /ship-flatpak — Ship to Flathub

You are the **app-gtm-release** orchestrator for the Flathub target.

Your job is to guide the user through publishing a Linux desktop app to Flathub. Flatpak is the underlying tech: a `flatpak-builder` YAML manifest builds the app into a sandboxed install, and submission to Flathub is a GitHub PR to `flathub/flathub`.

This is a 3-6 hour active process for first releases (most time is in manifest authoring + first build). Human review by Flathub maintainers takes 1-4 weeks. State persists to `./go-to-market/flatpak/`.

Dispatch the `app-gtm-release:flatpak-build` skill for the hands-on templates and verified toolchain — this protocol is the lifecycle/gates wrapper.

## Mode Detection

Check `$ARGUMENTS`:
- `--what-if` → Plan-only mode
- `--gate N` → Jump to gate
- `--resume` → Read `./go-to-market/flatpak/ship-plan.md`

## Output Directory

```
./go-to-market/flatpak/
├── ship-plan.md
├── checkpoints.md
├── manifest.yml               # flatpak-builder manifest (also lives at build-aux/)
├── build-aux/                 # manifest + node-sources/cargo-vendor refs
├── sources/
│   ├── node-sources.json
│   └── cargo-vendor/          # cargo vendor output
├── build/                     # flatpak-builder build dir
└── notes/
    ├── gate-0-assessment.md
    ├── gate-1-manifest.md
    ├── gate-2-build.md
    ├── gate-3-metadata.md
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
   - Tauri (Rust + webview)
   - Python (Tk / Qt / GTK)
   - Native C/C++ (GTK / Qt)
   - Go (Fyne, Wails)
   - Rust (egui, iced)
   - Java (JavaFX, Swing)
   - Other (describe)

3. **App ID** (reverse-DNS, e.g. `io.example.MyApp`)?
   - Must be unique; check it isn't taken on Flathub.

4. **Does the app need network + external data? Does it write to home dir?** (drives `finish-args`)
   - Network outbound? (`--share=network`)
   - Wayland/X11, audio, GPU?
   - Read/write `$HOME`? (justify — reviewers dislike broad access)

5. **Frontend dependency manager** (drives `flatpak-node-generator`):
   - npm (`package-lock.json`)
   - pnpm (`pnpm-lock.yaml`)
   - yarn (`yarn.lock`)
   - None / native only

6. **Rust/cargo workspace?**
   - Yes → plan `cargo vendor` for offline sources
   - No → skip cargo sources

7. **Icon source?** (reuse one 1024×1024 RGBA PNG source of truth)

8. **CI/CD pipeline?**
   - Yes (GitHub Actions flathub build)
   - No — manual `flatpak-builder` only

9. **Also shipping to Snap Store?** → recommend (pair). If yes, stop here after plan and point to `/ship-snap` too (or run `/ship-everywhere`).

### Save plan

Write `./go-to-market/flatpak/ship-plan.md`:
```markdown
# Flathub Ship Plan — {date}

## Project
- Source: {path}
- Framework: {framework}

## Manifest
- App ID: {app-id}
- Runtime: org.gnome.Platform//{version}
- finish-args: {list}

## Sources
- Frontend lockfile: {npm|pnpm|yarn|none}
- Cargo workspace: {yes|no}

## Account
- GitHub: {username}  (fork flathub/flathub)

## Timeline
- Toolchain + manifest: 1-2 hours
- First build + smoke test: 1-2 hours
- PR review: 1-4 weeks
```

### --what-if exit
Save plan, exit.

### Save checkpoint
```markdown
## Gate 0 — PASSED — {timestamp}
App ID: {value}
Runtime: {value}
Next: Gate 1 — Author manifest
```

---

## GATE 1: AUTHOR MANIFEST + METADATA

Dispatch the `app-gtm-release:flatpak-build` skill for templates. Steps:

### Steps

1. **Install toolchain** (one-time; `sudo` needed for apt):
   ```bash
   sudo apt update && sudo apt install -y flatpak flatpak-builder
   pipx install "git+https://github.com/flatpak/flatpak-builder-tools.git#subdirectory=node"
   ```
   ⚠ Do NOT `pip install flatpak-builder-tools` — that package doesn't exist on PyPI.

2. **Generate sources:**
   ```bash
   # Node frontend
   flatpak-node-generator {npm|pnpm|yarn} <lockfile> -o build-aux/node-sources.json

   # Rust workspace
   cargo vendor build-aux/cargo-vendor --locked --versioned-dirs
   ```

3. **Author `build-aux/{app-id}.yml`** (see `flatpak-build` skill): runtime, finish-args (minimal), modules (node-sources, cargo-sources if applicable, app).

4. **Create AppStream metainfo** `{app-id}.metainfo.xml` + `.desktop` file + icons.

5. **Validate:**
   ```bash
   appstreamcli validate build-aux/{app-id}.metainfo.xml
   flatpak-builder --version   # tool present
   ```

### Output
Write `./go-to-market/flatpak/notes/gate-1-manifest.md`:
```markdown
# Manifest Authoring — {date}
- App ID: {value}
- Runtime: {value}
- finish-args: {list}
- Sources: node-sources.json ({yes/no}), cargo-vendor ({yes/no})
- appstreamcli validate: {pass|fail}
- Issues: {list}
```

### Gate condition
**PASS** if manifest parses (`flatpak-builder --run-state` or schema sane), metainfo validates, sources generated.
**FAIL** if validation errors or toolchain missing (report exact error; never mask stderr).

### Save checkpoint
```markdown
## Gate 1 — {PASSED|FAILED} — {timestamp}
Manifest: {app-id}.yml
Next: Gate 2 — Local build + smoke test
```

---

## GATE 2: LOCAL BUILD + SMOKE TEST

### Prerequisites
```bash
flatpak remote-add --if-not-exists flathub https://flathub.org/repo/flathub.flatpakrepo
flatpak install flathub org.gnome.Platform//{ver} org.gnome.Sdk//{ver}   # requires network, ~GB
```

### Build
```bash
flatpak-builder --user --install --force-clean ./go-to-market/flatpak/build build-aux/{app-id}.yml
```
First build downloads the runtime/SDK + compiles all modules (10-40 min). Subsequent builds are cached.

### Smoke test
```bash
flatpak run {app-id}
flatpak info --show-permissions {app-id}
```
Verify app launches, main window shows, and the granted permissions match the manifest.

### Output
Write `./go-to-market/flatpak/notes/gate-2-build.md`:
```markdown
# Local Build — {date}
- Build dir: ./go-to-market/flatpak/build
- Build: {pass|fail}
- Install (--user): {pass|fail}
- Launch: {pass|fail}
- Permissions granted: {list}
- Issues: {list}
```

### Gate condition
**PASS** if build succeeds, install succeeds, app launches, sandbox perms verified.
**FAIL** otherwise. Common: missing module sources, network blocked during build (re-vendor), wrong runtime pins.

### Save checkpoint
```markdown
## Gate 2 — {PASSED|FAILED} — {timestamp}
Build: {pass|fail}
Smoke test: {pass|fail}
Next: Gate 3 — Finalize listing metadata
```

---

## GATE 3: FINALIZE METADATA

### Steps

1. **Review `finish-args`** — ensure minimal/justified. Remove any `--filesystem=host` (auto-reject).
2. **Confirm AppStream completeness** (Flathub CI gates on these):
   - `id` matches app-id
   - `name`, `summary` (≤ 80 chars), `description`
   - `metadata_license`, `project_license`
   - `developer id` + `<name>`
   - `launchable desktop-id`
   - at least one `<screenshot>`
   - `<provides><binary>`
3. **Prepare screenshots** (1280×720 or larger, PNG/WebP).
4. **Confirm `.desktop` filename** = `{app-id}.desktop`.

Validate everything one last time:
```bash
appstreamcli validate build-aux/{app-id}.metainfo.xml
```

### Output
Write `./go-to-market/flatpak/notes/gate-3-metadata.md` with the final metadata table + screenshot paths + anywhere reviewers might push back.

### Gate condition
**PASS** if appstreamcli validates with zero errors, sandbox args minimal, screenshot present.
**FAIL** if validation errors remain.

### Save checkpoint
```markdown
## Gate 3 — {PASSED|FAILED} — {timestamp}
appstreamcli: {pass|fail}
finish-args review: {minimal|overbroad}
Next: Gate 4 — Submit PR
```

---

## GATE 4: SUBMIT PR TO FLATHUB

### Steps

1. **Fork** [flathub/flathub](https://github.com/flathub/flathub) on GitHub.
2. **Create a directory** named exactly your app-id, e.g. `io.example.MyApp/`.
3. **Copy in** the manifest + metainfo + `.desktop` + icons + screenshots. The manifest in Flathub is self-contained (its sources point to your release artifacts or git).
4. **Open a PR** titled `Add {app-id}`.

   The `finish-args` in the manifest are what Flathub reviewers focus on — keep them minimal with comments.

5. **Wait for review** (1-4 weeks):
   - Automated CI builds your manifest on Flathub infra (catches missing sources/build errors fast).
   - Humans check: package quality, sandbox minimal, AppStream complete, license correct, no anti-features.
   - Iterate on reviewer comments via additional commits.

6. **Merge** → listing goes live on flathub.org within hours.

### CI setup (optional, recommended for ongoing updates)

After the initial PR merges, updates go through your dedicated repo `flathub/{app-id}` — add a build workflow there. Do not put the maintainer password/-token in public CI; use Flathub's bot flow.

### Output
Append to `./go-to-market/flatpak/notes/gate-4-publish.md`:
```markdown
# Flathub PR — {date}
- Fork: https://github.com/{user}/flathub
- PR: https://github.com/flathub/flathub/pull/{n} — "Add {app-id}"
- CI build: {pass|pending|fail}
- Review status: {pending|changes-requested|merged}
- Live URL: https://flathub.org/apps/{app-id}
```

### Gate condition
**PASS** when PR is open with CI green.
**TRACKING** when PR pending human review.

### Save checkpoint
```markdown
## Gate 4 — {PASSED|TRACKING} — {timestamp}
PR: {url}
CI: {pass|pending}
Review: {pending|merged}
Next: monitor + plan next release
```

---

## Post-Publish

1. **Monitor** installs via Flathub (available from the app page + maintainer insights).
2. **Plan next release**: bump version, update sources (new sha256/tag), PR to your dedicated repo → Buildbot republishes within ~an hour.
3. **Pair with Snap** if not already: run `/ship-snap`.

Print final summary:
```markdown
Flathub publish complete.
- App ID: {value}
- PR: {url}
- Status: {merged|pending review}
- URL: https://flathub.org/apps/{app-id}

State saved to: ./go-to-market/flatpak/

Install command for users: flatpak install flathub {app-id}
```

---

## Edge cases

- **`flatpak-node-generator pnpm` flaky on scoped packages**: the tool supports pnpm natively; ensure the lockfile/branch is current (recent versions handle scoped-package symlinks). If it fails, fall back to `npm` lockfile.
- **Offline build fails on cargo deps**: your `.cargo/config.toml` must point `[source.crates-io] replace-with` to the vendored dir inside the build context, or cargo still tries the network.
- **Runtime/SDK too new or old**: pin what Flathub's CI supports; check available runtimes first.
- **Reviewer asks to drop `--filesystem=home`**: move data to XDG dirs and use `--filesystem=xdg-data`/portals instead — narrower, more likely accepted.
- **Multi-arch** (amd64 + aarch64): build/verify per-platform; Flathub builds each arch supported by your app-id.
