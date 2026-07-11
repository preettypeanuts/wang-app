import { AppLogo } from "@/components/shared/app-logo";
import { SIDEBAR_APP_LOGO_SHELL } from "@/config/sidebar";
import { cn } from "@/lib/utils";

interface SidebarAppLogoProps {
  size?: number;
  className?: string;
  alt?: string;
}

export function SidebarAppLogo({
  size = 32,
  className,
  alt = "Wang",
}: SidebarAppLogoProps) {
  return (
    <span className={cn(SIDEBAR_APP_LOGO_SHELL, className)}>
      <AppLogo
        alt={alt}
        size={size}
        className="size-full rounded-[inherit] object-contain"
      />
    </span>
  );
}
