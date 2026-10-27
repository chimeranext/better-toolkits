// TikTok Business API adapter. Async reporting modeled explicitly: submit → poll → fetch
// (unified-insights-schema spec). Money: spend reported in micros → scaled decimal.
// Hierarchy is straight (campaign → ad group → ad) with vendor-native identifiers absorbed here.

import type { Adapter, AdapterStatus, Ctx, Page } from "./index.js";
import type { Account, Ad, AdGroup, Audience, Campaign, CapabilityMatrix, EntityLevel, InsightRow } from "../types.js";
import { httpRequest } from "../platform/transport.js";
import { resolveCredentials } from "../platform/credentials.js";
import { fromMicros, toDec } from "../platform/money.js";

const API = "https://business-api.tiktok.com/open_api/v1.3";

async function api(ctx: Ctx, route: string, method: "GET" | "POST", body?: Record<string, unknown>, query?: string): Promise<any> {
  const q = query !== undefined ? `?${query}` : route.includes("?") ? "" : "";
  const res = await httpRequest({
    method,
    url: `${API}${route}${q}`,
    headers: { "content-type": "application/json", "Access-Token": ctx.credentials.values.access_token },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  if (res.status < 200 || res.status >= 300) {
    throw new Error(`TikTok HTTP ${res.status}: ${res.body.slice(0, 300)}`);
  }
  const parsed = JSON.parse(res.body) as { code: number; message?: string; data?: any };
  if (parsed.code !== 0) {
    // never leak the token; TikTok error messages are quoted as-is
    throw new Error(`TikTok business error ${parsed.code}: ${parsed.message ?? "unknown"}`);
  }
  return parsed.data.data ?? parsed.data;
}

const OBJECTIVE_TO_TIKTOK: Record<string, string> = {
  awareness: "AWARENESS",
  traffic: "TRAFFIC",
  engagement: "ENGAGE",
  leads: "LEAD_GENERATION",
  app_promotion: "APP_PROMOTION",
  sales: "CONVERSIONS",
};

const ENTITY_PATH: Record<string, string> = {
  campaign: "campaign",
  ad_group: "ad_group",
  ad: "ad",
};

export const adapter: Adapter = {
  network: "tiktok",
  reportAs: "tiktok",

  matrix: {
    list_accounts: { state: "supported" },
    list_campaigns: { state: "supported" },
    list_ad_groups: { state: "supported" },
    list_ads: { state: "supported" },
    list_audiences: { state: "supported" },
    create_campaign: { state: "supported", reason: "created with status CAMPAIGN_STATUS_DISABLE (non-spending)" },
    update_budget: { state: "supported" },
    activate: { state: "supported" },
    pause: { state: "supported" },
    create_creatives: { state: "supported" },
    get_targeting_estimate: {
      state: "not_implemented",
      reason: "planning-side estimate endpoint pending; documented in references/networks/tiktok.md",
    },
    get_insights: { state: "supported" },
    submit_report: { state: "supported" },
    poll_report: { state: "supported" },
    fetch_report: { state: "supported" },
    pacing_review: { state: "supported" },
    lift_readout: { state: "supported" },
  } satisfies CapabilityMatrix,

  status(): AdapterStatus {
    try {
      resolveCredentials({ network: "tiktok", requiredFields: ["access_token"] });
      return { state: "available" };
    } catch (e) {
      return { state: "not_configured", missing: ((e as unknown as { missing?: string[] }).missing) ?? ["access_token"] };
    }
  },

  async listAccounts(ctx: Ctx): Promise<Account[]> {
    const bcId = String(ctx.args.bc_id ?? ctx.credentials.values.bc_id ?? "");
    if (bcId === "") {
      throw new Error("a business-center id is required: pass bc_id or configure the bc_id credential field");
    }
    const json = await api(ctx, "/bc/advertiser/get/", "GET", undefined, `bc_id=${bcId}&page=1&page_size=100`);
    const list = json.list ?? [];
    return (list as Array<Record<string, string>>).map((r) => ({
      network: "tiktok" as const,
      account_id: String(r.advertiser_id),
      name: String(r.advertiser_name ?? ""),
      currency: String(r.currency ?? ""),
    }));
  },

  async listCampaigns(ctx: Ctx): Promise<Page<Campaign>> {
    const json = await api(ctx, "/campaign/get/", "GET", undefined, `advertiser_id=${ctx.args.account_id}&page=1&page_size=50`);
    const list = json.list ?? [];
    return {
      rows: (list as Array<Record<string, unknown>>).map((r): Campaign => ({
        network: "tiktok",
        account_id: String(ctx.args.account_id),
        campaign_id: String(r.campaign_id),
        name: String(r.campaign_name),
        status: String(r.status) === "ENABLE" ? "active" : String(r.status) === "DISABLE" ? "paused" : String(r.status) === "DELETE" ? "removed" : "draft",
      })),
    };
  },

  async listAdGroups(ctx: Ctx): Promise<AdGroup[]> {
    const json = await api(ctx, "/adgroup/get/", "GET", undefined, `advertiser_id=${ctx.args.account_id}&campaign_id=${ctx.args.campaign_id}&page=1&page_size=100`);
    const list = json.list ?? [];
    return (list as Array<Record<string, unknown>>).map((r) => ({
      network: "tiktok",
      account_id: String(ctx.args.account_id),
      ad_group_id: String(r.adgroup_id),
      campaign_id: String(r.campaign_id ?? ctx.args.campaign_id),
      name: String(r.adgroup_name ?? ""),
      status: r.status === "ADGROUP_ENABLE" || r.status === "STATUS_ENABLE" ? "active" : r.status === "ADGROUP_DISABLE" ? "paused" : "draft",
    }));
  },

  async listAds(ctx: Ctx): Promise<Ad[]> {
    const json = await api(ctx, "/ad/get/", "GET", undefined, `advertiser_id=${ctx.args.account_id}&adgroup_id=${ctx.args.ad_group_id}&page=1&page_size=100`);
    const list = json.list ?? [];
    return (list as Array<Record<string, unknown>>).map((r) => ({
      network: "tiktok",
      account_id: String(ctx.args.account_id),
      ad_group_id: String(ctx.args.ad_group_id),
      ad_id: String(r.ad_id),
      name: String(r.ad_name ?? ""),
      status: r.status === "AD_STATUS_DELIVERY_OK" || r.status === "STATUS_ENABLE" ? "active" : "paused",
    }));
  },

  async listAudiences(ctx: Ctx): Promise<Audience[]> {
    const json = await api(ctx, "/advertiser/custom_audience/list/", "GET", undefined, `advertiser_id=${ctx.args.account_id}&page=1&page_size=100`);
    const list = json.list ?? [];
    return (list as Array<Record<string, unknown>>).map((r) => ({
      network: "tiktok",
      account_id: String(ctx.args.account_id),
      audience_id: String(r.custom_audience_id),
      name: String(r.name ?? ""),
      size_estimated: r.audience_size !== undefined ? String(r.audience_size) : null,
    }));
  },

  async createCampaign(ctx: Ctx): Promise<Campaign> {
    const budget = ctx.args.budget as { type: string; amount: string; currency: string };
    const body: Record<string, unknown> = {
      advertiser_id: String(ctx.args.account_id),
      campaign_name: ctx.args.name,
      // TikTok keeps budgets at the ad-group layer: the normalized budget lands there when the group is created
      status: "CAMPAIGN_STATUS_DISABLE", // disable = non-spending (drafts-first)
    };
    if (ctx.args.objective !== undefined) body.objective_type = OBJECTIVE_TO_TIKTOK[String(ctx.args.objective)];
    const json = await api(ctx, "/campaign/create/", "POST", body);
    const campaignId = String(json.campaign_id?.[0] ?? "");
    return {
      network: "tiktok",
      account_id: String(ctx.args.account_id),
      campaign_id: campaignId,
      name: String(ctx.args.name),
      status: "paused",
      objective: ctx.args.objective !== undefined ? String(ctx.args.objective) : undefined,
      budget: { type: budget.type as "daily" | "total", amount: budget.amount, currency: budget.currency.toUpperCase() },
    };
  },

  async updateBudget(ctx: Ctx): Promise<{ before?: Campaign["budget"] | null; after: Campaign["budget"] }> {
    const level = String(ctx.args.entity_level);
    if (level !== "campaign") {
      throw new Error("tiktok budgets live at the campaign level in this adapter (ad-group budgets flow through create_creatives args)");
    }
    const budget = ctx.args.budget as { type: string; amount: string; currency: string };
    await api(ctx, "/campaign/budget/update/", "POST", {
      advertiser_id: String(ctx.args.account_id),
      budget_mode: budget.type === "daily" ? "BUDGET_MODE_DYNAMIC" : "BUDGET_MODE_TOTAL",
      budget: String(fromMicros(budget.amount)),
      campaign_ids: [String(ctx.args.entity_id)],
    });
    const before = ctx.args.current_budget !== undefined ? (ctx.args.current_budget as { type: string; amount: string; currency: string }) : null;
    return {
      ...(before ? { before: { type: before.type as "daily" | "total", amount: before.amount, currency: before.currency.toUpperCase() } } : {}),
      after: { type: budget.type as "daily" | "total", amount: budget.amount, currency: budget.currency.toUpperCase() },
    };
  },

  async setEntityStatus(ctx: Ctx, level: EntityLevel, enable: boolean): Promise<{ status: string }> {
    if (level === "ad") {
      await api(ctx, "/ad/status/update/", "POST", {
        advertiser_id: String(ctx.args.account_id),
        ad_ids: [String(ctx.args.entity_id)],
        operation_status: enable ? "ENABLE" : "DISABLE",
      });
      return { status: enable ? "active" : "paused" };
    }
    if (level === "ad_group") {
      await api(ctx, "/adgroup/status/update/", "POST", {
        advertiser_id: String(ctx.args.account_id),
        adgroup_ids: [String(ctx.args.entity_id)],
        operation_status: enable ? "ENABLE" : "DISABLE",
      });
      return { status: enable ? "active" : "paused" };
    }
    await api(ctx, "/campaign/status/update/", "POST", {
      advertiser_id: String(ctx.args.account_id),
      campaign_ids: [String(ctx.args.entity_id)],
      operation_status: enable ? "ENABLE" : "DISABLE",
    });
    return { status: enable ? "active" : "paused" };
  },

  async createCreatives(ctx: Ctx): Promise<Ad[]> {
    const out: Ad[] = [];
    for (const specimen of (ctx.args.creatives ?? []) as Array<Record<string, unknown>>) {
      const json = await api(ctx, "/ad/create/", "POST", {
        advertiser_id: String(ctx.args.account_id),
        adgroup_id: String(ctx.args.ad_group_id),
        ad_name: specimen.name,
        status: "AD_STATUS_DISABLE", // non-spending until the confirmed activation
        ...(specimen.headline !== undefined ? { display_text: specimen.headline } : {}),
        ...(specimen.link !== undefined ? { landing_page_url: specimen.link } : {}),
      });
      out.push({
        network: "tiktok",
        account_id: String(ctx.args.account_id),
        ad_group_id: String(ctx.args.ad_group_id),
        ad_id: String(json.ad_id?.[0] ?? ""),
        name: String(specimen.name),
        status: "paused",
      });
    }
    return out;
  },

  async estimate(ctx: Ctx): Promise<Record<string, unknown>> {
    throw new Error("unreachable — matrix declares get_targeting_estimate not_implemented for tiktok");
  },

  async getInsights(ctx: Ctx): Promise<InsightRow[]> {
    const levelPath = (ENTITY_PATH[String(ctx.args.entity_level)] ?? "campaign");
    const json = await api(ctx, `/report/${levelPath}/get/`, "GET", undefined, `advertiser_id=${ctx.args.account_id}&date_type=DAILY&start_date=${ctx.args.date_from}&end_date=${ctx.args.date_to}&page=1&page_size=100`);
    const list = json.list ?? [];
    const advertisementCurrency = String(json.currency ?? "");
    return (list as Array<Record<string, unknown>>).map((r) => {
      const spendMicros = r.spend !== undefined ? String(r.spend) : undefined;
      const metrics: Record<string, string | number | null> = {
        impressions: r.impressions !== undefined ? Number(r.impressions) : null,
        clicks: r.clicks !== undefined ? Number(r.clicks) : null,
        spend: spendMicros !== undefined ? toDec(fromMicros(spendMicros)) : null,
        conversions: r.conversion !== undefined ? Number(r.conversion) : null,
      };
      return {
        network: "tiktok",
        account_id: String(ctx.args.account_id),
        entity_level: String(ctx.args.entity_level) as EntityLevel,
        entity_id: String(r.campaign_id ?? r.adgroup_id ?? r.ad_id ?? ctx.args.entity_id ?? ctx.args.account_id),
        date: String(r.data_time ? String(r.data_time).slice(0, 10) : ctx.args.date_from),
        currency: advertisementCurrency,
        metrics,
        available: Object.entries(metrics).filter(([, v]) => v !== null).map(([k]) => k),
        date_semantics: { timezone: "advertiser account timezone", attribution: "TikTok default attribution window" },
      };
    });
  },

  async submitReport(ctx: Ctx): Promise<{ server_task: string }> {
    const json = await api(ctx, "/report/task/create/", "POST", {
      advertiser_id: String(ctx.args.account_id),
      report_type: "CAMPAIGN",
      start_date: ctx.args.date_from,
      end_date: ctx.args.date_to,
      metrics: ["impressions", "clicks", "spend", "conversion"],
    });
    return { server_task: String(json.task_id ?? "") };
  },

  async pollReport(ctx: Ctx): Promise<{ state: "pending" | "ready" | "error" }> {
    const json = await api(ctx, "/report/task/get/", "GET", undefined, `task_id=${ctx.args.external_task}`);
    const status = String(json.status ?? "");
    return { state: status === "DONE" || status === "FINISHED" ? "ready" : status === "FAILED" ? "error" : "pending" };
  },

  async fetchReport(ctx: Ctx): Promise<InsightRow[]> {
    const json = await api(ctx, "/report/result/get/", "GET", undefined, `task_id=${ctx.args.external_task}`);
    const url = String(json.download_url ?? "");
    if (url === "") throw new Error("report result carries no download_url");
    await ctx.throttled();
    const res = await httpRequest({ method: "GET", url });
    if (res.status < 200 || res.status >= 300) throw new Error(`report download HTTP ${res.status}`);
    const lines = res.body.trim().split("\n");
    if (lines.length === 0) return [];
    const head = lines[0].split(",").map((h) => h.trim());
    return lines.slice(1).map((line) => {
      const cols = line.split(",");
      const rec: Record<string, string> = {};
      head.forEach((h, i) => {
        rec[h] = (cols[i] ?? "").trim();
      });
      const spend = rec["spend"] ?? rec["cost"];
      return {
        network: "tiktok" as const,
        account_id: String(ctx.args.account_id),
        entity_level: String(ctx.args.entity_level) as EntityLevel,
        entity_id: rec["campaign_id"] ?? rec["adgroup_id"] ?? rec["ad_id"] ?? "",
        date: rec["date"] ?? ctx.args.date_from,
        currency: rec["currency"] ?? "",
        metrics: {
          impressions: rec["impressions"] !== undefined ? Number(rec["impressions"]) : null,
          clicks: rec["clicks"] !== undefined ? Number(rec["clicks"]) : null,
          spend: spend !== undefined ? toDec(fromMicros(spend)) : null,
          conversions: rec["conversion"] !== undefined ? Number(rec["conversion"]) : null,
        },
        available: Object.keys(rec).filter((k) => k !== ""),
        date_semantics: { timezone: "advertiser account timezone", attribution: "TikTok report attribution" },
      };
    });
  },

  async pacingReview(ctx: Ctx, periodDays: number): Promise<never> {
    throw new Error("unreachable — the router implements pacing over insights/campaigns");
  },
};
