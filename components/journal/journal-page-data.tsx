import { JournalPageContent } from "@/components/journal/journal-page-content";
import { requireUserId } from "@/lib/auth/session";
import { getJournalFilteredSummary } from "@/lib/db/journal-summary";
import {
  getJournalCategoryExpenseBreakdown,
  listJournalTransactions,
} from "@/lib/db/journal";
import { parseJournalSearchParams } from "@/lib/validations/journal";

interface JournalPageDataProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function JournalPageData({ searchParams }: JournalPageDataProps) {
  const userId = await requireUserId();
  const params = await searchParams;
  const filters = parseJournalSearchParams(params);
  const [result, daySummary, categoryBreakdown] = await Promise.all([
    listJournalTransactions(userId, filters),
    getJournalFilteredSummary(userId, filters),
    getJournalCategoryExpenseBreakdown(userId, filters),
  ]);

  return (
    <JournalPageContent
      categoryBreakdown={categoryBreakdown}
      daySummary={daySummary}
      filters={filters}
      result={result}
    />
  );
}
