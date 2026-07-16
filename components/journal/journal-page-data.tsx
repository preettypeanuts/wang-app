import { JournalPageContent } from "@/components/journal/journal-page-content";
import { requireUserId } from "@/lib/auth/session";
import { getJournalFilteredSummary } from "@/lib/db/journal-summary";
import {
  getJournalCategoryExpenseBreakdown,
  listJournalTransactions,
} from "@/lib/db/journal";
import {
  getWalletBalances,
  queryWalletBalances,
} from "@/lib/db/wallet-balance";
import {
  ensureLegacyWalletTransactionsAssigned,
  getDefaultWalletId,
} from "@/lib/db/wallets";
import { resolveUserCategoryCatalog } from "@/lib/finance/resolve-user-categories";
import { reconcileStaleTransactionCategories } from "@/lib/db/reconcile-transaction-categories";
import { parseJournalSearchParams } from "@/lib/validations/journal";

interface JournalPageDataProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function JournalPageData({ searchParams }: JournalPageDataProps) {
  const userId = await requireUserId();
  const params = await searchParams;
  const catalog = await resolveUserCategoryCatalog(userId);
  await reconcileStaleTransactionCategories(userId);
  const filters = parseJournalSearchParams(params, catalog);
  const assigned = await ensureLegacyWalletTransactionsAssigned(userId);
  const [result, daySummary, categoryBreakdown, wallets, defaultWalletId] =
    await Promise.all([
      listJournalTransactions(userId, filters),
      getJournalFilteredSummary(userId, filters),
      getJournalCategoryExpenseBreakdown(userId, filters),
      assigned > 0 ? queryWalletBalances(userId) : getWalletBalances(userId),
      getDefaultWalletId(userId),
    ]);

  const defaultWallet =
    wallets.find((wallet) => wallet.id === defaultWalletId) ?? wallets[0] ?? null;

  return (
    <JournalPageContent
      categoryBreakdown={categoryBreakdown}
      daySummary={daySummary}
      filters={filters}
      result={result}
      defaultWallet={defaultWallet}
      walletOptions={wallets.map((wallet) => ({
        id: wallet.id,
        name: wallet.name,
      }))}
    />
  );
}
