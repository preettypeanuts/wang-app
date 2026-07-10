"use client";

import { useMemo, useState, useTransition } from "react";
import {
  deletePlannedItemAction,
  savePlannedItemAction,
} from "@/app/actions/planner";
import { PayplanAddFab } from "@/components/planner/payplan-add-fab";
import { PlannedItemDetailDialog } from "@/components/planner/planned-item-detail-dialog";
import { PlannedItemFormDialog } from "@/components/planner/planned-item-form-dialog";
import { PlannedItemsFilterDialog } from "@/components/planner/planned-items-filter-dialog";
import { PlannedItemsFilterMenu } from "@/components/planner/planned-items-filter-menu";
import { PlannedItemsList } from "@/components/planner/planned-items-list";
import { PlannedItemsSearchInput } from "@/components/planner/planned-items-search-input";
import { PlannedItemsTable } from "@/components/planner/planned-items-table";
import { Button } from "@/components/ui/button";
import {
  formatPayPlanDeleteConfirm,
  PAYPLAN_LABEL_ADD_PAY_PLAN,
  PAYPLAN_LABEL_MANAGE_DESC,
  PAYPLAN_LABEL_SCHEDULES,
  UI_LABEL_OPEN_FILTER,
} from "@/config/payplan-labels";
import {
  PAYPLAN_FILTER_SEARCH_INPUT,
  PAYPLAN_FILTER_TRIGGER,
  PAYPLAN_FILTER_TRIGGER_ACTIVE,
  PAYPLAN_FILTERS_MOBILE_ROW,
  PAYPLAN_MANAGE_SECTION_HEADER,
  PAYPLAN_MANAGE_TOOLBAR_DESKTOP,
} from "@/config/payplan-mobile";
import { SEPARATED_CONTROL } from "@/config/shape";
import { CONTROL_GAP, STACK_GAP } from "@/config/spacing";
import { FunnelIcon, PlusIcon } from "@/lib/icons";
import {
  countActivePlannedItemFilters,
  filterPlannedItems,
} from "@/lib/planner/filter-planned-items";
import { cn } from "@/lib/utils";
import type {
  PlannedItemRecord,
  PlannedItemsFilters,
  PlannedOccurrence,
  PlannerManageLayout,
} from "@/types/planner";

interface PlannedItemsManageProps {
  layout: PlannerManageLayout;
  items: Array<
    Omit<PlannedItemRecord, "startAt" | "endAt"> & {
      startAt: string;
      endAt: string | null;
    }
  >;
  filters: PlannedItemsFilters;
  monthOccurrences?: Array<
    Omit<PlannedOccurrence, "dueAt"> & { dueAt: string }
  >;
  className?: string;
  hideMobileSearchRow?: boolean;
}

function normalizeItems(
  items: PlannedItemsManageProps["items"],
): PlannedItemRecord[] {
  return items.map((item) => ({
    ...item,
    startAt: new Date(item.startAt),
    endAt: item.endAt ? new Date(item.endAt) : null,
  }));
}

export function PlannedItemsManage({
  layout,
  items,
  filters,
  monthOccurrences = [],
  className,
  hideMobileSearchRow = false,
}: PlannedItemsManageProps) {
  const normalizedItems = useMemo(() => normalizeItems(items), [items]);
  const normalizedMonthOccurrences = useMemo(
    () =>
      monthOccurrences.map((item) => ({
        ...item,
        dueAt: new Date(item.dueAt),
      })),
    [monthOccurrences],
  );
  const filteredItems = useMemo(
    () =>
      filterPlannedItems(normalizedItems, filters, {
        monthOccurrences:
          filters.paymentStatus !== "all" &&
          normalizedMonthOccurrences.length > 0
            ? normalizedMonthOccurrences
            : undefined,
      }),
    [normalizedItems, filters, normalizedMonthOccurrences],
  );
  const filteredEmpty =
    normalizedItems.length > 0 && filteredItems.length === 0;
  const hasRichFilters = countActivePlannedItemFilters(filters) > 0;

  const [sheetOpen, setSheetOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PlannedItemRecord | null>(
    null,
  );
  const [detailItem, setDetailItem] = useState<PlannedItemRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function openCreateSheet() {
    setEditingItem(null);
    setError(null);
    setSheetOpen(true);
  }

  function openEditSheet(item: PlannedItemRecord) {
    setEditingItem(item);
    setError(null);
    setSheetOpen(true);
  }

  function openDetailSheet(item: PlannedItemRecord) {
    setDetailItem(item);
    setDetailOpen(true);
  }

  function handleDelete(item: PlannedItemRecord) {
    const confirmed = window.confirm(formatPayPlanDeleteConfirm(item.name));
    if (!confirmed) {
      return;
    }

    startTransition(async () => {
      const result = await deletePlannedItemAction(item.id);
      if (!result.ok) {
        setError(result.error);
      }
    });
  }

  async function handleSubmit(formData: FormData): Promise<boolean> {
    const result = await savePlannedItemAction(formData);

    if (!result.ok) {
      setError(result.error);
      return false;
    }

    setError(null);
    setEditingItem(null);
    return true;
  }

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col", STACK_GAP, className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className={cn("min-w-0", PAYPLAN_MANAGE_SECTION_HEADER)}>
          <h2 className="text-sm font-semibold">{PAYPLAN_LABEL_SCHEDULES}</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {PAYPLAN_LABEL_MANAGE_DESC}
          </p>
        </div>

        <div className={cn(PAYPLAN_MANAGE_TOOLBAR_DESKTOP, CONTROL_GAP)}>
          <PlannedItemsSearchInput filters={filters} layout={layout} />
          <PlannedItemsFilterMenu filters={filters} layout={layout} />
          <Button size="sm" onClick={openCreateSheet}>
            <PlusIcon />
            {PAYPLAN_LABEL_ADD_PAY_PLAN}
          </Button>
        </div>
      </div>

      {hideMobileSearchRow ? null : (
        <div className={PAYPLAN_FILTERS_MOBILE_ROW}>
          <PlannedItemsSearchInput
            filters={filters}
            layout={layout}
            className={cn(SEPARATED_CONTROL, PAYPLAN_FILTER_SEARCH_INPUT)}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label={UI_LABEL_OPEN_FILTER}
            aria-expanded={filterDialogOpen}
            className={cn(
              SEPARATED_CONTROL,
              PAYPLAN_FILTER_TRIGGER,
              hasRichFilters && PAYPLAN_FILTER_TRIGGER_ACTIVE,
            )}
            onClick={() => setFilterDialogOpen(true)}
          >
            <FunnelIcon aria-hidden className="size-4" />
          </Button>
        </div>
      )}

      {error ? (
        <p className="rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error}
        </p>
      ) : null}

      {layout === "table" ? (
        <PlannedItemsTable
          items={filteredItems}
          disabled={isPending}
          filteredEmpty={filteredEmpty}
          onViewDetail={openDetailSheet}
          onEdit={openEditSheet}
          onDelete={handleDelete}
        />
      ) : (
        <PlannedItemsList
          items={filteredItems}
          disabled={isPending}
          filteredEmpty={filteredEmpty}
          onViewDetail={openDetailSheet}
          onEdit={openEditSheet}
          onDelete={handleDelete}
        />
      )}

      <PayplanAddFab onClick={openCreateSheet} />

      <PlannedItemsFilterDialog
        open={filterDialogOpen}
        onOpenChange={setFilterDialogOpen}
        filters={filters}
        layout={layout}
      />

      <PlannedItemDetailDialog
        open={detailOpen}
        item={detailItem}
        onOpenChange={setDetailOpen}
        onEdit={openEditSheet}
        onDelete={handleDelete}
      />

      <PlannedItemFormDialog
        open={sheetOpen}
        item={editingItem}
        onOpenChange={setSheetOpen}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
