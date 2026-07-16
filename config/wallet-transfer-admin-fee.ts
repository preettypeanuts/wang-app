/** Common transfer admin fees (IDR) for bank / e-wallet moves. */
export const WALLET_TRANSFER_ADMIN_FEE_PRESETS = [
  1_000, 2_000, 2_500, 6_500,
] as const;

export const WALLET_TRANSFER_PATTERN_STORAGE_KEY =
  "wang:wallet-transfer-patterns";

export type WalletTransferAdminFeePreset =
  (typeof WALLET_TRANSFER_ADMIN_FEE_PRESETS)[number];

export type WalletTransferAdminFeeSelection =
  | { kind: "preset"; amount: WalletTransferAdminFeePreset }
  | { kind: "custom"; amount: number }
  | { kind: "none" };

export function isWalletTransferAdminFeePreset(
  amount: number,
): amount is WalletTransferAdminFeePreset {
  return (WALLET_TRANSFER_ADMIN_FEE_PRESETS as readonly number[]).includes(
    amount,
  );
}

export function resolveWalletTransferAdminFeeSelection(
  enabled: boolean,
  amount: number,
): WalletTransferAdminFeeSelection {
  if (!enabled || amount <= 0) {
    return { kind: "none" };
  }

  if (isWalletTransferAdminFeePreset(amount)) {
    return { kind: "preset", amount };
  }

  return { kind: "custom", amount };
}
