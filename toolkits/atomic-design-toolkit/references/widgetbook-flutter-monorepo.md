# Widgetbook in Flutter Monorepos — Templates & Compatibility

Reference for `/widgetbook-setup`. Templates assume the `apps/* + packages/*` monorepo layout with a shared UI package (`packages/{name}_ui`).

## Version Compatibility

Widgetbook minor releases raise the minimum Flutter SDK. Always pin a closed range matched to the local Flutter version — an open `^` constraint breaks the catalog on the next `pub upgrade` after a widgetbook release that outpaces the installed Flutter.

| Local Flutter | Safe widgetbook constraint |
|---------------|---------------------------|
| ≥ 3.44 | `^3.24.0` (or latest) |
| 3.23.x – 3.43.x | `">=3.23.0 <3.24.0"` |
| Older | Check the widgetbook changelog on pub.dev for the last minor supporting your SDK |

Rules:
- `widgetbook` and `widgetbook_generator` must share the same minor.
- `widgetbook_annotation` versions independently (lower numbers are normal).
- Verify against the pub.dev changelog at setup time — this table ages.

## pubspec.yaml Template

```yaml
name: widgetbook_workspace
description: "Widget catalog for {project} — atoms, molecules, organisms over the shared UI package."
publish_to: "none"
version: 0.1.0+1

environment:
  sdk: ^3.10.0

dependencies:
  flutter:
    sdk: flutter
  widgetbook_annotation: ^3.10.0
  widgetbook: ">=3.23.0 <3.24.0"   # pin per the compatibility table
  # THE single dependency that matters — the shared UI package, never the app.
  # Use ../../libs/{name}_ui when the monorepo uses a libs/ layout instead.
  {name}_ui:
    path: ../../packages/{name}_ui

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^6.0.0
  build_runner:
  widgetbook_generator: ">=3.23.0 <3.24.0"   # same minor as widgetbook

flutter:
  uses-material-design: true
```

**Why not `path: ../mobile`?** Depending on the app drags every app dependency (including native-only ones) into the catalog's web build, couples the catalog to app refactors, and lets the shared UI package sit at zero stories while the catalog showcases app internals. The catalog documents the design system; the design system lives in the UI package.

## main.dart Template

```dart
import 'package:flutter/material.dart';
import 'package:widgetbook/widgetbook.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;
import 'package:{name}_ui/{name}_ui.dart';

import 'main.directories.g.dart';
import 'showcase/design_system_showcase.dart';

void main() {
  runApp(const WidgetbookApp());
}

@widgetbook.App()
class WidgetbookApp extends StatelessWidget {
  const WidgetbookApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme(),
      darkTheme: AppTheme.darkTheme(),
      home: DefaultTabController(
        length: 2,
        child: Scaffold(
          appBar: AppBar(
            title: const Text('{Project} Design System'),
            bottom: const TabBar(
              tabs: [
                Tab(text: 'Widgetbook', icon: Icon(Icons.menu_book_rounded)),
                Tab(text: 'Showcase', icon: Icon(Icons.palette_rounded)),
              ],
            ),
          ),
          body: TabBarView(
            physics: const NeverScrollableScrollPhysics(),
            children: [
              Widgetbook.material(
                directories: directories,
                addons: [
                  MaterialThemeAddon(
                    themes: [
                      WidgetbookTheme(name: 'Light', data: AppTheme.lightTheme()),
                      WidgetbookTheme(name: 'Dark', data: AppTheme.darkTheme()),
                    ],
                  ),
                  AlignmentAddon(),
                ],
              ),
              const DesignSystemShowcase(),
            ],
          ),
        ),
      ),
    );
  }
}
```

The Showcase tab renders the design tokens directly (color scheme grid, typography scale, elevation samples) so the theme itself is documented even before the first widget story exists — this is the entire deliverable when no shared UI package exists yet.

## Use Case Template

One file per widget under `lib/use_cases/{level}/{widget_name}_use_case.dart`:

```dart
import 'package:flutter/material.dart';
import 'package:widgetbook/widgetbook.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;
import 'package:{name}_ui/{name}_ui.dart';

@widgetbook.UseCase(name: 'Default', type: MyWidget)
Widget buildMyWidgetUseCase(BuildContext context) {
  return MyWidget(
    label: context.knobs.string(label: 'Label', initialValue: 'Hello'),
    enabled: context.knobs.boolean(label: 'Enabled', initialValue: true),
  );
}
```

Regenerate directories after every batch:

```bash
dart run build_runner build --delete-conflicting-outputs
```

## Web-Incompatible Dependencies

These (and similar native-only plugins) break `flutter build web`. A widget that transitively imports one cannot enter the catalog:

| Dependency family | Examples |
|------------------|----------|
| Video conferencing | `jitsi_meet_flutter_sdk`, `agora_rtc_engine` |
| Bluetooth / hardware | `flutter_blue_plus`, `nfc_manager` |
| Device-bound | `camera` (partial web support), `geolocator` (config-dependent) |

**Promotion path** for an excluded widget: split it — the pure presentation layer (layout, tokens, states) moves into the UI package and gets a story with mocked data; the native integration stays in the app behind an interface. Document each exclusion + path in the audit report.

## vercel.json Template (deploy prepared, not executed)

```json
{
  "buildCommand": "flutter build web --release",
  "outputDirectory": "build/web",
  "framework": null
}
```

Place at `apps/widgetbook/vercel.json`. Present the deploy command (`vercel --cwd apps/widgetbook`) to the user; never run it — deploying is a human gate.

## Verification Checklist (all three, honestly)

```bash
cd apps/widgetbook
flutter analyze                      # 1. static analysis clean
flutter build web                    # 2. web build succeeds
python3 -m http.server 8080 --directory build/web &   # 3. served smoke test
curl -sf http://localhost:8080
```

A catalog that analyzes clean but white-screens when served is not done. Report each gate's actual result.
