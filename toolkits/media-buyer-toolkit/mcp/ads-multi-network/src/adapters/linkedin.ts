// LinkedIn Marketing API adapter. The normalized hierarchy is SHIFTED one level:
//   normalized campaign    ↔ LinkedIn adCampaignGroupsV2 (campaign group)
//   normalized ad_group    ↔ LinkedIn adCampaignsV2 (LinkedIn's "campaign")
//   normalized ad          ↔ LinkedIn adCreativesV2 (creative carries serving)
// The shift is absorbed HERE, on reads and on writes, so the caller always sees the same
// three-level shape as every other network (network-adapters spec). Audiences = dmpSegmentsV2.
// Insights are synchronous (/adAnalyticsV2, DAILY granularity); async reports are unsupported.

import type { Adapter, AdapterStatus, Ctx, Page } from "../index.js";
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
} from "../../types.js";
import { httpRequest } from "../../platform/transport.js";
import { resolveCredentials } from "../../platform/credentials.js";

const API = "https://api.linkedin.com/v2";
const REST = "https://api.linkedin.com/rest";

interface Native {
  // campaign group (normalized campaign)
  id: number | string;
  name?: string;
  status?: string;
  [k: string]: unknown;
}

async function call(
  ctx: Ctx,
  url: string,
  method: "GET" | "POST" | "PATCH" | "DELETE",
  body?: unknown,
): Promise<any> {
  await ctx.throttled();
  const token = ctx.credentials.values.access_token;
  const res = await httpRequest({
    method,
    url,
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
      // v2 APIs need these two headers on every call
      "x-restli-protocol-version": "2.0.0",
      "linkedin-version": "202401",
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  if (res.status < 200 || res.status >= 300) {
    throw new Error(`LinkedIn HTTP ${res.status}: ${res.body.slice(0, 300)}`);
  }
  return JSON.parse(res.body);
}

// LinkedIn status → normalized. LinkedIn has no true "draft"; DRAFT-like = not delivering.
function normStatus(native: string | undefined): "draft" | "paused" | "active" | "archived" | "removed" {
  switch (native) {
    case "ACTIVE":
      return "active";
    case "ARCHIVED":
      return "archived";
    case "CANCELED":
    case "COMPLETED":
      return "removed";
    case "DRAFT":
      return "draft";
    default:
      return "paused";
  }
}

// normalized → LinkedIn status (writes cannot elevate to ACTIVE here; that is activate())
function toGroupStatus(enable: boolean): string {
  return enable ? "ACTIVE" : "PAUSED";
}

const LEVELS: Record<string, string> = { campaign: "campaign_group", ad_group: "campaign", ad: "creative" };

export const adapter: Adapter = {
  network: "linkedin",
  reportAs: "linkedin",

  matrix: {
    list_accounts: { state: "supported" },
    list_campaigns: { state: "supported", reason: "normalized campaigns are LinkedIn campaign groups (shift absorbed)" },
    list_ad_groups: { state: "supported", reason: "normalized ad groups are LinkedIn campaigns (shift absorbed)" },
    list_ads: { state: "supported", reason: "normalized ads are LinkedIn creatives (shift absorbed)" },
    list_audiences: { state: "supported" },
    create_campaign: { state: "supported", reason: "created DRAFT/PAUSED (drafts-first)" },
    update_budget: {
      state: "not_implemented",
      reason: "LinkedIn budgets attach to campaign groups via adBudgetGroups; wiring documented in references/networks/linkedin.md",
    },
    activate: { state: "supported" },
    pause: { state: "supported" },
    create_creatives: { state: "supported" },
    get_targeting_estimate: { state: "not_implemented", reason: "LinkedIn exposes no public reach-estimate endpoint" },
    get_insights: { state: "supported" },
    submit_report: { state: "unsupported", reason: "LinkedIn analytics are synchronous (adAnalyticsV2)" },
    poll_report: { state: "unsupported", reason: "LinkedIn analytics are synchronous (adAnalyticsV2)" },
    fetch_report: { state: "unsupported", reason: "LinkedIn analytics are synchronous (adAnalyticsV2)" },
    pacing_review: { state: "supported" },
    lift_readout: { state: "supported" },
  } satisfies CapabilityMatrix,

  status(): AdapterStatus {
    try {
      resolveCredentials({ network: "linkedin", requiredFields: ["access_token"] });
      return { state: "available" };
    } catch (e) {
      return { state: "not_configured", missing: ((e as unknown as { missing?: string[] }).missing) ?? ["access_token"] };
    }
  },

  async listAccounts(ctx: Ctx): Promise<Account[]> {
    const orgs = await call(ctx, `${REST}/adAccounts?q=search&search.status.values[0]=ACTIVE`, "GET");
    const accounts = (orgs.elements ?? []) as Array<{ id: string; name?: string; currency?: string }>;
    return accounts.map((a) => ({
      network: "linkedin",
      account_id: String(a.id),
      name: a.name ?? String(a.id),
      currency: a.currency ?? "",
    }));
  },

  async listCampaigns(ctx: Ctx): Promise<Page<Campaign>> {
    // SHIFT: LinkedIn campaign GROUPS are normalized campaigns
    const json = await call(
      ctx,
      `${REST}/adCampaignGroupsV2?q=search&search.account.list[0]=urn:li:sponsoredAccount:${ctx.args.account_id}&pageSize=50`,
      "GET",
    );
    const rows: Campaign[] = (json.elements ?? []).map((g: Native) => ({
      network: "linkedin",
      account_id: String(ctx.args.account_id),
      campaign_id: labelOf(g),
      name: String(g.name ?? ""),
      status: normStatus(String(g.status ?? "")),
    }));
    return { rows, ...(json.paging?.links?.length > 0 ? { next_page_token: "has-more" } : {}) };
  },

  async listAdGroups(ctx: Ctx): Promise<AdGroup[]> {
    // SHIFT: LinkedIn CAMPAIGNS are normalized ad groups; campaign id is the group urn (campaignGroup field)
    const campaignUrn = urnOf("sponsoredCampaignGroup", String(ctx.args.campaign_id));
    const json = await call(
      ctx,
      `${REST}/adCampaignsV2?q=search&search.campaignGroup.list[0]=${campaignUrn}&pageSize=100`,
      "GET",
    );
    return (json.elements ?? []).map((c: Native) => ({
      network: "linkedin",
      account_id: String(ctx.args.account_id),
      ad_group_id: labelOf(c),
      campaign_id: String(ctx.args.campaign_id),
      name: String(c.name ?? ""),
      status: normStatus(String(c.status ?? "")),
    }));
  },

  async listAds(ctx: Ctx): Promise<Ad[]> {
    // SHIFT: LinkedIn CREATIVES are normalized ads
    const campaignUrn = urnOf("sponsoredCampaign", String(ctx.args.ad_group_id));
    const json = await call(ctx, `${REST}/adCreativesV2?q=search&search.campaign.list[0]=${campaignUrn}&pageSize=100`, "GET");
    return (json.elements ?? []).map((c: Native) => ({
      network: "linkedin",
      account_id: String(ctx.args.account_id),
      ad_group_id: String(ctx.args.ad_group_id),
      ad_id: labelOf(c),
      name: String(c.name ?? labelOf(c)),
      status: normStatus(String(c.status ?? "")),
    }));
  },

  async listAudiences(ctx: Ctx): Promise<Audience[]> {
    const json = await call(ctx, `${REST}/dmpSegmentsV2?q=search&search.facet.accountUrn=urn:li:sponsoredAccount:${ctx.args.account_id}&pageSize=100`, "GET");
    return (json.elements ?? []).map((s: Native) => ({
      network: "linkedin",
      account_id: String(ctx.args.account_id),
      audience_id: String(s.id ?? ""),
      name: String(s.name ?? ""),
      size_estimated: (s as { userCount?: { active?: number } }).userCount?.active !== undefined ? String((s as { userCount: { active: number } }).userCount.active) : null,
    }));
  },

  async createCampaign(ctx: Ctx): Promise<Campaign> {
    // SHIFT: writing a normalized campaign creates a LinkedIn campaign GROUP. The normalized
    // budget cannot be expressed at group level without the separate adBudgetGroups API, so
    // creation records the intended budget in the group name (documented; update_budget wired separately).
    const budget = ctx.args.budget as { type: string; amount: string; currency: string };
    const json = await call(ctx, `${REST}/adCampaignGroupsV2`, "POST", {
      accountUrn: `urn:li:sponsoredAccount:${ctx.args.account_id}`,
      name: `${ctx.args.name} (${budget.type} ${budget.amount} ${budget.currency})`,
      status: "DRAFT", // drafts-first: LinkedIn's own draft-like creation state
    });
    const headerValue = (json["x-restli-id"] ?? json.id ?? json.value) as unknown;
    return {
      network: "linkedin",
      account_id: String(ctx.args.account_id),
      campaign_id: idFromRestli(headerValue),
      name: String(ctx.args.name),
      status: "draft",
      objective: ctx.args.objective !== undefined ? String(ctx.args.objective) : undefined,
      budget: { type: budget.type as Budget["type"], amount: budget.amount, currency: budget.currency.toUpperCase() },
    };
  },

  async updateBudget(ctx: Ctx): Promise<{ before?: Budget | null; after: Budget }> {
    throw new Error("unreachable — matrix declares update_budget not_implemented for linkedin");
  },

  async setEntityStatus(ctx: Ctx, level: EntityLevel, enable: boolean): Promise<{ status: string }> {
    // SHIFT: the entity being paused/enabled maps to the LinkedIn resource one level over
    // (normalized campaign → campaign group, ad_group → campaign, ad → creative).
    const kind = LEVELS[String(level)] ?? "campaign";
    const urn =
      kind === "campaign_group"
        ? urnOf("sponsoredCampaignGroup", String(ctx.args.entity_id))
        : kind === "campaign"
          ? urnOf("sponsoredCampaign", String(ctx.args.entity_id))
          : urnOf("sponsoredCreative", String(ctx.args.entity_id));
    const resource = kind === "campaign_group" ? "adCampaignGroupsV2" : kind === "campaign" ? "adCampaignsV2" : "adCreativesV2";
    const status = kind === "campaign_group" ? toGroupStatus(enable) : enable ? "ACTIVE" : "PAUSED";
    await call(ctx, `${REST}/${resource}/${encodeURIComponent(urn)}`, "POST", { patch: { $set: { status } } });
    return { status: enable ? "active" : "paused" };
  },

  async createCreatives(ctx: Ctx): Promise<Ad[]> {
    const out: Ad[] = [];
    for (const specimen of (ctx.args.creatives ?? []) as Array<Record<string, unknown>>) {
      const campaignUrn = urnOf("sponsoredCampaign", String(ctx.args.ad_group_id));
      const json = await call(ctx, `${REST}/adCreativesV2`, "POST", {
        campaign: campaignUrn,
        name: specimen.name,
        status: "DRAFT", // always born non-spending; activation is a separate confirmed call
        ...(specimen.link !== undefined ? { url: String(specimen.link) } : {}),
      });
      out.push({
        network: "linkedin",
        account_id: String(ctx.args.account_id),
        ad_group_id: String(ctx.args.ad_group_id),
        ad_id: idFromRestli(json["x-restli-id"] ?? json.id ?? json.value),
        name: String(specimen.name),
        status: "draft",
      });
    }
    return out;
  },

  async estimate(ctx: Ctx): Promise<Record<string, unknown>> {
    throw new Error("unreachable — matrix declares get_targeting_estimate not_implemented for linkedin");
  },

  async getInsights(ctx: Ctx): Promise<InsightRow[]> {
    const normalizedLevel = String(ctx.args.entity_level);
    const pivot = normalizedLevel === "account" ? "ACCOUNT_ID" : LEVELS[normalizedLevel].toUpperCase();
    const pointUrn =
      normalizedLevel === "account"
        ? `urn:li:sponsoredAccount:${ctx.args.account_id}`
        : mapUrn(normalizedLevel, String(ctx.args.entity_id));
    const fromDay = ctx.args.date_from as string;
    const toDay = ctx.args.date_to as string;
    const range = `(start:(year:${fromDay.slice(0, 4)},month:${Number(fromDay.slice(5, 7))},day:${Number(fromDay.slice(8, 10))}),end:(year:${toDay.slice(0, 4)},month:${Number(toDay.slice(5, 7))},day:${Number(toDay.slice(8, 10))}))`;
    const json = await call(
      ctx,
      `${API}/adAnalyticsV2?q=statistics&pivot=${pivot}&${pivot}=${encodeURIComponent(pointUrn)}&timeGranularity=DAILY&dateRange=${encodeURIComponent(range)}`,
      "GET",
    );
    const currency = await accountCurrency(ctx);
    return (json.elements ?? []).map((row: Record<string, unknown>) => {
      const r = row as {
        dateRange?: { startDate?: { year?: number; month?: number; day?: number } };
        impressions?: number;
        clicks?: number;
        costInLocalCurrency?: number;
      };
      const startDate = r.dateRange?.startDate;
      const metrics: Record<string, string | number | null> = {
        impressions: r.impressions !== undefined ? Number(r.impressions) : null,
        clicks: r.clicks !== undefined ? Number(r.clicks) : null,
        spend: r.costInLocalCurrency !== undefined ? String(r.costInLocalCurrency) : null,
        conversions: null, // not reported by this pivot; stays null, never coerced to 0
      };
      return {
        network: "linkedin",
        account_id: String(ctx.args.account_id),
        entity_level: normalizedLevel as EntityLevel,
        entity_id: normalizedLevel === "account" ? String(ctx.args.account_id) : String(ctx.args.entity_id),
        date:
          startDate?.year !== undefined
            ? `${startDate.year}-${String(startDate.month).padStart(2, "0")}-${String(startDate.day).padStart(2, "0")}`
            : fromDay,
        currency,
        metrics,
        available: Object.entries(metrics).filter(([, v]) => v !== null).map(([k]) => k),
        date_semantics: { timezone: "account timezone", attribution: "LinkedIn analytics windows" },
      };
    });
  },

  async submitReport(ctx: Ctx): Promise<{ server_task: string }> {
    void ctx;
    throw new Error("unreachable — matrix declares submit_report unsupported for linkedin");
  },
  async pollReport(ctx: Ctx): Promise<{ state: "pending" | "ready" | "error" }> {
    void ctx;
    throw new Error("unreachable — matrix declares poll_report unsupported for linkedin");
  },
  async fetchReport(ctx: Ctx): Promise<InsightRow[]> {
    void ctx;
    throw new Error("unreachable — matrix declares fetch_report unsupported for linkedin");
  },
};

// ------------------------------------------------------------ local helpers

/** Account currency via the adAccounts projection (the currency of record for every row). */
async function accountCurrency(ctx: Ctx): Promise<string> {
  try {
    const json = await call(ctx, `${REST}/adAccounts/${ctx.args.account_id}?projection=(currency)`, "GET");
    return String(json.currency ?? "");
  } catch {
    return "";
  }
}

/** LinkedIn results carry the resource URN; unwrap defensively and return the bare id. */
function labelOf(x: unknown): string {
  const rec = (x ?? {}) as Record<string, unknown>;
  return idFromRestli(rec["$urn"] ?? rec["id"]);
}

function urnOf(kind: "sponsoredAccount" | "sponsoredCampaignGroup" | "sponsoredCampaign" | "sponsoredCreative", raw: string): string {
  // accept either a bare numeric id or an id already carrying a fragment (e.g. group~segment)
  return /^urn:/u.test(raw) ? raw : `urn:li:${kind}:${raw}`;
}

function mapUrn(normalizedLevel: string, id: string): string {
  return normalizedLevel === "campaign"
    ? urnOf("sponsoredCampaignGroup", id)
    : normalizedLevel === "ad_group"
      ? urnOf("sponsoredCampaign", id)
      : urnOf("sponsoredCreative", id);
}

function idFromRestli(value: unknown): string {
  if (typeof value === "string") return value.replace(/^urn:li:sponsored[A-Za-z]+:/u, "").split("~")[0];
  if (typeof value === "number") return String(value);
  return "";
}
