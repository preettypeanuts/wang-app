import { PlannedItemListRow } from "@/components/planner/planned-item-list-row";
import { PLANNER_MANAGE_EMPTY } from "@/config/planner-manage";
import {
  PAYPLAN_LIST_CONTAINER_MOBILE,
  PAYPLAN_LIST_FRAME_MOBILE,
  PAYPLAN_MANAGE_EMPTY_MOBILE,
  PAYPLAN_MOBILE_SOLID_DIVIDER,
  PAYPLAN_MOBILE_SOLID_SURFACE,
} from "@/config/payplan-mobile";
import {
  PLANNER_LIST_CONTAINER,
  PLANNER_LIST_DIVIDER,
  PLANNER_LIST_FRAME,
  PLANNER_LIST_GROUP,
  PLANNER_LIST_SCROLL,
  PLANNER_LIST_SECTION,
  PLANNER_LIST_SECTION_LABEL,
} from "@/config/planner-table";
import { groupPlannedItemsByKind } from "@/lib/planner/group-planned-items";
import { cn } from "@/lib/utils";
import type { PlannedItemRecord } from "@/types/planner";

interface PlannedItemsTableProps {
  items: PlannedItemRecord[];
  disabled?: boolean;
  filteredEmpty?: boolean;
  onViewDetail: (item: PlannedItemRecord) => void;
  onEdit: (item: PlannedItemRecord) => void;
  onDelete: (item: PlannedItemRecord) => void;
}

export function PlannedItemsTable({
  items,
  disabled = false,
  filteredEmpty = false,
  onViewDetail,
  onEdit,
  onDelete,
}: PlannedItemsTableProps) {
  if (items.length === 0) {
    return (
      <div className={cn(PLANNER_MANAGE_EMPTY, PAYPLAN_MANAGE_EMPTY_MOBILE)}>
        <p className="text-sm font-medium">
          {filteredEmpty ? "Tidak ada jadwal cocok" : "Belum ada jadwal"}
        </p>
        <p className="mt-1 max-w-sm text-xs text-muted-foreground">
          {filteredEmpty
            ? "Ubah filter atau reset untuk melihat jadwal lain."
            : "Tambah tagihan, langganan, atau cicilan untuk muncul di kalender."}
        </p>
      </div>
    );
  }

  const groups = groupPlannedItemsByKind(items);

  return (
    <div className={cn(PLANNER_LIST_CONTAINER, PAYPLAN_LIST_CONTAINER_MOBILE)}>
      <div className={cn(PLANNER_LIST_FRAME, PAYPLAN_LIST_FRAME_MOBILE)}>
        <div className={cn(PLANNER_LIST_SCROLL, "max-md:overflow-visible max-md:flex-none")}>
          {groups.map((group) => (
            <section key={group.kind} className={PLANNER_LIST_SECTION}>
              <h2 className={PLANNER_LIST_SECTION_LABEL}>{group.label}</h2>
              <div className={cn(PLANNER_LIST_GROUP, PAYPLAN_MOBILE_SOLID_SURFACE)}>
                {group.items.map((item, index) => (
                  <div key={item.id}>
                    <PlannedItemListRow
                      item={item}
                      disabled={disabled}
                      onViewDetail={onViewDetail}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                    {index < group.items.length - 1 ? (
                      <div
                        className={cn(PLANNER_LIST_DIVIDER, PAYPLAN_MOBILE_SOLID_DIVIDER)}
                        aria-hidden
                      />
                    ) : null}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
