---
name: launch-plan
description: "Master orchestration for launching a Flutter app to Google Play and App Store in 24 hours. Use this skill when the user wants to ship a Flutter app, plan a mobile release, create a launch timeline, or asks about the steps to publish to app stores. Also triggers when the user mentions 'release plan', 'launch checklist', 'ship my app', 'publish to stores', 'go live', or 'release strategy'. Even if they just say 'I want to launch my app' — this is the skill to use."
---

<!-- TODO: framework-agnostic split — orchestration timeline assumes Flutter (pubspec, Codemagic Flutter workflow, Shorebird code-push). Phase 2+: parameterize the 24h timeline by target framework so KMP/MAUI/Swift can reuse the orchestrator with their own toolchain steps. -->

# Launch Plan: Flutter App to Stores in 24 Hours

You are orchestrating the launch of a Flutter app to Google Play Store and Apple App Store. This skill provides the master timeline, decision framework, and coordination across all other app-gtm-release skills.

## Before You Start

Verify these prerequisites with the user. Do not skip any — a missing prerequisite will block the timeline.

### Accounts (must exist before Hour 0)
- [ ] **Google Play Console** — developer account ($25 one-time). Identity verification takes 2-5 days if not already done
- [ ] **Apple Developer Program** — enrolled ($99/year). Enrollment review takes up to 48 hours
- [ ] **Codemagic account** (or GitHub with Actions enabled) — for CI/CD
- [ ] **Firebase project** — for App Distribution (internal testing channel)
- [ ] **Sentry project** — for crash reporting and symbol upload
- [ ] **RevenueCat account** (if monetizing with subscriptions) — for in-app purchases
- [ ] **Shorebird account** (recommended) — for over-the-air code push updates

### Code Readiness
- [ ] Flutter app builds successfully on both platforms (`flutter build appbundle --release` and `flutter build ios --release --no-codesign`)
- [ ] Tests pass (`flutter test`)
- [ ] App icon and splash screen configured
- [ ] Version and build number set in `pubspec.yaml`
- [ ] Bundle ID / package name finalized (cannot change after first upload)

### Assets Ready
- [ ] App icon (512x512 PNG, no transparency for Google Play; 1024x1024 for App Store)
- [ ] Feature graphic (1024x500 for Google Play)
- [ ] Screenshots: minimum 2 per device type per store
- [ ] Short description (80 chars) and full description (4000 chars)
- [ ] Privacy policy URL (required by both stores)

If any prerequisite is missing, help the user resolve it before starting the timeline.

## 24-Hour Timeline

### Phase 1: Pipeline (Hours 0-6)

**Goal:** Automated builds that produce signed, store-ready artifacts on every push.

1. **Choose CI/CD platform** — use the decision tree below
2. **Invoke `app-gtm-release:cicd-setup`** to configure the pipeline
3. **Set up code signing:**
   - Android: generate upload keystore, configure Gradle signing
   - iOS: create distribution certificate + provisioning profile in Apple Developer portal
4. **Configure environment injection** — template-based secrets (never commit real values)
5. **Verify:** push to trigger pipeline, confirm signed artifact is produced

**Quality gates to wire in:**
- `dart format --set-exit-if-changed .`
- `flutter analyze --fatal-infos`
- `flutter test --coverage` with configurable threshold (default 70%)

Read `references/timeline-24h.md` for detailed time breakdowns per step.

### Phase 2: Store Setup (Hours 6-10)

**Goal:** Both store dashboards configured, ready to receive builds.

1. **Invoke `app-gtm-release:store-setup`** for guided setup
2. **Google Play Console:**
   - Create app, set default language
   - Complete store listing (invoke `app-gtm-release:store-listing`)
   - Content rating questionnaire
   - Pricing and distribution (countries, free/paid)
   - Data safety section
3. **App Store Connect:**
   - Create app record with bundle ID
   - Fill app information (category, content rights, age rating)
   - Prepare store listing (invoke `app-gtm-release:store-listing`)

### Phase 3: Testing (Hours 10-18)

**Goal:** App validated by real users on real devices before production release.

1. **Invoke `app-gtm-release:testing-tracks`** for the full testing progression
2. **Internal testing (both platforms simultaneously):**
   - Google Play: internal testing track (100 testers, available in seconds, no review)
   - Apple TestFlight: internal testing (100 App Store Connect users, no review)
3. **Pre-launch report** (Google Play): automatically generated on closed/open track upload — check for crashes, accessibility, security
4. **Real device testing** (optional but recommended): BrowserStack or Sauce Labs for device matrix coverage
5. **Closed/external testing:**
   - Google Play: closed testing track with email lists
   - TestFlight: external testing (up to 10,000 testers, first build requires App Review)
6. **Collect feedback, fix critical issues, rebuild**

### Phase 4: Launch (Hours 18-24)

**Goal:** Production release live on both stores.

1. **Production build:**
   - Enable obfuscation: `--obfuscate --split-debug-info=build/symbols`
   - Upload Sentry debug symbols: `sentry-cli upload-dif build/symbols`
2. **Submit to Google Play:**
   - Upload AAB to production track
   - Staged rollout recommended (start at 20%)
   - Use managed publishing to control exact go-live moment
3. **Submit to App Store:**
   - Upload IPA via Xcode, Transporter, or CI/CD
   - Submit for App Review (typical: 24-48h, but often faster)
   - Enable phased release if desired
4. **Post-launch monitoring:**
   - Sentry crash dashboard
   - Google Play pre-launch report + Android vitals
   - App Store Connect crash reports
   - Review store ratings/feedback within first 24h
5. **Demand generation (starts now, not "later"):** the stores are discovery, not a demand engine — kick off the organic presence system (website with payment methods, video-first distribution, instant contact channel) from `app-gtm-release:gtm-fit`

## CI/CD Platform Decision Tree

Choose based on the user's context:

```
Already have CI/CD with custom runners (Blacksmith, Buildjet, self-hosted)?
├── Yes → GitHub Actions + your existing runners
│         - Add Flutter via subosito/flutter-action
│         - Same dashboard, secrets, billing as your other projects
│         - Fastest builds (dedicated hardware)
│
└── No existing CI/CD?
    ├── Android only? → GitHub Actions (hosted runners)
    │                    - Free 2000 min/month (Linux)
    │                    - Sufficient for Android builds
    │
    └── Need iOS builds? → Codemagic
                           - Mac Mini M2 included
                           - Automatic iOS code signing
                           - 500 free build minutes/month
```

**When to recommend existing runners (Blacksmith, etc.):**
- Already paying for custom runners for backend/web CI
- Team knows GitHub Actions
- Android-only for now (no macOS needed)
- Want everything in one platform

**When to recommend Codemagic:**
- Need iOS builds without managing macOS infrastructure
- New project with no existing CI/CD
- Want built-in code signing UI
- Small team that benefits from managed Flutter tooling

**When to recommend GitHub Actions (hosted):**
- Budget-conscious, starting from scratch
- Android-only builds
- Want monorepo path-filtered workflows
- Cost-sensitive (GitHub free tier is generous for Linux builds)

## SRE Integration Points

These reliability practices are woven into the pipeline, not bolted on after:

| Practice | Where it applies | Skill reference |
|----------|-----------------|-----------------|
| Coverage threshold | PR quality gate | `app-gtm-release:cicd-setup` |
| Sentry symbol upload | Production build step | `app-gtm-release:cicd-setup` |
| Pre-launch crash detection | Testing phase | `app-gtm-release:testing-tracks` |
| Staged rollout | Production release | This skill (Phase 4) |
| Structured build logging | All CI/CD steps | `app-gtm-release:cicd-setup` |

## Coordinating Skills

When orchestrating a full launch, invoke skills in this order:

0. `app-gtm-release:gtm-fit` — strategy check before the clock starts: minimum viable segment defined, SLIP score has no zeros, organic presence (website / videos / contact channel) planned for post-launch
1. `app-gtm-release:pre-launch-checklist` — verify readiness (flavors, error monitoring, force update, security)
2. `app-gtm-release:cicd-setup` — pipeline and signing
3. `app-gtm-release:app-security` — Firebase App Check + hardening
4. `app-gtm-release:store-setup` — console/connect configuration
5. `app-gtm-release:store-listing` — assets and descriptions
6. `app-gtm-release:monetization` — RevenueCat / Lemon Squeezy (if applicable)
7. `app-gtm-release:testing-tracks` — progressive testing
8. `app-gtm-release:code-push` — Shorebird setup for post-launch patching
9. Come back here for Phase 4 (production release)

Each skill is independently usable — a user may invoke `app-gtm-release:testing-tracks` alone if their pipeline is already set up.

## Reference Architecture: flutter_ship_app

The [flutter_ship_app](https://github.com/bizz84/flutter_ship_app) by Andrea Bizzotto demonstrates many of these patterns in a real codebase:
- Multi-flavor setup (dev/stg/prod) with separate Firebase projects
- Sentry + Mixpanel integration per flavor
- Shorebird code push configuration
- Force update mechanism via `force_update_helper`
- Environment variables via `--dart-define-from-file`
- In-app review prompts
- Drift database with web support
