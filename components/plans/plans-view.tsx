"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  deletePlanAction,
  markPlanPurchasedAction,
  savePlanAction,
} from "@/app/actions/plans";
import { PlanCard } from "@/components/plans/plan-card";
import { PlanDetailDialog } from "@/components/plans/plan-detail-dialog";
import { PlansAddFab } from "@/components/plans/plans-add-fab";
import { PlansRelatedUpcoming } from "@/components/plans/plans-related-upcoming";
import { PlansSummaryWidgets } from "@/components/plans/plans-summary-widgets";
import { Button } from "@/components/ui/button";
import {
  PLANS_WISH_EMPTY_DESC,
  PLANS_WISH_EMPTY_TITLE,
  PLANS_WISH_NEW,
  PLANS_WISH_SECTION_DESC,
  UI_LABEL_ADD,
} from "@/config/plans-labels";
import { WISH_PAGE_TITLE } from "@/config/navigation";
import {
  PLANS_CARD_LIST,
  PLANS_MOBILE_SOLID_CARD,
  PLANS_WIDGET_TILE,
} from "@/config/plans";
import { SEPARATED_CONTROL } from "@/config/shape";
import { STACK_GAP } from "@/config/spacing";
import {
  buildFallbackPlansInsight,
  buildPlansOverview,
} from "@/lib/finance/build-plans-overview";
import { PlusIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { PlanRecord, PlansOverview, PlansUpcomingImpactItem } from "@/types/plan";

type DialogMode = "view" | "edit" | "create";

interface PlansViewProps {
  plans: PlanRecord[];
  overview: PlansOverview;
  upcomingImpact: PlansUpcomingImpactItem[];
  aiInsight: React.ReactNode;
}

function sortPlans(plans: PlanRecord[]): PlanRecord[] {
  return [...plans].sort((a, b) => {
    if (a.status !== b.status) {
      return a.status === "active" ? -1 : 1;
    }

    return b.updatedAt.localeCompare(a.updatedAt);
  });
}

function buildLocalOverview(
  plans: PlanRecord[],
  base: PlansOverview,
): PlansOverview {
  const activePlans = plans.filter((plan) => plan.status === "active");
  const estimatedCost = activePlans.reduce((sum, plan) => sum + plan.amount, 0);

  return buildPlansOverview(
    plans,
    base.availableBalance,
    buildFallbackPlansInsight(
      estimatedCost,
      base.availableBalance,
      base.upcomingPayPlanTotal,
      base.remainingBudgetTotal,
    ),
    base.upcomingPayPlanTotal,
    base.upcomingPayPlanCount,
    base.budgetImpacts,
    base.remainingBudgetTotal,
  );
}

export function PlansView({
  plans,
  overview,
  upcomingImpact,
  aiInsight,
}: PlansViewProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<DialogMode>("view");
  const [selectedPlan, setSelectedPlan] = useState<PlanRecord | null>(null);
  const [items, setItems] = useState(plans);
  const [summary, setSummary] = useState(overview);

  useEffect(() => {
    setItems(plans);
    setSummary(overview);
  }, [plans, overview]);

  function openCreate() {
    setSelectedPlan(null);
    setDialogMode("create");
    setDialogOpen(true);
  }

  function openDetail(plan: PlanRecord) {
    setSelectedPlan(plan);
    setDialogMode("view");
    setDialogOpen(true);
  }

  async function handleSubmit(formData: FormData) {
    const result = await savePlanAction(formData);

    if (!result.ok) {
      return;
    }

    setItems((current) => {
      const exists = current.some((plan) => plan.id === result.plan.id);
      const next = sortPlans(
        exists
          ? current.map((plan) =>
              plan.id === result.plan.id ? result.plan : plan,
            )
          : [result.plan, ...current],
      );
      setSummary(buildLocalOverview(next, summary));
      return next;
    });

    setDialogOpen(false);
    router.refresh();
  }

  async function handleDelete(plan: PlanRecord) {
    const result = await deletePlanAction(plan.id);

    if (!result.ok) {
      return;
    }

    setItems((current) => {
      const next = current.filter((entry) => entry.id !== plan.id);
      setSummary(buildLocalOverview(next, summary));
      return next;
    });
    setDialogOpen(false);
    router.refresh();
  }

  async function handleMarkPurchased(plan: PlanRecord) {
    const result = await markPlanPurchasedAction(plan.id);

    if (!result.ok) {
      return;
    }

    setItems((current) => {
      const next = sortPlans(
        current.map((entry) =>
          entry.id === result.plan.id ? result.plan : entry,
        ),
      );
      setSummary(buildLocalOverview(next, summary));
      return next;
    });
    setSelectedPlan(result.plan);
    router.refresh();
  }

  return (
    <div className={cn("flex flex-col", STACK_GAP)}>
      <PlansSummaryWidgets overview={summary} />
      {aiInsight}

      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">{WISH_PAGE_TITLE}</h2>
          <p className="text-xs text-muted-foreground">
            {PLANS_WISH_SECTION_DESC}
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          className={cn(SEPARATED_CONTROL, "max-md:hidden")}
          onClick={openCreate}
        >
          <PlusIcon className="size-4" />
          {UI_LABEL_ADD}
        </Button>
      </div>

      {items.length === 0 ? (
        <div
          className={cn(
            PLANS_WIDGET_TILE,
            PLANS_MOBILE_SOLID_CARD,
            "flex flex-col items-center justify-center px-4 py-12 text-center",
          )}
        >
          <p className="text-sm font-medium">{PLANS_WISH_EMPTY_TITLE}</p>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            {PLANS_WISH_EMPTY_DESC}
          </p>
          <Button
            type="button"
            size="sm"
            className={cn(SEPARATED_CONTROL, "mt-4 max-md:hidden")}
            onClick={openCreate}
          >
            <PlusIcon className="size-4" />
            {PLANS_WISH_NEW}
          </Button>
        </div>
      ) : (
        <div className={PLANS_CARD_LIST}>
          {items.map((plan) => (
            <PlanCard key={plan.id} plan={plan} onClick={openDetail} />
          ))}
        </div>
      )}

      <PlansRelatedUpcoming items={upcomingImpact} />

      <PlansAddFab onClick={openCreate} />

      <PlanDetailDialog
        open={dialogOpen}
        plan={selectedPlan}
        mode={dialogMode}
        onOpenChange={setDialogOpen}
        onModeChange={setDialogMode}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        onMarkPurchased={handleMarkPurchased}
      />
    </div>
  );
}
