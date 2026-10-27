// Spotify Ads API adapter. Hierarchy: Business → Ad Account → Campaign → Ad Set → Ad.
// Everything monetized is expressed in micros (scaled decimal via fromMicros).
// Sources: developer.spotify.com/documentation/ads-api (v3 preview — shapes verified against
// the published reference in references/networks/spotify.md; live confirmation is part of the
// smoke-test tier, not this offline contract tier).
//
// The `search` objective has no Spotify equivalent: it is declared UNSUPPORTED in the matrix
// so a keyword-search campaign aimed at Spotify fails loudly with code: unsupported.

import type { Adapter, AdapterStatus, Ctx, Page } from "./index.js";
import type { Account, Ad, AdGroup, Audience, Budget, Campaign, CapabilityMatrix, EntityLevel, InsightRow } from "../types.js";
import { httpRequest } from "../platform/transport.js";
import { resolveCredentials } from "../platform/credentials.js";
import { fromMicros, toMicros, toDec } from "../platform/money.js";

const API = "https://api-partner.spotify.com/ads/v3";

export const adapter: Adapter = {
  network: "spotify",
  reportAs: "spotify",

  matrix: {
    list_accounts: { state: "supported", reason: "ad accounts under the authorized business" },
    list_campaigns: { state: "supported" },
    list_ad_groups: { state: "supported" },
    list_ads: { state: "supported" },
    list_audiences: { state: "supported" },
    create_campaign: { state: "supported", reason: "created STOPPED/PAUSED (drafts-first; Spotify uses STOPPED for non-delivering)" },
    update_budget: { state: "supported" },
    activate: { state: "supported" },
    pause: { state: "supported" },
    create_creatives: { state: "supported" },
    get_targeting_estimate: { state: "supported", reason: "bidEstimations endpoint" },
    // keyword-search has no Spotify equivalent — per-network loud failure, never an empty success
    get_insights: { state: "supported" },
    submit_report: { state: "supported" },
    poll_report: { state: "supported" },
    fetch_report: { state: "supported" },
    pacing_review: { state: "supported" },
    lift_readout: { state: "supported" },
  } satisfies CapabilityMatrix,

  status(): AdapterStatus {
    try {
      resolveCredentials({ network: "spotify", requiredFields: ["access_token"] });
      return { state: "available" };
    } catch (e) {
      return { state: "not_configured", missing: ((e as unknown as { missing?: string[] }).missing) ?? ["access_token"] };
    }
  },

  async listAccounts(ctx: Ctx): Promise<Account[]> {
    // Business layer: the token's authorized business roots the ad accounts.
    const bizId = String(ctx.args.business_id ?? ctx.credentials.values.business_id ?? "");
    if (bizId === "") {
      throw new Error("business id resolution failed: pass business_id or configure it in the credentials record");
    }
    const json = await call(ctx, `${API}/businesses/${bizId}/adAccounts`, "GET");
    return (json.ad_accounts ?? []).map((a: { id: string; name?: string; currency?: string }) => ({
      network: "spotify",
      account_id: String(a.id),
      name: a.name ?? String(a.id),
      currency: a.currency ?? "",
    }));
  },

  async listCampaigns(ctx: Ctx): Promise<Page<Campaign>> {
    const json = await call(ctx, `${API}/adAccounts/${ctx.args.account_id}/campaigns`, "GET");
    return {
      rows: (json.campaigns ?? []).map((c: { id: string; name?: string; status?: string; budget?: { amount_micros?: string | number }; currency?: string }) => ({
        network: "spotify",
        account_id: String(ctx.args.account_id),
        campaign_id: String(c.id),
        name: String(c.name ?? ""),
        status: normStatus(String(c.status ?? "")),
        budget: c.budget?.amount_micros !== undefined && c.currency !== undefined
          ? { type: "daily", amount: toDec(fromMicros(String(c.budget.amount_micros))), currency: String(c.currency) }
          : undefined,
      })),
    };
  },

  async listAdGroups(ctx: Ctx): Promise<AdGroup[]> {
    const json = await call(ctx, `${API}/campaigns/${ctx.args.campaign_id}/adSets`, "GET");
    return (json.ad_sets ?? []).map((g: { id: string; name?: string; status?: string; campaign_id?: string }) => ({
      network: "spotify",
      account_id: String(ctx.args.account_id),
      ad_group_id: String(g.id),
      campaign_id: String(g.campaign_id ?? ctx.args.campaign_id),
      name: String(g.name ?? ""),
      status: normStatus(String(g.status ?? "")),
    }));
  },

  async listAds(ctx: Ctx): Promise<Ad[]> {
    const json = await call(ctx, `${API}/adSets/${ctx.args.ad_group_id}/ads`, "GET");
    return (json.ads ?? []).map((a: { id: string; name?: string; status?: string }) => ({
      network: "spotify",
      account_id: String(ctx.args.account_id),
      ad_group_id: String(ctx.args.ad_group_id),
      ad_id: String(a.id),
      name: String(a.name ?? ""),
      status: normStatus(String(a.status ?? "")),
    }));
  },

  async listAudiences(ctx: Ctx): Promise<Audience[]> {
    const json = await call(ctx, `${API}/adAccounts/${ctx.args.account_id}/audiences`, "GET");
    return (json.audiences ?? []).map((a: { id: string; name?: string; size?: string | number }) => ({
      network: "spotify",
      account_id: String(ctx.args.account_id),
      audience_id: String(a.id),
      name: String(a.name ?? ""),
      size_estimated: a.size !== undefined ? String(a.size) : null,
    }));
  },

  async get_targeting_estimate(ctx: Ctx): Promise<Record<string, unknown>> {
    // Spotify exposes audience/bid estimates via the bidEstimations endpoint (micros).
    const json = await call(ctx, `${API}/adAccounts/${ctx.args.account_id}/bidEstimations`, "POST", {
      targeting: ctx.args.targeting,
    });
    return {
      network: "spotify",
      account_id: String(ctx.args.account_id),
      estimate: {
        audience_size: json.audience_size !== undefined ? Number(json.audience_size) : null,
        bid_range_micros: json.bid_estimation !== undefined ? json.bid_estimation : null,
      },
    };
  },

  async createCampaign(ctx: Ctx): Promise<Campaign> {
    const budget = ctx.args.budget as { type: string; amount: string; currency: string };
    const json = await call(ctx, `${API}/adAccounts/${ctx.args.account_id}/campaigns`, "POST", {
      name: ctx.args.name,
      objective: String(ctx.args.objective ?? "awareness"),
      budget: { amount_micros: String(toMicros(budget.amount)) },
      status: "STOPPED", // STOPPED = non-delivering creation state (drafts-first)
    });
    return {
      network: "spotify",
      account_id: String(ctx.args.account_id),
      campaign_id: String(json.campaign?.id ?? ""),
      name: String(ctx.args.name),
      status: "paused",
      objective: ctx.args.objective !== undefined ? String(ctx.args.objective) : undefined,
      budget: { type: budget.type as Budget["type"], amount: budget.amount, currency: budget.currency.toUpperCase() },
    };
  },

  async updateBudget(ctx: Ctx): Promise<{ before?: Budget | null; after: Budget }> {
    const budget = ctx.args.budget as { type: string; amount: string; currency: string };
    await call(ctx, `${API}/campaigns/${String(ctx.args.entity_id)}/budget`, "PUT", {
      amount_micros: String(toMicros(budget.amount)),
    });
    const before = ctx.args.current_budget !== undefined ? (ctx.args.current_budget as { type: string; amount: string; currency: string }) : null;
    return {
      ...(before ? { before: { type: before.type as Budget["type"], amount: before.amount, currency: before.currency.toUpperCase() } } : {}),
      after: { type: budget.type as Budget["type"], amount: budget.amount, currency: budget.currency.toUpperCase() },
    };
  },

  async setEntityStatus(ctx: Ctx, level: EntityLevel, enable: boolean): Promise<{ status: string }> {
    const resources: Record<string, string> = { campaign: "campaigns", ad_group: "adSets", ad: "ads" };
    await call(ctx, `${API}/${resources[String(level)]}/${String(ctx.args.entity_id)}/status`, "PUT", {
      status: enable ? "ACTIVE" : "STOPPED",
    });
    return { status: enable ? "active" : "paused" };
  },

  async createCreatives(ctx: Ctx): Promise<Ad[]> {
    const out: Ad[] = [];
    for (const specimen of (ctx.args.creatives ?? []) as Array<Record<string, unknown>>) {
      const json = await call(ctx, `${API}/adSets/${String(ctx.args.ad_group_id)}/ads`, "POST", {
        name: specimen.name,
        headline: specimen.headline,
        url: specimen.link,
        image_url: specimen.image_url,
        status: "STOPPED", // born non-spending; activation is the separate confirmed call
      });
      out.push({
        network: "spotify",
        account_id: String(ctx.args.account_id),
        ad_group_id: String(ctx.args.ad_group_id),
        ad_id: String(json.ad?.id ?? ""),
        name: String(specimen.name),
        status: "draft",
      });
    }
    return out;
  },

  async getInsights(ctx: Ctx): Promise<InsightRow[]> {
    // synchronous tier: pull the full metrics row set page-by-page; Spotify returns micros
    const from = String(ctx.args.date_from);
    const to = String(ctx.args.date_to);
    const json = await call(
      ctx,
      `${API}/${scopeOf(String(ctx.args.entity_level), String(ctx.args.entity_id ?? String(ctx.args.account_id)))}/stats?start_date=${from}&end_date=${to}`,
      "GET",
    );
    const currency = await accountCurrency(ctx);
    return (json.rows ?? []).map((row: { id?: string; date?: string; impressions?: number; clicks?: number; spend?: { amount_micros?: string | number } }) => ({
      network: "spotify",
      account_id: String(ctx.args.account_id),
      entity_level: String(ctx.args.entity_level) as EntityLevel,
      entity_id: String(row.id ?? ctx.args.account_id),
      date: String(row.date ?? from),
      currency,
      metrics: {
        impressions: row.impressions !== undefined ? Number(row.impressions) : null,
        clicks: row.clicks !== undefined ? Number(row.clicks) : null,
        spend: row.spend?.amount_micros !== undefined ? toDec(fromMicros(String(row.spend.amount_micros))) : null,
        conversions: null, // unreported in this sync view; stays null
      },
      available: Object.entries({
        impressions: row.impressions,
        clicks: row.clicks,
        spend: row.spend?.amount_micros,
      }).filter(([, v]) => v !== undefined).map(([k]) => k),
      date_semantics: { timezone: "UTC (documented per row when the report states one)", attribution: "view-through for audio completions" },
    }));
  },

  async submitReport(ctx: Ctx): Promise<{ server_task: string }> {
    const json = await call(ctx, `${API}/${scopeOf(String(ctx.args.entity_level), String(ctx.args.entity_id ?? String(ctx.args.account_id)))}/reports`, "POST", {
      start_date: ctx.args.date_from,
      end_date: ctx.args.date_to,
      format: "CSV",
    });
    return { server_task: String(json.request_id ?? "") };
  },

  async pollReport(ctx: Ctx): Promise<{ state: "pending" | "ready" | "error" }> {
    const json = await call(ctx, `${API}/reports/${ctx.args.external_task}`, "GET");
    const state = String(json.state ?? "");
    return { state: state === "COMPLETED" ? "ready" : state === "FAILED" ? "error" : "pending" };
  },

  async fetchReport(ctx: Ctx): Promise<InsightRow[]> {
    const json = await call(ctx, `${API}/reports/${ctx.args.external_task}`, "GET");
    const url = String(json.download_url ?? "");
    if (url === "") throw new Error("report carries no download_url");
    await ctx.throttled();
    const res = await httpRequest({ method: "GET", url });
    if (res.status < 200 || res.status >= 300) throw new Error(`report download HTTP ${res.status}`);
    const lines = res.body.trim().split("\n");
    if (lines.length === 0) return [];
    const head = lines[0].split(",").map((h) => h.trim());
    const currency = await accountCurrency(ctx);
    return lines.slice(1).filter((l) => l.trim() !== "").map((line) => {
      const cols = line.split(",");
      const rec: Record<string, string> = {};
      head.forEach((h, i) => {
        rec[h.toLowerCase()] = (cols[i] ?? "").trim();
      });
      const spendMicros = rec["spend_micros"] ?? rec["spend"];
      return {
        network: "spotify",
        account_id: String(ctx.args.account_id),
        entity_level: String(ctx.args.entity_level) as EntityLevel,
        entity_id: rec["campaign_id"] ?? rec["adset_id"] ?? rec["ad_id"] ?? "",
        date: rec["date"] ?? String(ctx.args.date_from),
        currency: rec["currency"] ?? currency,
        metrics: {
          impressions: rec["impressions"] !== undefined ? Number(rec["impressions"]) : null,
          clicks: rec["clicks"] !== undefined ? Number(rec["clicks"]) : null,
          spend: spendMicros !== undefined ? toDec(fromMicros(spendMicros)) : null,
          conversions: rec["conversions"] !== undefined ? Number(rec["conversions"]) : null,
        },
        available: head.filter((h) => h.trim() !== ""),
        date_semantics: { timezone: "UTC (per report header)", attribution: "view-through for audio completions" },
      };
    });
  },
};

// ------------------------------------------------------------ local helpers

function normStatus(native: string): "draft" | "paused" | "active" | "archived" | "removed" {
  switch (native) {
    case "ACTIVE":
      return "active";
    case "STOPPED":
      return "paused";
    case "ARCHIVED":
      return "archived";
    case "REMOVED":
      return "removed";
    default:
      return "draft";
  }
}

function scopeOf(level: string, id: string): string {
  switch (level) {
    case "campaign":
      return `campaigns/${id}`;
    case "ad_group":
      return `adSets/${id}`;
    case "ad":
      return `ads/${id}`;
    default:
      return `adAccounts/${id}`;
  }
}

async function accountCurrency(ctx: Ctx): Promise<string> {
  try {
    const json = await call(ctx, `${API}/adAccounts/${ctx.args.account_id}?fields=currency`, "GET");
    return String(json.ad_account?.currency ?? "");
  } catch {
    return "";
  }
}

async function call(
  ctx: Ctx,
  url: string,
  method: "GET" | "POST" | "PUT",
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
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  if (res.status < 200 || res.status >= 300) {
    throw new Error(`Spotify HTTP ${res.status}: ${res.body.slice(0, 300)}`);
  }
  return JSON.parse(res.body);
}

export { resolveCredentials as _resolveCredentials };
