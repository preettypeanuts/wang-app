import { unstable_cache } from "next/cache";
import {
  getDefaultCategoryForKind,
  getFlowTypeForKind,
} from "@/config/planner-items";
import { revalidateUserPlannedItems } from "@/lib/cache/revalidate-user-data";
import {
  hydratePlannedItem,
  type SerializedPlannedItemRecord,
  serializePlannedItem,
} from "@/lib/cache/serialize-planned-items";
import { userDataTags } from "@/lib/cache/user-data-tags";
import { prisma } from "@/lib/db/prisma";
import { scopedId } from "@/lib/db/user-scope";
import { parseDateOnlyInput } from "@/lib/finance/day-range";
import { recordPlannedItemPayment } from "@/lib/finance/record-planned-item-payment";
import type {
  PlannedItemFormInput,
  PlannedItemKind,
  PlannedItemRecord,
  PlannedRepeatInterval,
} from "@/types/planner";

const PLANNED_ITEM_SELECT = {
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
} as const;

function mapPlannedItem(record: {
  id: string;
  name: string;
  kind: PlannedItemKind;
  repeat: PlannedRepeatInterval;
  amount: number;
  flowType: "income" | "expense";
  category: string;
  startAt: Date;
  endAt: Date | null;
  installmentCount: number | null;
  paidInstallmentCount: number;
  note: string | null;
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
  };
}

function parseStoredDateInput(value: string): Date {
  const parsed = parseDateOnlyInput(value);

  if (!parsed) {
    throw new Error("Tanggal tidak valid.");
  }

  return parsed;
}

function buildEndFields(input: PlannedItemFormInput) {
  switch (input.endMode) {
    case "installments":
      return {
        endAt: input.endAt ? parseStoredDateInput(input.endAt) : null,
        installmentCount: input.installmentCount ?? null,
      };
    case "date":
      return {
        endAt: input.endAt ? parseStoredDateInput(input.endAt) : null,
        installmentCount: null,
      };
    default:
      return {
        endAt: null,
        installmentCount: null,
      };
  }
}

function buildCreateData(userId: string, input: PlannedItemFormInput) {
  const endFields = buildEndFields(input);

  return {
    userId,
    name: input.name.trim(),
    kind: input.kind,
    repeat: input.repeat,
    amount: input.amount,
    flowType: input.flowType ?? getFlowTypeForKind(input.kind),
    category: input.category ?? getDefaultCategoryForKind(input.kind),
    startAt: parseStoredDateInput(input.startAt),
    note: input.note?.trim() || null,
    paidInstallmentCount:
      input.kind === "installment" ? (input.paidInstallmentCount ?? 0) : 0,
    ...endFields,
  };
}

async function requirePlannedItem(
  userId: string,
  id: string,
): Promise<PlannedItemRecord> {
  const record = await prisma.plannedItem.findFirst({
    where: scopedId(userId, id),
    select: PLANNED_ITEM_SELECT,
  });

  if (!record) {
    throw new Error("Item tidak ditemukan.");
  }

  return mapPlannedItem(record);
}

async function queryPlannedItems(
  userId: string,
): Promise<SerializedPlannedItemRecord[]> {
  const records = await prisma.plannedItem.findMany({
    where: { userId },
    orderBy: [{ createdAt: "asc" }],
    select: PLANNED_ITEM_SELECT,
  });

  return records.map(mapPlannedItem).map(serializePlannedItem);
}

export async function listPlannedItems(
  userId: string,
): Promise<PlannedItemRecord[]> {
  const cached = await unstable_cache(
    () => queryPlannedItems(userId),
    ["planned-items", userId],
    { tags: [userDataTags.plannedItems(userId)] },
  )();

  return cached.map(hydratePlannedItem);
}

export async function getPlannedItemsForExpansion(
  userId: string,
): Promise<PlannedItemRecord[]> {
  return listPlannedItems(userId);
}

export async function createPlannedItem(
  userId: string,
  input: PlannedItemFormInput,
): Promise<PlannedItemRecord> {
  const record = await prisma.plannedItem.create({
    data: buildCreateData(userId, input),
    select: PLANNED_ITEM_SELECT,
  });

  revalidateUserPlannedItems(userId);
  return mapPlannedItem(record);
}

export async function updatePlannedItem(
  userId: string,
  id: string,
  input: PlannedItemFormInput,
): Promise<PlannedItemRecord> {
  const updated = await prisma.plannedItem.updateMany({
    where: scopedId(userId, id),
    data: buildCreateData(userId, input),
  });

  if (updated.count === 0) {
    throw new Error("Item tidak ditemukan.");
  }

  revalidateUserPlannedItems(userId);
  return requirePlannedItem(userId, id);
}

export async function deletePlannedItem(
  userId: string,
  id: string,
): Promise<void> {
  const deleted = await prisma.plannedItem.deleteMany({
    where: scopedId(userId, id),
  });

  if (deleted.count === 0) {
    throw new Error("Item tidak ditemukan.");
  }

  revalidateUserPlannedItems(userId);
}

export async function markInstallmentPaid(
  userId: string,
  id: string,
  installmentIndex: number,
): Promise<PlannedItemRecord> {
  const existing = await prisma.plannedItem.findFirst({
    where: scopedId(userId, id),
    select: PLANNED_ITEM_SELECT,
  });

  if (!existing) {
    throw new Error("Item tidak ditemukan.");
  }

  if (installmentIndex < 0) {
    throw new Error("Periode tidak valid.");
  }

  if (
    existing.installmentCount !== null &&
    installmentIndex >= existing.installmentCount
  ) {
    throw new Error("Periode tidak valid.");
  }

  const isNewPayment = installmentIndex >= existing.paidInstallmentCount;
  const nextPaid = Math.max(
    existing.paidInstallmentCount,
    installmentIndex + 1,
  );

  const updated = await prisma.plannedItem.updateMany({
    where: scopedId(userId, id),
    data: { paidInstallmentCount: nextPaid },
  });

  if (updated.count === 0) {
    throw new Error("Item tidak ditemukan.");
  }

  if (isNewPayment) {
    await recordPlannedItemPayment(
      userId,
      mapPlannedItem(existing),
      installmentIndex,
    );
  }

  revalidateUserPlannedItems(userId);
  return requirePlannedItem(userId, id);
}
