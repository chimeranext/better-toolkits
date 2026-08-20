---
description: Generate a random secret with a CSPRNG and stage it with mode 0600, via a password-generator GUI (length slider, character-class toggles, regenerate). The value never appears in the conversation log or terminal history — only its length, alphabet and entropy do. Use /secret-use to consume it and /secret-clear to wipe. Also prints a SHA-256 fingerprint so two stores can be compared without either revealing its value.
priority: 90
---
# /secret-generate

Read and follow [`references/secret-generate/protocol.md`](../references/secret-generate/protocol.md) (protocol SSOT).

`$ARGUMENTS` unchanged from the upstream protocol.
