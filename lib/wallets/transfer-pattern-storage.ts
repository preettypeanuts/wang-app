import { WALLET_TRANSFER_PATTERN_STORAGE_KEY } from "@/config/wallet-transfer-admin-fee";

export interface WalletTransferPattern {
  amount: number;
  adminFeeEnabled: boolean;
  adminFeeAmount: number;
}

function buildTransferPatternKey(
  fromWalletId: string,
  toWalletId: string,
): string {
  return `${fromWalletId}:${toWalletId}`;
}

function readAllPatterns(): Record<string, WalletTransferPattern> {
  if (typeof window === "undefined") {
    return {};
  }

  const raw = window.localStorage.getItem(WALLET_TRANSFER_PATTERN_STORAGE_KEY);
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, WalletTransferPattern>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function readTransferPattern(
  fromWalletId: string,
  toWalletId: string,
): WalletTransferPattern | null {
  if (!fromWalletId || !toWalletId || fromWalletId === toWalletId) {
    return null;
  }

  const pattern =
    readAllPatterns()[buildTransferPatternKey(fromWalletId, toWalletId)];

  if (!pattern || typeof pattern.amount !== "number") {
    return null;
  }

  return {
    amount: pattern.amount,
    adminFeeEnabled: pattern.adminFeeEnabled === true,
    adminFeeAmount:
      typeof pattern.adminFeeAmount === "number" ? pattern.adminFeeAmount : 0,
  };
}

export function writeTransferPattern(
  fromWalletId: string,
  toWalletId: string,
  pattern: WalletTransferPattern,
): void {
  if (typeof window === "undefined") {
    return;
  }

  const key = buildTransferPatternKey(fromWalletId, toWalletId);
  const all = readAllPatterns();
  all[key] = pattern;
  window.localStorage.setItem(
    WALLET_TRANSFER_PATTERN_STORAGE_KEY,
    JSON.stringify(all),
  );
}
