import { PLANNED_ITEMS_DEFAULT_FILTERS } from "@/config/planner-manage-filters";
import type {
  PlannedEndMode,
  PlannedItemKind,
  PlannedItemsFilters,
  PlannedPaymentStatusFilter,
  PlannedRepeatInterval,
  PlannerTab,
} from "@/types/planner";

const VALID_KINDS = new Set<PlannedItemKind>([
  "bill",
  "subscription",
  "installment",
  "income",
]);

const VALID_REPEATS = new Set<PlannedRepeatInterval>([
  "monthly",
  "weekly",
  "yearly",
]);

const VALID_FLOWS = new Set<PlannedItemsFilters["flowType"]>([
  "all",
  "income",
  "expense",
]);

const VALID_END_MODES = new Set<PlannedEndMode | "all">([
  "all",
  "never",
  "installments",
  "date",
]);

const VALID_PAYMENT_STATUSES = new Set<PlannedPaymentStatusFilter>([
  "all",
  "unpaid",
  "paid",
]);

function readParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
): string {
  const value = searchParams[key];
  if (Array.isArray(value)) {
    return value[0]?.trim() ?? "";
  }

  return value?.trim() ?? "";
}

export function parsePlannedItemsFilters(
  searchParams: Record<string, string | string[] | undefined>,
): PlannedItemsFilters {
  const kindRaw = readParam(searchParams, "kind");
  const repeatRaw = readParam(searchParams, "repeat");
  const flowRaw = readParam(searchParams, "flow");
  const endRaw = readParam(searchParams, "end");
  const paymentRaw = readParam(searchParams, "payment");

  return {
    q: readParam(searchParams, "q"),
    kind:
      kindRaw && VALID_KINDS.has(kindRaw as PlannedItemKind)
        ? (kindRaw as PlannedItemKind)
        : PLANNED_ITEMS_DEFAULT_FILTERS.kind,
    repeat:
      repeatRaw && VALID_REPEATS.has(repeatRaw as PlannedRepeatInterval)
        ? (repeatRaw as PlannedRepeatInterval)
        : PLANNED_ITEMS_DEFAULT_FILTERS.repeat,
    flowType:
      flowRaw && VALID_FLOWS.has(flowRaw as PlannedItemsFilters["flowType"])
        ? (flowRaw as PlannedItemsFilters["flowType"])
        : PLANNED_ITEMS_DEFAULT_FILTERS.flowType,
    endMode:
      endRaw && VALID_END_MODES.has(endRaw as PlannedEndMode | "all")
        ? (endRaw as PlannedEndMode | "all")
        : PLANNED_ITEMS_DEFAULT_FILTERS.endMode,
    paymentStatus:
      paymentRaw &&
      VALID_PAYMENT_STATUSES.has(paymentRaw as PlannedPaymentStatusFilter)
        ? (paymentRaw as PlannedPaymentStatusFilter)
        : PLANNED_ITEMS_DEFAULT_FILTERS.paymentStatus,
  };
}

export function buildPlannedItemsManageParams(
  filters: PlannedItemsFilters,
  tab: Extract<PlannerTab, "cards" | "table">,
  baseParams: URLSearchParams,
): URLSearchParams {
  const params = new URLSearchParams(baseParams.toString());

  params.set("tab", tab);
  params.delete("layout");

  if (filters.q.trim()) {
    params.set("q", filters.q.trim());
  } else {
    params.delete("q");
  }

  if (filters.kind !== "all") {
    params.set("kind", filters.kind);
  } else {
    params.delete("kind");
  }

  if (filters.repeat !== "all") {
    params.set("repeat", filters.repeat);
  } else {
    params.delete("repeat");
  }

  if (filters.flowType !== "all") {
    params.set("flow", filters.flowType);
  } else {
    params.delete("flow");
  }

  if (filters.endMode !== "all") {
    params.set("end", filters.endMode);
  } else {
    params.delete("end");
  }

  if (filters.paymentStatus !== "all") {
    params.set("payment", filters.paymentStatus);
  } else {
    params.delete("payment");
  }

  return params;
}
