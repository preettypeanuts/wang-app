"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

interface MobileTopBlurContextValue {
  showBlur: boolean;
  setShowBlur: (visible: boolean) => void;
}

const MobileTopBlurContext = createContext<MobileTopBlurContextValue | null>(
  null,
);

export function MobileTopBlurProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showBlur, setShowBlur] = useState(false);

  const value = useMemo(
    () => ({
      showBlur,
      setShowBlur,
    }),
    [showBlur],
  );

  return (
    <MobileTopBlurContext.Provider value={value}>
      {children}
    </MobileTopBlurContext.Provider>
  );
}

function useMobileTopBlurContext(): MobileTopBlurContextValue {
  const context = useContext(MobileTopBlurContext);
  if (!context) {
    throw new Error(
      "useSyncMobileTopBlur must be used within MobileTopBlurProvider",
    );
  }

  return context;
}

export function useSyncMobileTopBlur(
  visible: boolean,
  enabled = true,
): void {
  const { setShowBlur } = useMobileTopBlurContext();

  useEffect(() => {
    if (!enabled) {
      setShowBlur(false);
      return;
    }

    setShowBlur(visible);
    return () => setShowBlur(false);
  }, [enabled, setShowBlur, visible]);
}

export function useMobileTopBlurVisible(): boolean {
  const context = useContext(MobileTopBlurContext);
  return context?.showBlur ?? false;
}
