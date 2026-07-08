"use server";

import { revalidatePath } from "next/cache";

import { requireUserId } from "@/lib/auth/session";
import { revalidateUserSavings } from "@/lib/cache/revalidate-user-data";
import {
  createSavingsGoal,
  deleteSavingsGoal,
  depositSavingsGoal,
  updateSavingsGoal,
  withdrawSavingsGoal,
} from "@/lib/db/savings-goals";
import { parseSavingsGoalFormData } from "@/lib/validations/savings-goal";
import type { SavingsGoalRecord } from "@/types/savings-goal";

interface SavingsActionSuccess {
  ok: true;
  goal: SavingsGoalRecord;
}

interface SavingsActionFailure {
  ok: false;
  error: string;
}

export type SavingsActionResult = SavingsActionSuccess | SavingsActionFailure;

function revalidateSavings(userId: string) {
  revalidateUserSavings(userId);
  revalidatePath("/plans");
  revalidatePath("/overview");
  revalidatePath("/");
}

export async function saveSavingsGoalAction(
  formData: FormData,
): Promise<SavingsActionResult> {
  const userId = await requireUserId();
  const parsed = parseSavingsGoalFormData(formData);

  if (!parsed.ok) {
    return parsed;
  }

  const id = formData.get("id");
  const goal =
    typeof id === "string" && id.trim()
      ? await updateSavingsGoal(userId, id.trim(), parsed.data)
      : await createSavingsGoal(userId, parsed.data);

  revalidateSavings(userId);

  return { ok: true, goal };
}

export async function deleteSavingsGoalAction(
  id: string,
): Promise<{ ok: true } | SavingsActionFailure> {
  const userId = await requireUserId();
  const trimmed = id.trim();

  if (!trimmed) {
    return { ok: false, error: "Tabungan tidak ditemukan." };
  }

  try {
    await deleteSavingsGoal(userId, trimmed);
    revalidateSavings(userId);
    return { ok: true };
  } catch {
    return { ok: false, error: "Gagal menghapus tabungan." };
  }
}

export async function depositSavingsGoalAction(
  id: string,
  amount: number,
): Promise<SavingsActionResult> {
  const userId = await requireUserId();

  try {
    const goal = await depositSavingsGoal(userId, id.trim(), amount);
    revalidateSavings(userId);
    return { ok: true, goal };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Gagal menyetor tabungan.",
    };
  }
}

export async function withdrawSavingsGoalAction(
  id: string,
  amount: number,
): Promise<SavingsActionResult> {
  const userId = await requireUserId();

  try {
    const goal = await withdrawSavingsGoal(userId, id.trim(), amount);
    revalidateSavings(userId);
    return { ok: true, goal };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Gagal menarik tabungan.",
    };
  }
}
