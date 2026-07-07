import { PlansPageContent } from "@/components/plans/plans-page-content";
import type { PlansPageTab } from "@/components/plans/plans-page-tabs";
import { generatePlansInsight } from "@/lib/ai/generate-plans-insight";
import { requireUserId } from "@/lib/auth/session";
import { getAvailableBalance } from "@/lib/db/balance";
import { listPlans } from "@/lib/db/plans";
import { listSavingsGoals } from "@/lib/db/savings-goals";
import { buildPlansOverview } from "@/lib/finance/build-plans-overview";
import { buildSavingsOverview } from "@/lib/finance/build-savings-overview";
import { getPlansUpcomingImpact } from "@/lib/planner/build-plans-upcoming-impact";

export const dynamic = "force-dynamic";

interface PlansPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function parsePlansPageTab(
  params: Record<string, string | string[] | undefined>,
): PlansPageTab {
  const tab = params.tab;
  const value = Array.isArray(tab) ? tab[0] : tab;
  return value === "savings" ? "savings" : "wish";
}

export default async function PlansPage({ searchParams }: PlansPageProps) {
  const userId = await requireUserId();
  const params = await searchParams;
  const initialTab = parsePlansPageTab(params);

  const [plans, savingsGoals, availableBalance, upcomingImpact] =
    await Promise.all([
      listPlans(userId),
      listSavingsGoals(userId),
      getAvailableBalance(userId),
      getPlansUpcomingImpact(userId),
    ]);

  const insight = await generatePlansInsight(plans, availableBalance);
  const plansOverview = buildPlansOverview(plans, availableBalance, insight);
  const savingsOverview = buildSavingsOverview(savingsGoals, availableBalance);

  return (
    <PlansPageContent
      initialTab={initialTab}
      plans={plans}
      plansOverview={plansOverview}
      upcomingImpact={upcomingImpact}
      savingsGoals={savingsGoals}
      savingsOverview={savingsOverview}
    />
  );
}
