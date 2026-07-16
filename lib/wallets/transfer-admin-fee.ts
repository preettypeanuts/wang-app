import type { WalletType } from "@/types/wallet";

/** Admin fee option applies to moves between bank / e-wallet wallets. */
export function shouldShowTransferAdminFee(
  fromType: WalletType,
  toType: WalletType,
): boolean {
  const isInstitutional = (type: WalletType) =>
    type === "bank" || type === "ewallet";

  return isInstitutional(fromType) && isInstitutional(toType);
}

export function computeTransferTotalDebit(
  amount: number,
  adminFeeAmount: number,
): number {
  return amount + Math.max(0, adminFeeAmount);
}
