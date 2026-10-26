# CAD/CAM Handoff Skill — Multi-Tool Reference

## Purpose

This skill provides a structured reference for exporting from **CAD to CAM and to a manufacturer**: STEP/IGES vs native, mesh export settings (STL/3MF), drawing standards, and the quote package a shop needs.

## Capabilities

- **File formats**: per-process matrix (STEP/IGES for machining; STL/3MF for additive; native for parametric edits)
- **Mesh export settings**: resolution, units, and watertightness for STL/3MF
- **Drawing standards**: annotation and dimensioning conventions
- **Quote package**: minimum set (3D + 2D + material + finish + quantity + tolerance callouts)

## Usage

This skill enables CAD/CAM handoff guidance for agents operating across Claude Code, Cursor, and OpenCode. Given a "what do I send to the machine shop / how do I export for manufacturing" question, the agent returns the file format matrix per process, the drawing/annotation checklist, and the minimum quote package.

## References (APA)

- ISO. (2026). *ISO 10303 — STEP standard for the exchange of product model data*. https://www.iso.org/standard/76148.html
- Khronos Group. (2026). *glTF / 3MF — 3D asset and manufacturing formats*. https://3mf.io/
- Protolabs. (2026). *CAD file submission guidelines*. https://www.protolabs.com/
