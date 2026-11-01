// MCP client for the OpenTwinBuilder server (rmcp/Rust, stdio transport).
// Stateless per session: each `callOtb` uses a short-lived connection; a
// `Session` keeps ONE process alive so stateful domain flows (commit → history)
// can be exercised. The A2A orchestrator is a separate layer.
import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import path from "node:path";

export interface ToolResult {
  content: Array<{ type: string; text: string }>;
  isError: boolean;
}

/** Resolve the OpenTwinBuilder binary (overridable via OTB_MCP_BIN). */
export function otbBin(): string {
  const env = process.env.OTB_MCP_BIN;
  if (env) return env;
  return path.resolve(
    __dirname,
    "../../../../../../lapc506/opentwinbuilder/target/debug/opentwinbuilder",
  );
}

interface Pending {
  resolve: (v: unknown) => void;
  reject: (e: Error) => void;
}

/** A persistent MCP connection to one OpenTwinBuilder process. */
export class Session {
  private child: ChildProcessWithoutNullStreams;
  private buf = "";
  private id = 0;
  private pending = new Map<number, Pending>();

  private constructor(child: ChildProcessWithoutNullStreams) {
    this.child = child;
    child.stdout.on("data", (d: Buffer) => this.onData(d));
    child.stderr.on("data", (d: Buffer) => {
      if (/panicked/i.test(d.toString())) {
        this.rejectAll(new Error(`OpenTwinBuilder stderr: ${d.toString().slice(0, 300)}`));
      }
    });
    child.on("error", (e) => this.rejectAll(e));
    child.on("exit", (code) => {
      this.rejectAll(new Error(`OpenTwinBuilder exited (code ${code})`));
    });
  }

  static async open(): Promise<Session> {
    const child = spawn(otbBin(), ["--mcp-server"], { stdio: ["pipe", "pipe", "pipe"] });
    const s = new Session(child);
    await s.request("initialize", {
      protocolVersion: "2026-07-28",
      capabilities: {},
      clientInfo: { name: "otb-feature-factory-client", version: "0.1.0" },
    });
    return s;
  }

  request(method: string, params: Record<string, unknown> = {}): Promise<unknown> {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error("timeout waiting for OpenTwinBuilder MCP response"));
      }, 15000);
      this.pending.set(id, {
        resolve: (v) => { clearTimeout(timer); resolve(v); },
        reject: (e) => { clearTimeout(timer); reject(e); },
      });
      this.child.stdin.write(JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n");
    });
  }

  callTool(name: string, args: Record<string, unknown> = {}): Promise<unknown> {
    return this.request("tools/call", { name, arguments: args });
  }

  close() {
    this.child.kill();
  }

  private onData(d: Buffer) {
    this.buf += d.toString();
    let i;
    while ((i = this.buf.indexOf("\n")) >= 0) {
      const line = this.buf.slice(0, i).trim();
      this.buf = this.buf.slice(i + 1);
      if (!line) continue;
      let msg: any;
      try { msg = JSON.parse(line); } catch { continue; }
      const p = this.pending.get(msg.id);
      if (!p) continue;
      this.pending.delete(msg.id);
      if (msg.error) p.reject(new Error(msg.error.message ?? JSON.stringify(msg.error)));
      else p.resolve(msg.result);
    }
  }

  private rejectAll(e: Error) {
    for (const p of this.pending.values()) p.reject(e);
    this.pending.clear();
  }
}

/** One-shot call on a throwaway session (self-contained tools). */
export async function callOtb(
  method: string,
  params: Record<string, unknown> = {},
): Promise<unknown> {
  const s = await Session.open();
  try {
    return await s.request(method, params);
  } finally {
    s.close();
  }
}

/** Convenience wrappers for the Feature Factory surface (one-shot). */
export const feature = {
  generate: (name: string, code: string) => callOtb("tools/call", { name: "feature_generate", arguments: { name, code } }),
  test: (name: string, code: string) => callOtb("tools/call", { name: "feature_test", arguments: { name, code } }),
  register: (name: string, code: string) => callOtb("tools/call", { name: "feature_register", arguments: { name, code } }),
};
