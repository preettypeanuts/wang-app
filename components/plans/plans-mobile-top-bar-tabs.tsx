"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { usePlansPageTab } from "@/components/plans/plans-page-tab-context";
import type { PlansPageTab } from "@/components/plans/plans-page-tabs";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PLANS_ROUTE } from "@/config/navigation";
import {
  PAYPLAN_TOP_BAR_TABS_LIST,
  PAYPLAN_TOP_BAR_TABS_TRIGGER,
} from "@/config/payplan-mobile";
import { HeartIcon, WalletIcon } from "@/lib/icons";
import {
  setPlansTabState,
  syncPlansTabUrl,
} from "@/lib/plans/plans-tab-store";
import { cn } from "@/lib/utils";

function isPlansPath(pathname: string): boolean {
  return pathname === PLANS_ROUTE || pathname.startsWith(`${PLANS_ROUTE}/`);
}

function parsePlansTabFromSearchParams(
  searchParams: URLSearchParams,
): PlansPageTab {
  return searchParams.get("tab") === "savings" ? "savings" : "wish";
}

export function PlansMobileTopBarTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabContext = usePlansPageTab();
  const tab =
    tabContext?.tab ?? parsePlansTabFromSearchParams(searchParams);

  function navigate(nextTab: PlansPageTab) {
    if (tabContext) {
      tabContext.setTab(nextTab);
      return;
    }

    if (isPlansPath(pathname)) {
      setPlansTabState(nextTab);
      syncPlansTabUrl(nextTab);
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    if (nextTab === "savings") {
      params.set("tab", "savings");
    } else {
      params.delete("tab");
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <Tabs
      value={tab}
      onValueChange={(value) => navigate(value as PlansPageTab)}
      className="shrink-0"
    >
      <TabsList variant="line" className={PAYPLAN_TOP_BAR_TABS_LIST}>
        <TabsTrigger
          value="wish"
          className={cn(PAYPLAN_TOP_BAR_TABS_TRIGGER)}
          aria-label="Wish"
        >
          <HeartIcon aria-hidden />
        </TabsTrigger>
        <TabsTrigger
          value="savings"
          className={cn(PAYPLAN_TOP_BAR_TABS_TRIGGER)}
          aria-label="Tabungan"
        >
          <WalletIcon aria-hidden />
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
