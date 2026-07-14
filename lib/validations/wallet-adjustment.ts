import { parseAmount } from "@/lib/finance/parse-amount";

export interface WalletAdjustmentFormInput {
  walletId: string;
  actualBalance: number;
  note: string;
}

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export function parseWalletAdjustmentFormData(
  formData: FormData,
): { ok: true; data: WalletAdjustmentFormInput } | { ok: false; error: string } {
  const walletId = readString(formData, "walletId");
  const actualRaw = readString(formData, "actualBalance");
  const note = readString(formData, "note");

  if (!walletId) {
    return { ok: false, error: "Wallet tidak ditemukan." };
  }

  const actualBalance =
    parseAmount(actualRaw) ??
    (Number.parseInt(actualRaw.replace(/\D/g, ""), 10) || null);

  if (actualBalance === null) {
    return { ok: false, error: "Saldo sebenarnya tidak valid." };
  }

  return {
    ok: true,
    data: { walletId, actualBalance, note },
  };
}
