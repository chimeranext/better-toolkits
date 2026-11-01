name: Security Scanning

# Stardized security workflow (CodeQL + Trivy) — vendored by
# assurance-toolkit. Apply via `assurance-repo-setup` to every monorepo.
# CodeQL: SAST (languages via `{{ languages }}`). Trivy: config/fs/secret scan
# with fail-on severity. Adjust `scan-ref` paths per repo layout.

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
  # ==========================================
  # CodeQL - Static Application Security Testing
  # ==========================================
  codeql:
    name: CodeQL Security Analysis
    runs-on: ubuntu-latest
    permissions:
      actions: read
      contents: read
      security-events: write

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Initialize CodeQL
        uses: github/codeql-action/init@v3
        with:
          languages: |
            {{ languages }}
          queries: security-extended

      - name: Autobuild
        uses: github/codeql-action/autobuild@v3

      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v3
        with:
          category: "/language:{{ language_category }}"

      - name: Upload results to security tab
        uses: github/codeql-action/upload-results@v3
        if: always()

  # ==========================================
  # Trivy - Container / Config / IaC scanning
  # ==========================================
  trivy-scan:
    name: Trivy Container Scan
    runs-on: ubuntu-latest
    permissions:
      contents: read
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Run Trivy vulnerability scanner (config)
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'config'
          scan-ref: '{{ config_scan_ref }}'
          format: 'table'
          exit-code: '1'
          ignore-unfixed: true
          severity: 'CRITICAL,HIGH'

      - name: Scan Infrastructure as Code
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '{{ iac_scan_ref }}'
          scanners: 'misconfig,secret'
          format: 'table'
          exit-code: '1'
          severity: 'CRITICAL,HIGH'
