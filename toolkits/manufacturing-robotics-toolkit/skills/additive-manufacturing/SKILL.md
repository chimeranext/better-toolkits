---
name: additive-manufacturing
description: >
  Reference skill for choosing between FDM, SLA/DLP, and SLS/MJF based on part
  size, tolerance, surface finish, material properties, and run size. Use when
  selecting an additive manufacturing process.
---

# Additive Manufacturing Selection Skill — Multi-Tool Reference

## Purpose

This skill provides a structured reference for choosing between **FDM, SLA/DLP, and SLS/MJF** based on part size, tolerance, surface finish, material properties, and run size.

## Capabilities

- **Process comparison**: FDM / SLA / SLS table with tolerance ranges, minimum feature size, typical materials, cost drivers
- **Selection logic**: recommendation tied to stated constraints (size, tolerance, finish, material, run size)
- **Trade-offs**: per-process strengths and limitations

## Usage

This skill enables additive-manufacturing guidance for agents operating across Claude Code, Cursor, and OpenCode. Given a "which 3D printing process should I use for this part" question, the agent returns the comparison table and a recommendation tied to the stated constraints.

## References (APA)

- Ultimaker. (2026). *Cura — 3D printing slicing software*. https://ultimaker.com/software/ultimaker-cura
- Prusa Research. (2026). *PrusaSlicer — 3D printing slicer software*. https://www.prusa3d.com/prusaslicer/
- 3D Hubs / Protolabs. (2026). *3D printing technology comparison*. https://www.protolabs.com/
