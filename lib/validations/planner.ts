import { getCurrentMonthKey, parseMonthKey } from "@/lib/planner/calendar";
import { parsePlannedItemsFilters } from "@/lib/validations/planned-items-manage";
import type { PlannerTab } from "@/types/planner";
import { plannerTabToLayout } from "@/types/planner";

function parsePlannerTab(
  searchParams: Record<string, string | string[] | undefined>,
): PlannerTab {
  const rawTab = searchParams.tab;
  const tabValue = Array.isArray(rawTab) ? rawTab[0]?.trim() : rawTab?.trim();

  if (tabValue === "cards" || tabValue === "table" || tabValue === "calendar") {
    return tabValue;
  }

  if (tabValue === "manage") {
    const rawLayout = searchParams.layout;
    const layoutValue = Array.isArray(rawLayout)
      ? rawLayout[0]?.trim()
      : rawLayout?.trim();

    return layoutValue === "table" ? "table" : "cards";
  }

  return "calendar";
}

export function parsePlannerSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): {
  monthKey: string;
  tab: PlannerTab;
  layout: ReturnType<typeof plannerTabToLayout>;
  filters: ReturnType<typeof parsePlannedItemsFilters>;
} {
  const rawMonth = searchParams.month;
  const monthValue = Array.isArray(rawMonth)
    ? rawMonth[0]?.trim()
    : rawMonth?.trim();
  const tab = parsePlannerTab(searchParams);
  const filters = parsePlannedItemsFilters(searchParams);

  if (monthValue && parseMonthKey(monthValue)) {
    return {
      monthKey: monthValue,
      tab,
      layout: plannerTabToLayout(tab),
      filters,
    };
  }

  return {
    monthKey: getCurrentMonthKey(),
    tab,
    layout: plannerTabToLayout(tab),
    filters,
  };
}
