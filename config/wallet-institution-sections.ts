import {
  BuildingIcon,
  GlobeIcon,
  SmartphoneIcon,
  StarIcon,
  type Icon,
} from "@/lib/icons";
import type { WalletInstitutionSectionId } from "@/lib/wallets/build-wallet-institution-catalog";
import type { WalletType } from "@/types/wallet";

export function getWalletInstitutionSectionIcon(
  sectionId: WalletInstitutionSectionId,
  walletType: WalletType,
): Icon {
  if (sectionId === "popular") {
    return StarIcon;
  }

  if (sectionId === "international") {
    return GlobeIcon;
  }

  return walletType === "bank" ? BuildingIcon : SmartphoneIcon;
}
