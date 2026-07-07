"use client";

import {
  createContext,
  useContext,
  useEffect,
  type ReactNode,
} from "react";

const InboxMobileChromeContext = createContext<
  ((visible: boolean) => void) | null
>(null);

export function InboxMobileChromeProvider({
  children,
  onTopBlurChange,
}: {
  children: ReactNode;
  onTopBlurChange: (visible: boolean) => void;
}) {
  return (
    <InboxMobileChromeContext.Provider value={onTopBlurChange}>
      {children}
    </InboxMobileChromeContext.Provider>
  );
}

export function useInboxTopBlurSync(showBlur: boolean, enabled: boolean) {
  const onTopBlurChange = useContext(InboxMobileChromeContext);

  useEffect(() => {
    if (!enabled || !onTopBlurChange) {
      return;
    }

    onTopBlurChange(showBlur);
    return () => onTopBlurChange(false);
  }, [enabled, onTopBlurChange, showBlur]);
}
