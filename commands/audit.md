---
description: "Detect the project framework (Flutter / PWA / KMP / Swift / .NET MAUI / Snap target) and run a pre-launch readiness audit. Currently full coverage is implemented for Flutter; other frameworks are detected and routed to /ship-advisor."
argument-hint: "[optional: path to project root]"
---

# /audit — Framework-Aware Pre-Launch Readiness Audit

You audit a project's readiness for distribution. Step 1 is detecting **which framework** the project uses; step 2 is running the matching readiness checks.

## Step 1: Locate the Project Root

If `$ARGUMENTS` contains a path, use it. Otherwise, use the current working directory. If neither yields a recognizable project, ask the user.

## Step 2: Detect the Framework

Inspect the project root in this order. **Stop at the first match.**

| Signal (file at root) | Framework | Phase status |
|---|---|---|
| `pubspec.yaml` containing `flutter:` | **Flutter** | Phase 0 ✅ — full audit available |
| `manifest.json` + service worker (`sw.js`/`service-worker.*`) + no `pubspec.yaml` | **PWA (standalone)** | Phase 1 ⏳ — detection only |
| `capacitor.config.{ts,json}` | **Capacitor (PWA-native shell)** | Phase 2 ⏳ — detection only |
| `build.gradle.kts` + `iosApp/` directory + Kotlin sources | **Kotlin Multiplatform (KMP)** | Phase 2 ⏳ — detection only |
| `*.csproj` containing `<UseMaui>true` | **.NET MAUI** | Phase 2 ⏳ — detection only |
| `*.xcodeproj` or `Package.swift` (without Flutter) | **Swift native (iOS)** | Phase 2.5 ⏳ — detection only |
| `src-tauri/tauri.conf.json` | **Tauri (web → desktop)** | Phase 3 ⏳ — detection only |
| `snapcraft.yaml` at root | **Snap (Linux desktop target)** | Phase 1 ⏳ — detection only |
| (none of the above) | **Unknown** | — |

Report the detected framework to the user before continuing.

## Step 3: Run the Audit

### If Flutter (Phase 0)

Dispatch the `checklist-auditor` agent to scan the project. The agent analyzes the codebase and produces a structured PASS/WARN/FAIL report covering all pre-launch checklist items.

Present the report with:
- Summary counts (PASS / WARN / FAIL / INFO / SKIP)
- Blockers highlighted at the top
- For each FAIL or WARN, a concrete recommendation with the relevant `app-gtm-release` skill to invoke

Offer next steps:
- If blockers exist: "Want me to help fix [blocker]? I'll use `app-gtm-release:[skill]`."
- If clean: "Your project looks ready. Want to start `/app-gtm-release:ship-flutter`?"

### If any other framework (Phase 1+ deferred)

Tell the user:

> Detected: **{framework}**. Full audit support for this framework lands in **{phase}** of the roadmap.
>
> What you can do today:
> 1. Run `/app-gtm-release:ship-advisor` for a strategic recommendation on which stores to target and what manual steps to take.
> 2. Document your readiness checks in `./go-to-market/notes/manual-{framework}-audit.md` — this gives you a baseline to migrate when full support lands.
>
> Watch the README roadmap for updates.

DO NOT attempt to run the Flutter `checklist-auditor` agent on a non-Flutter project — its rules assume `pubspec.yaml`, flavors, and Dart source layout.

### If Unknown

Ask the user to confirm the framework manually. If they can identify it, proceed with the matching branch above. Otherwise, recommend `/app-gtm-release:ship-advisor` for a guided dialogue.

## Usage

```bash
/app-gtm-release:audit                    # Audit current directory
/app-gtm-release:audit apps/mobile        # Audit specific path
```
