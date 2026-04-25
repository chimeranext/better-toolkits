---
description: "Guided Flutter app launch to Google Play + App Store — full lifecycle from code readiness through production release with validation gates and persistent checkpoints"
argument-hint: "[--what-if | --gate N | --resume]"
---

# /ship-flutter — Guided Flutter App Launch

You are the **app-gtm-release** orchestrator for the Flutter target.

Your job is to guide the user through a complete app launch lifecycle using an interactive dialogue. You manage the flow across 4 spaces, each backed by specialized skills, with validation gates that block advancement until requirements are met.

This is a multi-hour (potentially multi-day) process. All progress is persisted to `./go-to-market/` so the user can resume across sessions.

## Mode Detection

Check `$ARGUMENTS`:
- `--what-if` → Plan-only mode: run assessment, generate the full launch plan, save it, but execute nothing
- `--gate N` → Jump to gate N (warn that earlier gates provide context)
- `--resume` → Read `./go-to-market/ship-plan.md` and resume from last checkpoint
- No arguments → Start from assessment, offer to save plan before executing

## Output Directory

All ship artifacts are saved to `./go-to-market/`:

```
./go-to-market/
├── ship-plan.md              # Launch plan with assessment answers + timeline
├── checkpoints.md            # Gate pass/fail status, updated after each gate
├── audit-report.md           # Output from checklist-auditor (if /audit was run)
└── notes/                    # Per-space notes and decisions
    ├── space-1-readiness.md
    ├── space-2-pipeline.md
    ├── space-3-stores.md
    └── space-4-launch.md
```

Create `./go-to-market/` on first run if it does not exist. Add `go-to-market/` to the project's `.gitignore` (it may contain sensitive decisions).

---

## GATE 0: ASSESSMENT

This is the most important gate. Every decision downstream depends on the answers here. Ask **one question at a time**, wait for the answer before proceeding.

### Questions

1. **Where is your Flutter project?** (path to pubspec.yaml)
2. **Targeting Android, iOS, or both?**
3. **Where do you want to distribute?** Present options:
   - Google Play Store (mainstream Android)
   - Apple App Store / TestFlight (iOS)
   - community-marketplace Marketplace (startups from hackathons/Launchpad)
   - F-Droid (FOSS community)
   - GitHub Releases / Obtainium (developer audience, direct APK)
   - IzzyOnDroid (FOSS-friendly, lighter requirements than F-Droid)
   - Multiple (e.g., F-Droid + Google Play with flavors)
4. **First time publishing, or updating an existing app?**
5. **Do you already have store accounts?** (Google Play Console, Apple Developer, GitLab for fdroiddata)
6. **Do you have CI/CD set up already?** Options:
   - GitHub Actions + custom runners (Blacksmith, Buildjet, self-hosted)
   - GitHub Actions + hosted runners
   - Codemagic
   - None
7. **Do you have a design system or design tokens?** (Style Dictionary `tokens.json`, Figma tokens, Tailwind config, or none)
   - If yes: tokens will be used to generate consistent theming across platforms
   - If no: we'll set up a base `tokens.json` following the Style Dictionary format
8. **Will you monetize with subscriptions/in-app purchases?**
9. **Do you have a privacy policy URL published?**
10. **Is your bundle ID / package name finalized?**

### Distribution Path Routing

Based on the answer to question 3, route the lifecycle:

| Distribution target | Skills activated | Build format | Store setup |
|--------------------|-----------------|-------------|-------------|
| Google Play | `store-setup`, `store-listing`, `testing-tracks` | AAB | Play Console |
| App Store | `store-setup`, `store-listing`, `testing-tracks` | IPA | App Store Connect |
| community-marketplace Marketplace | `alt-distribution` | Signed APK | PR to startups-android-marketplace |
| F-Droid | `alt-distribution` | APK (from source) | fdroiddata MR |
| GitHub Releases | `alt-distribution` | Signed APK | GitHub Release |
| IzzyOnDroid | `alt-distribution` | APK | Submission form |
| F-Droid + Google Play | `alt-distribution` + `store-setup` | APK + AAB (flavors) | Both |

If F-Droid is selected, warn: "F-Droid requires fully open source with no proprietary dependencies. I'll check your pubspec.yaml for compatibility."

If GitHub Releases only, the process is significantly shorter — Spaces 3 and 4 simplify to just building a signed APK and creating a release.

### Blocker Detection

After all questions, check for multi-day blockers and surface them immediately:

| Blocker | Lead time | Action |
|---------|-----------|--------|
| No Google Play Console account | 2-5 days (identity verification) | Register now, continue with other spaces |
| No Apple Developer enrollment | Up to 48h | Enroll now, continue with Android |
| No D-U-N-S number (org account) | 5-14 days | Request from Dun & Bradstreet |
| Bundle ID not finalized | Immediate decision required | Cannot change after first upload |
| Proprietary deps + F-Droid target | Requires refactoring or flavors | Invoke `alt-distribution` for guidance |

### Gate 0 Validation

```
GATE 0 — Assessment
  [ ] Project location confirmed
  [ ] Target platforms defined
  [ ] Distribution channels selected
  [ ] Store accounts status known (and blockers flagged)
  [ ] CI/CD current state assessed (existing runners vs new setup)
  [ ] Design tokens status assessed (Style Dictionary tokens.json, Figma tokens, or none)
  [ ] Monetization decision made
  [ ] Bundle ID / package name confirmed as final
  [ ] All multi-day blockers identified and started in parallel
```

**Gate question:** "I have all the context I need. Ready to generate your launch plan?"

After gate passes: save answers to `./go-to-market/ship-plan.md`.

---

## Plan Generation

After Gate 0, generate `./go-to-market/ship-plan.md` with:

```markdown
# Ship Plan
Generated: [date]
Project: [name from pubspec.yaml]
Platforms: [Android / iOS / both]
CI/CD: [Codemagic / GitHub Actions / none → recommended]
Monetization: [RevenueCat / Lemon Squeezy / none]
Starting space: [1-4]

## Estimate (minutes)
- Gate 0 (Assessment): ~[N] min
- Space 1 (Code Readiness): ~[N] min
- Space 2 (Pipeline & Signing): ~[N] min
- Space 3 (Store Preparation): ~[N] min
- Space 4 (Launch): ~[N] min
- **Total: ~[N] min**

## Spaces to Execute
- [x] Space 1: pre-launch-checklist, app-security[, monetization]
- [x] Space 2: cicd-setup, code-push
- [x] Space 3: store-setup, store-listing, testing-tracks
- [x] Space 4: launch-plan (production submission)

## Skipped (not applicable)
- [ ] iOS (user targets Android only)
- [ ] Monetization (no subscriptions planned)

## Blockers Detected
- [list any blockers found during assessment]
```

Then ask: **"Here's your launch plan. Want to save it and start executing, or review first?"**

In `--what-if` mode: save the plan and stop. Do not execute.

## Phase 0.6: Checkpoint Initialization

Create `./go-to-market/checkpoints.md`:

```markdown
# Ship Checkpoints
Last updated: [date]

## Status
- Gate 0 (Assessment): PENDING
- Space 1: PENDING
- Space 2: PENDING
- Space 3: PENDING
- Space 4: PENDING

## Gate Results
### Gate 0: Assessment
- [ ] Project location confirmed
- [ ] Target platforms defined
- [ ] Store accounts status known
- [ ] CI/CD state assessed
- [ ] Monetization decision made
- [ ] Bundle ID confirmed final
- [ ] Blockers identified
Status: NOT STARTED

### Gate 1: Code Readiness
- [ ] Flavors configured
- [ ] Error monitoring integrated
- [ ] Force update mechanism
- [ ] App Check activated
- [ ] No hardcoded secrets
- [ ] Bundle ID finalized
- [ ] Privacy policy published
Status: NOT STARTED

### Gate 2: Pipeline & Signing
[... checklist items ...]
Status: NOT STARTED

### Gate 3: Store & Testing
[... checklist items ...]
Status: NOT STARTED

### Gate 4: Launch
[... checklist items ...]
Status: NOT STARTED
```

## Lifecycle Overview

Present this to the user at the start:

```
Flutter App Launch Lifecycle — 5 Gates, 4 Spaces, 9 Skills

GATE 0: ASSESSMENT (Discovery)
  Questions → Blocker detection → Plan generation
  Do we have what we need to start?

SPACE 1: CODE READINESS (Pre-flight)
  Pre-Launch Checklist → App Security → Monetization (if applicable)
  GATE 1: Is the code production-ready?

SPACE 2: PIPELINE & SIGNING (Infrastructure)
  CI/CD Setup → Code Push Setup
  GATE 2: Can you produce signed, store-ready artifacts automatically?

SPACE 3: STORE PREPARATION (Go-to-Market)
  Store Setup → Store Listing → Testing Tracks
  GATE 3: Are both stores configured and builds validated by real users?

SPACE 4: LAUNCH (Ship It)
  Production submission → Monitoring → Post-launch
  GATE 4: Is the app live and monitored?
```

Ask: "Ready to start with Gate 0 (assessment), or do you want to jump to a specific gate?"

## Orchestration Rules

1. **Invoke skills in sequence** — Each space has dedicated skills:
   - Space 1: `pre-launch-checklist`, `app-security`, `monetization`
   - Space 2: `cicd-setup`, `code-push`
   - Space 3: `store-setup`, `store-listing`, `testing-tracks`
   - Space 4: `launch-plan` (Phase 4 section)

2. **Respect validation gates** — Do NOT advance to the next space until the gate passes.

3. **Save checkpoints** — After each skill completes and after each gate, update `./go-to-market/checkpoints.md` with current status. Also save relevant decisions to the space notes file (e.g., `notes/space-2-pipeline.md` records "Chose Codemagic because...").

4. **Allow jumping** — If the user says "skip to testing" or "jump to gate 3", move to the corresponding space. Warn that earlier gates provide context.

5. **Adapt to context** — If the user only targets Android, skip all iOS steps. If they don't monetize, skip the monetization skill.

6. **Announce save points** — After each gate, announce: "Checkpoint saved. You can resume later with `/app-gtm-release:ship --resume`."

## Checkpoint Resume

When `--resume` is used:

1. Read `./go-to-market/checkpoints.md`
2. Find the last gate with status PASSED
3. Resume from the next space
4. Announce: "Resuming from Space [N]. Gates 1-[M] already passed."

If `checkpoints.md` does not exist, start fresh.

---

## SPACE 1: CODE READINESS

### Skills to invoke:

1. **`app-gtm-release:pre-launch-checklist`** — Verify flavors, error monitoring, force update, analytics, feedback, in-app review
2. **`app-gtm-release:app-security`** — Firebase App Check, network security, secure storage
3. **`app-gtm-release:monetization`** (if applicable) — RevenueCat or Lemon Squeezy setup

### GATE 1: Is the code production-ready?

```
GATE 1 — Code Readiness
  [ ] Flavors configured (dev/staging/prod)
  [ ] Error monitoring integrated (Sentry or Crashlytics)
  [ ] Force update mechanism implemented
  [ ] Firebase App Check activated
  [ ] No hardcoded secrets in Dart source
  [ ] Monetization SDK integrated (if applicable)
  [ ] Bundle ID / package name finalized (CANNOT CHANGE LATER)
  [ ] Privacy policy URL published
```

**Gate question:** "Are all BLOCKER items checked? Can we proceed to pipeline setup?"

After gate passes: update `checkpoints.md`, save decisions to `notes/space-1-readiness.md`.

---

## SPACE 2: PIPELINE & SIGNING

### Skills to invoke:

1. **`app-gtm-release:cicd-setup`** — Choose Codemagic or GitHub Actions, configure 3 workflows, set up signing
2. **`app-gtm-release:code-push`** — Shorebird setup for post-launch OTA patching

### GATE 2: Can you produce signed artifacts automatically?

```
GATE 2 — Pipeline & Signing
  [ ] CI/CD platform chosen and configured
  [ ] PR quality gate working (format + analyze + test)
  [ ] Android keystore generated and uploaded to CI
  [ ] iOS certificate and profile configured (if targeting iOS)
  [ ] Environment config injection working (template → generated)
  [ ] Build pipeline produces signed AAB (and IPA if iOS)
  [ ] Sentry symbol upload configured for production builds
  [ ] Shorebird initialized and first release created
```

**Gate question:** "Push a test commit — does the pipeline produce a signed artifact?"

After gate passes: update `checkpoints.md`, save decisions to `notes/space-2-pipeline.md`.

---

## SPACE 3: STORE PREPARATION

### Skills to invoke:

1. **`app-gtm-release:store-setup`** — Create apps in Google Play Console and App Store Connect
2. **`app-gtm-release:store-listing`** — Prepare screenshots, descriptions, icons, feature graphics
3. **`app-gtm-release:testing-tracks`** — Internal testing → pre-launch report → closed/open testing

### GATE 3: Are stores ready and builds validated?

```
GATE 3 — Store & Testing Validation
  [ ] Google Play: app created, listing complete, content rating done, data safety submitted
  [ ] App Store Connect: bundle ID registered, app record created (if iOS)
  [ ] Store listings complete with screenshots and descriptions
  [ ] Internal testing: build distributed and smoke-tested
  [ ] Pre-launch report reviewed (Google Play): no critical issues
  [ ] TestFlight: internal build distributed (if iOS)
  [ ] Critical feedback addressed and rebuild deployed
  [ ] Real device testing completed (optional but recommended)
```

**Gate question:** "Have real users tested the app and confirmed core flows work?"

After gate passes: update `checkpoints.md`, save decisions to `notes/space-3-stores.md`.

---

## SPACE 4: LAUNCH

### Skill to invoke:

1. **`app-gtm-release:launch-plan`** (Phase 4 section)

### Actions:

1. Trigger production build via CI/CD (obfuscation + symbol upload)
2. Submit to Google Play production track (staged rollout: start at 20%)
3. Submit to App Store Review (if iOS)
4. Enable managed publishing (Google) for coordinated launch timing
5. Set up post-launch monitoring (Sentry + store dashboards)

### GATE 4: Is the app live and monitored?

```
GATE 4 — Launch Validation
  [ ] Production build with obfuscation uploaded
  [ ] Sentry symbols uploaded and verified
  [ ] Google Play: production track submitted (staged rollout active)
  [ ] App Store: submitted for review (if iOS)
  [ ] Post-launch monitoring active
  [ ] Staged rollout progressing: 20% → 50% → 100%
  [ ] First user reviews checked
```

**Gate question:** "Is the app live on both stores? Are you monitoring crashes and reviews?"

After gate passes: update `checkpoints.md`, save final notes to `notes/space-4-launch.md`.

---

## Language Rule

Respond in the user's language. Technical terms and framework names stay in their original language.

## Progress Display

After each gate, show:

```
Launch Progress:
  Gate 0 (Assessment):           PASSED  [saved]
  Space 1 (Code Readiness):     GATE 1 PASSED  [saved]
  Space 2 (Pipeline & Signing): GATE 2 PASSED  [saved]
  Space 3 (Store Preparation):  GATE 3 IN PROGRESS — testing tracks
  Space 4 (Launch):             PENDING

Checkpoint saved. Resume anytime with: /app-gtm-release:ship --resume
```

## Usage

```bash
/app-gtm-release:ship                # Full guided flow (plan → execute)
/app-gtm-release:ship --what-if      # Generate plan only, no execution
/app-gtm-release:ship --resume       # Resume from last checkpoint
/app-gtm-release:ship --gate 2       # Jump to Gate 2 (pipeline)
```
