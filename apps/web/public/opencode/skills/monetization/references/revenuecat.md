# RevenueCat: Complete Flutter Integration Reference

## Installation

```yaml
# pubspec.yaml
dependencies:
  purchases_flutter: ^8.0.0
  purchases_ui_flutter: ^8.0.0  # For pre-built paywalls
```

## RevenueCat Dashboard Setup

### 1. Create Project

1. Sign up at [app.revenuecat.com](https://app.revenuecat.com)
2. Create a new project
3. Add platforms:

**iOS App:**
- App name
- Bundle ID (from Xcode)
- App Store Connect Shared Secret: App Store Connect > App > General > App-Specific Shared Secret
- In-App Purchase Key (.p8): App Store Connect > Users & Access > Integrations > In-App Purchase

**Android App:**
- App name
- Package name (from build.gradle)
- Service account JSON: Google Play Console > Setup > API access > Service account with financial permissions

### 2. Create Products in Stores

**App Store Connect:**
1. My Apps > [App] > Subscriptions
2. Create subscription group (e.g., "Premium")
3. Add subscription products:
   - `premium_monthly` — $9.99/month
   - `premium_annual` — $79.99/year
4. Set pricing, description, review screenshot

**Google Play Console:**
1. Monetize > Products > Subscriptions
2. Create subscription:
   - Product ID: `premium_monthly`
   - Base plan: auto-renewing, monthly
3. Add offers (free trial, introductory price)

### 3. Configure in RevenueCat

**Entitlements:**
1. Project settings > Entitlements > + New
2. Name: "premium"
3. This is a logical grouping — users with "premium" get premium features

**Products:**
1. Project settings > Products > + New
2. Map store product IDs to RevenueCat products:
   - `premium_monthly` (iOS) → `$rc_monthly`
   - `premium_monthly` (Android) → `$rc_monthly`
   - `premium_annual` (iOS) → `$rc_annual`
   - `premium_annual` (Android) → `$rc_annual`
3. Attach each product to the "premium" entitlement

**Offerings:**
1. Project settings > Offerings
2. Default offering: "standard"
3. Add packages:
   - Monthly: attach `$rc_monthly`
   - Annual: attach `$rc_annual`

## Flutter Implementation

### Initialization

```dart
import 'dart:io';
import 'package:purchases_flutter/purchases_flutter.dart';

class RevenueCatService {
  static const _iosApiKey = 'appl_xxxxx';
  static const _androidApiKey = 'goog_xxxxx';

  static Future<void> initialize() async {
    await Purchases.setLogLevel(LogLevel.debug);

    final apiKey = Platform.isIOS ? _iosApiKey : _androidApiKey;
    final config = PurchasesConfiguration(apiKey)
      ..appUserID = null // Anonymous until login
      ..purchasesAreCompletedBy = const PurchasesAreCompletedByRevenueCat()
      ..shouldShowInAppMessagesAutomatically = true;

    await Purchases.configure(config);
  }

  /// Call when user logs in
  static Future<void> login(String userId) async {
    await Purchases.logIn(userId);
  }

  /// Call when user logs out
  static Future<void> logout() async {
    await Purchases.logOut();
  }
}
```

### Checking Entitlements

```dart
class SubscriptionService {
  static Future<bool> isPremium() async {
    final info = await Purchases.getCustomerInfo();
    return info.entitlements.active.containsKey('premium');
  }

  /// Listen for real-time changes
  static void listenForChanges(void Function(bool isPremium) onUpdate) {
    Purchases.addCustomerInfoUpdateListener((info) {
      onUpdate(info.entitlements.active.containsKey('premium'));
    });
  }

  static Future<CustomerInfo> getCustomerInfo() async {
    return Purchases.getCustomerInfo();
  }

  static Future<CustomerInfo> restorePurchases() async {
    return Purchases.restorePurchases();
  }
}
```

### Fetching Offerings

```dart
Future<Offerings> getOfferings() async {
  final offerings = await Purchases.getOfferings();

  if (offerings.current != null) {
    final packages = offerings.current!.availablePackages;
    for (final package in packages) {
      print('${package.identifier}: ${package.storeProduct.priceString}');
      print('  Title: ${package.storeProduct.title}');
      print('  Description: ${package.storeProduct.description}');

      // Check intro eligibility (iOS)
      final intro = package.storeProduct.introductoryPrice;
      if (intro != null) {
        print('  Intro: ${intro.priceString} for ${intro.period}');
      }
    }
  }

  return offerings;
}
```

### Making Purchases

```dart
import 'package:flutter/services.dart';

Future<bool> purchasePackage(Package package) async {
  try {
    final result = await Purchases.purchase(
      PurchaseParams.package(package),
    );

    return result.customerInfo.entitlements.active.containsKey('premium');
  } on PlatformException catch (e) {
    final code = PurchasesErrorHelper.getErrorCode(e);

    switch (code) {
      case PurchasesErrorCode.purchaseCancelledError:
        // User cancelled — silent, no error message
        return false;
      case PurchasesErrorCode.purchaseNotAllowedError:
        // Device or account not allowed to purchase
        throw Exception('Purchases not allowed on this device');
      case PurchasesErrorCode.paymentPendingError:
        // Payment pending (e.g., cash payment methods)
        throw Exception('Payment is pending approval');
      case PurchasesErrorCode.productAlreadyPurchasedError:
        // Already purchased — restore
        await Purchases.restorePurchases();
        return true;
      default:
        throw Exception('Purchase failed: ${e.message}');
    }
  }
}
```

### Pre-Built Paywall (RevenueCat UI)

```dart
import 'package:purchases_ui_flutter/purchases_ui_flutter.dart';

// Modal presentation
Future<PaywallResult> showPaywallModal() async {
  return RevenueCatUI.presentPaywall(
    displayCloseButton: true,
  );
}

// Embedded in widget tree
Widget buildPaywallWidget() {
  return PaywallView(
    offering: null, // Uses default offering
    onPurchaseCompleted: (customerInfo) {
      // Handle purchase
    },
    onRestoreCompleted: (customerInfo) {
      // Handle restore
    },
    onDismiss: () {
      // Handle dismiss
    },
  );
}

// With conditions (only show if not premium)
Future<PaywallResult> showPaywallIfNeeded() async {
  return RevenueCatUI.presentPaywallIfNeeded(
    requiredEntitlementIdentifier: 'premium',
    displayCloseButton: true,
  );
}
```

### Conditional Paywall (Skip if Already Premium)

```dart
// Only show paywall if user doesn't have the entitlement
Future<void> showPaywallIfNeeded() async {
  final result = await RevenueCatUI.presentPaywallIfNeeded(
    'premium', // Required entitlement identifier
    displayCloseButton: true,
  );
  if (result == PaywallResult.notPresented) {
    // User already has premium access
  }
}
```

### Offerings with Targeting and Metadata

```dart
Future<void> fetchOfferingsWithTargeting() async {
  // Set attributes for targeted offerings
  await Purchases.setAttributes({'user_level': 'premium'});
  Offerings offerings = await Purchases.syncAttributesAndOfferingsIfNeeded();

  // Access offering metadata (configured in RevenueCat dashboard)
  final current = offerings.current;
  if (current != null) {
    String header = current.getMetadataString('header', 'Subscribe Now');
    // Use metadata to customize paywall text
  }
}
```

### Promotional Offers (iOS)

```dart
Future<void> purchaseWithPromoOffer(
  StoreProduct product,
  StoreProductDiscount discount,
) async {
  // Get the promotional offer
  final promoOffer = await Purchases.getPromotionalOffer(product, discount);
  // Purchase with the offer applied
  final result = await Purchases.purchase(
    PurchaseParams.storeProduct(product, promotionalOffer: promoOffer),
  );
}
```

### Trial Eligibility Check

```dart
Future<void> checkTrialEligibility() async {
  final eligibility = await Purchases.checkTrialOrIntroductoryPriceEligibility(
    ['premium_monthly', 'premium_annual'],
  );
  eligibility.forEach((productId, intro) {
    if (intro.status == IntroEligibilityStatus.introEligibilityStatusEligible) {
      // Show "Start Free Trial" instead of "Subscribe"
    }
  });
}
```

### Custom Paywall

If the pre-built UI doesn't match your design:

```dart
class CustomPaywall extends StatefulWidget {
  @override
  _CustomPaywallState createState() => _CustomPaywallState();
}

class _CustomPaywallState extends State<CustomPaywall> {
  List<Package> _packages = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadOfferings();
  }

  Future<void> _loadOfferings() async {
    final offerings = await Purchases.getOfferings();
    setState(() {
      _packages = offerings.current?.availablePackages ?? [];
      _loading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const CircularProgressIndicator();

    return Column(
      children: [
        for (final package in _packages)
          ListTile(
            title: Text(package.storeProduct.title),
            subtitle: Text(package.storeProduct.description),
            trailing: ElevatedButton(
              onPressed: () => _purchase(package),
              child: Text(package.storeProduct.priceString),
            ),
          ),
        TextButton(
          onPressed: () => Purchases.restorePurchases(),
          child: const Text('Restore Purchases'),
        ),
      ],
    );
  }

  Future<void> _purchase(Package package) async {
    // Use purchasePackage function from above
  }
}
```

## Webhooks (Backend Integration)

Configure in RevenueCat > Project > Integrations > Webhooks:

```json
// RevenueCat sends these events to your backend
{
  "event": {
    "type": "INITIAL_PURCHASE",  // or RENEWAL, CANCELLATION, etc.
    "app_user_id": "user_123",
    "product_id": "premium_monthly",
    "entitlement_ids": ["premium"],
    "period_type": "NORMAL",
    "purchased_at_ms": 1700000000000,
    "expiration_at_ms": 1702592000000,
    "environment": "PRODUCTION",
    "store": "APP_STORE"
  }
}
```

**Event types to handle:**
- `INITIAL_PURCHASE` — first subscription
- `RENEWAL` — subscription renewed
- `CANCELLATION` — subscription cancelled (access until period end)
- `EXPIRATION` — subscription expired
- `BILLING_ISSUE` — payment failed
- `PRODUCT_CHANGE` — upgrade/downgrade

## Testing

### Sandbox Testing

**iOS:**
1. App Store Connect > Users & Access > Sandbox > Testers
2. Create sandbox Apple ID
3. On device: Settings > App Store > Sandbox Account
4. Subscriptions renew on accelerated schedule (monthly = 5 minutes)

**Android:**
1. Google Play Console > Setup > License Testing
2. Add test Gmail accounts
3. Test purchases are free and auto-renew rapidly

### RevenueCat Sandbox

In RevenueCat dashboard, toggle between production and sandbox views to see test transactions.
