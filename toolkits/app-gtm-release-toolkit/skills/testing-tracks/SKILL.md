---
name: testing-tracks
description: "Set up and manage app testing tracks across Google Play (internal, closed, open testing), Apple TestFlight (internal, external), and real device testing platforms (BrowserStack, Sauce Labs). Use this skill when the user asks about beta testing, internal testing, TestFlight setup, closed testing, open testing, pre-launch reports, real device testing, QA distribution, tester management, or testing progression before production release. Also triggers on: 'test my app with real users', 'set up beta testing', 'distribute to testers', 'pre-launch report', or 'device lab testing'."
---

# Testing Tracks: From Internal to Production

This skill manages the progressive testing workflow that validates your app with real users before production release. The key principle: start narrow (internal), expand gradually (closed/external), then go wide (open/production).

## Testing Progression

```
Internal (minutes)     Closed/External (hours)     Open (days)        Production
  100 testers    ──>    email lists / groups   ──>  discoverable  ──>  everyone
  no review             review on first build       review            full review
  instant               fast                        moderate          standard
```

## Google Play Testing Tracks

Read `references/google-play-tracks.md` for complete setup instructions.

### Track Comparison

| Track | Testers | Review | Speed | Cost (paid apps) | Visibility |
|-------|---------|--------|-------|-------------------|------------|
| Internal | Up to 100 | None | Seconds | Free for testers | Invite only |
| Closed | Email lists, Google Groups | Yes | Hours | Testers must pay | Invite only |
| Open | Unlimited | Yes | Hours | Testers must pay | Discoverable on Play |

### Recommended Flow

1. **Internal testing** (first) — validate builds work, basic smoke testing
2. **Pre-launch report** — upload to closed or open track to trigger automated testing on real devices
3. **Closed testing** — invite specific user groups for focused feedback
4. **Open testing** — broader audience, find edge cases, stress test

### Pre-Launch Reports

Automatically generated when you upload to closed or open tracks. Reports include:
- **Stability:** crashes and ANRs across devices
- **Performance:** startup time, rendering
- **Accessibility:** unlabeled elements, contrast issues
- **Security:** known vulnerability patterns
- **Compatibility:** different Android versions and screen sizes

**Action items from pre-launch reports are blockers** — fix critical/high severity issues before promoting to production.

## Apple TestFlight

Read `references/testflight.md` for complete setup instructions.

### Testing Tiers

| Tier | Testers | Review | Build availability |
|------|---------|--------|--------------------|
| Internal | Up to 100 (App Store Connect users) | None | Immediate after processing |
| External | Up to 10,000 | Required (first build per group) | After review approval |

### Key Constraints
- Builds expire after **90 days**
- External testing requires **App Review** for the first build (subsequent builds often skip full review)
- Testers need the free **TestFlight app** installed
- Managed Apple Accounts (Apple Business Manager) cannot test

### TestFlight Workflow

1. Upload build via CI/CD (Codemagic publishing or Fastlane)
2. Build processes on Apple's servers (5-30 minutes)
3. Add build to internal testing group — available immediately
4. Add build to external testing group — goes to App Review first
5. Once approved, testers receive email notification
6. Testers install via TestFlight app
7. Feedback submitted through TestFlight or email

## Real Device Testing

Read `references/real-device-testing.md` for platform-specific setup.

### When to Use Real Device Testing

Use cloud device labs when:
- You need to test on devices you do not physically own
- Accessibility testing across multiple screen sizes
- Performance validation across chipset generations
- Regression testing on older OS versions
- Your QA team is remote and cannot share physical devices

### Platform Comparison

| Feature | BrowserStack | Sauce Labs |
|---------|-------------|------------|
| Real devices | 20,000+ iOS & Android | Private fleet (API access) |
| Flutter support | Appium + Detox (Android) | Framework-agnostic (HTTP/WS) |
| CI/CD integration | Azure Pipelines, GitHub Actions | API-based, any CI |
| Free tier | No (paid plans) | No (private devices required) |
| Unique feature | App Automate, App Live | Real Device Access API |

### Quick Decision

- **BrowserStack** — best for most teams: broader device coverage, easier setup, better Flutter support via Appium
- **Sauce Labs** — best for teams needing API-level device control or private dedicated devices

## Testing Checklist

Before promoting from testing to production:

### Functionality
- [ ] Core user flows work end-to-end
- [ ] Authentication (login, logout, session expiry)
- [ ] Network error handling (offline mode, timeouts)
- [ ] Deep links resolve correctly
- [ ] Push notifications received and handled

### Platform-Specific
- [ ] Android: back button behavior, permissions dialogs
- [ ] iOS: swipe gestures, status bar, safe areas
- [ ] Tablet/large screen: layout adapts correctly
- [ ] Dark mode: all screens render properly

### Performance
- [ ] Cold start under 3 seconds
- [ ] No visible jank during scrolling
- [ ] Memory usage stable (no leaks in long sessions)
- [ ] Battery drain reasonable

### Store Compliance
- [ ] Google Play pre-launch report: no critical issues
- [ ] No crashes in TestFlight crash reports
- [ ] Content matches store listing descriptions
- [ ] Privacy policy matches actual data collection

## Collecting Feedback

### Google Play Testing
- Testers can submit private feedback via Play Console
- Feedback visible only to you (does not affect public ratings)
- Reply directly to testers through Play Console

### TestFlight
- TestFlight 2.3+: feedback via TestFlight app or screenshot annotation
- All feedback visible in App Store Connect > TestFlight > Feedback
- Older versions: feedback via email to specified address

### Structured Feedback Template

Share this with testers to get actionable feedback:

> **Device:** [model + OS version]
> **Build:** [version + build number]
> **What did you try to do?**
> **What happened?**
> **What did you expect?**
> **Screenshot/recording:** [attach if possible]
