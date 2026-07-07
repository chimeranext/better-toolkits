# Atomic Design Methodology for Flutter

Based on Brad Frost's Atomic Design, adapted for Flutter widget hierarchies.

## The Five Levels

### 1. Atoms
The smallest building blocks. Single-purpose, stateless, no business logic.

**Characteristics:**
- Extends `StatelessWidget`
- Accepts only primitive props (String, Color, VoidCallback, bool)
- Uses design tokens from `Theme.of(context)`
- No providers, no state management, no API calls

**Examples:** AppButton, AppAvatar, AppBadge, AppIcon, AppDivider, AppChip

**Location:** `core/widgets/atoms/`

### 2. Molecules
Groups of atoms functioning together as a unit with local interaction logic.

**Characteristics:**
- Composes 2+ atoms
- May have local form state (TextEditingController, FocusNode)
- No external state management (no providers/blocs)

**Examples:** SearchBar (TextInput + Icon + ClearButton), UserChip (Avatar + Name + Badge), RatingStars (Icon x5 + count)

**Location:** `core/widgets/molecules/`

### 3. Organisms
Complex components with data binding and state management.

**Characteristics:**
- Composes molecules with state providers
- Uses Riverpod/Bloc/Provider for data
- Handles loading, error, and empty states
- May include real-time subscriptions

**Examples:** UserList (List + UserChip + Pagination), CommentThread (CommentCard x N + Input + Submit), ProductGrid (ProductCard x N + Filter + Sort)

**Location:** `core/widgets/organisms/` (shared) or `features/{feature}/presentation/organisms/` (feature-specific)

### 4. Templates
Page-level layout structures with slots for organisms. No data, just layout.

**Characteristics:**
- Defines the page structure (AppBar, body, FAB, bottom nav)
- Takes organisms as parameters (slots)
- Handles responsive layout (mobile vs tablet)
- No data fetching, no state

**Examples:** DashboardTemplate, DetailTemplate, ListDetailTemplate, FormTemplate

**Location:** `features/{feature}/presentation/templates/`

### 5. Pages
Templates bound to routes and data providers. The entry point for navigation.

**Characteristics:**
- Binds a template to route parameters
- Initializes providers/controllers
- Handles deep linking
- Registered in the router

**Examples:** DashboardPage, UserProfilePage, RescueDetailPage

**Location:** `features/{feature}/presentation/pages/`

## Decision Tree

```
Is it a single UI element with no dependencies?
  → ATOM

Does it compose 2+ atoms with local interaction?
  → MOLECULE

Does it need external state (provider/bloc)?
  → ORGANISM

Does it define page layout with slots?
  → TEMPLATE

Is it bound to a route?
  → PAGE
```

## File Naming

- Widget: `snake_case.dart` (e.g., `user_avatar.dart`)
- Widgetbook: `snake_case.widgetbook.dart` alongside the widget
- Class: `PascalCase` (e.g., `UserAvatar`)
- One widget per file (exceptions for tightly coupled variants)
