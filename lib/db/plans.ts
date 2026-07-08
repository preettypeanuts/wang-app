import { invalidatePlansInsightCache } from "@/lib/db/ai-insight-cache";
import { prisma } from "@/lib/db/prisma";
import { scopedId } from "@/lib/db/user-scope";
import { recordPlanPurchase } from "@/lib/finance/record-plan-purchase";
import { userDataTags } from "@/lib/cache/user-data-tags";
import {
  revalidateUserPlans,
} from "@/lib/cache/revalidate-user-data";
import { unstable_cache } from "next/cache";
import type { PlanFormInput, PlanRecord, PlanStatus } from "@/types/plan";
import type { Plan, PlanStatus as PrismaPlanStatus } from "@/generated/prisma/client";

function mapPlan(record: Plan): PlanRecord {
  return {
    id: record.id,
    name: record.name,
    amount: record.amount,
    category: record.category,
    status: record.status as PlanStatus,
    note: record.note,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

async function queryPlans(userId: string): Promise<PlanRecord[]> {
  const records = await prisma.plan.findMany({
    where: { userId },
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
  });

  return records.map(mapPlan);
}

export async function listPlans(userId: string): Promise<PlanRecord[]> {
  return unstable_cache(
    () => queryPlans(userId),
    ["plans", userId],
    { tags: [userDataTags.plans(userId)] },
  )();
}

export async function listActivePlans(userId: string): Promise<PlanRecord[]> {
  const plans = await listPlans(userId);
  return plans.filter((plan) => plan.status === "active");
}

export async function createPlan(
  userId: string,
  input: PlanFormInput,
): Promise<PlanRecord> {
  const record = await prisma.plan.create({
    data: {
      userId,
      name: input.name,
      amount: input.amount,
      category: input.category,
      status: input.status as PrismaPlanStatus,
      note: input.note?.trim() || null,
    },
  });

  const plan = mapPlan(record);

  if (input.status === "done") {
    await recordPlanPurchase(userId, plan);
  }

  await invalidatePlansInsightCache(userId);
  revalidateUserPlans(userId);

  return plan;
}

export async function updatePlan(
  userId: string,
  id: string,
  input: PlanFormInput,
): Promise<PlanRecord> {
  const existing = await prisma.plan.findFirst({
    where: scopedId(userId, id),
  });

  if (!existing) {
    throw new Error("Wish tidak ditemukan.");
  }

  const updated = await prisma.plan.updateMany({
    where: scopedId(userId, id),
    data: {
      name: input.name,
      amount: input.amount,
      category: input.category,
      status: input.status as PrismaPlanStatus,
      note: input.note?.trim() || null,
    },
  });

  if (updated.count === 0) {
    throw new Error("Wish tidak ditemukan.");
  }

  const record = await prisma.plan.findFirstOrThrow({
    where: scopedId(userId, id),
  });

  const plan = mapPlan(record);

  if (existing.status === "active" && input.status === "done") {
    await recordPlanPurchase(userId, plan);
  }

  await invalidatePlansInsightCache(userId);
  revalidateUserPlans(userId);

  return plan;
}

export async function deletePlan(userId: string, id: string): Promise<void> {
  const deleted = await prisma.plan.deleteMany({
    where: scopedId(userId, id),
  });

  if (deleted.count === 0) {
    throw new Error("Wish tidak ditemukan.");
  }

  await invalidatePlansInsightCache(userId);
  revalidateUserPlans(userId);
}

export async function markPlanDone(
  userId: string,
  id: string,
): Promise<PlanRecord> {
  const existing = await prisma.plan.findFirst({
    where: scopedId(userId, id),
  });

  if (!existing) {
    throw new Error("Wish tidak ditemukan.");
  }

  if (existing.status === "done") {
    return mapPlan(existing);
  }

  const updated = await prisma.plan.updateMany({
    where: scopedId(userId, id),
    data: { status: "done" },
  });

  if (updated.count === 0) {
    throw new Error("Wish tidak ditemukan.");
  }

  const record = await prisma.plan.findFirstOrThrow({
    where: scopedId(userId, id),
  });

  const plan = mapPlan(record);
  await recordPlanPurchase(userId, plan);
  await invalidatePlansInsightCache(userId);
  revalidateUserPlans(userId);

  return plan;
}
