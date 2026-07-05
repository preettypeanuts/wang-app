import { InboxView } from "@/components/chat/inbox-view";
import { TodaySummaryPanel } from "@/components/finance/today-summary-panel";
import { APP_GAP, APP_GUTTER } from "@/config/spacing";
import { getYesterdayDailySummary } from "@/lib/db/daily-summary";
import { getInboxMessages } from "@/lib/db/inbox-messages";
import { listPlannedItems } from "@/lib/db/planned-items";
import { getTodaySummary } from "@/lib/db/transactions";
import { listUnpaidPayPlanChatItems } from "@/lib/planner/unpaid-payplan-chat";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function InboxPage() {
  const [summary, dailySummary, initialMessages, plannedItems] =
    await Promise.all([
      getTodaySummary(),
      getYesterdayDailySummary(),
      getInboxMessages(),
      listPlannedItems(),
    ]);
  const unpaidPayPlanItems = listUnpaidPayPlanChatItems(plannedItems);

  return (
    <div
      className={cn("flex h-full min-h-0 flex-1 overflow-hidden", APP_GAP)}
    >
      <section className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <InboxView
          initialMessages={initialMessages}
          unpaidPayPlanItems={unpaidPayPlanItems}
        />
      </section>
      <aside
        className={cn(
          "hidden h-full min-h-0 w-96 shrink-0 lg:block",
          APP_GUTTER,
        )}
      >
        <TodaySummaryPanel summary={summary} dailySummary={dailySummary} />
      </aside>
    </div>
  );
}
