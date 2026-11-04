# App Store Connect: Detailed Setup Reference

## Account Prerequisites

### Apple Developer Program
- **$99/year** (individual or organization)
- Enrollment review: up to **48 hours**
- Organization enrollment requires D-U-N-S number (free from Dun & Bradstreet, but takes 5-14 days)
- Two-factor authentication required on Apple ID

### App Store Connect API Key

For CI/CD integration (Fastlane, Codemagic, Transporter):

1. Go to **Users and Access > Integrations > App Store Connect API**
2. Click **Generate API Key**
3. Name: descriptive (e.g., "CI/CD Pipeline")
4. Access: **App Manager** (minimum for uploads)
5. Download the `.p8` file (only downloadable once)
6. Note the **Key ID** and **Issuer ID**

These become CI/CD secrets:
- `APP_STORE_CONNECT_API_KEY_ID` = Key ID
- `APP_STORE_CONNECT_API_ISSUER_ID` = Issuer ID  
- `APP_STORE_CONNECT_API_KEY_CONTENT` = contents of `.p8` file

## Bundle ID Registration

### In Apple Developer Portal

1. Go to [Certificates, Identifiers & Profiles](https://developer.apple.com/account/resources)
2. Click **Identifiers > +**
3. Select **App IDs** > **App**
4. Enter:
   - **Description**: Human-readable name
   - **Bundle ID**: Explicit (e.g., `com.company.appname`)
5. Enable capabilities your app uses:
   - Push Notifications
   - Sign in with Apple
   - Associated Domains
   - App Groups
   - etc.
6. Click **Register**

### In Xcode Project

Ensure the bundle ID matches:
1. Open `ios/Runner.xcodeproj` in Xcode
2. Select Runner target > **Signing & Capabilities**
3. Set **Bundle Identifier** to match the registered ID
4. Select your team

**Bundle ID cannot change after the app is created in App Store Connect.**

## Code Signing

### Distribution Certificate

1. In Apple Developer Portal: **Certificates > +**
2. Select **Apple Distribution**
3. Upload a Certificate Signing Request (CSR):
   - Open Keychain Access on Mac
   - Certificate Assistant > Request a Certificate From a Certificate Authority
   - Save to disk
4. Upload CSR, download certificate
5. Double-click to install in Keychain

### Export for CI/CD

```bash
# Export .p12 from Keychain Access
# Right-click certificate > Export > .p12 format
# Set a password

# Encode for CI secrets
base64 -i Certificates.p12        # macOS
base64 -w 0 Certificates.p12      # Linux
```

### Provisioning Profile

1. In Apple Developer Portal: **Profiles > +**
2. Select **App Store Connect** (distribution type)
3. Select the app ID (bundle ID)
4. Select the distribution certificate
5. Name it descriptively (e.g., "AppName App Store Distribution")
6. Download

```bash
# Encode for CI secrets
base64 -i AppName_AppStore.mobileprovision    # macOS
base64 -w 0 AppName_AppStore.mobileprovision  # Linux
```

### Codemagic Automatic Signing

Codemagic can manage certificates and profiles automatically:
1. In Codemagic UI: provide App Store Connect API key
2. Set `distribution_type: app_store` in `codemagic.yaml`
3. Codemagic creates and manages certificates/profiles

This eliminates manual certificate management.

## App Store Connect: App Record

### Creation

1. Go to [App Store Connect > My Apps](https://appstoreconnect.apple.com)
2. Click **+** > **New App**
3. Fill in:

| Field | Description |
|-------|-------------|
| Platforms | iOS, macOS, tvOS, visionOS |
| Name | Max 30 chars, must be unique on App Store |
| Primary Language | Default store listing language |
| Bundle ID | Select from registered IDs |
| SKU | Internal reference (e.g., package name) |
| User Access | Full access or limited |

### App Information

Navigate to **General > App Information**:

- **Category**: Primary category (required) + secondary (optional)
  - Common: Utilities, Health & Fitness, Social Networking, Lifestyle, Business
- **Content Rights**: Confirm you have rights to all content
- **Age Rating**: Questionnaire covering:
  - Cartoon/fantasy violence
  - Realistic violence
  - Sexual content
  - Profanity
  - Drug/alcohol/tobacco references
  - Gambling
  - Horror/fear themes
  - Medical/treatment information
  - Unrestricted web access

### App Privacy

1. Navigate to **General > App Privacy**
2. Declare data collection practices (similar to Google's Data Safety)
3. Categories: Contact Info, Health & Fitness, Financial, Location, etc.
4. For each: whether it's linked to identity, used for tracking
5. Appears as **App Privacy** section on your listing

## Version Submission

### Prepare for Submission

For each version:

1. **Version Information**:
   - Version number (e.g., 1.0.0)
   - What's New text (required for updates)

2. **Screenshots** (per device size):

| Device | Resolution (portrait) | Resolution (landscape) |
|--------|----------------------|----------------------|
| iPhone 6.7" | 1290 x 2796 | 2796 x 1290 |
| iPhone 6.5" | 1242 x 2688 | 2688 x 1242 |
| iPhone 5.5" | 1242 x 2208 | 2208 x 1242 |
| iPad Pro 12.9" (6th gen) | 2048 x 2732 | 2732 x 2048 |
| iPad Pro 12.9" (2nd gen) | 2048 x 2732 | 2732 x 2048 |

3. **App Review Information**:
   - Contact: name, phone, email
   - Demo account: username + password (if login required)
   - Notes: explain non-obvious features, special configurations
   - Attachments: supporting documentation if needed

4. **Build**: Select from uploaded builds (TestFlight or direct upload)

### Submission

1. Click **Add for Review**
2. Confirm age rating
3. Select **Automatically release** or **Manually release**
4. Submit

### Review Process

- Typical review time: **24-48 hours** (often faster)
- Status progression: Waiting for Review → In Review → Ready for Sale (or Rejected)
- If rejected: review the reason in **Resolution Center**, fix, resubmit
- You can reply to rejection reasons and request re-review

### Phased Release

After approval, choose release strategy:

- **Immediate**: Available to all users right away
- **Phased release**: Rolled out over 7 days
  - Day 1: 1%
  - Day 2: 2%
  - Day 3: 5%
  - Day 4: 10%
  - Day 5: 20%
  - Day 6: 50%
  - Day 7: 100%
- Can pause phased release at any point
- Users who manually check for updates can get it immediately regardless of phase

## Common Rejection Reasons and Prevention

| Reason | Prevention |
|--------|-----------|
| **Guideline 2.1**: Crashes or bugs | Test thoroughly on TestFlight before submission |
| **Guideline 2.3**: Incomplete info | Fill all fields, provide demo account |
| **Guideline 4.0**: Design guidelines | Follow Human Interface Guidelines |
| **Guideline 4.3**: Spam | Ensure unique value proposition |
| **Guideline 5.1.1**: Data collection | Declare all data in App Privacy |
| **Guideline 3.1.1**: IAP required | Use StoreKit for digital goods |
| **Guideline 2.5.1**: Only public APIs | Don't use private Apple APIs |

## Expedited Review

If you have a critical bug fix:
1. Submit the update normally
2. Go to [Apple's contact page](https://developer.apple.com/contact/app-store/?topic=expedite)
3. Request expedited review with justification
4. Typical response: within 24 hours
