"use client";

import { useState } from "react";
import { FunnelIcon } from "@/lib/icons";

import { PlannedItemsFilterDialog } from "@/components/planner/planned-items-filter-dialog";
import { PlannedItemsSearchInput } from "@/components/planner/planned-items-search-input";
import { Button } from "@/components/ui/button";
import { UI_LABEL_OPEN_FILTER } from "@/config/payplan-labels";
import {
  PAYPLAN_FILTER_SEARCH_INPUT,
  PAYPLAN_FILTER_TRIGGER,
  PAYPLAN_FILTER_TRIGGER_ACTIVE,
  PAYPLAN_FILTERS_MOBILE_ROW,
} from "@/config/payplan-mobile";
import { SEPARATED_CONTROL } from "@/config/shape";
import { countActivePlannedItemFilters } from "@/lib/planner/filter-planned-items";
import { cn } from "@/lib/utils";
import type { PlannedItemsFilters, PlannerManageLayout } from "@/types/planner";

interface PayplanMobileSearchRowProps {
  filters: PlannedItemsFilters;
  layout: PlannerManageLayout;
  className?: string;
}

export function PayplanMobileSearchRow({
  filters,
  layout,
  className,
}: PayplanMobileSearchRowProps) {
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const hasRichFilters = countActivePlannedItemFilters(filters) > 0;

  return (
    <>
      <div className={cn(PAYPLAN_FILTERS_MOBILE_ROW, className)}>
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

      <PlannedItemsFilterDialog
        open={filterDialogOpen}
        onOpenChange={setFilterDialogOpen}
        filters={filters}
        layout={layout}
      />
    </>
  );
}
