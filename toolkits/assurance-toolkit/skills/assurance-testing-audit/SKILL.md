# Assurance Testing Audit Skill — Multi-Tool Reference

## Purpose

This skill audits whether a repo's testing framework(s) are wired into the assurance evidence pipeline: mobile (Maestro, MobileWright, Patrol, Qualflare collectors), web (Playwright, Cypress, Vitest/Jest), and API/contracts (Schemathesis, Pact). Static scan + minimal probe; it does not execute suites.

## Capabilities

- **Stack detection**: pubspec.yaml (Flutter), phpunit.xml (Laravel), mix.exs (Elixir), vitest/jest/playwright/cypress config (web/TS), openapi/pact (API)
- **Adapter mapping**: framework → adapter (runner + collector) per the assurance-testing matrix
- **Evidence probe**: runner config present? collector wired (Qualflare `qf`, JUnit, Playwright trace.zip, Maestro report)?
- **Verdicts**: PASS (wired) / GAP (framework present, adapter missing) / N/A (absent)

## Usage

This skill enables testing-framework audit for agents operating across Claude Code, Cursor, and OpenCode. Entry: `/assurance-testing-audit`. Protocol SSOT: `references/testing/assurance-testing-audit/protocol.md`.

## References (APA)

- Mobile.dev. (2026). *Maestro MCP — mobile UI testing*. https://docs.maestro.dev/get-started/maestro-mcp
- Mobile.dev. (2026). *Maestro Flutter support*. https://docs.maestro.dev/get-started/supported-platform/flutter
- MobileWright. (2026). *MobileWright — mobile testing with a Playwright-style API*. https://github.com/mobile-next/mobilewright
- Qualflare. (2026). *Qualflare — flutter / maestro / playwright / vitest / webdriverio collectors*. https://github.com/Qualflare
- Schemathesis. (2026). *Schemathesis — property-based API testing*. https://schemathesis.io/
- Pact. (2026). *Pact — consumer-driven contract testing*. https://docs.pact.io/
