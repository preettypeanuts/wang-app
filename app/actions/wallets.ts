"use server";

import { revalidatePath } from "next/cache";

import { requireUserId } from "@/lib/auth/session";
import {
  revalidateAfterTransactionMutation,
  revalidateUserWallets,
} from "@/lib/cache/revalidate-user-data";
import { updateInboxMessage } from "@/lib/db/inbox-messages";
import { prisma } from "@/lib/db/prisma";
import { scopedByUser } from "@/lib/db/user-scope";
import { createWalletAdjustment } from "@/lib/db/wallet-adjustment";
import { createWalletTransfer } from "@/lib/db/wallet-transfer";
import {
  archiveWallet,
  createWallet,
  setDefaultWallet,
  updateWallet,
  WalletArchiveBlockedError,
} from "@/lib/db/wallets";
import { parseWalletAdjustmentFormData } from "@/lib/validations/wallet-adjustment";
import { parseWalletFormData } from "@/lib/validations/wallet";
import { parseWalletTransferFormData } from "@/lib/validations/wallet-transfer";
import type { WalletRecord, WalletType } from "@/types/wallet";

interface WalletActionSuccess {
  ok: true;
  wallet: WalletRecord;
}

interface WalletActionFailure {
  ok: false;
  error: string;
  reason?: "is_default";
}

export type WalletActionResult = WalletActionSuccess | WalletActionFailure;

function revalidateWallets(userId: string) {
  revalidateUserWallets(userId);
  revalidatePath("/overview");
  revalidatePath("/overview/wallets");
  revalidatePath("/journal");
}

export async function createWalletTransferAction(
  formData: FormData,
): Promise<{ ok: true } | WalletActionFailure> {
  const userId = await requireUserId();
  const parsed = parseWalletTransferFormData(formData);

  if (!parsed.ok) {
    return parsed;
  }

  try {
    await createWalletTransfer(userId, parsed.data);
    revalidateWallets(userId);
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Gagal memproses transfer.",
    };
  }
}

export async function createWalletAdjustmentAction(
  formData: FormData,
): Promise<{ ok: true } | WalletActionFailure> {
  const userId = await requireUserId();
  const parsed = parseWalletAdjustmentFormData(formData);

  if (!parsed.ok) {
    return parsed;
  }

  try {
    await createWalletAdjustment(userId, parsed.data);
    revalidateWallets(userId);
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Gagal menyimpan penyesuaian.",
    };
  }
}

export async function createStarterWalletAction(input: {
  name: string;
  type: WalletType;
}): Promise<WalletActionResult> {
  const userId = await requireUserId();
  const name = input.name.trim();

  if (!name) {
    return { ok: false, error: "Nama wallet wajib diisi." };
  }

  try {
    const wallet = await createWallet(userId, {
      name,
      type: input.type,
      initialBalance: 0,
    });
    revalidateWallets(userId);
    return { ok: true, wallet };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Gagal membuat wallet.",
    };
  }
}

export async function saveWalletAction(
  formData: FormData,
): Promise<WalletActionResult> {
  const userId = await requireUserId();
  const parsed = parseWalletFormData(formData);

  if (!parsed.ok) {
    return parsed;
  }

  const id = formData.get("id");

  try {
    const wallet =
      typeof id === "string" && id.trim()
        ? await updateWallet(userId, id.trim(), parsed.data)
        : await createWallet(userId, parsed.data);

    revalidateWallets(userId);
    return { ok: true, wallet };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Gagal menyimpan wallet.",
    };
  }
}

export async function setDefaultWalletAction(
  walletId: string,
): Promise<WalletActionResult> {
  const userId = await requireUserId();
  const trimmed = walletId.trim();

  if (!trimmed) {
    return { ok: false, error: "Wallet tidak ditemukan." };
  }

  try {
    const wallet = await setDefaultWallet(userId, trimmed);
    revalidateWallets(userId);
    return { ok: true, wallet };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Gagal mengatur wallet default.",
    };
  }
}

/** Quick-correct from chat: re-point all transactions of an inbox reply to the chosen wallet. */
export async function correctInboxTransactionWalletAction(input: {
  assistantMessageId: string;
  walletId: string;
}): Promise<
  | { ok: true; walletName: string; assistantContent: string }
  | WalletActionFailure
> {
  const userId = await requireUserId();
  const assistantMessageId = input.assistantMessageId.trim();
  const walletId = input.walletId.trim();

  if (!assistantMessageId || !walletId) {
    return { ok: false, error: "Wallet tidak ditemukan." };
  }

  const wallet = await prisma.wallet.findFirst({
    where: { id: walletId, userId, isArchived: false },
    select: { id: true, name: true },
  });

  if (!wallet) {
    return { ok: false, error: "Wallet tidak ditemukan." };
  }

  const updated = await prisma.transaction.updateMany({
    where: scopedByUser(userId, { inboxMessageId: assistantMessageId }),
    data: { walletId: wallet.id },
  });

  if (updated.count === 0) {
    return { ok: false, error: "Transaksi tidak ditemukan." };
  }

  const message = await prisma.inboxMessage.findFirst({
    where: scopedByUser(userId, { id: assistantMessageId }),
    select: { content: true },
  });
  const assistantContent =
    `${message?.content ?? ""}\nOke, masuk dompet ${wallet.name}.`.trim();

  try {
    await updateInboxMessage(userId, assistantMessageId, {
      content: assistantContent,
    });
  } catch {
    // Wallet move succeeded; the confirmation line is best-effort.
  }

  revalidateAfterTransactionMutation(userId);
  revalidatePath("/overview");
  revalidatePath("/overview/wallets");

  return { ok: true, walletName: wallet.name, assistantContent };
}

export async function archiveWalletAction(
  id: string,
): Promise<{ ok: true } | WalletActionFailure> {
  const userId = await requireUserId();
  const trimmed = id.trim();

  if (!trimmed) {
    return { ok: false, error: "Wallet tidak ditemukan." };
  }

  try {
    await archiveWallet(userId, trimmed);
    revalidateWallets(userId);
    return { ok: true };
  } catch (error) {
    if (error instanceof WalletArchiveBlockedError) {
      return {
        ok: false,
        error: error.message,
        reason: "is_default",
      };
    }

    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Gagal mengarsipkan wallet.",
    };
  }
}
