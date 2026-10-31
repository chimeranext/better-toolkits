---
name: flutter-error-tracking
description: >
  Error tracking — Sentry/Crashlytics, breadcrumbs, source maps. Migrated;
  protocol SSOT in assurance liveness.
---

# flutter-error-tracking — multi-harness entry (migrated)

> Source: `flutter-boilerplate-monorepo-template/skills/flutter/error-tracking`.
> Protocol SSOT: `toolkits/assurance-toolkit/references/liveness/protocol.md`.
> Template copy retained as shim.

Automatic capture, enriched context, CI integration (source maps).
Errors are an MTTD signal, not just logs.

Dev-time: `artdima/peek` (MIT) inspects in-app network only in debug and exports
cURL/HAR to attach to reports — see `language/dart/frameworks/flutter`.
