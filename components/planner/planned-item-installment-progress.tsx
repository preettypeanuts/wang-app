import {
  PLANNER_MANAGE_PROGRESS_FILL,
  PLANNER_MANAGE_PROGRESS_TRACK,
} from "@/config/planner-manage";
import type { InstallmentProgress } from "@/lib/planner/installment-progress";
import { cn } from "@/lib/utils";

interface PlannedItemInstallmentProgressBarProps {
  progress: InstallmentProgress;
  className?: string;
}

export function PlannedItemInstallmentProgressBar({
  progress,
  className,
}: PlannedItemInstallmentProgressBarProps) {
  const percent = Math.round(progress.ratio * 100);

  return (
    <div
      className={cn(PLANNER_MANAGE_PROGRESS_TRACK, className)}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={progress.total}
      aria-valuenow={progress.completed}
      aria-label={`Cicilan ${progress.completed} dari ${progress.total}`}
    >
      <div
        className={PLANNER_MANAGE_PROGRESS_FILL}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

export function formatInstallmentProgressLabel(
  progress: InstallmentProgress,
): string {
  return `${progress.completed}/${progress.total}`;
}
