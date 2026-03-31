# flutter-go-to-market-toolkit

Launch your Flutter app to Google Play Store and Apple App Store in 24 hours — guided lifecycle with CI/CD pipelines, testing tracks, store listings, monetization, code push, and validation gates.

A Claude Code plugin by [Luis Andres Pena Castillo](https://github.com/lapc506).

## Install (Claude Code)

```bash
claude plugin add lapc506/flutter-go-to-market-toolkit
```

## Install (OpenCode)

```bash
npx @lapc506/flutter-go-to-market-toolkit install
```

### CLI Commands

```bash
flutter-go-to-market-toolkit install          # Install to ~/.config/opencode/
flutter-go-to-market-toolkit update           # Refresh managed assets
flutter-go-to-market-toolkit uninstall        # Remove managed files only
flutter-go-to-market-toolkit doctor           # Health check
flutter-go-to-market-toolkit doctor --json    # Machine-readable output
flutter-go-to-market-toolkit install --dry-run  # Preview changes
flutter-go-to-market-toolkit install --force    # Overwrite unmanaged conflicts
```

## What's Inside

### Commands (2)

| Command | Description |
|---------|-------------|
| `/flutter-go-to-market:ship` | Full guided lifecycle — 4 spaces with validation gates and persistent checkpoints |
| `/flutter-go-to-market:audit` | Scan your Flutter project and get a pre-launch readiness report |

**Ship flags:**

```bash
/flutter-go-to-market:ship                # Plan → execute (asks to save before starting)
/flutter-go-to-market:ship --what-if      # Generate plan only, no execution
/flutter-go-to-market:ship --resume       # Resume from last checkpoint
/flutter-go-to-market:ship --gate 2       # Jump to specific gate
```

### Skills (10)

Auto-activate by context — you can also invoke them directly.

| Skill | Space | Triggers when you... |
|-------|-------|---------------------|
| `pre-launch-checklist` | 1 | Say "am I ready to launch", "production checklist", "release preparation" |
| `app-security` | 1 | Say "App Check setup", "protect my API", "secure Firebase" |
| `monetization` | 1 | Say "add subscriptions", "RevenueCat", "paywall", "in-app purchases" |
| `cicd-setup` | 2 | Say "set up CI/CD", "Codemagic", "GitHub Actions for Flutter" |
| `code-push` | 2 | Say "Shorebird", "OTA updates", "patch without store review" |
| `store-setup` | 3 | Say "create app in Play Console", "App Store Connect setup" |
| `store-listing` | 3 | Say "store screenshots", "app description", "ASO", "feature graphic" |
| `testing-tracks` | 3 | Say "beta testing", "TestFlight", "internal testing", "pre-launch report" |
| `alt-distribution` | 3 | Say "F-Droid", "GitHub Releases", "Obtainium", "distribute without Play Store" |
| `launch-plan` | 4 | Say "launch timeline", "24h plan", "release strategy", "ship my app" |

### Agents (2)

| Agent | Purpose |
|-------|---------|
| `pipeline-builder` | Analyzes project and generates CI/CD files (codemagic.yaml or GitHub Actions workflows) |
| `checklist-auditor` | Scans a Flutter project and reports which pre-launch items are missing |

## The Lifecycle

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

The `/ship` command persists progress to `./go-to-market/`:

```
./go-to-market/
├── ship-plan.md              # Launch plan with assessment + timeline
├── checkpoints.md            # Gate pass/fail status (resume point)
├── audit-report.md           # Output from /audit (if run)
└── notes/
    ├── space-1-readiness.md  # Decisions from Space 1
    ├── space-2-pipeline.md   # CI/CD choices, signing details
    ├── space-3-stores.md     # Store config, listing notes
    └── space-4-launch.md     # Rollout decisions, monitoring
```

## Methodology

Based on:
- **Andrea Bizzotto** — [Flutter in Production](https://codewithandrea.com/articles/key-steps-before-releasing-flutter-app/) pre-launch methodology and [flutter_ship_app](https://github.com/bizz84/flutter_ship_app) reference implementation
- **Codemagic** — Native Flutter CI/CD with built-in code signing
- **GitHub Actions** — Monorepo-friendly workflows with path filtering
- **RevenueCat** — Cross-platform subscription management
- **Shorebird** — Over-the-air Dart code updates
- **WidgetTricks** — [Startup shipping patterns](https://widgettricks.substack.com/p/startup-guide-ship-fast)

## Sources

CI/CD pipelines adapted from:
- [Build a Complete Flutter CI/CD Pipeline with Codemagic](https://www.freecodecamp.org/news/build-a-complete-flutter-ci-cd-pipeline-with-codemagic/) (freeCodeCamp)
- [Production-Ready Flutter CI/CD with GitHub Actions](https://www.freecodecamp.org/news/how-to-build-a-production-ready-flutter-ci-cd-pipeline-with-github-actions-quality-gates-environments-and-store-deployment/) (freeCodeCamp)

## Requirements

- **Claude Code** — the CLI or IDE extension
- **Flutter project** — with pubspec.yaml
- **Store accounts** — Google Play Console ($25) and/or Apple Developer Program ($99/year)

## Architecture

```
flutter-go-to-market-toolkit/
├── .claude-plugin/
│   └── plugin.json
├── commands/               # 1 orchestrator
│   └── ship.md
├── agents/                 # 2 autonomous agents
│   ├── pipeline-builder.md
│   └── checklist-auditor.md
├── skills/                 # 8 auto-activating skills
│   ├── pre-launch-checklist/
│   ├── app-security/
│   ├── monetization/
│   │   └── references/{revenuecat,lemonsqueezy}.md
│   ├── cicd-setup/
│   │   └── references/{codemagic,github-actions}.md
│   ├── code-push/
│   ├── store-setup/
│   │   └── references/{google-play,app-store}.md
│   ├── store-listing/
│   │   └── references/screenshot-specs.md
│   ├── testing-tracks/
│   │   └── references/{google-play-tracks,testflight,real-device-testing}.md
│   └── launch-plan/
│       └── references/timeline-24h.md
└── README.md
```

## License

[Business Source License 1.1](./LICENSE) — you may use, modify, and redistribute for non-competitive purposes. Converts to Non-Profit OSL 3.0 after 5 years.
