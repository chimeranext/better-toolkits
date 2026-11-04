---
name: flatpak-build
description: "Package and publish a Linux desktop application to Flathub via Flatpak. Covers flatpak-builder manifest authoring (app-id, runtime, finish-args, modules), offline source generation for Node (flatpak-node-generator via pipx from flatpak-builder-tools) and Rust (cargo vendor) — including multi-crate cargo workspaces — AppStream metainfo, .desktop file, local sandbox build/install, and the GitHub PR submission workflow to flathub/flathub. Use this skill when the user asks about Flathub, Flatpak, flatpak-builder, flatpak manifest, AppStream metadata, 'publish to Flathub', GNOME runtime, org.freedesktop.Platform, or Linux desktop FOSS distribution."
---

# Flatpak Build & Publish for Flathub

Flathub is the de facto Linux desktop FOSS app store. Flatpak is the underlying decentralized, bundle-portable packaging tech. This skill covers the full path: author a manifest → generate offline sources → build locally → submit via PR to Flathub.

For the distribution-strategy decision (Flathub vs Snap vs AppImage) and the full Flathub overview, see the `alt-distribution` skill. This skill is the hands-on packaging companion, like `snap-build` is for snaps.

## When to invoke

- During `app-gtm-release:ship-flatpak` Gates 0-4
- When the user asks: "publish to Flathub", "flatpak setup", "flatpak-builder manifest", "AppStream metadata", "Linux app store distribution"

## Key terms

| Term | Meaning |
|------|---------|
| Manifest | YAML file describing the app: base runtime, sandbox perms (`finish-args`), and build `modules` |
| Runtime | Base OS env the app runs on (`org.freedesktop.Platform`, `org.gnome.Platform`, `org.kde.Platform`) |
| SDK | Build toolchain that matches the runtime (`org.freedesktop.Sdk`, `org.gnome.Sdk`, `org.kde.Sdk`) |
| `app-id` | Reverse-DNS unique id; must match the Flathub repo directory name |
| Sources | Where the build inputs come from (archive, git, dir, or `generated:` from lockfile tools) |
| Finish-args | Sandbox permissions granted to the app (analogous to snap plugs) |

## Choosing a runtime (verified)

For desktop GUI apps, `org.gnome.Platform` (with matching `org.gnome.Sdk`) is the most common on Flathub and is what GTK/webkit-based apps (including Tauri webkit2gtk, Electron, and most modern GUI) use. `org.freedesktop.Platform` is the base freedesktop runtime/general purpose. When in doubt, use GNOME for GUI apps.

Pin an explicit version. At time of writing `47` is current for GNOME:

```yaml
runtime: org.gnome.Platform
runtime-version: "47"
sdk: org.gnome.Sdk
```

Always check https://docs.flatpak.org/en/latest/available-runtimes.html for the current stable version before pinning.

## Minimal manifest

Filename convention: `{app-id}.yml` (reverse-DNS), typically under a `build-aux/` or `flatpak/` dir.

```yaml
# build-aux/io.example.MyApp.yml — minimal example
app-id: io.example.MyApp
runtime: org.gnome.Platform
runtime-version: "47"
sdk: org.gnome.Sdk
command: myapp

finish-args:
  - --share=network
  - --share=ipc
  - --socket=wayland
  - --socket=fallback-x11
  - --device=dri
  - --socket=pulseaudio
  - --talk-name=org.freedesktop.portal.*
  - --talk-name=org.freedesktop.Notifications

modules:
  - name: myapp
    buildsystem: simple
    build-commands:
      - install -Dm755 myapp -t /app/bin/
      - install -Dm644 myapp.desktop -t /app/share/applications/
      - install -Dm644 io.example.MyApp.appdata.xml -t /app/share/metainfo/
      - install -Dm644 icon-256.png /app/share/icons/hicolor/256x256/apps/io.example.MyApp.png
    sources:
      - type: archive
        url: https://github.com/example/myapp/releases/download/v1.0.0/myapp-linux-x86_64.tar.gz
        sha256: <sha256>
```

### finish-args quick reference

| finish-arg | What it grants | Review notes |
|---|---|---|
| `--share=network` | Outbound network | Needed for networked apps |
| `--share=ipc` | X11 IPC | Most apps |
| `--socket=wayland` | Wayland display | Prefer |
| `--socket=fallback-x11` | X11 fallback | Safe default |
| `--socket=pulseaudio` | Audio | |
| `--device=dri` | GPU | Prefer over `--device=all` |
| `--socket=x11` | X11 (no fallback) | Avoid unless required |
| `--filesystem=home` | Read/write home | Justify; reviewers dislike broad |
| `--filesystem=host` | Full FS | **Rejected by reviewers** — never use |
| `--talk-name=org.freedesktop.Notifications` | D-Bus notifications | |
| `--talk-name=org.freedesktop.portal.*` | XDG portals (file picker, open dialog) | Common |

Default minimal; add only what the app needs. Reviewers reject overly broad sandbox.

## Toolchain install (verified — this is the non-obvious part)

`flatpak-builder` comes from your distro's package manager and **requires root**:

```bash
# Debian/Ubuntu
sudo apt update && sudo apt install -y flatpak flatpak-builder
```

The **generator tools do NOT live on PyPI.** Do **not** run `pip install flatpak-builder-tools` — that package does not exist and the install fails (`No matching distribution found`). The real repo is `flatpak/flatpak-builder-tools` on GitHub, and the Node generator is a pipx-installable package in a git subdirectory:

```bash
# Node/PWA/npm/pnpm/yarn frontend sources — pipx (no sudo needed)
pipx install "git+https://github.com/flatpak/flatpak-builder-tools.git#subdirectory=node"
# → installs command `flatpak-node-generator`
```

For Rust (cargo) sources, the reliable approach is **`cargo vendor`** built into the Rust toolchain (no extra tool to install):

```bash
cargo vendor vendor-sources --locked --versioned-dirs
```

This works even for **large multi-crate cargo workspaces** (e.g., a Tauri + Rust crates monorepo). It vendors all transitive deps into a `vendor/` dir, and you point the `[source.crates-io] replace-with = "vendored-sources"` in `.cargo/config.toml`. (There is also a `flatpak-cargo-generator` from the same tools repo, but `cargo vendor` + a `generated:` dir source is the most reliable for complex workspaces.)

## Generating Node sources (frontend deps)

```bash
# npm, yarn, or pnpm lockfile. -o writes the sources JSON flatpak-builder ingests.
flatpak-node-generator pnpm apps/tauri/pnpm-lock.yaml -o build-aux/node-sources.json

# For a plain npm lockfile:
flatpak-node-generator npm package-lock.json -o build-aux/node-sources.json
```

The generator supports `pnpm` natively. Output is a `node-sources.json` array referenced from the manifest:

```yaml
  - name: node-sources
    buildsystem: simple
    build-commands:
      - install -d /app/node_modules
    sources:
      - generated: node-sources.json
```

## Generating Rust sources (cargo workspace)

```bash
cd <project-root>
cargo vendor vendor-sources --locked --versioned-dirs
```

Reference the vendored dir as a manifest source, and make the cargo build use it via a `.cargo/config.toml` in the build env:

```yaml
  - name: cargo-sources
    buildsystem: simple
    build-commands:
      - install -d /app/cargo-vendor
    sources:
      - type: dir
        path: vendor-sources
        dest: cargo-vendor
```

## Building & testing locally

```bash
# Add flathub remote and install the runtime+SDK (big; one-time)
flatpak remote-add --if-not-exists flathub https://flathub.org/repo/flathub.flatpakrepo
flatpak install flathub org.gnome.Platform//47 org.gnome.Sdk//47

# Build (offline once sources are vendored). --user installs for the current user.
flatpak-builder --user --install --force-clean build-dir build-aux/io.example.MyApp.yml

# Run inside the sandbox to smoke-test
flatpak run io.example.MyApp

# Inspect granted permissions
flatpak info --show-permissions io.example.MyApp

# Uninstall local build
flatpak uninstall io.example.MyApp
```

### Single-file bundle (`.flatpak`)

```bash
flatpak-builder --repo=repo --force-clean build-dir build-aux/io.example.MyApp.yml
flatpak build-bundle repo myapp.flatpak io.example.MyApp
```

## AppStream metainfo (.appdata.xml) — REQUIRED by Flathub

Flathub requires an AppStream file. Shared with KDE Discover, GNOME Software, etc.

`io.example.MyApp.metainfo.xml`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<component type="desktop-application">
  <id>io.example.MyApp</id>
  <name>My App</name>
  <summary>Short tagline, ≤ 80 chars</summary>
  <metadata_license>CC0-1.0</metadata_license>
  <project_license>BSL-1.1</project_license>
  <developer id="io.example">
    <name>Example Inc.</name>
  </developer>
  <description><p>Plain text or inline HTML; no Markdown.</p></description>
  <url type="homepage">https://example.com</url>
  <url type="bugtracker">https://github.com/example/myapp/issues</url>
  <launchable type="desktop-id">io.example.MyApp.desktop</launchable>
  <screenshots><screenshot type="default"><image>https://example.com/shot.png</image></screenshot></screenshots>
  <releases><release version="1.0.0" date="2026-01-15"/></releases>
  <content_rating type="oars-1.1"/>
  <categories><category>Office</category></categories>
  <provides><binary>myapp</binary></provides>
</component>
```

Validate:
```bash
# Install appstreamcli if missing: sudo apt install appstream
appstreamcli validate io.example.MyApp.metainfo.xml
```

## .desktop file — REQUIRED

Filename must match app-id: `io.example.MyApp.desktop`:
```ini
[Desktop Entry]
Name=My App
Comment=Tagline
Exec=myapp
Icon=io.example.MyApp
Terminal=false
Type=Application
Categories=Office;Productivity;
StartupWMClass=myapp
```

## Icon

Provide at least a 256×256 PNG installed to the hicolor path in `/app/share/icons/hicolor/256x256/apps/{app-id}.png`. Flathub derives listing icons from these.

## Flathub submission (GitHub PR workflow)

Flathub has **no dashboard**. Submission is via pull request:

1. **Fork** [flathub/flathub](https://github.com/flathub/flathub) — the new-app submissions repo.
2. **Create a directory** named exactly your app-id: `io.example.MyApp/`.
3. **Add** the manifest + AppStream metainfo + `.desktop` + icons + screenshots.
4. **Open a PR** titled `Add io.example.MyApp`.
5. **Review** (1-4 weeks): automated CI builds your manifest on Flathub infra; humans check package quality, minimal sandbox, AppStream completeness, license, no anti-features. Iterate via commits.
6. **Merge** → goes live on flathub.org within hours.

### Updates after launch

Flathub gives your project a dedicated repo `flathub/io.example.MyApp` once the initial PR merges. Subsequent updates:

1. Edit your manifest in `flathub/io.example.MyApp`.
2. Update version string + sources (bump sha256 / new tag).
3. Open a PR (or push if you have access).
4. Buildbot rebuilds and publishes within ~an hour.

## Flathub vs Snap quick table

| Concern | Flathub | Snap Store |
|---|---|---|
| Build | flatpak-builder + YAML manifest | snapcraft + snapcraft.yaml |
| Submission | GitHub PR (1-4 wk review) | snapcraft upload (automated) |
| Sandbox | finish-args (granular) | plugs |
| Default audience | Fedora, Pop!_OS, Mint | Ubuntu |
| Self-hosted | Yes (any HTTP server) | No |

Ship to **both** for maximum Linux reach. Run `/app-gtm-release:ship-snap` and `/app-gtm-release:ship-flatpak` as parallel children under `/ship-everywhere`.

## Gotchas (learned in practice)

- `pip install flatpak-builder-tools` **fails** — the package is `flatpak/flatpak-builder-tools` on GitHub, installed via pipx from the git subdirectory. See above.
- Memory/time: first `flatpak-builder` run downloads the full runtime+SDK (multi-GB) and rebuilds all modules. Be patient; subsequent runs are cached.
- Cargo workspace vendoring: use `cargo vendor --locked --versioned-dirs` from the workspace root; the `.cargo/config.toml` must be present in the build context so cargo replaces crates.io — otherwise the offline build fails.
- Icons via `tauri icon`/`flutter launcher_icons` from a **1024×1024 RGBA PNG** (reuse whatever app icon you ship to `.deb`/`.snap` — keep one source of truth).
- Never `--filesystem=host`. Reviewers will reject the PR.
- Validate AppStream with `appstreamcli validate` **before** opening the PR; CI fails fast otherwise.
