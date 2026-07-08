"use server";

import { revalidatePath } from "next/cache";

import { requireUserId } from "@/lib/auth/session";
import {
  revalidateUserPlans,
} from "@/lib/cache/revalidate-user-data";
import {
  createPlan,
  deletePlan,
  markPlanDone,
  updatePlan,
} from "@/lib/db/plans";
import { parsePlanFormData } from "@/lib/validations/plan";
import type { PlanRecord } from "@/types/plan";

interface PlanActionSuccess {
  ok: true;
  plan: PlanRecord;
}

interface PlanActionFailure {
  ok: false;
  error: string;
}

export type PlanActionResult = PlanActionSuccess | PlanActionFailure;

function revalidatePlans(userId: string) {
  revalidateUserPlans(userId);
  revalidatePath("/plans");
  revalidatePath("/overview");
  revalidatePath("/journal");
}

export async function savePlanAction(
  formData: FormData,
): Promise<PlanActionResult> {
  const userId = await requireUserId();
  const parsed = parsePlanFormData(formData);

  if (!parsed.ok) {
    return parsed;
  }

  const id = formData.get("id");
  const plan =
    typeof id === "string" && id.trim()
      ? await updatePlan(userId, id.trim(), parsed.data)
      : await createPlan(userId, parsed.data);

  revalidatePlans(userId);

  return { ok: true, plan };
}

export async function deletePlanAction(
  id: string,
): Promise<{ ok: true } | PlanActionFailure> {
  const userId = await requireUserId();
  const trimmed = id.trim();

  if (!trimmed) {
    return { ok: false, error: "Wish tidak ditemukan." };
  }

  try {
    await deletePlan(userId, trimmed);
    revalidatePlans(userId);
    return { ok: true };
  } catch {
    return { ok: false, error: "Gagal menghapus wish." };
  }
}

export async function markPlanPurchasedAction(
  id: string,
): Promise<PlanActionResult> {
  const userId = await requireUserId();
  const trimmed = id.trim();

  if (!trimmed) {
    return { ok: false, error: "Wish tidak ditemukan." };
  }

  try {
    const plan = await markPlanDone(userId, trimmed);
    revalidatePlans(userId);
    return { ok: true, plan };
  } catch {
    return { ok: false, error: "Gagal menandai wish sudah dibeli." };
  }
}
