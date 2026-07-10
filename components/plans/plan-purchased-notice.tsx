import { PLAN_PURCHASED_NOTICE_SHELL } from "@/config/plans";
import {
  formatPlansPurchasedDesc,
  PLANS_PURCHASED_TITLE,
} from "@/config/plans-labels";
import { CheckCircleIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

interface PlanPurchasedNoticeProps {
  amount: number;
  className?: string;
}

export function PlanPurchasedNotice({
  amount,
  className,
}: PlanPurchasedNoticeProps) {
  return (
    <div
      className={cn(
        PLAN_PURCHASED_NOTICE_SHELL,
        "bg-[#34C759]/12 ring-[#34C759]/25",
        className,
      )}
      role="status"
    >
      <CheckCircleIcon
        aria-hidden
        className="mt-0.5 size-4 shrink-0 text-[#34C759]"
      />
      <div className="min-w-0">
        <p className="text-xs font-semibold text-foreground/90">
          {PLANS_PURCHASED_TITLE}
        </p>
        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
          {formatPlansPurchasedDesc(amount)}
        </p>
      </div>
    </div>
  );
}
