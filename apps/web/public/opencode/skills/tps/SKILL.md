---
name: tps
description: >
  Reference skill for the Toyota Production System (TPS),Jidoka and Just-in-Time
  pillars, Heijunka foundation, and 5S methodology. Use when implementing lean
  production principles.
---

# Toyota Production System Skill — Multi-Tool Reference

## Purpose

This skill provides a structured reference for the **Toyota Production System (TPS)**: its two pillars (Jidoka and Just-in-Time), its foundation (Heijunka/level scheduling), and the 5S methodology.

## Capabilities

- **Jidoka (autonomation)**: processes with built-in self-control; the line stops on anomaly; prevents defective parts from advancing
- **Just-in-Time**: "right part, right time, right amount"; the 8 fundamentals (flexible resources, cellular layout, pull system, reduced setup times, zero stock, zero errors, quality at source, total productive maintenance)
- **Heijunka**: level scheduling to smooth production
- **5S**: Seiri (Clasificación), Seiton (Orden), Seiso (Limpieza), Seiketsu (Estandarización), Shitsuke (Disciplina)

## Usage

This skill enables TPS guidance for agents operating across Claude Code, Cursor, and OpenCode. Given a "what is TPS / explain Jidoka / explain JIT" question, the agent returns the two-pillar model, Heijunka leveling, and the 5S table.

## Verification (BDD · Jidoka · No-Workarounds)

When *verifying* that a TPS/lean capability behaves as specified (a process model, a
simulator, a quality gate, an MCP tool), use the **`jidoka-verification`** skill. It
turns the Jidoka pillar into an executable verification discipline: assert behavior in
natural language (Given/When/Then), **stop on any anomaly** (the *andon* cord), and
refuse any pass that requires a workaround (a suppressed signal is a failure).

## References (APA)

- Liker, J. K. (2020). *The Toyota Way: 14 Management Principles from the World's Greatest Manufacturer* (2nd ed.). McGraw-Hill.
- Womack, J. P., & Jones, D. T. (2003). *Lean Thinking: Banish Waste and Create Wealth in Your Corporation* (2nd ed.). Free Press.
