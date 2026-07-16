"use client";

import { WalletsHelpItem } from "@/components/wallets/wallets-help-item";
import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogHeader,
} from "@/components/shared/responsive-dialog";
import {
  WALLETS_HELP_DRAWER_DESC,
  WALLETS_HELP_DRAWER_TITLE,
  WALLETS_HELP_ITEMS,
} from "@/config/wallets-help";

interface WalletsHelpDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WalletsHelpDrawer({
  open,
  onOpenChange,
}: WalletsHelpDrawerProps) {
  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={WALLETS_HELP_DRAWER_TITLE}
    >
      <ResponsiveDialogHeader>
        <h2 className="text-base font-semibold tracking-tight">
          {WALLETS_HELP_DRAWER_TITLE}
        </h2>
        <p className="mt-1 text-[13px] text-muted-foreground">
          {WALLETS_HELP_DRAWER_DESC}
        </p>
      </ResponsiveDialogHeader>
      <ResponsiveDialogBody className="pb-2">
        <ul className="flex flex-col gap-3.5">
          {WALLETS_HELP_ITEMS.map((item) => (
            <WalletsHelpItem
              key={item.title}
              icon={item.icon}
              title={item.title}
              body={item.body}
            />
          ))}
        </ul>
      </ResponsiveDialogBody>
    </ResponsiveDialog>
  );
}
