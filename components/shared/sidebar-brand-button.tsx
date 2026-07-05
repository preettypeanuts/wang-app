"use client";

import Link from "next/link";

import { SEPARATED_CONTROL } from "@/config/shape";
import { SEPARATED_MENU_ITEM } from "@/config/sidebar";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface SidebarBrandButtonProps {
  className?: string;
}

export function SidebarBrandButton({ className }: SidebarBrandButtonProps) {
  return (
    <SidebarMenuButton
      size="lg"
      className={cn(
        SEPARATED_MENU_ITEM,
        "group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-0!",
        className,
      )}
      render={<Link href="/" />}
    >
      <div
        className={cn(
          "flex aspect-square size-8 shrink-0 items-center justify-center bg-primary text-primary-foreground",
          SEPARATED_CONTROL,
        )}
      >
        <span className="text-sm font-semibold">M</span>
      </div>
      <div className="grid min-w-0 flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
        <span className="truncate font-semibold">Monmon</span>
        <span className="truncate text-xs text-muted-foreground">Finance AI</span>
      </div>
    </SidebarMenuButton>
  );
}
