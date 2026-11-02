---
name: store-setup
description: "Set up Google Play Console and App Store Connect for a Flutter app. Use this skill when the user needs to create an app in Play Console, set up App Store Connect, configure app metadata, content ratings, pricing, data safety declarations, or any store dashboard configuration. Triggers on: 'create app in Play Console', 'App Store Connect setup', 'configure store', 'data safety form', 'content rating', 'app record', or 'prepare stores for release'."
---

# Store Setup: Google Play Console + App Store Connect

This skill guides the configuration of both store dashboards so they are ready to receive builds from the CI/CD pipeline.

## Google Play Console Setup

### Step 1: Create App

1. Go to [Google Play Console](https://play.google.com/console)
2. Click **Create app**
3. Fill in:
   - **App name** (max 30 chars, appears on Play Store)
   - **Default language**
   - **App or Game** selection
   - **Free or Paid** (cannot change from free to paid later)
4. Accept declarations (developer program policies, US export laws)
5. Click **Create app**

### Step 2: Store Listing

Invoke `app-gtm-release:store-listing` for detailed asset preparation. At minimum:

| Asset | Requirement |
|-------|------------|
| App icon | 512x512 PNG, no transparency, no rounded corners (Google rounds them) |
| Feature graphic | 1024x500 PNG or JPG |
| Screenshots | Min 2, max 8 per device type. Phone: 16:9 or 9:16, min 320px, max 3840px |
| Short description | Max 80 characters |
| Full description | Max 4000 characters |
| Video (optional) | YouTube URL, not set to private |

### Step 3: Content Rating

1. Navigate to **Policy > App content > Content rating**
2. Complete the IARC questionnaire (takes ~5 minutes)
3. Answer honestly about: violence, sexuality, language, substances, gambling, user interaction
4. Review generated ratings for each region
5. Apply ratings

Content ratings are **required** before you can publish.

### Step 4: Data Safety

1. Navigate to **Policy > App content > Data safety**
2. Declare data collection and sharing practices:
   - Does the app collect or share user data?
   - Data types: location, personal info, financial info, health, files, contacts, etc.
   - Purpose of each data type: app functionality, analytics, advertising, etc.
   - Is data encrypted in transit?
   - Can users request data deletion?
3. Preview the declaration
4. Submit

This is **required** and will appear on the store listing.

### Step 5: Pricing & Distribution

1. Navigate to **Monetization > Products > App pricing**
2. Set as Free or Paid
3. Navigate to **Reach > Countries and regions**
4. Select target countries
5. Set up any managed country pricing if paid

### Step 6: App Access

If any features require login or special access:
1. Navigate to **Policy > App content > App access**
2. Provide login credentials for the review team
3. Explain how to access restricted features

### Step 7: Target Audience

1. Navigate to **Policy > App content > Target audience**
2. Select age groups (impacts content policies)
3. If targeting children under 13: additional compliance requirements apply

## App Store Connect Setup

### Step 1: Register Bundle ID

1. Go to [Apple Developer Portal > Identifiers](https://developer.apple.com/account/resources/identifiers)
2. Click **+** > **App IDs** > **App**
3. Enter description and **Bundle ID** (explicit, e.g., `com.company.appname`)
4. Enable required capabilities (push notifications, sign in with Apple, etc.)
5. Click **Register**

The bundle ID must match `ios/Runner.xcodeproj` > Runner target > Bundle Identifier.

### Step 2: Create App Record

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Click **My Apps > +** > **New App**
3. Fill in:
   - **Platforms:** iOS (and/or macOS, etc.)
   - **Name** (max 30 chars, must be unique on the App Store)
   - **Primary language**
   - **Bundle ID:** select the one registered above
   - **SKU:** internal reference (e.g., `com.company.appname`)
   - **User Access:** full access or limited
4. Click **Create**

### Step 3: App Information

1. Navigate to **General > App Information**
2. Fill in:
   - **Category:** Primary and optional secondary category
   - **Content Rights:** Confirm no third-party content issues
   - **Age Rating:** Complete the questionnaire (violence, profanity, etc.)
3. Save changes

### Step 4: Store Listing (Version)

For each version submitted:

| Asset | Requirement |
|-------|------------|
| App icon | 1024x1024 PNG, no alpha, no rounded corners (Apple rounds them) |
| Screenshots | Required for each device size you support. iPhone 6.7" and 5.5" minimum |
| App preview video (optional) | 15-30 seconds, specific resolution per device |
| Description | No max, but first 3 lines visible before "more" |
| Keywords | Max 100 characters, comma-separated |
| Support URL | Required |
| Marketing URL (optional) | |
| Privacy Policy URL | Required |

Invoke `app-gtm-release:store-listing` for screenshot specifications and strategy.

### Step 5: App Review Information

1. Navigate to the version page > **App Review Information**
2. Provide:
   - Contact info (name, phone, email)
   - Demo account credentials (if login required)
   - Notes for reviewers (explain non-obvious features)
3. This is critical for avoiding review rejection

### Step 6: Pricing and Availability

1. Navigate to **Pricing and Availability**
2. Set price tier (or free)
3. Select availability by country/region
4. Configure pre-orders if desired

## Platform Comparison

| Feature | Google Play | App Store |
|---------|------------|-----------|
| Account cost | $25 one-time | $99/year |
| Identity verification | 2-5 days (new accounts) | Up to 48h (enrollment) |
| App name limit | 30 chars | 30 chars |
| Bundle ID change | Never (after first upload) | Never (after creation) |
| Review time | Hours to days | Typically 24-48h |
| Staged rollout | Yes (percentage-based) | Yes (7-day phased) |
| Reject appeal | Yes, via console | Yes, via Resolution Center |
| Pre-registration | Yes | Pre-orders |

## Common Rejection Reasons

### Google Play
- Missing privacy policy
- Incomplete data safety declaration
- Requesting unnecessary permissions
- Misleading app metadata
- Broken functionality or crashes

### App Store
- Bugs or crashes
- Incomplete information (placeholder text, missing features)
- Guideline 4.3: spam (too similar to existing apps)
- Login required without demo account provided
- In-app purchases not using StoreKit

## Post-Setup Checklist

Before proceeding to testing tracks:

- [ ] Google Play: app created, store listing complete, content rating done, data safety submitted
- [ ] App Store Connect: bundle ID registered, app record created, app information complete
- [ ] Both stores: privacy policy URL accessible
- [ ] Both stores: age/content ratings completed
- [ ] Both stores: pricing and distribution countries configured
