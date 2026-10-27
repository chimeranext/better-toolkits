// Normalized model + shared types. Vendor names stop at the adapter boundary.
// Spec: specs/network-adapters/spec.md, specs/unified-insights-schema/spec.md

export type Network = "meta" | "tiktok" | "linkedin" | "google" | "youtube" | "spotify";

export const NETWORKS: Network[] = ["meta", "tiktok", "linkedin", "google", "youtube", "spotify"];

export type EntityLevel = "account" | "campaign" | "ad_group" | "ad";

/** Normalized lifecycle. Creation can never express a spending state (drafts-first). */
export type EntityStatus = "draft" | "paused" | "active" | "archived" | "removed";

/** { amount: decimal-string, currency: ISO-4217 } — unit-normalized at the adapter boundary. */
export interface Money {
  amount: string;
  currency: string;
}

export interface Budget {
  type: "daily" | "total";
  amount: string; // decimal string in the account currency
  currency: string; // ISO-4217
}

export interface Account {
  network: Network;
  account_id: string;
  name: string;
  currency: string;
}

export interface Campaign {
  network: Network;
  account_id: string;
  campaign_id: string;
  name: string;
  status: EntityStatus;
  objective?: string;
  budget?: Budget;
}

export interface AdGroup {
  network: Network;
  account_id: string;
  ad_group_id: string;
  campaign_id: string;
  name: string;
  status: EntityStatus;
  /** Adapter-owned opaque structure (Google keywords live here; never dropped). */
  targeting?: Record<string, unknown>;
}

export interface Ad {
  network: Network;
  account_id: string;
  ad_group_id: string;
  ad_id: string;
  name: string;
  status: EntityStatus;
  creative?: Record<string, unknown>;
}

export interface Audience {
  network: Network;
  account_id: string;
  audience_id: string;
  name: string;
  size_estimated?: string | null;
}

/** Canonical insight row — see specs/unified-insights-schema/spec.md. */
export interface InsightRow {
  network: Network;
  account_id: string;
  entity_level: EntityLevel;
  entity_id: string;
  /** ISO yyyy-mm-dd; semantics declared, never implied. */
  date: string;
  currency: string;
  /** metric name → decimal-string amount or count; `null` = not reported (never coerced to 0). */
  metrics: Record<string, string | number | null>;
  /** metric names the network actually reports on this row. */
  available: string[];
  /** declared day/daytime convention for this row. */
  date_semantics: { timezone: string; attribution: string; note?: string };
  /** extra dimensions (channel map for Google: video|search|display). */
  dimensions?: Record<string, unknown>;
}

export interface TaskHandle {
  network: Network;
  account_id: string;
  task_id: string;
  state: "pending" | "ready" | "error";
}

export interface CapabilityEntry {
  state: "supported" | "unsupported" | "not_implemented";
  reason?: string;
}

/** Declared, never inferred (design D5). */
export type CapabilityMatrix = Record<string, CapabilityEntry>;

export interface AdapterConfig {
  network: Network;
  /** which network identity this adapter reports under (youtube serves under google internals). */
  reportAs: Network;
  rate: { requestsPerSecond: number; burst: number };
}
