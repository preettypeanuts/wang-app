"use client";

import {
  UI_LABEL_HIDE_BALANCE,
  UI_LABEL_SHOW_BALANCE,
} from "@/config/ui-labels";
import { useAppearance } from "@/components/shared/appearance-provider";
import { Button } from "@/components/ui/button";
import { EyeIcon, EyeSlashIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

interface BalanceVisibilityToggleProps {
  className?: string;
}

export function BalanceVisibilityToggle({
  className,
}: BalanceVisibilityToggleProps) {
  const { balanceVisible, toggleBalanceVisibility } = useAppearance();

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={toggleBalanceVisibility}
      aria-label={balanceVisible ? UI_LABEL_HIDE_BALANCE : UI_LABEL_SHOW_BALANCE}
      aria-pressed={!balanceVisible}
      className={cn(
        "size-8 shrink-0 text-muted-foreground hover:text-foreground",
        className,
      )}
    >
      {balanceVisible ? (
        <EyeIcon className="size-4" />
      ) : (
        <EyeSlashIcon className="size-4" />
      )}
    </Button>
  );
}
