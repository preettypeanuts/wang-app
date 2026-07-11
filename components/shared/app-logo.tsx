"use client";

import Image from "next/image";

import { useAppearance } from "@/components/shared/appearance-provider";
import {
  PWA_LOGO_SOURCE_DARK,
  PWA_LOGO_SOURCE_LIGHT,
} from "@/config/pwa";
import { cn } from "@/lib/utils";

interface AppLogoProps {
  className?: string;
  size?: number;
  alt?: string;
}

/** In-app logo — follows appearance theme (light / dark / system). */
export function AppLogo({
  className,
  size = 32,
  alt = "Wang",
}: AppLogoProps) {
  const { resolvedDark } = useAppearance();

  return (
    <Image
      src={resolvedDark ? PWA_LOGO_SOURCE_DARK : PWA_LOGO_SOURCE_LIGHT}
      alt={alt}
      width={size}
      height={size}
      className={cn("shrink-0 object-contain", className)}
      priority
    />
  );
}
