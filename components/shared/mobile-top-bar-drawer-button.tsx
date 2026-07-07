"use client";

import { MobileNavDrawer } from "@/components/shared/mobile-nav-drawer";
import { MOBILE_TOP_BAR_ORB_BUTTON } from "@/config/mobile-chrome";
import { DotsThreeIcon } from "@/lib/icons";

export function MobileTopBarDrawerButton() {
  return (
    <MobileNavDrawer
      trigger={
        <button
          aria-label="Buka menu"
          className={MOBILE_TOP_BAR_ORB_BUTTON}
          type="button"
        >
          <DotsThreeIcon aria-hidden className="size-[1.35rem]" />
        </button>
      }
    />
  );
}
