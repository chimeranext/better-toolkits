# convention: architecture-patterns
id: architecture-patterns · version: 0.1.0 · status: draft · level: platform
extracted_at: 2026-11-01 · ttl_expires: 2027-05-01
parent: none

## GOAL

A codebase that is "well written" under this record applies the canonical
architecture **patterns** and avoids the canonical **anti-patterns** catalogued
by the Microsoft Azure Architecture Center, whenever they apply to the actual
deployment shape (modular monolith, microservices, or hybrid).

## SOURCES

| # | kind | ref (ID + versión/fecha) | weight | purpose |
|---|------|--------------------------|--------|----------|
| S1 | docs | Microsoft Azure Architecture Center — Patterns (learn.microsoft.com/en-us/azure/architecture/patterns/) | load-bearing | RULE R1 |
| S2 | docs | Microsoft Azure Architecture Center — Anti-patterns (learn.microsoft.com/en-us/azure/architecture/antipatterns/) | load-bearing | RULE R2 |
| S3 | docs | Microsoft Azure Architecture Center — Microservices model (domain-analysis, tactical-DDD, microservice-boundaries) | load-bearing | RULE R3 |

## RULES

- R1 [pipe-discipline] Architecture solutions SHALL be drawn from the canonical
  pattern catalog (S1) where applicable (e.g. Strangler Fig, Circuit Breaker,
  Queue-Based Load Leveling, Saga, Ambassador, Anti-Corruption Layer, Bulkhead,
  Cache-Aside, Competing Consumers, Claim Check, Gateway Routing, etc.) rather
  than inventing new ad-hoc shapes.
- R2 [pipe-discipline] Known anti-patterns (S2) SHALL be avoided and flagged
  when detected (e.g. Extraneous Fetching, No Caching, Retry Storm, Busy
  Database, Synchronous I/O, Thread Pools, Monolithic Persistence, God Object,
  Stovepipe, etc.).
- R3 [pipe-discipline] The deployment shape (modular monolith vs microservices)
  SHOULD be explicit, and the choice of patterns must be consistent with it
  (S3): a modular monolith may still apply Strangler Fig for gradual
  decomposition toward services; microservice boundaries SHALL respect the
  domain analysis and tactical DDD ("no smaller than an aggregate, no larger
  than a bounded context").

## COUNTEREXAMPLES

```text
# ❌ wrong: god object — one class/module that orchestrates everything
class OrderService { // mails, PDFs, billing, inventory, notifications...
}

# ✅ right: bounded responsibility, single pattern per seam
class OrderService { readonly OrderRepository; publish(OrderPlaced); }
```

## GATES

- local: review of architecture docs + the RDP detector families (explicit-
  architecture, strangler-fig).
- CI: RDP `explicit-architecture` / `strangler-fig` detectors where installed.

## LESSONS

- L1: Pattern/anti-pattern choice depends on deployment shape; don't copy
  microservice patterns into a monolith blindly. → RULE R3
- L2: The Strangler Fig pattern is the bridge from monolith to services; it is
  covered more deeply by RDP family 5. → RULE R1

## RECEIPT

<!-- candidate_sha + risk tier + lenses + verdict — emitted in the dogfood of
     the architecture-patterns record -->
