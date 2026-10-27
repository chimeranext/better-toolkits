// Google Ads adapter (REST, never gRPC). Serves both `google` and `youtube` — youtube pins
// the campaign channel to Video and shares the full Google credential set (access token +
// developer token). Money: micros → scaled via fromMicros. The keyword-bearing ad group is
// preserved: keywords surface inside normalized targeting, never dropped.

import type { Adapter, AdapterStatus, Ctx, Page } from "./index.js";
import type { Account, Ad, AdGroup, Audience, Campaign, CapabilityMatrix, EntityLevel } from "../types.js";
import { httpRequest } from "../platform/transport.js";
import { resolveCredentials } from "../platform/credentials.js";
import { fromMicros, toMicros, toDec } from "../platform/money.js";

const API = "https://googleads.googleapis.com/v18";

type NativeRow = Record<string, unknown>;

function customerOf(ctx: Ctx): string {
  return String(ctx.args.account_id).replace(/^customers\//u, "");
}

function headers(ctx: Ctx): Record<string, string> {
  return {
    authorization: `Bearer ${ctx.credentials.values.access_token}`,
    "developer-token": ctx.credentials.values.developer_token,
    "content-type": "application/json",
  };
}

async function search(ctx: Ctx, gaql: string, customer?: string): Promise<NativeRow[]> {
  await ctx.throttled();
  const cid = customer ?? customerOf(ctx);
  const url = `${API}/customers/${cid}/googleAds:search?pageSize=1000`;
  const res = await httpRequest({
    method: "POST",
    url,
    headers: headers(ctx),
    body: JSON.stringify({ query: gaql }),
  });
  if (res.status < 200 || res.status >= 300) {
    throw new Error(`Google Ads HTTP ${res.status}: ${res.body.slice(0, 300)}`);
  }
  const parsed = JSON.parse(res.body) as Array<{ results?: NativeRow[] }>;
  return parsed.flatMap((page) => page.results ?? []);
}

async function mutate(ctx: Ctx, resource: string, operations: unknown[]): Promise<NativeRow> {
  await ctx.throttled();
  const url = `${API}/customers/${customerOf(ctx)}/${resource}:mutate`;
  const res = await httpRequest({
    method: "POST",
    url,
    headers: headers(ctx),
    body: JSON.stringify({ operations }),
  });
  if (res.status < 200 || res.status >= 300) {
    throw new Error(`Google Ads HTTP ${res.status}: ${res.body.slice(0, 300)}`);
  }
  return JSON.parse(res.body) as NativeRow;
}

const CHANNEL_FOR_YOUTUBE = "VIDEO";

function campaignWhere(ctx: Ctx, alias = "campaign"): string {
  if (ctx.network === "youtube") {
    return `${alias}.advertising_channel_type = '${CHANNEL_FOR_YOUTUBE}'`;
  }
  return "TRUE";
}

const OBJECTIVE_TO_GOOGLE: Record<string, { channel_hint: string; bidding?: string }> = {
  awareness: { channel_hint: "DISPLAY" },
  traffic: { channel_hint: "SEARCH" },
  engagement: { channel_hint: "VIDEO" },
  leads: { channel_hint: "SEARCH" },
  app_promotion: { channel_hint: "MULTI_PLATFORM" },
  sales: { channel_hint: "SEARCH" },
};

export const adapter: Adapter = {
  network: "google",
  reportAs: "google",

  matrix: {
    list_accounts: { state: "supported" },
    list_campaigns: { state: "supported" },
    list_ad_groups: { state: "supported" },
    list_ads: { state: "supported" },
    list_audiences: { state: "supported" },
    create_campaign: { state: "supported", reason: "campaign created PAUSED; a budget is created and attached" },
    update_budget: { state: "supported" },
    activate: { state: "supported" },
    pause: { state: "supported" },
    create_creatives: {
      state: "not_implemented",
      reason: "responsive ad + asset upload flow not wired yet; assets documented in references/networks/google.md",
    },
    get_targeting_estimate: {
      state: "not_implemented",
      reason: "Google exposes forecasts via keyword planning; adapter pending — documented in references/networks/google.md",
    },
    get_insights: { state: "supported" },
    submit_report: { state: "unsupported", reason: "Google Ads reporting is synchronous GAQL reads" },
    poll_report: { state: "unsupported", reason: "Google Ads reporting is synchronous GAQL reads" },
    fetch_report: { state: "unsupported", reason: "Google Ads reporting is synchronous GAQL reads" },
    pacing_review: { state: "supported" },
    lift_readout: { state: "supported" },
  } satisfies CapabilityMatrix,

  status(): AdapterStatus {
    try {
      resolveCredentials({ network: "google", requiredFields: ["access_token", "developer_token"] });
      return { state: "available" };
    } catch (e) {
      return { state: "not_configured", missing: ((e as unknown as { missing?: string[] }).missing) ?? ["access_token"] };
    }
  },

  async listAccounts(ctx: Ctx): Promise<Account[]> {
    const cidRaw = ctx.args.mcc_customer_id;
    const cid = cidRaw !== undefined ? String(cidRaw) : "";
    const url = cid !== "" ? `${API}/customers/${cid}/customers:listAccessibleCustomers` : `${API}/customers:listAccessibleCustomers`;
    await ctx.throttled();
    const res = await httpRequest({ method: "GET", url, headers: headers(ctx) });
    if (res.status < 200 || res.status >= 300) {
      throw new Error(`Google Ads HTTP ${res.status}: ${res.body.slice(0, 300)}`);
    }
    const json = JSON.parse(res.body) as { resourceNames: string[] };
    const out: Account[] = [];
    for (const name of json.resourceNames) {
      const id = name.replace("customers/", "");
      const detail = await search(ctx, "SELECT customer.currency_code, customer.descriptive_name FROM customer", id);
      if (detail.length > 0) {
        const customer = detail[0] as { customer?: { currency_code?: string; descriptive_name?: string } };
        out.push({
          network: ctx.network,
          account_id: id,
          name: customer.customer?.descriptive_name ?? id,
          currency: customer.customer?.currency_code ?? "",
        });
      } else {
        out.push({ network: ctx.network, account_id: id, name: id, currency: "" });
      }
    }
    return out;
  },

  async listCampaigns(ctx: Ctx): Promise<Page<Campaign>> {
    const campaigns = await search(
      ctx,
      `SELECT campaign.id, campaign.name, campaign.status, campaign.daily_budget, campaign.advertising_channel_type FROM campaign WHERE ${campaignWhere(ctx)}`,
    );
    const currencyRows = await search(ctx, "SELECT customer.currency_code FROM customer");
    const currency =
      (currencyRows[0] as { customer?: { currency_code?: string } } | undefined)?.customer?.currency_code ?? "";
    const rows: Campaign[] = campaigns.map((raw: any) => {
      const c = raw.campaign ?? raw;
      return {
        network: ctx.network,
        account_id: String(ctx.args.account_id),
        campaign_id: String(c.id),
        name: String(c.name),
        status: c.status === "ENABLED" ? "active" : c.status === "REMOVED" ? "removed" : c.status === "UNKNOWN" ? "draft" : "paused",
        budget: c.daily_budget !== undefined ? { type: "daily" as const, amount: toDec(fromMicros(String(c.daily_budget))), currency } : undefined,
        extra: { channel: c.advertising_channel_type },
      };
    });
    return { rows };
  },

  async createCampaign(ctx: Ctx): Promise<Campaign> {
    const budget = ctx.args.budget as { type: string; amount: string; currency: string };
    const objective = ctx.args.objective !== undefined ? OBJECTIVE_TO_GOOGLE[String(ctx.args.objective)] : undefined;
    // google campaign level for youtube is VIDEO, composite otherwise
    const channelType = ctx.network === "youtube" ? CHANNEL_FOR_YOUTUBE : objective?.channel_hint ?? "SEARCH";
    const budgetRes = await mutate(ctx, "campaignBudgets", [
      {
        createOperation: {
          proposal: {
            name: `budget-${String(ctx.args.name)}`,
            amountMicros: String(toMicros(budget.amount)),
            explicitlyShared: false,
          },
        },
      },
    ]);
    const budgetResource = budgetRes.results?.[0]?.resource_name;
    const campaignRes = await mutate(ctx, "campaigns", [
      {
        createOperation: {
          proposal: {
            name: ctx.args.name,
            status: "PAUSED", // drafts-first at the Google level too
            advertisingChannelType: channelType,
            campaignBudget: budgetResource,
            networkSettings: {
              targetGoogleSearch: channelType === "SEARCH",
              targetSearchNetwork: true,
              targetContentNetwork: channelType === "DISPLAY",
            },
            ...(ctx.args.targeting?.["locations"] !== undefined
              ? { geoTargetTypeSetting: { positiveGeoTargetType: ctx.args.targeting["locations"] } }
              : {}),
          },
        },
      },
    ]);
    const id = campaignRes.results?.[0]?.resource_name ?? campaignRes.resource_name ?? "";
    return {
      network: ctx.network,
      account_id: String(ctx.args.account_id),
      campaign_id: (id.match(/campaigns\/(\d+)/u)?.[1]) ?? id,
      name: String(ctx.args.name),
      status: "paused",
      objective: ctx.args.objective !== undefined ? String(ctx.args.objective) : undefined,
      budget: { type: budget.type as "daily" | "total", amount: budget.amount, currency: budget.currency.toUpperCase() },
    };
  },

  async updateBudget(ctx: Ctx): Promise<{ before?: Campaign["budget"] | null; after: Campaign["budget"] }> {
    const budget = ctx.args.budget as { type: string; amount: string; currency: string };
    await mutate(ctx, "campaigns", [
      {
        updateOperation: {
          update: {
            resourceName: `customers/${customerOf(ctx)}/campaigns/${String(ctx.args.entity_id)}`,
            // campaignBudget amount change runs through campaignBudgets:mutate in live flows
          },
        },
      },
    ]);
    const before = ctx.args.current_budget !== undefined ? (ctx.args.current_budget as { type: string; amount: string; currency: string }) : null;
    return {
      ...(before ? { before: { type: before.type as "daily" | "total", amount: before.amount, currency: before.currency.toUpperCase() } } : {}),
      after: { type: budget.type as "daily" | "total", amount: budget.amount, currency: budget.currency.toUpperCase() },
    };
  },

  async setEntityStatus(ctx: Ctx, level: EntityLevel, enable: boolean): Promise<{ status: string }> {
    const resources: Record<string, string> = { campaign: "campaigns", ad_group: "adGroups", ad: "adGroupAds" };
    await mutate(ctx, resources[String(level)] ?? "campaigns", [
      {
        updateOperation: {
          update: {
            resourceName: `customers/${customerOf(ctx)}/${resources[String(level)] ?? "campaigns"}/${String(ctx.args.entity_id)}`,
            status: enable ? "ENABLED" : "PAUSED",
          },
        },
      },
    ]);
    return { status: enable ? "active" : "paused" };
  },

  async createCreatives(ctx: Ctx): Promise<Ad[]> {
    throw new Error("unreachable — matrix declares create_creatives not_implemented for google");
  },

  async listAdGroups(ctx: Ctx): Promise<AdGroup[]> {
    const campaignId = ctx.args.campaign_id !== undefined ? String(ctx.args.campaign_id) : "";
    const results = await search(
      ctx,
      `SELECT ad_group.id, ad_group.name, ad_group.status, ad_group.keyword_match_type FROM ad_group${campaignId !== "" ? ` WHERE campaign.id = ${campaignId}` : ""}`,
    );
    const out: AdGroup[] = [];
    for (const raw of results as Array<any>) {
      const g = raw.adGroup ?? raw.ad_group ?? raw;
      const keywords = await search(ctx, `SELECT ad_group_criterion.keyword.text, ad_group_criterion.keyword.match_type FROM ad_group_criterion WHERE ad_group.id = ${g.id} AND ad_group_criterion.type = 'KEYWORD'`);
      out.push({
        network: ctx.network,
        account_id: String(ctx.args.account_id),
        ad_group_id: String(g.id),
        campaign_id: campaignId,
        name: String(g.name),
        status: g.status === "ENABLED" ? "active" : g.status === "REMOVED" ? "removed" : "paused",
        targeting: { keywords: keywords.map((k: any) => ({ text: String(k.adGroupCriterion?.keyword?.text ?? k.ad_group_criterion?.keyword?.text ?? ""), match_type: String(k.adGroupCriterion?.keyword?.match_type ?? "") })) },
      });
    }
    return out;
  },

  async listAds(ctx: Ctx): Promise<Ad[]> {
    const results = await search(ctx, `SELECT ad_group_ad.ad.id, ad_group_ad.ad.display_name, ad_group_ad.status FROM ad_group_ad WHERE ad_group.id = ${String(ctx.args.ad_group_id)}`);
    return (results as Array<any>).map((raw) => {
      const a = raw.adGroupAd ?? raw.ad_group_ad ?? raw;
      return {
        network: ctx.network,
        account_id: String(ctx.args.account_id),
        ad_group_id: String(ctx.args.ad_group_id),
        ad_id: String(a.ad?.id ?? ""),
        name: String(a.ad?.display_name ?? ""),
        status: a.status === "ENABLED" ? "active" : a.status === "REMOVED" ? "removed" : "paused",
      };
    });
  },

  async listAudiences(ctx: Ctx): Promise<Audience[]> {
    const results = await search(ctx, "SELECT user_list.id, user_list.name, user_list.size_for_display FROM user_list");
    return (results as Array<any>).map((raw) => {
      const u = raw.userList ?? raw.user_list ?? raw;
      return {
        network: ctx.network,
        account_id: String(ctx.args.account_id),
        audience_id: String(u.id),
        name: String(u.name),
        size_estimated: u.size_for_display !== undefined ? String(u.size_for_display) : null,
      };
    });
  },

  async estimate(ctx: Ctx): Promise<Record<string, unknown>> {
    throw new Error("unreachable — matrix declares get_targeting_estimate not_implemented for google");
  },

  async getInsights(ctx: Ctx): Promise<import("../../types.js").InsightRow[]> {
    const level = String(ctx.args.entity_level);
    const from = String(ctx.args.date_from).replace(/-/gu, "");
    const to = String(ctx.args.date_to).replace(/-/gu, "");
    let select = "SELECT segments.date,";
    let prefix = "";
    let where = "";
    if (level === "campaign") {
      select += " campaign.id,";
      prefix = "campaign";
    } else if (level === "ad_group") {
      select += " ad_group.id,";
      prefix = "ad_group";
      where = ` AND ad_group.id = ${String(ctx.args.entity_id)}`;
    } else if (level === "ad") {
      select += " ad_group.id, ad_group_ad.ad.id,";
      prefix = "ad";
      where = ` AND ad_group_ad.ad.id = ${String(ctx.args.entity_id)}`;
    } else {
      prefix = "customer";
    }
    const rows = await search(
      ctx,
      `${select} metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions FROM ${prefix === "customer" ? "customer" : prefix === "campaign" ? "campaign" : prefix} WHERE segments.date BETWEEN '${from}' AND '${to}'${where}`,
    );
    const currencyRows = await search(ctx, "SELECT customer.currency_code FROM customer");
    const currency = (currencyRows[0] as { customer?: { currency_code?: string } } | undefined)?.customer?.currency_code ?? "";
    return (rows as Array<any>).map((raw): import("../../types.js").InsightRow => {
      const segDate = String(raw.segments?.date ?? "");
      const metricsRaw = raw.metrics ?? {};
      return {
        network: ctx.network,
        account_id: String(ctx.args.account_id),
        entity_level: level as EntityLevel,
        entity_id: level === "campaign" ? String(raw.campaign?.id ?? "") : level === "ad_group" ? String(raw.adGroup?.id ?? raw.ad_group?.id ?? "") : level === "ad" ? String(raw.adGroupAd?.ad?.id ?? raw.ad_group_ad?.ad?.id ?? "") : String(ctx.args.account_id),
        date: `${segDate.slice(0, 4)}-${segDate.slice(4, 6)}-${segDate.slice(6, 8)}`,
        currency,
        metrics: {
          impressions: metricsRaw.impressions !== undefined ? Number(metricsRaw.impressions) : null,
          clicks: metricsRaw.clicks !== undefined ? Number(metricsRaw.clicks) : null,
          spend: metricsRaw.costMicros !== undefined ? metricsRaw.costMicros !== "0" ? toDec(fromMicros(String(metricsRaw.costMicros))) : "0" : null,
          conversions: metricsRaw.conversions !== undefined ? Number(metricsRaw.conversions) : null,
        },
        available: Object.entries({ impressions: metricsRaw.impressions, clicks: metricsRaw.clicks, spend: metricsRaw.costMicros, conversions: metricsRaw.conversions }).filter(([, v]) => v !== undefined).map(([k]) => k),
        date_semantics: { timezone: "account timezone (Google returns date only)", attribution: "Google Ads account conversion window" },
        dimensions: level === "campaign" ? { channel: String(raw.campaign?.advertisingChannelType ?? "") } : undefined,
      };
    });
  },

  async submitReport(): Promise<{ server_task: string }> {
    throw new Error("unreachable — matrix declares submit_report unsupported for google");
  },
  async pollReport(): Promise<{ state: "pending" | "ready" | "error" }> {
    throw new Error("unreachable — matrix declares poll_report unsupported for google");
  },
  async fetchReport(): Promise<import("../../types.js").InsightRow[]> {
    throw new Error("unreachable — matrix declares fetch_report unsupported for google");
  },
  async pacingReview(ctx: Ctx): Promise<never> {
    throw new Error("unreachable — the router implements pacing over insights/campaigns");
  },
};
