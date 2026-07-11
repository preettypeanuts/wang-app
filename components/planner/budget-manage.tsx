"use client";

import { useState, useTransition } from "react";
import {
  deleteCategoryBudgetAction,
  saveCategoryBudgetAction,
} from "@/app/actions/budget";
import { BudgetCard } from "@/components/planner/budget-card";
import { BudgetDetailDrawer } from "@/components/planner/budget-detail-drawer";
import { BudgetFormDialog } from "@/components/planner/budget-form-dialog";
import { BudgetMonthHeader } from "@/components/planner/budget-month-header";
import { PayplanAddFab } from "@/components/planner/payplan-add-fab";
import { Button } from "@/components/ui/button";
import { BUDGET_CARD_GRID } from "@/config/budget";
import {
  formatPayPlanDeleteBudgetConfirm,
  PAYPLAN_LABEL_ADD_BUDGET,
  PAYPLAN_LABEL_BUDGET_EMPTY_HINT,
  PAYPLAN_LABEL_CREATE_FIRST_BUDGET,
  PAYPLAN_LABEL_NO_CATEGORY_BUDGET,
  UI_LABEL_ADD,
} from "@/config/payplan-labels";
import {
  PAYPLAN_BUDGET_MOBILE_END_SPACER,
  PAYPLAN_MANAGE_EMPTY_MOBILE,
} from "@/config/payplan-mobile";
import { CONTROL_GAP, STACK_GAP } from "@/config/spacing";
import { PlusIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { BudgetStatus } from "@/types/budget";

interface BudgetManageProps {
  monthKey: string;
  budgets: BudgetStatus[];
}

export function BudgetManage({ monthKey, budgets }: BudgetManageProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editingStatus, setEditingStatus] = useState<BudgetStatus | null>(null);
  const [detailStatus, setDetailStatus] = useState<BudgetStatus | null>(null);
  const [isPending, startTransition] = useTransition();

  const usedCategories = budgets.map((entry) => entry.budget.category);

  function openCreate() {
    setEditingStatus(null);
    setSheetOpen(true);
  }

  function openEdit(status: BudgetStatus) {
    setEditingStatus(status);
    setSheetOpen(true);
  }

  function openDetail(status: BudgetStatus) {
    setDetailStatus(status);
    setDetailOpen(true);
  }

  function handleDelete(status: BudgetStatus) {
    const confirmed = window.confirm(
      formatPayPlanDeleteBudgetConfirm(status.categoryLabel),
    );

    if (!confirmed) {
      return;
    }

    startTransition(async () => {
      await deleteCategoryBudgetAction(status.budget.id);
    });
  }

  async function handleSubmit(formData: FormData): Promise<boolean> {
    const result = await saveCategoryBudgetAction(formData);
    if (!result.ok) {
      window.alert(result.error);
      return false;
    }

    return true;
  }

  return (
    <div
      className={cn("flex min-h-0 flex-1 flex-col max-md:flex-none", STACK_GAP)}
    >
      <div
        className={cn(
          "flex shrink-0 items-center justify-between gap-3",
          CONTROL_GAP,
        )}
      >
        <BudgetMonthHeader monthKey={monthKey} />
        <Button
          type="button"
          size="sm"
          className="max-md:hidden shrink-0 gap-1.5"
          onClick={openCreate}
          disabled={isPending}
        >
          <PlusIcon className="size-4" />
          {UI_LABEL_ADD}
        </Button>
      </div>

      {budgets.length === 0 ? (
        <div
          className={cn(
            "flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-black/10 px-6 py-16 text-center dark:border-white/12",
            PAYPLAN_MANAGE_EMPTY_MOBILE,
          )}
        >
          <p className="text-sm font-medium text-foreground/90">
            {PAYPLAN_LABEL_NO_CATEGORY_BUDGET}
          </p>
          <p className="mt-1 max-w-sm text-[11px] text-muted-foreground">
            {PAYPLAN_LABEL_BUDGET_EMPTY_HINT}
          </p>
          <Button
            type="button"
            size="sm"
            className="mt-4 gap-1.5 max-md:hidden"
            onClick={openCreate}
          >
            <PlusIcon className="size-4" />
            {PAYPLAN_LABEL_CREATE_FIRST_BUDGET}
          </Button>
        </div>
      ) : (
        <div className={BUDGET_CARD_GRID}>
          {budgets.map((status) => (
            <BudgetCard
              key={status.budget.id}
              status={status}
              disabled={isPending}
              onViewDetail={openDetail}
            />
          ))}
        </div>
      )}

      <div aria-hidden className={PAYPLAN_BUDGET_MOBILE_END_SPACER} />

      <PayplanAddFab onClick={openCreate} label={PAYPLAN_LABEL_ADD_BUDGET} />

      <BudgetFormDialog
        open={sheetOpen}
        status={editingStatus}
        periodMonth={monthKey}
        usedCategories={usedCategories}
        onOpenChange={setSheetOpen}
        onSubmit={handleSubmit}
      />

      <BudgetDetailDrawer
        open={detailOpen}
        status={detailStatus}
        disabled={isPending}
        onOpenChange={setDetailOpen}
        onEdit={openEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
