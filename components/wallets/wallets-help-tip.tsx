"use client";

import { useRef, useState } from "react";

import { WalletsHelpDrawer } from "@/components/wallets/wallets-help-drawer";
import {
  WALLETS_HELP_TIP_CLUSTER,
  WALLETS_HELP_TIP_HIDDEN,
  WALLETS_HELP_TIP_LABEL,
  WALLETS_HELP_TIP_VISIBLE,
} from "@/config/wallets-help";
import { useScrollNearBottom } from "@/hooks/use-scroll-near-bottom";
import { cn } from "@/lib/utils";

interface WalletsHelpTipProps {
  className?: string;
}

export function WalletsHelpTip({ className }: WalletsHelpTipProps) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const nearBottom = useScrollNearBottom(anchorRef);

  return (
    <>
      <div
        ref={anchorRef}
        aria-hidden={!nearBottom}
        className={cn(
          WALLETS_HELP_TIP_CLUSTER,
          "transition-[opacity,transform] duration-300 ease-out",
          nearBottom ? WALLETS_HELP_TIP_VISIBLE : WALLETS_HELP_TIP_HIDDEN,
          className,
        )}
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          tabIndex={nearBottom ? 0 : -1}
          className="text-[13px] font-medium text-muted-foreground/70 underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          {WALLETS_HELP_TIP_LABEL}
        </button>
      </div>

      <WalletsHelpDrawer open={open} onOpenChange={setOpen} />
    </>
  );
}
