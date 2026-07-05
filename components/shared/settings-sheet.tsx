"use client";

import { SettingsPanelContent } from "@/components/shared/settings-panel-content";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { GLASS_HOVER, GLASS_SURFACE } from "@/config/glass";
import { SEPARATED_PILL } from "@/config/shape";
import { SETTINGS_HEADER, SETTINGS_SHEET } from "@/config/settings-layout";
import { GearSixIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

interface SettingsSheetProps {
  trigger?: React.ReactElement;
}

export function SettingsSheet({ trigger }: SettingsSheetProps) {
  return (
    <Sheet>
      <SheetTrigger
        render={
          trigger ?? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Settings"
              className={cn(
                GLASS_SURFACE,
                GLASS_HOVER,
                "size-9 p-0",
                SEPARATED_PILL,
              )}
            />
          )
        }
      >
        {!trigger ? <GearSixIcon className="size-4" /> : null}
      </SheetTrigger>
      <SheetContent side="left" showCloseButton={false} className={SETTINGS_SHEET}>
        <div className={SETTINGS_HEADER}>
          <SheetHeader className="gap-0 p-0 text-left">
            <SheetTitle className="text-xl font-semibold tracking-tight">
              Pengaturan
            </SheetTitle>
          </SheetHeader>
          <SheetClose
            render={
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-sm font-semibold text-primary"
              />
            }
          >
            Selesai
          </SheetClose>
        </div>
        <SettingsPanelContent />
      </SheetContent>
    </Sheet>
  );
}
