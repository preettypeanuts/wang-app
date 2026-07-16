import { parseAmount } from "@/lib/finance/parse-amount";
import {
  isValidWalletAdminFeeDay,
  WALLET_ADMIN_FEE_DAY_MAX,
  WALLET_ADMIN_FEE_DAY_MIN,
} from "@/lib/wallets/wallet-admin-fee";
import type { WalletAdminFeeInput, WalletFormInput, WalletType } from "@/types/wallet";

const WALLET_TYPES: WalletType[] = ["cash", "bank", "ewallet", "other"];

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function parseAdminFee(
  formData: FormData,
  type: WalletType,
): { ok: true; data: WalletAdminFeeInput | null } | { ok: false; error: string } {
  if (type !== "bank") {
    return { ok: true, data: null };
  }

  const enabled = readString(formData, "adminFeeEnabled") === "on";
  if (!enabled) {
    return { ok: true, data: null };
  }

  const amountRaw = readString(formData, "adminFeeAmount");
  const dayRaw = readString(formData, "adminFeeDay");
  const amount =
    parseAmount(amountRaw) ??
    (Number.parseInt(amountRaw.replace(/\D/g, ""), 10) || null);
  const day = Number.parseInt(dayRaw, 10);

  if (amount === null || amount <= 0) {
    return { ok: false, error: "Nominal biaya admin wajib diisi." };
  }

  if (!isValidWalletAdminFeeDay(day)) {
    return {
      ok: false,
      error: `Tanggal potong harus antara ${WALLET_ADMIN_FEE_DAY_MIN}–${WALLET_ADMIN_FEE_DAY_MAX}.`,
    };
  }

  return {
    ok: true,
    data: {
      enabled: true,
      amount,
      day,
    },
  };
}

export function parseWalletFormData(
  formData: FormData,
): { ok: true; data: WalletFormInput } | { ok: false; error: string } {
  const name = readString(formData, "name");
  const typeRaw = readString(formData, "type");
  const initialRaw = readString(formData, "initialBalance");
  const iconRaw = readString(formData, "icon");

  if (!name) {
    return { ok: false, error: "Nama wallet wajib diisi." };
  }

  if (!WALLET_TYPES.includes(typeRaw as WalletType)) {
    return { ok: false, error: "Jenis wallet tidak valid." };
  }

  const type = typeRaw as WalletType;

  let initialBalance = 0;
  if (initialRaw) {
    const parsed =
      parseAmount(initialRaw) ??
      (Number.parseInt(initialRaw.replace(/\D/g, ""), 10) || null);

    if (parsed === null || parsed < 0) {
      return { ok: false, error: "Saldo awal tidak valid." };
    }

    initialBalance = parsed;
  }

  const adminFee = parseAdminFee(formData, type);
  if (!adminFee.ok) {
    return adminFee;
  }

  return {
    ok: true,
    data: {
      name,
      type,
      initialBalance,
      icon: iconRaw || null,
      adminFee: adminFee.data,
    },
  };
}
