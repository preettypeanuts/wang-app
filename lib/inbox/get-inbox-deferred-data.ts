import { listPlans } from "@/lib/db/plans";
import { listPlannedItems } from "@/lib/db/planned-items";
import { listActiveSavingsGoals } from "@/lib/db/savings-goals";
import { getInboxDailySummaries } from "@/lib/inbox/get-inbox-daily-summaries";
import { listActivePlanChatItems } from "@/lib/plans/active-plan-chat";
import { listUnpaidPayPlanChatItems } from "@/lib/planner/unpaid-payplan-chat";
import { listActiveSavingsChatItems } from "@/lib/savings/active-savings-chat";
import type {
  ActivePlanChatItem,
  ActiveSavingsChatItem,
  UnpaidPayPlanChatItem,
} from "@/types/chat";
import type { InboxDailySummaries } from "@/lib/inbox/get-inbox-daily-summaries";

export interface InboxSlashContext {
  unpaidPayPlanItems: UnpaidPayPlanChatItem[];
  activePlanItems: ActivePlanChatItem[];
  activeSavingsItems: ActiveSavingsChatItem[];
}

export interface InboxDeferredData {
  dailySummaries: InboxDailySummaries;
  slash: InboxSlashContext;
}

export type { InboxDailySummaries } from "@/lib/inbox/get-inbox-daily-summaries";

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
  const [dailySummaries, slash] = await Promise.all([
    getInboxDailySummaries(userId),
    getInboxSlashContext(userId),
  ]);

  return { dailySummaries, slash };
}
