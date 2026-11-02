# TestFlight: Complete Setup Guide

## Overview

TestFlight is Apple's beta testing platform. Builds uploaded to App Store Connect can be distributed to internal and external testers through the TestFlight app.

## Build Upload

### Via CI/CD (recommended)
Codemagic and GitHub Actions workflows handle this automatically. See `app-gtm-release:cicd-setup`.

### Via Xcode
1. Archive the app: **Product > Archive**
2. In Organizer, click **Distribute App**
3. Select **App Store Connect**
4. Upload

### Via Transporter
1. Download [Transporter](https://apps.apple.com/app/transporter/id1450874784) from Mac App Store
2. Sign in with Apple ID
3. Drag and drop the `.ipa` file
4. Click **Deliver**

### Build Processing
After upload, Apple processes the build (5-30 minutes). Status visible in App Store Connect > TestFlight > Builds.

## Internal Testing

### Setup

1. Go to **App Store Connect > TestFlight**
2. Click **+** next to Internal Testing
3. Create a group (e.g., "Core Team")
4. Add testers — must be **App Store Connect users** with at least the **Developer** or **Marketing** role

### Characteristics
- Up to **100 testers**
- **No App Review required**
- Build available **immediately** after processing
- Testers must have App Store Connect account access
- Each tester can test on up to 30 devices

### Adding Internal Testers
1. Testers must first be added to your App Store Connect team via **Users and Access**
2. Then add them to an internal testing group
3. They receive an email invitation
4. They install the **TestFlight app** and accept the invite

## External Testing

### Setup

1. Go to **App Store Connect > TestFlight**
2. Click **+** next to External Testing
3. Create a group (e.g., "Beta Testers")
4. Add a build to the group
5. Add testers via email or public link

### App Review (First Build)
- The **first build** added to an external group requires **Beta App Review**
- Review checks for crashes, UI issues, and guideline compliance
- Subsequent builds in the same group often skip full review
- Typical review time: hours to 1-2 days

### Adding External Testers

**By email:**
1. Go to the external group
2. Click **Add Testers**
3. Enter email addresses (up to **10,000 total**)
4. Testers receive invitation email

**By public link:**
1. Go to external group > **Enable Public Link**
2. Set a tester limit (optional)
3. Share the link
4. Anyone with the link can join (up to the limit)

### Test Information
Before adding external testers, provide:
- **Beta App Description** — what the app does
- **What to Test** — specific features or flows to focus on
- **Feedback Email** — where testers send feedback

## Build Management

### Build Expiration
- Builds are available for testing for **90 days** from upload
- After 90 days, the build becomes unavailable automatically
- You can manually expire a build earlier via **Stop Testing**

### Multiple Builds
- Different groups can test different builds simultaneously
- Internal and external groups are independent
- Use this for A/B testing features across tester segments

### Build Groups
Organize testers into groups for targeted distribution:

```
Internal Groups:
  ├── Core Team (latest build)
  └── QA Team (regression build)

External Groups:
  ├── Early Access (new feature build)
  ├── Enterprise Clients (stable build)
  └── Public Beta (most tested build)
```

## Collecting Feedback

### In-App Feedback (TestFlight 2.3+)
- Testers take a **screenshot** within the beta app
- TestFlight prompts them to annotate and submit feedback
- Includes device info, OS version, app version automatically

### TestFlight App Feedback
- Testers can submit feedback directly from TestFlight app
- Available for iOS, macOS, and visionOS

### Viewing Feedback
1. Go to **App Store Connect > TestFlight > Feedback**
2. See all feedback with screenshots, device info, crash context
3. Filter by build, tester, or date

### Crash Reports
1. Go to **App Store Connect > TestFlight > Crashes**
2. View crash logs per build
3. Symbolicated if you uploaded dSYMs (automatic with bitcode enabled)
4. Cross-reference with Sentry for richer context

## TestFlight Best Practices

1. **Set up internal testing first** — validate the build works before exposing to external testers
2. **Write clear "What to Test" notes** — focused testers give better feedback
3. **Use groups strategically** — separate internal QA from external beta users
4. **Monitor crash reports actively** — TestFlight crashes can preview production issues
5. **Expire old builds** — keep active builds to a minimum to avoid confusion
6. **Upload frequently** — short feedback loops produce better apps
7. **Provide demo accounts** — for App Review, always include working test credentials

## Automation via App Store Connect API

For programmatic TestFlight management:

```bash
# List builds
curl -H "Authorization: Bearer $JWT_TOKEN" \
  "https://api.appstoreconnect.apple.com/v1/builds"

# Add external tester
curl -X POST \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"data":{"type":"betaTesters","attributes":{"email":"tester@example.com","firstName":"Test","lastName":"User"}}}' \
  "https://api.appstoreconnect.apple.com/v1/betaTesters"
```

See [App Store Connect API docs](https://developer.apple.com/documentation/appstoreconnectapi/prerelease_versions_and_beta_testers) for full reference.
