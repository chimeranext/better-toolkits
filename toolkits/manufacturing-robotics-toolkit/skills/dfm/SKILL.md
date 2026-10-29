---
name: dfm
description: >
  Reference skill for design-for-manufacturability (DFM) rules,wall thickness,
  overhangs, support strategy, hole orientation, draft angles, minimum tool
  radius, tolerance stack-up. Use when reviewing a design for manufacturability.
---

# DFM Rules Skill — Multi-Tool Reference

## Purpose

This skill provides a structured reference for **design-for-manufacturability (DFM)** rules: wall thickness, overhangs, support strategy, hole orientation, draft angles for molding, minimum tool radius for CNC, and tolerance stack-up.

## Capabilities

- **Wall thickness**: minimum and recommended ranges per process
- **Overhangs / supports**: angle thresholds and support strategy for additive
- **Hole orientation**: axis alignment and minimum feature size per process
- **Draft angles**: for injection molding
- **Minimum tool radius**: for CNC machining
- **Tolerance stack-up**: accumulation analysis for assemblies

## Usage

This skill enables DFM guidance for agents operating across Claude Code, Cursor, and OpenCode. Given a "is this part manufacturable / review my design for 3D printing or CNC" question, the agent returns a checklist of violations with the numeric threshold for each rule and the process it applies to.

## References (APA)

- Boothroyd, G., Dewhurst, P., & Knight, W. (2011). *Product Design for Manufacture and Assembly* (3rd ed.). CRC Press.
- Protolabs. (2026). *Design for manufacturability guidelines*. https://www.protolabs.com/
- Autodesk. (2026). *Autodesk Fusion 360 — Integrated CAD, CAM, CAE, and PCB software*. https://www.autodesk.com/products/fusion-360/overview
