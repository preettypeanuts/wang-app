import {
  getDefaultCategoryForKind,
  getFlowTypeForKind,
} from "@/config/planner-items";
import { startOfDay } from "@/lib/finance/day-range";
import { prisma } from "@/lib/db/prisma";
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

function buildEndFields(input: PlannedItemFormInput) {
  switch (input.endMode) {
    case "installments":
      return {
        endAt: null,
        installmentCount: input.installmentCount ?? null,
      };
    case "date":
      return {
        endAt: input.endAt ? startOfDay(new Date(input.endAt)) : null,
        installmentCount: null,
      };
    default:
      return {
        endAt: null,
        installmentCount: null,
      };
  }
}

function buildCreateData(input: PlannedItemFormInput) {
  const endFields = buildEndFields(input);

  return {
    name: input.name.trim(),
    kind: input.kind,
    repeat: input.repeat,
    amount: input.amount,
    flowType: getFlowTypeForKind(input.kind),
    category: getDefaultCategoryForKind(input.kind),
    startAt: startOfDay(new Date(input.startAt)),
    note: input.note?.trim() || null,
    ...endFields,
  };
}

async function ensureSamplePlannedItems(): Promise<void> {
  const count = await prisma.plannedItem.count();
  if (count > 0) {
    return;
  }

  const year = new Date().getFullYear();

  await prisma.plannedItem.createMany({
    data: [
      {
        name: "Apartemen",
        kind: "bill",
        repeat: "monthly",
        amount: 2_500_000,
        flowType: "expense",
        category: "housing",
        startAt: new Date(year, 6, 25),
      },
      {
        name: "Netflix",
        kind: "subscription",
        repeat: "monthly",
        amount: 69_000,
        flowType: "expense",
        category: "subscription",
        startAt: new Date(year, 6, 8),
      },
      {
        name: "MacBook",
        kind: "installment",
        repeat: "monthly",
        amount: 1_250_000,
        flowType: "expense",
        category: "shopping",
        startAt: new Date(year, 3, 1),
        installmentCount: 12,
        paidInstallmentCount: 3,
      },
    ],
  });
}

export async function listPlannedItems(): Promise<PlannedItemRecord[]> {
  await ensureSamplePlannedItems();

  const records = await prisma.plannedItem.findMany({
    orderBy: [{ createdAt: "asc" }],
    select: PLANNED_ITEM_SELECT,
  });

  return records.map(mapPlannedItem);
}

export async function getPlannedItemsForExpansion(): Promise<PlannedItemRecord[]> {
  return listPlannedItems();
}

export async function createPlannedItem(
  input: PlannedItemFormInput,
): Promise<PlannedItemRecord> {
  const record = await prisma.plannedItem.create({
    data: buildCreateData(input),
    select: PLANNED_ITEM_SELECT,
  });

  return mapPlannedItem(record);
}

export async function updatePlannedItem(
  id: string,
  input: PlannedItemFormInput,
): Promise<PlannedItemRecord> {
  const record = await prisma.plannedItem.update({
    where: { id },
    data: buildCreateData(input),
    select: PLANNED_ITEM_SELECT,
  });

  return mapPlannedItem(record);
}

export async function deletePlannedItem(id: string): Promise<void> {
  await prisma.plannedItem.delete({
    where: { id },
  });
}

export async function markInstallmentPaid(
  id: string,
  installmentIndex: number,
): Promise<PlannedItemRecord> {
  const existing = await prisma.plannedItem.findUnique({
    where: { id },
    select: {
      installmentCount: true,
      paidInstallmentCount: true,
    },
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

  const nextPaid = Math.max(existing.paidInstallmentCount, installmentIndex + 1);

  const record = await prisma.plannedItem.update({
    where: { id },
    data: { paidInstallmentCount: nextPaid },
    select: PLANNED_ITEM_SELECT,
  });

  return mapPlannedItem(record);
}
