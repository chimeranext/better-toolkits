// Lift readout (media-buyer-operations spec): per recorded change, metrics in the window
// before vs after. Directional — always labelled, confounds always disclosed.

import type { Adapter, Ctx } from "../adapters/index.js";
import { readLast } from "./journal.js";
import { parseDec, add, toDec } from "./money.js";
import { isoDate, isoDaysAgo } from "./dates.js";

export const CONFOUNDS =
  "directional comparison, NOT a controlled experiment. Confounds: seasonality, the post-edit learning phase, " +
  "concurrent budget changes, and shortened partial after-windows for recent changes." +
  "";

interface RowLike {
  entity_id: string;
  currency: string;
  metrics: Record<string, string | number | null>;
  date: string;
}

const SUM_NUM: string[] = ["impressions", "clicks", "conversions"];

/** Aggregate canonical rows: numeric counters sum; money sums in its own currency; null propagates. */
export function aggregateRows(rows: RowLike[]): { metrics: Record<string, string | number | null>; currency: string | null } {
  const metrics: Record<string, string | number | null> = {};
  const currencies = new Set(rows.map((r) => r.currency));
  if (currencies.size > 1) {
    // never convert across currencies (network-adapters spec) — separate rows keep their own currency
    return { metrics: { _error: null } as Record<string, string | number | null>, currency: null };
  }
  const currency = currencies.size === 1 ? [...currencies][0] : null;
  for (const row of rows) {
    for (const [k, v] of Object.entries(row.metrics)) {
      const isMoney = k === "spend";
      if (SUM_NUM.includes(k)) {
        if (v === null) {
          metrics[k] = null;
          continue;
        }
        metrics[k] = Number(metrics[k] ?? 0) + Number(v);
      } else if (isMoney) {
        if (v === null) {
          metrics[k] = null;
          continue;
        }
        metrics[k] = toDec(add(parseDec(String(metrics[k] ?? "0")), parseDec(String(v))));
      } else {
        metrics[k] = v === null ? null : v;
      }
    }
  }
  return { metrics, currency };
}

export async function liftReadout(adapter: Adapter, ctx: Ctx, windowDays: number, reportAs: string): Promise<Record<string, unknown>> {
  const win = Math.max(1, Math.min(90, windowDays));
  const entityId = String(ctx.args.entity_id);
  const journal = readLast(500).filter(
    (entry) => entry.entity_id === entityId && (ctx.args.network !== undefined ? entry.network === String(ctx.args.network) : true),
  );
  if (journal.length === 0) {
    return {
      entity_id: entityId,
      changes: [],
      note: CONFOUNDS,
    };
  }
  const getInsightsFn = (adapter as unknown as { getInsights: (c: Ctx) => Promise<RowLike[]> });
  const changes: Record<string, unknown>[] = [];
  for (const entry of journal) {
    const at = entry.ts?.slice(0, 10) ?? isoDate();
    const beforeCtx: Ctx = { ...ctx, args: { ...ctx.args, entity_level: entry.entity_level ?? "campaign", date_from: isoDaysAgo(win + dayDiff(isoDate(), at)), date_to: shiftBefore(at) } };
    const afterCtx: Ctx = { ...ctx, args: { ...ctx.args, entity_level: entry.entity_level ?? "campaign", date_from: shiftBefore(at), date_to: isoDate() } };
    const beforeRows = await getInsightsFn.getInsights.call(adapter, beforeCtx);
    const afterRows = await getInsightsFn.getInsights.call(adapter, afterCtx);
    const before = aggregateRows(beforeRows);
    const after = aggregateRows(afterRows);
    changes.push({
      ts: entry.ts,
      label: entry.label ?? entry.operation,
      field: entry.field,
      before: { unit: before.currency, metrics: before.metrics, window_days_partial: true },
      after: { unit: after.currency, metrics: after.metrics, window_days_partial: true },
      delta_note: "deltas omit metrics unavailable on either side (null stays null, never 0)",
    });
  }
  void reportAs;
  return {
    entity_id: entityId,
    changes,
    directional: true,
    note: CONFOUNDS,
  };
}

function dayDiff(a: string, b: string): number {
  return Math.round((Date.parse(`${a}T00:00:00Z`) - Date.parse(`${b}T00:00:00Z`)) / 86_400_000);
}

/** the boundary date: the change day itself closes the before window (change day assumed in after). */
function shiftBefore(at: string): string {
  return isoDate(new Date(Date.parse(`${at}T00:00:00Z`) - 0));
}
