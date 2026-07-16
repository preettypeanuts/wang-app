import { parseAmount } from "@/lib/finance/parse-amount";

export interface WalletTransferFormInput {
  fromWalletId: string;
  toWalletId: string;
  amount: number;
  note: string;
  adminFeeAmount: number;
}

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function parseAdminFeeAmount(
  formData: FormData,
): { ok: true; amount: number } | { ok: false; error: string } {
  const enabled = readString(formData, "adminFeeEnabled") === "on";
  if (!enabled) {
    return { ok: true, amount: 0 };
  }

  const amountRaw = readString(formData, "adminFeeAmount");
  const amount =
    parseAmount(amountRaw) ??
    (Number.parseInt(amountRaw.replace(/\D/g, ""), 10) || null);

  if (amount === null || amount <= 0) {
    return { ok: false, error: "Nominal biaya admin tidak valid." };
  }

  return { ok: true, amount };
}

export function parseWalletTransferFormData(
  formData: FormData,
): { ok: true; data: WalletTransferFormInput } | { ok: false; error: string } {
  const fromWalletId = readString(formData, "fromWalletId");
  const toWalletId = readString(formData, "toWalletId");
  const amountRaw = readString(formData, "amount");
  const note = readString(formData, "note");

  if (!fromWalletId || !toWalletId) {
    return { ok: false, error: "Pilih wallet asal dan tujuan." };
  }

  if (fromWalletId === toWalletId) {
    return { ok: false, error: "Wallet asal dan tujuan harus berbeda." };
  }

  const amount =
    parseAmount(amountRaw) ??
    (Number.parseInt(amountRaw.replace(/\D/g, ""), 10) || null);

  if (amount === null || amount <= 0) {
    return { ok: false, error: "Nominal transfer tidak valid." };
  }

  const adminFee = parseAdminFeeAmount(formData);
  if (!adminFee.ok) {
    return adminFee;
  }

  return {
    ok: true,
    data: {
      fromWalletId,
      toWalletId,
      amount,
      note,
      adminFeeAmount: adminFee.amount,
    },
  };
}
