import { InboxClientShell } from "@/components/inbox/inbox-client-shell";
import { InboxPageShell } from "@/components/inbox/inbox-page-shell";
import { requireUserId } from "@/lib/auth/session";
import { getAvailableBalance } from "@/lib/db/balance";
import { getInboxMessagesPage } from "@/lib/db/inbox-messages";
import { getTodaySummary } from "@/lib/db/transactions";
import { getDefaultWalletId, listWallets } from "@/lib/db/wallets";

export async function InboxPageData() {
  const userId = await requireUserId();
  const [messagesPage, summary, availableBalance, wallets, defaultWalletId] =
    await Promise.all([
      getInboxMessagesPage(userId),
      getTodaySummary(userId),
      getAvailableBalance(userId),
      listWallets(userId),
      getDefaultWalletId(userId),
    ]);

  return (
    <InboxPageShell>
      <InboxClientShell
        initialBootstrap={{
          messages: messagesPage.messages,
          hasMoreMessages: messagesPage.hasMore,
          summary,
          availableBalance,
        }}
        defaultWalletId={defaultWalletId}
        walletOptions={wallets.map((wallet) => ({
          id: wallet.id,
          name: wallet.name,
        }))}
      />
    </InboxPageShell>
  );
}
