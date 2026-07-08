import { Suspense } from "react";

import { PlannerRedirectContent } from "@/components/planner/planner-redirect-content";

interface PlannerRedirectProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default function PlannerRedirect({
  searchParams,
}: PlannerRedirectProps) {
  return (
    <Suspense fallback={null}>
      <PlannerRedirectContent searchParams={searchParams} />
    </Suspense>
  );
}
