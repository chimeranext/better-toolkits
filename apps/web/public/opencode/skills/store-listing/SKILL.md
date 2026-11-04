---
name: store-listing
description: "Prepare store listings for Google Play and App Store including screenshots, descriptions, icons, feature graphics, keywords, and ASO (App Store Optimization). Use this skill when the user needs to create or improve store assets, write app descriptions, prepare screenshots, optimize keywords, plan A/B tests for listings, or handle localization. Triggers on: 'store listing', 'app screenshots', 'app description', 'feature graphic', 'ASO', 'keywords', 'store assets', 'app icon specs', or 'localize my listing'."
---

# Store Listing: Assets, Descriptions, and Optimization

This skill covers everything needed to create compelling store listings on both Google Play and Apple App Store.

## Required Assets Summary

### Google Play Store

| Asset | Spec | Required |
|-------|------|----------|
| App icon | 512x512 PNG, 32-bit, no transparency | Yes |
| Feature graphic | 1024x500 PNG or JPG | Yes |
| Phone screenshots | Min 2, max 8. 16:9 or 9:16 aspect ratio. Min 320px, max 3840px per side | Yes |
| 7" tablet screenshots | Same specs as phone | Recommended |
| 10" tablet screenshots | Same specs as phone | Recommended |
| Promo video | YouTube URL (not private/unlisted) | Optional |
| Short description | Max 80 characters | Yes |
| Full description | Max 4000 characters | Yes |

### Apple App Store

| Asset | Spec | Required |
|-------|------|----------|
| App icon | 1024x1024 PNG, no alpha channel, no rounded corners | Yes (in Xcode asset catalog) |
| iPhone 6.7" screenshots | 1290x2796 or 2796x1290 (landscape) | Yes |
| iPhone 5.5" screenshots | 1242x2208 or 2208x1242 | Yes (if supporting older devices) |
| iPad 12.9" screenshots | 2048x2732 or 2732x2048 | Yes (if supporting iPad) |
| App preview video | 15-30 sec, device-specific resolution | Optional |
| Description | No hard limit, first ~170 chars visible | Yes |
| Keywords | Max 100 characters, comma-separated | Yes |
| Subtitle | Max 30 characters | Yes |
| Promotional text | Max 170 characters (editable without review) | Optional |

## Screenshot Strategy

### What Makes Good Screenshots

Screenshots are the highest-impact store listing element. Follow this pattern:

1. **Lead with the value proposition** — first screenshot shows the app's primary benefit
2. **Show real UI** — actual app screens, not mockups or illustrations
3. **Add context text** — short headline above or below each screen explaining the benefit
4. **Show progression** — screenshots should tell a story (onboarding → core feature → result)
5. **Highlight unique features** — what differentiates you from competitors

### Screenshot Template Structure

```
┌─────────────────────┐
│  Headline text       │  ← 2-5 words describing the benefit
│  (e.g., "Track your │
│   pet's health")     │
│                      │
│  ┌───────────────┐   │
│  │               │   │
│  │   App Screen  │   │
│  │   (actual UI) │   │
│  │               │   │
│  └───────────────┘   │
│                      │
│  Brand color bg      │
└─────────────────────┘
```

### Recommended Screenshot Set (5-8 screenshots)

1. **Hero shot** — main value proposition
2. **Core feature 1** — primary functionality
3. **Core feature 2** — secondary functionality
4. **Social proof or data** — testimonials, stats, achievements
5. **Settings/personalization** — show customization options
6. **Unique differentiator** — what only your app does
7. **Onboarding** — how easy it is to get started (optional)
8. **Dark mode** — if supported, shows polish (optional)

### Tools for Creating Screenshots

- **Figma** — most flexible, create device frame templates
- **Screenshots.pro** — automated from real device captures
- **Previewed.app** — 3D device mockups
- **LaunchMatic** — AI-generated store screenshots

## Description Writing

### Google Play: Short Description (80 chars)

This appears in search results. Must be concise and keyword-rich.

**Formula:** `[Action verb] [core benefit] [differentiator]`

**Examples:**
- "Track pet health, find vets, and report emergencies near you"
- "Manage tasks with AI-powered scheduling and team collaboration"

### Google Play: Full Description (4000 chars)

**Structure:**
```
[Opening hook — 1-2 sentences describing the problem you solve]

[Core features — bullet list with benefit-focused language]
- Feature 1: what it does and why it matters
- Feature 2: ...
- Feature 3: ...

[Social proof — downloads, ratings, press mentions]

[How it works — brief workflow description]

[Call to action — download now]

[Relevant keywords naturally integrated throughout]
```

### Apple App Store: Description

**Structure:**
```
[First 170 characters are critical — visible before "more" tap]

[Feature highlights with benefit framing]

[What's new or unique]

[Privacy commitment if relevant]
```

### Apple App Store: Keywords (100 chars)

- Comma-separated, no spaces after commas
- Do NOT repeat words from your app name or subtitle (Apple already indexes those)
- Use singular forms (Apple matches plurals automatically)
- Include competitor names only if truly relevant
- Include common misspellings of your category

**Example:** `pet,health,veterinarian,rescue,lost,found,microchip,vaccine,report`

### Apple App Store: Subtitle (30 chars)

Appears below app name in search results. Complement (don't repeat) the name.

**Examples:**
- App name: "AltruPets" → Subtitle: "Pet Safety & Emergency Reports"
- App name: "TaskFlow" → Subtitle: "AI-Powered Team Scheduling"

## App Icon Guidelines

### Both Platforms
- Simple, recognizable at small sizes (as small as 29x29 points on iOS)
- Distinct silhouette — identifiable even blurred
- Limited color palette (2-3 colors max)
- No text (except single letters/initials)
- No photos (too detailed at small sizes)
- No screenshots of the app UI

### Google Play Specific
- Google applies rounded rectangle mask — do not add your own rounding
- 512x512 PNG, 32-bit color, no transparency
- Test at 48x48 and 96x96 for visibility

### App Store Specific
- Apple applies rounded rectangle mask — do not add your own rounding
- 1024x1024 PNG, no alpha channel
- Different sizes auto-generated by Xcode from asset catalog
- Must not be substantially similar to other Apple app icons

## Feature Graphic (Google Play)

The 1024x500 banner displayed at the top of your Play Store listing.

**Best practices:**
- Include app icon in the graphic (brand recognition)
- Add a tagline or value proposition
- Use your brand colors
- Ensure text is readable on mobile (large font)
- Show a preview of the app UI if possible
- Do NOT use the full description — this should be a visual hook

## Localization

### Google Play
- Localize store listing in **all languages your app supports**
- Google offers translation services (paid)
- Custom store listings: up to 50 country-specific versions
- A/B test localized listings with Store Listing Experiments

### App Store
- Localize for each language you support
- Keywords are per-locale — different keywords for different markets
- Screenshots can be locale-specific

### Localization Priority
1. English (base)
2. Languages where you expect the most users
3. Languages with large addressable markets (Spanish, Portuguese, Chinese)
4. Always localize screenshots — they convert better than translated text alone

## Store Listing Optimization (ASO)

### Google Play Experiments

1. Go to **Store presence > Store listing experiments**
2. Create experiment: test different icons, screenshots, descriptions, or feature graphics
3. Split traffic 50/50
4. Run for at least 7 days with statistical significance
5. Apply winner

### Key ASO Metrics
- **Impression → Visit rate** (search result quality)
- **Visit → Install rate** (listing quality)
- **Install → Retain rate** (app quality matching expectations)

### Optimization Checklist
- [ ] Title includes primary keyword
- [ ] Short description includes secondary keywords
- [ ] Full description uses keywords naturally (not stuffed)
- [ ] Screenshots show benefits, not features
- [ ] Feature graphic creates visual interest
- [ ] Ratings and reviews are positive (or actively managed)
- [ ] Regular listing updates signal active maintenance
