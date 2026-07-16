import {
  revalidateAfterTransactionMutation,
  revalidateUserPlannedItems,
  revalidateUserWallets,
} from "@/lib/cache/revalidate-user-data";
import { markInstallmentPaid } from "@/lib/db/planned-items";
import { prisma } from "@/lib/db/prisma";
import { getDateOnlyParts, startOfDay } from "@/lib/finance/day-range";
import { syncWalletAdminFee } from "@/lib/wallets/sync-wallet-admin-fee";
import type { PlannedItemRecord } from "@/types/planner";

function mapWalletAdminFeePlan(record: {
  id: string;
  name: string;
  kind: PlannedItemRecord["kind"];
  repeat: PlannedItemRecord["repeat"];
  amount: number;
  flowType: PlannedItemRecord["flowType"];
  category: string;
  startAt: Date;
  endAt: Date | null;
  installmentCount: number | null;
  paidInstallmentCount: number;
  note: string | null;
  walletId: string | null;
}): PlannedItemRecord {
  return {
    id: record.id,
    name: record.name,
    kind: record.kind,
    repeat: record.repeat,
    amount: record.amount,
    flowType: record.flowType,
    category: record.category,
    startAt: record.startAt,
    endAt: record.endAt,
    installmentCount: record.installmentCount,
    paidInstallmentCount: record.paidInstallmentCount,
    note: record.note,
    walletId: record.walletId,
  };
}

async function processWalletAdminFee(
  userId: string,
  wallet: {
    id: string;
    adminFeeDay: number;
    adminFeePlan: {
      id: string;
      name: string;
      kind: PlannedItemRecord["kind"];
      repeat: PlannedItemRecord["repeat"];
      amount: number;
      flowType: PlannedItemRecord["flowType"];
      category: string;
      startAt: Date;
      endAt: Date | null;
      installmentCount: number | null;
      paidInstallmentCount: number;
      note: string | null;
      walletId: string | null;
    } | null;
  },
  referenceDate: Date,
): Promise<boolean> {
  if (!wallet.adminFeePlan) {
    return false;
  }

  const dayOfMonth = getDateOnlyParts(referenceDate).day;
  if (dayOfMonth !== wallet.adminFeeDay) {
    return false;
  }

  const item = mapWalletAdminFeePlan(wallet.adminFeePlan);
  const installmentIndex = findInstallmentIndexDueOn(item, referenceDate);

  if (installmentIndex === null) {
    return false;
  }

  if (installmentIndex < item.paidInstallmentCount) {
    return false;
  }

  await markInstallmentPaid(userId, item.id, installmentIndex);
  return true;
}

/** Auto-deduct bank admin fees due on referenceDate (WIB calendar day). */
export async function processWalletAdminFeesForUser(
  userId: string,
  referenceDate: Date = new Date(),
): Promise<number> {
  const today = startOfDay(referenceDate);
  const wallets = await prisma.wallet.findMany({
    where: {
      userId,
      isArchived: false,
      type: "bank",
      adminFeeAmount: { gt: 0 },
      adminFeeDay: { not: null },
    },
    select: {
      id: true,
      name: true,
      adminFeeDay: true,
      adminFeeAmount: true,
      adminFeePlan: {
        select: {
          id: true,
          name: true,
          kind: true,
          repeat: true,
          amount: true,
          flowType: true,
          category: true,
          startAt: true,
          endAt: true,
          installmentCount: true,
          paidInstallmentCount: true,
          note: true,
          walletId: true,
        },
      },
    },
  });

  let processed = 0;

  for (const wallet of wallets) {
    if (wallet.adminFeeDay === null || wallet.adminFeeAmount === null) {
      continue;
    }

    let adminFeePlan = wallet.adminFeePlan;

    if (!adminFeePlan) {
      await syncWalletAdminFee(userId, {
        walletId: wallet.id,
        walletName: wallet.name,
        walletType: "bank",
        adminFee: {
          enabled: true,
          amount: wallet.adminFeeAmount,
          day: wallet.adminFeeDay,
        },
      });

      adminFeePlan = await prisma.plannedItem.findFirst({
        where: { userId, walletId: wallet.id },
        select: {
          id: true,
          name: true,
          kind: true,
          repeat: true,
          amount: true,
          flowType: true,
          category: true,
          startAt: true,
          endAt: true,
          installmentCount: true,
          paidInstallmentCount: true,
          note: true,
          walletId: true,
        },
      });
    }

    const didProcess = await processWalletAdminFee(
      userId,
      {
        id: wallet.id,
        adminFeeDay: wallet.adminFeeDay,
        adminFeePlan,
      },
      today,
    );

    if (didProcess) {
      processed += 1;
    }
  }

  if (processed > 0) {
    revalidateAfterTransactionMutation(userId);
    revalidateUserPlannedItems(userId);
    revalidateUserWallets(userId);
  }

  return processed;
}

export async function processWalletAdminFeesForAllUsers(
  referenceDate: Date = new Date(),
): Promise<{ usersProcessed: number; feesProcessed: number }> {
  const users = await prisma.user.findMany({
    select: { id: true },
  });

  let feesProcessed = 0;

  for (const user of users) {
    feesProcessed += await processWalletAdminFeesForUser(user.id, referenceDate);
  }

  return {
    usersProcessed: users.length,
    feesProcessed,
  };
}
