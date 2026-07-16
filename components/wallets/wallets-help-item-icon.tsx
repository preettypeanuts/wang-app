import {
  WALLETS_HELP_ICON_MAP,
  WALLETS_HELP_ITEM_ICON,
  type WalletsHelpIconKey,
} from "@/config/wallets-help";
import { cn } from "@/lib/utils";

interface WalletsHelpItemIconProps {
  icon: WalletsHelpIconKey;
  className?: string;
}

export function WalletsHelpItemIcon({
  icon,
  className,
}: WalletsHelpItemIconProps) {
  const Icon = WALLETS_HELP_ICON_MAP[icon];

  return (
    <span className={cn(WALLETS_HELP_ITEM_ICON, className)} aria-hidden>
      <Icon className="size-4" />
    </span>
  );
}
