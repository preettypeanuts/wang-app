import { parseJournalSearchParams } from "@/lib/validations/journal";
import type { JournalFilters } from "@/types/journal";

export function parseOverviewFilters(
  searchParams: Record<string, string | string[] | undefined>,
): JournalFilters {
  const parsed = parseJournalSearchParams(searchParams);

  return {
    ...parsed,
    q: "",
    page: 1,
  };
}
