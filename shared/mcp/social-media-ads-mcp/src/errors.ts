// Structured error envelope. Never an empty successful result for an impossible op.
// Spec: specs/ads-multi-network-mcp/spec.md — unsupported vs not_implemented are distinct.

export type ErrorCode =
  | "guardrail"
  | "unsupported"
  | "not_implemented"
  | "not_configured"
  | "auth"
  | "validation"
  | "network"
  | "error";

export class OpError extends Error {
  code: ErrorCode;
  network?: string;
  operation?: string;
  details?: Record<string, unknown>;

  constructor(
    code: ErrorCode,
    message: string,
    opts: { network?: string; operation?: string; details?: Record<string, unknown> } = {},
  ) {
    super(message);
    this.name = "OpError";
    this.code = code;
    this.network = opts.network;
    this.operation = opts.operation;
    this.details = opts.details;
  }
}

/** Serialization-safe view used by MCP and CLI; redaction runs over this. */
export function envelopeOf(err: OpError): Record<string, unknown> {
  return {
    code: err.code,
    ...(err.network ? { network: err.network } : {}),
    ...(err.operation ? { operation: err.operation } : {}),
    message: err.message,
    ...(err.details ? { details: err.details } : {}),
  };
}
