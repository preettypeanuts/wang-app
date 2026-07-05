"use client";

import { useMemo, useState, useTransition } from "react";
import { PlusIcon } from "@/lib/icons";

import {
  deletePlannedItemAction,
  savePlannedItemAction,
} from "@/app/actions/planner";
import { PlannedItemFormSheet } from "@/components/planner/planned-item-form-sheet";
import { PlannedItemsFilterMenu } from "@/components/planner/planned-items-filter-menu";
import { PlannedItemsList } from "@/components/planner/planned-items-list";
import { PlannedItemsTable } from "@/components/planner/planned-items-table";
import { Button } from "@/components/ui/button";
import { CONTROL_GAP, STACK_GAP } from "@/config/spacing";
import { filterPlannedItems } from "@/lib/planner/filter-planned-items";
import { cn } from "@/lib/utils";
import type {
  PlannedItemRecord,
  PlannedItemsFilters,
  PlannedOccurrence,
  PlannerTab,
} from "@/types/planner";
import { plannerTabToLayout } from "@/types/planner";

interface PlannedItemsManageProps {
  tab: Extract<PlannerTab, "cards" | "table">;
  items: Array<
    Omit<PlannedItemRecord, "startAt" | "endAt"> & {
      startAt: string;
      endAt: string | null;
    }
  >;
  filters: PlannedItemsFilters;
  monthOccurrences?: Array<Omit<PlannedOccurrence, "dueAt"> & { dueAt: string }>;
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
  tab,
  items,
  filters,
  monthOccurrences = [],
}: PlannedItemsManageProps) {
  const layout = plannerTabToLayout(tab);
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
          filters.paymentStatus !== "all" && normalizedMonthOccurrences.length > 0
            ? normalizedMonthOccurrences
            : undefined,
      }),
    [normalizedItems, filters, normalizedMonthOccurrences],
  );
  const filteredEmpty =
    normalizedItems.length > 0 && filteredItems.length === 0;

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PlannedItemRecord | null>(
    null,
  );
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

  function handleDelete(item: PlannedItemRecord) {
    const confirmed = window.confirm(`Hapus "${item.name}" dari PayPlan?`);
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

  async function handleSubmit(formData: FormData) {
    const result = await savePlannedItemAction(formData);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setError(null);
    setSheetOpen(false);
    setEditingItem(null);
  }

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col", STACK_GAP)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold">Jadwal</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Tagihan berulang, langganan, dan cicilan yang muncul di kalender.
          </p>
        </div>

        <div className={cn("flex shrink-0 flex-wrap items-center", CONTROL_GAP)}>
          <PlannedItemsFilterMenu filters={filters} tab={tab} />
          <Button size="sm" onClick={openCreateSheet}>
            <PlusIcon />
            Tambah
          </Button>
        </div>
      </div>

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
          onEdit={openEditSheet}
          onDelete={handleDelete}
        />
      ) : (
        <PlannedItemsList
          items={filteredItems}
          disabled={isPending}
          filteredEmpty={filteredEmpty}
          onEdit={openEditSheet}
          onDelete={handleDelete}
        />
      )}

      <PlannedItemFormSheet
        open={sheetOpen}
        item={editingItem}
        onOpenChange={setSheetOpen}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
