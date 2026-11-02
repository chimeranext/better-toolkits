---
name: snap-build
description: "Package and publish a Linux desktop application to the Snap Store. Covers snapcraft.yaml authoring (parts, plugs, slots, confinement), build via LXD/Multipass, naming registration on Snap Store, channels strategy (edge/beta/candidate/stable), branch tracks, public/private/unlisted visibility, and CI/CD integration. Use this skill when the user asks about Snap Store, snapcraft, Snapcraft, Ubuntu Store, Linux app distribution, snap publishing, '.snap' files, snap channels, snap confinement, classic snaps, or 'publish to Snap Store'."
---

# Snap Build & Publish for the Snap Store

The Snap Store (snapcraft.io) is Canonical's app store for Ubuntu and other Linux distributions that ship `snapd`. A snap is a self-contained, sandboxed package that bundles your app + all dependencies + a confinement profile.

This skill walks through:

1. Authoring `snapcraft.yaml`
2. Building the snap locally
3. Registering the name on snapcraft.io
4. Publishing to channels (edge → beta → candidate → stable)
5. Visibility settings (public, private, unlisted)
6. Updates and tracks

## When to invoke

- During `/app-gtm-release:ship-snap` Gates 0-4
- When the user asks: "publish to Snap Store", "snapcraft setup", "snap channels", "Linux desktop distribution via snap", "Ubuntu app store"

## Bar 1 — `snapcraft.yaml` authoring

Snap configuration is a single file at the project root: `snap/snapcraft.yaml` or `./snapcraft.yaml`.

### Minimum viable snapcraft.yaml (Flutter desktop example)

```yaml
name: myapp
base: core24
version: '1.0.0'
summary: Short one-line description
description: |
  Multi-line description.
  Supports Markdown formatting.

grade: stable
confinement: strict

apps:
  myapp:
    command: myapp
    extensions:
      - gnome
    plugs:
      - home
      - network
      - network-bind
      - desktop
      - desktop-legacy
      - wayland
      - x11
      - opengl
      - audio-playback
      - removable-media

parts:
  myapp:
    plugin: flutter
    source: .
    flutter-target: lib/main.dart
```

### Required fields

| Field | Values | Notes |
|---|---|---|
| `name` | snap-name | Lowercase, alphanumeric + hyphens, ≤ 40 chars. Must match Snap Store registration. |
| `base` | `core24` (Ubuntu 24.04) / `core22` / `core20` | Base system. core24 recommended for new snaps. |
| `version` | string or `git` | semver string OR `git` to derive from `git describe` |
| `summary` | string | ≤ 80 chars. Tagline shown in Snap Store search. |
| `description` | string | Multi-line Markdown. Shown on Snap Store detail page. |
| `grade` | `stable` / `devel` | `devel` cannot be released to stable channel. |
| `confinement` | `strict` / `classic` / `devmode` | See "Confinement" below. |
| `apps` | object | Defines executables exposed to the user. |
| `parts` | object | Build definition (sources, plugins, dependencies). |

### Confinement modes

| Mode | Sandbox | Use case | Snap Store approval |
|---|---|---|---|
| `strict` | Full sandbox via AppArmor + seccomp + cgroups | 95% of apps. Default for new snaps. | Automatic |
| `classic` | No sandbox; full system access like a regular package | Tools that NEED full access (compilers, IDEs, system utilities) | Manual review by Canonical (1-2 weeks). Strong justification required. |
| `devmode` | Sandbox is logging-only (warns instead of blocks) | Development testing only | Cannot be released to stable channel. |

For most apps: use `strict`. Add specific `plugs` for capabilities you need.

### Common plugs (capabilities your app requests)

| Plug | What it grants |
|---|---|
| `home` | Read/write user's home directory |
| `network` | Outbound network |
| `network-bind` | Listen on network ports |
| `desktop` | Modern desktop integration (notifications, etc.) |
| `desktop-legacy` | Legacy desktop integration (Xorg, gtk2/3) |
| `wayland` | Wayland display protocol |
| `x11` | X11 display protocol |
| `opengl` | OpenGL access |
| `audio-playback` | Audio output via PulseAudio/PipeWire |
| `audio-record` | Audio input |
| `camera` | Webcam access |
| `removable-media` | Read/write to /media/* (USB drives) |
| `system-files` | Specific paths (must list each) |
| `personal-files` | Specific paths in $HOME (must list each) |

### Plugin choice (under `parts`)

| Plugin | For |
|---|---|
| `flutter` | Flutter desktop apps (Linux build) |
| `electron` | Electron apps |
| `python` | Python apps |
| `nodejs` | Node.js apps |
| `go` | Go apps |
| `rust` | Rust apps |
| `make` / `autotools` / `cmake` | C/C++ apps with traditional build |
| `nil` | No build; just bundle pre-built binary via `override-build` script |

For non-trivial setups, use `nil` + `override-build` shell script:

```yaml
parts:
  myapp:
    plugin: nil
    source: .
    override-build: |
      cd $CRAFT_PART_SRC
      ./build.sh
      cp -r build/release/* $CRAFT_PART_INSTALL/
    build-packages:
      - make
      - gcc
    stage-packages:
      - libgtk-3-0
      - libssl3
```

## Bar 2 — Local build

### Prerequisites

```bash
# Ubuntu 24.04 host
sudo snap install snapcraft --classic
sudo snap install lxd
sudo lxd init --auto
sudo usermod -a -G lxd $USER
newgrp lxd
```

For non-Ubuntu hosts: install `multipass` instead of LXD. Snapcraft uses Multipass to spin up an Ubuntu VM for the build.

### Build command

```bash
cd /path/to/your/project
snapcraft
```

Output: `myapp_1.0.0_amd64.snap` in the current directory.

### Test the snap locally

```bash
sudo snap install --dangerous ./myapp_1.0.0_amd64.snap
# --dangerous skips signature verification (snap is unsigned at this stage)

# Run it
myapp

# Inspect interfaces (which plugs are connected)
snap connections myapp

# Connect a plug if needed
sudo snap connect myapp:network

# Uninstall
sudo snap remove myapp
```

### Common build issues

| Symptom | Cause | Fix |
|---|---|---|
| `parts/myapp/build` fails with missing dependency | Missing `build-packages` | Add to `parts.myapp.build-packages` |
| Snap installs but app fails to launch with "permission denied" | Missing plugs | Run app with `snap run --shell myapp` to debug; check syslog |
| App can't access user files | `home` plug not connected | `sudo snap connect myapp:home` (or use `auto-connect` for known plugs) |
| Snap is too large (> 200MB) | Dependencies bloat | Use `prime` field to exclude unneeded files; review `stage-packages` |

## Bar 3 — Snap Store name registration

You need an Ubuntu One account (free): https://snapcraft.io/account

Then register your snap name (claims it for 30 days; you must publish a snap within that window or it returns to the pool):

```bash
snapcraft login
snapcraft register myapp
```

Names are first-come-first-served. Check availability: https://snapcraft.io/store/snap-name-check

## Bar 4 — Channels strategy

Snap Store uses a 4-channel risk model. Users subscribe to a channel; updates flow within that channel.

| Channel | Purpose | Typical audience | Update cadence |
|---|---|---|---|
| `edge` | Latest builds, possibly broken | Internal team, early adopters | Multiple per day OK |
| `beta` | Feature-complete pre-release | Beta testers | Weekly |
| `candidate` | Release candidate | QA + release sign-off | A few per release |
| `stable` | Production | Public users | Per release |

A user installs with `snap install myapp` (defaults to stable). To install from a different channel:

```bash
sudo snap install myapp --channel=beta
sudo snap refresh myapp --channel=stable  # promote later
```

### Branch tracks (parallel release lines)

For long-lived versions:

```bash
snapcraft upload --release=2.x/stable myapp_2.5.0_amd64.snap  # 2.x track
snapcraft upload --release=3.x/stable myapp_3.0.0_amd64.snap  # 3.x track
```

Users on the 2.x track only get 2.x updates. Useful for maintaining LTS versions.

## Bar 5 — Publishing flow

### First release

```bash
snapcraft upload myapp_1.0.0_amd64.snap --release=edge
```

Wait for review (automated for strict confinement: minutes; manual for classic: 1-2 weeks).

After review passes, the snap is in the `edge` channel. Test it:

```bash
sudo snap install myapp --channel=edge
```

### Promoting through channels

After validating in edge, promote to beta:

```bash
snapcraft promote myapp --from-channel=edge --to-channel=beta
```

Or release a new build directly to beta:

```bash
snapcraft upload myapp_1.0.1_amd64.snap --release=beta
```

Continue: beta → candidate → stable.

### Visibility settings (Public, Private, Unlisted)

Snap Store supports three visibility modes:

| Mode | Discoverable in search | Installable by name | Use case |
|---|---|---|---|
| Public | Yes | Yes | Default. Open distribution. |
| Unlisted | No | Yes (need exact name + URL) | Internal tools, soft launch, link-only sharing |
| Private | No | No (only specific accounts you allow) | Org-internal apps, paid pre-release |

Set via Snap Store dashboard: https://snapcraft.io/{your-snap}/listing → Visibility.

For private snaps, allow specific Ubuntu One accounts under "Members" tab. They install with:

```bash
sudo snap install myapp  # works because Snap Store recognizes their account
```

## Bar 6 — Updates (after first release)

Increment version in `snapcraft.yaml`:

```yaml
version: '1.0.1'
```

Or use `git describe` to auto-version:

```yaml
version: git
```

Build + upload + release:

```bash
snapcraft
snapcraft upload --release=edge myapp_1.0.1_amd64.snap
```

Snapd on user machines auto-refreshes (default: 4x daily, configurable).

### Holding refreshes

Users can defer with `sudo snap refresh --hold=24h myapp`. For mandatory updates (security fixes), publishers can't force, but you can communicate via the snap's metadata or in-app notice.

## CI/CD integration

### GitHub Actions

```yaml
- uses: snapcore/action-build@v1
  id: build
- uses: snapcore/action-publish@v1
  with:
    store_login: ${{ secrets.SNAPCRAFT_TOKEN }}
    snap: ${{ steps.build.outputs.snap }}
    release: edge
```

Generate the token:

```bash
snapcraft export-login --snaps myapp --channels edge,beta,candidate,stable -
# Outputs a base64 blob → save as SNAPCRAFT_TOKEN secret in GitHub
```

### GitLab CI / Codemagic / others

Same pattern: install snapcraft → build → upload with token.

## Output for /ship-snap Gate 4

Save outcomes to `./go-to-market/snap/notes/gate-4-publish.md`:

```markdown
# Snap Store Publish — {date}

## Registration
- Name: {value}
- Owner: {Ubuntu One account}
- Registered: {date}

## Build
- snapcraft.yaml: {path}
- Output: {filename}
- Size: {MB}
- Confinement: {strict|classic}
- Base: {core22|core24}

## Channels released
- edge: {version|-}
- beta: {version|-}
- candidate: {version|-}
- stable: {version|-}

## Visibility
{public|unlisted|private}

## Snap Store URL
{https://snapcraft.io/myapp}
```

## Resources

- [Snapcraft docs](https://snapcraft.io/docs) — official
- [snapcraft.yaml reference](https://snapcraft.io/docs/snapcraft-yaml-reference) — full schema
- [Channels & tracks](https://snapcraft.io/docs/channels) — channel concepts
- [Public, private, unlisted snaps](https://snapcraft.io/docs/reference/administration/public-private-unlisted-snaps) — visibility deep dive
- [Snapcraft GitHub Action](https://github.com/snapcore/action-build) — CI/CD recipe
- [Linux app store experience blog](https://ubuntu.com/blog/a-shift-to-the-linux-app-store-experience) — Canonical's perspective
