# Cupertino Component Catalog (Flutter)

Reference for gap analysis. Use Context7 MCP for current docs:
```
resolve-library-id: "flutter cupertino"
query-docs: "Cupertino widgets available in Flutter for iOS-style design"
```

Apple HIG reference: https://developer.apple.com/design/human-interface-guidelines/components

## Component Catalog

| Component | Flutter Class | Atomic Level | M3 Equivalent |
|-----------|--------------|-------------|---------------|
| Action Sheet | CupertinoActionSheet | Organism | BottomSheet |
| Activity Indicator | CupertinoActivityIndicator | Atom | CircularProgressIndicator |
| Alert Dialog | CupertinoAlertDialog | Organism | AlertDialog |
| Context Menu | CupertinoContextMenu | Organism | PopupMenuButton |
| Date Picker | CupertinoDatePicker | Organism | showDatePicker |
| Navigation Bar | CupertinoNavigationBar | Organism | AppBar |
| Page Scaffold | CupertinoPageScaffold | Template | Scaffold |
| Picker | CupertinoPicker | Molecule | DropdownMenu |
| Search Field | CupertinoSearchTextField | Atom | SearchBar |
| Segmented Control | CupertinoSegmentedControl | Molecule | SegmentedButton |
| Slider | CupertinoSlider | Atom | Slider |
| Switch | CupertinoSwitch | Atom | Switch |
| Tab Bar | CupertinoTabBar | Organism | NavigationBar |
| Text Field | CupertinoTextField | Atom | TextField |
| Timer Picker | CupertinoTimerPicker | Organism | showTimePicker |

## Platform-Adaptive Pattern

For cross-platform apps, create adaptive wrappers:

```dart
class AdaptiveWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return switch (Theme.of(context).platform) {
      TargetPlatform.iOS || TargetPlatform.macOS => CupertinoVersion(),
      _ => MaterialVersion(),
    };
  }
}
```
