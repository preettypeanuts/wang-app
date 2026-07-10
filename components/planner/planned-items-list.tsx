import { PlannedItemCard } from "@/components/planner/planned-item-card";
import {
  PAYPLAN_LABEL_ADD_SCHEDULE_HINT,
  PAYPLAN_LABEL_FILTER_RESET_HINT,
  PAYPLAN_LABEL_NO_MATCHING_SCHEDULE,
  PAYPLAN_LABEL_NO_SCHEDULE_YET,
} from "@/config/payplan-labels";
import {
  PLANNER_MANAGE_EMPTY,
  PLANNER_MANAGE_LIST,
} from "@/config/planner-manage";
import { PAYPLAN_MANAGE_EMPTY_MOBILE, PAYPLAN_MANAGE_LIST_MOBILE } from "@/config/payplan-mobile";
import { cn } from "@/lib/utils";
import type { PlannedItemRecord } from "@/types/planner";

interface PlannedItemsListProps {
  items: PlannedItemRecord[];
  disabled?: boolean;
  filteredEmpty?: boolean;
  onViewDetail: (item: PlannedItemRecord) => void;
  onEdit: (item: PlannedItemRecord) => void;
  onDelete: (item: PlannedItemRecord) => void;
}

export function PlannedItemsList({
  items,
  disabled = false,
  filteredEmpty = false,
  onViewDetail,
  onEdit,
  onDelete,
}: PlannedItemsListProps) {
  if (items.length === 0) {
    return (
      <div className={cn(PLANNER_MANAGE_EMPTY, PAYPLAN_MANAGE_EMPTY_MOBILE)}>
        <p className="text-sm font-medium">
          {filteredEmpty
            ? PAYPLAN_LABEL_NO_MATCHING_SCHEDULE
            : PAYPLAN_LABEL_NO_SCHEDULE_YET}
        </p>
        <p className="mt-1 max-w-sm text-xs text-muted-foreground">
          {filteredEmpty
            ? PAYPLAN_LABEL_FILTER_RESET_HINT
            : PAYPLAN_LABEL_ADD_SCHEDULE_HINT}
        </p>
      </div>
    );
  }

  return (
    <div className={cn(PLANNER_MANAGE_LIST, PAYPLAN_MANAGE_LIST_MOBILE)}>
      {items.map((item) => (
        <PlannedItemCard
          key={item.id}
          item={item}
          disabled={disabled}
          onViewDetail={onViewDetail}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
