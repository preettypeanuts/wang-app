"use client";

import { ArrowLeftIcon } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { GLASS_HOVER, GLASS_SURFACE } from "@/config/glass";
import { SEPARATED_PILL } from "@/config/shape";
import { cn } from "@/lib/utils";

interface MobileBackButtonProps {
  className?: string;
}

export function MobileBackButton({ className }: MobileBackButtonProps) {
  const { setOpenMobile } = useSidebar();

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label="Kembali"
      onClick={() => setOpenMobile(true)}
      className={cn(
        GLASS_SURFACE,
        GLASS_HOVER,
        "size-9 p-0",
        SEPARATED_PILL,
        className,
      )}
    >
      <ArrowLeftIcon className="size-4" />
    </Button>
  );
}
