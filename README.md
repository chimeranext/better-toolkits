# app-gtm-release-toolkit

Multi-platform app go-to-market and release toolkit. Ship Flutter, Kotlin Multiplatform, Swift native, .NET MAUI, and Progressive Web Apps to Google Play, App Store, Microsoft Store, Snap Store, and alternative channels — through a guided lifecycle with validation gates and persistent checkpoints.

A Claude Code plugin by [Luis Andres Pena Castillo](https://github.com/lapc506).

## Install (Claude Code)

```bash
claude plugin add lapc506/app-gtm-release-toolkit
```

## Install (OpenCode)

```bash
npx @lapc506/app-gtm-release-toolkit install
```

### CLI Commands

```bash
app-gtm-release-toolkit install          # Install to ~/.config/opencode/
app-gtm-release-toolkit update           # Refresh managed assets
app-gtm-release-toolkit uninstall        # Remove managed files only
app-gtm-release-toolkit doctor           # Health check
app-gtm-release-toolkit doctor --json    # Machine-readable output
app-gtm-release-toolkit install --dry-run  # Preview changes
app-gtm-release-toolkit install --force    # Overwrite unmanaged conflicts
```

## Three-Tier Command Architecture

```
╔════════════════════════════════════════════╗
║  TIER 1 — STRATEGY                         ║
║  /app-gtm-release:ship-advisor             ║
║    Pick the right ship-X for your stack    ║
╠════════════════════════════════════════════╣
║  TIER 2 — EXECUTION (per framework)        ║
║  /app-gtm-release:ship-flutter   ← Phase 0 ✅ ║
║  /app-gtm-release:ship-pwa       ← Phase 1 ✅ ║
║  /app-gtm-release:ship-snap      ← Phase 1 ✅ ║
║  /app-gtm-release:ship-msstore   ← Phase 1 ✅ ║
║  /app-gtm-release:ship-kmp       ← Phase 2 ✅ ║
║  /app-gtm-release:ship-maui      ← Phase 2 ✅ ║
║  /app-gtm-release:ship-swift     ← Phase 2.5 ║
╠════════════════════════════════════════════╣
║  TIER 3 — MASS PUBLISH                     ║
║  /app-gtm-release:ship-everywhere ← Phase 1 ✅ ║
╚════════════════════════════════════════════╝
```

### Commands Today (10)

| Command | Status | Description |
|---------|--------|-------------|
| `/app-gtm-release:audit` | ✅ Phase 0 | Detect framework + run pre-launch readiness audit (Flutter coverage today, others routed to advisor) |
| `/app-gtm-release:ship-advisor` | ✅ Phase 0 | Strategic advisor — picks the right ship command for your stack and stores |
| `/app-gtm-release:ship-flutter` | ✅ Phase 0 | Full guided lifecycle for Flutter → Play + App Store (4 spaces with validation gates) |
| `/app-gtm-release:ship-pwa` | ✅ Phase 1 | PWA → Microsoft Store + Google Play (TWA) + App Store via PWA Builder (5 gates) |
| `/app-gtm-release:ship-msstore` | ✅ Phase 1 | App → Microsoft Store (path A PWA Builder MSIX or path B native MSIX, 5 gates) |
| `/app-gtm-release:ship-snap` | ✅ Phase 1 | Linux desktop → Snap Store with channels strategy (5 gates) |
| `/app-gtm-release:ship-everywhere` | ✅ Phase 1 | Mass-publish orchestrator — runs all applicable ship-X children in sequence |
| `/app-gtm-release:ship-kmp` | ✅ Phase 2 | Kotlin Multiplatform → Play + App Store with iOS framework integration (5 gates) |
| `/app-gtm-release:ship-maui` | ✅ Phase 2 | .NET MAUI multi-target → Play + App Store + Microsoft Store + macOS Catalyst (5 gates) |
| `/app-gtm-release:ship-swift` | ⏳ Phase 2.5 stub | Swift native iOS → App Store |

**Ship-flutter flags:**

```bash
/app-gtm-release:ship-flutter                # Plan → execute (asks to save before starting)
/app-gtm-release:ship-flutter --what-if      # Generate plan only, no execution
/app-gtm-release:ship-flutter --resume       # Resume from last checkpoint
/app-gtm-release:ship-flutter --gate 2       # Jump to specific gate
```

## Roadmap

| Phase | Frameworks added | Stores added | Headline commands |
|---|---|---|---|
| **0** | Flutter | Google Play, App Store, F-Droid, GitHub Releases, IzzyOnDroid | `/audit`, `/ship-advisor`, `/ship-flutter` |
| **1** | PWA standalone | Microsoft Store, Snap Store | `/ship-pwa`, `/ship-msstore`, `/ship-snap`, `/ship-everywhere` |
| **2 (now)** | KMP, .NET MAUI | Flathub (in alt-distribution) | `/ship-kmp`, `/ship-maui` |
| **2.5** | Swift native iOS | — | `/ship-swift` |
| **3** | Tauri, Electron, Capacitor | Mac App Store | `/ship-webview-native` (possible merge) |

## Skills (16)

Auto-activate by context — you can also invoke them directly. Eight are framework-agnostic; three are Flutter-coupled (marked with `<!-- TODO: framework-agnostic split -->` for refactor in Phase 3+); five are framework-specific (Phase 1+2).

| Skill | Status | Triggers when you... |
|-------|--------|---------------------|
| `gtm-fit` | Agnostic | Say "how do I get users", "make my app sell", "GTM strategy", "minimum viable segment", "cómo vendo mi app" |
| `pre-launch-checklist` | Flutter-coupled | Say "am I ready to launch", "production checklist", "release preparation" |
| `app-security` | Agnostic | Say "App Check setup", "protect my API", "secure Firebase" |
| `monetization` | Agnostic | Say "add subscriptions", "RevenueCat", "paywall", "in-app purchases" |
| `cicd-setup` | Agnostic (YAML differs per framework) | Say "set up CI/CD", "Codemagic", "GitHub Actions" |
| `code-push` | Flutter/Dart-coupled | Say "Shorebird", "OTA updates", "patch without store review" |
| `store-setup` | Agnostic | Say "create app in Play Console", "App Store Connect setup", "Microsoft Partner Center" |
| `store-listing` | Agnostic | Say "store screenshots", "app description", "ASO", "feature graphic" |
| `testing-tracks` | Agnostic | Say "beta testing", "TestFlight", "internal testing", "pre-launch report" |
| `alt-distribution` | Multi-platform alt | Say "F-Droid", "GitHub Releases", "Obtainium", "Flathub", "AppImage", "distribute without Play Store" |
| `launch-plan` | Flutter-coupled | Say "launch timeline", "24h plan", "release strategy", "ship my app" |
| `pwa-quality` | PWA-specific (Phase 1) | Say "validate manifest", "Lighthouse PWA", "Workbox setup", "PWA readiness" |
| `msstore-submission` | Microsoft Store-specific (Phase 1) | Say "Microsoft Store", "Partner Center", "MSIX", "MS Store certification" |
| `snap-build` | Snap-specific (Phase 1) | Say "snapcraft", "Snap Store", "Ubuntu Store", "Linux desktop distribution" |
| `kmp-build` | KMP-specific (Phase 2) | Say "Kotlin Multiplatform", "KMM", "iOS framework integration", "Compose Multiplatform" |
| `maui-publishing` | MAUI-specific (Phase 2) | Say ".NET MAUI", "MAUI publishing", "dotnet workload maui", "Xamarin migration" |

## Agents (2)

| Agent | Purpose |
|-------|---------|
| `pipeline-builder` | Analyzes project and generates CI/CD files (codemagic.yaml or GitHub Actions workflows) |
| `checklist-auditor` | Scans a Flutter project and reports which pre-launch items are missing |

## The Flutter Lifecycle (`/ship-flutter`)

```
GATE 0: ASSESSMENT
  Questions → Blocker detection → Plan generation
  Do we have what we need to start?

SPACE 1: CODE READINESS
  Pre-Launch Checklist (flavors, monitoring, force update, analytics)
  App Security (Firebase App Check, network hardening)
  Monetization (RevenueCat / Lemon Squeezy) — if applicable
  --- GATE 1: Is the code production-ready? ---

SPACE 2: PIPELINE & SIGNING
  CI/CD Setup (Codemagic priority, GitHub Actions alternative)
  Code Push (Shorebird OTA updates)
  --- GATE 2: Can you produce signed artifacts automatically? ---

SPACE 3: STORE PREPARATION
  Store Setup (Google Play Console + App Store Connect)
  Store Listing (screenshots, descriptions, ASO)
  Testing Tracks (internal → closed → open + TestFlight + real devices)
  --- GATE 3: Are stores configured and builds validated by real users? ---

SPACE 4: LAUNCH
  Production submission (obfuscated + Sentry symbols)
  Staged rollout (20% → 50% → 100%)
  Post-launch monitoring
  --- GATE 4: Is the app live and monitored? ---
```

## Output

`/ship-flutter` persists progress to `./go-to-market/`:

```
./go-to-market/
├── ship-plan.md              # Launch plan with assessment + timeline
├── checkpoints.md            # Gate pass/fail status (resume point)
├── audit-report.md           # Output from /audit (if run)
├── advisor-recommendation.md # Output from /ship-advisor (if run)
└── notes/
    ├── space-1-readiness.md
    ├── space-2-pipeline.md
    ├── space-3-stores.md
    └── space-4-launch.md
```

The state directory keeps the original `./go-to-market/` name (domain-meaningful, not brand-coupled) so user projects don't break on toolkit upgrades.

## Migrating from `flutter-go-to-market-toolkit` v1.x

This is **v2.0.0** — a breaking rename. The plugin namespace changed:

```diff
- /flutter-go-to-market:ship      → /app-gtm-release:ship-flutter
- /flutter-go-to-market:audit     → /app-gtm-release:audit
```

Steps to migrate:
1. Uninstall the old plugin: `claude plugin remove lapc506/flutter-go-to-market-toolkit`
2. Install the renamed plugin: `claude plugin add lapc506/app-gtm-release-toolkit`
3. Update any saved aliases or shortcuts referencing the old namespace.

The legacy GitHub URL (`/lapc506/flutter-go-to-market-toolkit`) HTTPS-redirects to the new repo for now, but configure your remotes to the new URL explicitly.

## Methodology

Based on:
- **Andrea Bizzotto** — [Flutter in Production](https://codewithandrea.com/articles/key-steps-before-releasing-flutter-app/) pre-launch methodology and [flutter_ship_app](https://github.com/bizz84/flutter_ship_app) reference implementation
- **Codemagic** — Native Flutter CI/CD with built-in code signing
- **GitHub Actions** — Monorepo-friendly workflows with path filtering
- **RevenueCat** — Cross-platform subscription management
- **Shorebird** — Over-the-air Dart code updates
- **PWA Builder (Microsoft)** — PWA → multi-store packaging (Phase 1)
- **Snapcraft (Canonical)** — Linux desktop distribution (Phase 1)
- **WidgetTricks** — [Startup shipping patterns](https://widgettricks.substack.com/p/startup-guide-ship-fast)
- **Chris Gardner (Underscore VC)** — [How to Build a Product that Scales into a Company](https://www.youtube.com/watch?v=r-98YRAF1dY) (Harvard Innovation Labs): product-company gap, SLIP framework, minimum viable segment, pricing ladders
- **Héctor de León (hdeleon.net)** — [Cómo hacer que tu software se venda solo](https://www.youtube.com/watch?v=caxtR9e76EM): organic presence system (website + payment methods, video-first distribution, dedicated WhatsApp channel, open-core funnel)

## Sources

CI/CD pipelines adapted from:
- [Build a Complete Flutter CI/CD Pipeline with Codemagic](https://www.freecodecamp.org/news/build-a-complete-flutter-ci-cd-pipeline-with-codemagic/) (freeCodeCamp)
- [Production-Ready Flutter CI/CD with GitHub Actions](https://www.freecodecamp.org/news/how-to-build-a-production-ready-flutter-ci-cd-pipeline-with-github-actions-quality-gates-environments-and-store-deployment/) (freeCodeCamp)

## Requirements

- **Claude Code** — the CLI or IDE extension (or **OpenCode** as alternative)
- **Project to ship** — Flutter (today) or KMP/Swift/MAUI/PWA (roadmap)
- **Store accounts** — depending on targets: Google Play Console ($25), Apple Developer ($99/year), Microsoft Partner Center ($19 individual), Ubuntu One (free)

## Architecture

```
app-gtm-release-toolkit/
├── .claude-plugin/
│   ├── plugin.json
│   └── marketplace.json
├── commands/                 # 10 commands (9 real, 1 stub)
│   ├── audit.md              # framework detection + Flutter audit (real)
│   ├── ship-advisor.md       # strategic router (real)
│   ├── ship-flutter.md       # full Flutter lifecycle, 4 spaces (real)
│   ├── ship-pwa.md           # PWA → MS Store + Play TWA + App Store, 5 gates (real — Phase 1)
│   ├── ship-snap.md          # Linux desktop → Snap Store, 5 gates (real — Phase 1)
│   ├── ship-msstore.md       # MSIX → Microsoft Store, 5 gates (real — Phase 1)
│   ├── ship-everywhere.md    # mass-publish orchestrator (real — Phase 1)
│   ├── ship-kmp.md           # KMP → Play + App Store, 5 gates (real — Phase 2)
│   ├── ship-maui.md          # MAUI → Play + App Store + MS Store + macOS, 5 gates (real — Phase 2)
│   └── ship-swift.md         # stub — Phase 2.5
├── agents/                   # 2 autonomous agents
│   ├── pipeline-builder.md
│   └── checklist-auditor.md
├── skills/                   # 16 auto-activating skills
│   ├── gtm-fit/                 # agnostic — GTM strategy (SLIP, MVS, organic presence)
│   ├── pre-launch-checklist/    # Flutter-coupled
│   ├── app-security/            # agnostic
│   ├── monetization/            # agnostic
│   ├── cicd-setup/              # agnostic (YAML differs per framework)
│   ├── code-push/               # Flutter/Dart-coupled
│   ├── store-setup/             # agnostic
│   ├── store-listing/           # agnostic
│   ├── testing-tracks/          # agnostic
│   ├── alt-distribution/        # multi-platform alt channels
│   ├── launch-plan/             # Flutter-coupled
│   ├── pwa-quality/             # PWA-specific (Phase 1)
│   ├── msstore-submission/      # Microsoft Store-specific (Phase 1)
│   ├── snap-build/              # Snap-specific (Phase 1)
│   ├── kmp-build/               # KMP-specific (Phase 2)
│   └── maui-publishing/         # MAUI-specific (Phase 2)
├── src/                      # OpenCode CLI installer (TypeScript, builds to dist/)
├── dist/                     # Built CLI — distributed via npm @lapc506/app-gtm-release-toolkit
├── package.json
└── README.md
```

## License

[Business Source License 1.1](./LICENSE) — you may use, modify, and redistribute for non-competitive purposes. Converts to Non-Profit OSL 3.0 after 5 years.
