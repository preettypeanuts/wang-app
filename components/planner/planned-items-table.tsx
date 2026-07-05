import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlannedItemCardMenu } from "@/components/planner/planned-item-card-menu";
import { PlannedItemEndBadge } from "@/components/planner/planned-item-end-badge";
import { PlannedItemInstallmentStatus } from "@/components/planner/planned-item-installment-status";
import {
  getPlannedKindBadgeClass,
  PLANNER_MANAGE_EMPTY,
} from "@/config/planner-manage";
import {
  PLANNER_TABLE_CELL,
  PLANNER_TABLE_CONTAINER,
  PLANNER_TABLE_HEAD,
  PLANNER_TABLE_HEADER,
  PLANNER_TABLE_KIND_BADGE,
  PLANNER_TABLE_ROW,
  PLANNER_TABLE_SCROLL,
  PLANNER_TABLE_STATUS_CELL,
} from "@/config/planner-table";
import {
  formatPlannedInstallmentCount,
  formatPlannedItemKind,
  formatPlannedItemRepeat,
  formatPlannedStartLabel,
} from "@/lib/planner/format-planned-item";
import { formatIdr } from "@/lib/finance/format-currency";
import { cn } from "@/lib/utils";
import type { PlannedItemRecord } from "@/types/planner";

interface PlannedItemsTableProps {
  items: PlannedItemRecord[];
  disabled?: boolean;
  filteredEmpty?: boolean;
  onEdit: (item: PlannedItemRecord) => void;
  onDelete: (item: PlannedItemRecord) => void;
}

export function PlannedItemsTable({
  items,
  disabled = false,
  filteredEmpty = false,
  onEdit,
  onDelete,
}: PlannedItemsTableProps) {
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
    <div className={PLANNER_TABLE_CONTAINER}>
      <div className={PLANNER_TABLE_SCROLL}>
        <Table>
          <TableHeader className={PLANNER_TABLE_HEADER}>
            <TableRow className="border-0 hover:bg-transparent">
              <TableHead className={PLANNER_TABLE_HEAD}>Name</TableHead>
              <TableHead className={PLANNER_TABLE_HEAD}>Type</TableHead>
              <TableHead className={PLANNER_TABLE_HEAD}>Repeat</TableHead>
              <TableHead className={`${PLANNER_TABLE_HEAD} text-right`}>
                Amount
              </TableHead>
              <TableHead className={PLANNER_TABLE_HEAD}>Status</TableHead>
              <TableHead className={PLANNER_TABLE_HEAD}>Start</TableHead>
              <TableHead className={PLANNER_TABLE_HEAD}>End</TableHead>
              <TableHead className={`${PLANNER_TABLE_HEAD} w-12 text-right`}>
                Edit
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const installmentCount = formatPlannedInstallmentCount(item);
              const isIncome = item.flowType === "income";

              return (
                <TableRow key={item.id} className={PLANNER_TABLE_ROW}>
                  <TableCell
                    className={cn(PLANNER_TABLE_CELL, "max-w-[10rem] font-medium")}
                  >
                    <span className="block truncate">{item.name}</span>
                  </TableCell>
                  <TableCell className={PLANNER_TABLE_CELL}>
                    <span
                      className={cn(
                        PLANNER_TABLE_KIND_BADGE,
                        getPlannedKindBadgeClass(item.kind),
                      )}
                    >
                      {formatPlannedItemKind(item.kind)}
                    </span>
                  </TableCell>
                  <TableCell className={PLANNER_TABLE_CELL}>
                    {formatPlannedItemRepeat(item.repeat)}
                    {installmentCount ? (
                      <span className="ml-1 font-semibold tabular-nums text-foreground/75">
                        · {installmentCount}
                      </span>
                    ) : null}
                  </TableCell>
                  <TableCell
                    className={cn(
                      PLANNER_TABLE_CELL,
                      "text-right font-semibold tabular-nums",
                      isIncome ? "text-[#34C759]" : "text-foreground",
                    )}
                  >
                    {isIncome ? "+" : ""}
                    {formatIdr(item.amount)}
                  </TableCell>
                  <TableCell className={cn(PLANNER_TABLE_CELL, PLANNER_TABLE_STATUS_CELL)}>
                    {item.flowType === "expense" ? (
                      <PlannedItemInstallmentStatus item={item} />
                    ) : (
                      <span className="text-muted-foreground/50">—</span>
                    )}
                  </TableCell>
                  <TableCell className={PLANNER_TABLE_CELL}>
                    {formatPlannedStartLabel(item)}
                  </TableCell>
                  <TableCell className={PLANNER_TABLE_CELL}>
                    <PlannedItemEndBadge item={item} />
                  </TableCell>
                  <TableCell className={`${PLANNER_TABLE_CELL} text-right`}>
                    <PlannedItemCardMenu
                      item={item}
                      disabled={disabled}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
