import type { PlansOverview, PlansUpcomingImpactItem } from "@/types/plan";
import type { SavingsOverview } from "@/types/savings-goal";
import type { TodaySummary } from "@/types/summary";

export type OverviewAlertTone = "warning" | "danger" | "info";

export type OverviewAlertSegment =
  | { kind: "text"; value: string }
  | { kind: "amount"; value: number };

export interface OverviewAlert {
  id: string;
  tone: OverviewAlertTone;
  title: string;
  segments: OverviewAlertSegment[];
}

export interface OverviewGreeting {
  title: string;
  subtitle: string;
}

export interface OverviewAiBrief {
  text: string;
  conditionLabel: string;
}

export interface OverviewMonthlySnapshot {
  monthLabel: string;
  totalIncome: number;
  totalExpense: number;
  netFlow: number;
  transactionCount: number;
  isCustomPeriod?: boolean;
}

import type { FlowTransactionType, TransactionType } from "@/types/transaction";

export interface OverviewActivityItem {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  timeLabel: string;
  categoryLabel: string;
}

/** Per-wallet balance chip under the Balance Hero total. */
export interface OverviewWalletChip {
  id: string;
  name: string;
  balance: number;
}

export interface OverviewDayDeltas {
  incomeDelta: number;
  expenseDelta: number;
  balanceDelta: number;
}

export interface OverviewFilterContext {
  isDateRangeActive: boolean;
  periodLabel: string | null;
  incomeLabel: string;
  expenseLabel: string;
  balanceDeltaLabel: string;
  activityTitle: string;
  activitySubtitle: string | null;
  activityEmptyMessage: string;
}

export interface OverviewPageData {
  greeting: OverviewGreeting;
  balance: number;
  dayDeltas: OverviewDayDeltas;
  alerts: OverviewAlert[];
  upcoming: PlansUpcomingImpactItem[];
  plansOverview: PlansOverview;
  savingsOverview: SavingsOverview;
  monthlySnapshot: OverviewMonthlySnapshot;
  todaySummary: TodaySummary;
  todayActivity: OverviewActivityItem[];
  walletChips: OverviewWalletChip[];
  filterContext?: OverviewFilterContext;
}

/** Inputs for streamed AI brief — fetched with page data, rendered separately. */
export interface OverviewAiBriefInputs {
  userId: string;
  journalTransactions: {
    type: FlowTransactionType;
    amount: number;
    category: string;
    description: string;
  }[];
  availableBalance: number;
  todaySummary: TodaySummary;
  plansOverview: PlansOverview;
}

export interface OverviewPageResult {
  data: OverviewPageData;
  aiBriefInputs: OverviewAiBriefInputs;
}
