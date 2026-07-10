"use client";

import { useSearchParams } from "next/navigation";

import { OverviewFiltersControl } from "@/components/overview/overview-filters-control";
import { parseJournalSearchParams } from "@/lib/validations/journal";

export function OverviewMobileTopBarFilterButton() {
  const searchParams = useSearchParams();
  const filters = parseJournalSearchParams(
    Object.fromEntries(searchParams.entries()),
  );

  return (
    <OverviewFiltersControl filters={filters} placement="mobile-top-bar" />
  );
}
