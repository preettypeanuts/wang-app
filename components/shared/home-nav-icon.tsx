"use client";

import { forwardRef } from "react";

import type { IconProps } from "@/lib/icons";
import { SF_ICON_SIZE } from "@/config/icons";
import { cn } from "@/lib/utils";

const HOME_NAV_PATH =
  "M224,120v96a8,8,0,0,1-8,8H160a8,8,0,0,1-8-8V164a4,4,0,0,0-4-4H108a4,4,0,0,0-4,4v52a8,8,0,0,1-8,8H40a8,8,0,0,1-8-8V120a16,16,0,0,1,4.69-11.31l80-80a16,16,0,0,1,22.62,0l80,80A16,16,0,0,1,224,120Z";

export const HomeNavIcon = forwardRef<SVGSVGElement, IconProps>(
  function HomeNavIcon({ className, size }, ref) {
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 256 256"
        width={size ?? SF_ICON_SIZE}
        height={size ?? SF_ICON_SIZE}
        fill="currentColor"
        className={cn("shrink-0", className)}
        aria-hidden
      >
        <path d={HOME_NAV_PATH} />
      </svg>
    );
  },
);

HomeNavIcon.displayName = "HomeNavIcon";
