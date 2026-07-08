"use server";

import { revalidatePath } from "next/cache";

import { createInboxMessage } from "@/lib/db/inbox-messages";
import { revalidateUserSavings } from "@/lib/cache/revalidate-user-data";
import {
  createSavingsGoal,
  depositSavingsGoal,
  listSavingsGoals,
  updateSavingsGoal,
  withdrawSavingsGoal,
} from "@/lib/db/savings-goals";
import { findSavingsGoalByQuery } from "@/lib/savings/find-savings-goal";
import {
  formatSavingsGoalDetail,
  formatSavingsGoalsList,
} from "@/lib/savings/format-savings-reply";
import type { SavingsInboxCommand } from "@/lib/savings/parse-savings-inbox-command";
import { formatIdr } from "@/lib/finance/format-currency";
import { getSavingsGoalProgress } from "@/lib/finance/build-savings-overview";
import type { ChatMessage } from "@/types/chat";

interface SavingsInboxResult {
  ok: boolean;
  content: string;
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
}

function revalidateSavings(userId: string) {
  revalidateUserSavings(userId);
  revalidatePath("/");
  revalidatePath("/plans");
  revalidatePath("/overview");
}

export async function executeSavingsInboxCommand(
  userId: string,
  userContent: string,
  command: SavingsInboxCommand,
): Promise<SavingsInboxResult> {
  const userMessage = await createInboxMessage({
    userId,
    role: "user",
    content: userContent,
  });

  try {
    const goals = await listSavingsGoals(userId);
    let content = "";

    switch (command.kind) {
      case "list": {
        content = formatSavingsGoalsList(goals);
        break;
      }
      case "show": {
        const goal = findSavingsGoalByQuery(goals, command.goalQuery);
        if (!goal) {
          throw new Error(`Tabungan "${command.goalQuery}" tidak ditemukan.`);
        }
        content = formatSavingsGoalDetail(goal);
        break;
      }
      case "create": {
        const goal = await createSavingsGoal(userId, {
          name: command.name,
          targetAmount: command.targetAmount,
          savedAmount: 0,
          status: "active",
        });
        revalidateSavings(userId);
        content = `Tabungan "${goal.name}" dibuat dengan target ${formatIdr(goal.targetAmount)}.`;
        break;
      }
      case "edit": {
        const goal = findSavingsGoalByQuery(goals, command.goalQuery);
        if (!goal) {
          throw new Error(`Tabungan "${command.goalQuery}" tidak ditemukan.`);
        }
        const updated = await updateSavingsGoal(userId, goal.id, {
          name: goal.name,
          targetAmount: command.targetAmount,
          savedAmount: goal.savedAmount,
          status: goal.status,
          note: goal.note ?? undefined,
        });
        revalidateSavings(userId);
        content = `Target tabungan "${updated.name}" diubah jadi ${formatIdr(updated.targetAmount)}.`;
        break;
      }
      case "deposit": {
        const goal = findSavingsGoalByQuery(goals, command.goalQuery);
        if (!goal) {
          throw new Error(`Tabungan "${command.goalQuery}" tidak ditemukan.`);
        }
        const updated = await depositSavingsGoal(
          userId,
          goal.id,
          command.amount,
        );
        revalidateSavings(userId);
        const progress = getSavingsGoalProgress(updated);
        content = `Setor ${formatIdr(command.amount)} ke "${updated.name}". Sekarang ${formatIdr(updated.savedAmount)} (${progress}%).`;
        break;
      }
      case "withdraw": {
        const goal = findSavingsGoalByQuery(goals, command.goalQuery);
        if (!goal) {
          throw new Error(`Tabungan "${command.goalQuery}" tidak ditemukan.`);
        }
        const updated = await withdrawSavingsGoal(
          userId,
          goal.id,
          command.amount,
        );
        revalidateSavings(userId);
        content = `Tarik ${formatIdr(command.amount)} dari "${updated.name}". Sisa ${formatIdr(updated.savedAmount)}.`;
        break;
      }
    }

    const assistantMessage = await createInboxMessage({
      userId,
      role: "assistant",
      content,
    });

    return {
      ok: true,
      content,
      userMessage,
      assistantMessage,
    };
  } catch (error) {
    const content =
      error instanceof Error
        ? error.message
        : "Gagal memproses perintah tabungan.";

    const assistantMessage = await createInboxMessage({
      userId,
      role: "assistant",
      content,
    });

    return {
      ok: false,
      content,
      userMessage,
      assistantMessage,
    };
  }
}
