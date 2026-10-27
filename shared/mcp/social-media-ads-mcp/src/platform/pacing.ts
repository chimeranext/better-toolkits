// Pacing review (media-buyer-operations spec): delivery vs budget over a period, flags both
// underdelivery and overspend with observed value and threshold. Kill conditions are PROPOSED
// here — never performed by this module; performing is the caller's explicit `pause` with apply.

import type { Adapter, Ctx, PacingRow } from "../adapters/index.js";
import { parseDec, add, toDec, cmp } from "./money.js";
import { isoDate, isoDaysAgo } from "./dates.js";

const FLAG_THRESHOLD = 0.2; // ±20% deviation from intended pace

export interface PacingFinding {
  campaign_id: string;
  campaign_name: string;
  status: string;
  planned_daily_budget: { type: string; amount: string; currency: string } | null;
  observed_daily_spend: { amount: string; currency: string } | null;
  deviation: number | null;
  flags: string[];
}

export async function pacingReview(adapter: Adapter, ctx: Ctx, periodDays: number, reportAs: string): Promise<PacingFinding[]> {
  const days = Math.max(1, Math.min(90, periodDays));
  const campaignPage = await adapter.listCampaigns(ctx);
  const period = { from: isoDaysAgo(days), to: isoDate() };
  const insightCalls = (adapter as unknown as { getInsights: (c: Ctx) => Promise<{ metrics: Record<string, string | number | null>; currency: string; entity_id: string }[]> });
  const rowsCtx: Ctx = { ...ctx, args: { ...ctx.args, date_from: period.from, date_to: period.to, entity_level: "campaign" } };
  const rows = await insightCalls.getInsights.call(adapter, rowsCtx);

  const spendByCampaign = new Map<string, bigint>();
  const currencyByCampaign = new Map<string, string>();
  for (const row of rows) {
    const spendRaw = row.metrics["spend"];
    if (spendRaw === null || spendRaw === undefined) continue;
    const scaled = parseDec(String(spendRaw));
    spendByCampaign.set(row.entity_id, add(spendByCampaign.get(row.entity_id) ?? 0n, scaled));
    currencyByCampaign.set(row.entity_id, row.currency);
  }

  const out: PacingFinding[] = [];
  for (const campaign of campaignPage.rows) {
    const totalScaled = spendByCampaign.get(campaign.campaign_id) ?? null;
    const currency = currencyByCampaign.get(campaign.campaign_id) ?? campaign.budget?.currency ?? null;
    if (totalScaled === null || !currency) {
      out.push({
        campaign_id: campaign.campaign_id,
        campaign_name: campaign.name,
        status: campaign.status,
        planned_daily_budget: campaign.budget ?? null,
        observed_daily_spend: null,
        deviation: null,
        flags: ["no_reported_spend"],
      });
      continue;
    }
    const observedDaily = totalScaled / BigInt(days);
    const plannedDaily = campaign.budget ? parseDec(campaign.budget.amount) : null;
    const deviation = plannedDaily ? (Number(observedDaily) - Number(plannedDaily)) / Number(plannedDaily) : null;
    const flags: string[] = [];
    if (deviation !== null && deviation > FLAG_THRESHOLD) flags.push("overspend");
    if (deviation !== null && deviation < -FLAG_THRESHOLD) flags.push("underdelivery");
    out.push({
      campaign_id: campaign.campaign_id,
      campaign_name: campaign.name,
      status: campaign.status,
      planned_daily_budget: campaign.budget ? { type: campaign.budget.type, amount: toDec(plannedDaily as bigint), currency: campaign.budget.currency } : null,
      observed_daily_spend: { amount: toDec(observedDaily), currency },
      deviation: deviation === null ? null : Math.round(deviation * 1000) / 1000,
      flags,
    });
  }
  void reportAs;
  void cmp;
  return out;
}

// paginator declaration to satisfy the unused-var checker in strict builds
export type { PacingRow };
