import { GLASS_SURFACE } from "@/config/glass";
import { SEPARATED_SHELL } from "@/config/shape";
import { SHELL_PADDING } from "@/config/spacing";
import { cn } from "@/lib/utils";

interface PlannerShellProps {
  children: React.ReactNode;
  className?: string;
}

export function PlannerShell({ children, className }: PlannerShellProps) {
  return (
    <div
      className={cn(
        SEPARATED_SHELL,
        GLASS_SURFACE,
        "flex h-full min-h-0 flex-col overflow-hidden",
        className,
      )}
    >
      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain",
          SHELL_PADDING,
        )}
      >
        {children}
      </div>
    </div>
  );
}
