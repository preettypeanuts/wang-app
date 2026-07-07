import { JournalPageContent } from "@/components/journal/journal-page-content";
import { requireUserId } from "@/lib/auth/session";
import { getJournalDaySummary } from "@/lib/db/journal-summary";
import {
  getJournalCategoryExpenseBreakdown,
  listJournalTransactions,
} from "@/lib/db/journal";
import { parseJournalSearchParams } from "@/lib/validations/journal";

export const dynamic = "force-dynamic";

interface JournalPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function JournalPage({ searchParams }: JournalPageProps) {
  const userId = await requireUserId();
  const params = await searchParams;
  const filters = parseJournalSearchParams(params);
  const [result, daySummary, categoryBreakdown] = await Promise.all([
    listJournalTransactions(userId, filters),
    getJournalDaySummary(userId),
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
