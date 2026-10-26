// One schema source for the MCP tool surface and the CLI args (spec: ads-multi-network-mcp
// "One schema source for MCP and CLI"). Field names are normalized vocabulary only.
// NOTE: no field here may express an enabled/spending entity — enforced by T37 schema tests.

import type { Network } from "./types.js";

export type FieldType = "string" | "number" | "boolean" | "object" | "array";

export interface FieldSpec {
  type: FieldType;
  required?: boolean;
  desc: string;
  enum?: string[];
  itemSchema?: Record<string, FieldSpec>;
}

export interface OperationDef {
  name: string;
  description: string;
  mutating: boolean;
  needsNetwork: boolean;
  input: Record<string, FieldSpec>;
}

const NETWORK_ENUM: string[] = ["meta", "tiktok", "linkedin", "google", "youtube", "spotify"];

const CREDENTIALS_FIELD: FieldSpec = {
  type: "object",
  required: false,
  desc: "Optional per-call credentials (callers managing their own secrets). Never echoed back.",
};

const moneyShape = (reqAmt: boolean, reqCur: boolean): Record<string, FieldSpec> => ({
  amount: { type: "string", required: reqAmt, desc: "Decimal amount in the account currency." },
  currency: { type: "string", required: reqCur, desc: "ISO-4217 currency of the account (never converted)." },
});

export const OPERATIONS: OperationDef[] = [
  {
    name: "capability_report",
    description:
      "Per-network state: available | not_configured | error, plus the declared capability matrix. " +
      "The only source of truth about which networks this server can act on. Works with zero configured networks.",
    mutating: false,
    needsNetwork: false,
    input: {},
  },
  {
    name: "list_accounts",
    description: "List ad accounts the credentials can see, normalized: {account_id, name, currency}.",
    mutating: false,
    needsNetwork: true,
    input: {
      network: { type: "string", required: true, enum: NETWORK_ENUM, desc: "Which network to address." },
      credentials: CREDENTIALS_FIELD,
    },
  },
  {
    name: "list_campaigns",
    description: "List normalized campaigns for an account. On LinkedIn these are the network's campaign groups (one-level shift absorbed on read).",
    mutating: false,
    needsNetwork: true,
    input: {
      network: { type: "string", required: true, enum: NETWORK_ENUM, desc: "Which network to address." },
      account_id: { type: "string", required: true, desc: "Normalized account identifier from list_accounts." },
      limit: { type: "number", required: false, desc: "Max rows per page (default 50)." },
      page_token: { type: "string", required: false, desc: "Continuation handle returned by a previous page." },
      credentials: CREDENTIALS_FIELD,
    },
  },
  {
    name: "create_campaign",
    description:
      "Create a DRAFT campaign (drafts-first: the schema has no field that can express an active state). " +
      "Without `apply` this is a dry-run returning the intended change with no network call. " +
      "Activation is a separate operation requiring the apply flag and explicit human confirmation.",
    mutating: true,
    needsNetwork: true,
    input: {
      network: { type: "string", required: true, enum: NETWORK_ENUM, desc: "Which network to address." },
      account_id: { type: "string", required: true, desc: "Normalized account identifier." },
      name: { type: "string", required: true, desc: "Plain-language campaign name." },
      objective: {
        type: "string",
        required: false,
        desc: "Normalized objective: awareness | traffic | engagement | leads | app_promotion | sales | search.",
      },
      budget: {
        type: "object",
        required: true,
        desc: "Normalized budget; validated against configured spend caps BEFORE any network request.",
        itemSchema: {
          type: { type: "string", required: true, enum: ["daily", "total"], desc: "Budget cadence." },
          ...moneyShape(true, true),
        },
      },
      targeting: { type: "object", required: false, desc: "Normalized targeting (adapter-owned opaque shape, declared per network)." },
      apply: { type: "boolean", required: false, desc: "Must be true to touch the network; otherwise a dry-run diff is returned." },
      credentials: CREDENTIALS_FIELD,
    },
  },
  {
    name: "update_budget",
    description:
      "Change a campaign or ad-group budget. Dry-run by default: pass `current_budget` and omit `apply` to get the local diff with NO network request. With `apply`, the guardrail check runs before the request.",
    mutating: true,
    needsNetwork: true,
    input: {
      network: { type: "string", required: true, enum: NETWORK_ENUM, desc: "Which network to address." },
      entity_level: { type: "string", required: true, enum: ["campaign", "ad_group"], desc: "Which normalized level holds the budget." },
      entity_id: { type: "string", required: true, desc: "Normalized entity identifier." },
      current_budget: {
        type: "object",
        required: false,
        desc: "The budget as last seen (from list_*). Required for the no-network dry-run.",
        itemSchema: { type: { type: "string", required: true, enum: ["daily", "total"], desc: "Budget cadence." }, ...moneyShape(true, true) },
      },
      budget: {
        type: "object",
        required: true,
        desc: "The new budget.",
        itemSchema: { type: { type: "string", required: true, enum: ["daily", "total"], desc: "Budget cadence." }, ...moneyShape(true, true) },
      },
      apply: { type: "boolean", required: false, desc: "Must be true to touch the network." },
      credentials: CREDENTIALS_FIELD,
    },
  },
  {
    name: "activate",
    description:
      "Enable a DRAFT/PAUSED entity. Requires `apply: true` AND `confirmed: true` (the encoded human confirmation). Creation never produces an active entity; this is the only path to enable one.",
    mutating: true,
    needsNetwork: true,
    input: {
      network: { type: "string", required: true, enum: NETWORK_ENUM, desc: "Which network to address." },
      entity_level: { type: "string", required: true, enum: ["campaign", "ad_group", "ad"], desc: "Which entity to enable." },
      entity_id: { type: "string", required: true, desc: "Normalized entity identifier." },
      apply: { type: "boolean", required: true, desc: "Must be true." },
      confirmed: { type: "boolean", required: true, desc: "Explicit human confirmation. The toolkit never activates without it." },
      credentials: CREDENTIALS_FIELD,
    },
  },
  {
    name: "pause",
    description: "Pause an entity (the perform step of kill rules / pacing decisions). Dry-run by default.",
    mutating: true,
    needsNetwork: true,
    input: {
      network: { type: "string", required: true, enum: NETWORK_ENUM, desc: "Which network to address." },
      entity_level: { type: "string", required: true, enum: ["campaign", "ad_group", "ad"], desc: "Which entity to pause." },
      entity_id: { type: "string", required: true, desc: "Normalized entity identifier." },
      apply: { type: "boolean", required: false, desc: "Must be true to touch the network." },
      credentials: CREDENTIALS_FIELD,
    },
  },
  {
    name: "create_creatives",
    description:
      "Batch-launch creatives into one ad group in a single operation, each non-spending and individually addressable afterwards (creative testing at volume). Dry-run by default.",
    mutating: true,
    needsNetwork: true,
    input: {
      network: { type: "string", required: true, enum: NETWORK_ENUM, desc: "Which network to address." },
      ad_group_id: { type: "string", required: true, desc: "Normalized ad group identifier." },
      creatives: {
        type: "array",
        required: true,
        desc: "Creative set to launch (all created paused).",
        itemSchema: {
          name: { type: "string", required: true, desc: "Plain-language creative name (becomes the ad name)." },
          headline: { type: "string", required: false, desc: "Primary text/headline." },
          image_url: { type: "string", required: false, desc: "Link to the creative asset." },
          link: { type: "string", required: false, desc: "Destination URL." },
        },
      },
      apply: { type: "boolean", required: false, desc: "Must be true to touch the network." },
      credentials: CREDENTIALS_FIELD,
    },
  },
  {
    name: "list_ad_groups",
    description: "List ad groups under a campaign. On LinkedIn these are the network's campaigns; on Google the ad group carries keywords inside `targeting` (never dropped).",
    mutating: false,
    needsNetwork: true,
    input: {
      network: { type: "string", required: true, enum: NETWORK_ENUM, desc: "Which network to address." },
      campaign_id: { type: "string", required: true, desc: "Normalized campaign identifier." },
      credentials: CREDENTIALS_FIELD,
    },
  },
  {
    name: "list_ads",
    description: "List ads under an ad group (per-creative judgement level).",
    mutating: false,
    needsNetwork: true,
    input: {
      network: { type: "string", required: true, enum: NETWORK_ENUM, desc: "Which network to address." },
      ad_group_id: { type: "string", required: true, desc: "Normalized ad group identifier." },
      credentials: CREDENTIALS_FIELD,
    },
  },
  {
    name: "list_audiences",
    description: "List audiences (Meta custom audiences, LinkedIn DMP segments, Google user lists, TikTok audiences, Spotify audiences).",
    mutating: false,
    needsNetwork: true,
    input: {
      network: { type: "string", required: true, enum: NETWORK_ENUM, desc: "Which network to address." },
      account_id: { type: "string", required: true, desc: "Normalized account identifier." },
      credentials: CREDENTIALS_FIELD,
    },
  },
  {
    name: "get_targeting_estimate",
    description: "Estimate audience size / bid range for a normalized targeting object (Meta reach estimate; Spotify audience estimation). Networks without an estimate endpoint declare it so.",
    mutating: false,
    needsNetwork: true,
    input: {
      network: { type: "string", required: true, enum: NETWORK_ENUM, desc: "Which network to address." },
      account_id: { type: "string", required: true, desc: "Normalized account identifier." },
      targeting: { type: "object", required: true, desc: "Normalized targeting (adapter-owned shape)." },
      credentials: CREDENTIALS_FIELD,
    },
  },
  {
    name: "get_insights",
    description:
      "Canonical insight rows (one shape for all six networks; metric `null` + availability flag = not reported, never coerced to 0). Amounts are decimal strings in the account currency, unit-normalized at the adapter boundary.",
    mutating: false,
    needsNetwork: true,
    input: {
      network: { type: "string", required: true, enum: NETWORK_ENUM, desc: "Which network to address." },
      account_id: { type: "string", required: true, desc: "Normalized account identifier." },
      entity_level: { type: "string", required: true, enum: ["account", "campaign", "ad_group", "ad"], desc: "Row level; never mixed in one aggregate." },
      entity_id: { type: "string", required: false, desc: "Scopes rows to one entity when given." },
      date_from: { type: "string", required: true, desc: "yyyy-mm-dd (inclusive)." },
      date_to: { type: "string", required: true, desc: "yyyy-mm-dd (inclusive)." },
      credentials: CREDENTIALS_FIELD,
    },
  },
  {
    name: "submit_report",
    description:
      "Start an asynchronous report (submit; returns the task handle immediately — never blocks an agent turn). Async networks only: 'meta' and 'linkedin' declare this unsupported (their insights are synchronous).",
    mutating: false,
    needsNetwork: true,
    input: {
      network: { type: "string", required: true, enum: NETWORK_ENUM, desc: "Which network to address." },
      account_id: { type: "string", required: true, desc: "Normalized account identifier." },
      entity_level: { type: "string", required: true, enum: ["account", "campaign", "ad_group", "ad"], desc: "Row level of the report." },
      date_from: { type: "string", required: true, desc: "yyyy-mm-dd (inclusive)." },
      date_to: { type: "string", required: true, desc: "yyyy-mm-dd (inclusive)." },
      credentials: CREDENTIALS_FIELD,
    },
  },
  {
    name: "poll_report",
    description: "Poll an async report by task handle. Returns pending until ready; never presents partial rows as complete.",
    mutating: false,
    needsNetwork: true,
    input: {
      network: { type: "string", required: true, enum: NETWORK_ENUM, desc: "Which network to address." },
      account_id: { type: "string", required: true, desc: "Normalized account identifier." },
      task_id: { type: "string", required: true, desc: "The handle returned by submit_report." },
      credentials: CREDENTIALS_FIELD,
    },
  },
  {
    name: "fetch_report",
    description: "Fetch the completed report. Rows conform to the same canonical schema as get_insights, including the availability map.",
    mutating: false,
    needsNetwork: true,
    input: {
      network: { type: "string", required: true, enum: NETWORK_ENUM, desc: "Which network to address." },
      account_id: { type: "string", required: true, desc: "Normalized account identifier." },
      task_id: { type: "string", required: true, desc: "The handle returned by submit_report." },
      credentials: CREDENTIALS_FIELD,
    },
  },
  {
    name: "pacing_review",
    description:
      "Per-campaign delivery vs budget over the last N days; flags underdelivery and overspend with observed value and threshold. Kill conditions are proposed here — never performed silently.",
    mutating: false,
    needsNetwork: true,
    input: {
      network: { type: "string", required: true, enum: NETWORK_ENUM, desc: "Which network to address." },
      account_id: { type: "string", required: true, desc: "Normalized account identifier." },
      period_days: { type: "number", required: true, desc: "Review window length in days (1–90)." },
      credentials: CREDENTIALS_FIELD,
    },
  },
  {
    name: "journal_append",
    description: "Record a change made OUTSIDE the toolkit (e.g. in the network UI) so it participates in the same lift readout.",
    mutating: false,
    needsNetwork: false,
    input: {
      network: { type: "string", required: false, enum: NETWORK_ENUM, desc: "Network addressed, when known." },
      entity_level: { type: "string", required: false, enum: ["account", "campaign", "ad_group", "ad"], desc: "Entity level." },
      entity_id: { type: "string", required: false, desc: "Entity identifier." },
      label: { type: "string", required: true, desc: "What the external change was. Marked as manual in the journal." },
      field: { type: "string", required: false, desc: "Field affected, when known." },
      before: { type: "object", required: false, desc: "Before value, when known." },
      after: { type: "object", required: false, desc: "After value, when known." },
    },
  },
  {
    name: "journal_list",
    description: "Read recent journal entries (automatic + manual).",
    mutating: false,
    needsNetwork: false,
    input: { limit: { type: "number", required: false, desc: "Max entries (default 50)." } },
  },
  {
    name: "lift_readout",
    description: "Before/after comparison per recorded change. Directional, NOT a controlled experiment — the response always states the confounds.",
    mutating: false,
    needsNetwork: true,
    input: {
      network: { type: "string", required: true, enum: NETWORK_ENUM, desc: "Which network to address." },
      entity_level: { type: "string", required: true, enum: ["account", "campaign", "ad_group", "ad"], desc: "Entity whose changes are read." },
      entity_id: { type: "string", required: true, desc: "Entity identifier." },
      window_days: { type: "number", required: true, desc: "Before/after window width in days (1–90)." },
      credentials: CREDENTIALS_FIELD,
    },
  },
];

export const OPERATION_MAP: Map<string, OperationDef> = new Map(OPERATIONS.map((o) => [o.name, o]));

/** JSON-Schema projection for the MCP tools/list surface. */
export function toToolSchema(def: OperationDef): { name: string; description: string; inputSchema: object } {
  const required: string[] = [];
  const properties: Record<string, unknown> = {};
  for (const [key, f] of Object.entries(def.input)) {
    if (f.required) required.push(key);
    if (f.type === "object" && f.itemSchema) {
      const subRequired: string[] = [];
      const subProps: Record<string, unknown> = {};
      for (const [k, sf] of Object.entries(f.itemSchema)) {
        if (sf.required) subRequired.push(k);
        subProps[k] = { type: sf.type, description: sf.desc, ...(sf.enum ? { enum: sf.enum } : {}) };
      }
      properties[key] = {
        type: "object",
        description: f.desc,
        properties: subProps,
        ...(subRequired.length > 0 ? { required: subRequired } : {}),
      };
    } else if (f.type === "array" && f.itemSchema) {
      const subRequired: string[] = [];
      const subProps: Record<string, unknown> = {};
      for (const [k, sf] of Object.entries(f.itemSchema)) {
        if (sf.required) subRequired.push(k);
        subProps[k] = { type: sf.type, description: sf.desc, ...(sf.enum ? { enum: sf.enum } : {}) };
      }
      properties[key] = {
        type: "array",
        description: f.desc,
        items: { type: "object", properties: subProps, ...(subRequired.length > 0 ? { required: subRequired } : {}) },
      };
    } else {
      properties[key] = { type: f.type, description: f.desc, ...(f.enum ? { enum: f.enum } : {}) };
    }
  }
  return {
    name: def.name,
    description: def.description,
    inputSchema: { type: "object", properties, ...(required.length > 0 ? { required } : {}) },
  };
}

/** Validation errors own-code: the schema is authoritative for both surfaces. */
export function validateArgs(def: OperationDef, args: Record<string, unknown>): string[] {
  const errors: string[] = [];
  const check = (spec: FieldSpec, value: unknown, path: string) => {
    if (value === undefined || value === null) return;
    if (spec.enum && !spec.enum.includes(String(value))) {
      errors.push(`${path} must be one of ${spec.enum.join(", ")}`);
      return;
    }
    switch (spec.type) {
      case "object": {
        if (typeof value !== "object" || Array.isArray(value)) {
          errors.push(`${path} must be an object`);
          return;
        }
        if (spec.itemSchema) {
          for (const [k, sf] of Object.entries(spec.itemSchema)) {
            if (sf.required && (value as Record<string, unknown>)[k] === undefined) {
              errors.push(`${path}.${k} is required`);
            } else {
              check(sf, (value as Record<string, unknown>)[k], `${path}.${k}`);
            }
          }
        }
        break;
      }
      case "array": {
        if (!Array.isArray(value)) {
          errors.push(`${path} must be an array`);
          return;
        }
        if (spec.itemSchema) {
          for (let i = 0; i < value.length; i++) {
            for (const [k, sf] of Object.entries(spec.itemSchema)) {
              const item = value[i] as Record<string, unknown>;
              if (sf.required && item[k] === undefined) {
                errors.push(`${path}[${i}].${k} is required`);
              }
            }
          }
        }
        break;
      }
      case "boolean":
        if (typeof value !== "boolean") errors.push(`${path} must be a boolean`);
        break;
      case "number":
        if (typeof value !== "number" || !Number.isFinite(value)) errors.push(`${path} must be a finite number`);
        break;
      case "string":
        if (typeof value !== "string" || value === "") errors.push(`${path} must be a non-empty string`);
        break;
    }
  };
  for (const [key, spec] of Object.entries(def.input)) {
    if (spec.required && args[key] === undefined) {
      errors.push(`${key} is required`);
      continue;
    }
    check(spec, args[key], key);
  }
  return errors;
}

/** Forbidden vendor field names asserted by the contract tests (T36/T37 companion). */
export const FORBIDDEN_VENDOR_FIELDS: string[] = [
  "act_id",
  "adset_id",
  "adset",
  "advertiser_id",
  "campaign_group_id",
  "spend_micros",
  "daily_budget_micros",
  "total_spend",
  "customer_id",
  "twitter",
];

export type { Network };
