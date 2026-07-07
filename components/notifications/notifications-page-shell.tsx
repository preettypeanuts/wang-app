import { GLASS_SURFACE } from "@/config/glass";
import { MOBILE_NATIVE_SHELL } from "@/config/mobile-chrome";
import { SEPARATED_SHELL } from "@/config/shape";
import { SHELL_PADDING } from "@/config/spacing";
import { cn } from "@/lib/utils";

interface NotificationsPageShellProps {
  children: React.ReactNode;
  className?: string;
}

/** Wallpaper bleeds on mobile; glass shell on desktop. */
export function NotificationsPageShell({
  children,
  className,
}: NotificationsPageShellProps) {
  return (
    <div
      className={cn(
        MOBILE_NATIVE_SHELL,
        "flex h-full min-h-0 flex-col overflow-hidden",
        "max-md:contents",
        className,
      )}
    >
      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col overflow-hidden",
          "max-md:contents max-md:p-0",
        )}
      >
        {children}
      </div>
    </div>
  );
}
