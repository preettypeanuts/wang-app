/** English labels for Wish and Savings tab views. */

import { formatIdr } from "@/lib/finance/format-currency";
import {
  UI_LABEL_ADD,
  UI_LABEL_CANCEL,
  UI_LABEL_CATEGORY,
  UI_LABEL_DELETE,
  UI_LABEL_EDIT,
  UI_LABEL_ESTIMATE,
  UI_LABEL_NOTE,
  UI_LABEL_SAVE,
  UI_LABEL_CLOSE,
  UI_LABEL_TOTAL_SAVED,
} from "@/config/ui-labels";

export {
  UI_LABEL_ADD,
  UI_LABEL_CANCEL,
  UI_LABEL_CATEGORY,
  UI_LABEL_CLOSE,
  UI_LABEL_DELETE,
  UI_LABEL_EDIT,
  UI_LABEL_ESTIMATE,
  UI_LABEL_NOTE,
  UI_LABEL_SAVE,
};

export const PLANS_WISH_SECTION_DESC =
  "Shopping wishlist and cost estimates.";
export const PLANS_WISH_EMPTY_TITLE = "No wishes yet";
export const PLANS_WISH_EMPTY_DESC =
  "Add wishlist items to estimate remaining balance.";
export const PLANS_WISH_NEW = "New wish";
export const PLANS_LABEL_ADD_WISH = "Add wish";
export const PLANS_LOADING_WISHLIST = "Loading wishlist";
export const PLANS_LOADING_AI_SUMMARY = "Loading AI summary";

export const PLANS_WISH_NEW_TITLE = "New wish";
export const PLANS_WISH_EDIT_TITLE = "Edit wish";
export const PLANS_WISH_DETAIL_FALLBACK = "Wish details";
export const PLANS_WISH_FORM_DESC =
  "Shopping wishlist to estimate remaining balance.";
export const PLANS_WISH_VIEW_DESC = "Wish details and management options.";
export const PLANS_WISH_NAME_PLACEHOLDER = "e.g. iPhone 16";
export const PLANS_WISH_PRICE_ESTIMATE = "Estimated price";
export const PLANS_LABEL_NAME = "Name";
export const PLANS_LABEL_NOTE_OPTIONAL = "Optional";

export const PLAN_STATUS_ACTIVE = "Active";
export const PLAN_STATUS_DONE = "Done";

export const PLANS_NO_NOTE = "No note";

export const PLANS_MARK_PURCHASED_BUTTON = "Mark as purchased";
export const PLANS_PURCHASED_TITLE = "Purchased";

export function formatPlansMarkPurchasedDesc(amount: number): string {
  return `Marking as purchased will record an expense of ${formatIdr(amount)} to Journal and reduce balance.`;
}

export function formatPlansPurchasedDesc(amount: number): string {
  return `Expense of ${formatIdr(amount)} reduced balance and was recorded in Journal.`;
}

export const PLANS_RELATED_UPCOMING_DESC =
  "Unpaid PayPlan bills and estimated due dates.";

export const PLANS_AI_METRIC_BALANCE_PREFIX = "balance";
export const PLANS_AI_PAYPLAN_THIS_MONTH = "PayPlan bills this month";
export const PLANS_AI_REMAINING_BUDGET_THIS_MONTH =
  "Remaining PayPlan budget this month";
export const PLANS_AI_SHOW_DETAILS = "Lihat rincian";
export const PLANS_AI_HIDE_DETAILS = "Sembunyikan rincian";
export const PLANS_AI_PROJECTED_REMAINING = "Remaining after obligations";
export const PLANS_AI_UPCOMING_INCOME_THIS_MONTH =
  "Scheduled income this month (not received)";
export const PLANS_AI_SALARY_CYCLE_PROJECTION =
  "After salary, reserved for next month";
export const PLANS_AI_BUDGET_IMPACT = "Budget impact";
export const PLANS_AI_BUDGET_OVER_BY = "over by";
export const PLANS_AI_BUDGET_REMAINING = "left";

export const SAVINGS_SECTION_DESC =
  "Allocate free balance to savings targets.";
export const SAVINGS_EMPTY_TITLE = "No savings yet";
export const SAVINGS_EMPTY_DESC =
  "Create a savings target or type in inbox: create vacation savings 5jt";
export const SAVINGS_NEW = "New savings";
export const PLANS_LABEL_ADD_SAVINGS = "Add savings";

export const SAVINGS_NEW_TITLE = "New savings";
export const SAVINGS_EDIT_TITLE = "Edit savings";
export const SAVINGS_DETAIL_FALLBACK = "Savings details";
export const SAVINGS_FORM_DESC =
  "Savings target to allocate free balance.";
export const SAVINGS_VIEW_DESC =
  "Savings details — deposit or withdraw funds.";
export const SAVINGS_NAME_PLACEHOLDER = "e.g. Vacation";
export const SAVINGS_LABEL_TARGET = "Target";
export const SAVINGS_LABEL_STATUS = "Status";
export const SAVINGS_LABEL_DEPOSIT = "Deposit";
export const SAVINGS_LABEL_WITHDRAW = "Withdraw";

export const SAVINGS_STATUS_ACTIVE = "Active";
export const SAVINGS_STATUS_COMPLETED = "Completed";
export const SAVINGS_STATUS_PAUSED = "Paused";

export function formatSavingsProgressPercent(progress: number): string {
  return `${progress}% reached`;
}

export function formatSavingsFromTarget(amount: number): string {
  return `of ${formatIdr(amount)}`;
}

export const BUDGET_STATUS_ALMOST_DEPLETED = "Almost depleted";
export const BUDGET_STATUS_SAFE = "Safe";
export const BUDGET_STATUS_CAUTION = "Caution";
