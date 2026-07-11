/** English labels for PayPlan page and planner tab views. */

import {
  formatDaysUntilLabel,
  UI_LABEL_ADD,
  UI_LABEL_APPLY,
  UI_LABEL_CANCEL,
  UI_LABEL_CATEGORY,
  UI_LABEL_EXPENSE,
  UI_LABEL_FILTER,
  UI_LABEL_INCOME,
  UI_LABEL_OPEN_FILTER,
  UI_LABEL_RESET,
  UI_LABEL_SAVE,
  UI_LABEL_SELECT_CATEGORY,
  UI_LABEL_TODAY,
  UI_LABEL_TOTAL,
  UI_LABEL_TYPE,
} from "@/config/ui-labels";
import { formatDayMonth } from "@/lib/finance/format-datetime";

export {
  UI_LABEL_ADD,
  UI_LABEL_APPLY,
  UI_LABEL_CANCEL,
  UI_LABEL_CATEGORY,
  UI_LABEL_FILTER,
  UI_LABEL_OPEN_FILTER,
  UI_LABEL_RESET,
  UI_LABEL_SAVE,
  UI_LABEL_SELECT_CATEGORY,
  UI_LABEL_TODAY,
  UI_LABEL_TOTAL,
};

export const PAYPLAN_PAGE_SUBTITLE_CALENDAR =
  "Bills, scheduled income, and budgets.";
export const PAYPLAN_PAGE_SUBTITLE_BUDGET =
  "Set category budgets — linked with Inbox.";

export const PAYPLAN_LABEL_CALENDAR = "Calendar";
export const PAYPLAN_LABEL_BUDGET = "Budget";
export const PAYPLAN_LABEL_MONTHLY_CALENDAR = "Monthly calendar";
export const PAYPLAN_LABEL_PREVIOUS_MONTH = "Previous month";
export const PAYPLAN_LABEL_NEXT_MONTH = "Next month";

export const PAYPLAN_LABEL_UNPAID = "Unpaid";
export const PAYPLAN_LABEL_PAID = "Paid";
export const PAYPLAN_LABEL_NO_BILLS = "No bills";
export const PAYPLAN_LABEL_NO_PAYMENTS_YET = "No payments yet";

export const PAYPLAN_LABEL_NO_MATCHING_SCHEDULE = "No matching schedules";
export const PAYPLAN_LABEL_NO_SCHEDULE_YET = "No schedules yet";
export const PAYPLAN_LABEL_FILTER_RESET_HINT =
  "Change or reset filters to see other schedules.";
export const PAYPLAN_LABEL_ADD_SCHEDULE_HINT =
  "Add bills, subscriptions, or installments to show on the calendar.";

export const PAYPLAN_LABEL_SEARCH_SCHEDULE = "Search schedules...";
export const PAYPLAN_LABEL_FILTER_SCHEDULE = "Filter schedules";
export const PAYPLAN_LABEL_FILTER_SCHEDULE_DESC =
  "Filter bills, subscriptions, and installments.";

export const PAYPLAN_LABEL_MANAGE_DESC =
  "Recurring bills, subscriptions, and installments on the calendar.";
export const PAYPLAN_LABEL_ADD_PAY_PLAN = "Add Pay Plan";
export const PAYPLAN_LABEL_ADD_BUDGET = "Add budget";
export const PAYPLAN_LABEL_CREATE_FIRST_BUDGET = "Create first budget";

export const PAYPLAN_LABEL_SAVING = "Saving...";
export const PAYPLAN_LABEL_DELETE = "Delete";
export const PAYPLAN_LABEL_EDIT = "Edit";
export const PAYPLAN_LABEL_MARK_PAID = "Mark as paid";
export const PAYPLAN_LABEL_ALREADY_PAID = "Already paid";

export const PAYPLAN_LABEL_SELECTED_SCHEDULE = "Selected schedule";
export const PAYPLAN_LABEL_SCHEDULES = "Schedules";
export const PAYPLAN_LABEL_OUTFLOW = "out";
export const PAYPLAN_LABEL_INFLOW = "in";
export const PAYPLAN_LABEL_CLOSE = "Close";
export const PAYPLAN_LABEL_END = "End";
export const PAYPLAN_LABEL_REMAINING_BUDGET = "Remaining budget";
export const PAYPLAN_LABEL_USED = "Used";
export const PAYPLAN_LABEL_LIMIT = "limit";
export const PAYPLAN_LABEL_LIMIT_MODE = "Limit mode";
export const PAYPLAN_LABEL_END_MODE_ARIA = "End mode";
export const PAYPLAN_LABEL_PAYOFF_DATE_MODE_ARIA = "Payoff date mode";
export const PAYPLAN_LABEL_FOREVER = "Forever";
export const PAYPLAN_LABEL_LIMITED = "Limited";
export const PAYPLAN_LABEL_DATE = "Date";
export const PAYPLAN_LABEL_ENDS = "Ends";
export const PAYPLAN_LABEL_MANUAL_DATE = "Manual date";
export const PAYPLAN_LABEL_ESTIMATED_PAYOFF = "Estimated payoff";
export const PAYPLAN_LABEL_PAYOFF_DATE = "Payoff date";
export const PAYPLAN_LABEL_REMAINING = "remaining";
export const PAYPLAN_LABEL_COMPLETED = "completed";

export const PAYPLAN_LABEL_NO_BILLS_ON_DATE = "No bills on this date.";
export const PAYPLAN_LABEL_NO_SCHEDULED_ON_DATE =
  "No scheduled transactions on this date.";
export const PAYPLAN_LABEL_DAY_PASSED_HINT =
  "This day has passed — pick another date with schedules.";

export const PAYPLAN_LABEL_DETAIL_DESC =
  "PayPlan schedule details and payment status.";
export const PAYPLAN_LABEL_PAY_PER_PERIOD = "Pay per period";
export const PAYPLAN_LABEL_AMOUNT = "Amount";
export const PAYPLAN_LABEL_START = "Start";
export const PAYPLAN_LABEL_NOTE = "Note";
export const PAYPLAN_LABEL_INSTALLMENT_SCHEDULE = "Installment schedule";
export const PAYPLAN_LABEL_STATUS_PAID = "Paid";
export const PAYPLAN_LABEL_STATUS_UNPAID = "Unpaid";
export const PAYPLAN_LABEL_REPEAT_FOREVER = "Repeats forever";

export const PAYPLAN_LABEL_EDIT_PAY_PLAN = "Edit Pay Plan";
export const PAYPLAN_LABEL_NEW_PAY_PLAN = "New Pay Plan";
export const PAYPLAN_LABEL_PAY_PLAN_FORM_DESC =
  "Bills, subscriptions, or installments on the PayPlan calendar.";
export const PAYPLAN_LABEL_TOTAL_INSTALLMENT = "Total installment";
export const PAYPLAN_LABEL_NAME = "Name";
export const PAYPLAN_LABEL_KIND = "Kind";
export const PAYPLAN_LABEL_REPEAT = "Repeat";
export const PAYPLAN_LABEL_TOTAL_LOAN = "Total loan";
export const PAYPLAN_LABEL_INSTALLMENT_PER_MONTH = "Installment / month";
export const PAYPLAN_LABEL_START_PAYING = "Start paying";
export const PAYPLAN_LABEL_INSTALLMENT_COUNT = "Installment count";
export const PAYPLAN_LABEL_AUTO_PAID_OFF = "Auto paid off";
export const PAYPLAN_LABEL_FILL_TOTAL_INSTALLMENT =
  "Enter total & installment per month";
export const PAYPLAN_LABEL_OCCURRENCE_COUNT = "Occurrence count";

export const PAYPLAN_LABEL_EDIT_BUDGET = "Edit budget";
export const PAYPLAN_LABEL_NEW_BUDGET = "New budget";
export const PAYPLAN_LABEL_BUDGET_FORM_DESC =
  "Manual expenses you record in Inbox (e.g. warteg meal 15K) automatically reduce the matching category budget.";
export const PAYPLAN_LABEL_MONTHLY_LIMIT = "Monthly limit";
export const PAYPLAN_LABEL_PER_DAY = "Per day";
export const PAYPLAN_LABEL_MANUAL_TOTAL = "Manual total";
export const PAYPLAN_LABEL_DAY_COUNT = "Day count";
export const PAYPLAN_LABEL_NOTE_OPTIONAL = "Optional note";
export const PAYPLAN_LABEL_REPEAT_NEXT_MONTH = "Repeat next month";
export const PAYPLAN_LABEL_EMPTY_DAY_COUNT_HINT =
  "Leave day count empty to use days in this month";
export const PAYPLAN_LABEL_NO_CATEGORY_BUDGET = "No category budgets yet";
export const PAYPLAN_LABEL_BUDGET_EMPTY_HINT =
  "Example: Food 50K/day × 30 days = Rp 1,500,000. Only manual Inbox expenses reduce remaining budget.";

export const PAYPLAN_FILTER_LABEL_KIND = "Kind";
export const PAYPLAN_FILTER_LABEL_REPEAT = "Repeat";
export const PAYPLAN_FILTER_LABEL_FLOW = "Flow";
export const PAYPLAN_FILTER_LABEL_END = "End";
export const PAYPLAN_FILTER_LABEL_PAYMENT_STATUS = "Payment status";

export const PAYPLAN_LABEL_NEW_INSTALLMENT_FROM_START =
  "New installment from start date";
export const PAYPLAN_LABEL_NEW_INSTALLMENT_HINT =
  "Check if the installment is new. Uncheck if it was already running before tracking in the app.";
export const PAYPLAN_LABEL_ALREADY_PAID_COUNT = "Already paid (times)";
export const PAYPLAN_LABEL_ALREADY_PAID_BEFORE_HINT =
  "e.g. started in February, now June — enter how many times were paid before tracking in the app.";

export function formatPayPlanBillCount(count: number): string {
  return count === 1 ? "1 bill" : `${count} bills`;
}

export function formatPayPlanPaidCount(count: number, total: number): string {
  return `${count}/${total} paid`;
}

export function formatPayPlanDeleteConfirm(name: string): string {
  return `Remove "${name}" from PayPlan?`;
}

export function formatPayPlanDeleteBudgetConfirm(
  categoryLabel: string,
): string {
  return `Delete ${categoryLabel} budget for this month?`;
}

export function formatPayPlanOptionsLabel(name: string): string {
  return `Options for ${name}`;
}

export function formatBudgetOptionsLabel(categoryLabel: string): string {
  return `Options for ${categoryLabel} budget`;
}

export function formatPayPlanViewDetail(name: string): string {
  return `View detail ${name}`;
}

export function formatBudgetDailyLimit(
  amountLabel: string,
  dayCount: number,
): string {
  return `${amountLabel}/day · ${dayCount} days`;
}

export function formatBudgetDailyPreview(
  amountLabel: string,
  dayCount: string,
): string {
  return `${amountLabel}/day × ${dayCount} days`;
}

export function formatBudgetEmptyDayCountHint(dayCount: string): string {
  return `Leave day count empty to use days in this month (${dayCount} days).`;
}

export function formatBudgetRepeatNextMonthHint(
  nextMonthLabel: string,
): string {
  return `This budget is automatically recreated in ${nextMonthLabel} with the same settings.`;
}

export const PAYPLAN_LABEL_BUDGET_DETAIL_DESC =
  "Budget usage, daily pacing, and remaining allowance for this month.";
export const PAYPLAN_LABEL_REMAINING_DAYS = "Remaining days";
export const PAYPLAN_LABEL_ELAPSED_DAYS = "Days elapsed";
export const PAYPLAN_LABEL_AVG_DAILY_SPENT = "Avg. daily spent";
export const PAYPLAN_LABEL_PLANNED_DAILY = "Planned daily";
export const PAYPLAN_LABEL_ADJUSTED_DAILY = "Adjusted daily budget";
export const PAYPLAN_LABEL_DAILY_PACE = "Daily pace";
export const PAYPLAN_LABEL_BUDGET_PACING = "Pacing";
export const PAYPLAN_LABEL_BUDGET_PERIOD = "Period";
export const PAYPLAN_LABEL_BUDGET_PACE_FAST = "Spending faster than plan";
export const PAYPLAN_LABEL_BUDGET_PACE_ON_TRACK = "On track";
export const PAYPLAN_LABEL_BUDGET_PACE_SLOW = "Spending slower than plan";
export const PAYPLAN_LABEL_BUDGET_PACE_OVER = "Over monthly limit";
export const PAYPLAN_LABEL_BUDGET_PACE_UNSET = "Pacing unavailable";

export function formatBudgetRemainingDays(count: number): string {
  return count === 1 ? "1 day left" : `${count} days left`;
}

export function formatBudgetElapsedDays(count: number): string {
  return count === 1 ? "1 day elapsed" : `${count} days elapsed`;
}

export function formatBudgetDailyAmount(amountLabel: string): string {
  return `${amountLabel}/day`;
}

export function formatBudgetAdjustedDailyHint(
  adjustedLabel: string,
  remainingDays: number,
  plannedLabel: string,
): string {
  return `${adjustedLabel}/day for ${remainingDays} days left · planned ${plannedLabel}/day`;
}

export function formatBudgetAvgDailyHint(
  avgLabel: string,
  elapsedDays: number,
): string {
  return `${avgLabel}/day over ${elapsedDays} days`;
}

export function formatBudgetDailyDelta(
  deltaLabel: string,
  direction: "below" | "above",
): string {
  return `${deltaLabel}/day ${direction} plan`;
}

export function formatBudgetViewDetail(categoryLabel: string): string {
  return `View ${categoryLabel} budget detail`;
}

export function formatPayPlanInstallmentEntry(index: number): string {
  return `Installment ${index + 1}`;
}

export function formatPayPlanCompletedProgress(
  completed: number,
  total: number,
): string {
  return `${completed}/${total} completed`;
}

export function formatPayPlanPriorPaymentSummary(
  paidCount: number | string,
  maxInstallments: number,
  remaining?: number,
): string {
  const base = `${paidCount} / ${maxInstallments} paid`;
  if (remaining === undefined) {
    return base;
  }

  return `${base} · ${remaining} remaining`;
}

export function formatPayPlanDueInDays(daysUntil: number): string {
  if (daysUntil > 0) {
    return `Due in ${daysUntil} days`;
  }

  if (daysUntil === 0) {
    return "Due today";
  }

  return `Due ${Math.abs(daysUntil)} days ago`;
}

export function formatPayPlanDueInDaysLower(daysUntil: number): string {
  if (daysUntil > 0) {
    return `due in ${daysUntil} days`;
  }

  if (daysUntil === 0) {
    return "due today";
  }

  return `due ${Math.abs(daysUntil)} days ago`;
}

export function formatPayPlanPaidOn(date: Date | string): string {
  return `Paid on ${formatDayMonth(date)}`;
}

export function formatPayPlanPaidOnWithNext(
  date: Date | string,
  daysUntil: number,
): string {
  return `Paid on ${formatDayMonth(date)}, next installment ${formatDaysUntilLabel(daysUntil)}`;
}

export function formatPayPlanPaidOnWithDue(
  date: Date | string,
  dueLabel: string,
): string {
  return `Paid on ${formatDayMonth(date)}, ${dueLabel}`;
}

export function formatPayPlanInstallmentPaid(number: number): string {
  return `Paid installment #${number}`;
}

export function formatPayPlanAlreadyPaidCount(count: number): string {
  return `${count} paid`;
}

export function formatPayPlanPaidFraction(paid: number, total: number): string {
  return `${paid}/${total} paid`;
}

export const PAYPLAN_FILTER_ALL_STATUS = "All statuses";
export const PAYPLAN_FILTER_UNPAID = "Unpaid";
export const PAYPLAN_FILTER_PAID = "Paid";
export const PAYPLAN_FILTER_ALL_FLOWS = "All flows";
export const PAYPLAN_FILTER_ALL_ENDS = "All end types";
export const PAYPLAN_FILTER_NO_END = "No end (∞)";
export const PAYPLAN_FILTER_INSTALLMENTS = "Installments (12x)";
export const PAYPLAN_FILTER_END_DATE = "End date";
export const PAYPLAN_FILTER_ALL_KINDS = "All kinds";
export const PAYPLAN_FILTER_ALL_REPEATS = "All repeats";
