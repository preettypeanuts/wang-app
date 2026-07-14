import { unstable_cache } from "next/cache";

import type { PrismaClient, Wallet } from "@/generated/prisma/client";
import {
  revalidateAfterTransactionMutation,
  revalidateUserWallets,
} from "@/lib/cache/revalidate-user-data";
import { userDataTags } from "@/lib/cache/user-data-tags";
import { prisma } from "@/lib/db/prisma";
import { flowTransactionTypesWhere } from "@/lib/db/transaction-flow-filter";
import { scopedByUser, scopedId } from "@/lib/db/user-scope";
import type { WalletFormInput, WalletRecord } from "@/types/wallet";

export const DEFAULT_WALLET_NAME = "Dompet Utama";

export class WalletArchiveBlockedError extends Error {
  readonly reason = "is_default" as const;

  constructor() {
    super(
      "Wallet ini sedang jadi default. Pilih wallet lain sebagai default dulu sebelum mengarsipkan wallet ini.",
    );
    this.name = "WalletArchiveBlockedError";
  }
}

function mapWallet(record: Wallet): WalletRecord {
  return {
    id: record.id,
    name: record.name,
    type: record.type,
    icon: record.icon,
    colorHex: record.colorHex,
    initialBalance: record.initialBalance,
    isDefault: record.isDefault,
    isArchived: record.isArchived,
    createdAt: record.createdAt.toISOString(),
  };
}

async function queryWallets(userId: string): Promise<WalletRecord[]> {
  const records = await prisma.wallet.findMany({
    where: { userId, isArchived: false },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  });

  return records.map(mapWallet);
}

/** Active (non-archived) wallets — archived ones stay referenced by old transactions but hidden from pickers. */
export async function listWallets(userId: string): Promise<WalletRecord[]> {
  return unstable_cache(() => queryWallets(userId), ["wallets", userId], {
    tags: [userDataTags.wallets(userId)],
  })();
}

/**
 * Picker list: active wallets plus one archived wallet when it is still tied
 * to the transaction being edited.
 */
export async function listWalletsForPicker(
  userId: string,
  includeArchivedWalletId?: string | null,
): Promise<WalletRecord[]> {
  const active = await listWallets(userId);

  if (!includeArchivedWalletId) {
    return active;
  }

  if (active.some((wallet) => wallet.id === includeArchivedWalletId)) {
    return active;
  }

  const archived = await prisma.wallet.findFirst({
    where: {
      id: includeArchivedWalletId,
      userId,
      isArchived: true,
    },
  });

  if (!archived) {
    return active;
  }

  return [...active, mapWallet(archived)];
}

export async function createWallet(
  userId: string,
  input: WalletFormInput,
): Promise<WalletRecord> {
  const activeCount = await prisma.wallet.count({
    where: { userId, isArchived: false },
  });
  const isFirstWallet = activeCount === 0;

  const record = await prisma.wallet.create({
    data: {
      userId,
      name: input.name,
      type: input.type,
      initialBalance: input.initialBalance,
      isDefault: isFirstWallet,
    },
  });

  if (isFirstWallet) {
    await prisma.user.updateMany({
      where: { id: userId, defaultWalletId: null },
      data: { defaultWalletId: record.id },
    });
  }

  revalidateUserWallets(userId);
  return mapWallet(record);
}

export async function updateWallet(
  userId: string,
  id: string,
  input: WalletFormInput,
): Promise<WalletRecord> {
  const updated = await prisma.wallet.updateMany({
    where: scopedId(userId, id),
    data: {
      name: input.name,
      type: input.type,
      initialBalance: input.initialBalance,
    },
  });

  if (updated.count === 0) {
    throw new Error("Wallet tidak ditemukan.");
  }

  const record = await prisma.wallet.findFirstOrThrow({
    where: scopedId(userId, id),
  });

  revalidateUserWallets(userId);
  return mapWallet(record);
}

/** Marks one wallet as the chat/inbox fallback — user must choose explicitly. */
export async function setDefaultWallet(
  userId: string,
  walletId: string,
): Promise<WalletRecord> {
  const wallet = await prisma.wallet.findFirst({
    where: { id: walletId, userId, isArchived: false },
  });

  if (!wallet) {
    throw new Error("Wallet tidak ditemukan.");
  }

  await syncDefaultWalletPointers(prisma, userId, wallet.id);

  revalidateUserWallets(userId);
  return mapWallet({ ...wallet, isDefault: true });
}

/** Soft delete — old transactions keep their walletId, wallet just disappears from pickers. */
export async function archiveWallet(userId: string, id: string): Promise<void> {
  const [wallet, user] = await Promise.all([
    prisma.wallet.findFirst({
      where: scopedId(userId, id),
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { defaultWalletId: true },
    }),
  ]);

  if (!wallet || wallet.isArchived) {
    throw new Error("Wallet tidak ditemukan.");
  }

  if (user?.defaultWalletId === wallet.id) {
    throw new WalletArchiveBlockedError();
  }

  const activeCount = await prisma.wallet.count({
    where: { userId, isArchived: false },
  });

  if (activeCount <= 1) {
    throw new Error("Minimal harus ada satu wallet aktif.");
  }

  await prisma.wallet.update({
    where: { id: wallet.id },
    data: { isArchived: true, isDefault: false },
  });

  revalidateUserWallets(userId);
}

/**
 * Wallet used when chat input does not mention one. Self-heals to the
 * isDefault / oldest active wallet when unset or pointing at an archived one.
 */
export async function getDefaultWalletId(
  userId: string,
): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      defaultWalletId: true,
      defaultWallet: { select: { isArchived: true } },
    },
  });

  if (user?.defaultWalletId && user.defaultWallet?.isArchived === false) {
    return user.defaultWalletId;
  }

  const fallback = await prisma.wallet.findFirst({
    where: { userId, isArchived: false },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
    select: { id: true },
  });

  if (!fallback) {
    return null;
  }

  await syncDefaultWalletPointers(prisma, userId, fallback.id);

  return fallback.id;
}

async function syncDefaultWalletPointers(
  client: PrismaClient,
  userId: string,
  walletId: string,
): Promise<void> {
  await client.$transaction([
    client.wallet.updateMany({
      where: { userId, isArchived: false },
      data: { isDefault: false },
    }),
    client.wallet.updateMany({
      where: { id: walletId, userId },
      data: { isDefault: true },
    }),
    client.user.updateMany({
      where: { id: userId },
      data: { defaultWalletId: walletId },
    }),
  ]);
}

/**
 * Safety net: auto-create "Dompet Utama" when the user has no active wallet.
 * Silent fallback for chat/receipt before the user opens the wallets page.
 */
export async function ensureDefaultWalletForClient(
  client: PrismaClient,
  userId: string,
): Promise<Wallet> {
  const existing = await client.wallet.findFirst({
    where: { userId, isArchived: false },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  });

  if (existing) {
    if (existing.isDefault) {
      await client.user.updateMany({
        where: { id: userId, defaultWalletId: null },
        data: { defaultWalletId: existing.id },
      });
      return existing;
    }

    await syncDefaultWalletPointers(client, userId, existing.id);
    return { ...existing, isDefault: true };
  }

  const created = await client.wallet.create({
    data: {
      userId,
      name: DEFAULT_WALLET_NAME,
      type: "cash",
      isDefault: true,
    },
  });

  await client.user.updateMany({
    where: { id: userId, defaultWalletId: null },
    data: { defaultWalletId: created.id },
  });

  return created;
}

export async function ensureDefaultWallet(userId: string): Promise<Wallet> {
  const wallet = await ensureDefaultWalletForClient(prisma, userId);
  revalidateUserWallets(userId);
  return wallet;
}

export async function userHasWallet(userId: string): Promise<boolean> {
  const count = await prisma.wallet.count({
    where: { userId, isArchived: false },
  });

  return count > 0;
}

/** Income/expense rows still missing walletId (pre-wallet feature data). */
export async function countUnassignedFlowTransactions(
  userId: string,
): Promise<number> {
  return prisma.transaction.count({
    where: scopedByUser(userId, {
      walletId: null,
      ...flowTransactionTypesWhere(),
    }),
  });
}

/** One-time style backfill — assigns legacy flow rows to the user's default wallet. */
export async function assignUnassignedTransactionsToDefaultWallet(
  userId: string,
): Promise<number> {
  let defaultWalletId = await getDefaultWalletId(userId);

  if (!defaultWalletId) {
    const wallet = await ensureDefaultWallet(userId);
    defaultWalletId = wallet.id;
  }

  const updated = await prisma.transaction.updateMany({
    where: scopedByUser(userId, {
      walletId: null,
      ...flowTransactionTypesWhere(),
    }),
    data: { walletId: defaultWalletId },
  });

  revalidateAfterTransactionMutation(userId);
  revalidateUserWallets(userId);
  return updated.count;
}
