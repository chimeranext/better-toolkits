---
description: >
  Audit whether observability actually WORKS, not whether it is configured. Verifies
  telemetry is received (not merely emitted), that the configured credential points at a
  live destination, that init paths cannot silently disable monitoring, that alert channels
  carry real traffic and have named owners, and that every alert has been demonstrated
  capable of firing. Runtime audit against live systems — not a static repo scan. Accepts a
  target as $ARGUMENTS.
---
# /observability-audit — MOVED (shim)

> **DEPRECATION WARNING:** this command moved to `/assurance:observability-audit`
> (assurance-toolkit, pilar liveness). This file is a thin shim and will be removed
> in a future minor. Behavior is unchanged — follow the new SSOT:
> [`references/liveness/protocol.md`](../../assurance-toolkit/references/liveness/protocol.md).
