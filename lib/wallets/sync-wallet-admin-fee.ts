import { revalidateUserPlannedItems } from "@/lib/cache/revalidate-user-data";
import { prisma } from "@/lib/db/prisma";
import { scopedId } from "@/lib/db/user-scope";
import {
  buildWalletAdminFeePlanName,
  buildWalletAdminFeePlanNote,
  buildWalletAdminFeeStartAt,
  isValidWalletAdminFeeDay,
} from "@/lib/wallets/wallet-admin-fee";
import type { WalletAdminFeeInput, WalletType } from "@/types/wallet";

interface SyncWalletAdminFeeInput {
  walletId: string;
  walletName: string;
  walletType: WalletType;
  adminFee: WalletAdminFeeInput | null;
}

function isAdminFeeActive(
  walletType: WalletType,
  adminFee: WalletAdminFeeInput | null,
): adminFee is WalletAdminFeeInput {
  return (
    walletType === "bank" &&
    adminFee?.enabled === true &&
    adminFee.amount > 0 &&
    isValidWalletAdminFeeDay(adminFee.day)
  );
}

async function clearWalletAdminFee(
  userId: string,
  walletId: string,
): Promise<void> {
  await prisma.$transaction([
    prisma.plannedItem.deleteMany({
      where: { userId, walletId },
    }),
    prisma.wallet.updateMany({
      where: scopedId(userId, walletId),
      data: {
        adminFeeAmount: null,
        adminFeeDay: null,
      },
    }),
  ]);
}

async function upsertWalletAdminFeePlan(
  userId: string,
  input: SyncWalletAdminFeeInput,
): Promise<void> {
  const adminFee = input.adminFee;
  if (!adminFee) {
    return;
  }

  const startAt = buildWalletAdminFeeStartAt(adminFee.day);
  const existing = await prisma.plannedItem.findFirst({
    where: { userId, walletId: input.walletId },
    select: {
      id: true,
      paidInstallmentCount: true,
    },
  });

  if (existing) {
    await prisma.$transaction([
      prisma.plannedItem.update({
        where: { id: existing.id },
        data: {
          name: buildWalletAdminFeePlanName(input.walletName),
          amount: adminFee.amount,
          startAt,
          note: buildWalletAdminFeePlanNote(input.walletId),
          category: "fees",
          kind: "bill",
          repeat: "monthly",
          flowType: "expense",
        },
      }),
      prisma.wallet.updateMany({
        where: scopedId(userId, input.walletId),
        data: {
          adminFeeAmount: adminFee.amount,
          adminFeeDay: adminFee.day,
        },
      }),
    ]);
    return;
  }

  await prisma.$transaction([
    prisma.plannedItem.create({
      data: {
        userId,
        walletId: input.walletId,
        name: buildWalletAdminFeePlanName(input.walletName),
        kind: "bill",
        repeat: "monthly",
        amount: adminFee.amount,
        flowType: "expense",
        category: "fees",
        startAt,
        note: buildWalletAdminFeePlanNote(input.walletId),
      },
    }),
    prisma.wallet.updateMany({
      where: scopedId(userId, input.walletId),
      data: {
        adminFeeAmount: adminFee.amount,
        adminFeeDay: adminFee.day,
      },
    }),
  ]);
}

/** Keeps PayPlan in sync with bank wallet admin fee settings. */
export async function syncWalletAdminFee(
  userId: string,
  input: SyncWalletAdminFeeInput,
): Promise<void> {
  if (!isAdminFeeActive(input.walletType, input.adminFee)) {
    await clearWalletAdminFee(userId, input.walletId);
    revalidateUserPlannedItems(userId);
    return;
  }

  await upsertWalletAdminFeePlan(userId, input);
  revalidateUserPlannedItems(userId);
}

export async function removeWalletAdminFeeOnArchive(
  userId: string,
  walletId: string,
): Promise<void> {
  await clearWalletAdminFee(userId, walletId);
  revalidateUserPlannedItems(userId);
}
