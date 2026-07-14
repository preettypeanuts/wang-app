import Link from "next/link";

import {
  SETTINGS_IOS_GROUP,
  SETTINGS_IOS_ROW,
  SETTINGS_IOS_ROW_ICON,
  SETTINGS_IOS_ROW_LABEL,
} from "@/config/settings-ios";
import { WALLETS_ROUTE } from "@/config/navigation";
import { WALLETS_PAGE_TITLE } from "@/config/wallet-labels";
import { CaretRightIcon, WalletIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

/** Settings shortcut to the wallet management page. */
export function WalletsSettingsLink() {
  return (
    <div className={SETTINGS_IOS_GROUP}>
      <Link href={WALLETS_ROUTE} className={SETTINGS_IOS_ROW}>
        <span className={cn(SETTINGS_IOS_ROW_ICON, "bg-[#34C759]")}>
          <WalletIcon />
        </span>
        <span className={SETTINGS_IOS_ROW_LABEL}>{WALLETS_PAGE_TITLE}</span>
        <CaretRightIcon className="size-3.5 shrink-0 text-muted-foreground/60" />
      </Link>
    </div>
  );
}
