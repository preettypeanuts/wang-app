import { parseAmount } from "@/lib/finance/parse-amount";
import type { WalletFormInput, WalletType } from "@/types/wallet";

const WALLET_TYPES: WalletType[] = ["cash", "bank", "ewallet", "other"];

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export function parseWalletFormData(
  formData: FormData,
): { ok: true; data: WalletFormInput } | { ok: false; error: string } {
  const name = readString(formData, "name");
  const typeRaw = readString(formData, "type");
  const initialRaw = readString(formData, "initialBalance");

  if (!name) {
    return { ok: false, error: "Nama wallet wajib diisi." };
  }

  if (!WALLET_TYPES.includes(typeRaw as WalletType)) {
    return { ok: false, error: "Jenis wallet tidak valid." };
  }

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

  return {
    ok: true,
    data: {
      name,
      type: typeRaw as WalletType,
      initialBalance,
    },
  };
}
