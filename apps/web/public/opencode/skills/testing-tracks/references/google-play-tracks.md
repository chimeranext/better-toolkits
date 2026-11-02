# Google Play Testing Tracks: Setup Guide

## Internal Testing

The fastest path to get builds on real devices.

### Setup

1. Go to **Play Console > Testing > Internal testing**
2. Click **Create new release**
3. Upload your AAB (app bundle)
4. Add release notes (visible to testers)
5. Click **Review release** > **Start rollout to Internal testing**

### Add Testers

1. Go to **Internal testing > Testers** tab
2. Create an email list or select existing one
3. Add up to **100 email addresses** (must be Google accounts)
4. Share the **opt-in link** with testers

Testers click the opt-in link, then install from Play Store. Build is available within **seconds** of upload.

### Key Features
- No Google review required
- Available immediately
- Testers install for free (even paid apps)
- Publishing API supported for automation
- Concurrent testing of different versions across tracks

## Closed Testing

For broader but still controlled testing with specific user groups.

### Setup

1. Go to **Play Console > Testing > Closed testing**
2. Click **Create track** (or use the default alpha track)
3. Create a new release, upload AAB
4. Add release notes
5. Review and roll out

### Add Testers

Three methods:

**Email lists:**
1. Go to **Closed testing > Testers** tab
2. Create a new list, paste email addresses
3. No limit on list size

**Google Groups:**
1. Create a Google Group at [groups.google.com](https://groups.google.com)
2. Add the group email address as a tester list
3. Anyone in the group can test

**Opt-in link:**
1. After creating the track, copy the opt-in URL
2. Share with testers
3. They accept via browser, then install from Play Store

### Review Process
- First upload to closed testing triggers **Google review**
- Subsequent updates typically process faster
- App must comply with all Play policies

## Open Testing

For large-scale validation before production launch.

### Setup

1. Go to **Play Console > Testing > Open testing**
2. Create a new release, upload AAB
3. Add release notes
4. Review and roll out

### Characteristics
- **Discoverable on Google Play** — users can find your app via search
- No limit on number of testers
- Users install from Play Store normally
- Feedback is **private** (does not affect public ratings)
- Google review required
- Great for pre-launch buzz and early feedback at scale

### Strategy
- Enable **pre-registration** alongside open testing to build a launch day audience
- Use open testing feedback to calibrate launch readiness
- Monitor **Android Vitals** during open testing for stability signals

## Pre-Launch Reports

Automatically generated when uploading to **closed** or **open** testing tracks.

### What Gets Tested

Google runs your app on a matrix of real devices and checks:

| Category | What it checks |
|----------|---------------|
| Stability | Crashes, ANRs (Application Not Responding) |
| Performance | Startup time, slow rendering frames |
| Accessibility | Unlabeled interactive elements, color contrast |
| Security | Known vulnerability patterns in dependencies |
| Compatibility | Layout on different screen sizes, Android versions |
| Edge-to-edge | Incorrect rendering under system bars |

### How to Use Results

1. Go to **Play Console > Release > Pre-launch report**
2. Review by category (stability, performance, accessibility, security)
3. Click into specific issues for device details and screenshots
4. **Critical and high severity issues should block production release**
5. Medium/low can be tracked for future fixes

### Customization

- Define specific **test starting points** (deep links, login credentials)
- Set language preferences for testing
- Specify test paths for structured scenarios

### Providing Test Credentials

If your app requires authentication:
1. Go to **Pre-launch report settings**
2. Add test account credentials
3. Google's automated crawlers use these to access authenticated content

## Track Promotion

You can promote a release from one track to another without re-uploading:

```
Internal → Closed → Open → Production
```

1. Go to the target track
2. Click **Promote release**
3. Select the source track
4. Add updated release notes if needed
5. Review and roll out

This preserves the exact same build artifact across tracks.

## Staged Rollout (Production)

When releasing to production, use staged rollout:

1. Set initial percentage (recommended: **5-20%**)
2. Monitor Android Vitals and crash rates
3. Increase percentage gradually (20% → 50% → 100%)
4. **Halt rollout** immediately if critical issues appear

```
5% → monitor 24h → 20% → monitor 24h → 50% → monitor 24h → 100%
```

## Managed Publishing

Control exactly when approved changes go live:

1. Go to **Publishing overview**
2. Enable **Managed publishing**
3. Submit changes for review
4. After approval, changes wait in "ready to publish" state
5. You choose when to click **Publish**

This is useful for coordinating launch timing across platforms or with marketing campaigns.
