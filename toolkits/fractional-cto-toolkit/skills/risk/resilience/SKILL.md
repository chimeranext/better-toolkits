---
name: resilience
disable-model-invocation: true
description: 'Applies resilience engineering — anticipation, fault injection, game days, and blameless postmortems — for use when verifying a system degrades safely under failure. Delivers a resilience posture assessment and fault-injection plan.'
---
# Resilience Engineering

Read and follow [`references/risk/resilience/protocol.md`](../../../references/risk/resilience/protocol.md) (protocol SSOT). Failure is assumed, not exceptional; the question is always how the system degrades and recovers, and every fault-injection experiment must have a defined blast radius and a rollback path.