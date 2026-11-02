---
name: desktop-signing
description: "Code-sign and notarize desktop apps for Windows and macOS so they install without SmartScreen or Gatekeeper warnings. Covers Windows signing (Azure Trusted Signing — the modern cloud alternative to EV certs — and the traditional signtool + .pfx / OV-token path) and macOS signing (Developer ID certificates, hardened runtime, and notarization via app-specific password or App Store Connect API key). Framework-agnostic: reusable by Electron (Electron Forge), Flutter desktop (macOS/Windows), Swift/Tauri, and any native desktop binary. Use this skill when the user asks about code signing a desktop app, notarization, Gatekeeper, SmartScreen warnings, Azure Trusted Signing, Developer ID, EV/OV certificates, signtool, @electron/windows-sign, @electron/osx-sign, @electron/notarize, 'sign my Windows app', 'notarize my Mac app', or 'why does my desktop app show an unknown-publisher warning'."
---

# Desktop Code Signing & Notarization (Windows + macOS)

Unsigned desktop apps trigger scary OS warnings — **SmartScreen** ("Windows protected your PC") on Windows and **Gatekeeper** ("cannot be opened because the developer cannot be verified") on macOS. Signing (and, on macOS, notarization) is what makes an app install cleanly for end users distributed outside an app store.

This skill is **framework-agnostic**. The certificate/notarization mechanics are identical whether the binary comes from Electron Forge, Flutter desktop, Tauri, or Swift — only the config file that invokes them differs. Examples below lead with Electron Forge (the most common pipeline) and note the equivalent for other stacks.

## When to invoke

- During `/app-gtm-release:ship-flutter` (macOS/Windows desktop targets), `/app-gtm-release:ship-swift` (macOS), or any Electron/Tauri desktop release
- When the user asks: "sign my Windows app", "notarize my Mac app", "get rid of the SmartScreen warning", "Azure Trusted Signing", "Developer ID", "hardened runtime"
- Before shipping a desktop binary through `alt-distribution` (direct download, MSIX sideload, Deno desktop) — signing is what makes those channels trustworthy

> **Not needed for store-signed paths.** If you ship through the **Microsoft Store** (MSIX) or the **Mac App Store**, the store signs for you — see `msstore-submission`. This skill is for everything distributed *outside* a store.

## Windows Signing

### Option A — Azure Trusted Signing (recommended, modern)

**Azure Trusted Signing** is Microsoft's cloud signing service and the modern replacement for buying an EV certificate. It's the **cheapest option**, keeps the private key in Azure (nothing on the build machine), and **eliminates SmartScreen warnings** by building reputation under Microsoft's trusted CA.

**Availability (as of Oct 2025 — version-sensitive, re-check):**
- Organizations based in the **US/Canada** that have been established for **3+ years**
- **Individual developers** in the US/Canada

**Toolchain (Electron Forge):**
- `@electron/windows-sign` **≥ 1.2.2**
- `dotenv-cli` (to load the credential env file)
- `Azure.CodeSigning.Dlib.dll` and `signtool.exe` available on the runner

**Config** in `forge.config.ts` plus a `.env.trustedsigning` credential file:

```ts
// forge.config.ts (Electron Forge) — Windows signing via Trusted Signing
windowsSign: {
  signToolPath: 'C:\\path\\to\\signtool.exe',   // paths MUST have no spaces
  signWithParams: '/v /debug /dlib "C:\\path\\to\\Azure.CodeSigning.Dlib.dll" ' +
    '/dmdf "C:\\path\\to\\metadata.json"',
  timestampServer: 'http://timestamp.acs.microsoft.com',
}
```

> **⚠️ GOTCHAs:**
> - Every path (signtool, Dlib, metadata) **must contain no spaces** — the signing invocation breaks on spaces.
> - **Never commit `.env.trustedsigning`.** Load it in CI as secrets; add it to `.gitignore`.

### Option B — Traditional certificate (signtool + .pfx / OV token)

The legacy path uses `signtool.exe` (ships with the Windows SDK / Visual Studio) and a purchased code-signing certificate.

```ts
// forge.config.ts — traditional cert
windowsSign: {
  certificateFile: process.env.WINDOWS_CERT_FILE,       // path to .pfx
  certificatePassword: process.env.WINDOWS_CERT_PASSWORD,
}
```

> **⚠️ Version-sensitive — software OV certs are gone.** Since **2023-06-01**, OV (Organization Validation) code-signing certificate private keys must live on an **HSM meeting FIPS 140-2 Level 2**. CAs no longer sell software-file OV certs — you get a **hardware token** instead, which is awkward in CI. This is the main reason to prefer **Azure Trusted Signing** for new projects: no token, no HSM, key stays in the cloud.

### Other frameworks (Windows)

| Stack | Where signing is configured |
|---|---|
| Electron Forge | `windowsSign` in `forge.config.ts` (above) |
| electron-builder | `win.signtoolOptions` / `win.azureSignOptions` |
| Tauri | `tauri.conf.json` → `bundle.windows.certificateThumbprint` (or Trusted Signing via a custom sign command) |
| Flutter/native | Invoke `signtool sign` directly on the built `.exe` in CI |

## macOS Signing & Notarization

Since **macOS 10.15 Catalina**, apps distributed outside the Mac App Store require **both** code signing **and** notarization to launch without a Gatekeeper block. You need **Xcode** (for the signing toolchain) and an **Apple Developer Program** membership.

### Certificates

| Certificate | Signs | Used for |
|---|---|---|
| **Developer ID Application** | The `.app` bundle and its binaries | Distribution **outside** the Mac App Store (direct download, DMG) |
| **Developer ID Installer** | A `.pkg` installer | Distributing a signed installer package outside the Mac App Store |

(For the **Mac App Store**, you instead use Apple Distribution certs and skip notarization — Apple reviews it. This skill targets outside-store distribution.)

### Step 1 — Sign with a hardened runtime

```ts
// forge.config.ts (Electron Forge) — uses @electron/osx-sign under the hood
packagerConfig: {
  osxSign: {
    optionsForFile: (filePath) => ({
      // entitlements enable the hardened runtime exceptions your app needs
      entitlements: 'build/entitlements.mac.plist',
      hardenedRuntime: true,
    }),
  },
}
```

The **hardened runtime** is mandatory for notarization. Declare only the entitlements you actually use (e.g. `com.apple.security.cs.allow-jit` for JIT engines).

### Step 2 — Notarize

Notarization uploads the signed app to Apple, which scans it and issues a ticket that Gatekeeper trusts. Electron Forge runs this via `@electron/notarize`:

```ts
// forge.config.ts
packagerConfig: {
  osxNotarize: {
    // Method B — App Store Connect API key (recommended for CI)
    appleApiKey: process.env.APPLE_API_KEY_PATH,   // path to the .p8 file
    appleApiKeyId: process.env.APPLE_API_KEY_ID,
    appleApiIssuer: process.env.APPLE_API_ISSUER,
  },
}
```

Three authentication methods, in order of CI-friendliness:

| Method | Fields | Notes |
|---|---|---|
| **API key** (recommended) | `appleApiKey` (`.p8` path), `appleApiKeyId`, `appleApiIssuer` | Cleanest for CI; key generated in App Store Connect → Users and Access → Keys |
| **Apple ID** | `appleId`, `appleIdPassword` (an **app-specific password**, not your Apple ID password), `teamId` | Simple but ties to a personal account |
| **Keychain profile** | `keychainProfile` | References credentials stored via `xcrun notarytool store-credentials` |

> **⚠️ Never put these in plaintext or commit them.** Load the `.p8`, key ID, issuer, or app-specific password from CI secrets / env vars. The `.p8` file is a private key — treat it like a keystore.

After notarization, **staple** the ticket to the app (`xcrun stapler staple My.app`) so it validates offline — Electron Forge does this automatically once notarization succeeds.

### Reusable across Flutter macOS, Swift, and Tauri

The macOS signing + notarization flow (Developer ID Application cert → hardened runtime → notarize with an App Store Connect **API key** → staple) is **identical regardless of framework**. Only the invocation differs:

| Stack | Signing entry point |
|---|---|
| Electron Forge | `osxSign` / `osxNotarize` in `forge.config.ts` (above) |
| Flutter desktop (macOS) | Sign the built `.app` with `codesign --deep --options runtime`, then `xcrun notarytool submit` |
| Swift / Xcode | Xcode "Developer ID" distribution export, or `codesign` + `notarytool` in CI |
| Tauri | `tauri.conf.json` → `bundle.macOS.signingIdentity` + `tauri signer` / notarize step |

So `ship-flutter` (macOS target) and `ship-swift` should point here rather than re-documenting notarization.

## CI/CD wiring

Both platforms need their credentials as CI secrets. Suggested set:

| Secret | Platform | Purpose |
|---|---|---|
| `AZURE_TRUSTED_SIGNING_*` (tenant/client/secret + account/profile) | Windows | Azure Trusted Signing auth |
| `WINDOWS_CERT_FILE`, `WINDOWS_CERT_PASSWORD` | Windows | Traditional `.pfx` path (Option B) |
| `APPLE_API_KEY` (`.p8`), `APPLE_API_KEY_ID`, `APPLE_API_ISSUER` | macOS | Notarization via API key |
| `APPLE_TEAM_ID` | macOS | Signing team identifier |

See `cicd-setup` for how secrets are grouped and injected per platform. Windows signing runs on a Windows runner; macOS signing must run on a macOS runner (Gatekeeper tooling is macOS-only).

## Quick decision guide

| Situation | Do this |
|---|---|
| New Windows app, US/Canada dev | **Azure Trusted Signing** — cheapest, no token, kills SmartScreen |
| Windows app, outside US/Canada (no Trusted Signing yet) | Buy an OV/EV cert on a hardware token; sign with `signtool` |
| Any macOS app distributed outside the Mac App Store | Developer ID Application + hardened runtime + notarize (API key) |
| Shipping via Microsoft Store or Mac App Store | Skip this skill — the store signs (`msstore-submission`) |
