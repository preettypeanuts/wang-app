import { TextMarquee } from "@/components/shared/text-marquee";
import { PLANNER_MANAGE_STATUS } from "@/config/planner-manage";
import { getPlannedItemPaymentStatus } from "@/lib/planner/installment-progress";
import { cn } from "@/lib/utils";
import type { PlannedItemRecord } from "@/types/planner";

interface PlannedItemInstallmentStatusProps {
  item: PlannedItemRecord;
  className?: string;
}

export function PlannedItemInstallmentStatus({
  item,
  className,
}: PlannedItemInstallmentStatusProps) {
  const paymentStatus = getPlannedItemPaymentStatus(item);

  if (!paymentStatus) {
    return null;
  }

  return (
    <TextMarquee
      text={paymentStatus.label}
      className={cn("w-full", className)}
      trackClassName={cn(
        PLANNER_MANAGE_STATUS,
        paymentStatus.status === "paid"
          ? "text-[#34C759]"
          : "text-[#FF9500]",
      )}
    />
  );
}
