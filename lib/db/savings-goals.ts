import { getAvailableBalance } from "@/lib/db/balance";
import { prisma } from "@/lib/db/prisma";
import { scopedId } from "@/lib/db/user-scope";
import { formatIdr } from "@/lib/finance/format-currency";
import type {
  SavingsGoalFormInput,
  SavingsGoalRecord,
  SavingsGoalStatus,
} from "@/types/savings-goal";
import type {
  SavingsGoal,
  SavingsGoalStatus as PrismaSavingsGoalStatus,
} from "@/generated/prisma/client";

function mapSavingsGoal(record: SavingsGoal): SavingsGoalRecord {
  return {
    id: record.id,
    name: record.name,
    targetAmount: record.targetAmount,
    savedAmount: record.savedAmount,
    status: record.status as SavingsGoalStatus,
    note: record.note,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function resolveStatus(
  targetAmount: number,
  savedAmount: number,
  status: SavingsGoalStatus,
): SavingsGoalStatus {
  if (status === "paused") {
    return "paused";
  }

  if (savedAmount >= targetAmount && targetAmount > 0) {
    return "completed";
  }

  return status === "completed" ? "completed" : "active";
}

export async function listSavingsGoals(
  userId: string,
): Promise<SavingsGoalRecord[]> {
  const records = await prisma.savingsGoal.findMany({
    where: { userId },
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
  });

  return records.map(mapSavingsGoal);
}

export async function listActiveSavingsGoals(
  userId: string,
): Promise<SavingsGoalRecord[]> {
  const records = await prisma.savingsGoal.findMany({
    where: { userId, status: "active" },
    orderBy: { updatedAt: "desc" },
  });

  return records.map(mapSavingsGoal);
}

export async function createSavingsGoal(
  userId: string,
  input: SavingsGoalFormInput,
): Promise<SavingsGoalRecord> {
  const status = resolveStatus(
    input.targetAmount,
    input.savedAmount,
    input.status,
  );

  const record = await prisma.savingsGoal.create({
    data: {
      userId,
      name: input.name,
      targetAmount: input.targetAmount,
      savedAmount: input.savedAmount,
      status: status as PrismaSavingsGoalStatus,
      note: input.note?.trim() || null,
    },
  });

  return mapSavingsGoal(record);
}

export async function updateSavingsGoal(
  userId: string,
  id: string,
  input: SavingsGoalFormInput,
): Promise<SavingsGoalRecord> {
  const status = resolveStatus(
    input.targetAmount,
    input.savedAmount,
    input.status,
  );

  const updated = await prisma.savingsGoal.updateMany({
    where: scopedId(userId, id),
    data: {
      name: input.name,
      targetAmount: input.targetAmount,
      savedAmount: input.savedAmount,
      status: status as PrismaSavingsGoalStatus,
      note: input.note?.trim() || null,
    },
  });

  if (updated.count === 0) {
    throw new Error("Tabungan tidak ditemukan.");
  }

  const record = await prisma.savingsGoal.findFirstOrThrow({
    where: scopedId(userId, id),
  });

  return mapSavingsGoal(record);
}

export async function deleteSavingsGoal(
  userId: string,
  id: string,
): Promise<void> {
  const deleted = await prisma.savingsGoal.deleteMany({
    where: scopedId(userId, id),
  });

  if (deleted.count === 0) {
    throw new Error("Tabungan tidak ditemukan.");
  }
}

export async function depositSavingsGoal(
  userId: string,
  id: string,
  amount: number,
): Promise<SavingsGoalRecord> {
  if (amount <= 0) {
    throw new Error("Nominal setoran harus lebih dari 0.");
  }

  const existing = await prisma.savingsGoal.findFirst({
    where: scopedId(userId, id),
  });

  if (!existing) {
    throw new Error("Tabungan tidak ditemukan.");
  }

  if (existing.status === "completed") {
    throw new Error("Tabungan ini sudah selesai.");
  }

  const [availableBalance, allGoals] = await Promise.all([
    getAvailableBalance(userId),
    listSavingsGoals(userId),
  ]);
  const totalSaved = allGoals.reduce((sum, goal) => sum + goal.savedAmount, 0);
  const freeBalance = availableBalance - totalSaved;

  if (amount > freeBalance) {
    throw new Error(
      `Saldo bebas tidak cukup. Tersedia ${formatIdr(Math.max(0, freeBalance))}.`,
    );
  }

  const savedAmount = existing.savedAmount + amount;
  const status = resolveStatus(
    existing.targetAmount,
    savedAmount,
    existing.status as SavingsGoalStatus,
  );

  const record = await prisma.savingsGoal.updateMany({
    where: scopedId(userId, id),
    data: { savedAmount, status: status as PrismaSavingsGoalStatus },
  });

  if (record.count === 0) {
    throw new Error("Tabungan tidak ditemukan.");
  }

  const updated = await prisma.savingsGoal.findFirstOrThrow({
    where: scopedId(userId, id),
  });

  return mapSavingsGoal(updated);
}

export async function withdrawSavingsGoal(
  userId: string,
  id: string,
  amount: number,
): Promise<SavingsGoalRecord> {
  if (amount <= 0) {
    throw new Error("Nominal penarikan harus lebih dari 0.");
  }

  const existing = await prisma.savingsGoal.findFirst({
    where: scopedId(userId, id),
  });

  if (!existing) {
    throw new Error("Tabungan tidak ditemukan.");
  }

  if (existing.savedAmount < amount) {
    throw new Error("Saldo tabungan tidak cukup.");
  }

  const savedAmount = existing.savedAmount - amount;
  const status =
    existing.status === "completed" && savedAmount < existing.targetAmount
      ? ("active" as PrismaSavingsGoalStatus)
      : (existing.status as PrismaSavingsGoalStatus);

  const updated = await prisma.savingsGoal.updateMany({
    where: scopedId(userId, id),
    data: { savedAmount, status },
  });

  if (updated.count === 0) {
    throw new Error("Tabungan tidak ditemukan.");
  }

  const record = await prisma.savingsGoal.findFirstOrThrow({
    where: scopedId(userId, id),
  });

  return mapSavingsGoal(record);
}
