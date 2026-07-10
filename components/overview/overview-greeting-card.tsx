import {
  OVERVIEW_CARD,
  OVERVIEW_CARD_PADDING,
  OVERVIEW_SECTION_LABEL,
} from "@/config/overview";
import { cn } from "@/lib/utils";
import type { OverviewGreeting } from "@/types/overview";

interface OverviewGreetingCardProps {
  greeting: OverviewGreeting;
  action?: React.ReactNode;
  className?: string;
}

export function OverviewGreetingCard({
  greeting,
  action,
  className,
}: OverviewGreetingCardProps) {
  return (
    <section className={cn(OVERVIEW_CARD, OVERVIEW_CARD_PADDING, className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className={OVERVIEW_SECTION_LABEL}>Overview</p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
            {greeting.title}
          </h1>
          <p className="mt-1 text-sm capitalize text-muted-foreground">
            {greeting.subtitle}
          </p>
        </div>
        {action ? (
          <div className="hidden shrink-0 md:block">{action}</div>
        ) : null}
      </div>
    </section>
  );
}
