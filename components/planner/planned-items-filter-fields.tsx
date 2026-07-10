"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PAYPLAN_FILTER_LABEL_END,
  PAYPLAN_FILTER_LABEL_FLOW,
  PAYPLAN_FILTER_LABEL_KIND,
  PAYPLAN_FILTER_LABEL_PAYMENT_STATUS,
  PAYPLAN_FILTER_LABEL_REPEAT,
  PAYPLAN_LABEL_FILTER_SCHEDULE,
  PAYPLAN_LABEL_FILTER_SCHEDULE_DESC,
  UI_LABEL_APPLY,
  UI_LABEL_RESET,
} from "@/config/payplan-labels";
import {
  PLANNED_ITEMS_END_MODE_OPTIONS,
  PLANNED_ITEMS_FLOW_OPTIONS,
  PLANNED_ITEMS_KIND_OPTIONS,
  PLANNED_ITEMS_PAYMENT_OPTIONS,
  PLANNED_ITEMS_REPEAT_OPTIONS,
} from "@/config/planner-manage-filters";
import {
  PLANNER_SELECT_CONTENT,
  PLANNER_SELECT_ITEM,
  PLANNER_SELECT_TRIGGER,
} from "@/config/planner-manage";
import { SEPARATED_CONTROL } from "@/config/shape";
import { CONTROL_GAP } from "@/config/spacing";
import { cn } from "@/lib/utils";
import type { PlannedItemsFilters } from "@/types/planner";

type PlannedItemsFilterDraft = Omit<PlannedItemsFilters, "q">;

interface PlannedItemsFilterFieldsProps {
  draft: PlannedItemsFilterDraft;
  onDraftChange: (draft: PlannedItemsFilterDraft) => void;
  onApply: () => void;
  onReset: () => void;
  layout?: "stack" | "inline";
  className?: string;
}

export function PlannedItemsFilterFields({
  draft,
  onDraftChange,
  onApply,
  onReset,
  layout = "stack",
  className,
}: PlannedItemsFilterFieldsProps) {
  const isStack = layout === "stack";

  return (
    <form
      className={cn("flex flex-col gap-4", className)}
      onSubmit={(event) => {
        event.preventDefault();
        onApply();
      }}
    >
      {isStack ? (
        <div>
          <p className="text-sm font-semibold">{PAYPLAN_LABEL_FILTER_SCHEDULE}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {PAYPLAN_LABEL_FILTER_SCHEDULE_DESC}
          </p>
        </div>
      ) : null}

      <div className={cn("grid gap-3", !isStack ? "sm:grid-cols-2" : "sm:grid-cols-2")}>
        <div className="grid gap-1.5">
          <Label htmlFor="planned-filter-kind">{PAYPLAN_FILTER_LABEL_KIND}</Label>
          <Select
            value={draft.kind}
            onValueChange={(value) =>
              onDraftChange({
                ...draft,
                kind: (value ?? "all") as PlannedItemsFilters["kind"],
              })
            }
          >
            <SelectTrigger
              id="planned-filter-kind"
              className={cn(SEPARATED_CONTROL, PLANNER_SELECT_TRIGGER, isStack && "h-10")}
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
          <Label htmlFor="planned-filter-repeat">{PAYPLAN_FILTER_LABEL_REPEAT}</Label>
          <Select
            value={draft.repeat}
            onValueChange={(value) =>
              onDraftChange({
                ...draft,
                repeat: (value ?? "all") as PlannedItemsFilters["repeat"],
              })
            }
          >
            <SelectTrigger
              id="planned-filter-repeat"
              className={cn(SEPARATED_CONTROL, PLANNER_SELECT_TRIGGER, isStack && "h-10")}
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

      <div className={cn("grid gap-3", !isStack ? "sm:grid-cols-2" : "sm:grid-cols-2")}>
        <div className="grid gap-1.5">
          <Label htmlFor="planned-filter-flow">{PAYPLAN_FILTER_LABEL_FLOW}</Label>
          <Select
            value={draft.flowType}
            onValueChange={(value) =>
              onDraftChange({
                ...draft,
                flowType: (value ?? "all") as PlannedItemsFilters["flowType"],
              })
            }
          >
            <SelectTrigger
              id="planned-filter-flow"
              className={cn(SEPARATED_CONTROL, PLANNER_SELECT_TRIGGER, isStack && "h-10")}
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
          <Label htmlFor="planned-filter-end">{PAYPLAN_FILTER_LABEL_END}</Label>
          <Select
            value={draft.endMode}
            onValueChange={(value) =>
              onDraftChange({
                ...draft,
                endMode: (value ?? "all") as PlannedItemsFilters["endMode"],
              })
            }
          >
            <SelectTrigger
              id="planned-filter-end"
              className={cn(SEPARATED_CONTROL, PLANNER_SELECT_TRIGGER, isStack && "h-10")}
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
        <Label htmlFor="planned-filter-payment">
          {PAYPLAN_FILTER_LABEL_PAYMENT_STATUS}
        </Label>
        <Select
          value={draft.paymentStatus}
          onValueChange={(value) =>
            onDraftChange({
              ...draft,
              paymentStatus: (value ??
                "all") as PlannedItemsFilters["paymentStatus"],
            })
          }
        >
          <SelectTrigger
            id="planned-filter-payment"
            className={cn(SEPARATED_CONTROL, PLANNER_SELECT_TRIGGER, isStack && "h-10")}
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

      <div
        className={cn(
          "flex w-full",
          !isStack && "justify-end",
          CONTROL_GAP,
        )}
      >
        <Button
          type="button"
          variant="ghost"
          size={isStack ? "default" : "sm"}
          className={cn(SEPARATED_CONTROL, isStack && "flex-1")}
          onClick={onReset}
        >
          {UI_LABEL_RESET}
        </Button>
        <Button
          type="submit"
          size={isStack ? "default" : "sm"}
          className={cn(SEPARATED_CONTROL, isStack && "flex-1")}
        >
          {UI_LABEL_APPLY}
        </Button>
      </div>
    </form>
  );
}

export type { PlannedItemsFilterDraft };

export function usePlannedItemsFilterDraft(
  filters: PlannedItemsFilters,
  open: boolean,
): [PlannedItemsFilterDraft, (draft: PlannedItemsFilterDraft) => void] {
  const [draft, setDraft] = useState<PlannedItemsFilterDraft>(() => {
    const { q: _, ...rest } = filters;
    return rest;
  });

  useEffect(() => {
    if (open) {
      const { q: _, ...rest } = filters;
      setDraft(rest);
    }
  }, [filters, open]);

  return [draft, setDraft];
}
