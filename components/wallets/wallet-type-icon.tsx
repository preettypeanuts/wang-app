"use client";

import { OverviewIconShell } from "@/components/overview/overview-icon-shell";
import type { OverviewIconVariant } from "@/config/overview";
import {
  BuildingIcon,
  CurrencyCircleDollarIcon,
  type Icon,
  SmartphoneIcon,
  WalletIcon,
} from "@/lib/icons";
import type { WalletType } from "@/types/wallet";

const WALLET_TYPE_ICONS: Record<WalletType, Icon> = {
  cash: CurrencyCircleDollarIcon,
  bank: BuildingIcon,
  ewallet: SmartphoneIcon,
  other: WalletIcon,
};

const WALLET_TYPE_VARIANTS: Record<WalletType, OverviewIconVariant> = {
  cash: "green",
  bank: "blue",
  ewallet: "purple",
  other: "neutral",
};

interface WalletTypeIconProps {
  type: WalletType;
  size?: "md" | "lg";
}

export function WalletTypeIcon({ type, size = "md" }: WalletTypeIconProps) {
  const IconComponent = WALLET_TYPE_ICONS[type];

  return (
    <OverviewIconShell variant={WALLET_TYPE_VARIANTS[type]} size={size}>
      <IconComponent />
    </OverviewIconShell>
  );
}
