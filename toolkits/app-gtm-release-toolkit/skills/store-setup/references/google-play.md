# Google Play Console: Detailed Setup Reference

## Account Prerequisites

### Developer Account
- One-time **$25 registration fee**
- Google account required
- Identity verification: **2-5 business days** for new accounts (government ID or D-U-N-S number)
- Organization accounts require additional business verification

### Google Play Console API Access

For CI/CD integration (automated uploads):

1. Go to **Setup > API access**
2. Link to Google Cloud project (or create one)
3. Create **Service Account** in Google Cloud Console:
   - Go to IAM & Admin > Service Accounts
   - Create service account with descriptive name
   - Grant role: **Service Account User**
   - Create JSON key and download
4. Back in Play Console: **Grant access** to the service account
   - Permission: **Release manager** (for uploading and managing releases)

The JSON key is the `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` secret in CI/CD.

## App Creation

### Required Information

| Field | Description | Changeable? |
|-------|-------------|-------------|
| App name | Displayed on Play Store (max 30 chars) | Yes |
| Default language | Primary store listing language | Yes |
| App or Game | Classification | No |
| Free or Paid | Monetization model | Free to paid: No. Paid to free: Yes |

### Package Name

The `applicationId` in `android/app/build.gradle` becomes the permanent package name:

```groovy
android {
    defaultConfig {
        applicationId "com.company.appname"
    }
}
```

**This cannot be changed after the first APK/AAB upload.** Choose carefully.

## Store Listing Completion

### Main Store Listing

Navigate to **Grow > Store presence > Main store listing**:

1. **App details:**
   - App name (max 30 chars)
   - Short description (max 80 chars)
   - Full description (max 4000 chars)

2. **Graphics:**
   - App icon (512x512)
   - Feature graphic (1024x500)
   - Phone screenshots (2-8)
   - Tablet screenshots (optional but recommended)
   - Promo video YouTube URL (optional)

3. **Contact details:**
   - Email (required)
   - Phone (optional)
   - Website (optional)

### Custom Store Listings

Up to 50 country-specific listings:
1. Go to **Store presence > Custom store listings**
2. Create for specific countries
3. Customize title, description, screenshots, and graphics
4. Useful for localized marketing messages

## Content Rating

1. Navigate to **Policy > App content > Content rating**
2. Click **Start questionnaire**
3. Select category (Utility, Game, Social, etc.)
4. Answer questions about:
   - Violence and fear
   - Sexuality
   - Language
   - Controlled substances
   - Gambling
   - User-generated content
   - Personal information collection
5. Review auto-generated ratings (ESRB, PEGI, etc.)
6. Apply ratings

**Must be completed before publishing.** Inaccurate ratings can lead to app removal.

## Data Safety Section

Navigate to **Policy > App content > Data safety**:

### Data Collection Declaration

For each data type your app collects:

| Category | Examples |
|----------|---------|
| Location | Approximate location, precise location |
| Personal info | Name, email, user IDs, address, phone |
| Financial info | Purchase history, payment info |
| Health and fitness | Health data, fitness data |
| Messages | Emails, SMS, other messages |
| Photos and videos | Photos, videos |
| Audio | Voice recordings, music files |
| Files and docs | File storage |
| Calendar | Calendar events |
| Contacts | Contact list |
| App activity | Page views, taps, search history |
| Web browsing | Browsing history |
| App info and performance | Crash logs, diagnostics |
| Device or other IDs | Device ID, advertising ID |

For each collected data type, declare:
- **Is it shared with third parties?**
- **Is it collected?** (transmitted off device)
- **Purpose:** functionality, analytics, advertising, fraud prevention, personalization, account management
- **Is it optional?** (user can opt out)
- **Is data encrypted in transit?**
- **Can users request deletion?**

### Common Flutter SDK Data Collection

If using these packages, you likely collect:

| Package | Data collected |
|---------|---------------|
| `firebase_analytics` | App activity, device IDs |
| `firebase_crashlytics` | Crash logs, device info |
| `sentry_flutter` | Crash logs, device info, app performance |
| `google_sign_in` | Email, name, profile photo |
| `geolocator` | Precise location |
| `shared_preferences` | App activity (if synced) |

## Pricing & Distribution

### Free Apps
- Cannot later change to paid
- Can still use in-app purchases
- Select countries for distribution

### Paid Apps
- Set base price, Google converts to local currencies
- Can change to free (one-way)
- Testers on internal track install for free

### Country Selection
- Default: all countries
- Can exclude specific countries
- Can add countries later
- Removing a country affects existing users

## Pre-Registration

Enable before launch to build audience:

1. Navigate to **Grow > Pre-registration**
2. Requires completed store listing
3. Set launch date range (3-6 weeks recommended)
4. Optional: pre-registration rewards
5. Enable auto-install for opted-in users
6. Users see "Pre-register" button on Play Store

## Publishing API

For automating uploads from CI/CD:

```bash
# Upload AAB to internal testing track
curl -X POST \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/octet-stream" \
  --data-binary @app-release.aab \
  "https://androidpublisher.googleapis.com/upload/androidpublisher/v3/applications/$PACKAGE_NAME/edits/$EDIT_ID/bundles?uploadType=media"
```

In practice, use the `r0adkll/upload-google-play` GitHub Action or Codemagic's native publishing, which handle the API complexity.
