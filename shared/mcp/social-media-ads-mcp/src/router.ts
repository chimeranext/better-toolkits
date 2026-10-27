// Operation router — the single request chokepoint.
// Order per spec: schema validation → capability matrix (declared) → guardrails (BEFORE any
// network request) → adapter call → change journal → redaction. Mutations gate on `apply`;
// activation additionally gates on `confirmed`. Dry-runs compute diffs with NO network call.

import { OPERATION_MAP, validateArgs } from "./operations.js";
import { OpError, envelopeOf } from "./errors.js";
import { buildRegistry, REGISTRY, type Adapter, type Ctx } from "./adapters/index.js";
import { resolveCredentials, type ResolvedCredentials } from "./platform/credentials.js";
import { acquire } from "./platform/throttle.js";
import { append as journalAppend, readLast, type JournalEntry } from "./platform/journal.js";
import { checkDailyCap } from "./platform/guardrails.js";
import { parseDec, sub, toDec } from "./platform/money.js";
import { parsePeriod } from "./platform/periods.js";
import { stripCredentialFields, redact } from "./platform/redact.js";
import { get as getTask, save as saveTask, updateState as updateTaskState, newTaskId } from "./platform/tasks.js";
import { pacingReview } from "./platform/pacing.js";
import { liftReadout } from "./platform/lift.js";
import type { Network, Budget, EntityLevel } from "./types.js";

// ---------------------------------------------------------------- helpers

function requireNetwork(args: Record<string, unknown>): Network {
  const n = String(args.network);
  return n as Network;
}

function budgetOf(v: unknown): Budget {
  const b = (v ?? {}) as Record<string, unknown>;
  return {
    type: String(b.type) as Budget["type"],
    amount: String(b.amount),
    currency: String(b.currency).toUpperCase(),
  };
}

function opContext(adapterNetworkId: string, args: Record<string, unknown>, creds: ResolvedCredentials): Ctx {
  const requestedNetwork = String(args.network) as Network;
  return {
    network: requestedNetwork,
    credentials: creds,
    args,
    throttled: async () => {
      const account = String(args.account_id ?? args.entity_id ?? "no-account");
      await acquire(adapterNetworkId, account);
    },
  };
}

function requiredCreds(adapter: Adapter, op: string, perCall?: Record<string, string>): ResolvedCredentials {
  const required: string[] =
    adapter.network === "google" ? ["access_token", "developer_token"] : ["access_token"];
  try {
    return resolveCredentials({ network: adapter.network, requiredFields: required, perCall });
  } catch (e) {
    const missing = (e as { missing?: string[] }).missing ?? [];
    const source = (e as { source?: string }).source ?? "env";
    throw new OpError("not_configured", `network '${adapter.reportAs}' is not configured: missing credential field(s) ${missing.join(", ")}. Provide them via ${source}, the toolkit config file, or the per-call credentials argument.`, {
      network: adapter.reportAs,
      operation: op,
      details: { missing },
    });
  }
}

function isoDaysAgo(n: number): string {
  return new Date(Date.now() - n * 86_400_000).toISOString().slice(0, 10);
}

// ------------------------------------------------------------- mutations

function assertMutateGate(op: string, args: Record<string, unknown>): { apply: boolean } {
  if (op === "activate") {
    if (args.confirmed !== true) {
      throw new OpError("validation", "activation requires explicit human confirmation: pass confirmed: true. The toolkit never enables a spending entity otherwise.", { operation: op, network: String(args.network) });
    }
    if (args.apply !== true) {
      throw new OpError("validation", "activation requires apply: true together with confirmed: true.", { operation: op, network: String(args.network) });
    }
    return { apply: true };
  }
  return { apply: args.apply === true };
}

function dryRunCreate(args: Record<string, unknown>) {
  const budget = budgetOf(args.budget);
  return {
    dry_run: true,
    message: "dry-run: no network request was made. Pass apply: true to create (as DRAFT/PAUSED — the schema cannot express an active entity).",
    would_create: {
      network: args.network,
      account_id: args.account_id,
      entity_level: "campaign",
      name: args.name,
      objective: args.objective ?? null,
      status: "draft",
      budget,
      targeting: args.targeting ?? null,
    },
  };
}

function localBudgetDiff(current: Budget, next: Budget) {
  const delta = toDec(sub(parseDec(next.amount), parseDec(current.amount)));
  return { field: "budget", before: current, after: next, delta, currency: next.currency };
}

function dryRunBudgetUpdate(args: Record<string, unknown>): Record<string, unknown> {
  const currentUnknown = args.current_budget;
  if (!currentUnknown) {
    throw new OpError(
      "validation",
      "dry-run requires current_budget (from list_campaigns/list_ad_groups) so the diff can be computed locally with NO network request.",
      { operation: "update_budget", network: String(args.network) },
    );
  }
  const diff = localBudgetDiff(budgetOf(currentUnknown), budgetOf(args.budget));
  return { dry_run: true, message: "dry-run: no network request was made.", ...diff };
}

function guardrailCheck(network: Network, budget: Budget, op: string): void {
  const check = checkDailyCap(network, budget.amount, budget.currency);
  if (!check.ok && check.violated) {
    const v = check.violated;
    throw new OpError(
      "guardrail",
      `rejected BEFORE any network request: requested ${budget.amount} ${budget.currency} exceeds the configured ${v.cap} of ${v.cap_amount} ${v.currency}. Caps are configuration, not code.`,
      { network, operation: op, details: { violated: v.cap, cap_amount: v.cap_amount, cap_currency: v.currency, requested: v.requested, requested_currency: v.currency } },
    );
  }
}

function journalMutation(op: string, args: Record<string, unknown>, after: Record<string, unknown>, patch?: Partial<JournalEntry>): void {
  journalAppend({
    network: args.network !== undefined ? String(args.network) : undefined,
    operation: op,
    entity_level: args.entity_level !== undefined ? String(args.entity_level) : undefined,
    entity_id: args.entity_id ?? args.ad_group_id ?? undefined,
    ...patch,
  } as JournalEntry);
  void after; // journal entry shape keeps field-level before/after in patch.diffs
}

// -------------------------------------------------------------- router

export interface CallResult {
  ok: boolean;
  result?: unknown;
  error?: Record<string, unknown>;
}

export interface RouterOptions {
  registry?: Map<Network, Adapter>;
}

export async function call(opName: string, rawArgs: Record<string, unknown>, opts: RouterOptions = {}): Promise<CallResult> {
  try {
    const def = OPERATION_MAP.get(opName);
    if (!def) {
      throw new OpError("validation", `unknown operation '${opName}'`);
    }
    const args = rawArgs ?? {};
    const schemaErrors = validateArgs(def, args);
    if (schemaErrors.length > 0) {
      throw new OpError("validation", `invalid input: ${schemaErrors.join("; ")}`, { operation: opName });
    }

    // journal-only operations: no network, no adapter
    if (opName === "journal_append") {
      const entry = journalAppend({
        network: args.network !== undefined ? String(args.network) : undefined,
        operation: "manual",
        entity_level: args.entity_level !== undefined ? String(args.entity_level) : undefined,
        entity_id: args.entity_id !== undefined ? String(args.entity_id) : undefined,
        field: args.field !== undefined ? String(args.field) : undefined,
        before: args.before,
        after: args.after,
        label: String(args.label),
      });
      return { ok: true, result: { appended: true, entry } };
    }
    if (opName === "journal_list") {
      const limit = typeof args.limit === "number" ? args.limit : 50;
      return { ok: true, result: { entries: readLast(Math.max(1, Math.min(limit, 500))) } };
    }

    if (opName === "capability_report") {
      return { ok: true, result: capabilityReport(opts.registry ?? REGISTRY) };
    }

    // adapter-backed operations
    const network = requireNetwork(args);
    const reg = opts.registry ?? REGISTRY;
    const adapter = reg.get(network);
    if (!adapter) {
      throw new OpError(
        "not_configured",
        `the '${network}' adapter is not loaded (misconfigured or removed); the remaining networks still serve normally`,
        { network, operation: opName },
      );
    }
    return await dispatch(adapter, def.name, args);
  } catch (e) {
    if (e instanceof OpError) {
      return { ok: false, error: JSON.parse(redact(JSON.stringify(envelopeOf(e)))) };
    }
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: { code: "error", message: msg } };
  }
}

async function dispatch(adapter: Adapter, op: string, args: Record<string, unknown>): Promise<CallResult> {
  // 1. capability matrix — declared, never inferred (unsupported is loud; never an empty success)
  const cap = adapter.matrix[op];
  if (!cap || cap.state === "unsupported") {
    throw new OpError("unsupported", `operation '${op}' is not supported by network '${adapter.reportAs}'${cap?.reason ? `: ${cap.reason}` : ""}.`, {
      network: adapter.reportAs,
      operation: op,
    });
  }
  if (cap.state === "not_implemented") {
    throw new OpError("not_implemented", `operation '${op}' is supported by network '${adapter.reportAs}' but the adapter does not implement it yet${cap.reason ? `: ${cap.reason}` : ""}.`, {
      network: adapter.reportAs,
      operation: op,
    });
  }
  const method = (adapter as unknown as Record<string, unknown>)[op];
  if (typeof method !== "function") {
    throw new OpError("not_implemented", `operation '${op}' declared supported by '${adapter.reportAs}' but no adapter method exists — this is a toolkit bug.`, {
      network: adapter.reportAs,
      operation: op,
    });
  }

  // 2. credentials + ctx
  const creds = requiredCreds(adapter, op, args.credentials as Record<string, string> | undefined);

  // 3. mutation gating + guardrails BEFORE the adapter (before any outbound request)
  let mutating = false;
  if (["create_campaign", "update_budget", "activate", "pause", "create_creatives"].includes(op)) {
    const gate = assertMutateGate(op, args);
    if (!gate.apply) {
      // dry-run: diff only, NO network request, NO mutation
      if (op === "create_campaign") return { ok: true, result: dryRunCreate(args) };
      if (op === "update_budget") return { ok: true, result: dryRunBudgetUpdate(args) };
      return {
        ok: true,
        result: {
          dry_run: true,
          message: "dry-run: no network request was made. Pass apply: true to perform.",
          operation: op,
          entity_id: args.entity_id ?? args.ad_group_id,
        },
      };
    }
    if (op === "create_campaign" || op === "update_budget") {
      const budget =
        args.budget !== undefined
          ? budgetOf(args.budget)
          : args.current_budget !== undefined
            ? budgetOf(args.current_budget)
            : undefined;
      if (budget) guardrailCheck(adapter.network, budget, op);
    }
    mutating = true;
  }

  // 4. adapter call
  const ctx = opContext(adapter.network, args, creds);
  const impl = method as (c: Ctx, ...rest: unknown[]) => Promise<unknown>;
  let result: unknown;
  let journalPatch: Partial<JournalEntry> = {};
  switch (op) {
    case "list_accounts":
      result = { accounts: await adapter.listAccounts(ctx) };
      break;
    case "list_campaigns":
      result = await adapter.listCampaigns(ctx);
      break;
    case "list_ad_groups":
      result = { ad_groups: await adapter.listAdGroups(ctx) };
      break;
    case "list_ads":
      result = { ads: await adapter.listAds(ctx) };
      break;
    case "list_audiences":
      result = { audiences: await adapter.listAudiences(ctx) };
      break;
    case "get_targeting_estimate":
      result = await adapter.estimate(ctx);
      break;
    case "get_insights": {
      parsePeriod(String(args.date_from), String(args.date_to));
      result = { rows: await adapter.getInsights(ctx) };
      break;
    }
    case "create_campaign": {
      const campaign = await adapter.createCampaign(ctx);
      if (campaign.status !== "draft" && campaign.status !== "paused") {
        throw new OpError("error", "adapter returned a non-draft/non-paused entity — drafts-first violated; aborting (no journal entry).", {
          network: adapter.reportAs,
          operation: op,
        });
      }
      result = { campaign };
      journalPatch = {
        entity_level: "campaign",
        entity_id: campaign.campaign_id,
        field: "campaign",
        before: null,
        after: stripCredentialFields(campaign) as Record<string, unknown>,
      };
      break;
    }
    case "update_budget": {
      const res = (await impl(ctx)) as { before?: Budget | null; after: Budget };
      const useBefore =
        res.before ??
        (args.current_budget !== undefined ? budgetOf(args.current_budget) : null);
      result = { entity_level: String(args.entity_level) as EntityLevel, entity_id: String(args.entity_id), ...(useBefore ? localBudgetDiff(useBefore, res.after) : { after: res.after }) };
      journalPatch = {
        entity_level: String(args.entity_level),
        entity_id: String(args.entity_id),
        field: "budget",
        before: useBefore ? stripCredentialFields(useBefore) : null,
        after: stripCredentialFields(res.after) as Record<string, unknown>,
      };
      break;
    }
    case "activate":
    case "pause": {
      const level = String(args.entity_level) as EntityLevel;
      const res = (await impl(ctx, level, op === "activate")) as { status: string };
      result = { entity_level: String(args.entity_level), entity_id: String(args.entity_id), status: res.status };
      journalPatch = {
        entity_level: String(args.entity_level),
        entity_id: String(args.entity_id),
        field: "status",
        before: op === "activate" ? "not spending" : "running",
        after: res.status,
      };
      break;
    }
    case "create_creatives": {
      const ads = await adapter.createCreatives(ctx);
      for (const a of ads) {
        if (a.status !== "draft" && a.status !== "paused") {
          throw new OpError("error", "a returned creative is not draft/paused — drafts-first violated.", {
            network: adapter.reportAs,
            operation: op,
          });
        }
      }
      result = { ads, created: ads.map((a) => a.ad_id) };
      journalPatch = {
        entity_level: "ad",
        entity_id: (ads[0]?.ad_id ?? String(args.ad_group_id)) as string,
        field: "creatives",
        before: null,
        after: { created: (result as { created: string[] }).created } as Record<string, unknown>,
      };
      break;
    }
    case "submit_report": {
      parsePeriod(String(args.date_from), String(args.date_to));
      const res = (await impl(ctx)) as { server_task: string };
      const taskId = newTaskId(adapter.network);
      saveTask({
        task_id: taskId,
        network: adapter.network,
        account_id: String(args.account_id),
        entity_level: String(args.entity_level),
        entity_id: args.entity_id !== undefined ? String(args.entity_id) : undefined,
        date_from: String(args.date_from),
        date_to: String(args.date_to),
        server_task: res.server_task,
        submitted_at: new Date().toISOString(),
        state: "pending",
      });
      result = { task_id: taskId, state: "pending" };
      break;
    }
    case "poll_report": {
      const stored = getTask(String(args.task_id));
      if (!stored || stored.network !== adapter.network) {
        throw new OpError("validation", `unknown task '${String(args.task_id)}' for network '${adapter.reportAs}'`, { operation: op, network: adapter.reportAs });
      }
      ctx.args.external_task = stored.server_task;
      const res = (await impl(ctx)) as { state: "pending" | "ready" | "error" };
      updateTaskState(stored.task_id, res.state);
      result = { task_id: stored.task_id, state: res.state };
      break;
    }
    case "fetch_report": {
      const stored = getTask(String(args.task_id));
      if (!stored || stored.network !== adapter.network) {
        throw new OpError("validation", `unknown task '${String(args.task_id)}' for network '${adapter.reportAs}'`, { operation: op, network: adapter.reportAs });
      }
      if (stored.state !== "ready") {
        // refuse to present partial rows as complete
        throw new OpError("network", `task '${stored.task_id}' is not ready (state: ${stored.state}); poll again before fetching.`, { operation: op, network: adapter.reportAs });
      }
      ctx.args.external_task = stored.server_task;
      const rows = (await impl(ctx)) as unknown[];
      result = { task_id: stored.task_id, rows };
      break;
    }
    case "pacing_review": {
      result = { rows: await pacingReview(adapter, ctx, Number(args.period_days), adapter.reportAs) };
      break;
    }
    case "lift_readout": {
      result = await liftReadout(adapter, ctx, Number(args.window_days), adapter.reportAs);
      break;
    }
    default: {
      result = await impl(ctx);
    }
  }

  // 5. journal at the chokepoint (only real mutations)
  if (mutating) {
    journalMutation(op, args, {}, journalPatch);
  }

  // 6. redaction over everything leaving the router
  return { ok: true, result: stripCredentialFields(JSON.parse(redact(JSON.stringify(result)))) };
}

// ------------------------------------------------------------ capability report

function capabilityReport(reg: Map<Network, Adapter>): Record<string, unknown> {
  const networks: Record<string, unknown> = {};
  for (const [net, adapter] of reg) {
    const id = net === "google" ? "google" : net === adapter.network ? adapter.network : net;
    if (net === "youtube" && adapter.network === net) id;
    let st;
    try {
      st = adapter.status();
    } catch (e) {
      st = { state: "error", error: e instanceof Error ? e.message : String(e) };
    }
    networks[net === adapter.network ? net : `${net} (served by ${adapter.network})`] = {
      state: st,
      // expose google adapter's declared matrix for both google and youtube
      network: net,
    };
  }
  return { networks, note: "state is credential presence, never a network call" };
}

export { journalAppend as _journalAppend, parsePeriod as _parsePeriod };
