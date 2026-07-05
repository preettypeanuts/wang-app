import {
  PLANNER_CALENDAR_EVENT_BAR,
  PLANNER_CALENDAR_EVENT_BAR_INCOME,
} from "@/config/planner-calendar";
import { formatJournalTime } from "@/lib/finance/format-datetime";
import { cn } from "@/lib/utils";

interface PlannerCalendarEventProps {
  title: string;
  dueAt: Date;
  color: string;
  type: "income" | "expense";
}

export function PlannerCalendarEvent({
  title,
  dueAt,
  color,
  type,
}: PlannerCalendarEventProps) {
  const time = formatJournalTime(dueAt);
  const isIncome = type === "income";

  return (
    <div
      className={cn(
        PLANNER_CALENDAR_EVENT_BAR,
        isIncome && PLANNER_CALENDAR_EVENT_BAR_INCOME,
        "min-w-0",
      )}
      title={title}
    >
      <span
        className="w-[3px] shrink-0 self-stretch rounded-full"
        style={{ backgroundColor: color }}
      />
      <span
        className={cn(
          "min-w-0 flex-1 truncate",
          isIncome ? "font-medium text-[#1B7A34] dark:text-[#5AE37A]" : "text-foreground/85",
        )}
      >
        {isIncome ? `+ ${title}` : title}
      </span>
      {!isIncome ? (
        <span className="hidden shrink-0 tabular-nums text-muted-foreground/70 sm:inline">
          {time}
        </span>
      ) : null}
    </div>
  );
}
