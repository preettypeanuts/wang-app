import { GLASS_SURFACE } from "@/config/glass";
import { SEPARATED_SHELL } from "@/config/shape";
import { SHELL_PADDING } from "@/config/spacing";
import { cn } from "@/lib/utils";

interface JournalShellProps {
  children: React.ReactNode;
  className?: string;
}

export function JournalShell({ children, className }: JournalShellProps) {
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
          "flex min-h-0 flex-1 flex-col overflow-hidden",
          SHELL_PADDING,
        )}
      >
        {children}
      </div>
    </div>
  );
}
