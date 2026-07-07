---
name: monetization
description: "Set up in-app purchases, subscriptions, and payment processing for Flutter apps using RevenueCat or Lemon Squeezy. Use this skill when the user asks about monetization, subscriptions, in-app purchases, paywalls, entitlements, offerings, RevenueCat setup, Lemon Squeezy integration, pricing models, or payment processing for mobile apps. Also triggers on: 'add subscriptions', 'paywall', 'premium features', 'free trial', 'freemium model', or 'how to charge users'."
---

# Monetization: Subscriptions & In-App Purchases

This skill covers payment integration for Flutter apps, from choosing a provider to implementing paywalls and managing entitlements.

## Provider Decision

| Feature | RevenueCat | Lemon Squeezy |
|---------|-----------|---------------|
| **Best for** | Mobile-first subscriptions | Web + mobile hybrid products |
| **Platforms** | iOS, Android, Amazon, Web | Web-first, mobile via webhooks |
| **Flutter SDK** | Official (`purchases_flutter`) | No Flutter SDK (REST API + webhooks) |
| **Paywall UI** | Built-in (`purchases_ui_flutter`) | Build your own |
| **Store compliance** | Handles StoreKit + Play Billing | You handle store integration |
| **Pricing** | Free tier (up to $2.5k MTR), then 1-2.5% | 5% + 50c per transaction |
| **Merchant of record** | No (you handle taxes) | Yes (they handle taxes globally) |
| **Ideal use case** | App Store/Play Store subscriptions | Digital products, SaaS, one-time purchases |

**Quick decision:**
- Selling subscriptions through App Store / Play Store → **RevenueCat**
- Selling digital products, licenses, or SaaS outside stores → **Lemon Squeezy**
- Both → RevenueCat for mobile + Lemon Squeezy for web/backend

## RevenueCat Setup

Read `references/revenuecat.md` for complete implementation guide.

### Architecture Overview

```
Flutter App
  └─ purchases_flutter SDK
      └─ RevenueCat Backend
          ├─ Apple StoreKit (iOS subscriptions)
          ├─ Google Play Billing (Android subscriptions)
          └─ Amazon Appstore (optional)
```

RevenueCat acts as a **single source of truth** for subscription state across platforms. It handles:
- Receipt validation
- Subscription status tracking
- Cross-platform purchase syncing
- Webhook delivery to your backend
- Analytics and churn metrics

### Quick Start

1. Create RevenueCat account at [app.revenuecat.com](https://app.revenuecat.com)
2. Create project, add app (iOS + Android)
3. Configure store credentials:
   - iOS: App Store Connect Shared Secret + In-App Purchase Key
   - Android: Google Play service account JSON
4. Create Products in each store (App Store Connect + Google Play Console)
5. Create Entitlements in RevenueCat (e.g., "premium")
6. Create Offerings with Packages (monthly, annual, lifetime)
7. Integrate SDK in Flutter app

### Essential Code

**Initialize SDK** (call once at app start):
```dart
import 'package:purchases_flutter/purchases_flutter.dart';

Future<void> initRevenueCat() async {
  await Purchases.setLogLevel(LogLevel.debug); // Remove in production
  final config = PurchasesConfiguration('your_revenuecat_api_key')
    ..appUserID = null; // Anonymous until user logs in
  await Purchases.configure(config);
}
```

**Check subscription status:**
```dart
Future<bool> isPremium() async {
  final customerInfo = await Purchases.getCustomerInfo();
  return customerInfo.entitlements.active.containsKey('premium');
}
```

**Show paywall (using RevenueCat UI):**
```dart
import 'package:purchases_ui_flutter/purchases_ui_flutter.dart';

Future<void> showPaywall() async {
  final result = await RevenueCatUI.presentPaywall(
    displayCloseButton: true,
  );
  if (result == PaywallResult.purchased) {
    // Grant access
  }
}
```

**Purchase a package:**
```dart
Future<void> purchase(Package package) async {
  try {
    final result = await Purchases.purchase(
      PurchaseParams.package(package),
    );
    if (result.customerInfo.entitlements.active.containsKey('premium')) {
      // Success
    }
  } on PlatformException catch (e) {
    final code = PurchasesErrorHelper.getErrorCode(e);
    if (code == PurchasesErrorCode.purchaseCancelledError) {
      // User cancelled, don't show error
    }
  }
}
```

## Lemon Squeezy Integration

Read `references/lemonsqueezy.md` for API details.

### Architecture Overview

```
Flutter App
  └─ WebView or deep link to checkout
      └─ Lemon Squeezy (handles payment + taxes)
          └─ Webhook to your backend
              └─ Backend updates user entitlements
                  └─ Flutter app checks entitlements
```

Lemon Squeezy is a **merchant of record** — they handle global tax compliance, invoicing, and payment processing. You receive payouts minus their fee.

### When to Use Lemon Squeezy Over RevenueCat

- Selling access to APIs, web dashboards, or digital content
- Need global tax compliance without handling it yourself
- Want a checkout experience outside of App Store/Play Store
- Selling one-time purchases (not just subscriptions)
- Apple/Google's 30% commission is too high for your margins

### Integration Pattern

Since there's no Flutter SDK, integrate via:

1. **Checkout URL** — open in WebView or external browser
2. **Webhooks** — receive payment events on your backend
3. **License validation** — verify purchase in your app via API

```dart
// Open Lemon Squeezy checkout
import 'package:url_launcher/url_launcher.dart';

Future<void> openCheckout(String productId) async {
  final url = 'https://your-store.lemonsqueezy.com/checkout/buy/$productId'
      '?checkout[custom][user_id]=user_123';
  await launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);
}
```

## Pricing Strategy

### Common Mobile Pricing Models

| Model | Example | Revenue pattern |
|-------|---------|----------------|
| Freemium | Free core + premium features | Recurring (subscriptions) |
| Free trial | 7-day trial → paid | High conversion if value is clear |
| One-time purchase | Unlock all features | Spiky, no recurring |
| Consumable | Credits, tokens | Variable, engagement-dependent |
| Tiered | Basic / Pro / Enterprise | Segmented by usage |
| Open-core | Free open-source edition + paid full product | Free edition works as top-of-funnel; third parties distributing it feed the paid product |

### Pricing Best Practices for Stores

- **Offer annual plans** — higher LTV, lower churn. Typical discount: 15-30% vs monthly
- **Free trial > freemium** for subscription apps (Apple and Google both support trial periods natively). People anchor a product's value to what it costs — free-forever risks "value-less" perception, so prefer a trial that converts over permanent free
- **Design a pricing ladder** — a cheap or free way in, then a paved walk up the value chain (the HubSpot/Slack tier pattern). Product-led growth: get the product in hands ASAP, convert on seats/features as usage grows. If freemium, keep upselling paths always visible (the LinkedIn pattern: free network effects, premium piled on top)
- **Price anchoring** — show annual price first, monthly price looks expensive by comparison
- **Localized pricing** — adjust prices by market purchasing power
- **Introductory offers** — Apple and Google support discounted first periods

Pricing is a day-one architecture decision, not a post-launch patch. For the strategy layer (SLIP framework, gain-pain ratio, minimum viable segment) see `app-gtm-release:gtm-fit`.

### Store Commission

| Store | Commission | Reduced rate |
|-------|-----------|-------------|
| Apple App Store | 30% | 15% (< $1M/year revenue via Small Business Program) |
| Google Play Store | 30% | 15% (first $1M/year) |
| Amazon Appstore | 30% | 20% (some categories) |

## Entitlement Architecture

Design entitlements to be **platform-agnostic** and **forward-compatible**:

```dart
// Good: abstract entitlement
enum AppEntitlement { premium, proPlan, teamPlan }

// Bad: tied to specific product
enum AppEntitlement { monthlySubscription, annualSubscription }
```

A user with "premium" entitlement might have:
- Monthly subscription via Google Play
- Annual subscription via App Store
- Lifetime purchase via promotion
- Free access via team plan

RevenueCat maps all of these to the same entitlement. Your app only checks `entitlements.active.containsKey('premium')`.
