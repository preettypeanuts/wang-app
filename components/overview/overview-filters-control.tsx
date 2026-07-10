"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { JournalFiltersDrawer } from "@/components/journal/journal-filters-drawer";
import { Button } from "@/components/ui/button";
import { MOBILE_TOP_BAR_ORB_BUTTON } from "@/config/mobile-chrome";
import { JOURNAL_FILTER_TRIGGER_ACTIVE } from "@/config/journal-mobile";
import { OVERVIEW_DESKTOP_FILTER_TRIGGER } from "@/config/overview-mobile";
import { SEPARATED_CONTROL } from "@/config/shape";
import { FunnelIcon } from "@/lib/icons";
import { isJournalDateRangeActive } from "@/lib/journal/journal-date-range";
import { cn } from "@/lib/utils";
import { buildJournalSearchParams } from "@/lib/validations/journal";
import type { JournalFilters } from "@/types/journal";

type OverviewFiltersPlacement = "mobile-top-bar" | "desktop";

interface OverviewFiltersControlProps {
  filters: JournalFilters;
  placement: OverviewFiltersPlacement;
}

function hasActiveOverviewFilters(filters: JournalFilters): boolean {
  return (
    filters.type !== "all" ||
    filters.category !== "all" ||
    isJournalDateRangeActive(filters)
  );
}

export function OverviewFiltersControl({
  filters,
  placement,
}: OverviewFiltersControlProps) {
  const router = useRouter();
  const pathname = usePathname();
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

  const trigger =
    placement === "mobile-top-bar" ? (
      <button
        type="button"
        aria-label="Buka filter"
        aria-expanded={filtersOpen}
        className={cn(
          MOBILE_TOP_BAR_ORB_BUTTON,
          hasFilters && JOURNAL_FILTER_TRIGGER_ACTIVE,
        )}
        onClick={() => setFiltersOpen(true)}
      >
        <FunnelIcon aria-hidden className="size-[1.35rem]" />
      </button>
    ) : (
      <div className={OVERVIEW_DESKTOP_FILTER_TRIGGER}>
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-label="Buka filter"
          aria-expanded={filtersOpen}
          className={cn(
            SEPARATED_CONTROL,
            "h-9 gap-1.5",
            hasFilters && JOURNAL_FILTER_TRIGGER_ACTIVE,
          )}
          onClick={() => setFiltersOpen(true)}
        >
          <FunnelIcon aria-hidden className="size-4" />
          Filter
        </Button>
      </div>
    );

  return (
    <>
      {trigger}
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
    </>
  );
}
