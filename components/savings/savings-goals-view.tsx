"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  deleteSavingsGoalAction,
  depositSavingsGoalAction,
  saveSavingsGoalAction,
  withdrawSavingsGoalAction,
} from "@/app/actions/savings-goals";
import { PlansAddFab } from "@/components/plans/plans-add-fab";
import { SavingsGoalCard } from "@/components/savings/savings-goal-card";
import { SavingsGoalDetailDialog } from "@/components/savings/savings-goal-detail-dialog";
import { SavingsGoalsSummaryWidgets } from "@/components/savings/savings-goals-summary-widgets";
import { Button } from "@/components/ui/button";
import {
  PLANS_LABEL_ADD_SAVINGS,
  SAVINGS_EMPTY_DESC,
  SAVINGS_EMPTY_TITLE,
  SAVINGS_NEW,
  SAVINGS_SECTION_DESC,
  UI_LABEL_ADD,
} from "@/config/plans-labels";
import { SAVINGS_PAGE_TITLE } from "@/config/navigation";
import {
  SAVINGS_CARD_LIST,
  SAVINGS_MOBILE_SOLID_CARD,
  SAVINGS_WIDGET_TILE,
} from "@/config/savings";
import { SEPARATED_CONTROL } from "@/config/shape";
import { STACK_GAP } from "@/config/spacing";
import { buildSavingsOverview } from "@/lib/finance/build-savings-overview";
import { PlusIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { SavingsGoalRecord, SavingsOverview } from "@/types/savings-goal";

type DialogMode = "view" | "edit" | "create";

interface SavingsGoalsViewProps {
  goals: SavingsGoalRecord[];
  overview: SavingsOverview;
}

function sortGoals(goals: SavingsGoalRecord[]): SavingsGoalRecord[] {
  return [...goals].sort((a, b) => {
    if (a.status !== b.status) {
      return a.status === "active" ? -1 : 1;
    }

    return b.updatedAt.localeCompare(a.updatedAt);
  });
}

export function SavingsGoalsView({ goals, overview }: SavingsGoalsViewProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<DialogMode>("view");
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoalRecord | null>(
    null,
  );
  const [items, setItems] = useState(goals);
  const [summary, setSummary] = useState(overview);

  useEffect(() => {
    setItems(goals);
    setSummary(overview);
  }, [goals, overview]);

  function rebuildOverview(nextGoals: SavingsGoalRecord[]) {
    return buildSavingsOverview(nextGoals, summary.availableBalance);
  }

  function openCreate() {
    setSelectedGoal(null);
    setDialogMode("create");
    setDialogOpen(true);
  }

  function openDetail(goal: SavingsGoalRecord) {
    setSelectedGoal(goal);
    setDialogMode("view");
    setDialogOpen(true);
  }

  async function handleSubmit(formData: FormData) {
    const result = await saveSavingsGoalAction(formData);

    if (!result.ok) {
      return;
    }

    setItems((current) => {
      const exists = current.some((goal) => goal.id === result.goal.id);
      const next = sortGoals(
        exists
          ? current.map((goal) =>
              goal.id === result.goal.id ? result.goal : goal,
            )
          : [result.goal, ...current],
      );
      setSummary(rebuildOverview(next));
      return next;
    });

    setSelectedGoal(result.goal);
    setDialogMode("view");
    router.refresh();
  }

  async function handleDelete(goal: SavingsGoalRecord) {
    const result = await deleteSavingsGoalAction(goal.id);

    if (!result.ok) {
      return;
    }

    setItems((current) => {
      const next = current.filter((entry) => entry.id !== goal.id);
      setSummary(rebuildOverview(next));
      return next;
    });
    setDialogOpen(false);
    router.refresh();
  }

  async function handleDeposit(goal: SavingsGoalRecord, amount: number) {
    const result = await depositSavingsGoalAction(goal.id, amount);

    if (!result.ok) {
      return;
    }

    setItems((current) => {
      const next = sortGoals(
        current.map((entry) =>
          entry.id === result.goal.id ? result.goal : entry,
        ),
      );
      setSummary(rebuildOverview(next));
      return next;
    });
    setSelectedGoal(result.goal);
    router.refresh();
  }

  async function handleWithdraw(goal: SavingsGoalRecord, amount: number) {
    const result = await withdrawSavingsGoalAction(goal.id, amount);

    if (!result.ok) {
      return;
    }

    setItems((current) => {
      const next = sortGoals(
        current.map((entry) =>
          entry.id === result.goal.id ? result.goal : entry,
        ),
      );
      setSummary(rebuildOverview(next));
      return next;
    });
    setSelectedGoal(result.goal);
    router.refresh();
  }

  return (
    <div className={cn("flex flex-col", STACK_GAP)}>
      <SavingsGoalsSummaryWidgets overview={summary} />

      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">{SAVINGS_PAGE_TITLE}</h2>
          <p className="text-xs text-muted-foreground">
            {SAVINGS_SECTION_DESC}
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
            SAVINGS_WIDGET_TILE,
            SAVINGS_MOBILE_SOLID_CARD,
            "flex flex-col items-center justify-center px-4 py-12 text-center",
          )}
        >
          <p className="text-sm font-medium">{SAVINGS_EMPTY_TITLE}</p>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            {SAVINGS_EMPTY_DESC}
          </p>
          <Button
            type="button"
            size="sm"
            className={cn(SEPARATED_CONTROL, "mt-4 max-md:hidden")}
            onClick={openCreate}
          >
            <PlusIcon className="size-4" />
            {SAVINGS_NEW}
          </Button>
        </div>
      ) : (
        <div className={SAVINGS_CARD_LIST}>
          {items.map((goal) => (
            <SavingsGoalCard key={goal.id} goal={goal} onClick={openDetail} />
          ))}
        </div>
      )}

      <PlansAddFab ariaLabel={PLANS_LABEL_ADD_SAVINGS} onClick={openCreate} />

      <SavingsGoalDetailDialog
        open={dialogOpen}
        goal={selectedGoal}
        mode={dialogMode}
        onOpenChange={setDialogOpen}
        onModeChange={setDialogMode}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        onDeposit={handleDeposit}
        onWithdraw={handleWithdraw}
      />
    </div>
  );
}
