"use client";

import { useMobileTopBlurVisible } from "@/components/shared/mobile-top-blur-provider";
import { MobileTopBlurScrim } from "@/components/shared/mobile-top-blur-scrim";

export function MobileTopBlurLayer() {
  const showBlur = useMobileTopBlurVisible();

  return <MobileTopBlurScrim visible={showBlur} />;
}
