"use client";

import { SidebarIcon } from "@/lib/icons";

import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { GLASS_HOVER, GLASS_SURFACE } from "@/config/glass";
import { SEPARATED_CONTROL } from "@/config/shape";
import { cn } from "@/lib/utils";

interface SidebarCollapseTriggerProps {
  className?: string;
}

export function SidebarCollapseTrigger({
  className,
}: SidebarCollapseTriggerProps) {
  const { toggleSidebar, state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={isCollapsed ? "Buka sidebar" : "Minimalkan sidebar"}
      onClick={toggleSidebar}
      className={cn(
        GLASS_SURFACE,
        GLASS_HOVER,
        SEPARATED_CONTROL,
        "size-8 shrink-0 p-0 transition-opacity",
        isCollapsed
          ? "opacity-100"
          : "opacity-0 group-hover/sidebar:opacity-100 focus-visible:opacity-100",
        className,
      )}
    >
      <SidebarIcon className="size-4" />
    </Button>
  );
}
