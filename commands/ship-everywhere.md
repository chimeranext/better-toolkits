---
description: "Mass-publish orchestrator — detects your project's framework + applicable stores, then runs the matching /ship-{framework} commands in sequence. Aggregates state across all child runs and produces a unified launch report. The 'ship anywhere we support' command."
argument-hint: "[--what-if | --resume | --skip ship-X[,ship-Y]]"
---

# /ship-everywhere — Mass Publish Across All Applicable Stores

You are the **app-gtm-release** mass-publish orchestrator.

Your job is to detect what kind of project the user has, identify which stores their project can ship to **today** (Phase 1 supports: Flutter mobile, PWA multi-store, Microsoft Store, Snap Store), and run the matching `/ship-X` commands in a coherent sequence with shared state.

This is NOT a strategic advisor (use `/app-gtm-release:ship-advisor` for that). This command assumes the user has already decided to ship to all applicable stores and wants automation across the lifecycle.

## When this command is right

- User has a project ready for distribution AND wants maximum reach
- User said "ship anywhere we support" or "publish to every store you can"
- User has already run `/app-gtm-release:ship-advisor` and committed to multi-store

## When this command is WRONG

- User is exploring distribution strategy → use `/ship-advisor` instead
- User wants only one specific store → use the matching `/ship-{X}` directly
- User's project framework is in Phase 2+ (KMP, MAUI, Swift) → use `/ship-advisor` or wait for Phase 2 implementation

## Mode Detection

Check `$ARGUMENTS`:
- `--what-if` → Plan-only mode: detect, generate plan, save to `./go-to-market/everywhere/plan.md`, exit
- `--resume` → Read `./go-to-market/everywhere/checkpoints.md` and resume from last incomplete child
- `--skip ship-X[,ship-Y]` → Skip specific child commands (comma-separated)
- No arguments → Detect, propose plan, ask for go, execute

## Output Directory

```
./go-to-market/everywhere/
├── plan.md                    # Master plan: which ship-X commands run, in what order
├── checkpoints.md             # Cross-command checkpoint log
├── final-report.md            # Aggregated status after all children complete
└── ../{flutter|pwa|msstore|snap}/   # Per-child state (managed by each ship-X)
```

The `everywhere/` directory does NOT duplicate child state. Each child writes to its own subdirectory; `everywhere/` aggregates pointers and outcomes.

---

## STEP 1: FRAMEWORK DETECTION

Inspect the project root in this order. **Stop at the first match.**

| Signal | Framework | Children to invoke |
|---|---|---|
| `pubspec.yaml` containing `flutter:` + Linux build target | Flutter (mobile + Linux desktop) | `ship-flutter`, `ship-snap` (if Linux desktop), `ship-pwa` (if user has web build), `ship-msstore` (via PWA) |
| `pubspec.yaml` containing `flutter:` (no Linux desktop) | Flutter mobile only | `ship-flutter`, `ship-pwa` (if web build), `ship-msstore` (via PWA) |
| `manifest.json` + service worker, no `pubspec.yaml` | PWA standalone | `ship-pwa`, `ship-msstore`, `ship-snap` (if Electron/Tauri shell) |
| `capacitor.config.{ts,json}` | Capacitor — Phase 2 | Decline; route to `/ship-advisor` |
| `build.gradle.kts` + `iosApp/` (KMP) | Phase 2 | Decline; route to `/ship-advisor` |
| `*.csproj` with `<UseMaui>true` | MAUI — Phase 2 | Decline; route to `/ship-advisor` |
| `*.xcodeproj` without Flutter | Swift native — Phase 2.5 | Decline; route to `/ship-advisor` |
| `src-tauri/tauri.conf.json` | Tauri — Phase 3 (but Linux build can ship to Snap today) | `ship-snap`, `ship-msstore` (native MSIX path B) |

If multiple signals match (e.g., Flutter project that also has a separate web build): ask the user to confirm primary distribution target.

If no signals match: decline; route to `/ship-advisor` for guided exploration.

---

## STEP 2: STORE DETECTION

Ask: "Which stores do you want to ship to? (Multi-select. Default: all applicable for your framework.)"

| Store | Phase 0/1 supported via | Required gates per child |
|---|---|---|
| Google Play (mainstream Android) | `ship-flutter` (native) OR `ship-pwa` (TWA) | Full child lifecycle |
| Apple App Store | `ship-flutter` OR `ship-pwa` (PWA Builder iOS wrapper) | Full child lifecycle (Apple review can be 1-3 days) |
| Microsoft Store | `ship-msstore` (path A or B) | Full child lifecycle (certification 1-7 days) |
| Snap Store (Linux) | `ship-snap` | Full child lifecycle (review minutes for strict) |
| Browser install (PWA only) | `ship-pwa` (built-in) | Just deploy + verify install prompt works |
| F-Droid / Obtainium / IzzyOnDroid (Android FOSS) | `ship-flutter` (`alt-distribution` skill) | Sub-flow within ship-flutter |
| Community marketplace | `ship-flutter` or `ship-pwa` | Sub-flow within child |
| Mac App Store | Phase 3 | Decline if requested |
| Flathub (Linux FOSS) | Phase 2 | Decline if requested |

Cross-reference framework × stores → resulting child command list. Example for a Flutter desktop app targeting Play Store + App Store + Microsoft Store + Snap:

```
Children to run (in dependency order):
1. ship-flutter (Play + App Store) — has CI/CD setup that other children may reuse
2. ship-pwa (Microsoft Store via PWA Builder) — IF user has web build
3. ship-msstore (path A using ship-pwa output, OR path B native) — depends on whether ship-pwa ran
4. ship-snap (Snap Store)
```

---

## STEP 3: GENERATE MASTER PLAN

Write `./go-to-market/everywhere/plan.md`:

```markdown
# Master Ship-Everywhere Plan — {date}

## Project
- Path: {path}
- Framework: {detected}
- Has web build: {yes|no}
- Has Linux desktop build: {yes|no}

## Target stores: {list}

## Children to run (in order)

### 1. {child-name}
- Stores covered: {list}
- Estimated active work: {time}
- Estimated wait: {time}
- Skip if `--skip {child}`: yes
- State will be at: ./go-to-market/{child-dir}/

### 2. {child-name}
... (repeat per child)

## Dependencies between children

- ship-msstore (path A) requires ship-pwa Gate 3 output
- All children share ./go-to-market/ root for cross-references
- Children that emit auth links / signing certs (ship-flutter, ship-pwa) emit BEFORE children that consume them

## Total estimated timeline
- Active work: {sum of children}
- Wait time (review/certification): {parallelizable, longest path}
- Calendar time: ~{X} days

## Sequence vs parallel
Children run **sequentially** by default. Each completes before the next starts.

Reasons to keep sequential:
- Easier failure recovery (you know which child failed)
- Shared dependencies (signing keys, asset links) emit at known points
- User attention: each child requires user input during gates 0 and 4

To parallelize specific children (advanced): manually start `/ship-X` and `/ship-Y` in separate Claude Code sessions. ship-everywhere does not parallelize automatically.
```

### --what-if exit

Save plan, print summary, exit. Do NOT execute children.

---

## STEP 4: CONFIRMATION

Print the plan summary to user. Ask:

> Master plan ready. Run all {N} children in sequence?
> - Reply **yes** to proceed
> - Reply **dry** to do `--what-if` for each child first
> - Reply **skip {child}** to remove specific children
> - Reply **no** to cancel

Wait for explicit confirmation. Do NOT proceed without it.

---

## STEP 5: EXECUTE CHILDREN IN SEQUENCE

For each child in the planned order:

1. **Print banner**:
   ```
   ═══════════════════════════════════════════════════════
   Running child {N}/{total}: /{child-name}
   Stores: {list}
   State: ./go-to-market/{child-dir}/
   ═══════════════════════════════════════════════════════
   ```

2. **Append start checkpoint**:
   ```markdown
   ## Child {N}: /{child-name} — STARTED — {timestamp}
   ```
   to `./go-to-market/everywhere/checkpoints.md`.

3. **Invoke child command**: this means routing the user to actually run the command. In this orchestrator's view, you:
   - Walk through the child's gates yourself (you have access to the child's command files), OR
   - Tell the user to run `/{child-name}` and pause waiting for their confirmation when each gate completes

   Use the first approach by default — execute the child's gates inline in your own dialogue. The user shouldn't have to invoke each command manually.

4. **Track child outcome**:
   - PASSED: append "PASSED" checkpoint, move to next child
   - FAILED: append "FAILED" checkpoint with reason, ask user how to proceed:
     - Skip and continue with next child
     - Stop ship-everywhere and resolve the failure manually
     - Retry the failing gate
   - PARTIALLY PASSED (some gates passed, certification pending): mark as TRACKING, continue with next child

5. **Cross-reference shared resources**:
   - If ship-pwa Gate 3 emitted PWA Builder packages → ship-msstore Gate 1 path A reuses them automatically
   - If ship-flutter Gate 2 set up CI/CD → ship-snap can offer to extend the same pipeline
   - Detect these opportunistically; surface them to the user as suggestions.

6. **Append child completion checkpoint**:
   ```markdown
   ## Child {N}: /{child-name} — {PASSED|FAILED|TRACKING} — {timestamp}
   - Gates passed: {list}
   - Stores live: {list}
   - Stores pending: {list}
   - State: ./go-to-market/{child-dir}/
   ```

---

## STEP 6: AGGREGATED FINAL REPORT

After all children complete (or user halts), generate `./go-to-market/everywhere/final-report.md`:

```markdown
# Ship-Everywhere Final Report — {date range}

## Project
- {path}
- Framework: {detected}

## Children outcomes

| Child | Status | Stores live | Stores pending | State |
|---|---|---|---|---|
| ship-flutter | PASSED | Play, App Store | (none) | ./go-to-market/flutter/ |
| ship-pwa | PASSED | Microsoft Store, browser-install | App Store (review) | ./go-to-market/pwa/ |
| ship-msstore | TRACKING | (none) | Microsoft Store cert | ./go-to-market/msstore/ |
| ship-snap | PASSED | Snap Store edge | (none) | ./go-to-market/snap/ |

## Live stores
- {list with URLs}

## Pending review
- {list with expected timelines}

## Failures (if any)
- {child}: {gate} — {reason} — {recommended fix}

## Total time
- Active work: {hours}
- Wait time (cert/review): {days}
- Calendar time: {days}

## Next actions
- Monitor pending stores: {list of dashboards}
- Plan first patch release in {N} days based on early adopter feedback
- For Phase 2 frameworks (KMP, MAUI, Swift), watch the roadmap for additional ship-X commands
```

Print the final summary to the user.

---

## Edge cases

- **Child fails mid-gate**: child's own checkpoint file shows the failure. ship-everywhere asks user how to proceed; if user picks "skip", mark child FAILED in everywhere/checkpoints.md and continue.
- **User runs ship-everywhere when state already exists**: detect existing `./go-to-market/everywhere/checkpoints.md`. Offer:
  - Resume (continue from last incomplete child)
  - Restart (delete state, fresh run — confirms with user explicitly)
  - Override specific children (re-run only `--skip` complement)
- **Project changed between children** (e.g., user shipped ship-flutter, then refactored manifest before ship-pwa runs): each child re-runs its own assessment in Gate 0. Stale assumptions get caught.
- **Two children produce conflicting auth artifacts** (e.g., ship-flutter generates a Play Console asset link that ship-pwa also wants to generate differently): the first child's artifact wins. Subsequent child detects conflict in its Gate 1 and either reuses (preferred) or warns the user.
- **User has only some accounts ready** (e.g., Google Play Console exists, Microsoft Partner Center doesn't): the child that needs the missing account fails Gate 0 with clear message. ship-everywhere offers to skip that child and continue with the rest.

## Versioning across children

Recommend a unified version number across all children to make multi-store debugging easier:

- Internal version: `{semver}+{build}` e.g., `1.2.3+45`
- Per-store transformations:
  - Flutter pubspec: `version: 1.2.3+45`
  - PWA Builder MSIX: `1.2.3.45` (4-part Windows version)
  - Snap: `version: '1.2.3'`
  - Play Console: `versionCode: 45, versionName: '1.2.3'`
  - App Store Connect: `CFBundleShortVersionString: 1.2.3, CFBundleVersion: 45`

ship-everywhere can prompt for one canonical version and propagate to each child.

## Phase 1 explicit support matrix

This is what ship-everywhere actually orchestrates today:

| Framework input | Children invoked |
|---|---|
| Flutter (mobile + web build) | ship-flutter, ship-pwa, ship-msstore (via ship-pwa) |
| Flutter (mobile + Linux desktop) | ship-flutter, ship-snap |
| Flutter (mobile + web + Linux desktop) | ship-flutter, ship-pwa, ship-msstore, ship-snap |
| PWA standalone | ship-pwa, ship-msstore (via ship-pwa) |
| Tauri (Linux + Windows) | ship-snap, ship-msstore (path B native) |
| Electron | ship-snap (if Linux build), ship-msstore (path B) |

Other framework inputs decline and route to `/ship-advisor`.
