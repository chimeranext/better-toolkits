# Real Device Testing: BrowserStack & Sauce Labs

## When to Use Cloud Device Labs

Cloud device testing complements store testing tracks. Use it when:

- **Device coverage:** Need to test on devices you don't own (specific Samsung models, older iPhones, tablets)
- **Automation:** Want to run UI tests on a device matrix as part of CI/CD
- **Performance validation:** Need consistent benchmarks across chipsets
- **Accessibility:** Test VoiceOver/TalkBack on multiple configurations
- **Remote teams:** QA team cannot share physical devices

## BrowserStack App Automate

### Overview
- 20,000+ real iOS and Android devices across 19 global data centers
- Supports Appium, Espresso, XCUITest, Flutter (Detox for Android)
- SOC 2 Type 2 certified
- Video logs, screenshots, network request logging

### Setup

1. **Create account** at [browserstack.com](https://www.browserstack.com)
2. **Get credentials:** Settings > Access Key
3. **Upload app:**

```bash
curl -u "$BROWSERSTACK_USERNAME:$BROWSERSTACK_ACCESS_KEY" \
  -X POST "https://api-cloud.browserstack.com/app-automate/upload" \
  -F "file=@build/app/outputs/flutter-apk/app-release.apk" \
  -F "custom_id=my-flutter-app"
```

Response includes `app_url` (e.g., `bs://abc123`) used in test configuration.

### Running Tests with Appium

**Desired capabilities:**
```json
{
  "platformName": "Android",
  "app": "bs://abc123",
  "device": "Samsung Galaxy S23",
  "os_version": "13.0",
  "project": "Flutter App",
  "build": "CI Build #42",
  "name": "Login Flow Test",
  "browserstack.debug": true,
  "browserstack.networkLogs": true,
  "browserstack.video": true
}
```

### Device Matrix Strategy

Test on a representative set, not every device:

| Category | Android | iOS |
|----------|---------|-----|
| Flagship current | Samsung Galaxy S24, Pixel 8 | iPhone 15 Pro |
| Flagship previous | Samsung Galaxy S23, Pixel 7 | iPhone 14 |
| Mid-range | Samsung Galaxy A54 | iPhone SE (3rd gen) |
| Older but popular | Samsung Galaxy S21 | iPhone 12 |
| Tablet | Samsung Galaxy Tab S9 | iPad Air (5th gen) |
| Oldest supported OS | Android 10 device | iOS 16 device |

### CI/CD Integration (GitHub Actions)

```yaml
- name: Upload to BrowserStack
  env:
    BROWSERSTACK_USERNAME: ${{ secrets.BROWSERSTACK_USERNAME }}
    BROWSERSTACK_ACCESS_KEY: ${{ secrets.BROWSERSTACK_ACCESS_KEY }}
  run: |
    APP_URL=$(curl -s -u "$BROWSERSTACK_USERNAME:$BROWSERSTACK_ACCESS_KEY" \
      -X POST "https://api-cloud.browserstack.com/app-automate/upload" \
      -F "file=@build/app/outputs/flutter-apk/app-release.apk" \
      | jq -r '.app_url')
    echo "APP_URL=$APP_URL" >> "$GITHUB_ENV"

- name: Run Appium tests
  run: |
    # Execute test suite against uploaded app
    npx wdio run wdio.browserstack.conf.js
```

### App Live (Manual Testing)

For manual exploratory testing:
1. Go to [app-live.browserstack.com](https://app-live.browserstack.com)
2. Upload APK/IPA or select previously uploaded app
3. Select device and OS version
4. Interact with the app in browser — real device, not emulator
5. Use DevTools for debugging, network inspection

### Microsoft Migration Credits

If migrating from Visual Studio App Center:
- Up to **$10,000** in platform credits available
- Covers App Automate, Accessibility Testing, Test Observability
- Detailed migration guides for Appium, Espresso, XCUITest

## Sauce Labs Real Device Access API

### Overview
- Direct HTTP/WebSocket access to private device fleet
- No framework dependency (Appium optional)
- Build custom automation, observability dashboards, or workflow orchestrators
- Requires Sauce Labs account with **private devices**

### Setup

1. **Get credentials:** Sauce Labs > Account > User Settings
2. **Create session:**

```bash
curl -u "$SAUCE_USERNAME:$SAUCE_ACCESS_KEY" \
  -X POST "https://api.us-west-1.saucelabs.com/v2/rdc/sessions" \
  -H "Content-Type: application/json" \
  -d '{
    "capabilities": {
      "platformName": "Android",
      "deviceName": "Samsung Galaxy S23",
      "platformVersion": "13",
      "app": "storage:filename=app-release.apk"
    }
  }'
```

### Key API Capabilities

| Endpoint | Purpose |
|----------|---------|
| `POST /v2/rdc/sessions` | Create device session |
| `GET /v2/rdc/sessions/{id}` | Inspect session status |
| `DELETE /v2/rdc/sessions/{id}` | Close session |
| `POST /v2/rdc/sessions/{id}/install` | Install app on device |
| `POST /v2/rdc/sessions/{id}/adb` | Run ADB shell commands |

### Live Data Streaming

Two WebSocket channels per session:
- **AlternativeIO socket:** MJPEG video stream of device screen
- **Companion socket:** JSON logs, events, and device state

### When to Choose Sauce Labs Over BrowserStack

- Need **private dedicated devices** (regulatory compliance, dedicated hardware)
- Want **API-level control** (custom automation beyond Appium)
- Building **custom tooling** on top of device access
- Need **ADB shell access** for low-level device interaction

## Integration Recommendations

### For Most Flutter Teams: BrowserStack

```
CI/CD Pipeline
  └─ Build APK/IPA
      └─ Upload to BrowserStack
          └─ Run Appium test suite on device matrix
              └─ Collect results, screenshots, video
                  └─ Report in CI/CD dashboard
```

### For Enterprise/Regulated: Sauce Labs

```
CI/CD Pipeline
  └─ Build APK/IPA
      └─ Upload to Sauce Labs storage
          └─ Create device sessions via API
              └─ Run custom test scripts
                  └─ Stream results via WebSocket
                      └─ Aggregate in custom dashboard
```

### Budget-Conscious Alternative: Firebase Test Lab

Google's Firebase Test Lab offers real device testing integrated with Google Play:
- Included in Google Play pre-launch reports (free)
- Programmatic access via `gcloud firebase test android run`
- Fewer device options than BrowserStack/Sauce Labs
- Excellent for Android; iOS support more limited

```bash
gcloud firebase test android run \
  --type robo \
  --app build/app/outputs/flutter-apk/app-release.apk \
  --device model=oriole,version=33,locale=en,orientation=portrait \
  --timeout 300s
```
