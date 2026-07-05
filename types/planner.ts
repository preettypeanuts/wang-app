export type PlannerTab = "calendar" | "cards" | "table";

export type PlannerManageLayout = "cards" | "table";

export function isPayPlanManageTab(tab: PlannerTab): tab is "cards" | "table" {
  return tab === "cards" || tab === "table";
}

export function plannerTabToLayout(tab: PlannerTab): PlannerManageLayout {
  return tab === "table" ? "table" : "cards";
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
  endAt?: string;
  note?: string;
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
