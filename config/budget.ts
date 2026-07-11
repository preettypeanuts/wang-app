import { GRID_GAP } from "@/config/spacing";
import type { BudgetPaceStatus } from "@/types/budget";
import type { PlanBudgetImpactStatus } from "@/types/plan";

export const BUDGET_CARD_GRID = `grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 ${GRID_GAP}`;

export const BUDGET_PROGRESS_TRACK =
  "h-2 overflow-hidden rounded-full bg-black/8 dark:bg-white/10";

export function getBudgetProgressColor(remainingPercent: number): string {
  if (remainingPercent <= 0) {
    return "bg-[#FF3B30]";
  }

  if (remainingPercent <= 20) {
    return "bg-[#FF9500]";
  }

  return "bg-[#34C759]";
}

export function getBudgetStatusBadge(remainingPercent: number): {
  label: string;
  className: string;
} {
  if (remainingPercent <= 0) {
    return {
      label: "Over budget",
      className:
        "bg-[#FF3B30]/14 text-[#FF3B30] ring-1 ring-[#FF3B30]/25 dark:bg-[#FF3B30]/18 dark:ring-[#FF3B30]/30",
    };
  }

  if (remainingPercent <= 20) {
    return {
      label: "Almost depleted",
      className:
        "bg-[#FF9500]/14 text-[#FF9500] ring-1 ring-[#FF9500]/25 dark:bg-[#FF9500]/18 dark:ring-[#FF9500]/30",
    };
  }

  return {
    label: "Safe",
    className:
      "bg-[#34C759]/14 text-[#34C759] ring-1 ring-[#34C759]/25 dark:bg-[#34C759]/18 dark:ring-[#34C759]/30",
  };
}

export function getBudgetPaceBadge(paceStatus: BudgetPaceStatus): {
  label: string;
  className: string;
} {
  if (paceStatus === "over") {
    return {
      label: "Over budget",
      className:
        "bg-[#FF3B30]/14 text-[#FF3B30] ring-1 ring-[#FF3B30]/25 dark:bg-[#FF3B30]/18 dark:ring-[#FF3B30]/30",
    };
  }

  if (paceStatus === "fast") {
    return {
      label: "Above pace",
      className:
        "bg-[#FF9500]/14 text-[#FF9500] ring-1 ring-[#FF9500]/25 dark:bg-[#FF9500]/18 dark:ring-[#FF9500]/30",
    };
  }

  if (paceStatus === "slow") {
    return {
      label: "Below pace",
      className:
        "bg-[#007AFF]/14 text-[#007AFF] ring-1 ring-[#007AFF]/25 dark:bg-[#007AFF]/18 dark:ring-[#007AFF]/30",
    };
  }

  if (paceStatus === "on_track") {
    return {
      label: "On pace",
      className:
        "bg-[#34C759]/14 text-[#34C759] ring-1 ring-[#34C759]/25 dark:bg-[#34C759]/18 dark:ring-[#34C759]/30",
    };
  }

  return {
    label: "No pace",
    className: "bg-black/6 text-muted-foreground dark:bg-white/10",
  };
}

export function getPlanBudgetImpactBadge(status: PlanBudgetImpactStatus): {
  label: string;
  className: string;
} {
  if (status === "over") {
    return {
      label: "Over budget",
      className:
        "bg-[#FF3B30]/14 text-[#FF3B30] ring-1 ring-[#FF3B30]/25 dark:bg-[#FF3B30]/18 dark:ring-[#FF3B30]/30",
    };
  }

  return {
    label: "Caution",
    className:
      "bg-[#FF9500]/14 text-[#FF9500] ring-1 ring-[#FF9500]/25 dark:bg-[#FF9500]/18 dark:ring-[#FF9500]/30",
  };
}

export const BUDGET_SUBTEXT = "text-[11px] text-muted-foreground";
