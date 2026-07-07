"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SAVINGS_PAGE_TITLE, WISH_PAGE_TITLE } from "@/config/navigation";
import { cn } from "@/lib/utils";

export type PlansPageTab = "wish" | "savings";

interface PlansPageTabsProps {
  tab: PlansPageTab;
  onTabChange: (tab: PlansPageTab) => void;
  className?: string;
}

export function PlansPageTabs({
  tab,
  onTabChange,
  className,
}: PlansPageTabsProps) {
  return (
    <Tabs
      value={tab}
      onValueChange={(value) => onTabChange(value as PlansPageTab)}
      className={cn("w-fit shrink-0", className)}
    >
      <TabsList className="h-8">
        <TabsTrigger value="wish" className="px-2.5 text-xs">
          {WISH_PAGE_TITLE}
        </TabsTrigger>
        <TabsTrigger value="savings" className="px-2.5 text-xs">
          {SAVINGS_PAGE_TITLE}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
