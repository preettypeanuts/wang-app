import Image from "next/image";

import {
  PWA_LOGO_SOURCE_DARK,
  PWA_LOGO_SOURCE_LIGHT,
} from "@/config/pwa";
import {
  SIDEBAR_APP_LOGO_BG,
  SIDEBAR_APP_LOGO_SHELL,
} from "@/config/sidebar";
import { cn } from "@/lib/utils";

interface SidebarAppLogoProps {
  size?: number;
  className?: string;
  alt?: string;
}

const LOGO_IMAGE_CLASS =
  "size-full rounded-[inherit] object-contain";

export function SidebarAppLogo({
  size = 32,
  className,
  alt = "Wang",
}: SidebarAppLogoProps) {
  return (
    <div
      className={cn(SIDEBAR_APP_LOGO_SHELL, SIDEBAR_APP_LOGO_BG, className)}
    >
      <Image
        src={PWA_LOGO_SOURCE_LIGHT}
        alt={alt}
        width={size}
        height={size}
        className={cn(LOGO_IMAGE_CLASS, "dark:hidden")}
        priority
      />
      <Image
        src={PWA_LOGO_SOURCE_DARK}
        alt={alt}
        width={size}
        height={size}
        className={cn(LOGO_IMAGE_CLASS, "hidden dark:block")}
        priority
      />
    </div>
  );
}
