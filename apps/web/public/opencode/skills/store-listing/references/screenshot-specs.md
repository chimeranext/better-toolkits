# Screenshot & Asset Specifications

## Google Play Store

### App Icon
- **Size**: 512 x 512 px
- **Format**: 32-bit PNG
- **Transparency**: Not allowed
- **Corners**: Do not round (Google applies mask)
- **Border**: No border needed

### Feature Graphic
- **Size**: 1024 x 500 px
- **Format**: PNG or JPG
- **Usage**: Top of store listing page, search results
- **Tip**: Include brand + value proposition text, readable on mobile

### Screenshots

| Device Type | Min Count | Max Count | Aspect Ratio | Min Size | Max Size |
|-------------|-----------|-----------|-------------|----------|----------|
| Phone | 2 | 8 | 16:9 or 9:16 | 320 px | 3840 px |
| 7" Tablet | 0 (recommended) | 8 | 16:9 or 9:16 | 320 px | 3840 px |
| 10" Tablet | 0 (recommended) | 8 | 16:9 or 9:16 | 320 px | 3840 px |
| Chromebook | 0 | 8 | 16:9 or 9:16 | 1080 px | 7680 px |

**Recommended phone resolutions:**
- 1080 x 1920 (9:16)
- 1440 x 2560 (9:16)

### Promo Video
- YouTube URL (not private)
- No age restriction
- No ads enabled on the video
- Landscape recommended (16:9)

## Apple App Store

### App Icon
- **Size**: 1024 x 1024 px
- **Format**: PNG
- **Alpha**: Not allowed (no transparency)
- **Corners**: Do not round (Apple applies mask)
- **Color space**: sRGB or Display P3

### Screenshots by Device

| Device | Resolution (portrait) | Resolution (landscape) | Min Count | Max Count |
|--------|----------------------|----------------------|-----------|-----------|
| iPhone 6.7" (14 Pro Max, 15 Pro Max) | 1290 x 2796 | 2796 x 1290 | 1 | 10 |
| iPhone 6.5" (11 Pro Max, XS Max) | 1242 x 2688 | 2688 x 1242 | 1 | 10 |
| iPhone 5.5" (8 Plus, 7 Plus, 6s Plus) | 1242 x 2208 | 2208 x 1242 | 1 | 10 |
| iPad Pro 12.9" (6th gen) | 2048 x 2732 | 2732 x 2048 | 1 | 10 |
| iPad Pro 12.9" (2nd gen) | 2048 x 2732 | 2732 x 2048 | 1 | 10 |

**Required**: At least iPhone 6.7" (or 6.5") and 5.5" for iPhone apps.

**Pro tip**: 6.7" screenshots can be used for 6.5" display if same aspect ratio. 6.5" can be used for 5.5" display.

### App Preview Video
- 15-30 seconds
- Device-specific resolution (matches screenshot size)
- No iOS-specific UI overlays outside your app
- 30 fps minimum
- H.264 codec

## Quick Reference: Minimum Required Assets

### To publish on Google Play:
- [ ] App icon: 512x512 PNG
- [ ] Feature graphic: 1024x500
- [ ] 2 phone screenshots (9:16 recommended)
- [ ] Short description (80 chars)
- [ ] Full description (4000 chars)

### To submit on App Store:
- [ ] App icon: 1024x1024 PNG (in Xcode asset catalog)
- [ ] Screenshots for each supported device size
- [ ] Description
- [ ] Keywords (100 chars max)
- [ ] Support URL
- [ ] Privacy policy URL

## Screenshot Generation Script

For automated screenshot capture using Flutter integration tests:

```bash
# Using screenshots package
flutter pub add dev:screenshots

# Or using integration test + ADB
flutter drive \
  --driver=test_driver/integration_test.dart \
  --target=integration_test/screenshot_test.dart \
  -d <device-id>
```

Integration test example for screenshots:
```dart
import 'package:integration_test/integration_test.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  final binding = IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('Take screenshots for store listing', (tester) async {
    app.main();
    await tester.pumpAndSettle();

    // Screenshot 1: Home screen
    await binding.convertFlutterSurfaceToImage();
    await tester.pumpAndSettle();
    await binding.takeScreenshot('01_home');

    // Screenshot 2: Navigate to feature
    await tester.tap(find.byKey(Key('feature_button')));
    await tester.pumpAndSettle();
    await binding.takeScreenshot('02_feature');

    // Continue for each screenshot...
  });
}
```
