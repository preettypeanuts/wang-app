/** English labels for pages, stats, and UI chrome. Gemini copy stays in gemini-locale.ts. */

export const UI_LABEL_EXPENSE = "Expense";
export const UI_LABEL_INCOME = "Income";
export const UI_LABEL_BALANCE = "Balance";
export const UI_LABEL_CONDITION = "Condition";
export const UI_LABEL_GEMINI_ANALYTICS = "Gemini analytics";

export const UI_LABEL_HIDE = "Hide";
export const UI_LABEL_SHOW = "Show";
export const UI_LABEL_HIDE_BALANCE = "Hide balance";
export const UI_LABEL_SHOW_BALANCE = "Show balance";

export const UI_LABEL_VS_LAST_MONTH = "vs last month";
export const UI_LABEL_VS_PREVIOUS_PERIOD = "vs previous period";
export const UI_LABEL_VS_PREVIOUS_PERIOD_END = "vs previous period end";
export const UI_LABEL_VS_LAST_MONTH_END = "vs end of last month";

export const UI_LABEL_ADD = "Add";
export const UI_LABEL_TODAY = "Today";
export const UI_LABEL_SUMMARY = "Summary";
export const UI_LABEL_TODAY_SUMMARY = "Today's summary";
export const UI_LABEL_CATEGORIES = "Categories";
export const UI_LABEL_NO_SPENDING_TODAY = "No spending today yet.";

export const UI_LABEL_ACTIVE_WISHES = "Active wishes";
export const UI_LABEL_ACTIVE_SAVINGS = "Active savings";
export const UI_LABEL_TOTAL_SAVED = "Total saved";
export const UI_LABEL_FREE_BALANCE = "Free balance";

export const NOTIFICATIONS_PAGE_TITLE = "Notifications";
export const NOTIFICATIONS_PAGE_DESC =
  "Alerts, summaries, and financial reminders.";
export const NOTIFICATIONS_LOADING = "Loading notifications...";
export const NOTIFICATIONS_MARK_ALL_READ = "Mark all read";
export const NOTIFICATIONS_ALL_READ = "All caught up";

export function formatNotificationCount(total: number): string {
  return total === 1 ? "1 notification" : `${total} notifications`;
}

export function formatUnreadNotificationCount(unread: number): string {
  return unread === 1 ? "1 unread" : `${unread} unread`;
}

export const UI_LABEL_FILTER = "Filter";
export const UI_LABEL_SEARCH = "Search";
export const UI_LABEL_SEARCH_MESSAGES = "Search messages";
export const UI_LABEL_SEARCH_TRANSACTIONS = "Search transactions...";
export const UI_LABEL_SEARCH_INBOX_PLACEHOLDER = "Description, inbox message...";
export const UI_LABEL_OPEN_FILTER = "Open filter";
export const UI_LABEL_DATE_AND_MORE = "Date & more";
export const UI_LABEL_FILTER_JOURNAL_DESCRIPTION =
  "Filter transactions by date, type, and category.";
export const UI_LABEL_DATE_RANGE = "Date range";
export const UI_LABEL_TYPE = "Type";
export const UI_LABEL_CATEGORY = "Category";
export const UI_LABEL_WALLET = "Wallet";
export const UI_LABEL_ALL_WALLETS = "Semua wallet";
export const UI_LABEL_NOTE = "Note";
export const UI_LABEL_ALL_TYPES = "All types";
export const UI_LABEL_ALL_CATEGORIES = "All categories";
export const UI_LABEL_APPLY = "Apply";
export const UI_LABEL_RESET = "Reset";
export const UI_LABEL_CANCEL = "Cancel";
export const UI_LABEL_SAVE = "Save";
export const UI_LABEL_DELETE = "Delete";
export const UI_LABEL_EDIT = "Edit";
export const UI_LABEL_CLOSE = "Close";
export const UI_LABEL_SELECT_CATEGORY = "Select category";

export const UI_LABEL_ADD_TRANSACTION = "Add transaction";
export const UI_LABEL_ADD_TRANSACTION_DESC =
  "Record a manual transaction — including past dates.";
export const UI_LABEL_AMOUNT_IDR = "Amount (IDR)";
export const UI_LABEL_DATE = "Date";
export const UI_LABEL_DESCRIPTION_OPTIONAL = "Description (optional)";
export const UI_LABEL_DESCRIPTION_PLACEHOLDER = "Daily shopping, salary, etc.";
export const UI_LABEL_INBOX_MESSAGE = "Inbox message";
export const UI_LABEL_INBOX_MESSAGE_PLACEHOLDER = "Original inbox message";

export const UI_LABEL_LAST_7_DAYS = "Last 7 days";
export const UI_LABEL_LAST_30_DAYS = "Last 30 days";
export const UI_LABEL_THIS_MONTH = "This month";
export const UI_LABEL_DATE_FROM = "From";
export const UI_LABEL_DATE_UNTIL = "Until";

export const UI_LABEL_PREVIOUS = "Previous";
export const UI_LABEL_NEXT = "Next";
export const UI_LABEL_ENTRIES_ZERO = "0 entries";

export const UI_LABEL_EXPENSE_BY_CATEGORY = "Expense by category";
export const UI_LABEL_EXPENSE_BY_CATEGORY_DESC =
  "Share of filtered total expense.";
export const UI_LABEL_TOTAL = "Total";

export function formatJournalPaginationCount(
  start: number,
  end: number,
  total: number,
): string {
  return `Showing ${start}–${end} of ${total} entries`;
}

export function formatJournalPageLabel(page: number, totalPages: number): string {
  return `Page ${page} / ${totalPages}`;
}

export function formatTransactionCount(count: number): string {
  return count === 1 ? "1 transaction" : `${count} transactions`;
}

// Overview widgets
export const UI_LABEL_OVERVIEW_BALANCE = "Balance";
export const UI_LABEL_OVERVIEW_BALANCE_SUMMARY = "Balance summary";
export const UI_LABEL_OVERVIEW_IN_TODAY = "In today";
export const UI_LABEL_OVERVIEW_OUT_TODAY = "Out today";
export const UI_LABEL_OVERVIEW_VS_YESTERDAY = "vs yesterday";
export const UI_LABEL_OVERVIEW_INCOME = "Income";
export const UI_LABEL_OVERVIEW_EXPENSE = "Expense";
export const UI_LABEL_OVERVIEW_BALANCE_CUMULATIVE_FILTERED =
  "Cumulative balance through end of filtered period.";
export const UI_LABEL_OVERVIEW_BALANCE_CUMULATIVE_TODAY =
  "Cumulative balance from all transactions through today.";

export const UI_LABEL_OVERVIEW_ACTIVITY = "Activity";
export const UI_LABEL_OVERVIEW_ACTIVITY_TODAY = "Today's activity";
export const UI_LABEL_OVERVIEW_ACTIVITY_EMPTY_FILTERED =
  "No transactions match the filter.";
export const UI_LABEL_OVERVIEW_ACTIVITY_EMPTY_PERIOD =
  "No transactions in this period.";
export const UI_LABEL_OVERVIEW_ACTIVITY_EMPTY_TODAY =
  "No transactions today yet. Record via Inbox.";

export const UI_LABEL_OVERVIEW_UPCOMING_BILLS = "Upcoming bills";
export const UI_LABEL_OVERVIEW_UPCOMING_EMPTY =
  "No unpaid PayPlan bills in the next 60 days.";

export const UI_LABEL_OVERVIEW_SAVINGS_TARGET = "Savings targets";
export const UI_LABEL_OVERVIEW_ACTIVE_SAVINGS_COUNT = "active savings";

export const UI_LABEL_OVERVIEW_ACTIVE_WISHLIST = "Active wishlist";
export const UI_LABEL_OVERVIEW_ACTIVE_WISHES_COUNT = "active wishes";
export const UI_LABEL_ESTIMATE = "Estimate";
export const UI_LABEL_PROJECTED_REMAINING = "Projected remaining";

export const UI_LABEL_OVERVIEW_TRANSACTIONS = "Transactions";

export const UI_LABEL_OVERVIEW_ALERTS_ATTENTION = "Needs attention";
export const UI_LABEL_OVERVIEW_ALERTS_EMPTY =
  "No alerts right now. Everything looks good.";

export const UI_LABEL_PLANS_INSIGHT_EMPTY = "Empty";
export const UI_LABEL_PLANS_INSIGHT_SAFE = "Safe";
export const UI_LABEL_PLANS_INSIGHT_TIGHT = "Caution";
export const UI_LABEL_PLANS_INSIGHT_UNSAFE = "Risk";

export const UI_LABEL_OVERVIEW_ALERT_NEGATIVE_BALANCE = "Negative balance";
export const UI_LABEL_OVERVIEW_ALERT_PAYMENT_OVERDUE = "Payment overdue";
export const UI_LABEL_OVERVIEW_ALERT_DUE_TODAY = "Due today";
export const UI_LABEL_OVERVIEW_ALERT_WISHES_EXCEED_BALANCE =
  "Wishes exceed balance";
export const UI_LABEL_OVERVIEW_ALERT_THIN_WISH_BUFFER = "Thin wish buffer";

export const UI_GREETING_MORNING = "Good morning";
export const UI_GREETING_AFTERNOON = "Good afternoon";
export const UI_GREETING_EVENING = "Good evening";
export const UI_GREETING_NIGHT = "Good night";

export const UI_LABEL_PERIOD_FALLBACK = "period";

export function formatViewPageLink(title: string): string {
  return `View ${title} →`;
}

export function formatDaysUntilLabel(daysUntil: number): string {
  if (daysUntil > 0) {
    return `in ${daysUntil} days`;
  }

  if (daysUntil === 0) {
    return "today";
  }

  return `${Math.abs(daysUntil)} days ago`;
}
