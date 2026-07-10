import {
  normalizeCategory,
  resolveCategoryForType,
  type TransactionCategoryId,
} from "@/config/categories";
import { prisma } from "@/lib/db/prisma";
import { createTransaction } from "@/lib/db/transactions";
import { scopedByUser } from "@/lib/db/user-scope";
import { getDueDateForInstallmentIndex } from "@/lib/planner/installment-progress";
import type { PlannedItemRecord } from "@/types/planner";

function payplanPaymentMarker(
  plannedItemId: string,
  installmentIndex: number,
): string {
  return `[payplan:${plannedItemId}:${installmentIndex}]`;
}

export function buildPlannedItemPaymentRawInput(
  item: PlannedItemRecord,
  installmentIndex: number,
): string {
  return `Bayar ${item.name} ${payplanPaymentMarker(item.id, installmentIndex)}`;
}

export async function hasPlannedItemPaymentTransaction(
  userId: string,
  plannedItemId: string,
  installmentIndex: number,
): Promise<boolean> {
  const marker = payplanPaymentMarker(plannedItemId, installmentIndex);
  const count = await prisma.transaction.count({
    where: scopedByUser(userId, {
      rawInput: { contains: marker },
    }),
  });

  return count > 0;
}

/** Records PayPlan payment as journal transaction — skips if already recorded. */
export async function recordPlannedItemPayment(
  userId: string,
  item: PlannedItemRecord,
  installmentIndex: number,
): Promise<boolean> {
  if (item.flowType !== "expense") {
    return false;
  }

  if (
    await hasPlannedItemPaymentTransaction(userId, item.id, installmentIndex)
  ) {
    return false;
  }

  const category = resolveCategoryForType(
    normalizeCategory(item.category),
    "expense",
  ) as TransactionCategoryId;
  const dueAt = getDueDateForInstallmentIndex(item, installmentIndex);

  await createTransaction({
    userId,
    rawInput: buildPlannedItemPaymentRawInput(item, installmentIndex),
    transaction: {
      type: "expense",
      amount: item.amount,
      category,
      description: item.name,
      occurredAt: dueAt.toISOString(),
    },
  });

  return true;
}
