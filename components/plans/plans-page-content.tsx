"use client";

import {
  PlansPageTabProvider,
  usePlansPageTab,
} from "@/components/plans/plans-page-tab-context";
import { PlansView } from "@/components/plans/plans-view";
import {
  PlansPageTabs,
  type PlansPageTab,
} from "@/components/plans/plans-page-tabs";
import { PlansShell } from "@/components/plans/plans-shell";
import { SavingsGoalsView } from "@/components/savings/savings-goals-view";
import { MobileScrollSurface } from "@/components/shared/mobile-scroll-surface";
import { SAVINGS_PAGE_TITLE, WISH_PAGE_TITLE } from "@/config/navigation";
import { STACK_GAP } from "@/config/spacing";
import { cn } from "@/lib/utils";
import type { PlanRecord, PlansOverview, PlansUpcomingImpactItem } from "@/types/plan";
import type { SavingsGoalRecord, SavingsOverview } from "@/types/savings-goal";

interface PlansPageContentProps {
  initialTab: PlansPageTab;
  plans: PlanRecord[];
  plansOverview: PlansOverview;
  upcomingImpact: PlansUpcomingImpactItem[];
  savingsGoals: SavingsGoalRecord[];
  savingsOverview: SavingsOverview;
  aiInsight: React.ReactNode;
}

interface PlansPagePanelsProps extends PlansPageContentProps {}

function PlansPagePanels({
  plans,
  plansOverview,
  upcomingImpact,
  savingsGoals,
  savingsOverview,
  aiInsight,
}: PlansPagePanelsProps) {
  const { tab, setTab } = usePlansPageTab();
  const isSavingsTab = tab === "savings";
  const pageTitle = isSavingsTab ? SAVINGS_PAGE_TITLE : WISH_PAGE_TITLE;
  const pageDescription = isSavingsTab
    ? "Savings targets and free balance after allocations."
    : "Shopping wishlist and remaining balance after wishes.";

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col")}>
      <PlansShell className="min-h-0 flex-1">
        <MobileScrollSurface
          className={cn(
            "flex min-h-0 flex-1 flex-col md:p-3",
            STACK_GAP,
            "overflow-y-auto overscroll-y-contain",
            "md:pb-20",
          )}
          title={pageTitle}
        >
          <header className="shrink-0 max-md:hidden">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="mt-0.5 text-base font-semibold tracking-tight sm:text-lg">
                  {pageTitle}
                </h1>
                <p className="mt-0.5 text-[11px] text-muted-foreground sm:text-xs">
                  {pageDescription}
                </p>
              </div>
              <PlansPageTabs tab={tab} onTabChange={setTab} />
            </div>
          </header>

          <p className="text-[11px] text-muted-foreground md:hidden">
            {pageDescription}
          </p>

          <div className={cn(tab !== "wish" && "hidden")}>
            <PlansView
              aiInsight={aiInsight}
              plans={plans}
              overview={plansOverview}
              upcomingImpact={upcomingImpact}
            />
          </div>

          <div className={cn(tab !== "savings" && "hidden")}>
            <SavingsGoalsView
              goals={savingsGoals}
              overview={savingsOverview}
            />
          </div>
        </MobileScrollSurface>
      </PlansShell>
    </div>
  );
}

export function PlansPageContent(props: PlansPageContentProps) {
  return (
    <PlansPageTabProvider initialTab={props.initialTab}>
      <PlansPagePanels {...props} />
    </PlansPageTabProvider>
  );
}
