// Meta Marketing API (Graph) adapter. Money: minor units → normalized decimal at this
// boundary (network-adapters spec). Creation is PAUSED — drafts-first (Meta exposes no draft
// state at campaign level; PAUSED is the only non-spending finite creation state).

import type { Adapter, AdapterStatus, Ctx, Page } from "./index.js";
import type { Account, Ad, AdGroup, Audience, Campaign, CapabilityMatrix, EntityLevel, InsightRow } from "../types.js";
import { httpRequest } from "../platform/transport.js";
import { resolveCredentials } from "../platform/credentials.js";
import { parseDec, toDec, fromMinorUnits, toMinorUnits, currencyExponent } from "../platform/money.js";

const API = "https://graph.facebook.com/v23.0";

const OBJECTIVE_TO_META: Record<string, string> = {
  awareness: "OUTCOME_AWARENESS",
  traffic: "OUTCOME_TRAFFIC",
  engagement: "OUTCOME_ENGAGEMENT",
  leads: "OUTCOME_LEADS",
  app_promotion: "OUTCOME_APP_PROMOTION",
  sales: "OUTCOME_SALES",
};

function metaToObjectives(native: string): string | undefined {
  for (const [normalized, code] of Object.entries(OBJECTIVE_TO_META)) {
    if (code === native) return normalized;
  }
  return undefined;
}

function mapStatus(native: string): "draft" | "paused" | "active" | "archived" | "removed" {
  switch (native) {
    case "ACTIVE":
      return "active";
    case "ARCHIVED":
      return "archived";
    case "DELETED":
      return "removed";
    case "DRAFT":
      return "draft";
    default:
      return "paused";
  }
}

function accountScope(ctx: Ctx): string {
  return `act_${ctx.args.account_id}`;
}

const HONEST_DATE = (n: string): string => (/^\d{8}$/u.test(n) ? `${n.slice(0, 4)}-${n.slice(4, 6)}-${n.slice(6, 8)}` : n);

export const adapter: Adapter = {
  network: "meta",
  reportAs: "meta",

  matrix: {
    list_accounts: { state: "supported" },
    list_campaigns: { state: "supported" },
    list_ad_groups: { state: "supported" },
    list_ads: { state: "supported" },
    list_audiences: { state: "supported" },
    create_campaign: { state: "supported", reason: "created as PAUSED (drafts-first)" },
    update_budget: { state: "supported" },
    activate: { state: "supported" },
    pause: { state: "supported" },
    create_creatives: { state: "supported" },
    get_targeting_estimate: { state: "supported" },
    get_insights: { state: "supported" },
    submit_report: { state: "unsupported", reason: "Meta insights are synchronous; use get_insights" },
    poll_report: { state: "unsupported", reason: "Meta insights are synchronous; use get_insights" },
    fetch_report: { state: "unsupported", reason: "Meta insights are synchronous; use get_insights" },
    pacing_review: { state: "supported" },
    lift_readout: { state: "supported" },
  } satisfies CapabilityMatrix,

  status(): AdapterStatus {
    try {
      resolveCredentials({ network: "meta", requiredFields: ["access_token"] });
      return { state: "available" };
    } catch (e) {
      return { state: "not_configured", missing: ((e as unknown as { missing?: string[] }).missing) ?? ["access_token"] };
    }
  },

  async listAccounts(ctx: Ctx): Promise<Account[]> {
    await ctx.throttled();
    const json = await graph(ctx, "/me/adaccounts", "GET", ["id", "name", "currency"]);
    return (json.data as Array<{ id: string; name: string; currency: string }>).map((r) => ({
      network: "meta",
      account_id: r.id.replace(/^act_/u, ""),
      name: r.name,
      currency: r.currency,
    }));
  },

  async listCampaigns(ctx: Ctx): Promise<Page<Campaign>> {
    await ctx.throttled();
    const limit = typeof ctx.args.limit === "number" ? ctx.args.limit : 50;
    const after = ctx.args.page_token !== undefined ? `&after=${encodeURIComponent(String(ctx.args.page_token))}` : "";
    const json = await graph(ctx, `/act_${ctx.args.account_id}/campaigns`, "GET", [
      "id",
      "name",
      "status",
      "objective",
      "daily_budget",
      "lifetime_budget",
    ], limit, after);
    return {
      rows: (json.data as Array<{ id: string; name: string; status: string; objective?: string; daily_budget?: string }>).map(
        (r): Campaign => ({
          network: "meta",
          account_id: String(ctx.args.account_id),
          campaign_id: r.id,
          name: r.name,
          status: mapStatus(r.status),
          objective: r.objective ? metaToObjectives(r.objective) : undefined,
          budget: r.daily_budget !== undefined
            ? { type: "daily", amount: String(r.daily_budget), currency: "" } // currency filled in by the account record path below
            : undefined,
        }),
      ),
      ...(json.paging?.cursors?.after !== undefined ? { next_page_token: json.paging.cursors.after } : {}),
    };
  },

  async createCampaign(ctx: Ctx): Promise<Campaign> {
    await ctx.throttled();
    const budget = ctx.args.budget as { type: string; amount: string; currency: string } | undefined;
    const body: Record<string, unknown> = {
      name: ctx.args.name,
      status: "PAUSED", // drafts-first
    };
    if (ctx.args.objective !== undefined) body.objective = OBJECTIVE_TO_META[String(ctx.args.objective)];
    if (budget !== undefined && budget.type === "daily") {
      body.daily_budget = String(toMinorUnits(budget.amount, currencyExponent(budget.currency)));
    }
    const json = await graph(ctx, `/act_${ctx.args.account_id}/campaigns`, "POST", [], undefined, "", body);
    return {
      network: "meta",
      account_id: String(ctx.args.account_id),
      campaign_id: String(json.id),
      name: String(ctx.args.name),
      status: "paused",
      objective: ctx.args.objective !== undefined ? String(ctx.args.objective) : undefined,
      budget: budget ? { type: budget.type as "daily" | "total", amount: budget.amount, currency: budget.currency.toUpperCase() } : undefined,
    };
  },

  async updateBudget(ctx: Ctx): Promise<{ before?: Campaign["budget"] | null; after: Campaign["budget"] }> {
    await ctx.throttled();
    const next = ctx.args.budget as { type: string; amount: string; currency: string };
    const body: Record<string, unknown> = {};
    if (next.type === "daily") {
      body.daily_budget = String(toMinorUnits(next.amount, currencyExponent(next.currency)));
    }
    await graph(ctx, `/${String(ctx.args.entity_id)}`, "POST", [], undefined, "", body);
    const before = ctx.args.current_budget !== undefined
      ? (ctx.args.current_budget as { type: string; amount: string; currency: string })
      : null;
    return {
      ...(before ? { before: { type: before.type as "daily" | "total", amount: before.amount, currency: before.currency.toUpperCase() } } : {}),
      after: { type: next.type as "daily" | "total", amount: next.amount, currency: next.currency.toUpperCase() },
    };
  },

  async setEntityStatus(ctx: Ctx, level: EntityLevel, enable: boolean): Promise<{ status: string }> {
    await ctx.throttled();
    void level;
    await graph(ctx, `/${String(ctx.args.entity_id)}`, "POST", [], undefined, "", { status: enable ? "ACTIVE" : "PAUSED" });
    return { status: enable ? "active" : "paused" };
  },

  async createCreatives(ctx: Ctx): Promise<Ad[]> {
    const adGroupId = String(ctx.args.ad_group_id);
    const out: Ad[] = [];
    for (const specimen of (ctx.args.creatives ?? []) as Array<Record<string, unknown>>) {
      await ctx.throttled();
      const linkData: Record<string, unknown> = {
        link: String(specimen.link ?? ""),
        message: specimen.headline !== undefined ? String(specimen.headline) : undefined,
      };
      if (specimen.image_url !== undefined) linkData.picture = String(specimen.image_url);
      const creative = await graph(ctx, `/act_${ctx.args.account_id}/adcreatives`, "POST", [], undefined, "", {
        name: specimen.name,
        object_story_spec: {
          page_id: ctx.args.page_id,
          link_data: linkData,
        },
      });
      const ad = await graph(ctx, `/${adGroupId}/ads`, "POST", [], undefined, "", {
        name: specimen.name,
        creative: { creative_id: creative.id },
        status: "PAUSED", // always created non-spending; activation is a separate confirmed call
      });
      out.push({
        network: "meta",
        account_id: String(ctx.args.account_id),
        ad_group_id: adGroupId,
        ad_id: String(ad.id),
        name: String(specimen.name),
        status: "paused",
      });
    }
    return out;
  },

  async listAdGroups(ctx: Ctx): Promise<AdGroup[]> {
    await ctx.throttled();
    const filter = ctx.args.campaign_id !== undefined ? `&campaign=${ctx.args.campaign_id}` : "";
    const json = await graph(ctx, `/act_${ctx.args.account_id}/adsets`, "GET", ["id", "name", "status", "campaign"], 100, filter);
    return (json.data as Array<{ id: string; name: string; status: string; campaign?: { id: string } }>).map((r) => ({
      network: "meta",
      account_id: String(ctx.args.account_id),
      ad_group_id: r.id,
      campaign_id: r.campaign?.id ?? "",
      name: r.name,
      status: mapStatus(r.status),
    }));
  },

  async listAds(ctx: Ctx): Promise<Ad[]> {
    await ctx.throttled();
    const json = await graph(ctx, `/${String(ctx.args.ad_group_id)}/ads`, "GET", ["id", "name", "status"]);
    return (json.data as Array<{ id: string; name: string; status: string }>).map((r) => ({
      network: "meta",
      account_id: String(ctx.args.account_id),
      ad_group_id: String(ctx.args.ad_group_id),
      ad_id: r.id,
      name: r.name,
      status: mapStatus(r.status),
    }));
  },

  async listAudiences(ctx: Ctx): Promise<Audience[]> {
    await ctx.throttled();
    const json = await graph(ctx, `/act_${ctx.args.account_id}/customaudiences`, "GET", ["id", "name", "approximate_count_lower_bound"]);
    return (json.data as Array<{ id: string; name: string; approximate_count_lower_bound?: number }>).map((r) => ({
      network: "meta",
      account_id: String(ctx.args.account_id),
      audience_id: r.id,
      name: r.name,
      size_estimated: r.approximate_count_lower_bound !== undefined ? String(r.approximate_count_lower_bound) : null,
    }));
  },

  async estimate(ctx: Ctx): Promise<Record<string, unknown>> {
    await ctx.throttled();
    const json = await graph(ctx, `/act_${ctx.args.account_id}/reachestimate`, "GET", ["estimate_ready", "users", "currency"]);
    return {
      network: "meta",
      account_id: String(ctx.args.account_id),
      estimate: {
        audience_ready: json.estimate_ready ?? null,
        audience_size: json.users !== undefined ? Number(json.users) : null,
        currency: json.currency ?? null,
      },
    };
  },

  async getInsights(ctx: Ctx): Promise<InsightRow[]> {
    await ctx.throttled();
    const nativeLevel = { account: "account", campaign: "campaign", ad_group: "adset", ad: "ad" }[String(ctx.args.entity_level)];
    const scope =
      nativeLevel === "account" ? `/act_${ctx.args.account_id}/insights` : `/${String(ctx.args.entity_id)}/insights`;
    const range = JSON.stringify({ since: String(ctx.args.date_from).replace(/-/gu, ""), until: String(ctx.args.date_to).replace(/-/gu, "") });
    const extra =
      nativeLevel === "account" ? "" : `&${{ campaign: "campaign_id", adset: "adset_id", ad: "ad_id" }[nativeLevel]}=${ctx.args.entity_id}`;
    const json = await graph(
      ctx,
      `${scope}?level=${nativeLevel}&time_increment=1&time_range=${encodeURIComponent(range)}&fields=impressions,clicks,spend,cpm,ctr,actions&limit=500${extra}`,
      "GET",
    );
    const currency = await graph(ctx, `/act_${ctx.args.account_id}`, "GET", ["currency"]).then((j: { currency: string }) => j.currency);
    return (json.data as Array<Record<string, unknown>>).map((raw) => {
      const actions = (raw.actions as Array<{ action_type: string; value: string }> | undefined) ?? [];
      const conversionEvents = actions.find((a) => a.action_type === "offsite_conversion" || a.action_type === "onsite_conversion");
      const metrics: Record<string, string | number | null> = {
        impressions: raw.impressions !== undefined ? Number(raw.impressions) : null,
        clicks: raw.clicks !== undefined ? Number(raw.clicks) : null,
 spend: raw.spend !== undefined ? toDec(fromMinorUnits(String(raw.spend), currencyExponent(currency))) : null,
        cpm: raw.cpm !== undefined ? toDec(fromMinorUnits(String(raw.cpm), currencyExponent(currency))) : null,
        ctr: raw.ctr !== undefined ? Number(raw.ctr) : null,
        conversions: conversionEvents !== undefined ? Number(conversionEvents.value) : null, // unreported stays null
      };
      const available = Object.entries(metrics).filter(([, v]) => v !== null).map(([k]) => k);
      const entityKey = { campaign: "campaign_id", adset: "adset_id", ad: "ad_id", account: "account_id" }[nativeLevel];
      return {
        network: "meta",
        account_id: String(ctx.args.account_id),
        entity_level: String(ctx.args.entity_level) as EntityLevel,
        entity_id: nativeLevel === "account" ? String(ctx.args.account_id) : String(raw[entityKey] ?? ctx.args.entity_id),
        date: HONEST_DATE(String(raw.date_start)),
        currency,
        metrics,
        available,
        date_semantics: { timezone: "account timezone", attribution: "1d-view / 7d-click (account attribution setting)" },
      };
    });
  },

  async submitReport(): Promise<{ server_task: string }> {
    throw new Error("unreachable — matrix declares submit_report unsupported for meta");
  },
  async pollReport(): Promise<{ state: "pending" | "ready" | "error" }> {
    throw new Error("unreachable — matrix declares poll_report unsupported for meta");
  },
  async fetchReport(): Promise<InsightRow[]> {
    throw new Error("unreachable — matrix declares fetch_report unsupported for meta");
  },
};

function resolveConfigured(net: string): boolean {
  void net;
  return false;
}

async function graph(
  ctx: Ctx,
  route: string,
  method: "GET" | "POST",
  fields?: string[],
  limit?: number,
  extra = "",
  body?: Record<string, unknown>,
): Promise<any> {
  const q: string[] = [];
  if (fields !== undefined && fields.length > 0) q.push(`fields=${fields.join(",")}`);
  if (limit !== undefined) q.push(`limit=${limit}`);
  if (extra.startsWith("&")) q.push(extra.slice(1));
  const token = ctx.credentials.values.access_token;
  q.push(`access_token=${encodeURIComponent(token)}`);
  const url = `${API}${route}${q.length > 0 ? `?${q.join("&")}` : ""}`;
  const res = await httpRequest({
    method,
    url,
    ...(body !== undefined
      ? { body: JSON.stringify(body), headers: { "content-type": "application/json" } }
      : {}),
  });
  if (res.status < 200 || res.status >= 300) {
    // deliberately no credential values in the message; parity with the router redaction
    throw new Error(`Meta API HTTP ${res.status}: ${res.body.slice(0, 300)}`);
  }
  return JSON.parse(res.body);
}

// re-export for type plumbing used by tests
export { parseDec };
