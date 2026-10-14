# Dogfood — platform/diagrams/mermaid-github

Canonical Mermaid extracted from assurance triage hub (post-fix profile).

## Manual gate (required until CI mmdc)

1. Open a draft PR that embeds `hub-flowchart.mmd` and `hub-sequence.mmd` in fenced
   `mermaid` blocks (or view `toolkits/assurance-toolkit/references/triage/protocol.md`
   after assurance PR merges).
2. On github.com, confirm both diagrams render (no “Unable to render rich display”).
3. Check RULES D1–D5 in `platform/diagrams/mermaid-github.md`.

## Optional CLI

```bash
npx --yes @mermaid-js/mermaid-cli@11 -i hub-flowchart.mmd -o /tmp/hub-flowchart.svg
```

Requires a working Chromium/Puppeteer install on the machine.
