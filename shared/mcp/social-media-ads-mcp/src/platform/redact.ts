// Redaction — applied at the router chokepoint so an adapter cannot forget it (design D7).
// Guarantees: no token/secret value, and no credential-shaped key-value pair, reaches
// tool output, error messages, logs or the change journal.

import { allSecretValues } from "./credentials.js";

const KEY_RE = /((?:access_?token|refresh_?token|client_?secret|developer_?token|bearer|authorization)\s*[=:]\s*)("[^"]*"|\S+)/giu;

export function redact(text: string): string {
  let out = text.replace(KEY_RE, "$1[redacted]");
  for (const secret of allSecretValues()) {
    if (secret.length > 4) out = out.split(secret).join("[redacted]");
  }
  return out;
}

/** Safe clone: strips credential keys from plain objects before any output path. */
export function stripCredentialFields(value: unknown): unknown {
  const CRED_KEYS = new Set([
    "access_token",
    "refresh_token",
    "client_secret",
    "developer_token",
    "credentials",
    "per_call_credentials",
    "authorization",
    "authorization_header",
  ]);
  const walk = (v: unknown): unknown => {
    if (Array.isArray(v)) return v.map(walk);
    if (v && typeof v === "object") {
      const o: Record<string, unknown> = {};
      for (const [k, inner] of Object.entries(v as Record<string, unknown>)) {
        if (CRED_KEYS.has(k.toLowerCase())) continue;
        o[k] = walk(inner);
      }
      return o;
    }
    return v;
  };
  return walk(value);
}
