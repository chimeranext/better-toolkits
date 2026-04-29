/**
 * Adapter pattern para fuentes de revenue. Default: Meta pixel (vía insights API).
 * Si mañana se agrega Stripe/RevenueCat/PostHog, se implementa otro adapter
 * sin tocar el cálculo de LTV.
 */

import type { GraphApiClient } from "./graph-api.js";
import { actionValue, num, type InsightRow } from "./graph-api.js";
import { readFileSync } from "node:fs";

export type CustomerRevenue = {
  customer_id: string;
  first_purchase_date: string;
  total_revenue: number;
  total_purchases: number;
  source: string;
};

export type RevenueSource = {
  /** Total spend, customers, revenue agregados por plataforma para una ventana. */
  fetchAggregatedByPlatform(window: {
    since: string;
    until: string;
  }): Promise<PlatformAggregate[]>;
  /** Customer-level revenue para cohort analysis. Puede ser estimado si la fuente no lo permite. */
  fetchCustomerLevel?(window: {
    since: string;
    until: string;
  }): Promise<CustomerRevenue[]>;
};

export type PlatformAggregate = {
  platform: "facebook" | "instagram" | "audience_network" | "messenger" | "other";
  spend: number;
  customers: number;
  revenue: number;
  impressions: number;
  clicks: number;
};

/**
 * Adapter principal: usa insights de Meta. Calcula customers y revenue desde
 * actions/action_values con action_type="purchase" o "offsite_conversion.fb_pixel_purchase".
 */
export class MetaPixelRevenueSource implements RevenueSource {
  constructor(private readonly client: GraphApiClient) {}

  async fetchAggregatedByPlatform(window: {
    since: string;
    until: string;
  }): Promise<PlatformAggregate[]> {
    const rows = await this.client.insights(
      "campaign",
      ["spend", "impressions", "clicks", "actions", "action_values"],
      {
        timeRange: window,
        breakdowns: ["publisher_platform"],
      },
    );

    const byPlatform = new Map<string, PlatformAggregate>();
    for (const row of rows) {
      const platform = (row.publisher_platform ??
        "other") as PlatformAggregate["platform"];
      const existing = byPlatform.get(platform) ?? {
        platform,
        spend: 0,
        customers: 0,
        revenue: 0,
        impressions: 0,
        clicks: 0,
      };
      existing.spend += num(row.spend);
      existing.impressions += num(row.impressions);
      existing.clicks += num(row.clicks);
      existing.customers += this.purchaseCount(row);
      existing.revenue += this.purchaseValue(row);
      byPlatform.set(platform, existing);
    }
    return [...byPlatform.values()];
  }

  private purchaseCount(row: InsightRow): number {
    return (
      actionValue(row, "purchase") +
      actionValue(row, "offsite_conversion.fb_pixel_purchase") +
      actionValue(row, "omni_purchase")
    );
  }

  private purchaseValue(row: InsightRow): number {
    return (
      actionValue(row, "purchase", "action_values") +
      actionValue(
        row,
        "offsite_conversion.fb_pixel_purchase",
        "action_values",
      ) +
      actionValue(row, "omni_purchase", "action_values")
    );
  }
}

/**
 * Adapter de CSV. Útil cuando el revenue real vive fuera de Meta (Stripe, custom DB)
 * y el usuario exporta periódicamente. Espera columnas: customer_id, purchase_date, amount.
 */
export class CsvRevenueSource implements RevenueSource {
  constructor(private readonly csvPath: string) {}

  async fetchAggregatedByPlatform(): Promise<PlatformAggregate[]> {
    throw new Error(
      "CSV adapter doesn't expose platform-level data. Combine with MetaPixelRevenueSource for spend/platform and use CsvRevenueSource only for fetchCustomerLevel.",
    );
  }

  async fetchCustomerLevel(window: {
    since: string;
    until: string;
  }): Promise<CustomerRevenue[]> {
    const text = readFileSync(this.csvPath, "utf-8");
    const lines = text.trim().split("\n");
    const headerLine = lines[0];
    if (!headerLine) throw new Error(`CSV empty: ${this.csvPath}`);
    const header = headerLine.split(",").map((h) => h.trim());
    const idIdx = header.indexOf("customer_id");
    const dateIdx = header.indexOf("purchase_date");
    const amtIdx = header.indexOf("amount");
    if (idIdx === -1 || dateIdx === -1 || amtIdx === -1) {
      throw new Error(
        `CSV must have columns customer_id, purchase_date, amount. Got: ${header.join(",")}`,
      );
    }

    const since = new Date(window.since).getTime();
    const until = new Date(window.until).getTime();
    const byCustomer = new Map<string, CustomerRevenue>();

    for (const line of lines.slice(1)) {
      const cells = line.split(",");
      const id = cells[idIdx]?.trim();
      const date = cells[dateIdx]?.trim();
      const amt = num(cells[amtIdx]?.trim());
      if (!id || !date) continue;
      const t = new Date(date).getTime();
      if (t < since || t > until) continue;

      const existing = byCustomer.get(id) ?? {
        customer_id: id,
        first_purchase_date: date,
        total_revenue: 0,
        total_purchases: 0,
        source: "csv",
      };
      if (date < existing.first_purchase_date) {
        existing.first_purchase_date = date;
      }
      existing.total_revenue += amt;
      existing.total_purchases += 1;
      byCustomer.set(id, existing);
    }
    return [...byCustomer.values()];
  }
}

export function buildRevenueSource(
  client: GraphApiClient,
  type: "meta_pixel" | "csv",
  config: { csv_path?: string } = {},
): RevenueSource {
  switch (type) {
    case "meta_pixel":
      return new MetaPixelRevenueSource(client);
    case "csv":
      if (!config.csv_path) {
        throw new Error("revenue_source.config.csv_path required for csv type");
      }
      return new CsvRevenueSource(config.csv_path);
    default:
      throw new Error(`Unknown revenue source type: ${type}`);
  }
}
