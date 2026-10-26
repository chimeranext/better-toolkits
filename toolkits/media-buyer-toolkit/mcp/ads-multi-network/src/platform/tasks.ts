// Async report task store. Stateless server ⇒ continuity lives on disk, addressed
// by an explicit task_id in each call (design D17: never in process memory).

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import type { Network } from "../types.js";

export interface StoredTask {
  task_id: string;
  network: Network;
  account_id: string;
  entity_level: string;
  entity_id?: string;
  date_from: string;
  date_to: string;
  server_task: string; // the network's own opaque handle (e.g. report token)
  submitted_at: string;
  state: "pending" | "ready" | "error";
}

export function tasksFilePath(): string {
  const state = process.env.MEDIA_BUYER_TASKS_PATH;
  if (state && state.trim() !== "") return state;
  const xdg = process.env.XDG_STATE_HOME;
  const dir = xdg && xdg.trim() !== "" ? xdg : path.join(os.homedir(), ".local", "state");
  return path.join(dir, "media-buyer-toolkit", "tasks.jsonl");
}

function read(): StoredTask[] {
  const p = tasksFilePath();
  if (!fs.existsSync(p)) return [];
  const out: StoredTask[] = [];
  for (const line of fs.readFileSync(p, "utf8").trim().split("\n")) {
    if (line.trim() === "") continue;
    try {
      out.push(JSON.parse(line) as StoredTask);
    } catch {
      // skip unparseable history lines
    }
  }
  return out;
}

export function save(t: StoredTask): void {
  const p = tasksFilePath();
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.appendFileSync(p, JSON.stringify(t) + "\n", "utf8");
}

export function get(taskId: string): StoredTask | undefined {
  return read().find((t) => t.task_id === taskId);
}

export function updateState(taskId: string, state: StoredTask["state"]): void {
  const p = tasksFilePath();
  const all = read();
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, "", "utf8");
  for (const t of all) {
    fs.appendFileSync(p, JSON.stringify(t.task_id === taskId ? { ...t, state } : t) + "\n", "utf8");
  }
}

export function newTaskId(network: Network): string {
  return `${network}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
