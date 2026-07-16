export type PlannerTab = "calendar" | "budget";

export type PlannerCalendarLayout = "month" | "cards" | "table";

export type PlannerManageLayout = Extract<
  PlannerCalendarLayout,
  "cards" | "table"
>;

export function isPlannerManageLayout(
  layout: PlannerCalendarLayout,
): layout is PlannerManageLayout {
  return layout === "cards" || layout === "table";
}

export type PlannedItemKind =
  | "bill"
  | "subscription"
  | "installment"
  | "income";

export type PlannedRepeatInterval = "monthly" | "weekly" | "yearly";

export type PlannedEndMode = "never" | "installments" | "date";

export interface PlannedItemRecord {
  id: string;
  name: string;
  kind: PlannedItemKind;
  repeat: PlannedRepeatInterval;
  amount: number;
  flowType: "income" | "expense";
  category: string;
  startAt: Date;
  endAt: Date | null;
  installmentCount: number | null;
  paidInstallmentCount: number;
  note: string | null;
  walletId: string | null;
}

export interface PlannedOccurrence {
  id: string;
  plannedItemId: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  title: string;
  dueAt: Date;
  note: string | null;
  kind: PlannedItemKind;
  installmentIndex: number | null;
  installmentCount: number | null;
  paidInstallmentCount: number;
}

export interface PlannerDayMark {
  dayKey: string;
  count: number;
  totalAmount: number;
}

export interface PlannerMonthData {
  monthKey: string;
  year: number;
  month: number;
  marks: PlannerDayMark[];
  items: PlannedOccurrence[];
}

export interface PlannedItemFormInput {
  name: string;
  kind: PlannedItemKind;
  repeat: PlannedRepeatInterval;
  amount: number;
  startAt: string;
  endMode: PlannedEndMode;
  installmentCount?: number;
  paidInstallmentCount?: number;
  endAt?: string;
  note?: string;
  /** Optional overrides (defaults come from kind). */
  category?: string;
  flowType?: "income" | "expense";
}

export type PlannedPaymentStatusFilter = "all" | "unpaid" | "paid";

export interface PlannedItemsFilters {
  q: string;
  kind: PlannedItemKind | "all";
  repeat: PlannedRepeatInterval | "all";
  flowType: "income" | "expense" | "all";
  endMode: PlannedEndMode | "all";
  paymentStatus: PlannedPaymentStatusFilter;
}
