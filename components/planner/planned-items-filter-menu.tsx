"use client";

import { useEffect, useState } from "react";
import { FunnelIcon } from "@/lib/icons";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PLANNED_ITEMS_DEFAULT_FILTERS,
  PLANNED_ITEMS_END_MODE_OPTIONS,
  PLANNED_ITEMS_FLOW_OPTIONS,
  PLANNED_ITEMS_KIND_OPTIONS,
  PLANNED_ITEMS_PAYMENT_OPTIONS,
  PLANNED_ITEMS_REPEAT_OPTIONS,
} from "@/config/planner-manage-filters";
import { GLASS_SURFACE } from "@/config/glass";
import {
  PLANNER_SELECT_CONTENT,
  PLANNER_SELECT_ITEM,
  PLANNER_SELECT_TRIGGER,
} from "@/config/planner-manage";
import { SEPARATED_CONTROL } from "@/config/shape";
import { CONTROL_GAP } from "@/config/spacing";
import { countActivePlannedItemFilters } from "@/lib/planner/filter-planned-items";
import {
  buildPlannedItemsManageParams,
} from "@/lib/validations/planned-items-manage";
import { cn } from "@/lib/utils";
import type { PlannedItemsFilters, PlannerTab } from "@/types/planner";

interface PlannedItemsFilterMenuProps {
  filters: PlannedItemsFilters;
  tab: Extract<PlannerTab, "cards" | "table">;
}

export function PlannedItemsFilterMenu({
  filters,
  tab,
}: PlannedItemsFilterMenuProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(filters);
  const activeCount = countActivePlannedItemFilters(filters);

  useEffect(() => {
    if (open) {
      setDraft(filters);
    }
  }, [filters, open]);

  function applyFilters(next?: Partial<PlannedItemsFilters>) {
    const merged: PlannedItemsFilters = { ...draft, ...next };
    const params = buildPlannedItemsManageParams(
      merged,
      tab,
      new URLSearchParams(searchParams.toString()),
    );

    router.push(`${pathname}?${params.toString()}`);
    setOpen(false);
  }

  function resetFilters() {
    setDraft(PLANNED_ITEMS_DEFAULT_FILTERS);
    const params = buildPlannedItemsManageParams(
      PLANNED_ITEMS_DEFAULT_FILTERS,
      tab,
      new URLSearchParams(searchParams.toString()),
    );

    router.push(`${pathname}?${params.toString()}`);
    setOpen(false);
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn(SEPARATED_CONTROL, "relative gap-1.5")}
          />
        }
      >
        <FunnelIcon />
        Filter
        {activeCount > 0 ? (
          <Badge
            variant="secondary"
            className="ml-0.5 h-4 min-w-4 rounded-full px-1 text-[10px]"
          >
            {activeCount}
          </Badge>
        ) : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        side="bottom"
        sideOffset={8}
        className={cn(
          GLASS_SURFACE,
          "w-[min(100vw-2rem,22rem)] rounded-2xl p-0",
        )}
      >
        <form
          className="flex flex-col gap-4 p-4"
          onSubmit={(event) => {
            event.preventDefault();
            applyFilters();
          }}
        >
          <div>
            <p className="text-sm font-semibold">Filter jadwal</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Saring tagihan, langganan, dan cicilan.
            </p>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="planned-filter-q">Cari</Label>
            <Input
              id="planned-filter-q"
              value={draft.q}
              onChange={(event) =>
                setDraft((current) => ({ ...current, q: event.target.value }))
              }
              placeholder="Nama atau catatan..."
              className={cn(SEPARATED_CONTROL, "h-9")}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="planned-filter-kind">Jenis</Label>
              <Select
                value={draft.kind}
                onValueChange={(value) =>
                  setDraft((current) => ({
                    ...current,
                    kind: (value ?? "all") as PlannedItemsFilters["kind"],
                  }))
                }
              >
                <SelectTrigger
                  id="planned-filter-kind"
                  className={cn(SEPARATED_CONTROL, PLANNER_SELECT_TRIGGER)}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={PLANNER_SELECT_CONTENT}>
                  {PLANNED_ITEMS_KIND_OPTIONS.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className={PLANNER_SELECT_ITEM}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="planned-filter-repeat">Pengulangan</Label>
              <Select
                value={draft.repeat}
                onValueChange={(value) =>
                  setDraft((current) => ({
                    ...current,
                    repeat: (value ?? "all") as PlannedItemsFilters["repeat"],
                  }))
                }
              >
                <SelectTrigger
                  id="planned-filter-repeat"
                  className={cn(SEPARATED_CONTROL, PLANNER_SELECT_TRIGGER)}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={PLANNER_SELECT_CONTENT}>
                  {PLANNED_ITEMS_REPEAT_OPTIONS.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className={PLANNER_SELECT_ITEM}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="planned-filter-flow">Arus</Label>
              <Select
                value={draft.flowType}
                onValueChange={(value) =>
                  setDraft((current) => ({
                    ...current,
                    flowType: (value ??
                      "all") as PlannedItemsFilters["flowType"],
                  }))
                }
              >
                <SelectTrigger
                  id="planned-filter-flow"
                  className={cn(SEPARATED_CONTROL, PLANNER_SELECT_TRIGGER)}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={PLANNER_SELECT_CONTENT}>
                  {PLANNED_ITEMS_FLOW_OPTIONS.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className={PLANNER_SELECT_ITEM}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="planned-filter-end">Akhir</Label>
              <Select
                value={draft.endMode}
                onValueChange={(value) =>
                  setDraft((current) => ({
                    ...current,
                    endMode: (value ?? "all") as PlannedItemsFilters["endMode"],
                  }))
                }
              >
                <SelectTrigger
                  id="planned-filter-end"
                  className={cn(SEPARATED_CONTROL, PLANNER_SELECT_TRIGGER)}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={PLANNER_SELECT_CONTENT}>
                  {PLANNED_ITEMS_END_MODE_OPTIONS.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className={PLANNER_SELECT_ITEM}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="planned-filter-payment">Status bayar</Label>
            <Select
              value={draft.paymentStatus}
              onValueChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  paymentStatus: (value ??
                    "all") as PlannedItemsFilters["paymentStatus"],
                }))
              }
            >
              <SelectTrigger
                id="planned-filter-payment"
                className={cn(SEPARATED_CONTROL, PLANNER_SELECT_TRIGGER)}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className={PLANNER_SELECT_CONTENT}>
                {PLANNED_ITEMS_PAYMENT_OPTIONS.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className={PLANNER_SELECT_ITEM}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className={cn("flex justify-end", CONTROL_GAP)}>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={SEPARATED_CONTROL}
              onClick={resetFilters}
            >
              Reset
            </Button>
            <Button type="submit" size="sm" className={SEPARATED_CONTROL}>
              Terapkan
            </Button>
          </div>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
