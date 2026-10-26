// Change journal (design D11, media-buyer-operations spec): JSONL appended at the single
// request chokepoint in the router so an adapter cannot forget it. Redaction applied.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { redact } from "./redact.js";

export interface JournalEntry {
  ts: string; // ISO-8601 UTC
  network?: string;
  operation: string; // router operation name
  entity_level?: string;
  entity_id?: string;
  field?: string;
  before?: unknown;
  after?: unknown;
  label?: string; // manual-entry marker ("external ui change")
}

export function journalPath(): string {
  const state = process.env.MEDIA_BUYER_JOURNAL_PATH;
  if (state && state.trim() !== "") return state;
  const xdgState = process.env.XDG_STATE_HOME;
  const stateDir = xdgState && xdgState.trim() !== "" ? xdgState : path.join(os.homedir(), ".local", "state");
  return path.join(stateDir, "media-buyer-toolkit", "journal.jsonl");
}

export function append(entry: JournalEntry): JournalEntry {
  const full: JournalEntry = { ts: new Date().toISOString(), ...entry };
  const line = redact(JSON.stringify(full));
  const p = journalPath();
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.appendFileSync(p, line + "\n", "utf8");
  return full;
}

export function readLast(limit = 50): JournalEntry[] {
  const p = journalPath();
  if (!fs.existsSync(p)) return [];
  const lines = fs.readFileSync(p, "utf8").trim().split("\n");
  const out: JournalEntry[] = [];
  for (const line of lines.slice(-limit)) {
    if (line.trim() === "") continue;
    try {
      out.push(JSON.parse(line) as JournalEntry);
    } catch {
      // unparseable line — skip, never crash the readout
    }
  }
  return out;
}
