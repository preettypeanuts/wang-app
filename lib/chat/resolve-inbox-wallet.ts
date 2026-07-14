import {
  ensureDefaultWallet,
  getDefaultWalletId,
  listWallets,
} from "@/lib/db/wallets";
import { detectWalletCandidates } from "@/lib/finance/detect-wallet-keyword";
import type { WalletRecord } from "@/types/wallet";

export interface InboxWalletResolution {
  /** Wallet assigned to the saved transactions (detected or user default). */
  walletId: string | null;
  /** Non-default wallet name to mention in the reply; null keeps it quiet. */
  mentionedWalletName: string | null;
  /** Two or more wallets tied for the mention — show quick-correct chips. */
  ambiguousCandidates: Array<{ id: string; name: string }>;
}

/** Detect an explicit wallet mention in chat text, falling back to the user's default wallet. */
export async function resolveInboxWallet(
  userId: string,
  text: string,
): Promise<InboxWalletResolution> {
  let wallets: WalletRecord[] = [];
  let defaultWalletId: string | null = null;

  try {
    await ensureDefaultWallet(userId);
    [wallets, defaultWalletId] = await Promise.all([
      listWallets(userId),
      getDefaultWalletId(userId),
    ]);
  } catch {
    // Wallet assignment is best-effort — recording the transaction matters more.
    return {
      walletId: null,
      mentionedWalletName: null,
      ambiguousCandidates: [],
    };
  }

  const candidates = detectWalletCandidates(text, wallets);
  const detected = candidates.length === 1 ? candidates[0] : null;

  return {
    walletId: detected?.id ?? defaultWalletId,
    mentionedWalletName:
      detected && detected.id !== defaultWalletId ? detected.name : null,
    ambiguousCandidates:
      candidates.length > 1
        ? candidates.map((wallet) => ({ id: wallet.id, name: wallet.name }))
        : [],
  };
}
