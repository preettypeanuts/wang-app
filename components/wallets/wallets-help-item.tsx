import { WalletsHelpItemIcon } from "@/components/wallets/wallets-help-item-icon";
import { WALLETS_HELP_ITEM_ROW } from "@/config/wallets-help";
import type { WalletsHelpIconKey } from "@/config/wallets-help";
import { cn } from "@/lib/utils";

interface WalletsHelpItemProps {
  icon: WalletsHelpIconKey;
  title: string;
  body: string;
  className?: string;
}

export function WalletsHelpItem({
  icon,
  title,
  body,
  className,
}: WalletsHelpItemProps) {
  return (
    <li className={cn(WALLETS_HELP_ITEM_ROW, className)}>
      <WalletsHelpItemIcon icon={icon} />
      <div className="min-w-0 pt-0.5">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="mt-0.5 text-[13px] leading-snug text-muted-foreground">
          {body}
        </p>
      </div>
    </li>
  );
}
