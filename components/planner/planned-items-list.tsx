import { PlannedItemCard } from "@/components/planner/planned-item-card";
import {
  PLANNER_MANAGE_EMPTY,
  PLANNER_MANAGE_LIST,
} from "@/config/planner-manage";
import type { PlannedItemRecord } from "@/types/planner";

interface PlannedItemsListProps {
  items: PlannedItemRecord[];
  disabled?: boolean;
  filteredEmpty?: boolean;
  onEdit: (item: PlannedItemRecord) => void;
  onDelete: (item: PlannedItemRecord) => void;
}

export function PlannedItemsList({
  items,
  disabled = false,
  filteredEmpty = false,
  onEdit,
  onDelete,
}: PlannedItemsListProps) {
  if (items.length === 0) {
    return (
      <div className={PLANNER_MANAGE_EMPTY}>
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

  return (
    <div className={PLANNER_MANAGE_LIST}>
      {items.map((item) => (
        <PlannedItemCard
          key={item.id}
          item={item}
          disabled={disabled}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
