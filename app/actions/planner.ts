"use server";

import { revalidatePath } from "next/cache";

import { normalizeCategory } from "@/config/categories";
import { requireUserId } from "@/lib/auth/session";
import {
  revalidateAfterTransactionMutation,
  revalidateUserPlannedItems,
} from "@/lib/cache/revalidate-user-data";
import {
  createPlannedItem,
  deletePlannedItem,
  markInstallmentPaid,
  updatePlannedItem,
} from "@/lib/db/planned-items";
import { prisma } from "@/lib/db/prisma";
import { toDayKey } from "@/lib/finance/day-range";
import type { RecurringSuggestion } from "@/lib/finance/detect-recurring-transaction";
import { extractCategoryKeyword } from "@/lib/finance/extract-category-keyword";
import { parsePlannedItemFormData } from "@/lib/validations/planned-item";
import type { PlannedItemRecord } from "@/types/planner";

interface PlannedItemActionSuccess {
  ok: true;
  item: PlannedItemRecord;
}

interface PlannedItemActionFailure {
  ok: false;
  error: string;
}

export type PlannedItemActionResult =
  | PlannedItemActionSuccess
  | PlannedItemActionFailure;

function revalidatePayPlan(userId: string) {
  revalidateUserPlannedItems(userId);
  revalidatePath("/payplan");
}

function revalidatePayPlanPayment(userId: string) {
  revalidatePayPlan(userId);
  revalidateAfterTransactionMutation(userId);
  revalidatePath("/journal");
  revalidatePath("/overview");
}

function startAtNextMonth(fromIso: string): string {
  const base = new Date(fromIso);
  const date = Number.isNaN(base.getTime()) ? new Date() : base;
  const next = new Date(date);
  next.setMonth(next.getMonth() + 1);
  return toDayKey(next);
}

export async function savePlannedItemAction(
  formData: FormData,
): Promise<PlannedItemActionResult> {
  const userId = await requireUserId();
  const parsed = parsePlannedItemFormData(formData);

  if (!parsed.ok) {
    return parsed;
  }

  const id = formData.get("id");
  const item =
    typeof id === "string" && id.trim()
      ? await updatePlannedItem(userId, id.trim(), parsed.data)
      : await createPlannedItem(userId, parsed.data);

  revalidatePayPlan(userId);

  return { ok: true, item };
}

export async function markInstallmentPaidAction(
  plannedItemId: string,
  installmentIndex: number,
): Promise<{ ok: true; paidCount: number } | PlannedItemActionFailure> {
  const userId = await requireUserId();
  const trimmed = plannedItemId.trim();

  if (!trimmed || !Number.isInteger(installmentIndex) || installmentIndex < 0) {
    return { ok: false, error: "Data cicilan tidak valid." };
  }

  try {
    const item = await markInstallmentPaid(userId, trimmed, installmentIndex);
    revalidatePayPlanPayment(userId);
    return { ok: true, paidCount: item.paidInstallmentCount };
  } catch {
    return { ok: false, error: "Gagal menandai cicilan." };
  }
}

export async function deletePlannedItemAction(
  id: string,
): Promise<{ ok: true } | PlannedItemActionFailure> {
  const userId = await requireUserId();
  const trimmed = id.trim();

  if (!trimmed) {
    return { ok: false, error: "Item tidak ditemukan." };
  }

  try {
    await deletePlannedItem(userId, trimmed);
    revalidatePayPlan(userId);
    return { ok: true };
  } catch {
    return { ok: false, error: "Gagal menghapus item." };
  }
}

export async function createPlannedItemFromSuggestionAction(input: {
  suggestion: RecurringSuggestion;
  lastOccurredAt: string;
}): Promise<PlannedItemActionResult> {
  const userId = await requireUserId();
  const { suggestion, lastOccurredAt } = input;
  const keyword = suggestion.keyword?.trim().toLowerCase();

  if (!keyword || suggestion.averageAmount <= 0) {
    return { ok: false, error: "Saran jadwal tidak valid." };
  }

  const kind = suggestion.flowType === "income" ? "income" : "subscription";
  const displayName = keyword.charAt(0).toUpperCase() + keyword.slice(1);

  try {
    const item = await createPlannedItem(userId, {
      name: displayName,
      kind,
      repeat: suggestion.suggestedRepeat,
      amount: suggestion.averageAmount,
      startAt: startAtNextMonth(lastOccurredAt),
      endMode: "never",
      category: normalizeCategory(suggestion.category),
      flowType: suggestion.flowType,
      note: `Dari pola berulang chat (${suggestion.matchCount}x)`,
    });

    revalidatePayPlan(userId);
    return { ok: true, item };
  } catch {
    return { ok: false, error: "Gagal menjadwalkan di PayPlan." };
  }
}

export async function dismissRecurringSuggestionAction(
  keyword: string,
): Promise<{ ok: true } | PlannedItemActionFailure> {
  const userId = await requireUserId();
  const normalized =
    extractCategoryKeyword(keyword) || keyword.trim().toLowerCase();

  if (!normalized) {
    return { ok: false, error: "Keyword tidak valid." };
  }

  try {
    await prisma.recurringSuggestionDismissal.upsert({
      where: {
        userId_keyword: { userId, keyword: normalized },
      },
      create: { userId, keyword: normalized },
      update: {},
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "Gagal menyimpan penolakan." };
  }
}
