"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { JournalFiltersDrawer } from "@/components/journal/journal-filters-drawer";
import { Button } from "@/components/ui/button";
import { UI_LABEL_OPEN_FILTER } from "@/config/ui-labels";
import { MOBILE_TOP_BAR_ORB_BUTTON } from "@/config/mobile-chrome";
import { JOURNAL_FILTER_TRIGGER_ACTIVE } from "@/config/journal-mobile";
import { isOverviewRoute } from "@/config/overview-desktop";
import { SEPARATED_CONTROL } from "@/config/shape";
import { FunnelIcon } from "@/lib/icons";
import { isJournalDateRangeActive } from "@/lib/journal/journal-date-range";
import { parseOverviewFilters } from "@/lib/overview/parse-overview-filters";
import { cn } from "@/lib/utils";
import {
  buildJournalSearchParams,
} from "@/lib/validations/journal";
import type { JournalFilters } from "@/types/journal";

interface OverviewFiltersContextValue {
  isOverview: boolean;
  hasFilters: boolean;
  openDrawer: () => void;
}

const OverviewFiltersContext =
  createContext<OverviewFiltersContextValue | null>(null);

function hasActiveOverviewFilters(filters: JournalFilters): boolean {
  return (
    filters.type !== "all" ||
    filters.category !== "all" ||
    isJournalDateRangeActive(filters)
  );
}

function OverviewFiltersBridgeInner({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOverview = isOverviewRoute(pathname);
  const filters = useMemo(
    () => parseOverviewFilters(Object.fromEntries(searchParams.entries())),
    [searchParams],
  );
  const [type, setType] = useState(filters.type);
  const [category, setCategory] = useState(filters.category);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const hasFilters = hasActiveOverviewFilters(filters);

  useEffect(() => {
    setType(filters.type);
    setCategory(filters.category);
  }, [filters]);

  function pushFilters(next: Partial<JournalFilters>) {
    const merged: JournalFilters = {
      q: "",
      type,
      category,
      page: 1,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      ...next,
    };

    const params = buildJournalSearchParams(merged, 1);
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  function resetFilters() {
    setType("all");
    setCategory("all");
    router.push(pathname);
  }

  function applyAllFilters(next: {
    dateFrom: string | null;
    dateTo: string | null;
    type: JournalFilters["type"];
    category: string;
  }) {
    setType(next.type);
    setCategory(next.category);
    pushFilters({
      dateFrom: next.dateFrom,
      dateTo: next.dateTo,
      type: next.type,
      category: next.category,
      page: 1,
    });
  }

  const contextValue = useMemo(
    () => ({
      isOverview,
      hasFilters,
      openDrawer: () => setFiltersOpen(true),
    }),
    [hasFilters, isOverview],
  );

  return (
    <OverviewFiltersContext.Provider value={contextValue}>
      {children}
      {isOverview ? (
        <JournalFiltersDrawer
          open={filtersOpen}
          onOpenChange={setFiltersOpen}
          dateFrom={filters.dateFrom}
          dateTo={filters.dateTo}
          type={type}
          category={category}
          onApply={applyAllFilters}
          onReset={resetFilters}
        />
      ) : null}
    </OverviewFiltersContext.Provider>
  );
}

export function OverviewFiltersBridge({ children }: { children: ReactNode }) {
  return <OverviewFiltersBridgeInner>{children}</OverviewFiltersBridgeInner>;
}

function useOverviewFiltersContext(): OverviewFiltersContextValue {
  const context = useContext(OverviewFiltersContext);

  if (!context) {
    throw new Error(
      "Overview filter controls must be used within OverviewFiltersBridge.",
    );
  }

  return context;
}

export function OverviewMobileTopBarFilterButton() {
  const { isOverview, hasFilters, openDrawer } = useOverviewFiltersContext();

  if (!isOverview) {
    return null;
  }

  return (
    <button
      type="button"
      aria-label={UI_LABEL_OPEN_FILTER}
      className={cn(
        MOBILE_TOP_BAR_ORB_BUTTON,
        hasFilters && JOURNAL_FILTER_TRIGGER_ACTIVE,
      )}
      onClick={openDrawer}
    >
      <FunnelIcon aria-hidden className="size-[1.35rem]" />
    </button>
  );
}

export function OverviewDesktopFilterTrigger() {
  const { isOverview, hasFilters, openDrawer } = useOverviewFiltersContext();

  if (!isOverview) {
    return null;
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      aria-label={UI_LABEL_OPEN_FILTER}
      className={cn(
        SEPARATED_CONTROL,
        "h-9 gap-1.5",
        hasFilters && JOURNAL_FILTER_TRIGGER_ACTIVE,
      )}
      onClick={openDrawer}
    >
      <FunnelIcon aria-hidden className="size-4" />
      Filter
    </Button>
  );
}
