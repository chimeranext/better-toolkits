name: Security Scanning

# Standardized security workflow (CodeQL + Trivy) — vendored by
# assurance-toolkit. Reuses the `security-scan` composite action from
# chimeranext/github-actions-templates. Tune the inputs per repo layout.
# CIS standard: ci-security-standards.md.
# NOTA: CodeQL NO tiene lenguaje "typescript" — usar "javascript" para TS/JS.
# Pasar "typescript" rompe el job con "Did not recognize the following languages".

on:
  push:
    branches:
      - main
      - develop
  pull_request:
    branches:
      - main
      - develop
  workflow_dispatch:

jobs:
  security:
    name: Security Scan (CodeQL + Trivy)
    runs-on: ubuntu-latest
    permissions:
      actions: read
      contents: read
      security-events: write
    steps:
      - uses: actions/checkout@v4

      - name: Security scan
        uses: chimeranext/github-actions-templates/security-scan@main
        with:
          languages: |
            {{ languages }}
          language-category: {{ language_category }}
          config-scan-ref: {{ config_scan_ref }}
          iac-scan-ref: {{ iac_scan_ref }}
