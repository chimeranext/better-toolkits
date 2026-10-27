// Adapter contract: one adapter per network (youtube resolves to google's, [network-adapters spec]).
// Matrix declared, never inferred. A method declared `supported` MUST exist; anything the
// adapter cannot do yet is declared `not_implemented` and fails loudly via the router.

import type {
  Account,
  Ad,
  AdGroup,
  Audience,
  Budget,
  Campaign,
  CapabilityMatrix,
  EntityLevel,
  InsightRow,
  Network,
} from "../types.js";
import type { ResolvedCredentials } from "../platform/credentials.js";

export interface Ctx {
  /** the network as requested by the caller (google adapter receives both google and youtube). */
  network: Network;
  credentials: ResolvedCredentials;
  args: Record<string, unknown>;
  /** per-account token bucket — call before every outbound request. */
  throttled: () => Promise<void>;
}

export interface AdapterStatus {
  state: "available" | "not_configured" | "error";
  missing?: string[];
  error?: string;
}

export interface Page<T> {
  rows: T[];
  next_page_token?: string;
}

export interface Adapter {
  network: Network;
  reportAs: Network;
  matrix: CapabilityMatrix;
  status(): AdapterStatus;
  listAccounts(ctx: Ctx): Promise<Account[]>;
  listCampaigns(ctx: Ctx): Promise<Page<Campaign>>;
  listAdGroups(ctx: Ctx): Promise<AdGroup[]>;
  listAds(ctx: Ctx): Promise<Ad[]>;
  listAudiences(ctx: Ctx): Promise<Audience[]>;
  createCampaign(ctx: Ctx): Promise<Campaign>;
  updateBudget(ctx: Ctx): Promise<{ before?: Budget | null; after: Budget }>;
  setEntityStatus(ctx: Ctx, level: EntityLevel, enable: boolean): Promise<{ status: string }>;
  createCreatives(ctx: Ctx): Promise<Ad[]>;
  estimate(ctx: Ctx): Promise<Record<string, unknown>>;
  getInsights(ctx: Ctx): Promise<InsightRow[]>;
  submitReport(ctx: Ctx): Promise<{ server_task: string }>;
  pollReport(ctx: Ctx): Promise<{ state: "pending" | "ready" | "error" }>;
  fetchReport(ctx: Ctx): Promise<InsightRow[]>;
}

import { adapter as metaAdapter } from "./meta.js";
import { adapter as googleAdapter } from "./google.js";
import { adapter as tiktokAdapter } from "./tiktok.js";
import { adapter as linkedinAdapter } from "./linkedin.js";
import { adapter as spotifyAdapter } from "./spotify.js";

/**
 * Builds the adapter registry. Pure static imports (adapters are side-effect-free modules);
 * `skip` exists so failure isolation can be asserted offline (an adapter that is down or
 * removed must not stop the others — network-adapters spec: isolated adapter failure).
 */
export function buildRegistry(skip: Network[] = []): Map<Network, Adapter> {
  const map = new Map<Network, Adapter>();
  if (!skip.includes("meta")) map.set("meta", metaAdapter);
  if (!skip.includes("google")) {
    map.set("google", googleAdapter);
    map.set("youtube", googleAdapter); // youtube resolves to the google adapter
  }
  if (!skip.includes("tiktok")) map.set("tiktok", tiktokAdapter);
  if (!skip.includes("linkedin")) map.set("linkedin", linkedinAdapter);
  if (!skip.includes("spotify")) map.set("spotify", spotifyAdapter);
  return map;
}

export const REGISTRY = buildRegistry();
