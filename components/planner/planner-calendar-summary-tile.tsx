import { ReceiptIcon, WalletIcon, type Icon } from "@/lib/icons";

import {
  PLANNER_CALENDAR_SUMMARY_AMOUNT,
  PLANNER_CALENDAR_SUMMARY_ICON,
  PLANNER_CALENDAR_SUMMARY_LABEL,
  PLANNER_CALENDAR_SUMMARY_SUBTITLE,
  PLANNER_CALENDAR_SUMMARY_TILE,
} from "@/config/planner-calendar";
import { SEPARATED_SURFACE } from "@/config/shape";
import { cn } from "@/lib/utils";

type PlannerCalendarSummaryIcon = "receipt" | "wallet";

const TILE_ICONS: Record<PlannerCalendarSummaryIcon, Icon> = {
  receipt: ReceiptIcon,
  wallet: WalletIcon,
};

interface PlannerCalendarSummaryTileProps {
  label: string;
  amount: string;
  subtitle: string;
  icon: PlannerCalendarSummaryIcon;
  surfaceClassName: string;
  iconClassName: string;
  labelClassName?: string;
  amountClassName?: string;
  subtitleClassName?: string;
  onClick?: () => void;
}

export function PlannerCalendarSummaryTile({
  label,
  amount,
  subtitle,
  icon,
  surfaceClassName,
  iconClassName,
  labelClassName,
  amountClassName,
  subtitleClassName,
  onClick,
}: PlannerCalendarSummaryTileProps) {
  const IconComponent = TILE_ICONS[icon];
  const Component = onClick ? "button" : "article";

  return (
    <Component
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        surfaceClassName,
        SEPARATED_SURFACE,
        PLANNER_CALENDAR_SUMMARY_TILE,
        onClick &&
          "cursor-pointer text-left transition-transform active:scale-[0.99]",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <IconComponent
          className={cn("shrink-0", iconClassName, PLANNER_CALENDAR_SUMMARY_ICON)}
        />
        <p
          className={cn(
            PLANNER_CALENDAR_SUMMARY_AMOUNT,
            amountClassName ?? "text-white",
          )}
        >
          {amount}
        </p>
      </div>

      <div className="mt-3 min-w-0">
        <p
          className={cn(
            PLANNER_CALENDAR_SUMMARY_LABEL,
            labelClassName ?? "text-white/85",
          )}
        >
          {label}
        </p>
        <p
          className={cn(
            PLANNER_CALENDAR_SUMMARY_SUBTITLE,
            subtitleClassName ?? "text-white/70",
          )}
        >
          {subtitle}
        </p>
      </div>
    </Component>
  );
}
