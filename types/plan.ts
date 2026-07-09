export type PlanStatus = "active" | "done";

export interface PlanRecord {
  id: string;
  name: string;
  amount: number;
  category: string;
  status: PlanStatus;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PlanFormInput {
  name: string;
  amount: number;
  category: string;
  status: PlanStatus;
  note?: string;
}

/** Tone derived from spend vs balance — drives AI summary styling. */
export type PlansInsightTone = "empty" | "safe" | "tight" | "unsafe";

export interface PlansInsightMeta {
  tone: PlansInsightTone;
  label: string;
}

export interface PlansOverview {
  activeCount: number;
  estimatedCost: number;
  availableBalance: number;
  upcomingPayPlanTotal: number;
  upcomingPayPlanCount: number;
  projectedBalance: number;
  budgetImpacts: PlanBudgetImpact[];
  insight: string;
  insightMeta: PlansInsightMeta;
}

export type PlanBudgetImpactStatus = "aman" | "waspada" | "over";

export interface PlanBudgetImpact {
  category: string;
  categoryLabel: string;
  budgetLimit: number;
  currentSpent: number;
  projectedSpent: number;
  status: PlanBudgetImpactStatus;
}

/** Inputs for streamed plans AI insight — rendered separately from page shell. */
export interface PlansInsightInputs {
  userId: string;
  plans: PlanRecord[];
  availableBalance: number;
  upcomingPayPlanTotal: number;
  upcomingPayPlanCount: number;
  budgetImpacts: PlanBudgetImpact[];
}

export interface PlansUpcomingImpactItem {
  id: string;
  name: string;
  amount: number;
  dueAt: string;
  dueLabel: string;
  daysUntil: number;
  daysUntilLabel: string;
}
