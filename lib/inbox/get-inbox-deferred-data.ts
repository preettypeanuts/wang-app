import { listPlans } from "@/lib/db/plans";
import { listPlannedItems } from "@/lib/db/planned-items";
import { listActiveSavingsGoals } from "@/lib/db/savings-goals";
import { getDailySummaryForDay } from "@/lib/db/daily-summary";
import { getYesterday } from "@/lib/finance/day-range";
import { listActivePlanChatItems } from "@/lib/plans/active-plan-chat";
import { listUnpaidPayPlanChatItems } from "@/lib/planner/unpaid-payplan-chat";
import { listActiveSavingsChatItems } from "@/lib/savings/active-savings-chat";
import type {
  ActivePlanChatItem,
  ActiveSavingsChatItem,
  UnpaidPayPlanChatItem,
} from "@/types/chat";
import type { DailySummarySnapshot } from "@/types/summary";

export interface InboxSlashContext {
  unpaidPayPlanItems: UnpaidPayPlanChatItem[];
  activePlanItems: ActivePlanChatItem[];
  activeSavingsItems: ActiveSavingsChatItem[];
}

export interface InboxDeferredData {
  dailySummary: DailySummarySnapshot | null;
  slash: InboxSlashContext;
}

export async function getInboxSlashContext(
  userId: string,
): Promise<InboxSlashContext> {
  const [plannedItems, plans, savingsGoals] = await Promise.all([
    listPlannedItems(userId),
    listPlans(userId),
    listActiveSavingsGoals(userId),
  ]);

  return {
    unpaidPayPlanItems: listUnpaidPayPlanChatItems(plannedItems),
    activePlanItems: listActivePlanChatItems(plans),
    activeSavingsItems: listActiveSavingsChatItems(savingsGoals),
  };
}

export async function getInboxDeferredData(
  userId: string,
): Promise<InboxDeferredData> {
  const [dailySummary, slash] = await Promise.all([
    getDailySummaryForDay(userId, getYesterday()),
    getInboxSlashContext(userId),
  ]);

  return { dailySummary, slash };
}
