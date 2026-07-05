import {
  getPlannedKindLabel,
  getPlannedRepeatLabel,
} from "@/config/planner-items";
import { formatDayMonth } from "@/lib/finance/format-datetime";
import { getInstallmentEndDate } from "@/lib/planner/installment-progress";
import type { PlannedItemRecord } from "@/types/planner";

const MONTH_ONLY_FORMAT = new Intl.DateTimeFormat("id-ID", {
  month: "short",
});

const MONTH_YEAR_FORMAT = new Intl.DateTimeFormat("id-ID", {
  month: "short",
  year: "numeric",
});

export function formatPlannedStartLabel(item: PlannedItemRecord): string {
  if (item.kind === "installment") {
    return MONTH_ONLY_FORMAT.format(item.startAt);
  }

  return formatDayMonth(item.startAt);
}

export function formatPlannedInstallmentCount(
  item: PlannedItemRecord,
): string | null {
  if (!item.installmentCount) {
    return null;
  }

  return `${item.installmentCount}x`;
}

export function formatPlannedInstallmentEndLabel(
  item: PlannedItemRecord,
): string | null {
  if (!item.installmentCount) {
    return null;
  }

  const endDate = getInstallmentEndDate(item);

  if (!endDate) {
    return null;
  }

  return MONTH_YEAR_FORMAT.format(endDate);
}

export function formatPlannedEndLabel(item: PlannedItemRecord): string {
  if (item.installmentCount) {
    return `${item.installmentCount}x`;
  }

  if (item.endAt) {
    return formatDayMonth(item.endAt);
  }

  return "∞";
}

export function formatPlannedItemKind(kind: PlannedItemRecord["kind"]): string {
  return getPlannedKindLabel(kind);
}

export function formatPlannedItemRepeat(
  repeat: PlannedItemRecord["repeat"],
): string {
  return getPlannedRepeatLabel(repeat);
}
