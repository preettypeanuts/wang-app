"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  PlannedItemsFilterFields,
  usePlannedItemsFilterDraft,
} from "@/components/planner/planned-items-filter-fields";
import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogHeader,
} from "@/components/shared/responsive-dialog";
import { DialogDescription, DialogTitle } from "@/components/ui/dialog";
import {
  PAYPLAN_LABEL_FILTER_SCHEDULE_DESC,
  UI_LABEL_FILTER,
} from "@/config/payplan-labels";
import { PLANNED_ITEMS_DEFAULT_FILTERS } from "@/config/planner-manage-filters";
import { FORM_DIALOG_BODY_SCROLL } from "@/config/form-dialog";
import { buildPlannedItemsManageParams } from "@/lib/validations/planned-items-manage";
import type { PlannedItemsFilters, PlannerManageLayout } from "@/types/planner";

interface PlannedItemsFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: PlannedItemsFilters;
  layout: PlannerManageLayout;
}

export function PlannedItemsFilterDialog({
  open,
  onOpenChange,
  filters,
  layout,
}: PlannedItemsFilterDialogProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [draft, setDraft] = usePlannedItemsFilterDraft(filters, open);

  function applyFilters() {
    const params = buildPlannedItemsManageParams(
      { ...draft, q: filters.q },
      layout,
      new URLSearchParams(searchParams.toString()),
    );

    router.push(`${pathname}?${params.toString()}`);
    onOpenChange(false);
  }

  function resetFilters() {
    const params = buildPlannedItemsManageParams(
      { ...PLANNED_ITEMS_DEFAULT_FILTERS, q: filters.q },
      layout,
      new URLSearchParams(searchParams.toString()),
    );

    router.push(`${pathname}?${params.toString()}`);
    onOpenChange(false);
  }

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange} title={UI_LABEL_FILTER}>
      <ResponsiveDialogHeader>
        <DialogTitle className="text-lg font-semibold tracking-tight">
          {UI_LABEL_FILTER}
        </DialogTitle>
        <DialogDescription className="text-[13px] leading-snug">
          {PAYPLAN_LABEL_FILTER_SCHEDULE_DESC}
        </DialogDescription>
      </ResponsiveDialogHeader>

      <ResponsiveDialogBody className={FORM_DIALOG_BODY_SCROLL}>
        <PlannedItemsFilterFields
          draft={draft}
          onDraftChange={setDraft}
          onApply={applyFilters}
          onReset={resetFilters}
          layout="stack"
        />
      </ResponsiveDialogBody>
    </ResponsiveDialog>
  );
}
